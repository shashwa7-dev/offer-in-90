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

## Non-goals

- UI and layout. A separate design follows once the content lands.
- Changing the Gist sync model, the update engine, or the 13-week length.
- Writing our own long explanations or our own question banks.

## Anti-goals: what would make this a failure even if it works

- **Noise.** A day must never show more than its list. Optional pools, stretch lists and extra links stay out of the daily plan unless the owner opens them. Each task has at most one link.
- **Stale or wrong content.** Examples: class-component React, IE-era trivia, JSONP, `document.write`, deprecated APIs, unsourced claims.
- **Memorisation.** DSA work that rewards remembering answers instead of recognising patterns.
- **Losing anything from the Whimsical board track.** Amazon structure, LPs, OA, LLD, HLD, advanced DSA and mocks all stay.
- **Losing the owner's existing progress.** See constraints.

## Constraints

- **13 weeks, same daily timetable times** (`schedule.js` block times stay; block contents change). Sundays stay as they are: a mock, catch-up, the weekly block, then rest.
- **The owner hasn't started the plan.** They'll start on **Mon 16 Nov 2026**. v2 replaces the curriculum cleanly, with no migration of past days.
- **Task IDs.** IDs may be redesigned now. From v2 on, they must stay attached to their content, so future edits don't move progress around: explicit, content-based IDs, never position-based. The builder chooses the scheme.
- **Everything stays data in `src/lib/plan-data.js`** (plus new data files), used by `engine.ts`. The app is a static Next.js export.
- **Personal use.** Questions and content from public sources can be copied in directly; no licence checks (owner's instruction). Each item keeps its source link.

## Approaches considered

**Roadmap structure**
1. **Keep the 13-week block skeleton and engine; change the content and add data (chosen).** The structure works and the owner likes it.
2. Rebuild the curriculum around tracks. Rejected: it throws away a working structure.
3. Add a month 4. Rejected: the owner wants exactly 3 months.

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

### 1. Time budget (weekday)

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
| Fri | **Code you didn't write:** this week's open-source issue (reproduce → hypothesise → isolate → verify; short postmortem). Finish in Sunday catch-up if needed. Starts week 3 | 10 |
| Sat | **AI-assisted coding drill:** use the tool, verify and narrate | 13 |

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

**Fitting the lists** (my call, after review):
- **No build is dropped.** Small builds are paired in one 90-min block: accordion + tabs, star rating + OTP input, pagination + toast, modal + tooltip, event emitter + promise pool, debounced search + like button with optimistic UI. That gives 34 builds in about 28 slots.
- **The flagship's 20 steps fit 18 slots** by merging "product brief" with "UX wireframes", and "search + ⌘K" with "performance pass".

Flagship content is otherwise unchanged; it now runs weeks 2–11, at a learning pace.

### 6. System design block (13:00–14:30)

New order:
1. How the internet works.
2. Frontend system design: RADIO framework, the FE SD topics, the 12 FE designs.
3. HLD concepts (the existing 13), then the delivery framework and concepts-to-master.
4. **15 core HLD problems:** Bitly, rate limiter, Dropbox, WhatsApp, Ticketmaster, Facebook news feed, YouTube, web crawler, distributed cache, job scheduler, payment system, top-K leaderboard, Yelp, live comments, ad click aggregator.
5. The 4 AI designs.
6. Mocks.

The other 11 HLD problems become optional (in a pool, not in the daily plan). The `SD_MOCKS` rotation stays.

### 7. AI

**Keep:** 3Blue1Brown; Karpathy GPT build and LLM deep dive; Attention, InstructGPT, CoT, ReAct, RAG, Lost in the Middle; all build units; evals; OWASP; production; AI design; AI coding tools.

**Shrink:**
- GPT-3: 3 days → 1.
- Scaling laws + Chinchilla: 3 days → 1. Keep the "why models keep improving" write-up.

**New hands-on days** (6), in the 06:45 AI build slot:
- **LLM API fundamentals** (1): tokens and cost, temperature/top-p, context limits, stop reasons, rate limits, retries.
- **Retrieval that works** (2): chunking strategies, hybrid search (BM25 plus vectors), reranking, HNSW and vector-index trade-offs, measuring recall@k on the owner's RAG.
- **Agents in production** (2): build with an agent SDK (Claude Agent SDK or OpenAI Agents SDK), long-running jobs, context compaction, sandboxing, human approval.
- **LLM gateway** (1): fallbacks and routing, prompt and semantic caching, timeouts, a cost budget.

The AI build slot then also takes the build steps from the existing AI units, so the evening hour leans to understanding and reading. The builder sequences the slot.

### 8. Career block and the optional job lane

- Resume, pitch, story bank and Amazon LPs stay; they move earlier, with the LPs done by week 4.
- **Positioning text:** "product engineer who ships AI features", with FDE second.
- The FDE stage sessions stay. Terraform, Kubernetes, Spark and Airflow are concept-level only, merged into 1 session.
- Decomposition and client simulation move to Thursday in the judgment thread (§4).
- **Product engineer prep:** for each target company, use the product and write a teardown with 3 improvements. That lands in the career block once `BEH` runs out, alongside the FDE items.
- **Applications are optional.** `APPLY` tasks become one Sunday option: "Optional: apply to 3–5 roles". No weekday application tasks.
- The plan suggests (doesn't require) a few low-stakes applications from week 8. Reason: 5+ real interviews correlate with higher phone-screen pass rates (interviewing.io).

### 9. Product & UX, Frontend & CS

- **UX:** merge the 4 visual-design basics (hierarchy, typography, colour, layout) into 2 items. The rest stays.
- **FE:**
  - Add 1 topic: Next.js caching, revalidation and the RSC deep dive.
  - Compress Web Components and Canvas/SVG into 1 topic.
  - Compress "OS & networking" into the SD "how the internet works" day, as a reference.
  - Net count stays around 48.

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
- Sunday, the first 40 minutes of the 09:00 catch-up block.
- About 30 items, drawn from everything covered that week, spread across sections in proportion to the week's study time.
- **Score:** mcq and pattern-id right = 1, wrong = 0; recall Nailed = 1, Partial = 0.5, Missed = 0.
- Recorded per section and in total for each week, with history. Synced like other state.

**Items come back until learned:**
- A missed or partial item comes back in daily quizzes after 1, 3 and 7 days.
- It retires after two Nailed answers in a row.

### 11. Readiness checks (shown as Sunday checks; applying never required)

- **Week 4:** story bank of 12 stories; pitch recorded; pattern groups Arrays and Stack green; 3 decision memos; weekly test ≥ 70%.
- **Week 8:** Linked List, Trees and Heaps green; 4 open-source fixes submitted; flagship has real-time and 1 AI feature working; take-home 1 done.
- **Week 10:** 18 of the 24 patterns green; 6 decomposition reps.
- **Week 12:** all 24 patterns green; the top-12 machine-coding builds done in ≤ 45 min.
- **Week 13:** 3 full mock loops (product engineer, FDE, frontend SDE-2); flagship case study published; weekly test ≥ 80% for 3 weeks running.

If a check fails, the next Sunday's catch-up block starts with it.

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

### 13. Focus rules (added to `FOCUS_RULES`)

- The daily plan shows only that day's list. Pools, stretch lists and quizzes stay optional and out of the way.
- One link per task.
- Everything else goes to the Parking lot.

## Left to the builder

- Exact must-solve selection per pattern, within the rules in §2.
- Exact day-by-day placement across the 78 study days.
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
