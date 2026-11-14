# Roadmap v2: content, DSA patterns, revision quizzes

Date: 2026-11-15 · Status: ready for the owner's approval (builder check done) · Companion page: brainstorm screen `roadmap-v5` · Research notes: sources listed at the end

## Intent and why

The owner wants to be hireable within 13 weeks as a **product engineer**, **forward-deployed engineer (FDE)** or **full-stack engineer**. They're a frontend developer in India with roughly 4–5 years of experience (assumed; it sets the LLD/HLD depth at SDE-2).

The 3 months are for **preparation**. Applying is optional and runs alongside.

The plan should leave them able to:
- make and explain engineering decisions;
- understand systems end to end;
- build and run AI features;
- solve any easy or medium coding problem, plus the classic hards, by **understanding the pattern rather than remembering answers**.

They asked for a "very well-focused roadmap" and repeated it: **no noise**.

### Why the current plan needs to change

What the research found (the owner has seen these findings):
- **The plan always tells you the topic.** The DSA block is ordered by NeetCode topic, so the owner never practises recognising a pattern in an unseen problem until day 61.
- **NeetCode 150 misses patterns.** It has no prefix-sum problems, and cyclic sort, two heaps, k-way merge, monotonic stack and fast/slow pointers are thin. It also misses Meta's most-asked problems.
- **The weighting is off for these roles.** DSA takes 30% of study time. Product engineer and FDE loops are decided by judgment, system understanding, practical coding, take-homes, decomposition and AI fluency.
- **Too little AI practice.** The AI block is heavy on papers and light on hands-on engineering: API behaviour, retrieval in depth, agents in production, and gateways/cost.
- **No test of whether learning has stuck.** There's nothing that checks revision.

## Goals

1. **Rebalance time** towards systems and AI. DSA aims at solid easy–medium plus the frequent hards.
2. **DSA by pattern:** every problem is tagged with a pattern and a tier (must-solve or optional), plus frequency flags. Each pattern has a short reference card and one best link. The owner can add their own problems with a pattern tag.
3. **Add a weekly judgment and system-understanding thread:** decision memos, "how it really works" deep dives, fixes in code you didn't write, practical coding, and decomposition.
4. **Fill the hands-on AI gaps.**
5. **Daily optional quizzes per section, plus a graded weekly test** from reliable, current, existing question sources, with a score trend over time.
6. **Readiness checks** that make "prepared" measurable.
7. **Two paces with the same content.** Steady is 4 months (17 weeks) and the default. Grind is 3 months (13 weeks).
8. **Depth in 4 areas** where AI-written code most often fails quietly, each with a few carefully chosen readings (§14).
9. **AI help using the owner's own API key,** with 3 expert personas, plus the option to save responses (§16).
10. **An "Explore later" library** outside the daily plan (§17).

## Non-goals

- UI and layout. A separate design follows once the content lands.
- Changing the Gist sync model or the update engine.
- Writing our own long explanations or our own question banks.

## Anti-goals: what would make this a failure even if it works

- **Noise.** A day must never show more than its list. Optional pools, stretch lists and extra links stay out of the daily plan unless the owner opens them. Each task has at most one link.
- **Stale or wrong content.** Examples: class-component React, IE-era trivia, JSONP, `document.write`, deprecated APIs, unsourced claims.
- **Memorisation.** DSA work that rewards remembering answers instead of recognising patterns.
- **Losing anything from the Whimsical board track.** Amazon structure, LPs, OA, LLD, HLD, advanced DSA and mocks all stay.
- **Losing the owner's existing progress.** See constraints.

## Constraints

- **Two modes, one content sequence** (§15).
  - **Steady**, the default: 17 weeks, about 8 study hours per weekday.
  - **Grind:** 13 weeks, on today's timetable (about 10.75 h). Grind's block times are the ones in §1.
  - Sundays follow §18 in both modes.
  - **Nothing is cut to save time in either mode.**
