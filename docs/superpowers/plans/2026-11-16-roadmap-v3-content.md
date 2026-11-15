# Roadmap v3 (content redesign) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the v2 curriculum with the v3 one: 7 tracks of exactly 78 slots (DSA, AI core, Systems, Platform, Product, Career, Frontend), a generated recall block, and the new Steady pairing, template, scores and readiness text.

**Architecture:** Each track's slots are authored **in final order** in its own content module (one row per slot), so the builders in `tracks.ts` become thin: expand a row into its 2–3 tasks, plus the generated parts (DSA patterns and sets, Career Saturdays). Layout, engine, routine, Sundays and sync stay; `plan-build.ts` gains the recall block and the Steady DSA revisit and loses the revision merge.

**Tech Stack:** Next.js 15 static export, TypeScript (node `--experimental-strip-types` tests, `node:assert`), Playwright smoke.

**Spec:** `docs/superpowers/specs/2026-11-15-roadmap-v3-ai-systems-design.md` (revision 2 + re-review fixes). Read it first; this plan points at its tables instead of repeating them. The spec review (`…-roadmap-v3-spec-review.md`) is background only.

## Global Constraints

- Branch `roadmap-v2`. Never push. Commits end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Every track has exactly 78 slots (`SLOTS = 78`); `toSlots` / `mustFit` keep throwing on overflow or an empty slot. Nothing is shortened to fit.
- Grind slot n (1-based) = week ⌈n/6⌉, weekday ((n−1) mod 6)+1. Code is 0-based: index i = n−1.
- Every learning slot has 2–3 tasks: Understand (one link), Do (TypeScript only, AI assistant allowed), Explain (contains "Deep enough when you can"). Timed reps, mocks and generated blocks are one task each.
- No task text mentions Python or pandas, or building a basic widget (the 6 rehearsal reps excepted, labelled "interview rehearsal").
- Links: every `url` is `https://`; one primary link and at most one free secondary link (`url2`) per item. Sourcing rule in the spec's Sources section (System Design Primer, Tech Interview Handbook as secondary links). New URLs must pass `node scripts/check-links.mjs` (no new failures in `.engine/link-report.json`).
- Reuse v2 ids exactly as the spec's tables name them; new ids use the track prefix (`ai:`, `sd:`, `pf:`, `proj:`, `beh:`, `fe:`, `dsa:`) + kebab-case.
- v2 `after` fields are ignored. `after` exists only on product AI steps (= the id of the **first item** of the named AI-core slot) and Platform slot 6 (= first item of product slot 1).
- Pure modules keep type-only imports (node strip-types; see `task-filter.ts` header).
- Tests and smoke are silent (`--mute-audio`). Two `next dev` servers in one folder corrupt `.next`: smoke uses `NEXT_DIST_DIR=.next-smoke npx next dev -p 3200` and `SMOKE_URL=http://localhost:3200`; revert any `tsconfig.json` lines `next dev` adds.
- Copy rules: plain English, short sentences, no emoji.

## Review Focus

1. **Mode switch mid-plan with the new pairing** (Grind → Steady at week 5 with ticks): no slot lost, `after` still on an earlier day, no "unplaced after 400 days". Test in Task 1.
2. **Recall on a day after a mode switch or on day 1** (no AI-core slot yet; no Systems slot 3–7 days back): the warm-up / 50-min fallback text, never a crash. Test in Task 1.
3. **Steady DSA revisit pool exhaustion or early days** (no hard pattern covered yet): revisit falls back to any covered pattern, then to "re-solve a flagged problem"; never an empty block. Test in Task 1.
4. **Old saved state** (v1/v2 `modes` with an `aib` cursor, old filter `tracks` keys, old `w<n>/fe` scores): loads, ignores unknown keys, Scores table still shows old weeks. Test in Task 1.
5. **Routine with a moved wake-up** on the new 60/60 DSA/recall split: blocks still placed; study hours still 10.75. Test in Task 1.

---

## Content row format (used by Tasks 2–8)

Every track module exports one ordered array of 78 rows (Career: 65 weekday rows; DSA and Career Saturdays are generated). Two row kinds:

```js
// Learning slot → 3 tasks: `${id}` (Understand), `${id}:do`, `${id}:explain`. `do` may be omitted (2 tasks).
{ id: 'ai:3b1b-neural-network', covers: ['ai:3b1b-gradient-descent'],
  understand: 'Watch 3Blue1Brown ch. 1–2: …', url: 'https://…', url2: 'https://…' /* optional */,
  do: 'In a TS scratch file, …', explain: 'Out loud, 3 min: … Deep enough when you can …',
  cat: 'fde' /* optional override */, after: 'aib:tool-call-loop' /* product/platform only */, parts: 2 /* platform 2-slot item */ }
// Rep / mock / timed slot → 1 task with `id`.
{ id: 'fe:rep-event-loop-output', kind: 'rep', text: 'Timed rep (45 min): …', url: 'https://…', mins: 45, covers: ['fe:event-loop', 'fe:promises'] }
```

