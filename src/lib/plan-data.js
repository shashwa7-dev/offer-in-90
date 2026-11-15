/* eslint-disable */
// Curriculum data. Edit here; task IDs (p-<slug>, fe-N, mc-N, sd-N, beh-N, ux-N, fde-N, proj-N, lld-N, ai-N) must stay stable so progress survives.
// 90-day curriculum. Built from the "Amazon Interview Prep by AnubhavInTech" Whimsical board,
// extended for frontend / full-stack loops at Google, Meta, Microsoft, Amazon.

import { ADV_DSA } from './content/dsa.js';
import { FE as FE_NEW } from './content/fe.js';
import { UX as UX_NEW } from './content/ux.js';
import { BEH as BEH_NEW, FDE as FDE_NEW, COMPANY_MAP } from './content/career.js';
import { AIB_MOVED, AIB, AI_EVENING, AI_REVIEW as AI_REVIEW_NEW } from './content/ai.js';

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


// Machine coding: frontend LLD round (Microsoft-style machine coding, Meta/Google UI rounds). 90 minutes each.
const MC = [
  'Todo list in vanilla JS (add, edit, delete, filter) — no framework', 'Accordion (single/multi open, keyboard accessible)', 'Tabs with correct ARIA roles', 'Modal dialog (focus trap, Esc, click outside)', 'Star rating (hover preview, half stars)',
  'Debounced search input that cancels stale requests', 'Pagination component', 'Infinite scroll feed (IntersectionObserver)', 'Image carousel (autoplay, dots, swipe)', 'Toast notification system (stacking, auto-dismiss)',
  'Autocomplete / typeahead (cache, keyboard nav, highlight)', 'Nested comments (reply, collapse, delete)', 'File explorer tree (expand, add, rename, delete)', 'Multi-step form wizard with validation', 'Tic-tac-toe N×N with winner check',
  'Data table: sort, filter, paginate', 'Kanban board with drag and drop', 'Date picker / month calendar', 'OTP input (auto-advance, paste, backspace)', 'Tooltip / popover with smart positioning',
  'useFetch hook with cache, retries + AbortController', 'Virtualized list of 10,000 rows', 'Accessible combobox / searchable select', 'Spreadsheet-lite (cells, A1 refs, simple formulas)', 'Text editor with undo / redo',
  'Like button with optimistic UI and rollback', 'Email client UI (Outlook-style: folders, list, reading pane, keyboard shortcuts)', 'Chat UI (Teams-style: channels, messages, typing indicator, unread counts)',
  'Mini React: createElement + render + useState', 'Event emitter (on, off, once, emit)', 'Promise pool / task scheduler with concurrency limit', 'Virtual DOM diff and patch', 'Redux createStore + middleware from scratch', 'Streaming AI chat UI (stop, regenerate, markdown, code blocks)',
];
const MC_TIMED = [11, 16, 17, 12, 13, 4, 24, 18, 27, 28, 31, 22];

// Flagship product, built in the machine-coding block (weeks 7–11). One serious product beats ten toy apps.
// You write the brief, the design doc and every review; AI coding tools write a lot of the code. That is the skill companies now hire for.
const PROJECT = [
  ['Product brief: target user, the problem, 3 core jobs, success metrics. Teardown of Notion, Linear docs and Slab.', ''],
  ['Design doc (RFC): architecture, data model, API, real-time approach (CRDT), AI design (RAG), risks, milestones. This is the document you steer the AI with.', 'https://www.industrialempathy.com/posts/design-docs-at-google/'],
  ['UX: wireframes, design tokens, component inventory in Figma', 'https://help.figma.com/hc/en-us/articles/360040451373'],
  ['Setup: Next.js + TypeScript, lint, tests, CI, preview deploys. Write CONTRIBUTING rules for your AI coding agent.', 'https://nextjs.org/docs'],
  ['Auth (OAuth/OIDC), workspaces, roles; Postgres schema with row-level security', 'https://supabase.com/docs/guides/database/postgres/row-level-security'],
  ['Editor: rich text (Tiptap/ProseMirror), slash commands, keyboard-first', 'https://tiptap.dev/docs'],
  ['Real-time collaboration: Yjs + WebSocket provider, live cursors and presence', 'https://docs.yjs.dev/'],
  ['Offline-first: IndexedDB persistence, sync on reconnect, conflict and reconnect UX', 'https://docs.yjs.dev/getting-started/allowing-offline-editing'],
  ['Search + command palette (⌘K) with virtualized results', ''],
  ['Performance pass: Web Vitals budget, code splitting, React Profiler. Record before/after numbers.', 'https://web.dev/articles/vitals'],
  ['Accessibility pass: keyboard, screen reader, contrast; axe in CI', 'https://github.com/dequelabs/axe-core'],
  ['AI 1: ingestion pipeline: chunk + embed on save, pgvector, re-index on edit or model change', 'https://github.com/pgvector/pgvector'],
  ['AI 2: "Ask your workspace": streaming answers with citations and permission-aware retrieval', ''],
  ['AI 3: agent actions with tools (summarize, create tasks) with a human confirmation step', 'https://www.anthropic.com/engineering/building-effective-agents'],
  ['Integrations (FDE muscle): import Markdown/CSV or a Notion/Drive export; outgoing webhooks', ''],
  ['Evals: 50-question eval set, CI gate, cost + latency dashboard. Publish the numbers.', 'https://hamel.dev/blog/posts/evals/'],
  ['Observability + security: tracing, rate limits, prompt-injection tests', 'https://langfuse.com/docs'],
  ['Load + failure testing: k6 load test, kill the WebSocket server, fix what breaks', 'https://grafana.com/docs/k6/latest/'],
  ['Launch: deploy, get 5–10 real users, collect feedback, ship one fix from it', ''],
  ['Case study: README with architecture diagram, trade-offs, metrics, 3-min demo video. Practice the 15-min project deep dive.', ''],
];

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

