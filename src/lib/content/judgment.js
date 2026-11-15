/* eslint-disable */
// Judgment thread (roadmap v2 §4, 15:15–16:00 Mon–Sat): how it really works (Mon), decision memo (Tue), practical coding (Wed),
// decomposition or client simulation (Thu, from week 2), code you didn't write (Fri, from week 3). Plus the §13 depth reads that
// live in this thread and the §18 interview-environment tasks. Saturdays (AI drill / mocks) are laid out by the engine (Task 5).
// Item shape: { id, text, url?, mins?, depth?, slots? } plus extra keys. IDs are content-based (<prefix>:<slug>) and must never change.
// Depth (§13) items end with an explain-back sentence. Every URL checked 2026-11-15 (curl and/or WebFetch).

const DO = 'read the post, redraw the system from memory, name 3 trade-offs.';

// Mon · How it really works: one write-up per week, weeks 1–10 in this order (item i runs on the Monday of Grind week i + 1),
// then repeats/mocks. Each link is the company's own engineering blog. Depth: the real-time ones (area 2), the data ones (area 1),
// Copilot (area 3). Stripe's is also the §13 area 1 judgment-thread read (see JT_DEPTH_READS).
export const HOW_IT_WORKS = [
  { id: 'jt:hiw-figma-multiplayer', company: 'Figma', text: `How it really works · Figma multiplayer: ${DO} Explain back: what happens when two people edit the same property at once, and why the server decides.`, url: 'https://www.figma.com/blog/how-figmas-multiplayer-technology-works/', mins: 45, depth: true },
  { id: 'jt:hiw-linear-sync-engine', company: 'Linear', text: `How it really works · Linear sync engine: ${DO} Explain back: how a change made offline reaches every other client, and what breaks at scale.`, url: 'https://linear.app/now/scaling-the-linear-sync-engine', mins: 45, depth: true },
  { id: 'jt:hiw-stripe-idempotency', company: 'Stripe', text: `How it really works · Stripe idempotency keys ("Designing robust and predictable APIs with idempotency", Brandur Leach): ${DO} Explain back: what a client retry does to a charge with and without an idempotency key, and where the key is stored.`, url: 'https://stripe.com/blog/idempotency', mins: 45, depth: true },
  { id: 'jt:hiw-discord-message-storage', company: 'Discord', text: `How it really works · Discord message storage (trillions of messages, Cassandra to ScyllaDB): ${DO} Explain back: why hot partitions hurt them, and how the data model and the data services fix it.`, url: 'https://discord.com/blog/how-discord-stores-trillions-of-messages', mins: 45, depth: true },
  { id: 'jt:hiw-slack-real-time', company: 'Slack', text: `How it really works · Slack real-time messaging: ${DO} Explain back: the path of one message from sender to every open client, and what happens when a gateway server dies.`, url: 'https://slack.engineering/real-time-messaging/', mins: 45, depth: true },
  { id: 'jt:hiw-notion-data-model', company: 'Notion', text: `How it really works · Notion data model (everything is a block): ${DO} Explain back: how a block tree is stored and permissioned, and the cost of that flexibility.`, url: 'https://www.notion.com/blog/data-model-behind-notion', mins: 45, depth: true },
  { id: 'jt:hiw-nextjs-caching', company: 'Next.js', text: `How it really works · Next.js/Vercel caching ("Our Journey with Caching"): ${DO} Explain back: which caches a request passes through, and why stale data showed up for users.`, url: 'https://nextjs.org/blog/our-journey-with-caching', mins: 45, depth: true },
  { id: 'jt:hiw-shopify-bfcm', company: 'Shopify', text: `How it really works · Shopify Black Friday scale (how they prepare for BFCM): ${DO}`, url: 'https://shopify.engineering/bfcm-readiness-2025', mins: 45 },
  { id: 'jt:hiw-cloudflare-nov-2025', company: 'Cloudflare', text: `How it really works · Cloudflare's Nov 18 2025 outage postmortem: ${DO}`, url: 'https://blog.cloudflare.com/18-november-2025-outage/', mins: 45 },
  { id: 'jt:hiw-github-copilot', company: 'GitHub', text: `How it really works · GitHub Copilot architecture (how it builds the prompt from your code): ${DO} Explain back: what context goes into one completion request, and the latency and quality trade-off behind it.`, url: 'https://github.blog/ai-and-ml/github-copilot/how-github-copilot-is-getting-better-at-understanding-your-code/', mins: 45, depth: true },
];

