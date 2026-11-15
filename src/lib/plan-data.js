/* eslint-disable */
// Curriculum data. Moved content lives in src/lib/content/*.js with content-based ids (<prefix>:<slug>); this file adapts it to the
// old shapes that engine.ts reads until Task 8. engine.ts still derives positional task ids (p-<slug>, fe-N, ai-N, ...) from these shapes.
// 90-day curriculum. Built from the "Amazon Interview Prep by AnubhavInTech" Whimsical board,
// extended for frontend / full-stack loops at Google, Meta, Microsoft, Amazon.

import { ADV_DSA } from './content/dsa.js';
import { FE as FE_NEW } from './content/fe.js';
import { UX as UX_NEW } from './content/ux.js';
import { BEH as BEH_NEW, FDE as FDE_NEW, COMPANY_MAP } from './content/career.js';
import { AIB_MOVED, AIB, AI_EVENING, AI_REVIEW as AI_REVIEW_NEW } from './content/ai.js';
import { MC as MC_NEW, MC_TIMED as MC_TIMED_NEW, PROJECT as PROJECT_NEW, LLD as LLD_NEW } from './content/mc.js';
import { SD as SD_NEW, SD_MOCKS as SD_MOCKS_NEW } from './content/sd.js';

// Adapter (Task 4a): the content files hold the new { id, text, ... } items; engine.ts still reads the old tuples until Task 8 rewrites it.
// FDE: the Python and Stage-6 cloud items moved to ai.js; they are put back at their original positions so the old engine keeps its order.
const aibById = id => AIB_MOVED.find(x => x.id === id);
const FDE_BACK = {
  'fde:decomposition-framework': ['aib:python-for-js', 'aib:pandas'].map(aibById),
  'fde:reengineering-round': ['aib:aws', 'aib:terraform', 'aib:containers', 'aib:devops'].map(aibById),
};
const FE = FE_NEW.map(x => [x.text, x.practice, x.url]);
const UX = UX_NEW.map(x => [x.text, x.url || '']);
const BEH = BEH_NEW.map(x => [x.text, x.url || '']);
const FDE = FDE_NEW.flatMap(x => [x, ...(FDE_BACK[x.id] || [])]).map(x => [x.text, x.url || '']);

const LC = s => `https://leetcode.com/problems/${s}/`;
const NC = s => `https://neetcode.io/problems/${s}`;