// System design: HLD concepts → frontend system design → HLD problems → mocks.
const SD = [
  ['How the internet works: packets, IP, TCP/UDP, DNS resolution path, TLS handshake, HTTP/1.1 → 2 → 3, CDNs, what happens when you type a URL', 'https://github.com/alex/what-happens-when'],
  ['Fundamentals: scalability, latency vs throughput, availability, consistency', 'https://github.com/donnemartin/system-design-primer'],
  ['CAP & PACELC, SLO / SLA / SLI, latency budgets', 'https://github.com/donnemartin/system-design-primer#cap-theorem'],
  ['Capacity estimation: back-of-envelope maths drills', 'https://www.hellointerview.com/learn/system-design/in-a-hurry/introduction'],
  ['Storage: SQL vs NoSQL, indexing (B-tree, inverted index)', 'https://www.hellointerview.com/learn/system-design/in-a-hurry/core-concepts'],
  ['Replication, primary–replica, sharding, consistent hashing', 'https://www.hellointerview.com/learn/system-design/core-concepts/consistent-hashing'],
  ['Transactions & isolation levels, object storage (S3)', 'https://github.com/donnemartin/system-design-primer#database'],
  ['Communication: DNS, HTTP, REST vs gRPC vs GraphQL, API gateway, proxies', 'https://github.com/donnemartin/system-design-primer#communication'],
  ['Caching layers (TTL/LRU, write-through, write-back), CDN, load balancing', 'https://github.com/donnemartin/system-design-primer#cache'],
  ['Messaging: queues vs streams, pub-sub, event-driven, backpressure', 'https://www.hellointerview.com/learn/system-design/deep-dives/kafka'],
  ['Idempotency, saga pattern, CQRS, stream processing', 'https://microservices.io/patterns/data/saga.html'],
  ['Reliability: leader election, Raft, multi-region, consistency models', 'https://raft.github.io/'],
  ['Observability (SLIs, logs, traces, alerts) + security basics (authN/Z, TLS, secrets)', 'https://newsletter.systemdesign.one/'],
  ['Concepts to master (from the board): multi-layer caching, read- vs write-heavy, hot keys, p99 tail latency, rate-limit strategies, storage tiering, cost-aware design. Plus the common mistakes list.', 'https://github.com/donnemartin/system-design-primer'],
  ['HLD delivery framework: requirements → entities → API → data flow → high-level → deep dives. Learn the common mistakes.', 'https://www.hellointerview.com/learn/system-design/in-a-hurry/delivery'],
  ['Frontend SD framework (RADIO): requirements, architecture, data model, interface, optimizations', 'https://www.greatfrontend.com/front-end-system-design-playbook'],
  ['FE SD: rendering strategies (CSR, SSR, SSG, ISR, streaming, islands)', 'https://www.patterns.dev/react/'],
  ['FE SD: network & data layer (REST/GraphQL, normalized cache, optimistic updates, offline)', 'https://namastedev.com/learn/namaste-frontend-system-design'],
  ['FE SD: performance at scale (bundles, images, caching, Web Vitals budgets)', 'https://web.dev/learn/performance'],
  ['FE SD: security, accessibility, i18n, logging & monitoring', 'https://namastedev.com/learn/namaste-frontend-system-design'],
  ['FE SD: micro-frontends, monorepos, design systems at scale', 'https://martinfowler.com/articles/micro-frontends.html'],
  ['Design a news feed (infinite scroll, real-time updates, composer)', 'https://www.greatfrontend.com/questions/system-design/news-feed-facebook'],
  ['Design search autocomplete (frontend)', 'https://www.greatfrontend.com/questions/system-design/autocomplete'],
  ['Design a chat app (web client, presence, offline, delivery receipts)', 'https://www.greatfrontend.com/questions/system-design/chat-application-messenger'],
  ['Design a video streaming player (adaptive bitrate, buffering, captions)', 'https://www.greatfrontend.com/front-end-system-design-playbook'],
  ['Design an e-commerce product page + checkout', 'https://www.greatfrontend.com/questions/system-design/e-commerce-amazon'],
  ['Design a photo gallery / Pinterest masonry grid', 'https://www.greatfrontend.com/questions/system-design/image-carousel'],
  ['Design a collaborative document editor (OT vs CRDT)', 'https://www.greatfrontend.com/front-end-system-design-playbook'],
  ['Design a spreadsheet app (virtualized grid, formula engine)', 'https://www.greatfrontend.com/front-end-system-design-playbook'],
  ['Design a calendar app (views, recurring events, time zones)', 'https://www.greatfrontend.com/front-end-system-design-playbook'],
  ['Design a travel booking site (search, filters, maps, booking flow)', 'https://www.greatfrontend.com/questions/system-design/travel-booking-airbnb'],
  ['Design a whiteboard / Figma-like canvas', 'https://www.figma.com/blog/how-figmas-multiplayer-technology-works/'],
  ['Design an analytics dashboard (charts, real-time, large data)', 'https://www.greatfrontend.com/front-end-system-design-playbook'],
  ['HLD: Design Bit.ly (URL shortener)', 'https://www.hellointerview.com/learn/system-design/problem-breakdowns/bitly'],
  ['HLD: Design a rate limiter', 'https://www.hellointerview.com/learn/system-design/problem-breakdowns/distributed-rate-limiter'],
  ['HLD: Design Dropbox / Google Drive', 'https://www.hellointerview.com/learn/system-design/problem-breakdowns/dropbox'],
  ['HLD: Design a news aggregator', 'https://www.hellointerview.com/learn/system-design/problem-breakdowns/google-news'],
  ['HLD: Design a local delivery service', 'https://www.hellointerview.com/learn/system-design/problem-breakdowns/gopuff'],
  ['HLD: Design LeetCode (online judge)', 'https://www.hellointerview.com/learn/system-design/problem-breakdowns/leetcode'],
  ['HLD: Design Ticketmaster (booking under contention)', 'https://www.hellointerview.com/learn/system-design/problem-breakdowns/ticketmaster'],
  ['HLD: Design WhatsApp', 'https://www.hellointerview.com/learn/system-design/problem-breakdowns/whatsapp'],
  ['HLD: Design YouTube live comments', 'https://www.hellointerview.com/learn/system-design/problem-breakdowns/fb-live-comments'],
  ['HLD: Design Yelp (geo search)', 'https://www.hellointerview.com/learn/system-design/problem-breakdowns/yelp'],
  ['HLD: Design the Facebook news feed', 'https://www.hellointerview.com/learn/system-design/problem-breakdowns/fb-news-feed'],
  ['HLD: Design Tinder', 'https://www.hellointerview.com/learn/system-design/problem-breakdowns/tinder'],
  ['HLD: Design Instagram post search', 'https://www.hellointerview.com/learn/system-design/problem-breakdowns/fb-post-search'],
  ['HLD: Design a price tracking service', 'https://www.hellointerview.com/learn/system-design/problem-breakdowns/camelcamelcamel'],
  ['HLD: Design an online auction', 'https://www.hellointerview.com/learn/system-design/problem-breakdowns/online-auction'],
  ['HLD: Design a top-K leaderboard', 'https://www.hellointerview.com/learn/system-design/problem-breakdowns/top-k'],
  ['HLD: Design search autocomplete (backend)', 'https://github.com/donnemartin/system-design-primer'],
  ['HLD: Design a web crawler', 'https://www.hellointerview.com/learn/system-design/problem-breakdowns/web-crawler'],
  ['HLD: Design a distributed cache (Redis)', 'https://www.hellointerview.com/learn/system-design/deep-dives/redis'],
  ['HLD: Design a job scheduler', 'https://www.hellointerview.com/learn/system-design/problem-breakdowns/job-scheduler'],
  ['HLD: Design an ad click aggregator', 'https://www.hellointerview.com/learn/system-design/problem-breakdowns/ad-click-aggregator'],
  ['HLD: Design YouTube', 'https://www.hellointerview.com/learn/system-design/problem-breakdowns/youtube'],
  ['HLD: Design a payment system', 'https://www.hellointerview.com/learn/system-design/problem-breakdowns/payment-system'],
  ['AI design: an evaluation framework for an LLM customer-support assistant (the most common new prompt)', 'https://hamel.dev/blog/posts/evals/'],
  ['AI design: ChatGPT-style product, frontend + backend (streaming, history, rate limits, LLM gateway, cost per user)', ''],
  ['AI design: RAG search over company docs (ingestion, re-indexing when the embedding model changes, permissions, freshness)', 'https://www.anthropic.com/news/contextual-retrieval'],
  ['AI design: an AI coding agent platform (sandboxes, tool permissions, long-running jobs, observability)', ''],
];
// Mock rounds (s55–s78): 45-minute timed, solo out loud or with a peer.
const SD_MOCKS = [
  'FE (Meta product architecture, diagram in Mermaid): Design a news feed', 'HLD: Design Robinhood (stock trading)', 'LLD: Design an online book management system',
  'FE: Design a chat app', 'HLD: Design Instagram', 'LLD: Design Google Authenticator',
  'FE: Design autocomplete', 'HLD: Design Google Docs', 'LLD: Design the Android unlock pattern',
  'FE: Design an e-commerce site', 'HLD: Design a rate limiter', 'LLD: Design Tetris',
  'FE (diagram in Mermaid): Design Google Sheets', 'HLD: Design WhatsApp', 'LLD: Design a JSON parser',
  'FE: Design a video player', 'HLD: Design Ticketmaster', 'LLD: Design 2048',
  'FE: Design a calendar', 'AI: Design an eval framework for an LLM support bot', 'LLD: Design Minesweeper',
  'FE: Design a photo gallery', 'AI: Design ChatGPT, frontend + backend', 'LLD: Design Chess',
];

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

