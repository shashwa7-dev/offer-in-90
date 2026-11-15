/* eslint-disable */
// Machine-coding block content (roadmap v2 §5): builds (MC), timed second passes (MC_TIMED), screenshot builds and the v2
// flagship project (PROJECT). v3 lays out none of these: the Product track (product.js) replaces them, reusing the PROJECT
// ids; Task 8 moves a few builds into Frontend and Task 9 deletes the rest. TAKE_HOMES and LLD moved to product.js.
// Item shape: { id, text, url?, mins?, depth?, slots? } plus extra keys. IDs are content-based (<prefix>:<slug>) and must never change.

// The 34 builds, in the old order (provenance: the v1 order and text). 90 min each, except the
// 8 pairs of small builds (§5), which share one 90-min block: both halves carry the same `pair: [first, second]` (ordered by
// MC position) and 45 min. A pair runs as one block at its first member's MC position; 34 builds therefore fill 26 Mon/Wed/Fri
// blocks, plus the 3 screenshot builds.
export const MC = [
  { id: 'mc:todo-vanilla', text: 'Todo list in vanilla JS (add, edit, delete, filter) — no framework', mins: 90 },
  { id: 'mc:accordion', text: 'Accordion (single/multi open, keyboard accessible)', mins: 45, pair: ['mc:accordion', 'mc:tabs'] },
  { id: 'mc:tabs', text: 'Tabs with correct ARIA roles', mins: 45, pair: ['mc:accordion', 'mc:tabs'] },
  { id: 'mc:modal', text: 'Modal dialog (focus trap, Esc, click outside)', mins: 45, pair: ['mc:modal', 'mc:tooltip'] },
  { id: 'mc:star-rating', text: 'Star rating (hover preview, half stars)', mins: 45, pair: ['mc:star-rating', 'mc:otp-input'] },
  { id: 'mc:debounced-search', text: 'Debounced search input that cancels stale requests', mins: 45, pair: ['mc:debounced-search', 'mc:like-button'] },
  { id: 'mc:pagination', text: 'Pagination component', mins: 45, pair: ['mc:pagination', 'mc:toast'] },
  { id: 'mc:infinite-scroll', text: 'Infinite scroll feed (IntersectionObserver)', mins: 90 },
  { id: 'mc:image-carousel', text: 'Image carousel (autoplay, dots, swipe)', mins: 45, pair: ['mc:image-carousel', 'mc:tic-tac-toe'] },
  { id: 'mc:toast', text: 'Toast notification system (stacking, auto-dismiss)', mins: 45, pair: ['mc:pagination', 'mc:toast'] },
  { id: 'mc:autocomplete', text: 'Autocomplete / typeahead (cache, keyboard nav, highlight)', mins: 90 },
  { id: 'mc:nested-comments', text: 'Nested comments (reply, collapse, delete)', mins: 90 },
  { id: 'mc:file-explorer', text: 'File explorer tree (expand, add, rename, delete)', mins: 90 },
  { id: 'mc:form-wizard', text: 'Multi-step form wizard with validation', mins: 90 },
  { id: 'mc:tic-tac-toe', text: 'Tic-tac-toe N×N with winner check', mins: 45, pair: ['mc:image-carousel', 'mc:tic-tac-toe'] },
  { id: 'mc:data-table', text: 'Data table: sort, filter, paginate', mins: 90 },
  { id: 'mc:kanban', text: 'Kanban board with drag and drop', mins: 90 },
  { id: 'mc:date-picker', text: 'Date picker / month calendar', mins: 90 },
  { id: 'mc:otp-input', text: 'OTP input (auto-advance, paste, backspace)', mins: 45, pair: ['mc:star-rating', 'mc:otp-input'] },
  { id: 'mc:tooltip', text: 'Tooltip / popover with smart positioning', mins: 45, pair: ['mc:modal', 'mc:tooltip'] },
  { id: 'mc:use-fetch', text: 'useFetch hook with cache, retries + AbortController', mins: 45, pair: ['mc:use-fetch', 'mc:redux-store'] },
  { id: 'mc:virtualized-list', text: 'Virtualized list of 10,000 rows', mins: 90 },
  { id: 'mc:combobox', text: 'Accessible combobox / searchable select', mins: 90 },
  { id: 'mc:spreadsheet-lite', text: 'Spreadsheet-lite (cells, A1 refs, simple formulas)', mins: 90 },
  { id: 'mc:undo-redo-editor', text: 'Text editor with undo / redo', mins: 90 },
  { id: 'mc:like-button', text: 'Like button with optimistic UI and rollback', mins: 45, pair: ['mc:debounced-search', 'mc:like-button'] },
  { id: 'mc:email-client', text: 'Email client UI (Outlook-style: folders, list, reading pane, keyboard shortcuts)', mins: 90 },
  { id: 'mc:chat-ui', text: 'Chat UI (Teams-style: channels, messages, typing indicator, unread counts)', mins: 90 },
  { id: 'mc:mini-react', text: 'Mini React: createElement + render + useState', mins: 90 },
  { id: 'mc:event-emitter', text: 'Event emitter (on, off, once, emit)', mins: 45, pair: ['mc:event-emitter', 'mc:promise-pool'] },
  { id: 'mc:promise-pool', text: 'Promise pool / task scheduler with concurrency limit', mins: 45, pair: ['mc:event-emitter', 'mc:promise-pool'] },
  { id: 'mc:vdom-diff', text: 'Virtual DOM diff and patch', mins: 90 },
  { id: 'mc:redux-store', text: 'Redux createStore + middleware from scratch', mins: 45, pair: ['mc:use-fetch', 'mc:redux-store'] },
  { id: 'mc:streaming-ai-chat', text: 'Streaming AI chat UI (stop, regenerate, markdown, code blocks)', mins: 90 },
];

