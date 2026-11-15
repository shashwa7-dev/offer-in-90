// Content assertions (roadmap v2 Task 4). Run: node --experimental-strip-types scripts/test-content.ts
import assert from 'node:assert/strict';
import { FE, FE_DEPTH_READS } from '../src/lib/content/fe.js';
import { PATTERNS as DSA_PATTERNS } from '../src/lib/content/dsa.js';
import { UX } from '../src/lib/content/ux.js';
import { BEH, FDE, COMPANY_MAP, TEARDOWNS } from '../src/lib/content/career.js';
import { AIB_MOVED, AIB, AI_EVENING, AI_REVIEW, AI_NEWS } from '../src/lib/content/ai.js';
import { AI_CORE } from '../src/lib/content/ai-core.js';
import { MC, MC_TIMED, MC_SCREENSHOT, TAKE_HOMES, PROJECT, PROJECT_DEPTH_READS, LLD } from '../src/lib/content/mc.js';
import { SD, SD_MOCKS } from '../src/lib/content/sd.js';
import { PLAN } from '../src/lib/plan-data.js';
import { HOW_IT_WORKS, MEMOS, PRACTICAL, DECOMP, OSS_REPOS, OSS_FIXES, CODE_REVIEWS, JT_DEPTH_READS, INTERVIEW_ENV } from '../src/lib/content/judgment.js';
import { SUNDAY_READS, SUNDAY_CORE, SUNDAY_OPTIONAL, READINESS, WEEK8_REVIEW } from '../src/lib/content/sundays.js';
import { EXPLORE_LATER, FOCUS_RULES } from '../src/lib/content/reference.js';

// AIB contains the AIB_MOVED items, so AIB_MOVED itself is not listed again.
// TAKE_HOMES briefs and their parts are listed alongside so their ids are checked too.
// Task 14: the three new DSA patterns each keep one free source link (curl 200 on 2026-11-15)
{
  const link = (id: string) => (DSA_PATTERNS as any[]).find((p) => p.id === id)?.link;
  assert.equal(link('matrix'), 'https://www.techinterviewhandbook.org/algorithms/matrix/');
  assert.equal(link('design-ds'), 'https://www.geeksforgeeks.org/system-design/lru-cache-implementation/');
  assert.equal(link('math'), 'https://www.techinterviewhandbook.org/algorithms/math/');
}
const ALL_ID_LISTS: any[][] = [FE, FE_DEPTH_READS, UX, BEH, FDE, TEARDOWNS, AIB, AI_EVENING, AI_REVIEW, AI_NEWS,
  MC, MC_SCREENSHOT, TAKE_HOMES, TAKE_HOMES.flatMap((b: any) => b.parts), PROJECT, PROJECT_DEPTH_READS, LLD, SD, SD_MOCKS,
  // JT_DEPTH_READS[0] is the Stripe item of HOW_IT_WORKS (the same object), so only the SRE read is listed again.
  HOW_IT_WORKS, MEMOS, PRACTICAL, DECOMP, OSS_REPOS, OSS_FIXES, CODE_REVIEWS, JT_DEPTH_READS.slice(1), INTERVIEW_ENV,
  SUNDAY_READS, SUNDAY_CORE, SUNDAY_OPTIONAL, READINESS, [WEEK8_REVIEW], EXPLORE_LATER];
const byId = (list: any[], id: string) => list.find((x) => x.id === id);