`covers` lists v2 ids this slot absorbs; Task 9's coverage test uses it. A 2-slot Platform item is written as **one row with `parts: 2`**; the builder emits two slots, ids `${id}:part-1` / `${id}:part-2` for the Understand task (`:do`/`:explain` suffixes on each part), text suffix "(part k/2)".

---

### Task 1: Engine — 7 tracks, pairing, template, recall, revisit, scores

**Files:**
- Modify: `src/lib/state-types.ts:3`, `src/lib/engine.ts:17` (Cat), `src/lib/layout.ts:27-48`, `src/lib/modes.ts:11`, `src/lib/plan-build.ts`, `src/lib/schedule.js:6-27`, `src/lib/sundays.ts:3-5`, `src/lib/timeline.ts:4-11` (TRACKS, TrackKey), `src/lib/task-filter.ts:17-18`, `src/lib/cycle.ts` (its CAT_TRACK copy), `src/lib/tracks.ts` (`buildTracks`: drop `aib`; add `expandRow`), `src/lib/content/sundays.js` (SUNDAY_CORE self-check text)
- Test: `scripts/test-layout.ts`, `scripts/test-engine.ts`, `scripts/test-schedule.ts`, `scripts/test-sundays.ts`, `scripts/test-tracks.ts`, `scripts/test-task-filter.ts`, `scripts/test-routine.ts`

**Interfaces:**
- Produces: `TrackId = 'dsa' | 'fe' | 'mc' | 'sd' | 'jt' | 'beh' | 'ai'`; `Cat` gains `'platform'`; `TrackKey = 'dsa' | 'ai' | 'sd' | 'mc' | 'platform' | 'career' | 'fe'`; `SCORE_SECTIONS` keys `dsa, ai, sd, platform, product, fe`; `expandRow(row: Row, cat: Cat): SlotItem[][]` in `tracks.ts` (returns 1 slot, or 2 for `parts: 2`); `PAIR_PHASE` for `[dsa, fe, mc, sd, jt, beh, ai]` = `[0, 1, 1, 2, 2, 0, 3]`.
- Interim: until Tasks 2–8 land, `buildTracks` keeps the v2 builders for the 7 remaining tracks (the `aib` builder and its content are no longer laid out). The v2 jt Saturday items lose `takesRevision`; their 75-min text is interim.

- [ ] **Step 1: Write the failing tests**
  - `test-layout.ts`: `TRACKS = ['dsa','fe','mc','sd','jt','beh','ai']`; for every Steady study day d in 0..101, `!(dsa skips && fe skips)`; `fe` and `mc` skip on the same days; each track runs 78 of 102; the existing switch scenarios rewritten without `aib` (replace the `aib`→`ai` prerequisite scenario with a `mc` item `after` a `fe` item, built from a synthetic track fixture); Review Focus 1: Grind→Steady at study day 25 with all earlier slots ticked places every slot of every track exactly once (superseded aside) and returns.
  - `test-schedule.ts`: `WEEKDAY_BLOCKS` has `dsa 05:15–06:15`, `aib 06:15–07:15`, titles exactly as the spec's Track identity table; total study minutes = 645 (10.75 h).
  - `test-engine.ts` (build with the real content): on every study day the `aib` block has tasks `d:<date>:recall-ai` (mins 30), `d:<date>:recall-sd` (20) and `d:<date>:news` (10, `newsId: 'reads'`), and the `ai` block has no news task; day 1 `recall-ai` text starts "Warm-up:"; a day with no Systems slot 3–7 study days back has no `recall-sd` and `recall-ai` mins 50; Steady: on every study day where `dsa` has no slot and the track is not finished, the `dsa` block (not a buffer) holds 2 tasks with ids `rv:<slug>:<date>`, `mins` 45 total, from patterns already covered, hard patterns first (`dp, graph-traversal, topo-sort, union-find, shortest-path-mst, backtracking, tree-dfs, tree-bfs, top-k, two-heaps, k-way-merge, intervals, sliding-window, binary-search`), `role: 'var'` before optional, no slug used twice across revisit days; Review Focus 3: before any hard pattern is covered the picks come from any covered pattern, and with nothing covered the block holds one task `d:<date>:revisit-flagged` ("Re-solve one flagged or hardest problem so far…"); no study day has a block keyed `rev` merged away (the revision block is present on Saturdays).
  - `test-sundays.ts`: `SCORE_SECTIONS.map(s=>s.key)` = `['dsa','ai','sd','platform','product','fe']`, labels `DSA, AI engineering, Systems, Platform & DevOps, Product, Frontend`; Review Focus 4: `scoreTable({ 'w1/fe': 50, 'w1/aib': 3 })` keeps the `fe` row and ignores `aib`.
  - `test-task-filter.ts`: `trackOfCat('platform') === 'platform'`, `trackOfCat('proj') === 'mc'`, `trackOfCat('ai') === 'ai'`, `trackOfCat('fe') === 'fe'`; a saved filter with an unknown track key matches nothing extra and doesn't throw.
  - `test-routine.ts` (Review Focus 5): `placeDay(WEEKDAY_BLOCKS, { wake: { s: '06:30' } })` is ok, `dsa` starts 06:45, `aib` 07:45, study minutes 645.
  - Prep day: `baseline:<section>` tasks for all 6 sections (`scoreKey: 'baseline/<key>'`), minutes summing to 90.
  - Old state: `layoutDays` with `modes` whose cursors include `aib: 12` runs and ignores it.
