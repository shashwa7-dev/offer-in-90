# Roadmap v2 · Release 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship Release 1 of roadmap v2, so the owner can start the plan on it. That means:
- the full v2 curriculum with content-based IDs;
- Steady and Grind modes;
- the new weekday and Sunday layout;
- DSA by pattern (tiers, flags, unseen logging, own problems);
- custom labels;
- plain working screens for each.

**Architecture:**
- **Curriculum data:** moves from one big `plan-data.js` into focused content files under `src/lib/content/`. Every item gets an explicit `id`.
- **Pure modules, unit-tested with `node --experimental-strip-types`:**
  - `tracks.ts` turns content into ordered **track sequences**, one per block. In Grind they're 78 slots each, and the Grind weekday rules are baked into the order.
  - `layout.ts` maps those sequences onto calendar days per mode (Grind: one slot per study day; Steady: a rotation).
  - `labels.ts`, `patterns.ts` and `modes.ts` hold the other rules.
- **Glue:** `engine.ts` becomes thin glue that turns the layout into `Day[]`. Components get plain screens.

**Tech Stack:** Next.js 15 static export, React 19, TypeScript, Tailwind 4, shadcn/ui. Tests: plain `node:assert` scripts in `scripts/test-*.ts`, run by `npm test`. Smoke: Playwright, `scripts/smoke.mjs`.

**Spec:** `docs/superpowers/specs/2026-11-15-roadmap-v2-content-design.md`. Read it first. Section numbers (§N) below refer to it.

## Global Constraints

- **Week numbers** in the spec are Grind weeks. The Steady mapping is round(w × 17/13) (§14).
- **Grind:** 13 weeks, 78 study days, 13 Sundays. **Steady (the default):** 17 weeks, 102 study days, 17 Sundays. Each track has exactly **78 slots** in both modes (§14).
- **The prep day** is day 0, the Sunday before `start`. `start` is always a Monday (§10, §20).
- **IDs** are content-based and never position-based (Constraints). Problems keep `p-<slug>`.
- **No noise** (§19, anti-goals):
  - one link per task;
  - optional pools and stretch lists never appear in the daily plan;
  - the daily quiz is a Release 2 task, not in R1.
