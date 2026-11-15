/* eslint-disable */
// Frontend, senior (roadmap v3 §7; the `ai` track, cat `fe`, 60 min, evening): 78 rows, one per slot, in slot order.
// No basics and no padding: architecture, performance, React internals, real-world debugging, frontend system design and
// timed interview reps. FRONTEND is composed from WEEKDAYS (65) and REPS (13): every Saturday is a timed JS/React rep.
// Weeks 1–3: rendering and the browser, React internals, real-world debugging. Week 4: the 4 FE SD concept slots, then
// one data topic. Weeks 5–10: each week is a design (2 slots), a topic, a design (2 slots). Weeks 11–13: the remaining
// topics with the 6 machine-coding rehearsal reps (interview rehearsal, AI off) between them.
// Row format: the plan's "Content row format" (tracks.ts expandRow). A v2 id keeps its v2 url; `covers` lists the v2 ids
// a row absorbs (the JS ids are the themes of the Saturday reps, practised rather than taught). Every Do task is
// TypeScript or a DevTools exercise on your own code; an AI assistant is allowed outside the rehearsal reps.
// New URLs checked 2026-11-15 (curl; bigfrontend.dev returns real 404s, so its paths are verified).

const BFE = 'https://bigfrontend.dev';
const RUBRIC = 'https://www.techinterviewhandbook.org/coding-interview-rubrics/';
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/';
const PLAYBOOK = 'https://www.greatfrontend.com/front-end-system-design-playbook';
const gfe = (slug) => `https://www.greatfrontend.com/questions/system-design/${slug}`;

/** Saturday: a timed interview rep, one task. */
const rep = (id, mins, text, url, url2, covers) => ({
  id: `fe:rep-${id}`, kind: 'rep', mins, text: `Timed rep (${mins} min): ${text}`, url, ...(url2 ? { url2 } : {}), ...(covers ? { covers } : {}),
});

/** Weeks 11–13: a machine-coding interview rehearsal (v2 mc:* id), 45 min, AI off, checked against an APG pattern after. */
const rehearsal = (id, build, url, check) => ({
  id, kind: 'rep', mins: 45, url,
  text: `Interview rehearsal (45 min, AI off): in React and TypeScript, from a blank file, build ${build}. Talk out loud as in a real round. When the timer ends, check your build against the ${check} and write down what you missed.`,
});

/** FE design, slot 1: the prompt, a 45-min design of your own with RADIO, then the comparison. `src` says what the link holds:
 * 'answer' (a worked GreatFrontEnd answer), 'playbook' (the RADIO playbook; no worked answer) or 'post' (an engineering post). */
const design = (slug, name, prompt, focus, deep, url, src, covers) => ({
  id: `sd:fe-${slug}`, url, ...(covers ? { covers } : {}),
  understand: `FE system design · Design ${name}. The prompt: ${prompt} ${{
    answer: 'Open the link for the requirements only; stop before the solution.',
    playbook: 'Keep the playbook open for its RADIO checklist only; there is no worked answer to peek at.',
    post: 'Do not read the linked post yet.',
  }[src]}`,
  do: `Design it yourself, 45 min, timed and out loud, with RADIO: requirements, architecture (component tree, where state lives), data model, interface (API and component props), optimizations. Spend the last 15 min on 2 deep dives: ${focus}. Draw it in Excalidraw.`,
  explain: `${{
    answer: 'Now read the full answer at the link and compare it with your design.',
    playbook: "Now compare your design with the playbook's RADIO checklist, section by section, and mark each part that is thin.",
    post: 'Now read the linked post and compare it with your design.',
  }[src]} Name 3 trade-offs you would defend, out loud, 3 min. Deep enough when you can ${deep}.`,
});

/** FE design, slot 2: a deep dive on the design's hardest part. */
const deepDive = (slug, title, understand, url, doTask, explain) => ({
  id: `sd:fe-${slug}:deep-dive`, url, understand: `Deep dive · ${title}: ${understand}`, do: doTask, explain,
});