// From week 9: timed second passes (30–45 min, two per block) of these 12 builds, in this order (Ruling R1: ids, not indexes).
export const MC_TIMED = ['mc:autocomplete', 'mc:data-table', 'mc:kanban', 'mc:nested-comments', 'mc:file-explorer', 'mc:modal',
  'mc:spreadsheet-lite', 'mc:date-picker', 'mc:email-client', 'mc:chat-ui', 'mc:promise-pool', 'mc:virtualized-list'];

// "Match this screenshot" builds (§5): in the Mon/Wed/Fri rotation in weeks 4–8 (`weeks: [first, last]`, Grind weeks). Free Frontend Mentor challenges, which ship
// the design screenshots for mobile and desktop. URLs checked 2026-11-15.
export const MC_SCREENSHOT = [
  { id: 'mc:screenshot-product-card', text: 'Match this screenshot: product preview card. Build it pixel-accurate from the design images, responsive from 375 px to desktop, and accessible (semantic HTML, alt text, visible focus, contrast). 45 min, then diff your build against the screenshot.', url: 'https://www.frontendmentor.io/challenges/product-preview-card-component-GO7UmttRfa', mins: 45, weeks: [4, 8] },
  { id: 'mc:screenshot-rating', text: 'Match this screenshot: interactive rating component (select a score, submit, thank-you state). Build it pixel-accurate, responsive, and accessible (a real radio group with keyboard support, focus states, a live thank-you message). 45 min, then diff your build against the screenshot.', url: 'https://www.frontendmentor.io/challenges/interactive-rating-component-koxpeBUmI', mins: 45, weeks: [4, 8] },
  { id: 'mc:screenshot-newsletter', text: 'Match this screenshot: newsletter sign-up form with validation and a success message. Build it pixel-accurate, responsive (the layout changes at mobile width), and accessible (labelled input, errors announced, focus moved to the success state). 45 min, then diff your build against the screenshot.', url: 'https://www.frontendmentor.io/challenges/newsletter-signup-form-with-success-message-3FC1AZbNrv', mins: 45, weeks: [4, 8] },
];

// TAKE_HOMES moved to product.js (v3 §5).

