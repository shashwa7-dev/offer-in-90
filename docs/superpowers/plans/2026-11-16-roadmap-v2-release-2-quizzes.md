# Roadmap v2 · Release 2 (Quizzes) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Prerequisite:** Release 1 is merged (`2026-11-16-roadmap-v2-release-1.md`). This plan uses R1's `State` v6, the content IDs, `buildTracks`, `layoutDays`, `labels.ts`, `patterns.ts` and `content/dsa.js`.

**Goal:** Revision quizzes.
- **Daily quiz:** one optional task a day, 5 items.
- **Weekly test:** graded, about 30 items, per-section scores with history.
- **Items** are `mcq`, `recall` and `pattern-id`. Missed items come back, and any item can be flagged "wrong / outdated".
- **First question batch:** everything the plan reaches in its first 3 weeks.

**Architecture:**
- **Questions** live as checked JSON in `src/lib/content/questions/<section>.json`. They're produced by import scripts from the spec's sources, then curated.
- **A pure `src/lib/quiz.ts`** selects, scores and schedules items.
- **`pattern-id` items** are generated at runtime from `content/dsa.js`.
- **The UI** is a plain quiz sheet opened from the daily-review task and the Sunday self-check task.

**Tech Stack:** As R1. Importers are Node scripts. Anki `.apkg` files are zips holding a SQLite `collection.anki2`: unzip with the `unzip` CLI, and read with `node:sqlite` (available in Node 22.5+; local Node is 24).

**Spec:** `docs/superpowers/specs/2026-11-15-roadmap-v2-content-design.md` §10 (quizzes), §12 (labels on quiz items), §17 (Sunday core).

## Global Constraints

- **Item types and scoring (§10):**
  - `mcq` and `pattern-id`: right = 1, wrong = 0.
  - `recall`: Nailed = 1, Partial = 0.5, Missed = 0.
- **Daily quiz:** **5 items in total**, as **one** optional task in the daily review. It never counts towards hours or "behind" (§10).
- **Weekly test:** about **30** items, spread across sections in proportion to the week's study minutes. Depth topics (§13) are weighted ×2 when selecting. It runs in the Sunday core, 40 min.
- **Items come back** after 1, 3 and 7 days when missed or partial. An item retires after **2 Nailed answers in a row** (§10).
- **Bank size:** a cap of **about 500 items** in total. Important topics get up to 10, minor ones 3 (§10).
- **Every item** has `source` (https), and `checked` (YYYY-MM-DD) from an AI-assisted check against the primary doc. Outdated items are dropped.
  - **Excluded sources:** Devinterview-io and aershov24.
  - **Answers for sources that have none** are short excerpts from the primary doc, with its link.
- **Personal use:** copy questions freely, and keep the source link.
- **Weekly tests** draw only from sections that have shipped.
- **Tests are silent**, and imports follow R1's Global Constraints.

## Review Focus

1. **A day whose topics have no questions yet.** The daily quiz falls back to due items, then to any shipped item from earlier topics. It never shows an empty quiz, and it hides the task if there are 0 items. → `quiz.ts` test.
2. **A flagged item that was also due.** It's excluded from both the daily quiz and the weekly test until the flag is cleared. → `quiz.ts` test.
3. **The same item answered on two devices.** `quiz` logs merge per item (newest wins), and a streak never doubles. → sync test.
4. **A week with tiny study time in one section.** That section still gets at least 1 item if it has any. Rounding never exceeds 30 in total. → `quiz.ts` test.
5. **Recall answer text containing markdown or code.** It renders as markdown (`react-markdown` is already a dependency), never as raw HTML. → manual check in Task 5.

---

### Task 1: State and quiz types

**Files:**
- Modify: `src/lib/state-types.ts`, `src/lib/store.tsx`, `src/lib/sync-merge.ts`.
- Test: `scripts/test-sync-merge.ts` (append).

**Interfaces:**
- **New types:**
  - `QuizItem = { id: string /*'q:<section>:<slug>'*/; type: 'mcq' | 'recall' | 'pattern-id'; section: 'dsa' | 'fe' | 'sd' | 'mc' | 'ai' | 'beh' | 'fde' | 'ux' | 'sql'; topics: string[] /*content ids or pattern ids*/; prompt: string; options?: string[]; answer: number | string; explanation?: string; source: string; checked: string; weight?: 1 | 2 }`;
  - `QuizLog = { due: string /*ISO date*/; streak: number; step: 0 | 1 | 2 | 3; last: 'right' | 'wrong' | 'nailed' | 'partial' | 'missed'; at: number }`.