// ---------- the 65 weekday rows, in order ----------
const WEEKDAYS = [
  // ---------- Week 1: rendering and the browser ----------
  { id: 'fe:rendering-path', url: 'https://web.dev/articles/critical-rendering-path', url2: 'https://developer.chrome.com/docs/devtools/performance/reference',
    understand: 'Rendering and the browser · The pixel pipeline: parse HTML and CSS, style, layout, paint, composite. What triggers reflow vs repaint vs composite only, how render-blocking CSS and parser-blocking scripts delay first paint, and what forced synchronous layout is. Read the guide, then the Performance panel reference.',
    do: 'Record a Performance trace in DevTools on a heavy page of your flagship (or any large site). Find one forced reflow or layout thrash (reading offsetHeight after a style write, in a loop), fix it in TypeScript by batching reads before writes, and record again. Note the layout time before and after.',
    explain: 'Out loud, 3 min: what happens between a style change and pixels on screen. Deep enough when you can look at a trace and say which work is style, layout, paint or composite, and which line of code caused it.' },
  { id: 'fe:animation-performance', url: 'https://web.dev/articles/animations-guide',
    understand: 'Rendering and the browser · Animation performance: compositor-only properties (transform, opacity), will-change and the memory cost of layers, requestAnimationFrame timing, and the FLIP technique for layout animations. Read the guide.',
    do: 'In a TypeScript scratch page, animate a list reorder two ways: by changing top and left, then with FLIP (measure First and Last, Invert with a transform, Play). Record both in the Performance panel with 4x CPU throttling and compare dropped frames.',
    explain: 'Out loud, 3 min: why a transform animation stays smooth while the main thread is busy and a top/left animation does not. Deep enough when you can say when will-change helps, when it wastes GPU memory, and how FLIP avoids layout on every frame.' },
  { id: 'fe:web-vitals', url: 'https://web.dev/articles/vitals', url2: 'https://web.dev/articles/optimize-inp',
    understand: 'Rendering and the browser · Core Web Vitals in depth: LCP and its 4 sub-parts, INP (input delay, processing time, presentation delay), CLS and its session windows; field data vs lab data; profiling long tasks in DevTools. Read the vitals page, then the INP optimization guide.',
    do: 'Profile one slow interaction on your flagship (or a heavy site) in DevTools with 4x CPU throttling. Find the long task behind it, split it in TypeScript (yield with scheduler.yield or setTimeout, or move work off the click path), and measure INP again with the web-vitals library.',
    explain: 'Out loud, 3 min: what each vital measures and its "good" threshold. Deep enough when you can take a 600 ms INP and say which of its 3 phases to attack first, and how.' },
  { id: 'fe:types-memory', url: 'https://javascript.info/garbage-collection', url2: 'https://developer.chrome.com/docs/devtools/memory-problems/heap-snapshots',
    understand: 'Rendering and the browser · V8 under the hood: the Ignition interpreter and the TurboFan JIT, hidden classes and inline caches, deoptimization; generational garbage collection (young-generation scavenge, old-generation mark-compact); WeakMap and WeakRef; how memory leaks happen in single-page apps. Read the GC chapter, then the heap snapshot guide.',
    do: 'In a TypeScript scratch app, write 3 leaks: a detached DOM node kept in an array, an event listener never removed, and a cache Map keyed by objects that only grows. Find each with heap snapshots (comparison view, retainers), then fix them, one with a WeakMap.',
    explain: 'Out loud, 3 min: why an object that changes shape is slower, and what a GC pause costs the user. Deep enough when you can read a retainer path in a heap snapshot and say which reference keeps the object alive.' },
  { id: 'fe:js-concurrency', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API',
    understand: 'Rendering and the browser · Concurrency in the browser: the main thread vs Web Workers, structured clone vs transferable objects, SharedArrayBuffer and Atomics (and the cross-origin isolation they need), and race conditions in async code, such as two fetches where the last response wins. Read the Workers API guide.',
    do: 'In TypeScript, move a CPU-heavy job (parse and sort 200k rows) into a Web Worker with a typed message protocol. Transfer an ArrayBuffer instead of copying it and time both. Then fix a race where two searches resolve out of order, with a request id or an AbortController.',
    explain: 'Out loud, 3 min: what a worker can and cannot touch, and what posting a message costs. Deep enough when you can choose, for a given job, between a worker, chunking on the main thread, and doing it on the server.' },

  // ---------- Week 2: React internals and concurrency ----------
  { id: 'fe:react-rendering', url: 'https://react.dev/learn/preserving-and-resetting-state', url2: 'https://github.com/acdlite/react-fiber-architecture',
    understand: 'React internals · Fiber and reconciliation: the render phase (interruptible, builds a work-in-progress fiber tree) vs the commit phase (synchronous DOM writes, layout effects, then passive effects); lanes and priorities; how keys and element type decide whether state is kept. Read the React page, then the Fiber architecture notes.',
    do: 'In a TypeScript React scratch app, build a reorderable list with index keys and an input in each row, show the typed text jumping to the wrong row, then fix it with stable ids. Use React DevTools "Highlight updates" and the Profiler to show which components re-render.',
    explain: 'Out loud, 3 min: what happens between setState and the DOM update. Deep enough when you can say why the render phase may run twice or be thrown away, and why side effects belong in effects, not in render.' },
  { id: 'mc:mini-react', covers: ['mc:vdom-diff'], url: 'https://pomb.us/build-your-own-react/', url2: 'https://legacy.reactjs.org/docs/reconciliation.html',
    understand: 'React internals · Read and explain a mini React: createElement, a render loop over fiber units of work, the commit phase, reconciliation of children (the virtual DOM diff) and useState with a hook queue. Read "Build your own React" end to end, then the reconciliation heuristics (same type keeps the node, keys match children).',
    do: 'In a TypeScript scratch file, write the diff step yourself: given old and new child arrays of { type, key, props }, return a list of PLACEMENT, UPDATE and DELETION operations. Test it on a reorder, an insert in the middle and a type change. An AI assistant may help, but you write the tests.',
    explain: 'Out loud, 3 min: how useState knows which state belongs to which call. Deep enough when you can explain, with the hook list on the fiber, why hooks must not be called conditionally.' },
  { id: 'fe:react-hooks', covers: ['fe:react-memo', 'fe:custom-hooks'], url: 'https://react.dev/learn/synchronizing-with-effects', url2: 'https://react.dev/reference/react/memo',
    understand: 'React internals · Hooks internals and re-render rules: the hook list on each fiber, dependency comparison with Object.is, stale closures, refs as mutable boxes; when a component re-renders (its state, its parent, a context it reads) and what memo, useMemo and useCallback actually skip; custom hooks that compose. Read the effects guide, then the memo reference.',
    do: 'In a TypeScript React scratch app, fix 3 stale-closure bugs (a setInterval counter, a handler registered once, a debounced callback). Then find one wasted re-render tree with the Profiler and remove it, and write a custom hook useLatest(value) that the fixes can share.',
    explain: 'Out loud, 3 min: the 3 reasons a component re-renders and the 2 ways to stop one. Deep enough when you can read a useEffect and say what runs when, and why adding the missing dependency is usually right and silencing the lint rule is not.' },
  { id: 'fe:react-compiler', url: 'https://react.dev/learn/react-compiler',
    understand: 'React internals · The React Compiler: it memoizes components and hooks at build time, relies on the Rules of React (pure render, no mutation of props or state), and bails out of code that breaks them. What it changes for useMemo and useCallback. Read the compiler docs.',
    do: 'Turn the compiler on (babel-plugin-react-compiler) in a TypeScript React scratch app or a branch of your flagship. In React DevTools, see which components got the compiler badge, find one it skipped, and fix the rule that component broke.',
    explain: 'Out loud, 3 min: what the compiler memoizes and what it cannot. Deep enough when you can tell an interviewer when you would still write useMemo by hand with the compiler on.' },
  { id: 'fe:react-concurrent', url: 'https://react.dev/reference/react/useTransition', url2: 'https://react.dev/reference/react/useOptimistic',
    understand: 'React internals · Concurrent React: transitions and lanes, useTransition and useDeferredValue, interruptible rendering and tearing, React 19 actions, useActionState and useOptimistic. Read the useTransition reference, then useOptimistic.',
    do: 'In a TypeScript React scratch app, make a filter over 20k rows responsive: measure input lag with the Profiler, wrap the list update in startTransition, then compare with useDeferredValue. Add an optimistic "like" with useOptimistic that rolls back when the request fails.',
    explain: 'Out loud, 3 min: what interruptible rendering means for the user. Deep enough when you can say when a transition helps and when only moving the work off the main thread will.' },

  // ---------- Week 3: React internals (end), real-world debugging ----------
  { id: 'fe:forms-suspense', url: 'https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary', url2: 'https://react.dev/reference/react/Suspense',
    understand: 'React internals · Suspense, error boundaries and portals: how a suspended component shows the nearest boundary, nested boundaries and loading sequences, streaming SSR with Suspense, error boundaries for render errors (and what they do not catch), portals and event bubbling through the React tree. Read the error boundary reference, then Suspense.',
    do: 'In a TypeScript React scratch app, build a page with 2 nested Suspense boundaries over slow data, an error boundary with a retry that resets it, and a portal-based modal. Show that a click inside the portal bubbles to a React parent outside it in the DOM.',
    explain: 'Out loud, 3 min: where you would put Suspense and error boundaries on a dashboard. Deep enough when you can say which errors an error boundary misses (event handlers, async code) and how you catch those.' },
  { id: 'fe:react-rsc', url: 'https://nextjs.org/docs/app/getting-started/server-and-client-components', url2: 'https://www.patterns.dev/react/react-server-components/',
    understand: 'React internals · Server Components and hydration: SSR vs RSC (how HTML is produced vs where a component runs), the RSC payload, the "use client" boundary and what can cross it (serializable props only), server actions, streaming and selective hydration. Read the Next.js guide, then the patterns.dev chapter.',
    do: 'In a TypeScript Next.js scratch app (or your flagship), move one data-heavy component to a Server Component and keep one interactive leaf as a Client Component. Compare the client JS before and after (next build output) and inspect the RSC payload in the Network panel.',
    explain: 'Out loud, 2 min: RSC vs SSR. Deep enough when you can say why passing a function from a Server Component to a Client Component fails, and how a server action replaces it.' },
  { id: 'fe:debug-observability', url: 'https://developer.chrome.com/docs/devtools/javascript/source-maps', url2: 'https://github.com/GoogleChrome/web-vitals',
    understand: 'Real-world debugging · Browser observability: real user monitoring (web-vitals with attribution, sent with sendBeacon), error tracking (window.onerror, unhandledrejection, error boundaries), source maps in production (hidden maps uploaded to the error tracker), release tags and sampling. Read the DevTools source maps guide, then the web-vitals README on the attribution build.',
    do: 'In your flagship (TypeScript), add a small RUM module: report LCP, INP and CLS with attribution, and every uncaught error with the release version, to one endpoint (a route handler that logs is enough). Build with hidden source maps and resolve one minified stack trace back to its source line.',
    explain: 'Out loud, 3 min: how you would find out that checkout got slow for Android users after a release. Deep enough when you can go from a minified production stack trace to the line that threw, and say what the RUM data must hold to show a regression per release.' },
  { id: 'fe:debug-hydration', url: 'https://react.dev/reference/react-dom/client/hydrateRoot', url2: 'https://nextjs.org/docs/messages/react-hydration-error',
    understand: 'Real-world debugging · Hydration mismatches: what React compares when it hydrates server HTML, the usual causes (Date.now or Math.random in render, locale and time zone formatting, typeof window branches, browser extensions, invalid HTML nesting), what React does on a mismatch, and when suppressHydrationWarning is honest. Read the hydrateRoot section on different client and server content, then the Next.js error page.',
    do: 'In a TypeScript Next.js scratch app, cause 3 mismatches on purpose: a timestamp, a locale-formatted price, a window check in render. Read each error, then fix each the right way: compute on the server only, move the client-only value into an effect, or render twice.',
    explain: 'Out loud, 3 min: why a mismatch is a bug and not just a warning. Deep enough when you can debug a mismatch that only happens for users in another time zone.' },
  { id: 'fe:debug-effect-races', url: 'https://react.dev/learn/you-might-not-need-an-effect', url2: 'https://react.dev/reference/react/useEffect',
    understand: 'Real-world debugging · Race conditions and stale data in effects: out-of-order responses, setState after unmount, StrictMode running effects twice in development, the ignore flag and AbortController patterns, effects that should not exist (derived state, event logic), and why data libraries dedupe and cancel for you. Read "You might not need an effect", then the useEffect data fetching section.',
    do: 'In a TypeScript React scratch app, build a profile view that fetches by userId, switch ids fast on a throttled network, and show the wrong profile winning. Fix it with an ignore flag, then with AbortController, then delete the effect and use TanStack Query. Write a test with fake timers that reproduces the race.',
    explain: 'Out loud, 3 min: how stale data reaches the screen. Deep enough when you can look at an effect in code review and say whether it races, leaks or should not be an effect at all.' },

  // ---------- Week 4: the 4 FE SD concept slots, then the client data layer ----------
  { id: 'sd:fe-radio', url: PLAYBOOK,
    understand: 'FE system design · The RADIO framework: Requirements (functional, non-functional, scope), Architecture (components and where state lives), Data model (client store and server entities), Interface (the API between client and server, and between components), Optimizations (performance, network, accessibility, security). How a 45-min frontend round is timed. Read the playbook.',
    do: 'Write the one-page RADIO template you will use for all 12 designs: the questions you ask under each letter and a time box (R 5 min, A 10, D 5, I 10, O 15). Fill it in on a quick 15-min pass at a Twitter-like timeline.',
    explain: 'Out loud, 3 min: how a frontend design round differs from a backend one. Deep enough when you can run the first 5 minutes of a round (clarifying questions and scope) without notes.' },
  { id: 'sd:fe-rendering', url: 'https://www.patterns.dev/react/',
    understand: 'FE system design · Rendering strategies: CSR, SSR, SSG, ISR, streaming SSR, islands and partial hydration, React Server Components; what each costs in TTFB, LCP, INP, server load and cacheability. Read the patterns.dev rendering chapters.',
    do: 'Make a table for 5 products (marketing site, news article, logged-in dashboard, e-commerce product page, chat app): pick a rendering strategy for each and fill in its effect on TTFB, LCP, caching and the JavaScript shipped.',
    explain: 'Out loud, 3 min: your product page choice. Deep enough when you can defend a rendering choice against an interviewer who asks "why not just SSR everything?"' },
  { id: 'sd:fe-network-data', url: 'https://namastedev.com/learn/namaste-frontend-system-design', url2: 'https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates',
    understand: 'FE system design · The network and data layer: REST vs GraphQL from the client, a normalized client cache, request dedupe, offset vs cursor pagination, optimistic updates and rollback, offline queues, keeping tabs in sync. Read the course module, then the TanStack Query optimistic updates guide.',
    do: 'In TypeScript, write a tiny normalized cache: entities by type and id, queries as lists of ids, an update that changes every view of an entity, and an optimistic mutation that rolls back on failure. Sync it across tabs with BroadcastChannel.',
    explain: 'Out loud, 3 min: how an optimistic update rolls back when the server rejects it, and what the normalized cache shows in a second tab. Deep enough when you can choose between a normalized cache and per-query caching for a given product.' },
  { id: 'sd:fe-performance', url: 'https://web.dev/learn/performance',
    understand: 'FE system design · Performance at scale: performance budgets, bundle splitting by route and by interaction, image strategy (formats, sizes, priority hints, lazy loading), font loading, the caching layers (HTTP, CDN, service worker, in memory), prefetching, and keeping vitals from regressing (CI budgets, RUM alerts). Read the course.',
    do: 'Write a performance budget for your flagship: JavaScript per route, LCP and INP targets, image weight. Add one check to CI in TypeScript that reads the build output and fails a route over its JavaScript budget.',
    explain: 'Out loud, 3 min: the optimizations section of a design answer. Deep enough when you can list, in priority order, what you would do about a slow LCP on mobile and how you would prove each step helped.' },
  { id: 'fe:rest-graphql-fetch', url: 'https://developer.mozilla.org/en-US/docs/Web/API/AbortController',
    understand: 'Data and the network · REST vs GraphQL vs gRPC-web from the client: over-fetching, N+1 requests from components, GraphQL caching and persisted queries, fetch semantics (it does not reject on 4xx or 5xx), timeouts, retries with backoff and jitter, cancellation with AbortController and AbortSignal.any. Read the AbortController docs.',
    do: 'In TypeScript, write a typed apiFetch<T>(url, { timeoutMs, retries, signal }) that rejects on non-2xx with a typed error, retries only idempotent requests with exponential backoff and jitter, and combines the caller\'s signal with the timeout. Test it against a mock server.',
    explain: 'Out loud, 3 min: when you would pick GraphQL for a frontend, and what it costs. Deep enough when you can say which requests are safe to retry and why a POST needs an idempotency key first.' },

  // ---------- Week 5: news feed, real-time transports, autocomplete ----------
  design('news-feed', 'a news feed', 'a social news feed: infinite scroll, posts with images and reactions, new posts arriving in real time, and a composer with image upload.',
    'feed pagination and freshness; the composer and optimistic posting',
    'explain how new posts appear without the feed jumping, and how a post shows up before the server confirms it',
    gfe('news-feed-facebook'), 'answer', ['sdm:fe-news-feed']),
  deepDive('news-feed', 'News feed at Facebook scale',
    'how Facebook rebuilt facebook.com: CSS extracted at build time, code split by what renders first, data-driven code loading, and data fetched in parallel with the code. Read the post.',
    'https://engineering.fb.com/2020/05/08/web/facebook-redesign/',
    'In a TypeScript React scratch app, build the hard part of a feed: cursor pagination with an IntersectionObserver sentinel, a "N new posts" pill instead of inserting posts above the reader, and the scroll position kept when the user comes back from a post.',
    'Out loud, 3 min: how you keep a feed fast after 500 posts. Deep enough when you can say when you would add virtualization and what it breaks (find in page, screen readers, scroll restoration).'),
  { id: 'fe:websockets-sse', url: 'https://javascript.info/websocket', url2: 'https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events',
    understand: 'Data and the network · Real-time transports: WebSockets (handshake, frames, backpressure, no built-in reconnect), Server-Sent Events (automatic reconnect, Last-Event-ID, friendly to HTTP/2), long polling; heartbeats, reconnect with backoff, and what load balancers do to long-lived connections. Read the WebSocket chapter, then the MDN SSE guide.',
    do: 'In TypeScript, write a ReconnectingSocket: exponential backoff with jitter, a heartbeat that detects a dead connection, a send queue while offline, and resubscribe on reconnect. Kill the server mid-stream and check that nothing is lost or sent twice.',
    explain: 'Out loud, 3 min: WebSockets vs SSE vs long polling on latency, scale and fallbacks. Deep enough when you can pick one for a stock ticker, a chat and an AI token stream, and say why.' },
  design('autocomplete', 'search autocomplete', 'a search autocomplete used on many pages: results as you type, recent searches, keyboard support, and rich results with text and images.',
    'the request path (debounce, cache, races); the results UI and its accessibility',
    'say how the component stays reusable across products while one team owns it',
    gfe('autocomplete'), 'answer', ['sdm:fe-autocomplete']),
  deepDive('autocomplete', 'Autocomplete',
    'the combobox pattern (aria-expanded, aria-activedescendant, listbox options, the keyboard model) and the client side of the data path (debounce, a cache keyed by query, guarding against stale responses). Read the APG combobox pattern.',
    `${APG}combobox/`,
    'In TypeScript, write the data layer of an autocomplete with no UI: a debounced query function with an LRU cache by query, prefix reuse (results for "rea" filtered locally for "reac"), and cancellation of stale requests. Test it with fake timers.',
    'Out loud, 3 min: the path from keystroke to rendered results. Deep enough when you can say how you would tune the debounce, the cache size and the minimum query length from real traffic.'),

  // ---------- Week 6: chat, state management, e-commerce ----------
  design('chat-app', 'a chat app', 'a web chat client: 1:1 and group conversations, presence, typing indicators, delivery and read receipts, and offline support.',
    'the real-time transport and reconnect; message order and receipts while offline',
    'say what happens to a message sent while offline when the client reconnects, and how you keep message order and receipts right',
    gfe('chat-application-messenger'), 'answer', ['sdm:fe-chat-app']),
  deepDive('chat-app', 'Chat client',
    'how Messenger rebuilt its client around a local database that syncs with the server (Project LightSpeed), so the UI reads from local state and sync runs underneath. Read the post.',
    'https://engineering.fb.com/2020/03/02/data-infrastructure/messenger/',
    'In TypeScript, write the outbox of a chat client: each message gets a client id and a pending state, is stored in IndexedDB, is sent in order when the socket reconnects, and is deduped against the server echo. Go offline in DevTools and check order and receipts.',
    'Out loud, 3 min: the life of one message from send to read receipt. Deep enough when you can keep order and receipts right across 2 tabs and a flaky network.'),
  { id: 'fe:state-management', covers: ['mc:redux-store'], url: 'https://tanstack.com/query/latest/docs/framework/react/overview', url2: 'https://redux.js.org/understanding/history-and-design/middleware',
    understand: 'Data and the network · State management: server state vs client state vs URL state; TanStack Query (query keys, staleTime vs gcTime, dedupe, invalidation), Redux Toolkit and Zustand for client state, Context and its re-render cost; how Redux works inside (a reducer, subscribe, middleware as function composition). Read the TanStack Query overview, then the Redux middleware page.',
    do: 'In TypeScript, write createStore(reducer, preloadedState, enhancer) with getState, dispatch, subscribe and applyMiddleware, plus a logger and a thunk middleware. Then move one feature of your flagship from local state to TanStack Query and delete the effects it replaces.',
    explain: 'Out loud, 3 min: where each kind of state lives in a large app. Deep enough when you can explain how middleware wraps dispatch, and why most "global state" is really a server cache.' },
  design('ecommerce', 'an e-commerce product page and checkout', 'an e-commerce product page and checkout: images, variants, reviews, a cart, address and payment, fast on mobile.',
    'product page performance (LCP, images, rendering); checkout correctness',
    'say how the product page renders fast for search engines and still shows live stock and price',
    gfe('e-commerce-amazon'), 'answer', ['sdm:fe-ecommerce']),
  deepDive('ecommerce', 'Checkout',
    'the parts that must never go wrong: double submits, idempotency keys, cart state across tabs and devices, price or stock changing during checkout, and payment redirects that come back. Read the Stripe idempotent requests docs.',
    'https://docs.stripe.com/api/idempotent_requests',
    'In TypeScript, write the client checkout flow as a state machine (cart, address, payment, confirming, done, failed) with one idempotency key per attempt, a submit that is disabled while pending, and recovery after a reload mid-payment.',
    'Out loud, 3 min: how a user gets charged twice and how your design stops it. Deep enough when you can walk through a payment that times out and say what the UI shows and what it retries.'),

  // ---------- Week 7: photo grid, virtualization and code splitting, video player ----------
  design('photo-gallery', 'a photo gallery', 'a Pinterest-style photo grid: masonry layout, infinite scroll, a full-screen viewer with swipe, and image upload.',
    'masonry layout and image loading; the viewer with keyboard and swipe navigation',
    'say how the grid avoids layout shift while images load',
    gfe('image-carousel'), 'answer', ['sdm:fe-photo-gallery']),
  deepDive('photo-gallery', 'Image-heavy grids',
    'native lazy loading and its thresholds, responsive images (srcset and sizes), fetchpriority for the LCP image, aspect-ratio boxes against layout shift, and masonry placement (shortest column first). Read the lazy loading guide.',
    'https://web.dev/articles/browser-level-image-lazy-loading',
    'In TypeScript, write the masonry layout function: given items with width and height and a column count, place each in the shortest column and return absolute positions. Render 1,000 items in a scratch page with lazy images and check that CLS stays at 0.',
    'Out loud, 3 min: how the grid stays fast on a slow phone. Deep enough when you can say how you keep the scroll position and layout stable when the column count changes on resize.'),
  { id: 'fe:list-virtualization-code-splitting', url: 'https://web.dev/articles/virtualize-long-lists-react-window',
    understand: 'Architecture and tooling · React performance at scale: windowing long lists (fixed vs variable row heights, overscan, measuring rows), code splitting by route and by interaction with lazy and dynamic import, preloading on hover or intent, and what belongs in the first bundle. Read the virtualization article.',
    do: 'In TypeScript, write a variable-height virtual list hook: measure rows after render, keep an offset index, binary search the first visible row. Render 50,000 rows and keep scrolling at 60 fps. Then lazy-load one heavy route of your flagship and measure the drop in first-load JavaScript.',
    explain: 'Out loud, 3 min: what virtualization breaks and how you fix it. Deep enough when you can say how to keep the scroll position steady when rows above the viewport change height.' },
  design('video-player', 'a video streaming player', 'a video streaming player: adaptive bitrate, buffering, seeking, captions, and resuming where you left off.',
    'adaptive bitrate and buffering; the player state machine and its controls',
    'say what the player does when the bandwidth halves mid-video',
    PLAYBOOK, 'playbook', ['sdm:fe-video-player']),
  deepDive('video-player', 'Video player',
    'Media Source Extensions, how adaptive bitrate (HLS, DASH) picks a rendition from bandwidth and buffer, buffer goals, seeking, captions (WebVTT) and the player state machine. Read the MSE docs.',
    'https://developer.mozilla.org/en-US/docs/Web/API/Media_Source_Extensions_API',
    'In TypeScript, write an adaptive bitrate picker: given recent segment download times, the buffer length and the rendition ladder, return the next rendition. Simulate a network drop and check that it steps down before the buffer runs out.',
    'Out loud, 3 min: what happens inside the player when the network drops mid-video. Deep enough when you can explain why the picker looks at the buffer as well as the bandwidth.'),

  // ---------- Week 8: spreadsheet, storage and service workers, collaborative editor ----------
  design('spreadsheet', 'a spreadsheet app', 'a spreadsheet app like Google Sheets: a grid of 100k rows, formulas, selection and copy-paste, and several people editing.',
    'the virtualized grid; the formula engine and recalculation',
    'say what renders and what recalculates when one cell changes',
    PLAYBOOK, 'playbook', ['sdm:fe-google-sheets']),
  deepDive('spreadsheet', 'Spreadsheet engine',
    'the dependency graph, dirty cells and recalculation order, cycle detection, and a virtualized grid that renders only the visible cells (canvas or DOM). Read the Excel recalculation docs.',
    'https://learn.microsoft.com/en-us/office/client-developer/excel/excel-recalculation',
    'In TypeScript, write the formula core: parse "=A1+B2*2" and SUM(A1:A3), build the dependency graph, recalculate only dirty cells in topological order, and report a cycle. Test it with 10k cells.',
    'Out loud, 3 min: what happens when one cell changes. Deep enough when you can say why the grid renders 50 rows and not 100,000, and how selection and copy-paste still work.'),
  { id: 'fe:storage-workers', url: 'https://web.dev/learn/pwa/service-workers', url2: 'https://web.dev/articles/offline-cookbook',
    understand: 'Browser platform · Storage and service workers: cookies vs localStorage vs IndexedDB vs Cache Storage (limits, eviction, persistence), the service worker lifecycle (install, waiting, activate, skipWaiting), caching strategies (cache first, network first, stale while revalidate), and update bugs that leave users on an old version. Read the service worker module, then the offline cookbook.',
    do: 'In TypeScript, add a service worker to a scratch app or your flagship: precache the shell, stale-while-revalidate for API reads, network only for writes, and an "update available" prompt that activates the new worker. Test offline and an update in the DevTools Application panel.',
    explain: 'Out loud, 3 min: the service worker lifecycle. Deep enough when you can say why a user is stuck on last week\'s build and how you get them off it.' },
  design('collab-editor', 'a collaborative document editor', 'a collaborative document editor: rich text, many people editing at once, cursors and presence, comments, and offline edits.',
    'conflict resolution (OT or a CRDT); presence and cursors',
    'say what happens when two people edit the same paragraph offline and reconnect, and why OT or a CRDT handles it',
    PLAYBOOK, 'playbook'),
  deepDive('collab-editor', 'Collaborative editing',
    'OT vs CRDTs, how a sequence CRDT gives every character a stable id, presence and cursors, undo in a shared document, and offline merge. Read the crdt.tech introduction and one talk it links.',
    'https://crdt.tech/',
    'In a TypeScript scratch app, wire Yjs to 2 editors over a local provider. Take one offline, edit the same paragraph in both, reconnect and inspect the merge. Add remote cursors with the awareness API.',
    'Out loud, 3 min: OT vs a CRDT. Deep enough when you can pick one for a given product (a code editor, a notes app, a whiteboard) and defend it.'),

  // ---------- Week 9: calendar, HTTP caching, travel booking ----------
  design('calendar', 'a calendar app', 'a calendar app: day, week and month views, recurring events, time zones, drag to reschedule, and invites.',
    'recurring events and time zones; the week view layout and drag interactions',
    'say how a weekly 9:00 meeting renders for an attendee in another time zone across a DST change',
    PLAYBOOK, 'playbook', ['sdm:fe-calendar']),
  deepDive('calendar', 'Time zones and recurrence',
    'store instants plus the event\'s time zone, expand recurring events (RRULE) for the visible range only, handle DST gaps and exceptions to a series, and lay out overlapping events in a day view. Read the Temporal docs.',
    'https://tc39.es/proposal-temporal/docs/',
    'In TypeScript with the Temporal polyfill, write expandWeekly(rule, range, timeZone) that returns the occurrences in a visible week, keeps 9:00 local time across a DST change and skips exception dates. Then write the overlap layout for one day column.',
    'Out loud, 3 min: why "every Monday at 9:00" is not "every 7 x 24 hours". Deep enough when you can say what you store for an event and what you compute in the browser.'),
  { id: 'fe:http-caching', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching',
    understand: 'Data and the network · HTTP and caching: HTTP/1.1 vs 2 vs 3 (head-of-line blocking, multiplexing, QUIC), Cache-Control (max-age, no-cache vs no-store, immutable, stale-while-revalidate), ETag and 304s, Vary, CDN caching and purges, and the rules for HTML vs hashed assets. Read the MDN caching guide.',
    do: 'Write the cache headers for your flagship: HTML, hashed JS and CSS, images, API GETs and a user-specific page. Check each in the Network panel (disk cache, 304, the CDN hit header) and fix one that is wrong.',
    explain: 'Out loud, 3 min: Cache-Control for HTML vs hashed assets. Deep enough when you can say why a deploy shows half the old app and half the new one, and which headers prevent it.' },
  design('travel-booking', 'a travel booking site', 'a travel booking site like Airbnb: search with filters and a map, a listing page, and a booking flow with dates and price.',
    'search state (filters, map, URL); the booking flow',
    'say how the list, the map and the URL stay in sync when the user pans and filters',
    gfe('travel-booking-airbnb'), 'answer'),
  deepDive('travel-booking', 'Search with a map',
    'filters kept in the URL, the list and the map in sync, thousands of markers clustered, results refetched when the map moves (debounced and cancelled), and a booking flow that holds the price. Read the Google Maps marker clustering guide.',
    'https://developers.google.com/maps/documentation/javascript/marker-clustering',
    'In TypeScript, write the search state module: filters and map bounds read from and written to URLSearchParams, a debounced refetch on bounds change that cancels the previous one, and back and forward restoring the exact view.',
    'Out loud, 3 min: the search state and who owns it. Deep enough when you can say what happens when the user pans the map while a search is still loading.'),

  // ---------- Week 10: whiteboard, web security, analytics dashboard ----------
  design('whiteboard', 'a collaborative whiteboard', 'a collaborative whiteboard like Figma or Excalidraw: an infinite canvas with shapes, pan and zoom, selection, and live multiplayer.',
    'rendering on canvas at scale; multiplayer sync',
    'say what happens when two people drag the same shape at the same time, and how every client ends with one result',
    'https://www.figma.com/blog/how-figmas-multiplayer-technology-works/', 'post', ['fe:canvas-svg']),
  deepDive('whiteboard', 'Canvas rendering',
    'Canvas vs SVG vs WebGL for a whiteboard, a scene graph, dirty-rectangle redraws, layers, hit testing, devicePixelRatio, and rendering in a worker with OffscreenCanvas. Read the MDN canvas optimization guide.',
    'https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas',
    'In TypeScript, draw 5,000 shapes on a canvas with pan and zoom. Add hit testing (a click selects the top shape) and a dirty-rectangle redraw when one shape moves. Keep 60 fps while dragging, checked in the Performance panel.',
    'Out loud, 3 min: when you pick SVG, Canvas or WebGL. Deep enough when you can say how a click finds the shape under the cursor among 5,000 without testing each one.'),
  { id: 'fe:web-security', covers: ['sd:fe-security-a11y'], url: 'https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html', url2: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP',
    understand: 'Browser security · Web security for frontend engineers: XSS (reflected, stored, DOM-based) and why React escaping is not enough (dangerouslySetInnerHTML, javascript: URLs, third-party scripts), CSP with nonces and strict-dynamic, Trusted Types, CSRF and SameSite cookies, what CORS does and does not protect, clickjacking and frame-ancestors, npm supply-chain risk. Read the OWASP XSS cheat sheet, then the MDN CSP guide.',
    do: 'Write a strict nonce-based CSP for your flagship in TypeScript middleware. Ship it in report-only mode, read the violation reports, then enforce it. Try 3 XSS payloads against a scratch page and show which layer stops each.',
    explain: 'Out loud, 3 min: the security section of a frontend design answer. Deep enough when you can explain why CORS does not stop CSRF, and what a CSP stops that output escaping does not.' },
  design('analytics-dashboard', 'an analytics dashboard', 'an analytics dashboard: 20 configurable widgets, charts over large data, real-time updates, filters shared across widgets, and export.',
    'large data in charts; real-time updates with per-widget loading and errors',
    'say how the page stays responsive with 20 live widgets and 1 million points',
    PLAYBOOK, 'playbook'),
  deepDive('analytics-dashboard', 'Large data in the browser',
    'downsampling (min-max per pixel column, or LTTB), streaming updates without re-rendering the page, charts drawn in a worker with OffscreenCanvas, and widgets that load and fail on their own. Read the OffscreenCanvas article.',
    'https://web.dev/articles/offscreen-canvas',
    'In TypeScript, write a min-max downsampler that turns 1 million points into 2 points per pixel column, then draw the result on an OffscreenCanvas in a worker. Compare frame times with drawing every point on the main thread.',
    'Out loud, 3 min: what each widget fetches, how often, and what the user sees when one fails. Deep enough when you can say where the data is reduced (server, worker, main thread) and why.'),

  // ---------- Week 11: Next.js caching, auth, accessibility, 2 rehearsals ----------
  { id: 'fe:nextjs-caching-rsc', url: 'https://nextjs.org/docs/app/guides/caching', url2: 'https://nextjs.org/docs/app/api-reference/functions/revalidateTag',
    understand: 'Data and the network · Next.js caching and revalidation: request memoization, the data cache, the full route cache and the router cache; static vs dynamic rendering; revalidating by time and on demand (revalidateTag, revalidatePath); how Server Components fetch data. Read the caching guide, then the revalidateTag reference.',
    do: 'In your flagship (TypeScript), make one page static, one dynamic and one revalidating every 60 s, plus one on-demand revalidation from a server action. Check each with the next build output and the response headers, and write down which cache each request hit.',
    explain: 'Out loud, 3 min: why a user sees stale data right after a mutation, and the fix. Deep enough when you can trace one request through every Next.js cache layer.' },
  rehearsal('mc:autocomplete', 'an autocomplete: debounced search against a mock API, a cache by query, stale responses ignored, keyboard navigation (up, down, Enter, Escape) and the matching text highlighted',
    `${APG}combobox/examples/combobox-autocomplete-list/`, 'APG combobox example'),
  { id: 'fe:auth', url: 'https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow-with-pkce', url2: 'https://oauth.net/2/browser-based-apps/',
    understand: 'Browser security · Auth in the browser: sessions in HttpOnly cookies vs tokens in memory, why tokens in localStorage are an XSS risk, the OAuth 2 authorization code flow with PKCE, OIDC id tokens, refresh token rotation, the backend-for-frontend pattern, and logout across tabs. Read the PKCE flow, then the guidance for browser-based apps.',
    do: 'Draw the PKCE flow from memory, then check it. In TypeScript, write the code verifier and the S256 challenge with Web Crypto, and a fetch wrapper that refreshes an expired session once even when 5 requests fail at the same time.',
    explain: 'Out loud, 3 min: cookies vs JWTs in the browser. Deep enough when you can defend a backend-for-frontend design to a security reviewer.' },
  rehearsal('mc:data-table', 'a data table: sort by column, filter, paginate, with typed column definitions and the sort state shown to screen readers',
    `${APG}table/examples/sortable-table/`, 'APG sortable table example'),
  { id: 'fe:accessibility', url: APG, url2: 'https://www.w3.org/WAI/WCAG22/quickref/',
    understand: 'Accessibility and i18n · Accessibility at senior level: semantics first, the accessibility tree, ARIA patterns from the APG (and why no ARIA beats bad ARIA), focus management in single-page apps (route changes, dialogs, toasts and live regions), keyboard models, contrast and reduced motion, with WCAG 2.2 AA as the target; and i18n (Intl formatting, right-to-left layouts with logical CSS properties, text that grows 40% in German). Read the APG patterns, then the WCAG quick reference.',
    do: 'Audit your flagship with axe DevTools, the keyboard only, and VoiceOver for 10 minutes. Fix the 3 worst issues in TypeScript, for example focus after a route change, a live region for async results, or a custom control with the right role and keys.',
    explain: 'Out loud, 3 min: how you build accessibility into a design system instead of bolting it on. Deep enough when you can say what a screen reader announces for one of your components, and why.' },

  // ---------- Week 12: component APIs, TypeScript at scale, build tooling, 2 rehearsals ----------
  { id: 'fe:component-api', url: 'https://www.patterns.dev/react/compound-pattern',
    understand: 'Architecture and tooling · Design systems and component APIs: compound components, headless components and hooks, controlled vs uncontrolled, polymorphic "as" props, slots, design tokens and theming, versioning and deprecation in a shared library. Read the compound pattern.',
    do: 'Design a headless Select in TypeScript: the hook API (useSelect returns state and prop getters), a compound API on top (Select.Trigger, Select.Option), controlled and uncontrolled modes, and the types. Write the types and one test first; implement only what the test needs.',
    explain: 'Out loud, 3 min: how you would roll out a breaking change to a design-system component used by 40 teams. Deep enough when you can say when a headless component is worth its cost.' },
  rehearsal('mc:infinite-scroll', 'an infinite feed: an IntersectionObserver loading the next page by cursor, loading and error rows with retry, no duplicate requests, and the scroll position kept on back navigation',
    `${APG}feed/`, 'APG feed pattern'),
  { id: 'fe:typescript', url: 'https://www.typescriptlang.org/docs/handbook/2/types-from-types.html', url2: 'https://www.typescriptlang.org/docs/handbook/project-references.html',
    understand: 'Architecture and tooling · TypeScript at scale: generics with constraints, conditional and mapped types, infer, template literal types, discriminated unions with exhaustive checks, branded types; project references, strictness flags, and keeping tsc fast in a monorepo. Read "Creating types from types", then project references.',
    do: 'In TypeScript, re-implement Pick, Omit, Partial, ReturnType and a DeepReadonly, then type a route table so link("/users/:id", { id }) is checked at compile time. Run tsc --extendedDiagnostics on your flagship and note the slowest phase.',
    explain: 'Out loud, 3 min: how you model API states with a discriminated union. Deep enough when you can explain how infer works in a conditional type, and when a type is too clever to keep.' },
  rehearsal('mc:file-explorer', 'a file explorer tree from nested JSON: expand and collapse, add, rename and delete, with arrow-key navigation',
    `${APG}treeview/`, 'APG tree view pattern'),
  { id: 'fe:build-tooling', url: 'https://webpack.js.org/guides/tree-shaking/', url2: 'https://vite.dev/guide/features',
    understand: 'Architecture and tooling · Build tooling: how bundlers build a module graph, tree-shaking and sideEffects, code splitting and chunk hashing, dev servers on native ESM (Vite) vs bundling, transpilers (esbuild, SWC), source maps, and module federation. Read the tree-shaking guide, then the Vite features page.',
    do: 'Run a bundle analyzer on your flagship. Find one dependency that does not tree-shake (a barrel file or a CommonJS package), fix it and record the size change. Then write a tiny Vite plugin in TypeScript that injects the build version.',
    explain: 'Out loud, 3 min: how tree-shaking decides what is dead code. Deep enough when you can say why one import of a utility pulled in 200 KB, and how you stop it happening again.' },

  // ---------- Week 13: micro-frontends, CSS at scale, testing, 2 rehearsals ----------
  { id: 'sd:fe-micro-frontends', covers: ['fe:web-components'], url: 'https://martinfowler.com/articles/micro-frontends.html', url2: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_components',
    understand: 'Architecture and tooling · Monorepos and micro-frontends: when splitting a frontend by team pays off and when it does not, integration styles (build time, runtime with module federation, iframes, Web Components), shared dependencies and design-system versions, routing and state across apps, monorepo tooling (workspaces, task caching). Read the Fowler article, then the Web Components docs.',
    do: 'In TypeScript, build a custom element (a user-badge with Shadow DOM, a slot and an observed attribute) and use it from a React page. Write down what broke (events, SSR, styling) and how you fixed each.',
    explain: 'Out loud, 3 min: micro-frontends vs a monorepo with one deploy. Deep enough when you can argue against micro-frontends for a 3-team product and for them at 30 teams.' },
  rehearsal('mc:modal', 'a modal dialog: focus trapped inside, Escape and a click outside close it, focus goes back to the trigger, the page behind does not scroll, rendered in a portal',
    `${APG}dialog-modal/`, 'APG modal dialog pattern'),
  { id: 'fe:css-box-model', covers: ['fe:css-layout'], url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Understanding_z-index/Stacking_context', url2: 'https://css-tricks.com/snippets/css/complete-guide-grid/',
    understand: 'Architecture and tooling · CSS at scale and layout debugging: stacking contexts and why z-index "does not work", containing blocks, flexbox and grid sizing (min-content, minmax, the min-width: auto trap), container queries, cascade layers, and CSS strategies for big codebases (modules, utility classes, CSS-in-JS at build time). Read the stacking context guide, then the grid guide.',
    do: 'Take 3 real layout bugs (a modal under a sticky header, a flex child that overflows, a grid that breaks at one width), reproduce each in a scratch page and fix each with the DevTools layout and stacking tools. Write the cause of each in one line.',
    explain: 'Out loud, 3 min: how you keep CSS maintainable across 20 teams. Deep enough when you can say, from the stacking contexts alone, why an element with z-index: 9999 still sits under another.' },
  rehearsal('mc:nested-comments', 'nested comments from a flat list with parentId: reply at any depth, collapse a thread, and delete a comment while keeping its replies under a "[deleted]" placeholder',
    `${APG}disclosure/`, 'APG disclosure pattern (for collapse)'),
  { id: 'fe:testing', url: 'https://testing-library.com/docs/react-testing-library/intro/', url2: 'https://playwright.dev/docs/test-snapshots',
    understand: 'Architecture and tooling · Testing strategy: the testing trophy, React Testing Library queries by role, mocking the network (MSW) instead of modules, Playwright end-to-end tests and visual comparisons, the usual causes of flaky tests, and what to test in a design system vs a product. Read the RTL intro, then the Playwright visual comparisons guide.',
    do: 'In your flagship (TypeScript), write one RTL test that finds controls by role and mocks the network, and one Playwright test of the main flow with a visual snapshot. Make one test flaky on purpose with a timing assumption, then fix it the right way.',
    explain: 'Out loud, 3 min: your testing plan for a new frontend team. Deep enough when you can say why a test that queries by class name breaks on a refactor and a role query does not.' },
];