// Flagship product (§5): Tue/Thu from week 2 to week 11. The old 20 steps fit 18 slots by merging "product brief" with
// "UX wireframes" and "search + ⌘K" with "performance pass"; nothing else changes. You write the brief, the design doc and
// every review; AI coding tools write a lot of the code.
// `v1` is the step's old 1-based position (merged entries keep both old steps in `oldSteps`), and `oldText` is the old text
// of a step that gained an explain-back: provenance only, checked by test-content.
// Depth (§13): the real-time and offline steps (area 2) and the AI steps and evals (area 3) end with an explain-back. The
// Ink & Switch depth read before the real-time step is in PROJECT_DEPTH_READS below.
export const PROJECT = [
  { id: 'proj:brief-wireframes', text: 'Product brief: target user, the problem, 3 core jobs, success metrics. Teardown of Notion, Linear docs and Slab. UX: wireframes, design tokens, component inventory in Figma', url: 'https://help.figma.com/hc/en-us/articles/360040451373',
    oldSteps: [{ v1: 1, text: 'Product brief: target user, the problem, 3 core jobs, success metrics. Teardown of Notion, Linear docs and Slab.', url: '' }, { v1: 3, text: 'UX: wireframes, design tokens, component inventory in Figma', url: 'https://help.figma.com/hc/en-us/articles/360040451373' }] },
  { id: 'proj:design-doc', v1: 2, text: 'Design doc (RFC): architecture, data model, API, real-time approach (CRDT), AI design (RAG), risks, milestones. This is the document you steer the AI with.', url: 'https://www.industrialempathy.com/posts/design-docs-at-google/' },
  { id: 'proj:setup', v1: 4, text: 'Setup: Next.js + TypeScript, lint, tests, CI, preview deploys. Write CONTRIBUTING rules for your AI coding agent.', url: 'https://nextjs.org/docs' },
  { id: 'proj:auth', v1: 5, text: 'Auth (OAuth/OIDC), workspaces, roles; Postgres schema with row-level security', url: 'https://supabase.com/docs/guides/database/postgres/row-level-security' },
  { id: 'proj:editor', v1: 6, text: 'Editor: rich text (Tiptap/ProseMirror), slash commands, keyboard-first', url: 'https://tiptap.dev/docs' },
  { id: 'proj:realtime', v1: 7, depth: true, text: 'Real-time collaboration: Yjs + WebSocket provider, live cursors and presence. Explain back what happens when two people type in the same block at once, and why every client ends up with the same document.', oldText: 'Real-time collaboration: Yjs + WebSocket provider, live cursors and presence', url: 'https://docs.yjs.dev/' },
  { id: 'proj:offline', v1: 8, depth: true, text: 'Offline-first: IndexedDB persistence, sync on reconnect, conflict and reconnect UX. Explain back what happens when two people edit offline and reconnect, and why your design handles it.', oldText: 'Offline-first: IndexedDB persistence, sync on reconnect, conflict and reconnect UX', url: 'https://docs.yjs.dev/getting-started/allowing-offline-editing' },
  { id: 'proj:search-performance', text: 'Search + command palette (⌘K) with virtualized results. Performance pass: Web Vitals budget, code splitting, React Profiler. Record before/after numbers.', url: 'https://web.dev/articles/vitals',
    oldSteps: [{ v1: 9, text: 'Search + command palette (⌘K) with virtualized results', url: '' }, { v1: 10, text: 'Performance pass: Web Vitals budget, code splitting, React Profiler. Record before/after numbers.', url: 'https://web.dev/articles/vitals' }] },
  { id: 'proj:a11y', v1: 11, text: 'Accessibility pass: keyboard, screen reader, contrast; axe in CI', url: 'https://github.com/dequelabs/axe-core' },
  { id: 'proj:ai-ingestion', v1: 12, depth: true, text: 'AI 1: ingestion pipeline: chunk + embed on save, pgvector, re-index on edit or model change. Explain back how a stale chunk ends up in an answer and how your re-indexing stops it.', oldText: 'AI 1: ingestion pipeline: chunk + embed on save, pgvector, re-index on edit or model change', url: 'https://github.com/pgvector/pgvector' },
  { id: 'proj:ai-ask-workspace', v1: 13, depth: true, text: 'AI 2: "Ask your workspace": streaming answers with citations and permission-aware retrieval. Explain back how a wrong or leaked answer would happen and which trace would show you the cause.', oldText: 'AI 2: "Ask your workspace": streaming answers with citations and permission-aware retrieval' },
  { id: 'proj:ai-agent-actions', v1: 14, depth: true, text: 'AI 3: agent actions with tools (summarize, create tasks) with a human confirmation step. Explain back what the agent loop does when a tool call fails or returns nonsense, and where the human step stops damage.', oldText: 'AI 3: agent actions with tools (summarize, create tasks) with a human confirmation step', url: 'https://www.anthropic.com/engineering/building-effective-agents' },
  { id: 'proj:integrations', v1: 15, text: 'Integrations (FDE muscle): import Markdown/CSV or a Notion/Drive export; outgoing webhooks' },
  { id: 'proj:evals', v1: 16, depth: true, text: 'Evals: 50-question eval set, CI gate, cost + latency dashboard. Publish the numbers. Explain back how a failing eval leads you to the cause and what the fix did to cost and latency.', oldText: 'Evals: 50-question eval set, CI gate, cost + latency dashboard. Publish the numbers.', url: 'https://hamel.dev/blog/posts/evals/' },
  { id: 'proj:observability-security', v1: 17, text: 'Observability + security: tracing, rate limits, prompt-injection tests', url: 'https://langfuse.com/docs' },
  { id: 'proj:load-failure', v1: 18, text: 'Load + failure testing: k6 load test, kill the WebSocket server, fix what breaks', url: 'https://grafana.com/docs/k6/latest/' },
  { id: 'proj:launch', v1: 19, text: 'Launch: deploy, get 5–10 real users, collect feedback, ship one fix from it' },
  { id: 'proj:case-study', v1: 20, text: 'Case study: README with architecture diagram, trade-offs, metrics, 3-min demo video. Practice the 15-min project deep dive.' },
];

// §13 area 2: the Ink & Switch "Local-first software" read, after the editor step and before the real-time step (like
// FE_DEPTH_READS, `after` names the item it follows). URL checked 2026-11-15.
export const PROJECT_DEPTH_READS = [
  { id: 'proj:local-first-software', after: 'proj:editor', depth: true, mins: 60, text: 'Read Ink & Switch, "Local-first software" (Kleppmann, Wiggins, van Hardenberg, McGranaghan, 2019): the seven ideals, why CRDTs, and what is still hard. Explain back what happens when two people edit offline and reconnect, and how a CRDT merges their changes.', url: 'https://www.inkandswitch.com/essay/local-first/' },
];

// LLD moved to product.js (v3 §5).