// LLD from the board: Saturdays in the machine-coding block.
const LLD = [
  ['LLD foundations: OOP principles + SOLID', 'https://www.baeldung.com/solid-principles'],
  ['LLD foundations: design patterns, creational + structural (use the masterclass video)', 'https://refactoring.guru/design-patterns'],
  ['LLD foundations: design patterns, behavioral (Observer, Strategy, Command, State)', 'https://youtu.be/vap9ACtc_tU'],
  ['LLD foundations: multithreading & concurrency + design a multi-threaded task scheduler', 'https://akhiilgupta.medium.com/design-a-multi-threaded-task-scheduler-lld-multi-threaded-construct-eb090c5a8727'],
  ['LLD: Design an online book management system', 'https://www.lldcoding.com/'],
  ['LLD: Design Google Authenticator', 'https://www.lldcoding.com/'],
  ['LLD: Design the Android unlock pattern', 'https://www.lldcoding.com/'],
  ['LLD: Design a rate limiter', 'https://www.lldcoding.com/'],
  ['LLD: Design the Google Calendar database model', 'https://www.lldcoding.com/'],
  ['LLD: Design a coupon system (quick-commerce app)', 'https://www.lldcoding.com/'],
  ['LLD: Design a thread pool', 'https://medium.com/@prashant558908/top-3-questions-to-practice-multi-threading-for-low-level-design-interviews-1cc4d6b5d00b'],
  ['LLD: Design Tetris', 'https://www.lldcoding.com/'],
  ['LLD: Design an alarm / alert service for AWS', 'https://www.lldcoding.com/'],
];

// Adapter (Task 4b): the old engine reads AI_UNITS as [unit, [[text, url]]] in the old 61-day order.
// The paper/course days live in AI_EVENING and the `Build ·` days in AIB; both keep `unit` and `day`, so the old order is rebuilt here.
const AI_UNITS = [...AI_EVENING, ...AIB].filter(x => x.day !== undefined).sort((a, b) => a.day - b.day)
  .reduce((units, x) => {
    const last = units[units.length - 1];
    if (last && last[0] === x.unit) last[1].push([x.text, x.url || '']);
    else units.push([x.unit, [[x.text, x.url || '']]]);
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
