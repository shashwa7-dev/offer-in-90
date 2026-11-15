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
  ['1 · Introduction', 'Roles, tiers, glossary (Delta, UAT, last-mile integration, Day 2 ops)', 'FDE sessions 1–2'],
  ['2 · CS basics', 'Python, DSA & system design, Git, Linux', 'Daily DSA + system design blocks; FDE sessions on Python, Git, Linux'],
  ['3 · Full stack', 'HTML, CSS, JS, React, Node, SQL, Postgres, NoSQL, API design, GraphQL', 'Daily frontend & CS block + machine coding'],
  ['4 · Data engineering', 'Data modeling, pipelines, warehouses, Spark, Airflow', 'FDE sessions (data audit, SQL, pipelines, warehouses)'],
  ['5 · AI engineering', 'LLM fundamentals, prompting, context engineering, RAG, vector DBs, providers, agents, MCP, AI coding tools, legacy integration', 'Evening AI block + FDE sessions on the gaps'],
  ['6 · DevOps & cloud', 'AWS/GCP/Azure, Terraform, Docker, Kubernetes, CI/CD', 'FDE sessions (AWS, Terraform, containers, CI/CD)'],
  ['7 · Production AI systems', 'Eval pipelines, debugging agents, inference optimization, security, AI governance, privacy, MLOps', 'FDE sessions + AI block (evals, observability)'],
  ['8 · Customer delivery & field skills', 'Discovery, scoping, business acumen, stakeholders, technical writing, executive reporting', 'FDE sessions + interview reps (decomposition, client simulation)'],
];

// Where every section of the Whimsical board lives in this plan.
export const BOARD_MAP = [
  ['Amazon interview structure (SDE-1 / SDE-2 rounds, bar raiser, HR)', 'Career block, week 1 (structure + all 16 Leadership Principles)'],
  ['Amazon OA: coding 70 min, work simulation, work-style MCQs', 'Career block (format, work simulation, work-style); Phase 3 DSA: OA simulations using all 16 OA posts from the board'],
  ['Amazon Leadership Principles + bar raiser reading links, STAR', 'Career block weeks 1–3: 2 LPs a day into the STAR story bank page'],
  ['DSA fast track: Arrays & Strings → LinkedList/Stack/Queue → Trees → Graphs → DP', 'Morning DSA block: NeetCode 150 in that topic order (the board\'s go-to list), weeks 1–9'],
  ['DSA resources: Blind 75, NeetCode 150, Striver A2Z, company-wise lists', 'NeetCode 150 daily (covers Blind 75); company-wise lists in Phase 3; Striver A2Z kept for filling gaps'],
  ['Success tips (VVIP): patterns, think out loud, 45-min time-box, review solutions, consistency', 'Rules card; 45-min time-box and flagging on every DSA block; spaced re-solving every afternoon'],
  ['Advanced DSA: DSU, difference array, line sweep, Fenwick, segment tree, DP on trees, digit DP', 'Revision block, every other day in weeks 7–9'],
  ['Consolidation: review solved problems, 2–3 timed 45-min mocks', 'Sunday weekly mocks + Phase 3 timed sets'],
  ['LLD roadmap: OOP, SOLID, design patterns, multithreading, LLD questions, 2+ mocks', 'Saturdays in the machine-coding block (13 sessions) + 8 LLD mocks in Phase 3 + LLD question bank page'],
  ['HLD roadmap: fundamentals, storage, communication, messaging, performance, reliability, observability, security', 'System design block, days 1–13 (day 1: how the internet works)'],
  ['HLD concepts to master + common mistakes', 'System design day 14 + framework card'],
  ['HLD delivery framework', 'System design day 15 + Roadmap card'],
  ['HLD questions: Easy / Medium / Hard (26 designs)', 'System design block, weeks 6–10 + Phase 3 mocks'],
  ['HLD learning resources (Primer, ByteByteGo, Hello Interview, Neo Kim, HighScalability)', 'Linked from each system design day + evening reading'],
  ['Frontend system design (Namaste FSD)', 'System design block, weeks 3–5 (framework + 12 frontend designs)'],
  ['(Not on the board) Forward-deployed engineer roadmap from roadmap.sh, 8 stages', 'FDE track in the career block, weeks 7–13; see the FDE roadmap card'],
  ['(Added) Flagship product, product & UX, AI system design, AI-enabled coding drills', 'Machine-coding block weeks 7–11, career block weeks 1–5, system design block, Sundays + Phase 3'],
  ['Mock interviews: Exponent free peer mocks, Topmate paid mocks', 'Sunday mock loops in Phase 3 + FDE mock; one paid Topmate mock before your first big-tech onsite'],
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