// NeetCode 150 in learning order: [topic, [[slug, difficulty, premiumNeetcodeSlug?]]]
const DSA_TOPICS = [
  ['Arrays & Hashing', [['contains-duplicate','E'],['valid-anagram','E'],['two-sum','E'],['group-anagrams','M'],['top-k-frequent-elements','M'],['encode-and-decode-strings','M','string-encode-and-decode'],['product-of-array-except-self','M'],['valid-sudoku','M'],['longest-consecutive-sequence','M']]],
  ['Two Pointers', [['valid-palindrome','E'],['two-sum-ii-input-array-is-sorted','M'],['3sum','M'],['container-with-most-water','M'],['trapping-rain-water','H']]],
  ['Sliding Window', [['best-time-to-buy-and-sell-stock','E'],['longest-substring-without-repeating-characters','M'],['longest-repeating-character-replacement','M'],['permutation-in-string','M'],['minimum-window-substring','H'],['sliding-window-maximum','H']]],
  ['Stack', [['valid-parentheses','E'],['min-stack','M'],['evaluate-reverse-polish-notation','M'],['generate-parentheses','M'],['daily-temperatures','M'],['car-fleet','M'],['largest-rectangle-in-histogram','H']]],
  ['Binary Search', [['binary-search','E'],['search-a-2d-matrix','M'],['koko-eating-bananas','M'],['find-minimum-in-rotated-sorted-array','M'],['search-in-rotated-sorted-array','M'],['time-based-key-value-store','M'],['median-of-two-sorted-arrays','H']]],
  ['Linked List', [['reverse-linked-list','E'],['merge-two-sorted-lists','E'],['linked-list-cycle','E'],['reorder-list','M'],['remove-nth-node-from-end-of-list','M'],['copy-list-with-random-pointer','M'],['add-two-numbers','M'],['find-the-duplicate-number','M'],['lru-cache','M'],['merge-k-sorted-lists','H'],['reverse-nodes-in-k-group','H']]],
  ['Trees', [['invert-binary-tree','E'],['maximum-depth-of-binary-tree','E'],['diameter-of-binary-tree','E'],['balanced-binary-tree','E'],['same-tree','E'],['subtree-of-another-tree','E'],['lowest-common-ancestor-of-a-binary-search-tree','M'],['binary-tree-level-order-traversal','M'],['binary-tree-right-side-view','M'],['count-good-nodes-in-binary-tree','M'],['validate-binary-search-tree','M'],['kth-smallest-element-in-a-bst','M'],['construct-binary-tree-from-preorder-and-inorder-traversal','M'],['binary-tree-maximum-path-sum','H'],['serialize-and-deserialize-binary-tree','H']]],
  ['Tries', [['implement-trie-prefix-tree','M'],['design-add-and-search-words-data-structure','M'],['word-search-ii','H']]],
  ['Heap / Priority Queue', [['kth-largest-element-in-a-stream','E'],['last-stone-weight','E'],['k-closest-points-to-origin','M'],['kth-largest-element-in-an-array','M'],['task-scheduler','M'],['design-twitter','M'],['find-median-from-data-stream','H']]],
  ['Backtracking', [['subsets','M'],['combination-sum','M'],['combination-sum-ii','M'],['permutations','M'],['subsets-ii','M'],['word-search','M'],['palindrome-partitioning','M'],['letter-combinations-of-a-phone-number','M'],['n-queens','H']]],
  ['Graphs', [['number-of-islands','M'],['max-area-of-island','M'],['clone-graph','M'],['walls-and-gates','M','islands-and-treasure'],['rotting-oranges','M'],['pacific-atlantic-water-flow','M'],['surrounded-regions','M'],['course-schedule','M'],['course-schedule-ii','M'],['graph-valid-tree','M','valid-tree'],['number-of-connected-components-in-an-undirected-graph','M','count-connected-components'],['redundant-connection','M'],['word-ladder','H']]],
  ['Advanced Graphs', [['network-delay-time','M'],['min-cost-to-connect-all-points','M'],['cheapest-flights-within-k-stops','M'],['reconstruct-itinerary','H'],['swim-in-rising-water','H'],['alien-dictionary','H','foreign-dictionary']]],
  ['1-D Dynamic Programming', [['climbing-stairs','E'],['min-cost-climbing-stairs','E'],['house-robber','M'],['house-robber-ii','M'],['longest-palindromic-substring','M'],['palindromic-substrings','M'],['decode-ways','M'],['coin-change','M'],['maximum-product-subarray','M'],['word-break','M'],['longest-increasing-subsequence','M'],['partition-equal-subset-sum','M']]],
  ['2-D Dynamic Programming', [['unique-paths','M'],['longest-common-subsequence','M'],['best-time-to-buy-and-sell-stock-with-cooldown','M'],['coin-change-ii','M'],['target-sum','M'],['interleaving-string','M'],['edit-distance','M'],['longest-increasing-path-in-a-matrix','H'],['distinct-subsequences','H'],['burst-balloons','H'],['regular-expression-matching','H']]],
  ['Greedy', [['maximum-subarray','M'],['jump-game','M'],['jump-game-ii','M'],['gas-station','M'],['hand-of-straights','M'],['merge-triplets-to-form-target-triplet','M'],['partition-labels','M'],['valid-parenthesis-string','M']]],
  ['Intervals', [['meeting-rooms','E','meeting-schedule'],['insert-interval','M'],['merge-intervals','M'],['non-overlapping-intervals','M'],['meeting-rooms-ii','M','meeting-schedule-ii'],['minimum-interval-to-include-each-query','H']]],
  ['Math & Geometry', [['happy-number','E'],['plus-one','E'],['rotate-image','M'],['spiral-matrix','M'],['set-matrix-zeroes','M'],['powx-n','M'],['multiply-strings','M'],['detect-squares','M']]],
  ['Bit Manipulation', [['single-number','E'],['number-of-1-bits','E'],['counting-bits','E'],['reverse-bits','E'],['missing-number','E'],['sum-of-two-integers','M'],['reverse-integer','M']]],
];
const NAME_FIX = { '3sum': '3Sum', 'powx-n': 'Pow(x, n)', 'implement-trie-prefix-tree': 'Implement Trie (Prefix Tree)', 'two-sum-ii-input-array-is-sorted': 'Two Sum II (Sorted Input)', 'lru-cache': 'LRU Cache', 'kth-smallest-element-in-a-bst': 'Kth Smallest Element in a BST', 'number-of-1-bits': 'Number of 1 Bits', 'n-queens': 'N-Queens', 'house-robber-ii': 'House Robber II', 'coin-change-ii': 'Coin Change II', 'jump-game-ii': 'Jump Game II', 'combination-sum-ii': 'Combination Sum II', 'subsets-ii': 'Subsets II', 'course-schedule-ii': 'Course Schedule II', 'meeting-rooms-ii': 'Meeting Rooms II', 'word-search-ii': 'Word Search II' };
const prettify = s => NAME_FIX[s] || s.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ').replace(/\b(Of|In|A|An|The|To|From|And|With|By|On)\b/g, m => m.toLowerCase()).replace(/^./, c => c.toUpperCase());
const DSA = [];
DSA_TOPICS.forEach(([topic, list]) => list.forEach(([slug, d, nc]) => DSA.push({ slug, d, topic, name: prettify(slug), url: nc ? NC(nc) : LC(slug), premium: !!nc })));


