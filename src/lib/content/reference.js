/* eslint-disable */
// Reference content (roadmap v2): the Roadmap › Reference page (focus rules, board rules, HLD framework, FDE roadmap,
// Whimsical board map), the OA posts used by Phase 3 OA simulations, and Explore later (§16, replaces "Month 4").
// Item shape for EXPLORE_LATER: { id, area, text, resources: [{ text, url }] }. IDs are content-based and must never change.
// The other lists keep their old tuple shapes, which roadmap-reference.tsx and engine.ts read. COMPANY_MAP lives in career.js.

// §19: the old 4 rules ("Month 4" is now Explore later) plus the 3 focus rules from §19.
export const FOCUS_RULES = [
  'Only use the links in this plan. If you find something new online, put it in the Parking lot page and look at it on Sunday, or in Explore later.',
  'No new courses, no new lists. NeetCode 150 + this plan is enough.',
  'Every day: finish the list, write the log. That is the only goal.',
  'Before any real interview: ask the recruiter which rounds allow AI tools, and in what format (doc, CoderPad, whiteboard).',
  "The daily plan shows only that day's list. Pools, stretch lists and quizzes stay optional and out of the way.",
  'One link per task.',
  'Everything else goes to the Parking lot.',
];

// §16 Explore later: outside the daily plan (no noise), a reference page grouped by area with 1–3 trusted resources each.
// `text` is the §16 contents; items can be labelled and moved into a day as an own task. Every URL checked 2026-11-15 with curl
// (LeetCode answers 403 to scripts; its contest page is the canonical URL). "Earlier hot reads" (§17) is added by the UI from reads.json.
const r = (text, url) => ({ text, url });
export const EXPLORE_LATER = [
  { id: 'xl:dsa', area: 'DSA', text: 'The optional pool and remaining hards; advanced topics (Fenwick, segment tree, line sweep, DP on trees, digit DP); LeetCode weekly contests; Striver A2Z for gaps',
    resources: [r('LeetCode weekly contests', 'https://leetcode.com/contest/'), r('CP-Algorithms: segment tree (and Fenwick, next to it)', 'https://cp-algorithms.com/data_structures/segment_tree.html'), r("Striver's A2Z DSA sheet", 'https://takeuforward.org/prep-hub/strivers-a2z-dsa-sheet')] },
  { id: 'xl:systems', area: 'Systems', text: 'Designing Data-Intensive Applications, the rest of it; MIT 6.5840 distributed-systems labs; classic papers (Dynamo, Bigtable, Spanner, Raft); ByteByteGo and HighScalability',
    resources: [r('Designing Data-Intensive Applications (Kleppmann)', 'https://dataintensive.net/'), r('MIT 6.5840 Distributed Systems (labs)', 'https://pdos.csail.mit.edu/6.824/'), r('HighScalability', 'https://highscalability.com/')] },
  { id: 'xl:frontend', area: 'Frontend', text: '"Inside look at a modern web browser" (Chrome team); React internals (Fiber, reconciler); Josh Comeau\'s CSS material; patterns.dev in depth; web performance deep dives',
    resources: [r('Inside look at a modern web browser (Chrome for Developers)', 'https://developer.chrome.com/blog/inside-browser-part1'), r('Josh W. Comeau', 'https://www.joshwcomeau.com/'), r('web.dev: Learn Performance', 'https://web.dev/learn/performance')] },
  { id: 'xl:ai', area: 'AI', text: "Karpathy micrograd + makemore; fast.ai Practical Deep Learning; Chip Huyen's AI Engineering; Anthropic and OpenAI cookbooks; fine-tune a small model end to end",
    resources: [r('Karpathy: micrograd', 'https://github.com/karpathy/micrograd'), r('fast.ai: Practical Deep Learning', 'https://course.fast.ai/'), r('Claude cookbooks (Anthropic)', 'https://github.com/anthropics/claude-cookbooks')] },
  { id: 'xl:infra', area: 'Infra', text: 'Kubernetes hands-on, Terraform deeper, Spark, a second cloud (GCP)',
    resources: [r('Kubernetes basics tutorial', 'https://kubernetes.io/docs/tutorials/kubernetes-basics/'), r('Terraform tutorials (HashiCorp)', 'https://developer.hashicorp.com/terraform/tutorials'), r('Google Cloud free tier', 'https://cloud.google.com/free')] },
  { id: 'xl:product', area: 'Product', text: "Shape Up (Basecamp, free); Inspired (Cagan); Lenny's Newsletter archive",
    resources: [r('Shape Up (Basecamp)', 'https://basecamp.com/shapeup'), r('Inspired (Marty Cagan, SVPG)', 'https://www.svpg.com/books/inspired-how-to-create-tech-products-customers-love-2nd-edition/'), r("Lenny's Newsletter", 'https://www.lennysnewsletter.com/')] },
  { id: 'xl:career-growth', area: 'Career growth', text: "Staff Engineer (Will Larson); The Pragmatic Engineer; open-source beyond the plan's fixes",
    resources: [r('Staff Engineer (Will Larson)', 'https://staffeng.com/book/'), r('The Pragmatic Engineer', 'https://newsletter.pragmaticengineer.com/')] },
  { id: 'xl:interview-extras', area: 'Interview extras', text: "Extra mock loops; company-specific lists for loops you've booked",
    resources: [r('Peer mocks (Exponent)', 'https://www.tryexponent.com/practice'), r('Hello Interview', 'https://www.hellointerview.com/')] },
];