- **Grind weekday rules apply only in Grind.** Steady keeps each track's sequence order (§14).
- **Nothing is cut or shortened.** An hour-long item in the 30-minute AI-build slot takes 2 consecutive slots (§8).
- **Labels:** groups are single- or multi-choice; system labels are read-only; deleting a label removes it from every item (§12).
- **Tests and smoke runs are silent:** the smoke test launches Chromium with `--mute-audio`, and no test may play sound.
- **Personal use:** content may be copied from public sources; each item keeps its source URL.
- **Tests import `.ts` files by explicit path** (e.g. `../src/lib/labels.ts`). Pure modules must have **no extensionless runtime imports** (see the comment in `task-filter.ts`). Shared types are written as local `string` aliases, or as `import type` (erased at runtime).
- **Content files are ESM `.js`** (like today's `plan-data.js`). Node 22.7+ detects ESM syntax, so tests can import them directly. Local Node is 24, and CI uses 22.
- **Commits and the PR** end with the attribution line from the session's system reminder.
- **No rebrand in R1.** The owner dropped it for now (2026-11-15). Don't rename the app or logos.

## Review Focus

1. **Changing `start` after ticking tasks.** Content ticks (`fe:closures`, `p-two-sum`) must stay ticked, since IDs aren't positions. → test in Task 6.
2. **Switching mode more than once, including twice on the same day.** The latest entry wins, and no track item appears twice or goes missing. → test in Task 6.
3. **A device on the old v5 state syncing with an R1 device.** Missing new maps default to empty, and merge keeps the new maps from both sides. → test in Task 1.
4. **An owner label that duplicates a system label name, or deleting a label inside a single-choice group.** Duplicates are rejected, and deletion removes the label everywhere and leaves the group intact. → test in Task 2.
5. **An own problem whose URL is already a plan problem.** It's stored once, by slug, and counts towards green once. → test in Task 3.

---

### Task 1: State v6, new synced maps, normalize

**Files:**
- Modify: `src/lib/store.tsx` (`State`, `fresh`, `normalize`, version `v: 6`).
- Modify: `src/lib/sync-merge.ts` (`MAPS`, `SCALARS`).
- Test: `scripts/test-sync-merge.ts` (append).

**Interfaces:**
- Produces, in `State`:
  - `modes: Record<string /*ISO date*/, ModeEntry>`;
  - `labels: Record<string, OwnerLabel>` (owner labels and groups);
  - `itemLabels: Record<string /*item id*/, string[] /*label ids*/>`;
  - `own: Record<string /*slug*/, OwnProblem>`;
  - `solves: Record<string /*'p-<slug>' for a solve, 'rs:<slug>' for a blank-file re-solve*/, SolveLog>`. Own problems use the same `p-<slug>` IDs; they can't clash, because plan slugs are rejected.
  - `sundayMode: Record<string /*ISO date*/, 'rest' | 'revision'>`;
  - `scores: Record<string /*e.g. 'baseline/dsa', 'w3/fe'*/, number /*0–100*/>`.
- The types live in `src/lib/state-types.ts` (pure, no imports):
  - `ModeEntry = { mode: 'steady' | 'grind'; cursors: Record<TrackId, number> }`;
  - `OwnerLabel = { id: string; name: string; color: string; group?: string; kind: 'label' | 'group'; single?: boolean }`;
  - `OwnProblem = { slug: string; url: string; name: string; diff: 'E' | 'M' | 'H'; pattern: string /*PatternId*/; at: number }`;
  - `SolveLog = { unseen: boolean; minutes?: number; at: number }`;
  - `TrackId = 'dsa' | 'aib' | 'fe' | 'mc' | 'sd' | 'jt' | 'beh' | 'ai'`.
- `MAPS` gains `'modes', 'labels', 'itemLabels', 'own', 'solves', 'sundayMode', 'scores'`.

- [ ] **Step 1: Write the failing tests** in `scripts/test-sync-merge.ts`:
  - `merge(v5doc, r1doc)` keeps r1's `labels`, `itemLabels` and `modes`, and fills empty objects for the v5 side.
  - `stamp` records `meta['labels/<id>']` when a label is renamed.
  - A deleted label (tombstone) wins over an older remote copy.
- [ ] **Step 2: Run** `npm test`. Expected: FAIL. The new maps aren't merged.
- [ ] **Step 3: Implement.**
  - Add the types to `state-types.ts`, and the new maps to `MAPS`.
  - In `fresh()` and `normalize()`, default each new map to `{}`. `normalize` keeps old v5 fields and sets `v: 6`.
  - Keep `kickoff` in `SCALARS`: it's still the prep-day toggle.
- [ ] **Step 4: Run** `npm test`. Expected: all PASS.
- [ ] **Step 5: Commit** `feat(state): v6 maps for modes, labels, own problems, solves, sundays, scores`.

### Task 2: Labels core (pure)

**Files:**
- Create: `src/lib/labels.ts`.
- Test: `scripts/test-labels.ts`.

**Interfaces:**
- Consumes: `OwnerLabel` (Task 1). `TaskMeta = { id: string; own?: string; pattern?: string; tier?: 'must' | 'optional'; flags?: ('hot' | 'hard-hot')[]; depth?: boolean; flagged?: boolean }`.
- Produces:
  - `SYSTEM_GROUPS`: `pattern` (single), `tier` (single), `frequency` (multi), `source` (single), `status-flag` (multi), `depth` (multi).
  - `systemLabelsFor(t: TaskMeta): string[]`. Returns IDs like `sys:pattern:sliding-window`, `sys:tier:must`, `sys:freq:hot`, `sys:freq:hard-hot`, `sys:source:yours` / `sys:source:plan`, `sys:flagged`, `sys:depth`.
  - `createLabel(labels, input: { name: string; color: string; group?: string }): { labels: Record<string, OwnerLabel>; id: string } | { error: 'duplicate' | 'empty' }`. Names are compared case-insensitively against owner and system labels.
  - `createGroup(labels, { name, single: boolean })`.
  - `renameLabel`, `recolorLabel`.
  - `deleteLabel(state: { labels; itemLabels }, id): { labels; itemLabels }`. Deleting a group deletes its labels.
  - `applyLabel(state, itemId, labelId)`. In a single-choice group it replaces the item's other label from that group.
  - `removeLabel(state, itemId, labelId)`.
  - `labelsOf(itemLabels, t: TaskMeta): string[]`: owner labels plus system labels.

- [ ] **Step 1: Write the failing tests** in `scripts/test-labels.ts`:
  - Create "Weak", then create "weak". Expect `{ error: 'duplicate' }`.
  - Create "Pattern". Expect duplicate (it clashes with a system group name).
  - Create single-choice group "Company" with "Razorpay" and "Swiggy". Apply Razorpay, then Swiggy, to `p-two-sum`. `itemLabels['p-two-sum']` equals `[swiggyId]`.
  - In a multi-choice group, both labels are kept.
  - `deleteLabel(razorpay)` removes it from every item. The group remains.
  - `deleteLabel(group)` removes the group, its labels, and their uses.
  - `systemLabelsFor({ id: 'u-1', own: '1' })` includes `sys:source:yours`.
  - For `{ id: 'p-x', pattern: 'two-pointers', tier: 'must', flags: ['hot'] }` it includes `sys:pattern:two-pointers`, `sys:tier:must` and `sys:freq:hot`.
  - A system label ID passed to `applyLabel` is ignored and returns the state unchanged.
- [ ] **Step 2: Run** `node --experimental-strip-types scripts/test-labels.ts`. Expected: FAIL (module missing).
- [ ] **Step 3: Implement** `src/lib/labels.ts`. Pure, no imports. Owner IDs are `lb-<base36 time><rand>`.
- [ ] **Step 4: Run** `npm test`. Expected: PASS.
- [ ] **Step 5: Commit** `feat(labels): owner labels, groups, system labels`.

### Task 3: Patterns, problems dataset, green (pure + data)

**Files:**
- Create: `src/lib/content/dsa.js` (data).
- Create: `src/lib/patterns.ts` (logic).
- Test: `scripts/test-patterns.ts`.

**Interfaces:**
- **`dsa.js` exports:**
  - `PATTERNS`: 24 entries in teaching order (§2). Each is `{ id: PatternId, name, topic, signal, template, why, complexity, traps: string[], notWhen, link, sub?: string[] }`. DP has `sub: ['fibonacci', '0-1-knapsack', 'unbounded-knapsack', 'lcs-strings', 'palindromes', 'grid']`.
  - `PROBLEMS: { slug, name, d: 'E' | 'M' | 'H', pattern: PatternId, sub?, tier: 'must' | 'optional', role?: 'teach' | 'var' | 'unseen', flags: ('hot' | 'hard-hot')[], url, premium? }[]`.
  - `FLAG_SOURCE = { name: 'liquidslr/leetcode-company-wise-problems', asOf: '2025-10' }`.
  - `ADV_DSA` (moved from plan-data).
- **`patterns.ts` exports:**
  - `PatternId` (a union of the 24 IDs, kebab-case of the §2 names, e.g. `hash-map`, `prefix-sum`, `two-pointers`, `sliding-window`, `stack-monotonic`, `binary-search`, `cyclic-sort`, `fast-slow`, `ll-reversal`, `tree-bfs`, `tree-dfs`, `trie`, `top-k`, `two-heaps`, `k-way-merge`, `backtracking`, `graph-traversal`, `topo-sort`, `union-find`, `shortest-path-mst`, `intervals`, `greedy`, `dp`, `bits`).
  - `addOwnProblem(own, plan: { slug }[], input: { url; name; diff; pattern }): { own } | { error: 'not-leetcode' | 'in-plan' }`. The slug is parsed from `leetcode.com/problems/<slug>`. `in-plan` means the plan already has this slug; the UI then offers to label that plan problem instead.
  - `greenStatus(pattern, problems, own, solves, now: number): { unseenSolved: number; blankResolve: boolean; green: boolean; unseenCheckPassed: boolean }`.
    - An unseen solve counts if `solves['p-<slug>'].unseen` and `minutes ≤ limit` (E 15, M 25, H 40), or if `minutes` is missing (the owner self-declared it in time).
    - **Green** = unseenSolved ≥ 2 **and** a non-unseen re-solve log (`solves['rs:<slug>']`) at least 7 days after that problem's first solve.
    - `unseenCheckPassed` = the problem with `role: 'unseen'` for this pattern has a qualifying unseen solve.

- [ ] **Step 1: Write the failing tests** in `scripts/test-patterns.ts`. They import `../src/lib/content/dsa.js` and `../src/lib/patterns.ts`.
  - **Pattern list:**
    - `PATTERNS.length === 24`, with IDs in §2 order;
    - every pattern has a non-empty `signal`, `template`, `why` and `notWhen`;
    - every `link` is `https://`, or `null` only for `cyclic-sort`, `hash-map`, `bits` and `shortest-path-mst` (§2 table).
  - **Must-solve set:**
    - each pattern has 3–5 problems with `tier: 'must'`, including exactly one `role: 'teach'` and exactly one `role: 'unseen'`;
    - total must-solve is between 90 and 100;
    - it includes Trapping Rain Water, Minimum Window Substring, Merge k Sorted Lists, Find Median from Data Stream and Word Ladder;
    - it includes `subarray-sum-equals-k`, `minimum-remove-to-make-valid-parentheses`, `lowest-common-ancestor-of-a-binary-tree`, `basic-calculator-ii`, `next-permutation`, `find-peak-element` and `merge-sorted-array`.
  - **Coverage:** every NeetCode 150 slug from the old `DSA_TOPICS` is present (nothing deleted), and so are the §2 gap-fill and frequent-extra slugs.
  - **Flags:**
    - `hot` is on exactly the 19 problems listed in §2;
    - `hard-hot` is on exactly the 10 listed in §2;
    - slugs are unique.
  - **Own problems:** `addOwnProblem` with a plan slug returns `{ error: 'in-plan' }`, and with `https://example.com` returns `not-leetcode`.
  - **Green:**
    - 2 qualifying unseen solves plus a re-solve 8 days later → `green: true`;
    - the same with the re-solve at 3 days → `false`;
    - an M problem solved unseen in 30 min doesn't count.
- [ ] **Step 2: Run** the test. Expected: FAIL.
- [ ] **Step 3: Write `dsa.js`.**
  - **Card text:** derive it from the linked explainer (Hello Interview, cp-algorithms, USACO), short. The spec forbids long original write-ups.
  - **Must-solve picks (spec §2 rules):** per pattern, one teaching problem (canonical, E/M), two variations, and one unseen check. Prefer 🔥. Use NeetCode/LeetCode URLs (`NC()` for premium slugs, as in the old file).
- [ ] **Step 4: Implement `patterns.ts`.**
- [ ] **Step 5: Run** `npm test`. Expected: PASS.
- [ ] **Step 6: Commit** `feat(dsa): 24 patterns, tiered and flagged problem set, green rules`.

### Task 4: Curriculum content files with explicit IDs

Split into 4a–4d so each part can be reviewed alone. Each sub-task appends assertions to `scripts/test-content.ts`.

**Shared item shape:** `{ id: string, text: string, url?: string, mins?: 30 | 45 | 60 | 75 | 90 | 120, depth?: boolean, slots?: 1 | 2 }`.
- `slots: 2` only in the 30-min AI-build track, for items that take an hour (§8).
- IDs are `<prefix>:<kebab-slug>`, unique across all content.

**Files (all `src/lib/content/`):**
- `fe.js`, `ux.js`, `career.js`, `ai.js`, `mc.js`, `sd.js`, `judgment.js`, `sundays.js`, `reference.js`.
- `src/lib/plan-data.js` becomes a re-export: `export const PLAN = { ...all }`. Keep the `BOARD_MAP`, `COMPANY_MAP`, `RULES`, `HLD_FRAMEWORK`, `FDE_STAGES` and `OA_LINKS` names so `roadmap-reference.tsx` keeps working.

**4a. FE, UX, career (`fe.js`, `ux.js`, `career.js`)**
- [ ] **Failing tests:**
  - `FE.length === 49`, including `fe:nextjs-caching-rsc`;
  - the React items (`fe:react-*`) each have `summary` (≤ 400 chars);
  - `UX.length === 36` (35 plus `ux:level-calibration`, placed in week 3 per §8; the displaced item moves to the end);
  - `BEH` holds the 35 old items plus `beh:deep-dive-1..3` and `beh:negotiation-1..2`, with `beh:positioning` text containing "product engineer who ships AI features";
  - `FDE` has the 40 old items minus the 2 Python items (moved to `ai.js` as `aib:python-for-js`, `aib:pandas`, each `slots: 2`);
  - the 4 Stage-6 cloud items move to `ai.js` as `aib:aws`, `aib:terraform`, `aib:containers`, `aib:devops`, each `slots: 2`;
  - `COMPANY_MAP` gains Apple and Stripe rows (text from §8);
  - `FE` includes 2 `depth: true` items for *Use The Index, Luke* (the index chapters, §13 row 1) next to the SQL topic;
  - every item in the §13 depth areas (SQL, NoSQL, Redis, queues, API design, and others) has `depth: true`.
- [ ] **Implement, then run** `npm test`. Expected: PASS. Commit `content: fe, ux, career with ids`.

**4b. AI (`ai.js`)**
- [ ] **Failing tests:**
  - `AI_EVENING` keeps every paper and course item from `AI_UNITS` at their current days. Count = old count minus the build items moved to `AIB`.
  - `AIB` (the AI-build track) contains the 6 new hands-on items from §7 with exact titles: LLM API fundamentals (1), Retrieval that works (2), Agents in production (2), LLM gateway (1). It also holds every `Build ·` unit step moved from `AI_UNITS` (each `slots: 2`), the 2 Python items and the 4 cloud items.
  - The total slot sum of `AIB` is ≤ 78.
  - The depth readings from §13 table rows 1–3 (DDIA 4 chapters, applied-llms ×2, Eugene Yan ×1) are in `AI_EVENING` with `depth: true` and their verified URLs (§13 sources).
- [ ] **Implement, test, commit** `content: ai evening + ai build track`.

**4c. Machine coding, system design (`mc.js`, `sd.js`)**
- [ ] **Failing tests:**
  - `MC` has 34 builds, with the 8 pairs from §5 expressed as `pair: [idA, idB]` entries;
  - `MC_SCREENSHOT` has 3 items;
  - `TAKE_HOMES` has 2 briefs of 3 parts each;
  - `PROJECT` has 18 entries (the 2 merges from §5);
  - `LLD` has 13 items;
  - `SD` order (§6): `sd:internet` first, then the FE SD items, then the HLD concepts, then the 23 HLD problems in the §6 core-first order, then the 4 AI designs;
  - `sd:numbers-card` is present;
  - `PROJECT` includes a `depth: true` read of Ink & Switch "Local-first software" in the step before the real-time step (§13 row 2);
  - `SD_MOCKS` is unchanged (24).
- [ ] **Implement, test, commit** `content: machine coding, flagship, lld, system design`.

**4d. Judgment thread, Sundays, reference (`judgment.js`, `sundays.js`, `reference.js`)**
- [ ] **Failing tests:**
  - **Judgment lists:**
    - `HOW_IT_WORKS.length === 10`, each with a company engineering-blog `https://` URL (§4 list);
    - `MEMOS.length === 13` (the §4 prompts, verbatim);
    - `PRACTICAL.length === 12`, each with `lang: 'ts' | 'py'` alternating;
    - `DECOMP.length === 12`: 11 existing plus 1 from a published FDE guide, with its source URL;
    - `OSS_REPOS` = PostHog, Cal.com, Excalidraw;
    - `CODE_REVIEWS.length === 4`;
    - `JT_DEPTH_READS` = the Stripe idempotency post (a how-it-works Monday in week 2 or 3) and the SRE book ch. 12 (week 3, before the first OSS fix), both `depth: true` (§13);
    - `INTERVIEW_ENV` has the 4 Phase 3 tasks from §18 (CoderPad/HackerRank, Google Doc without autocomplete, Excalidraw while talking, camera and mic check).
  - **Sundays:**
    - `SUNDAY_READS` has the 15 from §17 with their URLs, plus 2 Steady extras (an AI paper and an industry problem, each verified with WebFetch; record the check date);
    - `SUNDAY_CORE` has the weekly test placeholder (R1: "Weekly self-check: …", hand-scored into `scores`), the reflection with a listen-back, and next-week preview tasks.
  - **Readiness and review:**
    - `READINESS` has 5 checks keyed by Grind week (4, 8, 10, 12, 13), with text exactly as §11;
    - `WEEK8_REVIEW` text is as §11.
  - **Reference:**
    - `EXPLORE_LATER` has the 8 areas from §16, and every URL is `https://`;
    - `FOCUS_RULES` gains the 3 rules from §19;
    - `EXTENSION` (Month 4) is removed.
  - **Hotstar row:** the Hotstar read URL is confirmed by WebFetch before commit. If the original post can't be confirmed, use a confirmed Hotstar engineering post and note it in the commit.
- [ ] **Implement, test, commit** `content: judgment thread, sundays, readiness, explore later`.

### Task 5: Track sequences (pure)

**Files:**
- Create: `src/lib/tracks.ts`.
- Test: `scripts/test-tracks.ts`.

**Interfaces:**
- Consumes: the Task 3 and Task 4 content (passed in as arguments, so the module stays pure).
- Produces:
  - `type Slot = { items: { id: string; text: string; url?: string; cat: string /*same values as engine Cat*/; pattern?; tier?; flags?; role?; depth?; hiddenUntilStart?: boolean; takesRevision?: boolean; part?: [number, number] }[] }`;
  - `buildTracks(content): Record<TrackId, Slot[]>`, where every track has exactly 78 slots;
  - `GRIND_DOW: number[]`, the weekday (1–6) of each Grind study slot index 0–77.

**Grind rules baked into the order (spec §1–§8):**
- **`dsa`:**
  - slots 0–4 are the foundations (Big-O, recursion, build-your-own DS);
  - then the 24 patterns in order;
  - the first slot of each pattern also carries the pattern-card task, and the pattern's last slot also carries an "Explain-back: fill the card from memory, then compare" task;
  - the unseen check has `hiddenUntilStart: true`;
  - patterns end by slot ≤ 53 (week 9);
  - then `ADV_DSA` (8 slots);
  - then Phase 3 timed sets (Meta speed / Google doc / OA simulation / AI-enabled drill, rotating), drawn from must-solve + 🔥. The 4 `INTERVIEW_ENV` tasks ride along, one per week, in weeks 10–13.
- **`aib`:** the AIB list in order, expanding `slots: 2` into 2 slots (`part: [1,2]`, `[2,2]`). The Python items are in slots 0–3. Empty slots at the end say "Revisit: re-run your week's AI build with one improvement".
- **`mc`:**
  - Mon/Wed/Fri: MC builds, pairs and screenshot builds (weeks 4–8);
  - Tue/Thu: flagship from week 2;
  - Sat: LLD;
  - weeks 7 and 10, Mon–Wed: take-home parts 1–3;
  - from week 9: `MC_TIMED` second passes, 2 per Mon/Wed/Fri slot.
- **`jt`:**
  - Mon how-it-works, Tue memo, Wed practical, Thu decomposition (from week 2), Fri OSS fix (from week 3), with every 3rd Friday a code review;
  - Sat in odd weeks 1–9: AI drill;
  - Sat in even weeks and in weeks 10–13: a mock (`takesRevision: true`). Peer mocks are in weeks 4, 6, 8, 10 and 12, rotating coding → FE SD → behavioral → decomposition. Speed pairs come from week 5. Phase 3 mocks are full mock loops.
- **`sd`, `fe`, `beh`, `ai`:** their lists in order, then the existing revision tails (`FE` revision pairs, `SD_MOCKS` rotation, `APPLY` replaced by FDE prompts, `AI_REVIEW`).
  - **`beh`:** BEH items, with `ux` items as a second task in the same slot for weeks 1–5 (as today). The deep dives fall on Saturdays in weeks 2–4, and the displaced items shift by one. Negotiation is in week 12.

- [ ] **Step 1: Write the failing tests** in `scripts/test-tracks.ts`:
  - every track has 78 slots, and no ID appears twice within or across tracks;
  - `GRIND_DOW[0] === 1` (Mon), `GRIND_DOW[5] === 6` (Sat), `GRIND_DOW[6] === 1`;
  - `jt` slot for week 2 Monday (index 6) is a how-it-works item, Tuesday (7) a memo;
  - the first Friday OSS fix is at week 3 (index 16), and slot index 28 (week 5 Fri, the 3rd OSS Friday) is a code review;
  - `mc` week 7 Mon/Tue/Wed (indexes 36, 37, 38) are take-home parts 1/2/3;
  - every `role: 'unseen'` item has `hiddenUntilStart: true`;
  - the last pattern item is at slot ≤ 53;
  - `aib` slots 0–3 are the Python items (parts 1–2 each);
  - every week 10–13 Saturday `jt` slot has `takesRevision: true`.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement `buildTracks`.**
- [ ] **Step 4: Run** `npm test`. Expected: PASS.
- [ ] **Step 5: Commit** `feat(tracks): 78-slot track sequences with grind weekday rules`.

### Task 6: Modes and calendar layout (pure)

**Files:**
- Create: `src/lib/modes.ts`.
- Create: `src/lib/layout.ts`.
- Test: `scripts/test-layout.ts`.

**Interfaces:**
- **`modes.ts`:**
  - `MODE_INFO = { grind: { weeks: 13, studyDays: 78 }, steady: { weeks: 17, studyDays: 102 } }`;
  - `modeOn(modes, isoDate): ModeEntry & { since: string }`. Default `{ mode: 'steady', cursors: all 0 }`. The latest entry ≤ date wins, and the last write that day wins.
  - `switchMode(modes, today, mode, cursorsNow: Record<TrackId, number>)`. It writes `modes[today]`. Calling it twice on the same day overwrites.
  - `steadyWeek(grindWeek) = Math.round(grindWeek * 17 / 13)`.
- **`layout.ts`:**
  - `steadyRuns(trackIndex: number, studyDay: number): boolean`. Rotation for the 8 tracks `dsa, aib, fe, mc, sd, jt, beh, ai`:
    - over 102 study days, each track runs on exactly 78;
    - every day runs at least 5 of the 8;
    - no track skips 2 days in a row.
    - Suggested approach: Bresenham on phase-shifted indices. The tests decide.
  - `layoutDays(input: { start: string; kickoff: boolean; modes; tracks }): LayoutDay[]`, where `LayoutDay = { date: string; no: number; week: number; grindWeek: number; phase: 1 | 2 | 3; mode: 'steady' | 'grind'; kind: 'prep' | 'study' | 'sun'; studyNo?: number; sundayNo?: number; slots: Partial<Record<TrackId, Slot & { index: number }>> }`.
    - `grindWeek` is the week in Grind terms. For Steady it's the inverse of `steadyWeek`, so week-pinned items (readiness, review, take-homes) find their Sunday.
    - `phase` is 1 for grindWeek ≤ 4, 2 for ≤ 9, otherwise 3.
    - The prep day is `start − 1`.
    - Weeks run Mon–Sun.
    - The total length is that mode's weeks × 7, recomputed from each mode entry onward. From a switch date, each track resumes at `entry.cursors[track]`.
  - `cursorsAt(days: LayoutDay[], date: string, done: Record<string, number>): Record<TrackId, number>`. For each track, the index of the first slot (at or after the current mode entry's cursor) with any item not done. Used by the Setup switch, through `cursorsNow` (Task 8).

- [ ] **Step 1: Write the failing tests** in `scripts/test-layout.ts`:
  - **Rotation:**
    - in Steady, `steadyRuns` gives each track exactly 78 runs in 102 days;
    - min tracks per day ≥ 5;
    - no 2-day skip.
  - **Length and calendar:**
    - Grind with `start` 2026-11-16: 91 days plus the prep day, and the prep day's date is 2026-11-15;
    - day 7 (no) is Sunday 2026-11-22, with `sundayNo: 1`;
    - every track's 78 slots are laid out once, in order.
  - **Steady:** 119 days plus the prep day; each track's slots appear in order with none missing.
  - **Changing start** (Review Focus 1): build with start A, then start B (a week later). The set of content IDs is identical. A tick keyed `fe:closures` appears in both.
  - **Mode switches** (Review Focus 2):
    - switch Steady→Grind on day 20 with cursors from `cursorsAt`. Days before it are unchanged, and every track item appears exactly once across the whole plan;
    - switch Grind→Steady→Grind on the same date: the latest wins, with no duplicates and nothing missing;
    - `steadyWeek(8) === 10`, `steadyWeek(4) === 5`, `steadyWeek(13) === 17`.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement `modes.ts` and `layout.ts`.**
- [ ] **Step 4: Run** `npm test`. Expected: PASS.
- [ ] **Step 5: Commit** `feat(layout): steady/grind calendars, rotation, mode switching`.

### Task 7: Timetables and calendar file

**Files:**
- Modify: `src/lib/schedule.js`.

**Interfaces:**
- Produces:
  - `WEEKDAY_BLOCKS`: the Grind times from §1. Split `05:15–06:45 dsa` + `06:45–07:15 aib`, and `14:45–15:15 rev` + `15:15–16:00 jt`. All other times stay.
  - `BUFFER_BLOCK = { k: 'buffer', title: 'Buffer: catch up, rest or explore', kind: 'life' }`. In Steady it replaces a rotating block on a day that block doesn't run, at the same times.
  - `SUNDAY_BLOCKS`:
    - `05:00 wake`;
    - `05:15–06:15 workout`;
    - `09:00–10:30 core` (weekly self-check + reflection + listen-back + preview + readiness/review when due);
    - `10:30–11:30 read` (Sunday read);
    - `11:30–13:30 sunday` (active rest suggestions or revision blocks, by `sundayMode`);
    - `13:30–20:30 rest`;
    - `20:30 review`;
    - `21:30 wind`.
  - `buildICS(startISO, totalDays)`. Callers pass 91 or 119.
- [ ] **Step 1:** Change the blocks and ICS signature. The existing `.ics` builder test, if absent, is covered by the smoke test in Task 13.
- [ ] **Step 2: Run** `npm test && npm run build`. Expected: PASS. (The engine still compiles because Task 8 lands next. If it doesn't, merge 7 and 8 into one commit.)
- [ ] **Step 3: Commit** `feat(schedule): v2 weekday split, buffer block, new sundays`.

### Task 7b: Routine slots (owner-editable meals and gym)

Added 2026-11-15 with the owner's agreement. Not in the spec; this task text is the authority for it.

**Files:**
- Create: `src/lib/routine.ts` (pure, no runtime imports).
- Modify: `src/lib/state-types.ts` (types), `src/lib/store.tsx` (`routine` in `State`, `fresh`, `normalize`), `src/lib/sync-merge.ts` (`'routine'` in `MAPS`).
- Modify: `src/lib/schedule.js` (`buildICS` takes the routine).
- Test: `scripts/test-routine.ts`.

**Interfaces:**
- **Types** (`state-types.ts`):
  - `RoutineKey = 'breakfast' | 'lunch' | 'dinner' | 'extra'`;
  - `RoutineSlot = { on: boolean; title: string; s: string /*'HH:MM'*/; min: number }`.
- **State:** `routine: Partial<Record<RoutineKey, RoutineSlot>>`, a synced map (per-slot last write wins). A missing key means "use the default".
- **`routine.ts` exports:**
  - `DEFAULT_ROUTINE: Record<RoutineKey, RoutineSlot>`, which matches today's `WEEKDAY_BLOCKS` exactly:
    - `breakfast`: on, "Breakfast, get ready", 07:15, 45 min;
    - `lunch`: on, "Lunch + 20 min power nap", 11:45, 75 min;
    - `extra`: on, "Gym", 18:00, 60 min (block `k: 'workout'`, `kind: 'health'`);
    - `dinner`: on, "Dinner + family time", 19:15, 45 min.
  - `ROUTINE_BLOCK_KEY = { breakfast: 'breakfast', lunch: 'lunch', dinner: 'dinner', extra: 'workout' }`: the template block each slot replaces.
  - `resolveRoutine(stored): Record<RoutineKey, RoutineSlot>`: defaults overlaid with the stored slots.
  - `validateRoutine(r): { ok: true } | { ok: false; error: string }`. Rules: title 1–40 chars after trim; `min` is an integer 5–180; `s` is a valid `HH:MM`; an enabled slot must start at or after the end of the `wake` block and end at or before the start of the `wind` block; two enabled slots may not overlap. The error is a short sentence for the UI, e.g. "Lunch overlaps Gym."
  - `placeDay(template: Block[], routine): { ok: true; blocks: Block[] } | { ok: false; block: { k: string; title: string }; overMin: number }`, where `Block` is the `schedule.js` block shape `{ s, e, k, title, kind, remind? }`.
- **Placement rules (`placeDay`):**
  1. Remove the template blocks named in `ROUTINE_BLOCK_KEY`.
  2. **Anchors** are fixed in time: `wake` (its template time), every enabled routine slot (its own time and title, `kind: 'life'`, except `extra`, which is `'health'`, all `remind: true`), and `wind` (its template time).
  3. Every other block **flows**, in template order, keeping its **full template duration**. A flowing block starts at the later of (the end of the previous placed block) and (its own template start). If that would overlap an anchor, it moves to start at that anchor's end. Repeat until it fits. Blocks are **never split or shortened**.
  4. If a flowing block would end after the start of `wind`, return `{ ok: false, block, overMin }`, where `overMin` is how many minutes past `wind`'s start it would end. No block is ever silently dropped.
  5. The output is sorted by start time. Gaps stay empty (no filler block).
  6. With `DEFAULT_ROUTINE` and `WEEKDAY_BLOCKS`, the output equals `WEEKDAY_BLOCKS` exactly (same order, times, keys and titles).
- **Scope:** the routine applies to **Mon–Sat study days** (both modes). **Sundays and the prep day keep their own fixed timetables in R1.** Steady days place their template after the `BUFFER_BLOCK` substitution, so a buffer flows like the block it replaced.
- **`schedule.js`:** change the `free` block title to "Outdoor walk, sunlight, snack" (it no longer assumes gym). `buildICS(startISO, totalDays, routine)` places `WEEKDAY_BLOCKS` with the routine before writing weekday events. If placement fails, it falls back to `WEEKDAY_BLOCKS` unchanged (Setup prevents saving such a routine anyway).

- [ ] **Step 1: Write the failing tests** in `scripts/test-routine.ts`:
  - defaults reproduce `WEEKDAY_BLOCKS` exactly;
  - lunch moved to 12:30 for 60 min: `sd` (90 min) can't fit before it, so it starts at 13:30, every later study block keeps its duration, and the result is either a valid day or `ok: false` with a positive `overMin`; assert the actual result;
  - breakfast turned off: no `breakfast` block, no other block moves earlier than its template start;
  - `extra` renamed "Yoga" at 17:00 for 30 min: a block titled "Yoga" with `kind: 'health'` at 17:00–17:30 and no "Gym" block;
  - a routine that pushes study past `wind` returns `ok: false` naming the first block that doesn't fit;
  - `validateRoutine`: overlapping lunch and gym → error; `min: 0` → error; `s: '25:00'` → error; a slot before 05:15 → error; the defaults → `ok: true`;
  - `resolveRoutine({ lunch: { on: false, title: 'Lunch', s: '12:00', min: 60 } })` overrides only lunch;
  - a v5/v6 state without `routine` normalizes to `routine: {}`, and `merge` keeps `routine` slots from both sides (append to `scripts/test-sync-merge.ts`).
- [ ] **Step 2: Run** `npm test`. Expected: FAIL.
- [ ] **Step 3: Implement** the types, state field, `routine.ts` and the `buildICS` change.
- [ ] **Step 4: Run** `npm test && npm run build`. Expected: PASS.
- [ ] **Step 5: Commit** `feat(routine): owner-editable meal and gym slots with block placement`.

### Task 8: Engine glue: layout → Day[]

**Files:**
- Modify: `src/lib/engine.ts`. Rewrite `buildPlan`, `studyBlocks`, `sundayBlocks` and `kickBlocks`. Keep `applyUpdates`, `applyCustom`, metrics and types.
- Modify: `src/lib/timeline.ts` (stage `match` predicates to use IDs/cats, not study-index ranges).
- Modify: `src/lib/search.ts` (`no <= 91` → total days).
- Modify: `src/components/today-view.tsx` and `src/components/shell/app-sidebar.tsx` (`TOTAL` → `totalDays`).

**Interfaces:**
- Produces:
  - `buildPlan(state: Pick<State, 'start' | 'kickoff' | 'modes' | 'done' | 'sundayMode' | 'routine'>, updates, custom): Day[]`;
  - `totalDays(days: Day[]): number`;
  - `cursorsNow(state, today: string): Record<TrackId, number>`, which wraps `cursorsAt` over the current layout;
  - `Day` keeps `i, no, date, week, phase, type, blocks, tasks`, plus `s` (the 1-based study-day counter) and `n` (the Sunday number). Drop `lld`, `mc` and `studyBefore`.
  - `Task` gains `pattern?`, `tier?`, `flags?`, `role?`, `depth?`, `hiddenUntilStart?`, `labels?: never` (labels are looked up via `labelsOf`, not stored on tasks).
- **Block times:** every Mon–Sat study day's blocks come from `placeDay(template, resolveRoutine(state.routine))` (Task 7b), so `buildPlan` also takes `routine` in its `state` pick. Sundays and the prep day use their fixed templates.
- **Block contents:**
  - **Revision block:** at most 3 re-solve tasks (`rs:<slug>`, the teaching problems at +3/+7/+21 days) plus one drill task `d:<date>:drill`.
    - The drill's text lists 3 problems (name + LeetCode link) chosen by a seeded shuffle of the date. They come from patterns already covered, never `role: 'unseen'`, and optional-pool problems are preferred.
    - The task peek has "Reveal patterns". R2 replaces this with `pattern-id` quiz items. When the `jt` slot is `takesRevision`, the revision block merges into it (75 min).
  - **Daily review:** `d:<date>:log`.
  - **Sunday:**
    - core tasks `d:<date>:check|reflect|preview`;
    - `readiness:<grindWeek>` and `review:week8` on their mapped Sunday;
    - `sun:<read-id>` (read n on Sunday n);
    - for `sundayMode` `'revision'`: flagged re-solves + `d:<date>:catchup`;
    - for `'rest'`: one suggestion task `d:<date>:explore` (optional, health cat, so it never counts as "behind");
    - from Grind week 8 (Steady week 10): one optional task "Optional: apply to 3–5 roles" (health cat).
  - **Prep day:** setup tasks plus baseline tasks `baseline:dsa|fe|sd`. Each is ticked with a 0–100 score entry, stored in `scores['baseline/<section>']`.
- [ ] **Step 1:** Rewrite `buildPlan` over `layoutDays` + `buildTracks`. Delete `TOTAL`, and replace every import with `totalDays(days)`.
  - Fix every user of the dropped fields and the phase week ranges: `src/components/roadmap-weeks.tsx` (its phase bands are `W1–4` / `W5–9` / `W10–13`; derive them from the days' `phase` and `week`), `src/components/roadmap-timeline.tsx`, `src/components/today-view.tsx`, `src/lib/timeline.ts`. Find them with `grep -rnE "studyBefore|\.lld\b|\bd\.mc\b|\bd\.s\b|\.s!" src`.
  - The existing `public/updates.json` items target v1 IDs (`ai-14` and so on), so after this change they match nothing. That's expected and harmless. Don't migrate them.
- [ ] **Step 2: Run** `npm test && npm run build`. Expected: PASS, with no type errors.
- [ ] **Step 3: Run the dev server and the smoke test.** `npm run dev`, then `node scripts/smoke.mjs .superpowers/shots-r1`. Expected: every page renders and there are no console errors. Update the fixture in `smoke.mjs` to v6 and a Monday start.
- [ ] **Step 4: Commit** `feat(engine): build days from tracks and layout; remove TOTAL`.

### Task 9: Setup: mode, start date, prep day

**Files:**
- Modify: `src/components/setup-view.tsx`.

**Behaviour:**
- **Mode control:** a segmented control, Steady (default) | Grind, with one line each:
  - "17 weeks · about 8.5 h a day";
  - "13 weeks · about 10.75 h a day".
- **Switching** calls `switchMode(state.modes, today, mode, cursorsAt(days, today, done))`, then toasts "Switched to Grind from today. Done work stays done."
- **Start date picker:** only Mondays can be picked. "Start over from today" snaps to the next Monday.
- **The prep-day toggle stays.**
- **Calendar download** uses `buildICS(start, totalDays(days), resolveRoutine(state.routine))`.
- **"My routine" section** (Task 7b): one row per slot (Breakfast, Lunch, Dinner, and the 4th slot, which starts as "Gym"). Each row has an on/off switch, a name field, a start time and a duration in minutes. "Save" runs `validateRoutine`, then `placeDay(WEEKDAY_BLOCKS, routine)`. If either fails, nothing is saved and one line explains why, e.g. "Doesn't fit: 'Deep work 3 · Machine coding' would run 40 min past 21:30. Move a slot or shorten it." "Reset to defaults" clears `state.routine`. A note under the section says the routine applies Mon–Sat, and that a downloaded calendar file must be downloaded again after changes.
- [ ] **Step 1: Implement.**
- [ ] **Step 2: Check manually** in the dev server: switch modes twice, and Today and the Roadmap timeline still render.
- [ ] **Step 3: Commit** `feat(setup): steady/grind mode, monday start`.

### Task 10: Labels UI and label filter

**Files:**
- Create: `src/components/labels-manager.tsx` (a Setup section: list groups and labels, create, rename, recolour from 8 fixed swatches, delete with confirm).
- Create: `src/components/label-picker.tsx` (a popover with a checkbox list grouped by group; single-choice groups act as radio).
- Modify:
  - `task-row.tsx`: replace the `Yours` chip with up to 2 label chips (system Source/Pattern first) and a `+N`.
  - `task-peek.tsx`: add a Labels row with the picker.
  - `new-task-dialog.tsx`: a labels field.
  - `today-filters.tsx` and `src/lib/task-filter.ts`: a new `labels: string[]` dimension, matching ANY. The `owner` dimension becomes the Source system group.
  - `roadmap-weeks.tsx`: the same label filter (reuse `today-filters` in a compact form). The DSA page (Task 11) filters by label too.
- Test: `scripts/test-task-filter.ts` (append).

**Interfaces:**
- Consumes: `labelsOf`, `applyLabel`, `removeLabel`, `createLabel` (Task 2).
- `TaskFilter` gains `labels: string[]`. `parseFilter` drops unknown IDs. `matches(t, blockKey, f, done, status, itemLabels)` takes one new optional parameter.
- [ ] **Step 1: Failing tests:**
  - a filter `labels: ['lb-1']` matches a task whose `itemLabels` include it, and not one without;
  - `sys:source:yours` matches own tasks;
  - `parseFilter({ filter: { labels: [1, 'x'] } })` gives `labels: ['x']`.
- [ ] **Step 2: Run.** Expected: FAIL. **Step 3: Implement** the filter, then the components.
- [ ] **Step 4: Run** `npm test && npm run build`. Expected: PASS.
- [ ] **Step 5: Commit** `feat(labels): manager, picker, chips, label filter`.

### Task 11: DSA page, unseen logging, own problems

**Files:**
- Create: `src/components/dsa-view.tsx`. Add `'dsa'` to `View` (`ui-state.tsx`), `VIEWS` (`page.tsx`) and `NAV` (`app-sidebar.tsx`, label "DSA", icon `Binary`), and the bottom bar "More" sheet.
- Modify: `task-peek.tsx` (for problem tasks: a "Solved without seeing it before" checkbox, a "Minutes" number field, the round script as static text).
- Modify: `task-row.tsx` (when `hiddenUntilStart` and not started, show "Unseen problem · press Start" with no title or link; Start sets status `progress` and reveals them).

**DSA page:**
- **Left:** patterns grouped by topic, each with a readiness dot: ○ none, ◐ unseen check passed, ● green.
- **Right:** the selected pattern's card (the 7 fields, its link, and "My notes", which is a `tnotes` entry keyed `pattern:<id>`).
- **Problem table:** status, name, difficulty, 🔥/⭐, tier (Must / Optional), Plan day ("Day N", or "Pool"), labels.
- **"+ Add a problem":** a LeetCode URL, then the pattern (pre-filled), then the difficulty, via `addOwnProblem`. On `in-plan`, offer "Label the plan problem instead".
- **Group by:** Pattern (default) | Topic.
- **Optional problems** show only here, never in Today.

- [ ] **Step 1: Implement.** Problem `solves` logs are written on tick: `{ unseen, minutes, at }`. Re-solve ticks write `solves['rs:<slug>']`.
- [ ] **Step 2: Check manually:**
  - add a problem with a plan URL, and the in-plan prompt shows;
  - tick an unseen check with 20 min, and the dot turns ◐.
- [ ] **Step 3: Run** `npm test && npm run build`. Expected: PASS.
- [ ] **Step 4: Commit** `feat(dsa): patterns page, unseen logging, own problems`.

### Task 12: Sundays, readiness, baseline, references

**Files:**
- Modify: `today-view.tsx` (on Sundays: a header toggle "Active rest | Revision", writing `sundayMode[date]`).
- Modify: `task-peek.tsx` (score field 0–100 on `baseline:*` and the Sunday self-check, writing `scores`).
- Modify: `roadmap-reference.tsx`:
  - replace "Month 4" with "Explore later" (§16);
  - add a "Sunday reads" list, and a "Depth areas" table (§13) showing the 4 "deep enough when…" tests.
- Modify: `progress-view.tsx` (a small "Scores" table: baseline vs each week's self-check, per section).
- **Burnout guard (§17):** when `overall().behindMin > 480` on a Saturday or Sunday, Today shows one line: "You're more than 8 h behind. Make this Sunday a revision Sunday?", with a button that sets `sundayMode` for the coming Sunday. Optional tasks sort last in that state. It never extends a day.
- [ ] **Step 1: Implement.**
- [ ] **Step 2: Check manually:**
  - flip a Sunday to Revision, and its middle block shows revision tasks;
  - enter baseline scores, and they appear in Progress.
- [ ] **Step 3: Run** `npm test && npm run build`. Expected: PASS.
- [ ] **Step 4: Commit** `feat(sundays): rest/revision toggle, scores, explore later`.

### Task 13: Search, smoke, README, release check

**Files:**
- Modify:
  - `src/lib/search.ts`: index patterns (`kind: 'pattern'`, opens the DSA page) and owner labels (`kind: 'label'`, applies the label filter in Today).
  - `scripts/smoke.mjs`: add the DSA page to the nav loop. Assert that a Grind fixture shows "Day 1 of 91" and a Steady one "of 119". Keep `--mute-audio`.
  - `README.md`: the content files list and the modes.
- Test: `scripts/test-search.ts` (append: the query "sliding" returns the pattern hit first).
- [ ] **Step 1: Failing test, implement, then run** `npm test`. Expected: PASS.
- [ ] **Step 2: Full check:** `npm test && npm run lint && npm run build`, then `npm run dev` and `node scripts/smoke.mjs .superpowers/shots-r1`. Expected: all pass, no console errors, no audio.
- [ ] **Step 3: Commit** `chore: search patterns and labels, smoke for v2, readme`.
- [ ] **Step 4:** Push `roadmap-v2` and open a PR to `main` titled "Roadmap v2 · Release 1". The body summarises the release, links the spec and this plan, and ends with the attribution line. Ask the owner before merging, because merging deploys to Pages.

### Task 14: DSA page clarity and pattern coverage

Added 2026-11-15 with the owner's agreement ("just do it"). Where this task differs from spec §2 (24 patterns), this task text is the authority.

**Files:**
- Modify: `src/lib/content/dsa.js`, `src/lib/patterns.ts` (PatternId), `src/lib/tracks.ts` (dsa track), `src/components/dsa-view.tsx`, `src/components/task-row.tsx` (flag icons), and any component rendering 🔥/⭐/○◐● emoji.
- Create: a pure filter helper (e.g. `src/lib/dsa-filter.ts`).
- Tests: `scripts/test-patterns.ts`, `scripts/test-tracks.ts`, `scripts/test-content.ts`, a new `scripts/test-dsa-filter.ts`, `scripts/smoke.mjs`.

**Coverage (27 patterns):**
- Add 3 patterns, each with the full card (signal, template, why, complexity, traps, notWhen, one free link, verified with curl):
  - `matrix` "Matrix and simulation" (topic "Arrays and strings"), placed after `graph-traversal` in teaching order;
  - `design-ds` "Design a data structure" (topic "Design"), placed after `trie`;
  - `math` "Math and number tricks" (topic "Math"), placed before `bits`.
- Refile: `spiral-matrix`, `rotate-image`, `set-matrix-zeroes` → `matrix`; `lru-cache`, `min-stack`, `design-twitter` → `design-ds`; `powx-n`, `multiply-strings` → `math` (`happy-number` stays under `fast-slow`).
- Add problems: `game-of-life` (matrix), `insert-delete-getrandom-o1` (design-ds), `sqrtx` (math), `sort-colors` (two-pointers, sub `dutch-flag`); KMP `find-the-index-of-the-first-occurrence-in-a-string` as optional (pattern `two-pointers` or a `strings` sub-tag).
- Sub-tags (`sub`): `binary-search` gains `on-answer` (e.g. koko-eating-bananas); `top-k` gains `quickselect`; `graph-traversal` gains `multi-source-bfs`; `stack-monotonic` gains `monotonic-queue`.
- Each new pattern has 3 must-solves: exactly one `teach`, one `var`, one `unseen`. Total must-solve stays ≤ 100: demote about 7 overlapping must-solves (never 🔥/⭐ ones, never a pattern's teach/unseen) to optional. No problem is deleted.
- **Topics (13):** Arrays and strings, Stack, Binary search, Linked list, Trees, Tries, Heap, Backtracking, Graphs, Intervals, Greedy, Dynamic programming, Bit manipulation — plus "Design" and "Math" for the two new patterns (15 headings in all). Merge "Arrays and hashing", "Arrays" into "Arrays and strings"; "Advanced graphs" into "Graphs".

**Schedule (no added load):** the dsa track stays 78 slots. The 3 new patterns take their slots from the Phase 3 timed sets (16 → about 12); patterns may now end by slot ≤ 57. Foundations, ADV_DSA and INTERVIEW_ENV placement are unchanged. Every other track is unchanged.

**DSA page:**
- Left panel: "All problems" at the top; each topic is a heading row (lucide `Layers` icon, bold small-caps, "N patterns" count); patterns are indented rows under it (lucide `Puzzle` icon, normal weight, readiness icon). No "Group by" switch.
- Click a pattern → that pattern's card, notes and problems only. Click a topic → all its problems, grouped by pattern with sub-headings. "All problems" → everything, grouped by topic then pattern. Default on open: the pattern the plan is on today (else the first pattern).
- Filter bar: Status (To do / Done), Difficulty (E/M/H), Tier (Must / Optional / Yours), Hot, Labels, and name search; each option shows a count; one "Clear". Hidden unseen problems never match the name search and stay anonymous. Remember the last filters per viewer (localStorage, wrapped in try/catch).
- Each problem row shows its plan day and re-solve days, e.g. "Day 12 ✓ · re-solves Day 15, 19, 33" (or "Pool").
- **Icons, not emoji, everywhere:** readiness = lucide `Circle` / `CircleDashed`-style half / `CircleCheck` (pick the closest available lucide icons for none / ◐ / green); hot = `Flame`; hard-hot = `Star`; each with an aria-label. Replace the emoji in task rows, the DSA table and the pattern list.

- [ ] **Step 1:** Update tests first (27 patterns in order, refiles, new problems, must-solve ≤ 100 with per-pattern teach/var/unseen rules, sub-tags, topic list, dsa track 78 slots with patterns ending ≤ 57, filter helper). Run: FAIL.
- [ ] **Step 2:** Implement data, tracks, filter helper, page and icons.
- [ ] **Step 3:** `npm test && npm run build`, dev server + smoke (Chromium `--mute-audio`). Expected: PASS.
- [ ] **Step 4:** Commit `feat(dsa): 27 patterns, topic/pattern navigation, filters, icons`.

### Task 15: Editable wake-up and bedtime; bedtime moves instead of refusing; logo; dead link

Added 2026-11-15 with the owner's agreement. The rule: "changing bed timing is fine; the roadmap must never be compromised." This text is the authority over Task 7b where they differ.

**Routine (`src/lib/routine.ts`, Setup "My routine"):**
- Add one editable time: **Wake up** (default 05:00), stored in `state.routine.wake` (`{ s: 'HH:MM' }`; missing = default). There is no editable bedtime (owner, 2026-11-15: "for simplicity"); bedtime is derived: the wind block normally ends 17 h after wake and moves later when needed.
- **Wake shifts the day:** every template time on Mon–Sat study days is offset by (wake − 05:00) before routine slots are placed (the `wake` block starts at the user's wake). Routine slots keep their own absolute times.
- **Bedtime moves instead of refusing:** the `wind` block (30 min) ends at the derived bedtime. When flowing blocks would run into `wind`, `placeDay` moves `wind` (and so the effective bedtime) later instead of returning `ok: false`. It returns `{ ok: true, blocks, bedtime: 'HH:MM', bedShiftMin: number }`. Study blocks are still never split, shortened or dropped. `ok: false` remains only for invalid input (overlapping slots, a slot before wake, or a day that would run past 23:59).
- **Setup:** Save no longer refuses an overflowing routine. It shows one line when bedtime moves, e.g. "Bedtime moves to 22:40 on study days to fit everything." Validation errors still block saving.
- **Today:** on a study day whose bedtime moved, the wind-down block title shows the moved time (e.g. "Wind down · sleep at 22:40").
- `buildICS` uses the placed blocks (moved bedtime included).
- Tests: wake 06:00 shifts every block by 60 min; lunch 12:30/60 now returns ok with bedShiftMin = the computed overrun and every study block at full length; a day past 23:59 returns ok:false; defaults still reproduce WEEKDAY_BLOCKS exactly.

**Logo:** replace `public/logo-64.png`, `src/app/icon.png`, `src/app/apple-icon.png` and `design/logo.png` with the owner's new mark (prepared files supplied). App name unchanged.

**Dead link:** replace the removed Medium multithreading-for-LLD article (410) with a verified, free, high-quality article on multithreading/concurrency questions in low-level design interviews (curl 200, record the date).

- [ ] **Step 1:** Tests first for the routine changes. Run: FAIL.
- [ ] **Step 2:** Implement routine, Setup, Today title, ICS; swap logo files; replace the link.
- [ ] **Step 3:** `npm test && npm run build`, smoke (Chromium `--mute-audio`). Expected: PASS.
- [ ] **Step 4:** Commit `feat(routine): editable wake and bedtime; bedtime moves instead of refusing` and `chore: new logo; replace dead lld link`.

---

## After Release 1

Each later release has its own plan. Execute them in order, only after the previous one is merged:
- **R2 (quizzes):** `docs/superpowers/plans/2026-11-16-roadmap-v2-release-2-quizzes.md`
- **R3 (AI with the user's own key + hot reads):** `docs/superpowers/plans/2026-11-16-roadmap-v2-release-3-ai.md`
- **R4+:** the rest of the question bank, using R2's import pipeline (described at the end of the R2 plan).