// Tue · Decision memo: the 13 §4 prompts verbatim (`prompt`). Depth: the prompts in a §13 area (data and state, real-time, LLM apps).
const MEMO = 'Write 1 page with options, criteria, your pick, and what would change your mind.';
const MEMO_EB = ' Explain back: the failure or stale-data case that decides it, out loud in 2 minutes.';
const memo = (slug, prompt, depth) => ({ id: `jt:memo-${slug}`, prompt, text: `Decision memo: ${prompt}. ${MEMO}${depth ? MEMO_EB : ''}`, mins: 45, ...(depth ? { depth } : {}) });
export const MEMOS = [
  memo('ssr-vs-csr', 'SSR vs CSR for a dashboard'),
  memo('postgres-vs-dynamodb', 'Postgres vs DynamoDB for chat', true),
  memo('rag-vs-fine-tuning', 'RAG vs fine-tuning for support', true),
  memo('build-vs-buy-auth', 'Build vs buy auth'),
  memo('websocket-vs-sse', 'WebSocket vs SSE', true),
  memo('monolith-vs-services', 'Monolith vs services at 5 engineers'),
  memo('polling-vs-webhooks', 'Polling vs webhooks for an integration', true),
  memo('ship-vs-tech-debt', 'Ship now vs fix tech debt'),
  memo('one-model-vs-routing', 'One model vs routing', true),
  memo('sync-vs-queue', 'Sync vs queue for an export', true),
  memo('flag-vs-branch', 'Feature flag vs long-lived branch'),
  memo('cache-vs-read-replica', 'Cache vs read replica', true),
  memo('offline-first', 'Offline-first or not', true),
];

// Wed · Practical coding: 45 min timed, alternating TypeScript (`lang: 'ts'`) and Python (`'py'`), in the §4 order.
// Depth: the data/state and LLM ones (retries, idempotency, caching, backpressure, RAG).
const pc = (slug, lang, task, eb) => ({
  id: `jt:practical-${slug}`, lang, mins: 45,
  text: `Practical coding (${lang === 'ts' ? 'TypeScript' : 'Python'}, 45 min timed): ${task}${eb ? ` Explain back: ${eb}.` : ''}`,
  ...(eb ? { depth: true } : {}),
});
export const PRACTICAL = [
  pc('rate-limiter', 'ts', 'a rate limiter (token bucket or sliding window) with tests.', 'why your limiter allows or blocks a burst at the window edge, and how it behaves across 2 servers'),
  pc('retry-backoff', 'py', 'retry with exponential backoff and jitter, with a max attempts cap and only retrying safe errors.', 'why jitter matters when 1,000 clients fail at once, and which requests must never be retried blindly'),
  pc('ttl-cache-swr', 'ts', 'a TTL cache with stale-while-revalidate (serve stale, refresh once in the background).', 'what a user sees during the refresh window, and how you stop 100 concurrent refreshes'),
  pc('debounced-fetcher', 'py', 'a cancellable/debounced fetcher (asyncio): only the last call wins, earlier ones are cancelled.'),
  pc('merge-csvs', 'ts', 'merge two messy CSVs and report mismatches (bad rows, duplicate keys, differing values).'),
  pc('parse-log', 'py', 'parse a log file and answer 5 questions about it (top errors, slowest endpoints, requests per minute, …).'),
  pc('streaming-backpressure', 'ts', 'a streaming consumer with backpressure (a fast producer, a slow consumer, a bounded buffer).', 'what happens to memory without backpressure, and where your design pauses the producer'),
  pc('rag-pipeline', 'py', 'a small RAG pipeline: chunk, embed, retrieve top-k, answer with citations, plus 5 test questions.', 'one question it gets wrong and whether retrieval or generation caused it'),
  pc('cli-tool', 'ts', 'a CLI tool with arguments, a help text, exit codes and one test.'),
  pc('lru-cache', 'py', 'an LRU cache with O(1) get and put, with tests.'),
  pc('promise-pool', 'ts', 'a promise pool with a concurrency limit that keeps results in order and surfaces errors.'),
  pc('webhook-idempotency', 'py', 'a webhook receiver with idempotency: verify the signature, dedupe by event id, process at most once.', 'what happens when the same event arrives twice at the same moment, and how your dedupe survives a restart'),
];