// ---------- the 13 Saturday timed reps, in order ----------
const REPS = [
  rep('event-loop-output', 45, 'event loop and promises, output quiz. Predict the console output of 8 BFE.dev quizzes on promise order, setTimeout, queueMicrotask and async functions, writing your answer before you run each. For every miss, write the one rule you broke (microtasks drain before the next task, await splits a function, and so on).',
    `${BFE}/quiz/1-promise-order`, 'https://www.youtube.com/watch?v=cCOL7MC4Pl0', ['fe:event-loop']),
  rep('closures-this-prototypes', 45, 'closures, "this" and prototypes. 20 min: predict the output of the BFE.dev "this" and prototype quizzes (hoisting, the TDZ, arrow vs regular functions, "this" lost in callbacks). 25 min: implement Function.prototype.myBind and myNew(Ctor, ...args) in TypeScript, with tests. Write down every rule you got wrong.',
    `${BFE}/quiz/this`, `${BFE}/quiz/prototype`, ['fe:execution-context', 'fe:closures', 'fe:this-bind', 'fe:prototypes']),
  rep('coercion-es6-proxy', 45, 'coercion, equality and modern JS. 20 min: predict the output of BFE.dev quizzes on implicit conversion, == vs ===, Proxy and Reflect. 25 min: in TypeScript, write reactive(obj, onChange) with a Proxy that also tracks nested writes, then explain ESM live bindings vs CommonJS copies in 2 sentences. Write down every rule you got wrong.',
    `${BFE}/quiz/Implicit-Conversion-II`, `${BFE}/quiz/Proxy-I`, ['fe:es6-proxy']),
  rep('tricky-async', 45, 'tricky async. 15 min: predict the output of BFE.dev quizzes on async/await and generators. 30 min: in TypeScript, implement retry(fn, { retries, backoffMs, signal }) and an async iterator that pages through a cursor API until it ends. Write down every rule you got wrong.',
    `${BFE}/quiz/async-await`, `${BFE}/quiz/generator-return`, ['fe:async-await']),
  rep('promise-combinators', 45, 'in TypeScript, implement Promise.all, Promise.allSettled, Promise.any (rejecting with an AggregateError) and Promise.race, typed with generics, with tests for empty input, non-promise values and rejection order. Talk out loud as in a real round.',
    `${BFE}/problem/implement-Promise-all`, `${BFE}/problem/implement-Promise-allSettled`, ['fe:promises']),
  rep('array-polyfills-deep-clone', 45, 'in TypeScript, implement Array.prototype.myReduce and myFlat(depth), then cloneDeep (circular references, Map, Set, Date) and isEqual (deep, with NaN and key order). Tests first, talk out loud.',
    `${BFE}/problem/create-cloneDeep`, `${BFE}/problem/implement-deep-equal-isEqual`, ['fe:array-polyfills']),
  rep('debounce-throttle-memoize', 45, 'in TypeScript, implement debounce with leading and trailing options and cancel(), throttle, memoize with a key resolver, and curry with placeholder support. Typed with generics, tested with fake timers, talking out loud.',
    `${BFE}/problem/implement-debounce-with-leading-and-trailing-option`, `${BFE}/problem/implement-curry`, ['fe:debounce-throttle']),
  rep('event-emitter', 45, 'in TypeScript, implement a typed event emitter: on, off, once and emit, with a generic event map so emit("name", payload) is type-checked. Cover removing a listener during emit and a once listener that throws. Tests first, talk out loud.',
    `${BFE}/problem/create-an-Event-Emitter`, undefined, ['mc:event-emitter']),
  rep('promise-pool', 45, 'in TypeScript, implement promisePool(tasks, limit) that runs at most limit tasks at once and returns results in input order. Then add cancellation with an AbortSignal and one retry for failed tasks. Tests first, talk out loud.',
    `${BFE}/problem/throttle-Promises`, `${BFE}/problem/implement-async-helper-parallel`, ['mc:promise-pool']),
  rep('dom-events-delegation', 45, 'DOM events and traversal. In TypeScript, implement delegate(root, selector, type, handler) that matches event.target through nested elements and returns an unsubscribe, then solve the BFE.dev "find corresponding node in two identical DOM trees". Explain capture vs bubble and stopPropagation vs preventDefault as you go.',
    `${BFE}/problem/find-corresponding-node-in-two-identical-DOM-tree`, 'https://javascript.info/event-delegation', ['fe:dom-events']),
  rep('react-hooks', 45, 'React hooks. In TypeScript, write useDebounce, usePrevious and useFetch(url) with a cache, retries, and AbortController cancellation when the url changes or the component unmounts. Test each with React Testing Library and fake timers. Talk out loud.',
    `${BFE}/react/useDebounce`, `${BFE}/react/usePrevious`, ['mc:use-fetch']),
  rep('mixed-set-1', 60, 'mixed timed set 1 (BFE.dev). 3 problems you have not seen: one JavaScript utility, one output quiz, one React problem, 20 min each, in TypeScript, out loud. Score each on the linked rubric (correct, clean, tested, explained).',
    `${BFE}/problem`, RUBRIC),
  rep('mixed-set-2', 60, 'mixed timed set 2 (BFE.dev), at real interview pace: 2 problems you have not seen, one medium and one hard, 25 min each with no hints, then one output quiz in 10 min. Score each on the linked rubric, then re-solve the weakest from a blank file the next day.',
    `${BFE}/quiz`, RUBRIC),
];

/** The 78 slots in order: Saturdays (slot index % 6 === 5) take the next rep, every other slot the next weekday row. */
export const FRONTEND = (() => {
  const out = [];
  let w = 0, r = 0;
  for (let i = 0; i < 78; i++) out.push(i % 6 === 5 ? REPS[r++] : WEEKDAYS[w++]);
  if (w !== WEEKDAYS.length || r !== REPS.length || out.some((x) => !x)) throw new Error(`FRONTEND: ${WEEKDAYS.length} weekday rows and ${REPS.length} reps do not fill 78 slots`);
  return out;
})();