// Adapter (Task 4c): machine coding, flagship and LLD live in content/mc.js. The old engine reads MC as build texts in the
// old order, MC_TIMED as 1-based MC indexes, and PROJECT as 20 [text, url] steps: merged flagship steps are split back into
// their `oldSteps` and every step is put back at its old 1-based position (`v1`), with its old text (`oldText`).
const MC = MC_NEW.map(x => x.text);
const MC_TIMED = MC_TIMED_NEW.map(id => MC_NEW.findIndex(x => x.id === id) + 1);
const byV1 = (a, b) => a.v1 - b.v1;
const PROJECT = PROJECT_NEW.flatMap(x => x.oldSteps ?? [{ v1: x.v1, text: x.oldText ?? x.text, url: x.url || '' }]).sort(byV1).map(x => [x.text, x.url]);

// Product & UX (second task in the career block, weeks 1–5): understanding product, not just code.


const FOCUS_RULES = [
  'Only use the links in this plan. If you find something new online, put it in the Parking lot page and look at it on Sunday, or in Month 4.',
  'No new courses, no new lists. NeetCode 150 + this plan is enough.',
  'Every day: finish the list, write the log. That is the only goal.',
  'Before any real interview: ask the recruiter which rounds allow AI tools, and in what format (doc, CoderPad, whiteboard).',
];

// Month 4 (optional, days 92–121): good-to-haves once the core 90 days are done.
const EXTENSION = [
  ['Week 14', 'Company-specific prep for the loops you have scheduled (recruiter-confirmed formats); 3 full mock loops'],
  ['Week 15', 'LeetCode weekly contests; Striver A2Z gaps; hards in your weakest 2 patterns'],
  ['Week 16', 'Deeper AI: Karpathy micrograd + makemore; fast.ai practical deep learning lessons 1–3'],
  ['Week 17', 'Flagship: second round of real users, a blog post on the hardest problem you solved, one open-source contribution to a frontend library'],
  ['Any time', 'Kubernetes hands-on, Spark hands-on, more LLD from the question bank, a second cloud (GCP)'],
];

// Adapter (Task 4c): system design lives in content/sd.js in the §6 order. The old engine reads SD as [text, url] in the old
// order (`v1`, old text in `oldText`; the new numbers card has no `v1` and is left out) and SD_MOCKS as texts.
const SD = SD_NEW.filter(x => x.v1 !== undefined).sort(byV1).map(x => [x.oldText ?? x.text, x.url || '']);
const SD_MOCKS = SD_MOCKS_NEW.map(x => x.text);

// Career block after BEH runs out: a short application task + one FDE item each day.
const APPLY = [
  ['Apply / ask for referrals: 3–5 roles today, follow up on last week. Log them in Job tracker.', 'https://www.linkedin.com/jobs/'],
  ['Apply / ask for referrals: 3–5 roles today (mix big tech, AI companies, practice companies).', 'https://www.linkedin.com/jobs/'],
];