// Thu · Decomposition or client simulation, from week 2 (12 Thursdays, weeks 2–13), 45 min out loud.
// §4 counts 11 existing prompts: the 6 FDE `Rep ·` decomposition and client-simulation items (`from`: the FDE item it moves here
// from, so the career block's FDE track should skip it once Task 5 lays this out) and the 5 non-coding FDE_PROMPTS (`v1Prompt`: its
// 0-based index in the old FDE_PROMPTS). FDE_PROMPTS[1] repeats fde:client-simulation-2 word for word, so it is not used twice;
// the plan takes 2 prompts from published FDE guides instead of 1 (`source`, checked with WebFetch 2026-11-15). FDE_PROMPTS[3]
// (merge two messy CSVs) is a practical-coding rep, so it lives in PRACTICAL.
const LOUD = '(45 min, out loud)';
const AC = 'https://www.aced.io/blog/decomposition-interview'; // Aced (formerly Exponent), "How to Answer Decomposition Interview Questions: The Definitive Guide (2026)"
const TI = 'https://www.techinterview.org/post/3233477236/forward-deployed-engineer-interview/'; // techinterview, "What the forward deployed engineer interview really tests", 2026-08-05
export const DECOMP = [
  { id: 'jt:decomp-traffic', from: 'fde:decomposition-framework', text: `Decomposition 1 ${LOUD}: learn the decomposition framework (use your template page), then "Reduce traffic congestion in a city"`, url: 'https://a10x.dev/blog/forward-deployed-engineer-interview-questions', mins: 45 },
  { id: 'jt:decomp-fraud', v1Prompt: 0, text: `Decomposition: "A bank wants to flag fraudulent transactions in real time" ${LOUD}`, mins: 45 },
  { id: 'jt:decomp-shared-data', from: 'fde:decomposition-2', text: `Decomposition: "Let several teams query shared data without exposing raw records" ${LOUD}`, mins: 45 },
  { id: 'jt:client-sim-delayed-launch', from: 'fde:client-simulation-1', text: 'Client simulation: explain a delayed launch and a trade-off to a non-technical executive (record 5 min)', mins: 45 },
  { id: 'jt:decomp-delivery-delays', v1Prompt: 2, text: `Decomposition: "A logistics company wants to predict delivery delays" ${LOUD}`, mins: 45 },
  { id: 'jt:decomp-clinic', from: 'fde:decomposition-3', text: `Decomposition: "Help a clinic reduce missed appointments using AI" ${LOUD}`, mins: 45 },
  { id: 'jt:client-sim-wrong-answer', from: 'fde:client-simulation-2', text: `Client simulation: the customer says your AI tool gave a wrong answer to their CEO ${LOUD}`, mins: 45 },
  { id: 'jt:decomp-night-nurses', v1Prompt: 4, text: `Decomposition: "A hospital wants an AI assistant for nurses on night shifts" ${LOUD}`, mins: 45 },
  { id: 'jt:decomp-911-response', source: AC, url: AC, text: `Decomposition: "A major city wants to reduce 911 emergency response times. They have call data, traffic data, and ambulance GPS data." ${LOUD}`, mins: 45 },
  { id: 'jt:client-sim-scope-cut', v1Prompt: 5, text: `Client simulation: scope cut. The customer wants 10 features in 4 weeks ${LOUD}`, mins: 45 },
  { id: 'jt:decomp-claims', from: 'fde:decomposition-4', text: `Decomposition: "An insurer wants to cut claims processing from 10 days to 2" ${LOUD}`, mins: 45 },
  { id: 'jt:client-sim-wrong-dashboard', source: TI, url: TI, text: `Client simulation: "A customer says their dashboard is wrong. They can't tell you which number. What do you do?" ${LOUD}`, mins: 45 },
];

