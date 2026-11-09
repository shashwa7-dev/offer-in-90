/* eslint-disable */
// Curriculum data. Edit here; task IDs (p-<slug>, fe-N, mc-N, sd-N, beh-N, ux-N, fde-N, proj-N, lld-N, ai-N) must stay stable so progress survives.
// 90-day curriculum. Built from the "Amazon Interview Prep by AnubhavInTech" Whimsical board,
// extended for frontend / full-stack loops at Google, Meta, Microsoft, Amazon.

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

// Frontend & CS core, one topic per study day (s1–s48). [topic, practice, link]
const FE = [
  ['Execution context, hoisting, scope chain, TDZ', 'Predict output of 10 hoisting/scope snippets', 'https://javascript.info/closure'],
  ['Closures, IIFE, module pattern', 'Build a private counter + once() using closures', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures'],
  ['this, call / apply / bind', 'Write a polyfill for Function.prototype.bind', 'https://javascript.info/call-apply-decorators'],
  ['Prototypes, inheritance, classes, new', 'Implement myNew() and Object.create()', 'https://javascript.info/prototype-inheritance'],
  ['Event loop: call stack, microtasks, macrotasks', 'Predict output of 10 setTimeout / Promise ordering puzzles', 'https://www.youtube.com/watch?v=cCOL7MC4Pl0'],
  ['Promises in depth', 'Implement Promise.all, allSettled, race, any', 'https://javascript.info/promise-api'],
  ['async/await, error handling, generators, iterators', 'Write retry(fn, n) with backoff + an async iterator', 'https://javascript.info/async-iterators-generators'],
  ['Array polyfills, deep clone, deep equal', 'Implement map, filter, reduce, flat, deepClone, isEqual', 'https://bigfrontend.dev/problem'],
  ['Debounce, throttle, memoize, curry, compose', 'Implement all five with leading/trailing options', 'https://bigfrontend.dev/problem/implement-basic-debounce'],
  ['Types, coercion, equality, WeakMap, GC, memory leaks', 'Find 3 leak patterns in DevTools Memory tab', 'https://javascript.info/garbage-collection'],
  ['ES6+, Proxy/Reflect, ESM vs CommonJS', 'Build a reactive object with Proxy', 'https://javascript.info/proxy'],
  ['TypeScript essentials: generics, narrowing, utility & mapped types', 'Re-implement Pick, Omit, Partial, ReturnType', 'https://www.typescriptlang.org/docs/handbook/2/types-from-types.html'],
  ['DOM & events: bubbling, capturing, delegation', 'Implement event delegation for a dynamic list', 'https://javascript.info/event-delegation'],
  ['Critical rendering path, reflow, repaint, compositing', 'Profile a page in Performance tab; find layout thrash', 'https://web.dev/articles/critical-rendering-path'],
  ['Accessibility: semantics, ARIA, focus, keyboard', 'Audit a page with axe + keyboard-only navigation', 'https://www.w3.org/WAI/ARIA/apg/patterns/'],
  ['CSS: box model, specificity, stacking context, positioning', 'Explain 5 z-index bugs and fix them', 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Understanding_z-index/Stacking_context'],
  ['CSS layout: Flexbox, Grid, responsive, container queries', 'Build holy-grail layout with Grid, then Flexbox', 'https://css-tricks.com/snippets/css/complete-guide-grid/'],
  ['Storage, Web Workers, Service Workers', 'Cache API responses offline with a service worker', 'https://web.dev/learn/pwa/service-workers'],
  ['HTTP/1.1 vs 2 vs 3, caching headers, ETag, CDN', 'Explain Cache-Control for HTML vs hashed assets', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching'],
  ['REST vs GraphQL vs gRPC, fetch, AbortController', 'Write fetchWithTimeout + cancel stale requests', 'https://developer.mozilla.org/en-US/docs/Web/API/AbortController'],
  ['WebSockets, SSE, long polling', 'Compare the three in a table: latency, scale, fallbacks', 'https://javascript.info/websocket'],
  ['Web security: XSS, CSRF, CSP, CORS, clickjacking', 'Write a CSP header for a React app', 'https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html'],
  ['Auth: cookies vs JWT, sessions, OAuth2/OIDC', 'Draw the OAuth2 PKCE flow from memory', 'https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow-with-pkce'],
  ['Web performance: Core Web Vitals (LCP, INP, CLS)', 'Run Lighthouse on your project; fix top 3 issues', 'https://web.dev/articles/vitals'],
  ['React rendering, reconciliation, keys, Fiber', 'Explain why index keys break a reorderable list', 'https://react.dev/learn/preserving-and-resetting-state'],
  ['Hooks in depth: effects, refs, stale closures', 'Fix 3 stale-closure bugs in useEffect/setInterval', 'https://react.dev/learn/synchronizing-with-effects'],
  ['memo, useMemo, useCallback: when React re-renders', 'Use React Profiler to remove wasted renders', 'https://react.dev/reference/react/memo'],
  ['Custom hooks', 'Write useDebounce, usePrevious, useLocalStorage, useOnClickOutside', 'https://react.dev/learn/reusing-logic-with-custom-hooks'],
  ['State management: Context, Redux Toolkit, Zustand, React Query', 'Same feature in Context vs Zustand vs React Query', 'https://tanstack.com/query/latest/docs/framework/react/overview'],
  ['Forms, error boundaries, portals, Suspense', 'Build an error boundary + portal-based modal', 'https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary'],
  ['Concurrent React: transitions, useDeferredValue, React 19 actions', 'Make a slow filter list responsive with useTransition', 'https://react.dev/reference/react/useTransition'],
  ['SSR, SSG, ISR, streaming, Server Components, hydration', 'Explain RSC vs SSR in 2 minutes, out loud', 'https://nextjs.org/docs/app/getting-started/server-and-client-components'],
  ['React performance at scale: virtualization, code splitting', 'Lazy-load a route and measure bundle drop', 'https://web.dev/articles/virtualize-long-lists-react-window'],
  ['Testing: Vitest/Jest, React Testing Library, Playwright', 'Write tests for your autocomplete component', 'https://testing-library.com/docs/react-testing-library/intro/'],
  ['Build tooling: Vite, webpack, tree-shaking, module federation', 'Explain how tree-shaking decides dead code', 'https://webpack.js.org/guides/tree-shaking/'],
  ['Component API design: compound, headless, render props, design systems', 'Design a headless <Select> API on paper', 'https://www.patterns.dev/react/compound-pattern'],
  ['Node.js: event loop phases, streams, worker threads, cluster', 'Stream a 1 GB file without loading it into memory', 'https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick'],
  ['API design: REST, versioning, pagination, errors, idempotency keys', 'Design the API for a todo app with cursor pagination', 'https://cloud.google.com/apis/design'],
  ['SQL: joins, indexes, transactions, isolation levels', 'Solve 5 SQL problems (LeetCode SQL 50)', 'https://leetcode.com/studyplan/top-sql-50/'],
  ['NoSQL data modeling (MongoDB/DynamoDB); SQL vs NoSQL', 'Model a chat app in both SQL and DynamoDB', 'https://www.mongodb.com/docs/manual/data-modeling/'],
  ['Redis: caching strategies, TTL/LRU, rate limiting', 'Implement a token-bucket limiter with Redis', 'https://redis.io/docs/latest/develop/'],
  ['Queues & streams: Kafka, SQS, background jobs, retries', 'Explain at-least-once vs exactly-once delivery', 'https://kafka.apache.org/intro'],
  ['Web Components: custom elements, Shadow DOM, slots', 'Build a <star-rating> web component', 'https://developer.mozilla.org/en-US/docs/Web/API/Web_components'],
  ['Animation & rendering performance: requestAnimationFrame, FLIP, compositor-only properties', 'Animate a list reorder with FLIP at 60 fps', 'https://web.dev/articles/animations-guide'],
  ['Canvas, SVG and data visualization basics', 'Draw a responsive bar chart in SVG without a library', 'https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial'],
  ['Concurrency in JS: workers, SharedArrayBuffer, race conditions in async code', 'Fix a race between two fetches updating the same state', 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API'],
  ['OS & networking: processes, threads, TCP/UDP, DNS, TLS', 'Answer "what happens when you type a URL" in 5 minutes', 'https://github.com/alex/what-happens-when'],
  ['Docker, CI/CD, observability (logs, metrics, traces)', 'Dockerize a small Node app and add a GitHub Actions pipeline', 'https://docs.docker.com/get-started/'],
];

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
const UX = [
  ['Laws of UX: Fitts, Hick, Jakob, Miller, Doherty threshold', 'https://lawsofux.com/'],
  ['Nielsen\'s 10 usability heuristics. Audit an app you use daily against them.', 'https://www.nngroup.com/articles/ten-usability-heuristics/'],
  ['Visual hierarchy, spacing and the 4/8-pt grid', 'https://web.dev/learn/design/macro-layouts'],
  ['Typography: type scale, line length, hierarchy', 'https://m3.material.io/styles/typography/overview'],
  ['Color: contrast (WCAG), palettes, dark mode', 'https://webaim.org/resources/contrastchecker/'],
  ['Layout, responsive and mobile-first design', 'https://web.dev/learn/design'],
  ['Gestalt principles in interfaces', 'https://www.nngroup.com/articles/gestalt-proximity/'],
  ['Forms UX: labels, validation timing, error messages', 'https://www.nngroup.com/articles/errors-forms-design-guidelines/'],
  ['Every state: empty, loading, error, partial, success', ''],
  ['Perceived performance: skeletons, optimistic UI, progress', 'https://web.dev/learn/performance'],
  ['Motion and microinteractions: purpose, timing, reduced motion', 'https://m3.material.io/styles/motion/overview'],
  ['Design systems and tokens', 'https://m3.material.io/foundations'],
  ['Apple Human Interface Guidelines: platform conventions, navigation', 'https://developer.apple.com/design/human-interface-guidelines'],
  ['Figma for engineers: auto layout, components, inspect', 'https://help.figma.com/hc/en-us'],
  ['Accessible design patterns (GOV.UK design system)', 'https://design-system.service.gov.uk/patterns/'],
  ['Teardown: Linear. Why it feels fast (keyboard-first, optimistic, local-first).', 'https://linear.app/'],
  ['Teardown: Stripe Checkout. Trust, errors, forms.', 'https://stripe.com/payments/checkout'],
  ['Teardown: Airbnb search. Filters, map, results.', 'https://www.airbnb.com/'],
  ['Teardown: Figma / Notion. Collaboration UX.', 'https://www.figma.com/blog/how-figmas-multiplayer-technology-works/'],
  ['Product thinking: users, jobs-to-be-done, problem statements', ''],
  ['Write a one-page PRD for a feature you would add to an app you use', ''],
  ['Metrics: north star, activation, retention, funnels, guardrails', ''],
  ['Experimentation: A/B tests, sample size intuition, common pitfalls', 'https://www.optimizely.com/optimization-glossary/ab-testing/'],
  ['Feature flags, staged rollouts, kill switches', 'https://martinfowler.com/articles/feature-toggles.html'],
  ['Analytics instrumentation: event design and privacy', ''],
  ['Prioritization: RICE, impact vs effort, saying no', ''],
  ['AI product UX: trust, latency, uncertainty, human-in-the-loop, recovering from errors', 'https://pair.withgoogle.com/guidebook/'],
  ['Product sense out loud: "How would you improve Google Maps?" (10 min)', ''],
  ['Product sense out loud: "Design a product for first-time remote managers"', ''],
  ['Engineering judgment: build vs buy, tech debt, when to ship', ''],
  ['UX writing: microcopy, empty states, error messages', 'https://www.nngroup.com/articles/error-message-guidelines/'],
  ['Dashboards and data-viz UX', ''],
  ['Onboarding and activation UX', ''],
  ['Internationalization UX: dates, plurals, RTL, text expansion', ''],
  ['Flagship prep: pick your target user and problem; write it in Notes for project day 1', ''],
];

// What each company actually tests (2025–26 candidate reports + prep guides) and where the plan covers it.
const COMPANY_MAP = [
  ['Google (frontend SWE)', 'Phone screen: DSA. Onsite 4–5 rounds: mostly LeetCode medium–hard DSA, one frontend round (JS/async/DOM/React; large-scale frontend design at senior), Googleyness. Hiring committee + team match. At least one in-person round.', 'Daily DSA + timed sets typed in a plain doc; frontend block; frontend system design; Googleyness stories'],
  ['Meta (front-end / product)', 'Screen: 2 problems in ~35–45 min (vanilla JS for front-end). Loop: 2 coding (one may be AI-enabled), product architecture (user-facing product, sometimes diagrammed in Mermaid), behavioral.', 'Speed sets (2 in 40 min), JS/DOM utilities, weekly AI-enabled coding drills, product-architecture mocks in Mermaid'],
  ['Meta AI-enabled round', '60 min, multi-file codebase in CoderPad: fix a bug → implement a feature (harder than medium) with an AI chat → optimize for bigger inputs. Graded on understanding, verification, communication.', 'AI-enabled drills (Sundays in Phase 2, Phase 3 DSA rotation), re-engineering reps, BFS/backtracking/trie/bitmask practice'],
  ['Microsoft', '3–6 rounds: long machine-coding rounds (e.g. an Outlook or Teams-style UI), advanced JS, LLD, DSA, browser internals; growth mindset. Some teams add an AI-assisted round.', 'Machine coding (incl. email + chat clients), LLD Saturdays, growth-mindset stories'],
  ['Amazon', 'OA (coding 70 min + work simulation + work style), DSA + Leadership Principles every round, LLD/HLD at SDE-2, bar raiser.', 'The Whimsical board track (see table above)'],
  ['Forward-deployed (AI labs, Palantir, Databricks, startups)', 'Practical coding (often Python), system design with LLM/RAG/evals, decomposition, client simulation, behavioral, sometimes a 4–8 h take-home. Posts ask for Python/TS, SQL, cloud, containers, RAG/evals/agents, discovery skills.', 'FDE track (roadmap.sh stages + reps), AI block, flagship project'],
  ['System design in 2026 (all companies)', 'LLM parts (gateways, vector stores, evals, agent sandboxes) are now normal design material; cost and latency reasoning is graded; "design an eval framework" is a common prompt.', 'AI system design days in the system design block + AI mocks'],
];

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

// Career block: behavioral, resume, applications. One task per study day.
const BEH = [
  ['Resume: rewrite every bullet as impact (did X, measured by Y, by doing Z). One page.', 'https://www.techinterviewhandbook.org/resume/'],
  ['LinkedIn headline + About; GitHub: pin 3 best repos with READMEs', 'https://www.techinterviewhandbook.org/resume/'],
  ['Story bank: list 12 projects/situations from your work (wins, failures, conflicts)', 'https://in.indeed.com/career-advice/interviewing/how-to-use-the-star-interview-response-technique'],
  ['Positioning: pick your pitch (frontend engineer who ships AI features / full-stack / forward-deployed) and 3 target role titles', 'https://www.linkedin.com/jobs/'],
  ['Market scan: save 10 job posts (frontend, full-stack, FDE, AI product engineer); copy required skills into Notes', 'https://www.linkedin.com/jobs/'],
  ['Amazon interview structure (SDE-1: 2 DSA+LP rounds, bar raiser, HR; SDE-2 adds LLD and an HLD round) + all 16 Leadership Principles', 'https://www.tryexponent.com/blog/what-are-the-amazon-leadership-principles'],
  ['STAR stories: Customer Obsession + Ownership', 'https://leetcode.com/discuss/post/437082/amazon-behavioral-questions-leadership-p-kvhl/'],
  ['STAR stories: Invent and Simplify + Are Right, A Lot', 'https://igotanoffer.com/blogs/tech/amazon-behavioral-interview'],
  ['STAR stories: Learn and Be Curious + Hire and Develop the Best', 'https://igotanoffer.com/blogs/tech/amazon-behavioral-interview'],
  ['STAR stories: Insist on the Highest Standards + Think Big', 'https://igotanoffer.com/blogs/tech/amazon-behavioral-interview'],
  ['STAR stories: Bias for Action + Frugality', 'https://igotanoffer.com/blogs/tech/amazon-behavioral-interview'],
  ['STAR stories: Earn Trust + Dive Deep', 'https://igotanoffer.com/blogs/tech/amazon-behavioral-interview'],
  ['STAR stories: Have Backbone; Disagree and Commit + Deliver Results', 'https://www.tryexponent.com/blog/how-to-nail-amazons-behavioral-interview-questions'],
  ['STAR stories: Earth\'s Best Employer + Success and Scale Bring Broad Responsibility', 'https://www.tryexponent.com/blog/how-to-nail-amazons-behavioral-interview-questions'],
  ['Google: Googleyness & leadership questions; map your stories to them', 'https://igotanoffer.com/blogs/tech/google-behavioral-interview'],
  ['Meta & Microsoft behavioral: conflict, growth, impact, ambiguity', 'https://www.techinterviewhandbook.org/behavioral-interview/'],
  ['"Tell me about yourself": write a 90-second pitch and record it', 'https://www.techinterviewhandbook.org/behavioral-interview/'],
  ['Project deep dive: your best project — architecture, trade-offs, numbers', 'https://www.techinterviewhandbook.org/behavioral-interview/'],
  ['Stories: 2 failures / mistakes and what you changed', 'https://www.techinterviewhandbook.org/behavioral-interview-questions/'],
  ['Stories: 2 conflicts (teammate, manager) and the outcome', 'https://www.techinterviewhandbook.org/behavioral-interview-questions/'],
  ['Stories: working with a customer or non-technical stakeholder (key for FDE roles)', ''],
  ['Write 10 good questions to ask interviewers', 'https://www.techinterviewhandbook.org/final-questions/'],
  ['Amazon OA: learn the format (coding 70 min, work simulation, work-style MCQs)', 'https://www.youtube.com/watch?v=56PjX-j0Nt4'],
  ['Amazon work simulation practice: email modules, prioritizing under ambiguity, debugging a product page, customer replies', 'https://www.youtube.com/watch?v=56PjX-j0Nt4'],
  ['Amazon work-style assessment: most/least-likely MCQs. Answer 20 sample items the LP way.', 'https://www.youtube.com/watch?v=56PjX-j0Nt4'],
  ['Microsoft: growth mindset stories (learning from failure, feedback, collaboration)', 'https://prepare.sh/articles/microsoft-interview-process-2026'],
  ['AI usage story: how you use AI tools day to day and how you review their output (asked at every company now)', ''],
  ['Target list: 40 companies in 3 tiers (big tech, AI companies with FDE roles, practice companies)', 'https://www.levels.fyi/'],
  ['Referrals: find 2 engineers per target company on LinkedIn', 'https://www.linkedin.com/'],
  ['Write your referral message template; send the first 10', ''],
  ['Practice aloud: 2 LP stories with a timer, get feedback from a friend', ''],
  ['Update resume with new skills; add a "Building now" line for your flagship project', 'https://www.techinterviewhandbook.org/resume/'],
  ['Practice aloud: "Why this company?" for your top 5', ''],
  ['Send 10 more referral requests', ''],
  ['Practice aloud: 2 stories you have not said out loud yet', ''],
];
// Career block after BEH runs out: a short application task + one FDE item each day.
const APPLY = [
  ['Apply / ask for referrals: 3–5 roles today, follow up on last week. Log them in Job tracker.', 'https://www.linkedin.com/jobs/'],
  ['Apply / ask for referrals: 3–5 roles today (mix big tech, AI companies, practice companies).', 'https://www.linkedin.com/jobs/'],
];

// Forward-deployed engineer track (career block, weeks 6–13), following roadmap.sh/forward-deployed-engineer stage by stage.
// Full stack, DSA, system design and most AI engineering are already covered by the daily blocks; these sessions fill the rest.
// "Rep" items are interview practice: decomposition, client simulation, practical coding, re-engineering, learning round, take-home.
const RM = 'https://roadmap.sh/forward-deployed-engineer';
const FDE = [
  ['Stage 1 · Intro: roles & responsibilities, FDE tiers, "from X to FDE". Read 5 real FDE postings; write your skills gap in Notes.', RM],
  ['Stage 1 · Glossary: Delta, UAT, last-mile integration, Day 2 operations, productized consulting, embedded engineering. Plus the interview loop.', 'https://careerservices.fas.harvard.edu/blog/2026/08/01/forward-deployed-engineer-interview-the-definitive-2026-guide-fde/'],
  ['Rep · Decomposition framework (use your template page), then rep 1, 45 min out loud: "Reduce traffic congestion in a city"', 'https://a10x.dev/blog/forward-deployed-engineer-interview-questions'],
  ['Stage 2 · Python for JS devs (the go-to FDE language): dicts, comprehensions, classes, files, JSON, CSV', 'https://docs.python.org/3/tutorial/'],
  ['Stage 2 · Python for data: pandas (load, filter, group, join)', 'https://pandas.pydata.org/docs/user_guide/10min.html'],
  ['Stage 2 · Git beyond basics: rebase, bisect, cherry-pick, conflicts in someone else\'s repo', 'https://roadmap.sh/git-github'],
  ['Stage 2 · Linux & shell: processes, permissions, ssh, grep/awk/jq, cron, logs. Debug a service on a VM.', 'https://roadmap.sh/shell-bash'],
  ['Rep · Practical coding (Python, 45 min): parse a log file and answer 5 questions about it', ''],
  ['Stage 4 · Data audit + data modeling: draw the schema of a messy sample database and spot the problems', 'https://roadmap.sh/data-engineer'],
  ['Stage 4 · SQL for analysis: CTEs + window functions (5 problems)', 'https://leetcode.com/studyplan/top-sql-50/'],
  ['Stage 4 · Data pipelines: ETL vs ELT, batch vs streaming, idempotent jobs, data quality checks', 'https://roadmap.sh/data-engineer'],
  ['Stage 4 · Data warehouses (BigQuery / Snowflake), star schema; Spark and Airflow at concept level (write one Airflow DAG)', 'https://airflow.apache.org/docs/apache-airflow/stable/tutorial/fundamentals.html'],
  ['Rep · Decomposition 2: "Let several teams query shared data without exposing raw records"', ''],
  ['Stage 5 · Context engineering + prompt management (templates, versioning, testing prompts)', 'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents'],
  ['Stage 5 · Choosing model providers: price, latency, quality, data policy. Build a wrapper that can switch providers.', 'https://artificialanalysis.ai/'],
  ['Stage 5 · Agents: memory & state, multi-agent patterns, when one agent is enough', 'https://roadmap.sh/ai-agents'],
  ['Stage 5 · Integration engineering: legacy systems (SOAP/XML, batch files, SFTP, webhooks, old auth). Wrap one in a clean REST API.', ''],
  ['Rep · Re-engineering round: clone an unfamiliar repo, find and fix a bug in 60 min (try with and without an AI coding tool)', 'https://github.com/topics/good-first-issue'],
  ['Stage 6 · AWS essentials: IAM, EC2, S3, Lambda, VPC basics', 'https://roadmap.sh/aws'],
  ['Stage 6 · Terraform: deploy a small app as infrastructure as code', 'https://developer.hashicorp.com/terraform/tutorials/aws-get-started'],
  ['Stage 6 · Containers: Dockerize your flagship project; Kubernetes pods, deployments, services', 'https://kubernetes.io/docs/tutorials/kubernetes-basics/'],
  ['Stage 6 · DevOps: CI/CD, environments, secrets, rollbacks. Add a deploy pipeline to your flagship project.', 'https://roadmap.sh/devops'],
  ['Rep · Client simulation 1: explain a delayed launch and a trade-off to a non-technical executive (record 5 min)', ''],
  ['Stage 7 · Eval pipelines: run evals in CI and block deploys when quality drops', 'https://hamel.dev/blog/posts/evals/'],
  ['Stage 7 · Debugging agent logic: traces, replaying runs, a failure taxonomy', 'https://langfuse.com/docs'],
  ['Stage 7 · Inference optimization: caching, batching, smaller models, streaming, latency budgets', ''],
  ['Stage 7 · Security: DevSecOps, API security, enterprise auth (SSO, SAML, OIDC)', 'https://owasp.org/www-project-api-security/'],
  ['Stage 7 · AI governance, data privacy & compliance: PII/PHI, GDPR/HIPAA basics, audit logs, data residency', 'https://owasp.org/www-project-top-10-for-large-language-model-applications/'],
  ['Stage 7 · MLOps basics: model and prompt versioning, drift monitoring, staged rollouts', 'https://roadmap.sh/mlops'],
  ['Rep · Learning round: learn an API you have never used in 30 min, then build with it', ''],
  ['Stage 8 · Discovery: requirements gathering. Write 10 scoping questions for an AI support assistant, run a mock discovery call.', ''],
  ['Stage 8 · Scoping & sequencing; scope vs speed vs quality. Write a phased plan: pilot → UAT → rollout → Day 2.', ''],
  ['Stage 8 · Business acumen: enterprise workflows, ROI & AI impact. Build an ROI estimate for an AI assistant.', ''],
  ['Stage 8 · Stakeholder management + the product feedback loop (field → product team)', ''],
  ['Stage 8 · Communication: technical writing, executive reporting, time-to-value. Write a 1-page solution doc + a weekly status update.', ''],
  ['Rep · Decomposition 3: "Help a clinic reduce missed appointments using AI"', ''],
  ['Rep · Client simulation 2: the customer says your AI tool gave a wrong answer to their CEO', ''],
  ['Rep · Take-home day 1: scope an LLM workflow for a fake customer (invoice extraction)', ''],
  ['Rep · Take-home day 2: build it end to end (Python or TypeScript), deployed', ''],
  ['Rep · Take-home day 3: evals, failure handling, a customer-facing README and a 3-min demo', ''],
  ['Rep · Decomposition 4: "An insurer wants to cut claims processing from 10 days to 2"', ''],
  ['Rep · Mock FDE loop with a peer: decomposition + client simulation', 'https://www.tryexponent.com/practice'],
];
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

// Evening AI block. Courses and papers spread over 2–4 days each, with applied builds in between.
const AI_UNITS = [
  ['Neural network basics · 3Blue1Brown', [
    ['Ch 1: What is a neural network?', 'https://www.youtube.com/watch?v=aircAruvnKk'],
    ['Ch 2: Gradient descent, how networks learn', 'https://www.youtube.com/watch?v=IHZwWFHWa-w'],
    ['Ch 3: Backpropagation, intuitively', 'https://www.youtube.com/watch?v=Ilg3gGewQ5U'],
    ['Ch 4: Backpropagation calculus. Write a 5-line summary of all 4 chapters.', 'https://www.youtube.com/watch?v=tIeHLnjs5U8'],
  ]],
  ['Transformers, visually · 3Blue1Brown', [
    ['Ch 5: Transformers, the tech behind LLMs (tokens, embeddings)', 'https://www.youtube.com/watch?v=wjZofJX0v4M'],
    ['Ch 6: Attention in transformers', 'https://www.youtube.com/watch?v=eMlx5fFNoYc'],
    ['Ch 7: How LLMs might store facts (MLP layers)', 'https://www.youtube.com/watch?v=9-Jl0dxWQs8'],
  ]],
  ['Paper · Attention Is All You Need (2017)', [
    ['Read the Illustrated Transformer first, then the paper\'s abstract, intro and Figure 1', 'https://jalammar.github.io/illustrated-transformer/'],
    ['Paper §3.1–3.2: encoder/decoder stacks, scaled dot-product + multi-head attention', 'https://arxiv.org/abs/1706.03762'],
    ['Paper §3.3–3.5: feed-forward layers, embeddings, positional encoding', 'https://arxiv.org/abs/1706.03762'],
    ['Skim the Annotated Transformer code; write a 1-page summary and explain it out loud in 3 min', 'https://nlp.seas.harvard.edu/annotated-transformer/'],
  ]],
  ['Course · Karpathy: Let\'s build GPT from scratch', [
    ['Part 1 (0:00–0:40): data, tokenization, bigram model. Code along.', 'https://www.youtube.com/watch?v=kCc8FmEb1nY'],
    ['Part 2 (0:40–1:20): self-attention from scratch. Code along.', 'https://www.youtube.com/watch?v=kCc8FmEb1nY'],
    ['Part 3 (1:20–end): multi-head attention, blocks, training. Push your notebook.', 'https://www.youtube.com/watch?v=kCc8FmEb1nY'],
  ]],
  ['Course · Karpathy: Deep dive into LLMs like ChatGPT', [
    ['Pretraining: data, tokens, the base model', 'https://www.youtube.com/watch?v=7xTGNNLPyMI'],
    ['Post-training: SFT, hallucinations, tool use', 'https://www.youtube.com/watch?v=7xTGNNLPyMI'],
    ['Reinforcement learning, reasoning models, what is coming. Summarize in AI notes.', 'https://www.youtube.com/watch?v=7xTGNNLPyMI'],
  ]],
  ['Build · Talking to models from code', [
    ['Call an LLM API from TypeScript; then stream tokens into a React component', 'https://docs.anthropic.com/en/docs/build-with-claude/streaming'],
    ['Structured output: JSON schema + Zod validation', 'https://zod.dev/'],
    ['Prompting properly: clear instructions, examples, XML structure. Rewrite 3 prompts.', 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview'],
  ]],
  ['Paper · GPT-3: Language Models are Few-Shot Learners (2020)', [
    ['Abstract, intro, Figure 1.1–1.3: what in-context learning means', 'https://arxiv.org/abs/2005.14165'],
    ['§2 Approach + skim §3 results tables', 'https://arxiv.org/abs/2005.14165'],
    ['§5 Limitations + §6 Broader impacts. Write 5 bullets.', 'https://arxiv.org/abs/2005.14165'],
  ]],
  ['Paper · InstructGPT: training with human feedback (RLHF, 2022)', [
    ['Abstract, intro, Figure 2 (the 3-step RLHF pipeline)', 'https://arxiv.org/abs/2203.02155'],
    ['§3 Methods: SFT, reward model, PPO', 'https://arxiv.org/abs/2203.02155'],
    ['§4 Results + §5 Discussion. Explain RLHF in 2 minutes out loud.', 'https://arxiv.org/abs/2203.02155'],
  ]],
  ['Build · Tools and embeddings', [
    ['Tool use / function calling: build the tool-call loop', 'https://docs.anthropic.com/en/docs/build-with-claude/tool-use/overview'],
    ['Embeddings + cosine similarity: embed 50 sentences, find neighbours', 'https://platform.openai.com/docs/guides/embeddings'],
    ['Vector storage with Postgres + pgvector', 'https://github.com/pgvector/pgvector'],
  ]],
  ['Paper · RAG: Retrieval-Augmented Generation (2020) + build', [
    ['Read the RAG paper: abstract, §2 methods, Figure 1', 'https://arxiv.org/abs/2005.11401'],
    ['Read Contextual Retrieval: why chunking and reranking matter', 'https://www.anthropic.com/news/contextual-retrieval'],
    ['Build RAG over your own Notes with citations', ''],
  ]],
  ['Paper · Chain-of-Thought Prompting (2022) + reasoning models', [
    ['Read the CoT paper: abstract, Figures 1–4', 'https://arxiv.org/abs/2201.11903'],
    ['Extended thinking / reasoning models: when they help, what they cost', 'https://docs.anthropic.com/en/docs/build-with-claude/extended-thinking'],
  ]],
  ['Paper · ReAct (2022) + building agents', [
    ['Read ReAct: reasoning + acting loop, Figure 1', 'https://arxiv.org/abs/2210.03629'],
    ['Read Building Effective Agents: the 5 workflow patterns', 'https://www.anthropic.com/engineering/building-effective-agents'],
    ['Build a small agent with 2 tools; log every step', ''],
  ]],
  ['Build · MCP + AI SDK', [
    ['Model Context Protocol: build a tiny MCP server with one tool', 'https://modelcontextprotocol.io/introduction'],
    ['Vercel AI SDK: useChat, streaming, tool calls in React', 'https://ai-sdk.dev/docs/introduction'],
  ]],
  ['Evals · testing LLM features', [
    ['Read Hamel Husain on evals: why and how', 'https://hamel.dev/blog/posts/evals/'],
    ['Write 20 test cases for your RAG bot + a pass-rate script', ''],
    ['LLM-as-judge: add a grader, check it against your own labels', ''],
  ]],
  ['Papers · Scaling laws (2020) + Chinchilla (2022)', [
    ['Scaling laws: abstract + Figure 1. What grows with compute?', 'https://arxiv.org/abs/2001.08361'],
    ['Chinchilla: compute-optimal training, Figure 1 + conclusions', 'https://arxiv.org/abs/2203.15556'],
    ['Write: why models keep getting better and what limits them (5 bullets)', ''],
  ]],
  ['Paper · LoRA (2021) + when to fine-tune', [
    ['LoRA: abstract, Figure 1, §4 method', 'https://arxiv.org/abs/2106.09685'],
    ['Prompting vs RAG vs fine-tuning: decision table with 3 examples', 'https://platform.openai.com/docs/guides/optimizing-llm-accuracy'],
  ]],
  ['Paper · Constitutional AI (2022) + AI security', [
    ['Constitutional AI: abstract, Figure 1, the critique-revise loop', 'https://arxiv.org/abs/2212.08073'],
    ['OWASP Top 10 for LLM apps: prompt injection, data leakage', 'https://owasp.org/www-project-top-10-for-large-language-model-applications/'],
    ['Attack your own app with 5 injections; fix 2', ''],
  ]],
  ['Paper · Lost in the Middle (2023) + cost and latency', [
    ['Lost in the Middle: how models use long context', 'https://arxiv.org/abs/2307.03172'],
    ['Prompt caching, model choice, cost estimate for 10k users', 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching'],
  ]],
  ['Build · Production AI features', [
    ['LLM observability: trace prompts, latency, user feedback', 'https://langfuse.com/docs'],
    ['Multimodal: let users upload a screenshot and ask about it', 'https://docs.anthropic.com/en/docs/build-with-claude/vision'],
    ['AI in the browser: run a small model with transformers.js', 'https://huggingface.co/docs/transformers.js/index'],
  ]],
  ['Design · System design for AI products', [
    ['Design an AI chat product at scale: streaming, rate limits, queues, caching', ''],
    ['Design RAG at scale: ingestion pipeline, re-indexing, permissions, evals', ''],
    ['Design an AI feature rollout: eval gates, feature flags, fallbacks', ''],
  ]],
  ['Working with AI coding tools', [
    ['Build a feature with an AI assistant; review every line; note what it got wrong', 'https://docs.anthropic.com/en/docs/claude-code/overview'],
    ['AI-assisted coding round practice: solve a machine-coding task with AI, narrating decisions', ''],
    ['Write a short post about something you built with AI', 'https://www.linkedin.com/'],
  ]],
];
// After the units run out: explain-it-back revision.
const AI_REVIEW = ['Transformers and attention', 'RLHF', 'RAG', 'Agents and tool use', 'Evals', 'Scaling laws', 'Fine-tuning vs RAG', 'Prompt injection'].map(t => [`Explain it back, 3 min out loud, then write 3 flashcards: ${t}`, '']);
const AI_NEWS = [
  ['TLDR AI', 'https://tldr.tech/ai'], ["Simon Willison's blog", 'https://simonwillison.net/'], ['The Batch', 'https://www.deeplearning.ai/the-batch/'],
  ['Hacker News', 'https://news.ycombinator.com/'], ['LMArena leaderboard (how models compare)', 'https://lmarena.ai/leaderboard'], ['Artificial Analysis (speed, price, quality)', 'https://artificialanalysis.ai/'],
  ['Latent Space', 'https://www.latent.space/'],
];

// Advanced DSA from the board (revision block, s40–s56, every other day).
const ADV_DSA = [
  ['Advanced DSA: Union-Find / DSU', 'https://leetcode.com/discuss/post/1072418/disjoint-set-union-dsuunion-find-a-compl-2oqn/'],
  ['Advanced DSA: Difference array', 'https://medium.com/@p.thapar99/the-beauty-of-difference-array-technique-in-problem-solving-6d45eb726531'],
  ['Advanced DSA: Line sweep', 'https://leetcode.com/discuss/post/2166045/line-sweep-algorithms-by-c0d3m-8ebq/'],
  ['Advanced DSA: Fenwick tree (BIT)', 'https://leetcode.com/discuss/post/1093346/introduction-to-fenwick-treebinary-index-tp6h/'],
  ['Advanced DSA: Segment tree', 'https://www.youtube.com/watch?v=jGA1DonowlQ'],
  ['Advanced DSA: DP on trees', 'https://www.youtube.com/watch?v=kM3A6AjHvjM'],
  ['Advanced DSA: Digit DP', 'https://www.youtube.com/watch?v=KaU-AM8wo4Q'],
  ['DP roadmap: map the DP patterns you know vs the ones you don\'t', 'https://www.reddit.com/r/leetcode/comments/14o10jd/the_ultimate_dynamic_programming_roadmap/'],
];

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