- **`State` gains:**
  - `quiz: Record<string, QuizLog>`;
  - `quizFlags: Record<string, number>`.

  Both are added to `MAPS`. Week scores keep using R1's `scores` with keys `w<n>/<section>` and `w<n>/total`.
- [ ] **Step 1:** Failing tests. Merge keeps the newer `quiz` entry per item. A cleared flag (tombstone) wins over an older flag.
- [ ] **Step 2: Implement, then run** `npm test`. Expected: PASS.
- [ ] **Step 3: Commit** `feat(quiz): state for quiz logs and flags`.

### Task 2: Quiz engine (pure)

**Files:**
- Create: `src/lib/quiz.ts`.
- Test: `scripts/test-quiz.ts`.

**Interfaces:**
- `patternIdItems(problems, patterns): QuizItem[]`.
  - One item per problem with `role !== 'unseen'`, ID `q:dsa:pid-<slug>`.
  - The prompt is the problem name plus "Open the statement" (the URL), and asks "Which pattern?".
  - The options are the correct pattern plus 3 others from the same topic group when possible, in a deterministic order (seeded by slug).
  - `source` is the problem URL, and `checked` is the R2 build date.
- `dailyQuiz(input: { bank: QuizItem[]; dayTopics: string[]; logs; flags; today: string; seed: string }): QuizItem[]`.
  - Up to 5 items: due items first, then items for the day's topics, then earlier shipped topics.
  - Never flagged items, and never items retired by 2 Nailed answers in a row.
- `weeklyTest(input: { bank; weekTopics: Record<section, string[]>; sectionMinutes: Record<section, number>; logs; flags; seed }): QuizItem[]`.
  - Up to 30 items, proportional to minutes, at least 1 per section that has items, with depth items weighted ×2.
- `grade(item, response: number | 'nailed' | 'partial' | 'missed'): number`, returning 1, 0.5 or 0.
- `nextLog(prev: QuizLog | undefined, result, today): QuizLog`.
  - A miss or partial sets `step` 1 and `due` +1 day, then +3 and +7 on further misses.
  - A right or nailed answer increments `streak`. At streak 2 the item is retired (`due: '9999-12-31'`).
- `sectionScores(items, responses): Record<section | 'total', number /*0–100*/>`.
- [ ] **Step 1: Failing tests** (Review Focus 1, 2 and 4, plus):
  - `patternIdItems` gives exactly 4 options with the correct pattern included, and the order is stable for the same slug;
  - `nextLog` steps: miss → due +1, miss again → +3, then +7; two nailed in a row → retired;
  - `weeklyTest` with minutes `{ dsa: 600, fe: 600, sd: 10 }` gives 30 items with `sd ≥ 1`;
  - `sectionScores` averages recall partial as 0.5.
- [ ] **Step 2: Run.** Expected: FAIL. **Step 3: Implement.** **Step 4: Run** `npm test`. Expected: PASS.
- [ ] **Step 5: Commit** `feat(quiz): selection, grading and spaced return`.

### Task 3: Import pipeline and validator

**Files:**
- Create: `scripts/import/lydiahallie.mjs`, `scripts/import/fe-handbook.mjs`, `scripts/import/anki.mjs`, `scripts/import/list-prompts.mjs`. Each writes candidates to `.engine/questions/<source>.json`.
- Create: `scripts/validate-questions.mjs` (exports `checkBank(bank, contentIds)`).
- Create: `scripts/quiz-coverage.mjs`. It prints each content topic's first Grind and Steady day and its item count, and flags topics reached in the first 21 days that have 0 items.
- Test: `scripts/test-questions.ts` (it imports `checkBank` from the `.mjs`).