// Fri · Code you didn't write, from week 3 (Ruling R4): the 11 Fridays of weeks 3–13 are 7 open-source fixes and 4 code reviews,
// reviews in Grind weeks 5, 8, 11 and 13. Repos per §4 (owner may swap). Cal.com's repo is now github.com/calcom/cal.diy
// (calcom/cal.com redirects there). PostHog and Cal.com have few `good first issue`s open (5 and 2 on 2026-11-15), so their
// fixes link the bug label; Excalidraw's link the good-first-issue label (26 open). Depth (§13 area 4) with an explain-back.
const gh = (repo, kind, q) => `https://github.com/${repo}/${kind}?q=${encodeURIComponent(q)}`;
export const OSS_REPOS = [
  { id: 'oss:posthog', name: 'PostHog', repo: 'PostHog/posthog', text: 'PostHog (product analytics; TypeScript + Python)', url: gh('PostHog/posthog', 'issues', 'is:issue is:open label:"good first issue"'), bugsUrl: gh('PostHog/posthog', 'issues', 'is:issue is:open label:bug') },
  { id: 'oss:calcom', name: 'Cal.com', repo: 'calcom/cal.diy', text: 'Cal.com (scheduling; Next.js + TypeScript)', url: gh('calcom/cal.diy', 'issues', 'is:issue is:open label:"good first issue"'), bugsUrl: gh('calcom/cal.diy', 'issues', 'is:issue is:open label:"🐛 bug"') },
  { id: 'oss:excalidraw', name: 'Excalidraw', repo: 'excalidraw/excalidraw', text: 'Excalidraw (whiteboard; React + TypeScript)', url: gh('excalidraw/excalidraw', 'issues', 'is:issue is:open label:"good first issue"'), bugsUrl: gh('excalidraw/excalidraw', 'issues', 'is:issue is:open label:bug') },
];
const repo = id => OSS_REPOS.find(r => r.id === id);
const fix = (n, id) => ({
  id: `jt:oss-fix-${n}`, repo: id, mins: 45, depth: true,
  url: id === 'oss:excalidraw' ? repo(id).url : repo(id).bugsUrl,
  text: `Open-source fix ${n} (${repo(id).name}): pick a \`good first issue\` or \`bug\`, then reproduce → hypothesise → isolate → verify, and open a PR. Write a short postmortem in Notes; finish on a revision Sunday if needed. Explain back: the root cause and how you proved it, in 3 sentences.`,
});
export const OSS_FIXES = [fix(1, 'oss:excalidraw'), fix(2, 'oss:posthog'), fix(3, 'oss:calcom'), fix(4, 'oss:excalidraw'), fix(5, 'oss:posthog'), fix(6, 'oss:calcom'), fix(7, 'oss:excalidraw')];
const review = (n, id, week) => ({
  id: `jt:code-review-${n}`, repo: id, week, mins: 45, depth: true,
  url: gh(repo(id).repo, 'pulls', 'is:pr is:merged review:changes_requested'),
  text: `Code review rep ${n} (${repo(id).name}): open a merged PR where the maintainers asked for changes, review its first version yourself (correctness, edge cases, naming, tests), then compare with the maintainers' comments. Explain back: one issue you missed and why you missed it.`,
});
export const CODE_REVIEWS = [review(1, 'oss:posthog', 5), review(2, 'oss:excalidraw', 8), review(3, 'oss:calcom', 11), review(4, 'oss:posthog', 13)];

// §13 depth reads in the judgment thread: Stripe idempotency (area 1) is the week-3 how-it-works Monday above (the same object),
// and the SRE book's troubleshooting chapter (area 4) is read in week 3, before the first open-source fix (`before`).
export const JT_DEPTH_READS = [
  HOW_IT_WORKS.find(x => x.id === 'jt:hiw-stripe-idempotency'),
  { id: 'jt:depth-sre-troubleshooting', week: 3, before: 'jt:oss-fix-1', mins: 45, depth: true, url: 'https://sre.google/sre-book/effective-troubleshooting/',
    text: 'Depth read · Google SRE book, ch. 12 "Effective Troubleshooting": the observe → hypothesise → test loop and its common pitfalls, before your first open-source fix. Explain back: the loop and two pitfalls, in your own words.' },
];

// §18 interview environment practice: Phase 3 short tasks, one per week in Grind weeks 10–13.
export const INTERVIEW_ENV = [
  { id: 'env:coderpad', week: 10, text: 'Interview environment: solve one problem in CoderPad/HackerRank, with no IDE help, talking as you go', url: 'https://app.coderpad.io/sandbox' },
  { id: 'env:google-doc', week: 11, text: 'Interview environment: write one solution in a Google Doc with no autocomplete, then check it by hand', url: 'https://docs.google.com/document/create' },
  { id: 'env:excalidraw', week: 12, text: 'Interview environment: draw one system design in Excalidraw while talking (record 5 min)', url: 'https://excalidraw.com/' },
  { id: 'env:camera-mic', week: 13, text: 'Interview environment: check your camera and mic before a virtual onsite (light, framing, sound)', url: 'https://webcamtests.com/' },
];