const RM = 'https://roadmap.sh/forward-deployed-engineer';
const FDE_STAGES = [
  ['1 · Introduction', 'Roles, tiers, glossary (Delta, UAT, last-mile integration, Day 2 ops)', 'FDE sessions 1–2'],
  ['2 · CS basics', 'Python, DSA & system design, Git, Linux', 'Daily DSA + system design blocks; FDE sessions on Python, Git, Linux'],
  ['3 · Full stack', 'HTML, CSS, JS, React, Node, SQL, Postgres, NoSQL, API design, GraphQL', 'Daily frontend & CS block + machine coding'],
  ['4 · Data engineering', 'Data modeling, pipelines, warehouses, Spark, Airflow', 'FDE sessions (data audit, SQL, pipelines, warehouses)'],
  ['5 · AI engineering', 'LLM fundamentals, prompting, context engineering, RAG, vector DBs, providers, agents, MCP, AI coding tools, legacy integration', 'Evening AI block + FDE sessions on the gaps'],
  ['6 · DevOps & cloud', 'AWS/GCP/Azure, Terraform, Docker, Kubernetes, CI/CD', 'FDE sessions (AWS, Terraform, containers, CI/CD)'],
  ['7 · Production AI systems', 'Eval pipelines, debugging agents, inference optimization, security, AI governance, privacy, MLOps', 'FDE sessions + AI block (evals, observability)'],
  ['8 · Customer delivery & field skills', 'Discovery, scoping, business acumen, stakeholders, technical writing, executive reporting', 'FDE sessions + interview reps (decomposition, client simulation)'],
];
const FDE_PROMPTS = [
  'Decomposition: "A bank wants to flag fraudulent transactions in real time"',
  'Client simulation: the customer says your AI tool gave a wrong answer to their CEO',
  'Decomposition: "A logistics company wants to predict delivery delays"',
  'Practical coding (Python): merge two messy CSVs and report mismatches in 45 min',
  'Decomposition: "A hospital wants an AI assistant for nurses on night shifts"',
  'Client simulation: scope cut. The customer wants 10 features in 4 weeks',
];

const LLD = LLD_NEW.map(x => [x.text, x.url]);

// Adapter (Task 4b): the old engine reads AI_UNITS as [unit, [[text, url]]] in the old 61-day order.
// The reading/course days live in AI_EVENING and the build days in AIB; both keep `unit` and `day` (and `oldText` where the text
// gained an explain-back), so the old order and text are rebuilt here.
const AI_UNITS = [...AI_EVENING, ...AIB].filter(x => x.day !== undefined).sort((a, b) => a.day - b.day)
  .reduce((units, x) => {
    const last = units[units.length - 1];
    const step = [x.oldText ?? x.text, x.url || ''];
    if (last && last[0] === x.unit) last[1].push(step);
    else units.push([x.unit, [step]]);
    return units;
  }, []);
const AI_REVIEW = AI_REVIEW_NEW.map(x => [x.text, x.url || '']);

const OA_LINKS = [
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

const RULES = [
  ['Patterns over memorization', 'Most problems are variations of 15–20 patterns. Learn the pattern, not the answer.'],
  ['Think out loud', 'Say your approach, edge cases and complexity while you code. Every time.'],
  ['Time-box 45 minutes', 'Stuck after 45 min? Read the solution, understand it, flag it, re-solve later.'],
  ['Review even when correct', 'Read 2 other solutions. Note time and space trade-offs.'],
  ['Consistency over intensity', 'Finish today\'s list. Missed something? Sunday catch-up handles it. Never skip two days.'],
];

const HLD_FRAMEWORK = [
  ['Requirements', '~5 min', 'Top 3 functional features; quantify non-functional (latency, availability, CAP choice).'],
  ['Core entities', '~2 min', 'Main nouns: users, objects, events.'],
  ['API', '~5 min', 'REST by default. User comes from the auth token, never the body.'],
  ['Data flow', '~5 min', 'Only if useful: ingest → process → store → serve.'],
  ['High-level design', '~10–15 min', 'Boxes and arrows that meet the core requirements. Start simple.'],
  ['Deep dives', '~10 min', 'Scale, caching, sharding, consistency, failure modes, hot keys.'],
];

// Where every section of the Whimsical board lives in this plan.
const BOARD_MAP = [
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

export const PLAN = { PROJECT, UX, COMPANY_MAP, FOCUS_RULES, EXTENSION, FDE_STAGES, AI_UNITS, AI_REVIEW, APPLY, FDE, FDE_PROMPTS, LLD, DSA, FE, MC, MC_TIMED, SD, SD_MOCKS, BEH, ADV_DSA, OA_LINKS, RULES, HLD_FRAMEWORK, BOARD_MAP };