export const RULES = [
  ['Patterns over memorization', 'Most problems are variations of 15–20 patterns. Learn the pattern, not the answer.'],
  ['Think out loud', 'Say your approach, edge cases and complexity while you code. Every time.'],
  ['Time-box 45 minutes', 'Stuck after 45 min? Read the solution, understand it, flag it, re-solve later.'],
  ['Review even when correct', 'Read 2 other solutions. Note time and space trade-offs.'],
  ['Consistency over intensity', 'Finish today\'s list. Missed something? Sunday catch-up handles it. Never skip two days.'],
];

export const HLD_FRAMEWORK = [
  ['Requirements', '~5 min', 'Top 3 functional features; quantify non-functional (latency, availability, CAP choice).'],
  ['Core entities', '~2 min', 'Main nouns: users, objects, events.'],
  ['API', '~5 min', 'REST by default. User comes from the auth token, never the body.'],
  ['Data flow', '~5 min', 'Only if useful: ingest → process → store → serve.'],
  ['High-level design', '~10–15 min', 'Boxes and arrows that meet the core requirements. Start simple.'],
  ['Deep dives', '~10 min', 'Scale, caching, sharding, consistency, failure modes, hot keys.'],
];

const RM = 'https://roadmap.sh/forward-deployed-engineer';
export const FDE_STAGES = [
  ['1 · Introduction', 'Roles, tiers, glossary (Delta, UAT, last-mile integration, Day 2 ops)', 'Career, week 7: stage 1 intro and glossary (one slot)'],
  ['2 · CS basics', 'Python, DSA & system design, Git, Linux', 'DSA every day; Systems; Platform weeks 1–3 (shell, git workflows and internals). The Python part is left out: the plan is TypeScript only'],
  ['3 · Full stack', 'HTML, CSS, JS, React, Node, SQL, Postgres, NoSQL, API design, GraphQL', 'Frontend (senior, evenings); the flagship; Platform: SQL, Postgres, NoSQL, the Node runtime; Systems: API design'],
  ['4 · Data engineering', 'Data modeling, pipelines, warehouses, Spark, Airflow', 'Platform depth: SQL analysis, pipelines and orchestration, warehouses, data audit and modeling'],
  ['5 · AI engineering', 'LLM fundamentals, prompting, context engineering, RAG, vector DBs, providers, agents, MCP, AI coding tools, legacy integration', 'AI engineering core slots 18–42 (APIs, prompting and context, MCP, providers, RAG, vector indexes, agents) and 70 (AI-assisted coding); Platform: legacy integration'],
  ['6 · DevOps & cloud', 'AWS/GCP/Azure, Terraform, Docker, Kubernetes, CI/CD', 'Platform: Docker, Kubernetes on kind, Terraform, CI/CD and safe rollouts, AWS core'],
  ['7 · Production AI systems', 'Eval pipelines, debugging agents, inference optimization, security, AI governance, privacy, MLOps', 'AI engineering core: eval pipelines (34), debugging agents (42), inference optimization (50), guardrails, OWASP LLM, MLOps, governance and privacy (56–59)'],
  ['8 · Customer delivery & field skills', 'Discovery, scoping, business acumen, stakeholders, technical writing, executive reporting', 'Career weeks 7–13: discovery, scoping, business acumen, stakeholders, communication, decomposition and client-simulation reps, the FDE take-home and mock loop'],
];