**Interfaces:**
- **Importers:**
  - **`lydiahallie.mjs`:** parses `README.md` (raw URL in the spec's sources) into `mcq` items, with options A–D, the answer index and the explanation markdown.
  - **`fe-handbook.mjs`:** parses the JS and CSS quiz pages into `recall` items.
  - **`anki.mjs <file.apkg> <section>`:** unzips into a temp dir, reads `notes.flds` (fields split by `\x1f`), and strips HTML into `recall` items.
  - **`list-prompts.mjs`:** for question-only lists (h5bp, YauhenKavalchuk TS, tshemsedinov Node, amitshekhariitbhu AI), emits `recall` prompts with an empty `answer`, for the curation step to fill.
- **`checkBank(bank, contentIds)` returns `string[]` errors:**
  - duplicate IDs;
  - a missing or non-https `source`;
  - a `checked` date that isn't a valid date;
  - an `mcq` whose answer index is out of range;
  - a `recall` with an empty answer;
  - a topic that's neither a content ID nor a pattern ID;
  - a total over 520.
- `validate-questions.mjs` runs `checkBank` over `src/lib/content/questions/*.json` and exits 1 on errors. Add it to `npm test` (via `run-tests.mjs`) and to `deploy.yml` before the build.
- [ ] **Step 1: Failing tests** for `checkBank`, one per error type, plus a valid bank passing.
- [ ] **Step 2: Implement** the importers and the validator. Downloaded files go in `.engine/sources/` (git-ignored), never executed.
- [ ] **Step 3: Run** `npm test`. Expected: PASS. Commit `chore(quiz): import pipeline, validator, coverage report`.

### Task 4: First question batch (curated)

**Files:**
- Create: `src/lib/content/questions/{fe,sd,dsa,ai,beh,mc}.json`. Only the sections reached in the first 21 Grind days / 28 Steady days, per `quiz-coverage.mjs`.

**Curation procedure (for each candidate):**
1. **Keep it** only if it's current. Drop class-component React, IE-era, JSONP, `document.write` and deprecated APIs.
2. **Check it** against the primary doc (MDN, react.dev, the TypeScript handbook, nodejs.org, provider docs) with WebFetch. Fix the answer to match the doc, and set `checked` to today.
3. **Tag `topics`** with the R1 content IDs it tests (e.g. `fe:event-loop`), and `weight: 2` for depth topics.
4. **Respect the per-topic cap:** important topics up to 10, minor ones 3.

**What the batch must include:**
- the lydiahallie items for event loop, closures, `this`, prototypes and promises;
- system-design-primer cards for the week 1–3 SD topics;
- Big-O facts;
- behavioral STAR prompts for the LPs covered in weeks 1–3, graded with the STAR checklist as their `answer` text (§10).

- [ ] **Step 1:** Run the importers, then curate into the JSON files.
- [ ] **Step 2: Run** `node scripts/validate-questions.mjs` and `node scripts/quiz-coverage.mjs`. Expected: 0 errors, and no topic in the first 21 Grind days has 0 items.
- [ ] **Step 3: Commit** `content(quiz): first batch, checked YYYY-MM-DD`.

### Task 5: Quiz UI, daily task, weekly test, flags

**Files:**
- Create: `src/components/quiz-sheet.tsx`. A sheet that shows one item at a time:
  - **mcq / pattern-id:** pick an option, then see right/wrong plus the explanation and the source link;
  - **recall:** the prompt, "Show answer", then Nailed / Partial / Missed;
  - **on every item:** a "Wrong / outdated" button (writes `quizFlags`) and a label picker (R1 `label-picker.tsx`).
- Modify: `src/lib/engine.ts`. Add task `d:<date>:quiz` ("Optional: quick quiz", cat `health` so it's never "behind") to the daily review when `dailyQuiz(...)` returns ≥ 1 item. The Sunday `d:<date>:check` task becomes "Weekly test (40 min)".
- Modify: `task-peek.tsx` / `today-view.tsx`. Opening those tasks opens `quiz-sheet`. Finishing the weekly test writes `scores['w<n>/<section>']` and `scores['w<n>/total']`, then ticks the task.
- Modify: `progress-view.tsx`. The Scores table now reads quiz scores. Hand-entered R1 scores stay as they are.
- Modify: `setup-view.tsx`. A "Flagged questions" list with Clear.
- [ ] **Step 1: Implement.**
- [ ] **Step 2: Manual check:**
  - finish a daily quiz with 1 miss, and it reappears tomorrow;
  - flag an item, and it doesn't appear again;
  - finish a weekly test, and the scores appear in Progress next to the baseline;
  - a recall answer with a code block renders as markdown.
- [ ] **Step 3: Run** `npm test && npm run build`, then `npm run dev` with `node scripts/smoke.mjs .superpowers/shots-r2`. Add a smoke step that opens and closes the quiz sheet. Expected: PASS, no console errors, silent.
- [ ] **Step 4: Commit** `feat(quiz): daily quiz, weekly test, flags`. Then push and open the PR "Roadmap v2 · Release 2", ending with the attribution line. Ask the owner before merging.

---

## R4+ (rest of the bank)

- **Each later batch:**
  1. Run `node scripts/quiz-coverage.mjs`.
  2. Take the topics whose first day is within the next 14 days and have 0 items.
  3. Run Task 4's curation procedure for them.
  4. Validate, then commit `content(quiz): batch N`.
- **Stop at the bank cap of about 500.**