// ---- 4a: FE, UX, career ----
{
  // shared shape
  const ids = new Set<string>();
  for (const list of ALL_ID_LISTS) for (const it of list) {
    assert.match(it.id, /^[a-z]+:[a-z0-9]+(-[a-z0-9]+)*$/, `bad id ${it.id}`);
    assert.ok(!ids.has(it.id), `duplicate id ${it.id}`);
    ids.add(it.id);
    assert.equal(typeof it.text, 'string');
    if (it.url) assert.match(it.url, /^https:\/\//, `${it.id} url`);
    if (it.slots !== undefined) assert.ok(it.slots === 1 || it.slots === 2);
  }

  // FE
  assert.equal(FE.length, 49);
  assert.ok(byId(FE, 'fe:nextjs-caching-rsc'));
  assert.ok(FE.every((x) => x.practice && x.url), 'FE keeps practice and url');
  const react = FE.filter((x) => x.id.startsWith('fe:react-'));
  assert.ok(react.length >= 5);
  for (const r of react) assert.ok(r.summary && r.summary.length <= 400, `${r.id} summary`);
  for (const slug of ['sql', 'nosql', 'redis', 'queues', 'api-design', 'websockets-sse', 'http-caching']) {
    assert.equal(byId(FE, `fe:${slug}`)?.depth, true, `fe:${slug} depth`);
  }
  assert.equal(FE_DEPTH_READS.length, 2);
  for (const d of FE_DEPTH_READS) {
    assert.equal(d.depth, true);
    assert.equal(d.after, 'fe:sql');
    assert.match(d.url, /use-the-index-luke\.com/);
  }

  // UX: 35 + level calibration in week 3 (days 13-18), displaced item last
  assert.equal(UX.length, 36);
  const lc = UX.findIndex((x) => x.id === 'ux:level-calibration');
  assert.ok(lc >= 12 && lc <= 17, `level calibration at day ${lc + 1}`);
  assert.equal(UX[UX.length - 1].id, 'ux:figma-for-engineers');

  // BEH
  assert.equal(BEH.length, 35 + 3 + 2);
  for (const id of ['beh:deep-dive-1', 'beh:deep-dive-2', 'beh:deep-dive-3', 'beh:negotiation-1', 'beh:negotiation-2']) assert.ok(byId(BEH, id), id);
  // deep dives: one per Saturday (days 12, 18, 24)
  assert.deepEqual([1, 2, 3].map((n) => BEH.findIndex((x) => x.id === `beh:deep-dive-${n}`) + 1), [12, 18, 24]);
  assert.ok(byId(BEH, 'beh:positioning').text.includes('product engineer who ships AI features'));
  // LPs done by week 4 (day 24)
  assert.ok(BEH.findIndex((x) => x.id === 'beh:lp-employer-scale') < 24);

  // FDE: 42 old items minus 2 Python minus 4 Stage-6 cloud
  assert.equal(FDE.length, 36);
  for (const s of ['python-for-js', 'pandas', 'aws', 'terraform', 'containers', 'devops']) assert.ok(!byId(FDE, `fde:${s}`), `fde:${s} moved`);
  for (const m of AIB_MOVED) assert.ok(!FDE.some((x) => x.text === m.text), `${m.id} text absent from FDE`);

  // moved items
  assert.deepEqual(AIB_MOVED.map((x) => x.id), ['aib:python-for-js', 'aib:pandas', 'aib:aws', 'aib:terraform', 'aib:containers', 'aib:devops']);
  assert.ok(AIB_MOVED.every((x) => x.slots === 2 && x.url && x.text));

  // depth in data/LLM areas of the FDE track
  for (const s of ['data-audit-modeling', 'data-pipelines', 'eval-pipelines', 'debugging-agents']) assert.equal(byId(FDE, `fde:${s}`)?.depth, true, s);

  // COMPANY_MAP
  assert.equal(COMPANY_MAP.length, 9);
  assert.ok(COMPANY_MAP.every((r) => r.length === 3));
  const apple = COMPANY_MAP.find((r) => r[0].startsWith('Apple'));
  const stripe = COMPANY_MAP.find((r) => r[0] === 'Stripe');
  assert.ok(apple && /accessibility/i.test(apple[1]) && /privacy/i.test(apple[1]) && /deep dive/i.test(apple[1]));
  assert.ok(stripe && /bug squash/i.test(stripe[1]) && /integration/i.test(stripe[1]) && /API design/i.test(stripe[1]) && /code review/i.test(stripe[1]));

  assert.equal(PLAN.COMPANY_MAP, COMPANY_MAP);
  assert.equal(COMPANY_MAP.length, 9);
  // product teardowns: one per company row that has a product (not the round/topic rows)
  const NO_PRODUCT = ['Meta AI-enabled round', 'Forward-deployed', 'System design in 2026'];
  const companies = COMPANY_MAP.filter((r) => !NO_PRODUCT.some((n) => r[0].startsWith(n)));
  assert.equal(TEARDOWNS.length, companies.length);
  for (const row of companies) {
    const t = TEARDOWNS.find((x) => row[0].startsWith(x.company));
    assert.ok(t, `teardown for ${row[0]}`);
    assert.match(t.id, /^beh:teardown-[a-z0-9-]+$/);
    assert.ok(t.text.includes('3 improvements'));
    assert.match(t.url, /^https:\/\//);
  }
  assert.equal(new Set(TEARDOWNS.map((x) => x.id)).size, TEARDOWNS.length);
}

// ---- 4b: AI evening + AI-build track ----
{
  // the reading/course days keep their old 0-based day index (`day`), in order; tracks.ts places them by it
  const kept = AI_EVENING.filter((x) => x.day !== undefined);
  assert.ok(kept.every((x) => /^ai:/.test(x.id) && Number.isInteger(x.day) && x.unit));
  assert.deepEqual(kept.map((x) => x.day), [...kept.map((x) => x.day)].sort((a, b) => a - b), 'evening keeps old order');
  const reads = AI_EVENING.filter((x) => x.day === undefined);
  assert.equal(reads.length, 7);
  assert.equal(AI_EVENING.length, kept.length + 7);
  assert.ok(reads.every((x) => x.depth && x.after && AI_EVENING.some((y) => y.id === x.after)));
  const ddia = reads.filter((x) => x.id.startsWith('ai:depth-ddia-'));
  assert.equal(ddia.length, 4);
  assert.ok(ddia.every((x) => x.url === 'https://dataintensive.net/'));
  for (const t of [/data models/i, /storage/i, /replication/i, /transactions/i]) assert.ok(ddia.some((x) => t.test(x.text)), String(t));
  assert.deepEqual(reads.filter((x) => x.url.startsWith('https://applied-llms.org/')).map((x) => x.url),
    ['https://applied-llms.org/#tactical-nuts-bolts-of-working-with-llms', 'https://applied-llms.org/#operational-day-to-day-and-org-concerns']);
  assert.equal(reads.filter((x) => x.url === 'https://eugeneyan.com/writing/llm-patterns/').length, 1);

  // AIB: Python first, 6 new hands-on days, the 18 build days, the 4 cloud sessions
  assert.deepEqual(AIB.slice(0, 2).map((x) => x.id), ['aib:python-for-js', 'aib:pandas']);
  for (const m of AIB_MOVED) assert.equal(AIB.find((x) => x.id === m.id), m, `${m.id} in AIB`);
  const NEW = [['LLM API fundamentals', 1], ['Retrieval that works', 2], ['Agents in production', 2], ['LLM gateway', 1]] as const;
  const fresh = AIB.filter((x) => x.title);
  assert.equal(fresh.length, 6);
  for (const [title, n] of NEW) {
    const its = fresh.filter((x) => x.title === title);
    assert.equal(its.length, n, title);
    for (const x of its) { assert.ok(x.text.startsWith(title), x.id); assert.ok(x.url, x.id); assert.equal(x.slots, 1); }
  }
  const moved = AIB.filter((x) => x.day !== undefined);
  assert.equal(moved.length, 11 + 7, 'the 18 old build days');
  assert.ok(moved.every((x) => /^aib:/.test(x.id) && x.slots === 2 && x.unit));
  assert.equal(AIB.length, AIB_MOVED.length + fresh.length + moved.length, 'AIB holds nothing else');
  const slots = AIB.reduce((a, x) => a + (x.slots ?? 1), 0);
  assert.ok(slots <= 78, `AIB slots ${slots}`);
  // no AI_UNITS day lives in both tracks
  assert.equal(new Set([...kept, ...moved].map((x) => x.day)).size, 61);

  // §13 area 3 (building LLM applications) is Depth, and every Depth task ends with an explain-back sentence
  const AREA3 = `aib:llm-api-fundamentals aib:tool-call-loop aib:rag-build-notes aib:retrieval-chunking-hybrid aib:retrieval-hnsw-recall aib:react-build-agent aib:agents-sdk-build aib:agents-long-running aib:llm-gateway aib:evals-test-cases aib:evals-llm-judge aib:llm-observability aib:prompt-injection-attack ai:evals-hamel ai:contextual-retrieval ai:building-effective-agents ai:prompt-caching-cost`.split(' ');
  for (const id of AREA3) assert.equal([...AIB, ...AI_EVENING].find((x) => x.id === id)?.depth, true, `${id} depth`);
  for (const x of [...AIB, ...AI_EVENING].filter((y) => y.depth)) assert.match(x.text, /(^|[.!?] )Explain back[^.!?]*\.$/, `${x.id} ends with an explain-back`);

  // prerequisite order: each AIB `after` lands on an earlier study day. AIB item k starts on study day = slots before it;
  // an AI_EVENING item is on study day max(its old day, its evening position), the later of the two possible sequencings.
  const aibStart = new Map<string, number>();
  AIB.reduce((s, x) => (aibStart.set(x.id, s), s + (x.slots ?? 1)), 0);
  const eveDay = new Map(AI_EVENING.map((x, i) => [x.id, Math.max(x.day ?? -1, i)]));
  for (const x of AIB.filter((y) => y.after)) {
    const start = aibStart.get(x.id)!;
    const pre = aibStart.has(x.after) ? aibStart.get(x.after)! : eveDay.get(x.after);
    assert.ok(pre !== undefined, `${x.id} after ${x.after} exists`);
    assert.ok(pre < start, `${x.id} (study day ${start}) after ${x.after} (study day ${pre})`);
  }
  // the RAG and agent follow-ups name the build they extend
  for (const [id, pre] of [['aib:retrieval-chunking-hybrid', 'aib:rag-build-notes'], ['aib:agents-sdk-build', 'aib:react-build-agent'], ['aib:evals-test-cases', 'ai:evals-hamel'], ['aib:rag-build-notes', 'ai:contextual-retrieval'], ['aib:react-build-agent', 'ai:building-effective-agents']]) {
    assert.equal(AIB.find((x) => x.id === id)?.after, pre, `${id} after ${pre}`);
  }

  assert.equal(AI_REVIEW.length, 8);
  assert.equal(AI_NEWS.length, 7);
}

// ---- 4c: machine coding, flagship, LLD, system design ----
{
  const old = (x: any) => x.oldText ?? x.text;
  for (const x of [...MC, ...PROJECT, ...SD]) if (x.oldText !== undefined) assert.ok(x.text.startsWith(x.oldText.replace(/\.$/, '')), `${x.id} text extends oldText`);

  // MC: 34 builds (old order and text), the 8 §5 pairs share one 90-min block (45 min each)
  assert.equal(MC.length, 34);
  assert.ok(MC.every((x) => /^mc:/.test(x.id)));
  const PAIRS = [['mc:accordion', 'mc:tabs'], ['mc:star-rating', 'mc:otp-input'], ['mc:pagination', 'mc:toast'], ['mc:modal', 'mc:tooltip'],
    ['mc:event-emitter', 'mc:promise-pool'], ['mc:debounced-search', 'mc:like-button'], ['mc:image-carousel', 'mc:tic-tac-toe'], ['mc:use-fetch', 'mc:redux-store']];
  const paired = MC.filter((x) => x.pair);
  assert.equal(paired.length, 16);
  for (const [a, b] of PAIRS) for (const id of [a, b]) {
    assert.deepEqual(byId(MC, id)?.pair, [a, b], `${id} pair`);
    assert.equal(byId(MC, id).mins, 45, `${id} mins`);
  }
  assert.ok(MC.filter((x) => !x.pair).every((x) => x.mins === 90));
  for (const [a, b] of PAIRS) assert.ok(MC.findIndex((x) => x.id === a) < MC.findIndex((x) => x.id === b), `${a} before ${b} in MC`);
  assert.equal(MC.length - PAIRS.length, 26, '34 builds in 26 blocks');

  // MC_TIMED: 12 builds, as ids
  assert.equal(MC_TIMED.length, 12);
  assert.ok(MC_TIMED.every((id: string) => MC.some((x) => x.id === id)));

  // screenshot builds (§5): 3 × 45 min, pixel-accurate, responsive, accessible
  assert.equal(MC_SCREENSHOT.length, 3);
  for (const x of MC_SCREENSHOT) {
    assert.equal(x.mins, 45); assert.deepEqual(x.weeks, [4, 8]); assert.match(x.id, /^mc:screenshot-/); assert.match(x.url, /^https:\/\/www\.frontendmentor\.io\/challenges\//);
    for (const w of [/pixel-accurate/, /responsive/, /accessible/]) assert.match(x.text, w, x.id);
  }

  // take-homes (§5): weeks 7 and 10, 3 × 90-min parts each, Linear and PostHog style
  assert.equal(TAKE_HOMES.length, 2);
  assert.deepEqual(TAKE_HOMES.map((b: any) => b.week), [7, 10]);
  for (const b of TAKE_HOMES) {
    assert.match(b.id, /^mc:take-home-/);
    for (const w of [/4–8 h/, /keyboard-first/, /accessible/, /README/, /trade-offs/, /walkthrough/]) assert.match(b.text, w, `${b.id} brief`);
    assert.equal(b.parts.length, 3);
    assert.deepEqual(b.parts.map((p: any) => p.id), [1, 2, 3].map((n) => `${b.id}-${n}`));
    assert.ok(b.parts.every((p: any) => p.mins === 90 && p.text));
    assert.match(b.parts[0].url, /^https:\/\//);
  }
  assert.ok(/Linear/.test(TAKE_HOMES[0].style) && /PostHog/.test(TAKE_HOMES[1].style));

  // PROJECT: 20 steps in 18 slots (2 merges); `v1` is the old 1-based step, kept (with the old text) for the v1 adapter
  assert.equal(PROJECT.length, 18);
  assert.ok(PROJECT.every((x) => /^proj:/.test(x.id)));
  const merged = PROJECT.filter((x) => x.oldSteps);
  assert.deepEqual(merged.map((x) => x.id), ['proj:brief-wireframes', 'proj:search-performance']);
  for (const m of merged) {
    assert.equal(m.oldSteps.length, 2);
    assert.equal(m.v1, undefined);
    for (const { text: t } of m.oldSteps) assert.ok(m.text.includes(t.replace(/\.$/, '')), `${m.id} keeps "${t.slice(0, 30)}"`);
  }
  const steps = PROJECT.flatMap((x) => x.oldSteps ?? [{ v1: x.v1, text: old(x), url: x.url || '' }]);
  assert.deepEqual(steps.map((x) => x.v1).sort((a, b) => a - b), Array.from({ length: 20 }, (_, i) => i + 1));
  // §13 row 2: Ink & Switch read in the step before the real-time step
  const rt = PROJECT.findIndex((x) => x.id === 'proj:realtime');
  assert.ok(rt > 0);
  assert.equal(PROJECT_DEPTH_READS.length, 1);
  const read = PROJECT_DEPTH_READS[0];
  assert.equal(read.id, 'proj:local-first-software');
  assert.equal(read.after, PROJECT[rt - 1].id, 'read follows the step before real-time');
  assert.ok(read.depth === true && read.mins === 60 && read.url === 'https://www.inkandswitch.com/essay/local-first/', 'local-first read');
  assert.ok(PROJECT.every((x) => !('read' in x)), 'one link per item: no nested reads');

  // LLD: 13, unchanged
  assert.equal(LLD.length, 13);
  assert.ok(LLD.every((x) => /^lld:/.test(x.id)));

  // SD (§6): internet, FE SD, HLD concepts (+ numbers card, delivery framework, concepts to master), 23 HLD problems core first, 4 AI designs
  assert.equal(SD[0].id, 'sd:internet');
  const PARTS = ['internet', 'fe', 'concepts', 'hld', 'ai'];
  const seq = SD.map((x) => x.part);
  assert.deepEqual(seq, [...seq].sort((a, b) => PARTS.indexOf(a) - PARTS.indexOf(b)), 'parts in §6 order');
  assert.deepEqual(PARTS.map((p) => seq.filter((s) => s === p).length), [1, 18, 15, 23, 4]);
  assert.equal(SD.find((x) => x.part === 'fe').id, 'sd:fe-radio', 'RADIO opens frontend SD');
  const concepts = SD.filter((x) => x.part === 'concepts');
  assert.deepEqual(concepts.slice(-2).map((x) => x.id), ['sd:delivery-framework', 'sd:concepts-to-master']);
  const nc = byId(SD, 'sd:numbers-card');
  assert.ok(nc && nc.part === 'concepts' && /latency/.test(nc.text) && /throughput/.test(nc.text) && /storage/.test(nc.text) && nc.url);
  assert.equal(SD.indexOf(nc), SD.findIndex((x) => x.id === 'sd:capacity-estimation') + 1, 'numbers card follows capacity estimation');
  const CORE = 'bitly rate-limiter dropbox whatsapp ticketmaster fb-news-feed youtube web-crawler distributed-cache job-scheduler payment-system top-k-leaderboard yelp live-comments ad-click-aggregator'.split(' ');
  const OTHER = 'news-aggregator local-delivery leetcode tinder instagram-post-search price-tracker online-auction search-autocomplete'.split(' ');
  assert.deepEqual(SD.filter((x) => x.part === 'hld').map((x) => x.id), [...CORE, ...OTHER].map((s) => `sd:hld-${s}`));
  assert.ok(SD.filter((x) => x.part === 'ai').every((x) => x.id.startsWith('sd:ai-')));
  // every old SD topic kept, with its old text and url; the numbers card is the only new item
  const fresh = SD.filter((x) => x.id === 'sd:numbers-card');
  assert.equal(SD.filter((x) => x.v1 !== undefined).length + fresh.length, SD.length);
  const oldSd = SD.filter((x) => x.v1 !== undefined).sort((a, b) => a.v1 - b.v1);
  assert.deepEqual(oldSd.map((x) => x.v1), Array.from({ length: 60 }, (_, i) => i + 1), '`v1` is the old 1-based SD position');
  assert.equal(nc.v1, undefined);

  // SD_MOCKS: unchanged rotation of 24
  assert.equal(SD_MOCKS.length, 24);
  assert.ok(SD_MOCKS.every((x) => /^sdm:/.test(x.id)));

  // §13 depth: area 1 SD concepts, area 2 flagship real-time/offline + chat/doc/whiteboard designs, area 3 AI designs + flagship AI steps
  const DEPTH = `proj:realtime proj:offline proj:ai-ingestion proj:ai-ask-workspace proj:ai-agent-actions proj:evals
    sd:cap-pacelc sd:storage sd:replication-sharding sd:transactions sd:communication sd:caching sd:messaging sd:idempotency-saga
    sd:fe-network-data sd:fe-chat-app sd:fe-collab-editor sd:fe-whiteboard sd:hld-whatsapp
    sd:ai-eval-framework sd:ai-chatgpt sd:ai-rag-search sd:ai-coding-agent`.split(/\s+/);
  for (const id of DEPTH) assert.equal([...PROJECT, ...SD].find((x) => x.id === id)?.depth, true, `${id} depth`);
  assert.equal([...MC, ...PROJECT, ...SD].filter((x) => x.depth).length, DEPTH.length, 'no other depth items');
  for (const x of [...MC, ...MC_SCREENSHOT, ...PROJECT, ...PROJECT_DEPTH_READS, ...LLD, ...SD].filter((y) => y.depth)) {
    assert.match(x.text, /(^|[.!?] )Explain back[^.!?]*\.$/, `${x.id} ends with an explain-back`);
  }
}

// ---- 4d: judgment thread, Sundays, readiness, reference ----
{
  const EXPLAIN_BACK = /(^|[.!?] )Explain back[^.!?]*\.$/;

  // How it really works (§4): 10 reads, each on the company's own engineering blog, in the §4 order
  assert.equal(HOW_IT_WORKS.length, 10);
  const HIW = [['Figma', /figma\.com\/blog\//], ['Linear', /linear\.app\/now\//], ['Stripe', /stripe\.com\/blog\//], ['Discord', /discord\.com\/blog\//],
    ['Slack', /slack\.engineering\//], ['Notion', /notion\.com\/blog\//], ['Next.js', /nextjs\.org\/blog\//], ['Shopify', /shopify\.engineering\//],
    ['Cloudflare', /blog\.cloudflare\.com\/18-november-2025-outage/], ['GitHub', /github\.blog\//]] as const;
  HIW.forEach(([company, host], i) => {
    const x = HOW_IT_WORKS[i];
    assert.equal(x.company, company, `how-it-works ${i + 1}`);
    assert.match(x.url, /^https:\/\//); assert.match(x.url, host, `${x.id} url on ${company}'s own blog`);
    assert.match(x.id, /^jt:hiw-/);
    for (const w of [/redraw the system from memory/, /3 trade-offs/]) assert.match(x.text, w, x.id);
  });

  // Decision memos (§4): the 13 prompts verbatim
  const MEMO_PROMPTS = ['SSR vs CSR for a dashboard', 'Postgres vs DynamoDB for chat', 'RAG vs fine-tuning for support', 'Build vs buy auth', 'WebSocket vs SSE',
    'Monolith vs services at 5 engineers', 'Polling vs webhooks for an integration', 'Ship now vs fix tech debt', 'One model vs routing', 'Sync vs queue for an export',
    'Feature flag vs long-lived branch', 'Cache vs read replica', 'Offline-first or not'];
  assert.equal(MEMOS.length, 13);
  assert.deepEqual(MEMOS.map((x) => x.prompt), MEMO_PROMPTS);
  for (const x of MEMOS) {
    assert.match(x.id, /^jt:memo-/);
    assert.ok(x.text.includes(x.prompt), x.id);
    for (const w of [/options/, /criteria/, /pick/, /what would change your mind/]) assert.match(x.text, w, x.id);
  }

  // Practical coding (§4): 12 timed 45-min reps in the §4 order, alternating TypeScript and Python
  const PRACTICAL_TOPICS = [/rate limiter/i, /exponential backoff and jitter/i, /TTL cache with stale-while-revalidate/i, /cancellable\/debounced fetcher/i,
    /merge two messy CSVs/i, /parse a log file/i, /backpressure/i, /RAG pipeline/i, /CLI tool/i, /LRU cache/i, /promise pool/i, /webhook receiver with idempotency/i];
  assert.equal(PRACTICAL.length, 12);
  PRACTICAL.forEach((x, i) => {
    assert.match(x.text, PRACTICAL_TOPICS[i], x.id);
    assert.equal(x.lang, i % 2 === 0 ? 'ts' : 'py', `${x.id} lang`);
    assert.equal(x.mins, 45);
    assert.match(x.text, x.lang === 'ts' ? /TypeScript/ : /Python/, `${x.id} names its language`);
  });

  // Decomposition / client simulation (§4): the FDE reps and FDE_PROMPTS (one duplicate dropped), plus 2 from published FDE guides
  assert.equal(DECOMP.length, 12);
  assert.ok(DECOMP.every((x) => /^jt:decomp-|^jt:client-sim-/.test(x.id) && x.mins === 45));
  assert.equal(new Set(DECOMP.map((x) => x.text)).size, 12, 'no prompt twice');
  const fromFde = DECOMP.filter((x) => x.from);
  assert.deepEqual(fromFde.map((x) => x.from), ['fde:decomposition-framework', 'fde:decomposition-2', 'fde:client-simulation-1', 'fde:decomposition-3',
    'fde:client-simulation-2', 'fde:decomposition-4']);
  for (const x of fromFde) assert.ok(FDE.some((f) => f.id === x.from), `${x.id} from ${x.from}`);
  const fromPrompts = DECOMP.filter((x) => x.v1Prompt !== undefined);
  assert.deepEqual(fromPrompts.map((x) => x.v1Prompt), [0, 2, 4, 5], 'FDE_PROMPTS 1, 3, 5, 6 (2 duplicates fde:client-simulation-2, 4 is practical coding)');
  const guides = DECOMP.filter((x) => x.source);
  assert.equal(guides.length, 2);
  assert.ok(guides.every((x) => x.url === x.source && /^https:\/\/www\.(aced\.io|techinterview\.org)\//.test(x.url)), 'guide prompts carry their source');
  assert.equal(fromFde.length + fromPrompts.length + guides.length, 12);

  // Open source (§4, Ruling R4): 3 repos, 7 fixes and 4 code reviews over the 11 Fridays of weeks 3–13 (reviews in weeks 5, 8, 11, 13)
  assert.deepEqual(OSS_REPOS.map((x) => x.name), ['PostHog', 'Cal.com', 'Excalidraw']);
  for (const r of OSS_REPOS) { assert.match(r.url, /^https:\/\/github\.com\/[^/]+\/[^/]+\/issues\?q=/); assert.match(r.url, /label/); }
  assert.equal(OSS_FIXES.length, 7);
  assert.equal(CODE_REVIEWS.length, 4);
  assert.deepEqual(CODE_REVIEWS.map((x) => x.week), [5, 8, 11, 13]);
  const repoIds = OSS_REPOS.map((r) => r.id);
  for (const x of [...OSS_FIXES, ...CODE_REVIEWS]) { assert.ok(repoIds.includes(x.repo), `${x.id} repo`); assert.match(x.url, /^https:\/\/github\.com\//); }
  assert.ok(OSS_FIXES.every((x) => /reproduce → hypothesise → isolate → verify/.test(x.text) && /postmortem/.test(x.text)));
  assert.ok(CODE_REVIEWS.every((x) => /maintainers/.test(x.text) && /\/pulls\?q=/.test(x.url)));

  // Depth reads (§13): Stripe idempotency (a how-it-works Monday in week 2 or 3), SRE ch. 12 (week 3, before the first OSS fix)
  assert.equal(JT_DEPTH_READS.length, 2);
  const [stripe, sre] = JT_DEPTH_READS;
  assert.equal(stripe, HOW_IT_WORKS.find((x) => x.company === 'Stripe'), 'Stripe read is the how-it-works item');
  assert.equal(stripe.url, 'https://stripe.com/blog/idempotency');
  const stripeWeek = HOW_IT_WORKS.indexOf(stripe) + 1; // how-it-works item i runs on the Monday of Grind week i + 1
  assert.ok(stripeWeek === 2 || stripeWeek === 3, `Stripe read in week ${stripeWeek}`);
  assert.equal(sre.url, 'https://sre.google/sre-book/effective-troubleshooting/');
  assert.equal(sre.week, 3); assert.equal(sre.before, OSS_FIXES[0].id);
  assert.ok(JT_DEPTH_READS.every((x) => x.depth === true));

  // §13 depth: area 2 how-it-works (Figma, Linear, Slack), area 1 data reads, area 3 Copilot, area 4 OSS fixes + code reviews
  for (const c of ['Figma', 'Linear', 'Stripe', 'Discord', 'Slack', 'Notion', 'Next.js', 'GitHub']) assert.equal(HOW_IT_WORKS.find((x) => x.company === c).depth, true, c);
  assert.ok([...OSS_FIXES, ...CODE_REVIEWS].every((x) => x.depth === true));
  const JT_ALL = [...HOW_IT_WORKS, ...MEMOS, ...PRACTICAL, ...DECOMP, ...OSS_FIXES, ...CODE_REVIEWS, sre, ...INTERVIEW_ENV];
  for (const x of JT_ALL.filter((y) => y.depth)) assert.match(x.text, EXPLAIN_BACK, `${x.id} ends with an explain-back`);
  for (const x of JT_ALL) if (x.url) assert.match(x.url, /^https:\/\//, x.id);

  // Interview environment practice (§18): the 4 Phase 3 tasks, one per week in weeks 10–13
  assert.equal(INTERVIEW_ENV.length, 4);
  for (const [i, w] of [/CoderPad\/HackerRank/, /Google Doc with no autocomplete/, /Excalidraw while talking/, /camera and mic/].entries()) {
    assert.match(INTERVIEW_ENV[i].text, w);
    assert.equal(INTERVIEW_ENV[i].week, 10 + i);
    assert.match(INTERVIEW_ENV[i].id, /^env:/);
  }

  // Sunday reads (§17): the 15 curated reads in order (Grind uses 1–13), plus 2 Steady extras (an AI paper, an industry problem)
  assert.equal(SUNDAY_READS.length, 17);
  const READ_URLS = ['https://www.uber.com/blog/h3/', 'https://about.gitlab.com/blog/postmortem-of-database-outage-of-january-31/',
    'https://openai.com/index/why-language-models-hallucinate/', 'https://bytes.swiggy.com/engineering-challenges-at-swiggy-430dea6c86a3',
    'https://www.allthingsdistributed.com/2007/10/amazons_dynamo.html', 'https://linear.app/now/how-we-built-multi-region-support-for-linear',
    'https://aws.amazon.com/message/101925/', 'https://www.uber.com/blog/deepeta-how-uber-predicts-arrival-times/',
    'https://www.anthropic.com/research/tracing-thoughts-language-model', 'https://blog.swiggy.com/life-at-swiggy/heres-how-swiggy-built-the-group-ordering-feature/',
    'https://www.crowdstrike.com/wp-content/uploads/2024/08/Channel-File-291-Incident-Root-Cause-Analysis-08.06.2024.pdf', 'https://razorpay.com/blog/payment-gateway-uptime-slas/',
    'https://aws.amazon.com/blogs/database/unlocking-performance-scalability-and-cost-efficiency-of-zomatos-billing-platform-by-switching-from-tidb-to-dynamodb/',
    'https://blog.hotstar.com/scaling-for-tsunami-traffic-2ec290c37504', 'https://linear.app/now/rebuilding-delta-sync-read-path'];
  assert.deepEqual(SUNDAY_READS.slice(0, 15).map((x) => x.url), READ_URLS);
  const CATS = ['app', 'incident', 'ai-paper', 'industry', 'classic-paper', 'app', 'incident', 'industry', 'ai-paper', 'app', 'incident', 'industry', 'app', 'industry', 'app'];
  assert.deepEqual(SUNDAY_READS.slice(0, 15).map((x) => x.category), CATS);
  assert.deepEqual(SUNDAY_READS.map((x) => x.grind), [...Array(13).fill(true), false, false, false, false], 'Grind uses reads 1–13');
  const extras = SUNDAY_READS.slice(15);
  assert.deepEqual(extras.map((x) => x.category), ['ai-paper', 'industry']);
  assert.ok(extras.every((x) => x.steadyExtra === true));
  for (const x of SUNDAY_READS) {
    assert.match(x.id, /^sun:read-/); assert.match(x.url, /^https:\/\//); assert.equal(x.optional, true);
    for (const w of [/the real problem/, /the key trade-off/, /where you'd use the idea/]) assert.match(x.text, w, x.id);
  }
  assert.equal(new Set(SUNDAY_READS.map((x) => x.url)).size, 17);
  // none repeats a Monday how-it-works read (§17)
  assert.ok(SUNDAY_READS.every((x) => !HOW_IT_WORKS.some((h) => h.url === x.url)));

  // Sunday core (§17): weekly self-check (R1: hand-scored), reflection with a listen-back, next-week preview
  assert.deepEqual(SUNDAY_CORE.map((x) => x.id), ['sun:weekly-self-check', 'sun:reflection', 'sun:next-week-preview']);
  const [check, reflect, preview] = SUNDAY_CORE;
  assert.ok(check.text.startsWith('Weekly self-check: ') && check.scores === true && check.mins === 40);
  assert.match(reflect.text, /listen-back/i); assert.match(reflect.text, /one thing to change/);
  assert.match(preview.text, /next week/); assert.equal(preview.mins, 10);
  assert.deepEqual(SUNDAY_OPTIONAL.map((x) => [x.id, x.fromWeek, x.optional]), [['sun:apply-roles', 8, true]]);
  assert.match(SUNDAY_OPTIONAL[0].text, /apply to 3–5 roles/);

  // Readiness checks (§11): 5 checks keyed by Grind week, text as §11 (week 4 names its patterns, final review)
  const READY = {
    4: '3 past-project deep dives rehearsed; story bank of 12 stories; pitch recorded; unseen checks passed for the hash map, prefix sum, two pointers, sliding window, cyclic sort and stack patterns; 3 decision memos; weekly test ≥ 70%.',
    8: 'Linked List, Trees and Heaps green; 4 open-source fixes submitted; flagship has real-time and 1 AI feature working; take-home 1 done.',
    10: 'unseen checks passed for 20 of the 27 patterns; 6 decomposition reps.',
    12: 'all 27 patterns green (the second unseen solve comes from Phase 3 timed sets and mocks); the top-12 machine-coding builds done in ≤ 45 min.',
    13: '3 full mock loops (product engineer, FDE, frontend SDE-2); flagship case study published; weekly test ≥ 80% for 3 weeks running.',
  };
  assert.deepEqual(READINESS.map((x) => x.week), [4, 8, 10, 12, 13]);
  for (const x of READINESS) { assert.equal(x.text, READY[x.week as keyof typeof READY]); assert.equal(x.id, `sun:readiness-w${x.week}`); }
  assert.equal(WEEK8_REVIEW.id, 'sun:week8-review');
  assert.equal(WEEK8_REVIEW.week, 8);
  assert.equal(WEEK8_REVIEW.text, 'Week-8 review: read the weekly-test trend, which patterns are green, the readiness checks, and the four depth tests. ' +
    'Then rebalance the remaining weeks: move optional reps into weak areas and note what to drop to optional. Write the result as a Notes page.');

  // Explore later (§16): 8 areas, 1–3 https resources each
  assert.deepEqual(EXPLORE_LATER.map((x) => x.area), ['DSA', 'Systems', 'Frontend', 'AI', 'Infra', 'Product', 'Career growth', 'Interview extras']);
  for (const x of EXPLORE_LATER) {
    assert.match(x.id, /^xl:/); assert.ok(x.text.length > 20, x.id);
    assert.ok(x.resources.length >= 1 && x.resources.length <= 3, `${x.id} 1–3 resources`);
    for (const r of x.resources) { assert.ok(r.text, x.id); assert.match(r.url, /^https:\/\//, `${x.id} ${r.url}`); }
  }

  // Focus rules (§19): the 4 old rules (Month 4 → Explore later) plus the 3 new ones
  assert.equal(FOCUS_RULES.length, 7);
  assert.ok(FOCUS_RULES.every((r) => !/Month 4/.test(r)));
  assert.match(FOCUS_RULES[0], /Explore later/);
  for (const w of [/only that day's list/, /One link per task/, /Parking lot/]) assert.ok(FOCUS_RULES.slice(4).some((r) => w.test(r)), String(w));

  // plan-data.js is a thin merge of the content files: EXTENSION and the v1 old shapes are gone
  assert.ok(!('EXTENSION' in PLAN), 'Month 4 removed');
  for (const k of ['DSA', 'AI_UNITS', 'APPLY', 'FDE_PROMPTS']) assert.ok(!(k in PLAN), `v1 ${k} removed`);
  assert.equal(PLAN.EXPLORE_LATER, EXPLORE_LATER);
  assert.equal(PLAN.FOCUS_RULES, FOCUS_RULES);
  assert.equal(PLAN.FE, FE);
  assert.equal(PLAN.SUNDAY_READS, SUNDAY_READS);
  assert.equal(PLAN.AI_CORE, AI_CORE);
}

// ---- v3 AI engineering core (Task 3): row shape and copy rules; tracks.ts tests the layout ----
{
  assert.equal(AI_CORE.length, 78);
  const seenIds = new Set<string>();
  for (const r of AI_CORE as any[]) {
    assert.match(r.id, /^[a-z]+:[a-z0-9]+(-[a-z0-9]+)*$/, `bad id ${r.id}`);
    assert.ok(!seenIds.has(r.id), `duplicate AI_CORE id ${r.id}`);
    seenIds.add(r.id);
    assert.match(r.url, /^https:\/\//, `${r.id} url`);
    if (r.url2) { assert.match(r.url2, /^https:\/\//, `${r.id} url2`); assert.notEqual(r.url2, r.url, `${r.id} url2 differs`); }
    for (const c of r.covers ?? []) assert.match(c, /^[a-z]+:[a-z0-9]+(-[a-z0-9]+)*$/, `${r.id} covers ${c}`);
    const texts = r.kind ? [r.text] : [r.understand, r.do, r.explain];
    for (const t of texts) {
      assert.ok(typeof t === 'string' && t.trim(), `${r.id} text`);
      assert.ok(!/python|pandas|notebook/i.test(t), `${r.id}: no Python, pandas or notebooks`);
    }
    if (!r.kind) assert.match(r.explain, /Deep enough when you can/, `${r.id} explain`);
  }
}

console.log('test-content: ok');