// Where every section of the Whimsical board lives in this plan (v3 tracks).
export const BOARD_MAP = [
  ['Amazon interview structure (SDE-1 / SDE-2 rounds, bar raiser, HR)', 'Career, week 2 (structure), then weeks 2–4 (the 16 Leadership Principles)'],
  ['Amazon OA: coding 70 min, work simulation, work-style MCQs', 'Career, week 1 (format, work simulation, work style); all 16 OA posts from the board: 8 DSA Phase 3 simulations and 8 Saturday coding rounds'],
  ['Amazon Leadership Principles + bar raiser reading links, STAR', 'Career weeks 2–4: Leadership Principle stories into the STAR story bank page'],
  ['DSA fast track: Arrays & Strings → LinkedList/Stack/Queue → Trees → Graphs → DP', 'DSA block: 27 patterns, 2 days each (a teach problem, then an unseen one), weeks 1–10'],
  ['DSA resources: Blind 75, NeetCode 150, Striver A2Z, company-wise lists', 'Must-solves: a teach and an unseen problem per pattern; company-wise lists feed the Phase 3 Google and Meta sets; the rest is the optional pool on the DSA page'],
  ['Success tips (VVIP): patterns, think out loud, 45-min time-box, review solutions, consistency', 'Rules card; 45-min time-box and flagging on every DSA block; spaced re-solving every afternoon'],
  ['Advanced DSA: DSU, difference array, line sweep, Fenwick, segment tree, DP on trees, digit DP', 'DSA Phase 3: 3 awareness slots (difference array + line sweep, Fenwick + segment tree, DP on trees + digit DP); DSU is the union-find pattern'],
  ['Consolidation: review solved problems, 2–3 timed 45-min mocks', 'DSA Phase 3: timed Google, Meta and revisit sets and OA simulations; Saturday mock day'],
  ['LLD roadmap: OOP, SOLID, design patterns, multithreading, LLD questions, 2+ mocks', 'Product, Saturdays: 13 LLD sessions; the LLD round of each Phase 3 mock loop; LLD question bank page'],
  ['HLD roadmap: fundamentals, storage, communication, messaging, performance, reliability, observability, security', 'Systems, weeks 1–2 (computers, networking, HLD fundamentals), then DDIA and the building blocks'],
  ['HLD concepts to master + common mistakes', 'Systems slot 11 + framework card'],
  ['HLD delivery framework', 'Systems slot 10 + Roadmap card'],
  ['HLD questions: Easy / Medium / Hard (26 designs)', 'Systems: Bitly at slot 12, 17 more designs in weeks 3–9, the last 8 as timed mocks in weeks 10–13'],
  ['HLD learning resources (Primer, ByteByteGo, Hello Interview, Neo Kim, HighScalability)', 'Linked from each Systems slot (the System Design Primer as the free second link)'],
  ['Frontend system design (Namaste FSD)', 'Frontend (evenings): 4 concept slots, then 12 designs, 2 slots each'],
  ['(Not on the board) Forward-deployed engineer roadmap from roadmap.sh, 8 stages', 'Career (weeks 7–13), Platform and the AI engineering core; see the FDE roadmap card'],
  ['(Added) Flagship product, product & UX, AI system design, AI-enabled coding drills', 'Product: the flagship, with the 6 product basics; AI engineering core: 8 AI designs and 3 timed mocks; Career: 5 AI-enabled coding drills on odd Saturdays'],
  ['Mock interviews: Exponent free peer mocks, Topmate paid mocks', 'Saturday mock day: peer mocks every 2 weeks from week 4, 4 full mock loops in weeks 10–13; one paid Topmate mock before your first big-tech onsite'],
];