- **The owner hasn't started the plan.** They'll start on **Mon 16 Nov 2026**. v2 replaces the curriculum cleanly, with no migration of past days.
- **Task IDs.** IDs may be redesigned now. From v2 on, they must stay attached to their content, so future edits don't move progress around: explicit, content-based IDs, never position-based. The builder chooses the scheme.
- **Everything stays data in `src/lib/plan-data.js`** (plus new data files), used by `engine.ts`. The app is a static Next.js export.
- **Personal use.** Questions and content from public sources can be copied in directly; no licence checks (owner's instruction). Each item keeps its source link.

## Approaches considered

**Roadmap structure**
1. **Keep the block skeleton and engine (13 weeks in Grind, 17 in Steady); change the content and add data (chosen).** The structure works and the owner likes it.
2. Rebuild the curriculum around tracks. Rejected: it throws away a working structure.
3. Add a month 4. Originally rejected. After review, the owner chose a 4-month **Steady** mode as the default, with the 3-month **Grind** kept as an option (§15).

**DSA**
1. **Topic sets the order; pattern is the unit of practice, tracking and revision (chosen).** Patterns sit on top of data structures, so you learn the structure first.
2. Pattern-first order. Rejected: you keep hitting structures you haven't learned yet.
3. Topic only (today's plan). Rejected: it never trains recognition.

**Pattern explanations**
1. **A short card we write, plus one best existing link (chosen).**
2. Links only. Rejected: gaps (no free source for cyclic sort or interview-style union find) and no consistent card to revise from.
3. Our own full write-ups. Rejected: too much writing that would be hard to verify.

**Quiz grading**
1. **Mixed (chosen by the owner):** real multiple-choice where good existing MCQs exist, recall cards everywhere else.
2. Turn everything into multiple choice with distractors we write. Rejected: the owner doesn't want invented content.

## Design (decided)

### 1. Time budget (weekday, Grind mode; Steady is in §15)

Week numbers anywhere in this doc are **Grind weeks**. §15 maps them to Steady.

Block times stay. The contents are re-split as follows (total study time is unchanged at 10.75 h):

| Slot (unchanged times) | Before | Now |
|---|---|---|
| 05:15–07:15 Deep work 1 | DSA new, 2 h | **05:15–06:45 DSA must-solve (1.5 h)** + **06:45–07:15 AI build (30 min)** |
| 08:00–10:00 Deep work 2 | Frontend & CS | unchanged |
| 10:15–11:45 Deep work 3 | Machine coding / LLD / flagship | same block, new rhythm (§5) |
| 13:00–14:30 Deep work 4 | System design | unchanged slot, new order (§6) |
| 14:45–16:00 | DSA revision, 75 min | **14:45–15:15 DSA revision + recognition drill (30 min)** + **15:15–16:00 Judgment thread (45 min, §4)** |
| 16:00–17:00 Career | unchanged | starts the FDE reps earlier (§8) |
| 20:00–21:00 AI | papers and courses | applied-first (§7) |

Resulting share of study time: DSA 30% → 19%, systems and architecture 14% → 21% (plus the judgment thread), AI 9% → 14%.

Block titles in `schedule.js` and the calendar file update to match. The two split slots become two blocks each, with the same overall start and end times.

### 2. DSA

**Week 1 is foundations** (about 5 study days, morning block):
- Big-O as reasoning: "n = 10⁵ means I need n log n".
- Recursion and the call stack.
- Build these yourself in TypeScript with tests: dynamic array, hash map, linked list, stack/queue, binary heap, BST, trie, graph adjacency list, union-find.

The pattern work starts in week 1's last days or week 2. The builder fits the exact split.

**The patterns** (24, in teaching order; topic decides the order):
1. Hash map and counting
2. Prefix sum
3. Two pointers
4. Sliding window
5. Stack and monotonic stack/queue
6. Modified binary search
7. Cyclic sort
8. Fast and slow pointers
9. In-place linked-list reversal
10. Tree BFS
11. Tree DFS
12. Trie
13. Top K (heap)
14. Two heaps
15. K-way merge
16. Subsets and backtracking
17. Graph traversal and islands
18. Topological sort
19. Union find
20. Shortest path and MST
21. Intervals
22. Greedy
23. Dynamic programming, with sub-patterns tagged: Fibonacci, 0/1 knapsack, unbounded knapsack, LCS/strings, palindromes, grid
24. Bits and XOR

The advanced topics (Fenwick tree, segment tree, line sweep, difference array, DP on trees, digit DP) stay in the revision-era slot as they are now (`ADV_DSA`).

**Each pattern has:**
- `signal`: the cue in a question that points to this pattern.
- `template`: one line.
- `why it works`: the invariant, one line.
- `complexity`.
- `traps`: 1–2.
- `not this when`: 1 line.
- `link`: one best link.
- The owner's own notes for that pattern.

Card text is short and checked against the linked source.

**Links per pattern** (verified free, Nov 2026):

| Pattern | Link |
|---|---|
| Two pointers | hellointerview.com/learn/code/two-pointers/overview |
| Sliding window | hellointerview.com/learn/code/sliding-window/variable-length (and /fixed-length) |
| Prefix sum | hellointerview.com/learn/code/prefix-sum/overview |
| Monotonic stack | hellointerview.com/learn/code/stack/monotonic-stack |
| Heap patterns | hellointerview.com/learn/code/heap/overview |
| Intervals | hellointerview.com/learn/code/intervals/overview |
| Fast/slow and reversal | hellointerview.com/learn/code/linked-list/overview |
| Binary search | hellointerview.com/learn/code/binary-search/overview |
| Tree/graph DFS | hellointerview.com/learn/code/depth-first-search/fundamentals |
| Tree/graph BFS | hellointerview.com/learn/code/breadth-first-search/fundamentals |
| Backtracking | hellointerview.com/learn/code/backtracking/overview |
| Topological sort | hellointerview.com/learn/code/graphs/topological-sort |
| DP | hellointerview.com/learn/code/dynamic-programming/fundamentals |
| Greedy | hellointerview.com/learn/code/greedy/overview |
| Trie | hellointerview.com/learn/code/trie/overview |
| Union find | cp-algorithms.com/data_structures/disjoint_set_union.html |
| Fenwick tree | cp-algorithms.com/data_structures/fenwick.html |
| Segment tree | cp-algorithms.com/data_structures/segment_tree.html |
| Prefix sums, deeper | usaco.guide/silver/prefix-sums |
| Cyclic sort, hash map, bits, shortest path | No good free source. These use the card only, unless the builder finds a reliable one. NeetCode's per-problem videos stay on problems. |

**Tiers:**
- **Must-solve:** about 4 per pattern (about 90–100 in total).
  - Per pattern: 1 **teaching** problem, 2 **variations**, and 1 **unseen check** (shown with its title and topic hidden in the drill and on Sundays).
  - Prefer 🔥 problems when choosing.
  - Must-solve covers the 5 capstone hards (Trapping Rain Water, Minimum Window Substring, Merge k Sorted Lists, Find Median from Data Stream, Word Ladder).
  - Must-solve covers these frequent non-NeetCode problems: Subarray Sum Equals K, Minimum Remove to Make Valid Parentheses, Lowest Common Ancestor of a Binary Tree, Basic Calculator II, Next Permutation, Find Peak Element, Merge Sorted Array.
  - Only must-solve problems appear in the daily plan.
- **Optional:** everything else. That's the rest of NeetCode 150, the gap-fill problems not chosen as must-solve, and these frequent extras: Valid Palindrome II, Random Pick with Weight, Simplify Path, Reorganize String, Shortest Path in Binary Matrix, Majority Element, Longest Common Prefix, Nested List Weight Sum. It also includes the remaining hards.
  - Gap-fill problems: Continuous Subarray Sum, Range Sum Query – Immutable, First Missing Positive, Find All Numbers Disappeared in an Array, Sliding Window Median, IPO, Kth Smallest Element in a Sorted Matrix, Find K Pairs with Smallest Sums, Next Greater Element II, Online Stock Span, Middle of the Linked List, Palindrome Linked List, Reverse Linked List II, Accounts Merge.
  - Optional problems live only in each pattern's pool.
  - Nothing currently in the plan is deleted.

**Flags** come from LeetCode company tags for Google, Meta, Amazon and Microsoft (liquidslr/leetcode-company-wise-problems, data as of Oct 2025). The data source and its date are stored with the flag.
- **🔥 Frequent:** in the top 30 of 3 or more of the four companies.
  - All four: Two Sum, Best Time to Buy and Sell Stock, Subarray Sum Equals K, Merge Intervals.
  - Three: Add Two Numbers, Longest Substring Without Repeating Characters, Longest Palindromic Substring, 3Sum, LRU Cache, Number of Islands, Container With Most Water, Longest Common Prefix, Valid Parentheses, Merge Sorted Array, Majority Element, Maximum Subarray, Next Permutation, Trapping Rain Water, Median of Two Sorted Arrays.
- **⭐ Hard but frequent:** Trapping Rain Water, Median of Two Sorted Arrays, Merge k Sorted Lists, Sliding Window Maximum, Minimum Window Substring, N-Queens, Largest Rectangle in Histogram, Find Median from Data Stream, Word Ladder, Binary Tree Maximum Path Sum.

**Method** (task text on each must-solve problem):
- **Teaching problem:** brute force first; name the bottleneck; derive the pattern; write the template and why it works.
- **Variations:** before coding, write "pattern X because signal Y".
- **Every must-solve problem uses the round script:**
  1. 2–3 clarifying questions.
  2. Brute force and its complexity.
  3. A better approach, then wait for a "go".
  4. Code while talking.
  5. Test normal and edge cases before saying "done".
  6. Answer "what if the input were 10× bigger?"

  This matches the four graded dimensions: communication, problem solving, code, testing.
- **Explain-back:** fill in the pattern card from memory, then compare.

**Revision (30 min):**
- Blank-file re-solves of **teaching problems only** at +3, +7 and +21 days (replaces the +1/+3/+7/+14 re-solve of every problem).
- A 10-minute **recognition drill**: 3 problem statements from patterns already covered, mixed. Name the pattern and why; no code.

**Language:** TypeScript for DSA. Python for the practical-coding reps (§4).

**"Green" per pattern** (my call, after review):
- **The rule:** 2 problems you hadn't seen, solved within time (easy 15 / medium 25 / hard 40 min), plus one blank-file re-solve 7+ days later.
- **Where the unseen problems come from:**
  - the scheduled unseen check;
  - plus one of: a Sunday blind mock problem, a Phase 3 timed-set problem, an optional-pool problem, or one of the owner's own problems.
- **How it's recorded:** the owner logs it. Ticking a must-solve or pool problem lets them mark "unseen" and enter the minutes taken (optional field). Green is computed from those entries.
- No built-in timer is required.

**Own problems:** the owner can add a LeetCode link with a pattern tag and difficulty. It joins that pattern's pool and is synced like other state.

**Phase 3** (after the patterns are done, around week 10): the existing timed sets stay (Meta speed, Google doc, Amazon OA simulation, AI-enabled drill). They now draw from must-solve plus 🔥 problems, and the day's patterns are hidden.

### 3. Frequency of DSA in the week

Morning DSA runs Mon–Sat. The pattern sequence should finish by about week 9–10. The builder fits the 24 patterns and about 95 problems into the available morning slots.

### 4. Judgment thread (15:15–16:00, Mon–Sat)

Fixed weekly rhythm:

| Day | Rep | Count over 13 weeks |
|---|---|---|
| Mon | **How it really works:** read one engineering write-up, redraw the system from memory, name 3 trade-offs | 10, then repeats/mocks |
| Tue | **Decision memo:** 1 page with options, criteria, pick, and what would change your mind | 13 |
| Wed | **Practical coding** (45 min, timed; alternate TypeScript and Python) | 12 |
| Thu | **Decomposition or client simulation** (the FDE prompts move here from the career block, starting week 2) | 12 |
| Fri | **Code you didn't write:** this week's open-source issue (reproduce → hypothesise → isolate → verify; short postmortem). Finish on a revision Sunday if needed. Starts week 3. **Every 3rd Friday is a code-review rep instead:** review a real open-source PR, then compare with the maintainers' comments | 7 fixes + 4 reviews |
| Sat | **Alternates weekly.** Odd weeks: the **AI-assisted coding drill** (use the tool, verify, narrate). Even weeks: **practice that used to be on Sunday**. In Phase 1–2 that's the weekly timed mock, plus a speed pair from week 5 (2 must-solve problems you've already done, re-solved in 35 min). In Phase 3 it's the full mock loop. From week 4, a **peer mock every 2 weeks** with a real person (Pramp/Exponent peer mocks), rotating coding → frontend system design → behavioral → decomposition. On a peer-mock Saturday, the afternoon revision and judgment slots become the mock | 7 drills + 6 mock Saturdays |

- **How it really works** reads: Figma multiplayer; Linear sync engine; Stripe idempotency keys; Discord message storage; Slack real-time; Notion data model; Next.js/Vercel caching; Shopify Black Friday scale; Cloudflare's Nov 2025 outage postmortem; GitHub Copilot architecture. The builder links each to the company's own engineering blog post.
- **Decision memo** prompts:
  1. SSR vs CSR for a dashboard
  2. Postgres vs DynamoDB for chat
  3. RAG vs fine-tuning for support
  4. Build vs buy auth
  5. WebSocket vs SSE
  6. Monolith vs services at 5 engineers
  7. Polling vs webhooks for an integration
  8. Ship now vs fix tech debt
  9. One model vs routing
  10. Sync vs queue for an export
  11. Feature flag vs long-lived branch
  12. Cache vs read replica
  13. Offline-first or not
- **Practical coding** list: rate limiter; retry with exponential backoff and jitter; TTL cache with stale-while-revalidate; cancellable/debounced fetcher; merge two messy CSVs and report mismatches; parse a log file and answer 5 questions; streaming consumer with backpressure; small RAG pipeline; CLI tool; LRU cache; promise pool with a concurrency limit; webhook receiver with idempotency.
- **Open-source repos:** PostHog, Cal.com, Excalidraw (owner may swap). Pick `good first issue` / `bug` labels.
- The Saturday AI drill uses the existing `AI_DRILL` text.

### 5. Machine coding block (10:15–11:45)

Weekly rhythm:
- **Mon, Wed, Fri:** machine-coding builds (the 34 in `MC`, 90 min each).
- **Tue, Thu:** flagship project steps (the 20 in `PROJECT`), starting week 2.
- **Sat:** LLD (the 13 in `LLD`, unchanged).

Exceptions:
- **Weeks 7 and 10:** a **product engineer take-home simulation** runs Mon–Wed instead (3 blocks plus optional Sunday time). It's 4–8 h: polished, keyboard-first, accessible, with a README of trade-offs and a recorded walkthrough. The builder writes two briefs in the Linear/PostHog style.
- **From week 9:** timed second passes at 30–45 min of the 12 builds in `MC_TIMED`, two per block (Mon/Wed/Fri slots).
- **New builds:** 3 "match this screenshot" builds (45 min, pixel-accurate, responsive, accessible), in the Mon/Wed/Fri rotation in weeks 4–8.

**Fitting the lists** (my call, after review):
- **No build is dropped.** Small builds are paired in one 90-min block: accordion + tabs, star rating + OTP input, pagination + toast, modal + tooltip, event emitter + promise pool, debounced search + like button with optimistic UI. That gives 34 builds in about 28 slots.
- **The flagship's 20 steps fit 18 slots** by merging "product brief" with "UX wireframes", and "search + ⌘K" with "performance pass".

Flagship content is otherwise unchanged; it now runs weeks 2–11, at a learning pace.

### 6. System design block (13:00–14:30)

New order:
1. How the internet works.
2. Frontend system design: RADIO framework, the FE SD topics, the 12 FE designs.
3. HLD concepts (the existing 13), then the delivery framework and concepts-to-master.
4. **All 26 HLD problems,** core ones first: Bitly, rate limiter, Dropbox, WhatsApp, Ticketmaster, Facebook news feed, YouTube, web crawler, distributed cache, job scheduler, payment system, top-K leaderboard, Yelp, live comments, ad click aggregator. Then the other 11.
5. The 4 AI designs.
6. Mocks.

The `SD_MOCKS` rotation stays. Add a **numbers card** (latency, throughput and storage figures every engineer should know). Estimation items join the weekly test from week 5.

### 7. AI

**Keep:** 3Blue1Brown; Karpathy GPT build and LLM deep dive; Attention, InstructGPT, CoT, ReAct, RAG, Lost in the Middle; all build units; evals; OWASP; production; AI design; AI coding tools.

**No shrinking:** every paper keeps its current days (the owner's instruction: nothing compressed).

**New hands-on days** (6), in the 06:45 AI build slot:
- **LLM API fundamentals** (1): tokens and cost, temperature/top-p, context limits, stop reasons, rate limits, retries.
- **Retrieval that works** (2): chunking strategies, hybrid search (BM25 plus vectors), reranking, HNSW and vector-index trade-offs, measuring recall@k on the owner's RAG.
- **Agents in production** (2): build with an agent SDK (Claude Agent SDK or OpenAI Agents SDK), long-running jobs, context compaction, sandboxing, human approval.
- **LLM gateway** (1): fallbacks and routing, prompt and semantic caching, timeouts, a cost budget.

The AI build slot then also takes the build steps from the existing AI units, so the evening hour leans to understanding and reading. The builder sequences the slot.

### 8. Career block and the optional job lane

- Resume, pitch, story bank and Amazon LPs stay; they move earlier, with the LPs done by week 4.
- **Positioning text:** "product engineer who ships AI features", with FDE second.
- The FDE stage sessions stay as they are, including separate Terraform, Kubernetes and Spark/Airflow sessions. They stay at breadth level (§14).
- **Python moves to weeks 1–2** ("Python for JS devs" and pandas), before the first Python practical-coding rep.
- **Deep dives of your own past work** (weeks 2–4): 3 real projects from your jobs. Each covers an architecture sketch, trade-offs, metrics, your own part, and what you'd change, and is rehearsed as a 15-min talk with its list of drill-down questions.
- **Level calibration** (week 3): what L4/E4/SDE-2 vs L5/E5/senior must show, from public level guides. Then re-tag the story bank by the scope each story shows.
- **Offers and negotiation** (2 sessions, week 12 in Grind and week 16 in Steady): how pay is made up in India (base, joining bonus, RSUs and vesting, variable), levels.fyi, competing offers, and the recruiter call.
- **Company map:** add **Apple** (team-specific, deep frontend craft, a11y, performance, privacy, long project deep dive) and **Stripe** (bug squash, integration round, API design, code review).
- Decomposition and client simulation move to Thursday in the judgment thread (§4).
- **Product engineer prep:** for each target company, use the product and write a teardown with 3 improvements. That lands in the career block once `BEH` runs out, alongside the FDE items.
- **Applications are optional.** `APPLY` tasks become one Sunday option: "Optional: apply to 3–5 roles". No weekday application tasks.
- The plan suggests (doesn't require) a few low-stakes applications from week 8. Reason: 5+ real interviews correlate with higher phone-screen pass rates (interviewing.io).

### 9. Product & UX, Frontend & CS

- **UX:** unchanged (all 36 items).
- **FE:** keep all 48 topics, and add 1: Next.js caching, revalidation and RSC.
- **React internals at overview level** (owner's call):
  - The React topics (rendering and reconciliation, hooks, memo, concurrent React, RSC) each get a short summary card plus the existing link and practice.
  - They aren't deep-dive days.
  - Fiber and reconciler internals move to Explore later.
- **JS runtime fundamentals stay at working depth:** event loop, closures, `this`, promises, async. Frontend coding rounds test these directly, and they're the base for every async bug.
- **Machine coding additions:**
  - 3 "match this screenshot" builds: 45 min, pixel-accurate, responsive, accessible.
  - 4 code-review reps in the judgment thread (§4): review a real open-source PR, write your comments, compare them with the maintainers'.

### 10. Revision quizzes and weekly test

**Item types:**
- `mcq`: question, options, answer, explanation, source link.
- `recall`: prompt, source answer, source link. The owner answers first, reveals the answer, then marks **Nailed / Partial / Missed**.
- `pattern-id`: a real problem statement. The owner picks its pattern from 4 options. The wrong options are other patterns, so nothing is invented. Generated from the DSA tags.

**Each item also has:** `section` (a plan category: dsa, fe, sd, mc, ai, beh, fde, ux), `topics` (tags matching plan topics or task IDs, so a day's quiz pulls what that day covered), `source`, and `checked` (the date it was last verified as current and correct).

**Sources, by section** (quality-reviewed Nov 2026):

| Section | Source | Type |
|---|---|---|
| JS | lydiahallie/javascript-questions (65k ★) | mcq |
| JS | Front End Interview Handbook JS quiz (updated Oct 2026) | recall |
| React | sudheerj/reactjs-interview-questions. Keep only items that are current for function components, hooks and React 18/19. Drop class-component, legacy-context and old concurrent-mode items | recall |
| CSS / browser | Front End Interview Handbook CSS quiz | recall |
| CSS / browser | h5bp questions, answered from MDN or web.dev | recall |
| TypeScript | YauhenKavalchuk TS question list (prompts), answered from the TypeScript handbook | recall |
| Node | tshemsedinov Node.js questions (prompts), answered from nodejs.org docs | recall |
| System design, LLD | system-design-primer Anki decks: "System Design", "System Design Exercises", "OO Design" (`.apkg` files are SQLite; parse locally) | recall |
| DSA | Pattern-id items | pattern-id |
| DSA | interactive-coding-challenges Anki "Coding" deck | recall |
| DSA | Big-O facts from bigocheatsheet.com | mcq/recall |
| AI | amitshekhariitbhu/ai-engineering-interview-questions (3.7k ★, current), answered from the linked answer or primary docs (Anthropic/OpenAI docs, papers already in the plan) | recall |
| AI | KalyanKS LLM Q&A hub | recall |
| SQL | Beyond-LeetCode-SQL problems and pitfalls | recall |
| Behavioral | One prompt per Leadership Principle and per Googleyness/Meta theme, from sources already in `BEH`. Self-graded against a STAR checklist (situation, task, action with "I", measurable result, reflection) | recall |
| FDE / product | Existing decomposition and client-simulation prompts, graded against the plan's decomposition rubric (clarify first, user, data, scope, iterate) | recall |

**Excluded** (errors verified): Devinterview-io repos, aershov24/typescript-interview-questions.

**Curation rules** (sizes and staging are my call, after review):
- **"Checked"** means an AI-assisted check of the item against the primary doc (MDN, react.dev, TypeScript handbook, nodejs.org, provider docs) with that doc linked, plus a `checked` date.
  - The owner doesn't have to review items. Every item gets a "this is wrong / outdated" flag; flagged items leave rotation until they're fixed.
- **Sources with questions but no answers:** the answer is a short excerpt from the primary doc, with its link. It isn't our own explanation.
- **Drop anything outdated.**
- **Lean size:** about 5–10 items per plan topic, roughly 500 in total. Better too few than noise.
- **Ship in stages, following the plan's order:**
  1. The quiz engine, pattern-id items, Big-O, JS (lydiahallie plus the handbook), and the system-design-primer decks. That covers weeks 1–4.
  2. React, CSS, TypeScript and AI.
  3. Node, SQL, LLD, behavioral and FDE.

  Each stage has to land before the plan reaches that content. Weekly tests draw only from sections that have shipped.

**Daily quiz (optional):**
- One per section the day covered: 5 items, about 5 minutes.
- Drawn from items tagged with that day's topics, plus any items due again (below).
- Shown as one optional task, "Optional: quick quiz", at the end of each study block. It doesn't count towards hours or "behind".

**Weekly test (graded):**
- Sunday, in the fixed core (§18), 40 minutes.
- **Week 1 also has a baseline test** to compare every later score against: 2 timed DSA problems, a 20-item frontend quiz, and one 20-min mini system design.
- About 30 items, drawn from everything covered that week, spread across sections in proportion to the week's study time.
- **Score:** mcq and pattern-id right = 1, wrong = 0; recall Nailed = 1, Partial = 0.5, Missed = 0.
- Recorded per section and in total for each week, with history. Synced like other state.

**Items come back until learned:**
- A missed or partial item comes back in daily quizzes after 1, 3 and 7 days.
- It retires after two Nailed answers in a row.

### 11. Readiness checks (shown as Sunday checks; applying never required)

- **Week 4:** 3 past-project deep dives rehearsed; story bank of 12 stories; pitch recorded; pattern groups Arrays and Stack green; 3 decision memos; weekly test ≥ 70%.
- **Week 8:** Linked List, Trees and Heaps green; 4 open-source fixes submitted; flagship has real-time and 1 AI feature working; take-home 1 done.
- **Week 10:** 18 of the 24 patterns green; 6 decomposition reps.
- **Week 12:** all 24 patterns green; the top-12 machine-coding builds done in ≤ 45 min.
- **Week 13:** 3 full mock loops (product engineer, FDE, frontend SDE-2); flagship case study published; weekly test ≥ 80% for 3 weeks running.

If a check fails, it's suggested first in the next revision Sunday (§18). Rest time is never taken for it automatically.

**Week-8 review** (Grind week 8 / Steady week 10), a fixed Sunday task:
- Read the weekly-test trend, which patterns are green, the readiness checks, and the four depth tests (§14).
- Then rebalance the remaining weeks: move optional reps into weak areas and note what to drop to optional.
- Write the result as a Notes page.

### 12. Labels (inspired by Linear and Plane)

The owner wants to create their own labels and put several of them on anything. Today the app only marks a task "Yours" and has one `flags` mark.

**Model:**
- **A label** has `id`, `name`, `color`, and an optional `group`.
- **A label group** is either single-choice or multi-choice. In a single-choice group, only one of its labels can be on an item at a time; this is how Linear's label groups work. In a multi-choice group, several can be. Plane-style nested labels are covered by groups, so there's no deeper nesting.

**System labels** (built in and read-only, but they can be filtered on like any other):
- **Pattern** (single-choice): the 24 patterns. DP sub-patterns show as "DP · knapsack" and so on.
- **Tier** (single-choice): Must-solve, Optional.
- **Frequency:** 🔥 Frequent, ⭐ Hard but frequent.
- **Source:** Plan, Yours.
- **Flagged:** the existing `flags` re-solve mark, kept as it is so the Sunday re-solve logic works.
- **Depth:** marks tasks in the four depth areas (§14).

**Owner labels:**
- **Create, rename, recolour, delete:** labels and groups. Deleting a label removes it from every item.
- **Put on anything:** any number of labels on any plan task, DSA problem (plan or own), own task or quiz item.
- **Filter and search by label:** in Today, Roadmap, the DSA problem pool, and search.
- **Examples the owner might make:** "Weak", "Asked at Razorpay", "Revisit before onsite", "Loved it".

**Own problems and own tasks** take labels the same way, including a Pattern label. An own problem's Pattern label is what makes it count towards that pattern's green.

**Storage:**
- `State.labels` holds label definitions (owner labels only; system labels are data).
- `State.itemLabels` maps an item ID to a set of label IDs.
- Both sync through the Gist the same way existing maps do (one entry per item).

The UI for creating and applying labels belongs to the later UI design. This design only fixes the model and the rules above.

### 14. Depth areas: where to know things inside out

**The bar is application-level depth.** For each area, you can:
- explain why it behaves the way it does;
- predict how it fails;
- choose between the options;
- debug it;
- spot AI-written code that's subtly wrong.

Internals beyond that are breadth.

There are four areas. Tasks in them get a system label **Depth** (§12). Every Depth task ends with an explain-back. Depth topics are weighted ×2 in the weekly test, and they're the default subjects for decision memos and "how it really works" reads.

| Area | Where in the plan | Added reading (verified Nov 2026) | You're deep enough when you can… |
|---|---|---|---|
| **1. Data and state:** data modelling, indexes, transactions and isolation, caching and consistency, API design (idempotency, pagination, retries) | FE/CS SQL, NoSQL, Redis, queues, API design; SD concepts; practical coding; decision memos | **Use The Index, Luke** (Markus Winand, free, maintained): the index chapters, 2 FE/CS days. **Stripe, "Designing robust and predictable APIs with idempotency"** (Brandur Leach): 1 judgment-thread read. **Designing Data-Intensive Applications** (Kleppmann): the chapters on data models, storage and indexes, replication, and transactions, one evening each (4 AI-block evenings, or the FE block when its topics run out). | Name the race condition or stale-data bug in a design, and pick the fix and its cost |
| **2. Real-time and sync:** WebSockets/SSE, presence, CRDTs vs OT, offline-first, conflicts | Flagship real-time and offline steps; how-it-works (Figma, Linear, Slack); chat/doc/whiteboard designs | **Ink & Switch, "Local-first software"** (Kleppmann et al., 2019): 1 read before the flagship's real-time step. Yjs docs (already linked) | Explain what happens when two people edit offline and reconnect, and why your design handles it |
| **3. Building LLM applications:** retrieval, evals, tool and agent loops, cost and latency, failure handling | AI build slot, AI evening, FDE stages 5 and 7, AI designs, flagship AI steps | **"What We've Learned From A Year of Building with LLMs"** (applied-llms.org, Yan, Husain et al., 2024): 2 evenings. **Eugene Yan, "Patterns for Building LLM-based Systems & Products"**: 1 evening. Plus Anthropic's Building Effective Agents and Hamel's evals (already in the plan) | Take an AI feature that "sometimes gives wrong answers", find the cause with evals and traces, and fix it, with numbers |
| **4. Debugging and reading unfamiliar code** | Open-source fixes, re-engineering reps, the Meta AI drill, code-review reps | **Google SRE book, ch. 12 "Effective Troubleshooting"** (free): 1 read in week 3, before the first open-source fix | Find and explain a bug in a codebase you've never seen, in under an hour, with a clear write-up |

**Breadth only** (what it is, when to use it, its main trade-off):
- React internals (Fiber, reconciler)
- DSA beyond medium + the frequent hards
- transformer maths and the papers
- Kubernetes, Terraform, Spark, Airflow
- consensus internals (Raft)
- the full design-patterns catalogue
- data warehouses
- advanced DSA

The JS runtime fundamentals stay at working depth (§9).

### 15. Two modes: Steady (default) and Grind

- **Same content sequence and same item durations in both.** Each track gets the same number of slots in each mode, so nothing is cut or compressed.
- **Grind:** 13 weeks (78 study days), the §1 timetable, about 10.75 study hours per weekday.
- **Steady (default):** 17 weeks (102 study days), about 8 study hours per weekday.
  - Each day runs the same block types at their Grind durations, but not every block every day.
  - The rotating blocks (FE, machine coding, system design, judgment, career, AI evening) each run on about 76% of days (78 ÷ 102), so each still gets its 78 slots.
  - Daily habits run every day: DSA must-solve (until the pattern sequence ends), DSA revision with the recognition drill, the AI build slot, and the daily review.
  - The builder designs the rotation and the Steady timetable times.
- **Week mapping** for week-pinned items (take-homes, readiness checks, the week-8 review, negotiation):
  - Steady week = round(Grind week × 17/13).
  - So Grind 4 → Steady 5, 6 → 8, 7 → 9, 8 → 10, 10 → 13, 12 → 16, 13 → 17.
- **Choosing a mode:**
  - The mode is picked in Setup and stored in `State` (synced).
  - Switching mid-plan keeps everything already done. Only unfinished tasks are laid out again at the new pace, from today.
- The app name "Offer in 90" stays.

### 16. AI help using your own API key (BYOK)

- **Setup:**
  - The owner pastes their own API key.
  - Anthropic comes first, using the official `@anthropic-ai/sdk`. The builder checks the SDK's documented browser-use option, since the app is a static site that calls the API from the browser.
  - The model is picked in Setup. Default is `claude-opus-5-5` at effort `medium` (the model's default). Cheaper options are offered: `claude-sonnet-5-5`, `claude-haiku-5-5`.
  - **Any model, through four providers**, each behind a small adapter with the same interface: stream a reply to a system prompt plus messages.
    - **Anthropic:** official `@anthropic-ai/sdk`.
    - **OpenAI:** official SDK.
    - **Google Gemini:** official SDK.
    - **OpenRouter:** one key that reaches most other models.
  - The owner can save a key for each provider and picks provider + model in Setup. The persona prompts work the same with every provider.
  - Provider-specific extras apply only where they exist: refusal fallbacks and prompt caching for Anthropic, the provider's own caching elsewhere.
  - The builder confirms each SDK's documented option for calling from a browser (CORS) before wiring it.
  - Nothing is sold or promoted; there's no upsell.
- **How keys are handled:**
  - **Stored only in this browser** (`localStorage`). Never in `State`, never synced to the Gist, never in the repo or the build.
  - **Sent only to the chosen provider**, straight from the browser. There's no server of ours in between.
  - **A "Remember on this device" toggle.** When it's off, the key lives in `sessionStorage` and is gone when the tab closes.
  - **"Remove key" per provider.** Keys are never shown again after saving, only their last 4 characters.
  - **Setup says plainly:**
    - "Your key stays in this browser and goes only to <provider>."
    - Create a separate key for this app, with a monthly spend limit set in the provider's console.
  - **Guarding the page.** Anything that runs on the page could read the key, so:
    - add a Content-Security-Policy that limits `connect-src` to the provider API domains plus the existing ones (GitHub API for the Gist, the app's own JSON feeds);
    - keep `script-src` to `'self'`;
    - add no third-party scripts;
    - never write the key to logs or error messages.
- **The weekly engine doesn't use this key.**
  - The key lives in a browser, and the engine runs on GitHub's servers on a schedule, so it can't reach it.
  - The engine keeps its own repo secret. Today that's `CLAUDE_CODE_OAUTH_TOKEN`, from `claude setup-token` on the owner's own Claude account, so it's already the owner's credential, not a shared one.
  - Claude Code also accepts an `ANTHROPIC_API_KEY` secret instead, if the owner prefers paying per use.
  - Anyone who forks the repo sets their own secret, and the engine then runs on their account.
  - **For now the engine stays exactly as it is** (the owner's decision, 2026-11-15). Daily news and the weekly AI step are unchanged.
  - **Considered for later: a manual "Run this week's refresh" button.**
    - The Actions would keep only the no-AI collectors and publish their raw results.
    - The AI step would run in the browser on the BYOK key: four steps, a spend cap, results validated and saved to the Gist.
    - The button would sit in the Updates tab header and in Sunday's fixed core.
    - Not in this build.
- **Where it shows:**
  - An "Ask AI" action on any task, pattern card, quiz item, or Notes page.
  - The persona picker sits next to the input (3 personas, below).
- **Context sent with each question**, built by the app:
  - who the owner is (one paragraph from the Intent section);
  - which mode they're in and which day it is;
  - the item's text, track, topic, pattern card or quiz item, and its one link;
  - the owner's notes on that item (a toggle, on by default).
- **Calls:**
  - Responses stream.
  - Follow the current API guidance:
    - adaptive thinking (the default on this model);
    - check `stop_reason` before reading content;
    - turn on server-side refusal fallbacks (`fallbacks: "default"` under beta `server-side-fallback-2026-07-01`) and tell the owner they're on;
    - prompt caching on the stable persona prompt plus the context;
    - typed SDK errors, with a plain message for a bad key or a rate limit.
- **Saving:**
  - Any response can be saved to the item's note (`tnotes`) or to a Notes page, so it syncs like other notes.
  - Saved responses keep the persona name and date.
  - **Bookmarks:** any AI answer can also be bookmarked. It goes into the existing `State.bookmarks` (synced), as a new kind, "AI answer". The bookmark keeps the answer text, the persona, the item it was about, and the date, and it shows in the Bookmarks list alongside saved news, interview threads and plan updates.
  - Saved and bookmarked answers can take labels (§12).
  - Conversations that aren't saved or bookmarked are not stored.
- **Personas:** the system prompts are in the Appendix. Each is one shared base block plus the persona block. Owners can't edit them in v2; maybe later.

### 17. Explore later (replaces "Month 4")

- Outside the daily plan, so it adds no noise. It's a reference page grouped by area, with 1–3 trusted resources each.
- The Parking lot page stays for things the owner finds.
- Items can be labelled (§12), and moved into a day as an own task if the owner wants.

| Area | Contents |
|---|---|
| DSA | The optional pool and remaining hards; advanced topics (Fenwick, segment tree, line sweep, DP on trees, digit DP); LeetCode weekly contests; Striver A2Z for gaps |
| Systems | *Designing Data-Intensive Applications*, the rest of it; MIT 6.5840 distributed-systems labs; classic papers (Dynamo, Bigtable, Spanner, Raft); ByteByteGo and HighScalability |
| Frontend | "Inside look at a modern web browser" (Chrome team); React internals (Fiber, reconciler); Josh Comeau's CSS material; patterns.dev in depth; web performance deep dives |
| AI | Karpathy micrograd + makemore; fast.ai Practical Deep Learning; Chip Huyen's *AI Engineering*; Anthropic and OpenAI cookbooks; fine-tune a small model end to end |
| Infra | Kubernetes hands-on, Terraform deeper, Spark, a second cloud (GCP) |
| Product | *Shape Up* (Basecamp, free); *Inspired* (Cagan); Lenny's Newsletter archive |
| Career growth | *Staff Engineer* (Will Larson); The Pragmatic Engineer; open-source beyond the plan's fixes |
| Interview extras | Extra mock loops; company-specific lists for loops you've booked |

The builder checks each link before adding it, the same way as §14.

### 18. Sundays: active rest, or revision mode (per-Sunday toggle)

**Fixed core** (about 1.5 h, every Sunday):
- the weekly test (40 min, §10);
- the weekly reflection, with a **listen-back**: listen to one recording of yourself explaining something that week, and write one thing to change;
- a 10-minute preview of next week;
- readiness checks or the week-8 review, when due.

**Then one of two modes**, chosen per Sunday. The default is Active rest, and the choice is stored per date and synced.

- **Active rest (default):**
  - No new material and no practice problems.
  - Suggested, all optional and never counted as "behind": one Explore-later item, an engineering blog, a product teardown, time outside.
  - The morning walk/run stays.
- **Revision mode:** revision blocks, still with nothing new:
  - re-solve flagged problems;
  - quiz items due again;
  - recall cards for the week's topics;
  - re-read that week's pattern cards and decision memos;
  - catch up on missed tasks;
  - finish the week's open-source fix.

**Sunday read** (one per Sunday, suggested in both modes, 30–60 min, light):
- Read one real-world case study or paper.
- Then write 3 lines in Notes:
  - the real problem;
  - the key trade-off they made;
  - where you'd use the idea, or what you'd do differently.
- It's optional and never counts as "behind".
- The categories rotate: how a real app works, a real incident, a problem a whole industry faces, an AI paper, a classic systems paper.
- None of these repeat the Monday "how it really works" reads (§4).

| # | Category | Read | Source (checked Nov 2026) |
|---|---|---|---|
| 1 | How an app works | Uber: H3, the hexagonal spatial index behind pricing and dispatch (2018) | uber.com/blog/h3 |
| 2 | Real incident | GitLab: postmortem of the Jan 31, 2017 database outage (6 h of data lost, backups that didn't work) | about.gitlab.com/blog/postmortem-of-database-outage-of-january-31 |
| 3 | AI paper | OpenAI: "Why Language Models Hallucinate" (Kalai et al., Sep 2025), blog plus paper | openai.com/index/why-language-models-hallucinate · arXiv 2509.04664 |
| 4 | Industry problem | Swiggy: "A brief introduction to engineering challenges at Swiggy" (food delivery: assignment, ETAs, peaks) | bytes.swiggy.com/engineering-challenges-at-swiggy-430dea6c86a3 |
| 5 | Classic paper | Amazon Dynamo (SOSP 2007): availability over consistency, the paper behind DynamoDB and Cassandra | allthingsdistributed.com/2007/10/amazons_dynamo.html |
| 6 | How an app works | Linear: "How we built multi-region support for Linear" | linear.app/blog/how-we-built-multi-region-support-for-linear |
| 7 | Real incident | AWS us-east-1, Oct 19–20 2025: a race condition in DynamoDB's DNS automation that took down a large part of the internet | aws.amazon.com/message/101925 |
| 8 | Industry problem | Uber: DeepETA, predicting arrival times with deep learning (2022) | uber.com/blog/deepeta-how-uber-predicts-arrival-times |
| 9 | AI paper | Anthropic: "Tracing the thoughts of a large language model" (Mar 2025, interpretability) | anthropic.com/research/tracing-thoughts-language-model |
| 10 | How an app works | Swiggy: how Group Ordering was built (a shared cart in real time, 2024) | blog.swiggy.com/2024/08/31/heres-how-swiggy-built-the-group-ordering-feature |
| 11 | Real incident | CrowdStrike: Channel File 291 root-cause analysis (Jul 2024, the global Windows crash) | crowdstrike.com, the RCA PDF of 2024-08-06 |
| 12 | Industry problem | Razorpay: payment gateway uptime and SLAs (UPI concentration risk in Indian payments) | razorpay.com/blog/payment-gateway-uptime-slas |
| 13 | How an app works | Zomato with AWS: moving the billing platform from TiDB to DynamoDB | aws.amazon.com/blogs/database/unlocking-performance-scalability-and-cost-efficiency-of-zomatos-billing-platform-by-switching-from-tidb-to-dynamodb |
| 14 | Industry problem | Hotstar: scaling live cricket to 25M+ concurrent viewers (why autoscaling fails for spikes; game days) | blog.hotstar.com "Scaling the Hotstar Platform for 50M" (**builder: open and confirm the URL**) |
| 15 | How an app works | Linear: "Rebuilding the delta sync read path" (when Postgres reads stopped scaling) | linear.app/blog/rebuilding-delta-sync-read-path |

- **Grind** uses reads 1–13.
- **Steady** uses all 15, plus 2 more the builder picks from the same categories (one AI paper, one industry problem, for example healthcare or logistics), checked the same way.
- The weekly update engine flags any of these links that break.

**"Hot this week": a read the weekly engine finds by searching**
- The existing weekly GitHub Action (`refresh-engine.yml`, cron `30 23 * * 6`, Sunday 05:00 IST, `full` mode) gets one more job in `.github/prompts/refresh-engine.md`.
- **What it picks:** search the web for 1–2 reads that are hot this week or month, for the Sunday read slot.
  - **One AI paper or AI research post.** Look at signals such as Hugging Face daily papers, arXiv listings, Hacker News, Simon Willison's blog and Latent Space, plus the model labs' own research pages.
  - **Optionally, one case study or incident.** That's a new engineering-blog post from a real company, or a major public postmortem.
- **Rules:**
  - Published within the last 30 days.
  - A primary source (the paper, the lab or company post, the official postmortem). Never a summary site.
  - Readable in 30–60 min.
  - Relevant to someone who builds products, AI features or systems.
  - At least 2 independent trend signals, cited as URLs (for example an HN thread with real discussion, or an HF papers entry).
  - Not a duplicate of the curated list, an earlier hot read, or a plan link.
  - No hype, funding news or minor releases.
  - Zero picks is a fine result.
- **Where it looks.** Same pattern as `collect-interviews.mjs`: first a no-AI script gathers candidates with real engagement numbers, then Claude picks.
  - The new `scripts/collect-reads.mjs` writes `.engine/read-candidates.json`, with title, URL, date, source and engagement for each candidate. It runs in `refresh-engine.yml` before the Claude step. Its sources:
    - **Hugging Face daily papers** (`/api/daily_papers`, upvotes), already used by `fetch-news.mjs`.
    - **Hacker News** via the Algolia API: the last 7 days, points and comments, for papers, engineering posts and postmortems.
    - **Reddit, through the official API** (app-only OAuth, the same code path and secrets as `collect-interviews.mjs`): top posts of the week in r/MachineLearning, r/LocalLLaMA, r/ExperiencedDevs, r/programming and a few similar subs the builder picks, with score and comment counts.
      - **Today the `REDDIT_CLIENT_ID` / `REDDIT_CLIENT_SECRET` repo secrets aren't set**, so Reddit is skipped. That's true for the interview pulse too.
      - The owner creates a free Reddit "script" app and adds the two secrets. Then both features use Reddit.
    - **Lobsters** (public JSON).
    - **Engineering-blog RSS/Atom feeds,** for new case studies: Uber, Netflix, Stripe, Linear, Discord, Cloudflare, Figma, Swiggy Bytes, Zomato/Eternal, Razorpay, Airbnb, Meta and Google engineering, plus the AI labs' research pages (Anthropic, OpenAI, Google DeepMind) and Simon Willison.
    - **Bluesky** public post search, where many researchers now post, **if** its public search endpoint works without logging in. The builder checks this and skips it if it doesn't.
  - **X/Twitter:** there's no free API, and logging in or scraping isn't allowed (an existing engine rule). So X comes in only through web search (`site:x.com` results and pages anyone can open), the same way the interview pulse already uses X and LinkedIn. X posts count as a trend signal; a post is never itself the read.
  - Claude then also runs its own web search to confirm each pick, and finds the primary source behind a buzzing thread.
- **Output:** a new feed, `public/reads.json`:

  ```
  { generatedAt, items: [ { id: "YYYY-MM-DD-slug", weekOf, category: "ai-paper|case-study|incident|industry", title, url, why (1–2 plain sentences), readMinutes, publishedAt, trendSignals: [urls], sources: [urls] } ] }
  ```

  - New items are prepended.
  - At most 2 new items per run.
  - The feed keeps the last 26 weeks.
  - A new `scripts/validate-reads.mjs`, in the same style as `validate-updates.mjs`, runs in the workflow and in `deploy.yml`. The prompt's "only edit these files" rule gains `public/reads.json`.
- **In the app:**
  - That Sunday shows the curated read, plus one optional "🔥 Hot this week" item: the newest `reads.json` item for that week.
  - Both are optional and never count as "behind".
  - Done hot reads (and hot reads you skip) stay listed in an "Earlier hot reads" group in Explore later (§17).
  - If a hot paper also changes what the plan should teach, the engine can still add a normal `updates.json` item for it, as it does today. The two feeds stay separate.

**Rules:**
- Mocks, speed pairs and peer mocks are on Saturdays now (§4).
- "Optional: apply to 3–5 roles" shows as an optional Sunday item from week 8.
- Missed weekday tasks never take rest time automatically. They wait for a revision Sunday or roll into the week.
- **Burnout guard:** if the owner is more than 8 h behind, the app suggests a revision Sunday and shows optional tasks last. It never extends a day.

### 19. Other additions from the review

- **Interview environment practice** (Phase 3, short tasks):
  - code in CoderPad/HackerRank;
  - type in a Google Doc with no autocomplete;
  - draw in Excalidraw while talking;
  - check your camera and mic before a virtual onsite.
- **The ordering fix:** Python lands before the first Python rep (§8).

### 20. Focus rules (added to `FOCUS_RULES`)

- The daily plan shows only that day's list. Pools, stretch lists and quizzes stay optional and out of the way.
- One link per task.
- Everything else goes to the Parking lot.

## Left to the builder

- Exact must-solve selection per pattern, within the rules in §2.
- Exact day-by-day placement: 78 study days in Grind, 102 in Steady, including the Steady rotation and its timetable times.
- Checking the browser-use option of the Anthropic SDK, and the exact request shape for BYOK, against the current SDK docs.
- Small wording changes to the persona prompts. Their substance is decided.
- Choosing the per-item ID scheme that keeps progress attached to content.
- The two take-home briefs.
- Choosing the engineering-blog link for each "how it really works" item.
- Parsing and curating the question sources.
- Data file layout: where patterns, the question bank and flags live.
- The data shape for the owner's own problems and quiz results in `State`.
- Small wording.
- UI is out of scope here. The builder only needs data and engine support so a later UI design can show it.

## Sources

- **Market:**
  - Lenny's Newsletter, "State of the tech job market: late 2026"
  - techinterview.org AI tool policy tracker; Vercel, Linear and FDE guides
  - masaischool.com, FDE jobs in India
  - posthog.com hiring process
  - aced.io (formerly Exponent) FDE 2026 guide
  - fde.academy
  - Medium SDE-2 write-ups (Razorpay, Kotak, UiPath, Swiggy)
- **DSA:**
  - designgurus.io Grokking course and cheat sheet
  - seanprashad/leetcode-patterns
  - techinterviewhandbook.org: study plan, rubrics, cheatsheet
  - liquidslr/leetcode-company-wise-problems
  - hellointerview.com: Learn DSA, Meta AI-enabled coding
  - interviewing.io readiness post
  - cp-algorithms; USACO Guide
- **Questions:**
  - lydiahallie/javascript-questions; frontendinterviewhandbook.com
  - sudheerj/reactjs-interview-questions; h5bp/Front-end-Developer-Interview-Questions
  - YauhenKavalchuk/interview-questions; tshemsedinov/NodeJS-Interview-Questions
  - donnemartin/system-design-primer (flash_cards); donnemartin/interactive-coding-challenges
  - amitshekhariitbhu/ai-engineering-interview-questions; KalyanKS-NLP/LLM-Interview-Questions-and-Answers-Hub
  - shawlu95/Beyond-LeetCode-SQL; bigocheatsheet.com
- **Depth reading (§14):** use-the-index-luke.com; stripe.com/blog/idempotency; inkandswitch.com/essay/local-first; applied-llms.org; eugeneyan.com/writing/llm-patterns; sre.google/sre-book/effective-troubleshooting

- **Sunday reads (§18):** uber.com/blog/h3; uber.com/blog/deepeta-how-uber-predicts-arrival-times; about.gitlab.com postmortem (2017); aws.amazon.com/message/101925; CrowdStrike Channel File 291 RCA; openai.com/index/why-language-models-hallucinate; anthropic.com/research/tracing-thoughts-language-model; allthingsdistributed.com Dynamo; bytes.swiggy.com; blog.swiggy.com group ordering; razorpay.com/blog/payment-gateway-uptime-slas; AWS Database Blog (Zomato); linear.app/blog (multi-region, delta sync); blog.hotstar.com

## Appendix: AI persona prompts (§16)

### Shared base (prepended to every persona)

```
You're helping one engineer prepare, over a few focused months, for product engineer, forward-deployed engineer and full-stack roles at strong product companies and startups. They're an experienced frontend developer in India. They want to understand systems well enough to make good decisions and to direct AI tools confidently. They don't want to memorise answers.

The app gives you the context for this question below: the plan item, its topic, its link and the owner's notes. Stay on that topic. Depth matters more than breadth, and one clear idea matters more than five loose ones.

Be accurate. When you aren't sure, say so, and point to the primary documentation (MDN, react.dev, the TypeScript handbook, nodejs.org, the database's own docs, the model provider's docs) rather than guessing. Never invent links, APIs, numbers or quotes. Prefer the plan's linked resource when it answers the question.

Talk to them as a capable colleague would: direct, warm, no filler, no hype. Use short paragraphs. Use a small code sample or an ASCII/Mermaid sketch when it helps. Finish with one concrete next step they can take in the next 15 minutes.
```

### Persona 1: The Explainer (understand a topic)

```
Your job is to make the idea click and stay clicked.

Start from what the idea is for: the problem that made it necessary. Then build the mechanism step by step, from fundamentals they already know. Give one concrete example, ideally from real product engineering. Name the most common misconception and why it's wrong. Say where this idea breaks down or stops applying. Then ask one short question that checks they understood. If they answer, tell them honestly what was right and what was missing.

Pitch it at application level. They should come away able to explain why it behaves this way, predict how it fails, and choose between alternatives. Go deeper into internals only if they ask. If they seem lost, step back to a simpler foundation instead of adding detail.
```

### Persona 2: The Coach (break a problem down)

```
Your job is to help them solve it themselves. Coding problems, system design prompts and vague business problems all count.

Don't give the solution first. Begin by asking what they've tried or what they're thinking, unless they've already said. Then help with the smallest useful nudge, escalating only when they ask or stay stuck. Escalate in this order:
1. A clarifying question they should be asking.
2. What the brute force would be, and where it wastes work.
3. The signal in the problem that points to an approach, named as a pattern.
4. The approach in plain words, with its complexity.
5. Pseudocode.
6. Full code, only when they explicitly ask.

For a system design or decomposition problem, push them through the same structure: who the users are and what they need, the requirements and constraints, the core entities and data, the simplest design that works, then where it breaks and what it costs to fix.

When they share an attempt, review it the way a strong senior engineer would. Start with whether it's correct, then the edge cases, then the complexity, then clarity. Point out the single most important fix first.
```

### Persona 3: The Interviewer (practise under real conditions)

```
Your job is to run a realistic interview round on this topic at a strong product company, at mid-level (SDE-2 / L4 / E4) unless they ask for another level.

Say the format and time box in one line, then give the prompt as an interviewer would: slightly underspecified, so that clarifying questions are part of the test. Ask one thing at a time. Answer their clarifying questions briefly and consistently. While they work, stay mostly quiet, the way a real interviewer would. Help only if they're stuck for a long time, and give the kind of small hint a real interviewer gives. Push back on weak choices with follow-ups like "what happens at 10× the load?", "what if this call fails halfway?" and "why not the simpler option?". Don't accept hand-waving.

When they say they're done, or the time box ends, grade them honestly on the dimensions that round uses:
- **Coding:** communication, problem solving, code quality, testing.
- **System design:** requirements, design, trade-offs, depth, communication.
- **Behavioral:** situation clarity, personal ownership, impact with evidence, reflection.
- **Decomposition:** clarifying first, user focus, data, scoping, iterating.

Give each dimension a short verdict with evidence from what they said. Then give an overall signal (strong hire, hire, lean no, no), the 2 things that most helped them, and the 3 changes that would most raise the score next time. Be kind and specific. Don't inflate.
```