- [ ] **Step 2: Run** `npm test` — Expected: the new assertions FAIL.
- [ ] **Step 3: Implement.**
  - Types/ids as in Interfaces; remove `'aib'` from every `TRACK_IDS` copy (`layout.ts`, `plan-build.ts`, `modes.ts`).
  - `layout.ts`: new `PAIR_PHASE`; comment updated (fe+mc share a phase so AI-core prerequisites land first; dsa and fe never rest together).
  - `schedule.js`: times and titles per the spec table (Saturday titles are set in `plan-build.ts`: `mc` "Deep work 3 · Low-level design", `beh` "Career · Mock day").
  - `plan-build.ts`: delete `takesRevision` and the merge branch (`planResolves` no longer skips days); move `NEWS_TASK` out of `by.ai` into `by.aib` with the recall tasks; add `recallTasks(L, layout, i): Task[]` (AI source = the latest live `fe` slot on an earlier study day, its first item's text and url; Systems source = the latest live `sd` slot placed 3–7 study days before) and `revisitTasks(L, covered, used): Task[]` used where `mode === 'steady'`, `dsa` has no slot and dsa is not finished. Pool: `content.PROBLEMS` filtered `role === 'var' || tier === 'optional'`, not already in a track slot.
  - `sundays.ts` sections; `SUNDAY_CORE` self-check text: "Weekly self-check: 40 min, closed book. From memory, answer 5 questions per section on this week's topics (DSA, AI engineering, Systems, Platform & DevOps, Product, Frontend), then check against your notes and enter a 0–100 score for each section."
  - Prep baseline (6 tasks): dsa 25 min (one easy + one medium, unseen), ai 15 (explain how an LLM answers a prompt), sd 15 (mini URL shortener), platform 10 (how would you deploy and monitor an app), product 10 (critique a product you use), fe 15 (10 senior frontend questions). Prep `beh`/`ai` blocks unchanged.
  - `timeline.ts` `TRACKS`: `dsa DSA, ai AI engineering, sd Systems, mc Product, platform Platform, career Career, fe Frontend`; CAT_TRACK maps `dsa→dsa, ai→ai, sd→sd, mc→mc, proj→mc, platform→platform, beh/ux/fde→career, fe→fe` (also the local copy in `cycle.ts`).
  - `tracks.ts`: export `expandRow` (Content row format above; `url2` goes on the Understand item as `url2`); add `url2?: string` to `SlotItem` and `Task`, and pass it through `fromItem`.
- [ ] **Step 4: Run** `npm test && npx tsc --noEmit` — Expected: all pass.
- [ ] **Step 5: Commit** `feat(v3): 7 tracks, new pairing and template, recall block, Steady DSA revisits, six score sections`

### Task 2: DSA track

**Files:**
- Modify: `src/lib/content/dsa.js` (PROBLEMS tiers, FOUNDATIONS, ADV_DSA), `src/lib/tracks.ts` (`dsaTrack`)
- Test: `scripts/test-tracks.ts` (DSA section), `scripts/test-dsa-page.ts`, `scripts/test-labels.ts` if tier counts are asserted

**Interfaces:**
- Consumes: `expandRow` (Task 1).
- Produces: `dsa` track per the spec's DSA table; problem ids `p-<slug>`; set ids `dsa:oa-1…8`, `dsa:google-1…4`, `dsa:meta-1…4`, `dsa:revisit-1…3`; adv ids `adv:difference-array-line-sweep`, `adv:fenwick-segment-tree`, `adv:dp-on-trees-digit-dp`.

- [ ] **Step 1: Failing tests:** 78 slots; slot 1 `dsa:foundations-big-o`, slot 2 `dsa:foundations-recursion` (each a learning row with 3 tasks; recursion's text mentions discrete math); for pattern k (1..27, `PATTERNS` order) slot 2k+1 = `[dsa:card-<id>, p-<teach slug>]` and slot 2k+2 = `[p-<unseen slug> (hiddenUntilStart), dsa:explain-back-<id>]`; `PROBLEMS.filter(tier==='must').length === 54` and every must is teach or unseen; slots 57–78 contain exactly 8 `dsa:oa-*` (each url one of `OA_LINKS[0..7]`, text "60 minutes"), 4 `dsa:google-*` (2 problems, 60 min, "Google Doc"), 4 `dsa:meta-*` (2 problems, 40 min), 3 `adv:*`, 3 `dsa:revisit-*` (2 var problems each from hard patterns); no item in 57–78 has a `pattern` field or a pattern name in its text; `env:*` items on the Mondays of weeks 10–13; no `foundations-build` id anywhere; DSA page test: the 45 former var problems show tier optional and keep `role: 'var'`.
- [ ] **Step 2: Run** `node --experimental-strip-types scripts/test-tracks.ts` — FAIL.
- [ ] **Step 3: Implement** `dsaTrack(c)`. Order of slots 57–78 (index from 57): `oa-1, google-1, adv-1, meta-1, oa-2, revisit-1, google-2, oa-3, meta-2, adv-2, oa-4, google-3, revisit-2, oa-5, meta-3, oa-6, adv-3, google-4, oa-7, meta-4, revisit-3, oa-8`. Google/Meta sets draw from `flags` including `hot` (company-wise lists), medium/hard, not already placed, spread across patterns; revisits draw var problems of hard patterns. Remove the `ai-drill` sets, `PROBLEMS_PER_SLOT`, `PATTERNS_END`. Delete the 3 `foundations-build` rows and replace `ADV_DSA` with the 3 combined rows (keep the old 8 strings out of the export; Task 9 lists them as covered/dropped).
- [ ] **Step 4: Run** `npm test` — PASS.
- [ ] **Step 5: Commit** `feat(v3): DSA track — 2 days per pattern, 54 must-solves, Phase 3 sets`

### Task 3: AI engineering core track

**Files:**
- Create: `src/lib/content/ai-core.js` (`AI_CORE`: 78 rows)
- Modify: `src/lib/tracks.ts` (`feTrack` → `aiCoreTrack`, keyed `fe`), `src/lib/plan-data.js` (merge the new module)
- Test: `scripts/test-tracks.ts` (AI core section), `scripts/test-content.ts`

**Interfaces:**
- Produces: `AI_CORE` rows, slot n = spec AI-core table item n. **Primary id of slot n = the first id named for it in the spec cell**; these slots use new ids (where a slot also has a v2 id, that id goes in `covers`): 1 `ai:math-intuition`, 2 `ai:classical-ml`, 17 `ai:chip-use-cases`, 29 `ai:rag-evaluation` (covers `ai:review-rag`), 30 `ai:advanced-rag`, 36 `ai:evals-agents-rag`, 45 `ai:sft-dpo-rlhf`, 46 `ai:fine-tune-data`, 47 `ai:fine-tune-evaluate`, 48 `ai:dataset-engineering`, 49 `ai:prefill-decode`, 51 `ai:gpu-basics`, 52 `ai:self-host-mac`, 54 `ai:design-serving`, 56 `ai:guardrails` (covers `ai:constitutional-ai`), 66 `ai:design-semantic-search`, 67 `ai:design-agent-memory`, 68 `ai:design-multi-tenant`, 69 `ai:dspy-model-card`, 72–75 `ai:teach-back-1…4`, 76 `sdm:ai-chatgpt`, 77 `sdm:ai-eval-framework`, 78 `sdm:ai-rag`. Task 6 depends on: 19 `aib:stream-tokens-react`, 21 `aib:tool-call-loop`, 24 `ai:prompt-caching-cost`, 25 `aib:embeddings-neighbours`, 26 `aib:pgvector`, 27 `aib:retrieval-chunking-hybrid`, 28 `ai:rag-paper`, 32 `aib:evals-test-cases`, 33 `aib:evals-llm-judge`, 34 `fde:eval-pipelines`, 39 `aib:react-build-agent`, 40 `aib:agents-sdk-build`, 47 `ai:fine-tune-evaluate`, 55 `aib:llm-gateway`, 57 `ai:owasp-llm`, 62 `aib:multimodal-upload`.

- [ ] **Step 1: Failing tests:** 78 slots, cat `ai`; slot n's first item id matches the Interfaces list for every listed n; slots 1–75 are learning rows (3 tasks, Explain has "Deep enough when you can"), 76–78 are `kind: 'mock'` with 45 min; slots 5, 18, 25 contain "BPE", "sampling", "cosine" reps in TypeScript; every `AI_EVENING` id except the 4 `ai:depth-ddia-*`, every `AI_REVIEW` id and the 22 AIB ids the spec places in AI core appear exactly once as a primary id or in `covers`; no `after` field; no "Python"/"pandas"/"notebook" in any text; Karpathy GPT slots say "read the code, no retyping".
- [ ] **Step 2: Run** the tracks test — FAIL.
- [ ] **Step 3: Write `AI_CORE`** from the spec table. Reuse each v2 item's `url`; write Understand/Do/Explain text per slot (Do is a small TS exercise or an exercise against your notes; AI assistant allowed). Implement `aiCoreTrack(c) = toSlots('fe', c.AI_CORE.flatMap(r => expandRow(r, 'ai')))`.
- [ ] **Step 4: Run** `npm test` and `node scripts/check-links.mjs` — PASS, no new link failures.
- [ ] **Step 5: Commit** `feat(v3): AI engineering core track (9 modules, 8 AI designs)`

### Task 4: Systems track

**Files:**
- Create: `src/lib/content/systems.js` (`SYSTEMS`: 78 rows)
- Modify: `src/lib/tracks.ts` (`sdTrack`), `src/lib/plan-data.js`
- Test: `scripts/test-tracks.ts` (Systems section)

**Interfaces:**
- Produces: `SYSTEMS` in this exact order (numbers are slots):
  - 1–12: `sd:numbers-card` (computers), `sd:os`, `sd:concurrency`, `sd:internet` (covers `fe:os-networking`), `sd:fundamentals` (covers `sd:capacity-estimation`), `sd:cap-pacelc`, `sd:communication` (covers `fe:api-design`), `sd:caching`, `sd:messaging`, `sd:delivery-framework`, `sd:concepts-to-master`, `sd:hld-bitly`.
  - 13–45 odd: HLD designs 2–18 in order `rate-limiter, dropbox, whatsapp, ticketmaster, fb-news-feed, youtube, web-crawler, distributed-cache, job-scheduler, payment-system, top-k-leaderboard, yelp, live-comments, ad-click-aggregator, news-aggregator, local-delivery, leetcode` (ids `sd:hld-*`).
  - 14–44 even then 46–54 (25 depth): `sd:ddia-2a` (covers `ai:depth-ddia-data-models`), `sd:ddia-2b`, `sd:idempotency-saga`, `sd:ddia-3a` (covers `ai:depth-ddia-storage-indexes`, `sd:storage`), `sd:ddia-3b`, `jt:hiw-stripe-idempotency`, `sd:ddia-4a`, `sd:ddia-4b`, `sd:block-search`, `sd:ddia-5a` (covers `ai:depth-ddia-replication`, `sd:replication-sharding`), `sd:ddia-5b`, `jt:hiw-discord-message-storage`, `sd:ddia-6a`, `sd:ddia-6b` (consistent hashing), `sd:observability-security`, `sd:ddia-7a` (covers `ai:depth-ddia-transactions`, `sd:transactions`), `sd:ddia-7b`, `sd:arch-styles`, `sd:testing-strategy`, `sd:block-geo`, `jt:hiw-figma-multiplayer`, `sd:block-probabilistic`, `sd:refactoring`, `jt:hiw-slack-real-time`, `sd:block-realtime-fanout`.
  - 55–75 odd (11 mocks, `kind: 'mock'`, 45 min, self-review against the framework): `sd:hld-tinder`, `sd:hld-instagram-post-search`, `sd:hld-price-tracker`, `sd:hld-online-auction`, `sd:hld-search-autocomplete`, `sd:hld-robinhood` (covers `sdm:hld-robinhood`), `sd:hld-instagram` (covers `sdm:hld-instagram`), `sd:hld-google-docs` (covers `sdm:hld-google-docs`), `sdm:hld-rate-limiter`, `sdm:hld-whatsapp`, `sdm:hld-ticketmaster`.
  - 56–76 even, 77, 78 (13 depth): `sd:ddia-8a`, `sd:ddia-8b`, `sd:ddia-9a` (covers `sd:reliability`), `sd:ddia-9b`, `jt:hiw-linear-sync-engine`, `jt:hiw-notion-data-model`, `jt:hiw-nextjs-caching`, `jt:hiw-shopify-bfcm`, `jt:hiw-cloudflare-nov-2025`, `jt:hiw-github-copilot`, `sd:block-stream-processing`, `sd:block-blob-media`, `sd:block-ids-clocks-locks`.

- [ ] **Step 1: Failing tests:** 78 slots, cat `sd`; the order above exactly (compare the primary-id array); 26 distinct `*hld-*` designs (learn + mock; second-pass `sdm:` excluded) ; every DDIA chapter 2–9 appears with 2 slots, in book order; slot 1's Understand or `url2` is the System Design Primer latency table; HLD designs that the primer solves (Bitly/Pastebin, web crawler, distributed cache as key-value cache, fb news feed as Twitter timeline) carry the primer solution as `url2`; no `sd:fe-*` and no `sd:ai-*` id in the track.
- [ ] **Step 2: Run** — FAIL.
- [ ] **Step 3: Write `SYSTEMS`** (v2 ids keep their url; HLD learn rows: Understand = Hello Interview or ByteByteGo link, Do = "Draw it yourself in Excalidraw, 45 min", Explain = compare + 3 trade-offs). `sdTrack(c) = toSlots('sd', c.SYSTEMS.flatMap(r => expandRow(r, 'sd')))`.
- [ ] **Step 4: Run** `npm test`, `node scripts/check-links.mjs` — PASS.
- [ ] **Step 5: Commit** `feat(v3): Systems track (computers, HLD, DDIA, case studies, mocks)`

### Task 5: Platform track

**Files:**
- Create: `src/lib/content/platform.js` (`PLATFORM`: rows totalling 78 slots)
- Modify: `src/lib/tracks.ts` (`jtTrack` → `platformTrack`, keyed `jt`), `src/lib/plan-data.js`
- Test: `scripts/test-tracks.ts` (Platform section)

**Interfaces:**
- Consumes: product slot 1 first item id `proj:pick-scaffold` (Task 6).
- Produces: slots 1–18 = the spec's basics list in order (ids `pf:shell` covers `fde:linux-shell`; `pf:shell-tools`; `pf:git-workflows` covers `fde:git-beyond-basics`; `pf:git-internals`; `pf:debugging`; `pf:environments` with `after: 'proj:pick-scaffold'`; `pf:deploy`; `pf:dns-https`; `pf:postgres-backups`; `pf:ci-basics`; `pf:feature-flags`; `pf:logs-alert`; `pf:uptime-errors`; `pf:costs`; `pf:oauth-oidc`; `pf:sso-saml` covers `fde:security`; `pf:secrets`; `pf:hashing-owasp`). Slots 19–78: depth items in the spec's listed order, with the 12 practical reps (`jt:practical-*`, `kind: 'rep'`, 45 min, TypeScript) at slots 23, 28, 33, …, 78 (23 + 5k). A 2-slot item never straddles a practical slot: when it would, the builder places the practical first and the pair after it, then the next free slot at 23 + 5k goes back to practicals (the test fixes the result).

- [ ] **Step 1: Failing tests:** 78 slots, cat `platform`; slots 1–18 ids in order; slot 6 has `after` = `proj:pick-scaffold`; every `parts: 2` item is on consecutive slots; exactly 12 `jt:practical-*`, none mentions Python; all 4 `jt:code-review-*`; `fde:reengineering-round`, `fde:learning-round` as 2-slot items; `pf:oauth-oidc` and `pf:secrets` come before any `aib:containers` / `aib:terraform` slot; AWS slot has the primer "Scaling AWS" link as `url2`; `jt:depth-sre-troubleshooting` is placed; no `jt:memo-*`, `jt:oss-*`.
- [ ] **Step 2: Run** — FAIL.
- [ ] **Step 3: Write `PLATFORM`** and `platformTrack`. Practical rows: rewrite the 6 Python ones in TypeScript, keep their ids.
- [ ] **Step 4: Run** `npm test`, link check — PASS.
- [ ] **Step 5: Commit** `feat(v3): Platform, data and DevOps track`

### Task 6: Product track (flagship, take-homes, LLD)

**Files:**
- Create: `src/lib/content/product.js` (`FLAGSHIP`: 59 rows; reuse `TAKE_HOMES`, `LLD` from `mc.js` — move them here)
- Modify: `src/lib/tracks.ts` (`mcTrack` → `productTrack`, keyed `mc`), `src/lib/plan-data.js`
- Test: `scripts/test-tracks.ts` (Product section), `scripts/test-layout.ts` (after in both modes)

**Interfaces:**
- Consumes: AI-core first-item ids (Task 3 Interfaces).
- Produces: step ids: 1 `proj:pick-scaffold`; reused `proj:*` ids where the spec table names one (multi-part steps: `proj:auth` and `proj:auth-rls`, `proj:realtime` and `proj:realtime-presence`, `proj:offline` and `proj:offline-tests`, `proj:search-performance` and `proj:perf-pass`, `proj:ai-ingestion` and `proj:ai-reindex`, `proj:ai-ask-workspace` and `proj:ai-ask-permissions`, `proj:ai-agent-actions` and `proj:ai-agent-permissions`, `proj:observability-security` and `proj:rate-limits`, `proj:integrations` and `proj:webhooks-out`, `proj:load-failure` and `proj:failure-test`, `proj:launch` and `proj:launch-fix`, `proj:case-study` and `proj:demo-video`); others `proj:<kebab>`. Product basics carry `basics: true`.

- [ ] **Step 1: Failing tests:** 78 slots; Saturdays (index % 6 === 5) are the 13 `lld:*` in `LLD` order, cat `mc`; weeks 7 and 10 Mon–Wed are the take-home parts (cat `proj`, part 1 carries `brief`); the other 59 weekday slots are `FLAGSHIP` in order, cat `proj`; exactly 6 rows with `basics: true` at steps 2, 3, 10, 20, 37, 49; the 16 `after` links of the spec table, each pointing at the AI-core first-item id listed in Task 3 and at a lower Grind index; layout test: in Grind and in Steady (fresh and after a Grind→Steady switch in week 5) every product item with `after` lands on a strictly later day than its target.
- [ ] **Step 2: Run** — FAIL.
- [ ] **Step 3: Write `FLAGSHIP`** (step 1 text: pick the product, default the AI workspace from the v2 brief; AI writes the UI, you review and write an ADR). Implement `productTrack`: walk indices 0..77; Saturday → LLD; week 7/10 Mon–Wed → take-home part; else next flagship row.
- [ ] **Step 4: Run** `npm test` — PASS.
- [ ] **Step 5: Commit** `feat(v3): Product track — 59 flagship steps, take-homes, LLD Saturdays`

### Task 7: Career track (weekdays + Saturday mock day)

**Files:**
- Modify: `src/lib/content/career.js` (`CAREER`: 65 weekday rows; `DECOMP` moves here from `judgment.js`), `src/lib/tracks.ts` (`behTrack`)
- Test: `scripts/test-tracks.ts` (Career section), `scripts/test-engine.ts` (Sunday carry)

**Interfaces:**
- Produces: Saturday ids `beh:ai-drill-1…5` (weeks 1,3,5,7,9; drill 1 covers `aib:ai-assisted-coding-round`), `beh:oa-round-1…4` (weeks 2,4,6,8; urls `OA_LINKS[8..11]`), `beh:loop-<n>-round-1` (weeks 10–13, coding, `OA_LINKS[12..15]`), carried items with `sundayCarry: true`: `beh:mock-w5-sd`, `beh:mock-w7-ai`, `beh:mock-w9-ai`, `beh:peer-w4-behavioral`, `beh:peer-w6-decomposition`, `beh:peer-w8-sd`, `beh:loop-<n>-round-2` (LLD: `sdm:lld-json-parser`, `sdm:lld-2048`, `sdm:lld-minesweeper`, `sdm:lld-chess` for n = 1..4, as `covers`), `beh:loop-<n>-round-3` (AI design, HLD, frontend system design, behavioral + decomposition). Coding rounds and loops cite the Tech Interview Handbook coding rubric as `url2`.
- Weekday order (65): weeks 1–3 = the `BEH` items in v2 order up to the LPs, with `beh:amazon-oa`, `beh:amazon-work-sim`, `beh:amazon-work-style` in week 1 and deep dives 1–3 on the Fridays of weeks 2–4; then DECOMP, FDE stages and teardowns interleaved (one teardown every 5 slots), applications/referrals from week 8, `beh:negotiation-1/2` week 12 Mon–Tue; the 5 shared slots as one row each with `covers`; plus `beh:company-loops`.

- [ ] **Step 1: Failing tests:** 78 slots; Saturdays exactly as Interfaces; 8 distinct `OA_LINKS` across `beh:oa-round-*` and `beh:loop-*-round-1`, disjoint from the 8 used by DSA (`OA_LINKS[0..7]`); week 4/6/8 Saturdays carry their peer mock to Sunday (engine test: the Sunday after Grind week 4 has `beh:peer-w4-behavioral` in its `sunday` block); every `BEH`, `DECOMP`, `TEARDOWNS` id and the 11 FDE ids the spec keeps appear once (primary or `covers`); deep dives on weekdays; negotiation at indices 66, 67; no `ux:*` items; applications items not before week 8.
- [ ] **Step 2: Run** — FAIL.
- [ ] **Step 3: Write `CAREER`** and `behTrack`.
- [ ] **Step 4: Run** `npm test` — PASS.
- [ ] **Step 5: Commit** `feat(v3): Career track and Saturday mock day`

### Task 8: Frontend track (senior)

**Files:**
- Create: `src/lib/content/frontend.js` (`FRONTEND`: 78 rows; the 18 `sd:fe-*` rows move here from `sd.js`, the kept `mc:*` rows from `mc.js`)
- Modify: `src/lib/tracks.ts` (`aiTrack` → `frontendTrack`, keyed `ai`), `src/lib/plan-data.js`
- Test: `scripts/test-tracks.ts` (Frontend section)

**Interfaces:**
- Produces: Saturdays (index % 6 === 5) = the 13 timed reps of the spec (`kind: 'rep'`, 45–60 min; ids `fe:rep-<kebab>`, `covers` the JS-basics ids the spec maps to them, plus `mc:event-emitter`, `mc:promise-pool`, `mc:use-fetch`); weeks 11–13 weekdays include the 6 rehearsal reps (`mc:autocomplete`, `mc:data-table`, `mc:infinite-scroll`, `mc:file-explorer`, `mc:modal`, `mc:nested-comments`, text starts "Interview rehearsal (45 min, AI off):"); weeks 1–3 weekdays: rendering and React internals groups; week 4 weekdays start with the 4 FE SD concept slots; then the 12 designs (2 consecutive slots each: `sd:fe-<name>` and `sd:fe-<name>:deep-dive`) alternate with the remaining topic groups.

- [ ] **Step 1: Failing tests:** 78 slots, cat `fe`; 13 Saturday reps; 6 rehearsal reps all in weeks 11–13 weekdays; 12 designs each on 2 consecutive slots, all after the 4 concept slots; every FE id the spec maps to Frontend appears once (primary or `covers`), and none of `fe:node-runtime, fe:sql, fe:nosql, fe:redis, fe:queues, fe:docker-ci, fe:api-design, fe:os-networking`; no news task; no text contains "basics"; the 8 FE `sdm:` mocks are `covers` of the matching design's first slot.
- [ ] **Step 2: Run** — FAIL.
- [ ] **Step 3: Write `FRONTEND`** and `frontendTrack`.
- [ ] **Step 4: Run** `npm test`, link check — PASS.
- [ ] **Step 5: Commit** `feat(v3): senior Frontend track`

### Task 9: Coverage, cleanup and copy

**Files:**
- Create: `src/lib/content/v3-dropped.js` (`DROPPED`: `{ id, reason }[]` — every id the spec marks "dropped by owner choice" or "dropped as duplicate"), `scripts/test-v3-coverage.ts`
- Modify/Delete: remove the v2-only exports and modules no longer read (`ux.js`, `judgment.js` remainder, `mc.js` widget rows, `ai.js` except `AI_NEWS`, `fe.js`, `sd.js`) — move what's still read; `src/lib/plan-data.js`; `src/lib/timeline.ts` `STAGES` (one or two stages per v3 track, labels from the spec's group names); `src/lib/content/sundays.js` (`READINESS` = the spec's exact 5 texts, `WEEK8_REVIEW` text aligned with week 8); `src/lib/content/reference.js` (`BOARD_MAP` right-hand column and `FDE_STAGES` placements rewritten to v3 tracks); `scripts/test-content.ts`, `scripts/test-tracks.ts` (old v2 sections deleted); `README.md` (Plan section: the 7 tracks and recall, with times)
- Test: `scripts/test-v3-coverage.ts`

**Interfaces:**
- Consumes: every track module from Tasks 2–8.

- [ ] **Step 1: Failing test `test-v3-coverage.ts`:** read the frozen list `scripts/fixtures/v2-ids.json` (every `id` in every exported array of the v2 content modules, generated once in Step 3 by `git archive e9600f2 src/lib/content | tar -x -C <scratch dir>` and importing those files) and assert each is either a primary id, in some `covers`, or in `DROPPED` — and not in two of those; every `DROPPED` reason is one of `'owner choice'`, `'duplicate'`; no track item id twice across tracks; no task text in any track matches `/python|pandas/i`; every `after` target is at a lower Grind index; readiness texts equal the spec's.
- [ ] **Step 2: Run** — FAIL.
- [ ] **Step 3: Implement** the fixture (commit it with a one-line header comment in the generator script `scripts/gen-v2-ids.mjs`), `DROPPED`, the deletions and copy. Grep for removed exports before deleting (`grep -rn "<EXPORT>" src scripts`).
- [ ] **Step 4: Run** `npm test && npx tsc --noEmit && npm run build` (retry the build once on a Google Fonts fetch error) — PASS.
- [ ] **Step 5: Commit** `feat(v3): coverage test, v2 cleanup, readiness and reference text`

### Task 10: Smoke and final verification

**Files:**
- Modify: `scripts/smoke.mjs` (fixture `done` ids that no longer exist, e.g. `fe:execution-context` → `ai:math-intuition`; block-title and track-name assertions; the 75-min Saturday checks removed; add: Today on a study day shows "Recall + AI news" with 3 tasks; the Frontend evening block has no news; Setup timetable shows `05:15–06:15` for DSA; Steady DSA rest day shows the revisit; Roadmap timeline renders the 7 tracks)

- [ ] **Step 1: Update the smoke assertions.**
- [ ] **Step 2: Run** the smoke (`NEXT_DIST_DIR=.next-smoke npx next dev -p 3200`, then `SMOKE_URL=http://localhost:3200 node scripts/smoke.mjs <scratch shots dir>`) — Expected: `smoke passed`, 0 FAIL. Stop the server, delete `.next-smoke`, revert `tsconfig.json`.
- [ ] **Step 3: Run** `npm test`, `npx tsc --noEmit`, `npm run build`, `node scripts/check-links.mjs` — all pass, no new link failures.
- [ ] **Step 4: Commit** `test(v3): smoke covers the v3 plan`