// Amazon OA posts from the board, used by the Phase 3 OA simulations.
export const OA_LINKS = [
  'https://leetcode.com/discuss/post/7112319/amazon-oa-sde-august-2025-by-anonymous_u-o8ee/',
  'https://leetcode.com/discuss/post/6438689/amazon-oa-question-sde-ii-by-anonymous_u-ujke/',
  'https://leetcode.com/discuss/post/6333650/amazon-oa-experience-sde1-seattle-by-ano-mnny/',
  'https://leetcode.com/discuss/post/6331313/amazon-oa-2025-sde-by-anonymous_user-eplv/',
  'https://leetcode.com/discuss/post/6296159/amazon-oa-question-and-answer-by-anonymo-x6s9/',
  'https://leetcode.com/discuss/post/6225872/amazon-oa-questions-2025-sde2-by-anonymo-qrs8/',
  'https://leetcode.com/discuss/post/5916346/amazon-oa-by-imeth21387-xsmc/',
  'https://leetcode.com/discuss/post/5895561/amazon-sde-1-oa-by-anonymous_user-5i2y/',
  'https://leetcode.com/discuss/post/5011657/amazon-oa-new-grad-by-anonymous_user-fdah/',
  'https://leetcode.com/discuss/post/4846016/amazon-oa-by-anonymous_user-cfeu/',
  'https://leetcode.com/discuss/post/4749861/amazon-oa-by-anonymous_user-1yoe/',
  'https://leetcode.com/discuss/post/4660709/amazon-oa-recent-questions-sharing-for-t-8ze5/',
  'https://leetcode.com/discuss/post/2180363/amazon-oa-by-anonymous_user-xrnn/',
  'https://leetcode.com/discuss/post/1737071/amazon-oa-sde-90-min-by-anonymous_user-w7gp/',
  'https://www.reddit.com/r/leetcode/comments/1htdjbf/amazon_oa_questions_w_solutions/',
  'https://www.reddit.com/r/leetcode/comments/1kx4zs4/just_got_bodied_by_the_amazon_sde_ii_oa_sharing/',
];

// §13 depth areas: where to know things inside out. Tasks in them carry the system label Depth. `test` is the "deep enough when you can…" bar.
export const DEPTH_AREAS = [
  { id: 'depth:data-state', area: 'Data and state', where: 'Platform SQL, NoSQL, Redis and queues; Systems HLD fundamentals and DDIA; Platform practical reps', test: 'Name the race condition or stale-data bug in a design, and pick the fix and its cost' },
  { id: 'depth:realtime-sync', area: 'Real-time and sync', where: 'Flagship real-time and offline steps; Systems case studies (Figma, Linear, Slack); Frontend chat, collaborative editor and whiteboard designs', test: 'Explain what happens when two people edit offline and reconnect, and why your design handles it' },
  { id: 'depth:llm-apps', area: 'Building LLM applications', where: 'AI engineering core, the 8 AI designs, the flagship AI steps', test: 'Take an AI feature that "sometimes gives wrong answers", find the cause with evals and traces, and fix it, with numbers' },
  { id: 'depth:debugging', area: 'Debugging and reading unfamiliar code', where: 'Platform re-engineering round and code-review reps, the AI-enabled coding drills, Frontend real-world debugging slots', test: 'Find and explain a bug in a codebase you\'ve never seen, in under an hour, with a clear write-up' },
];
