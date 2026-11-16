// Content assertions (roadmap v2 Task 4, v3 Task 9). Run: node --experimental-strip-types scripts/test-content.ts
// The v2 curriculum modules are gone; test-v3-coverage.ts checks every v2 id is placed or dropped, test-tracks.ts the layout.
import assert from 'node:assert/strict';
import { PATTERNS as DSA_PATTERNS, FOUNDATIONS, ADV_DSA, INTERVIEW_ENV } from '../src/lib/content/dsa.js';
import { BEH, FDE, COMPANY_MAP, TEARDOWNS, DECOMP, CAREER, MOCK_DAY } from '../src/lib/content/career.js';
import { AI_CORE, AI_NEWS } from '../src/lib/content/ai-core.js';
import { SYSTEMS } from '../src/lib/content/systems.js';
import { PLATFORM } from '../src/lib/content/platform.js';
import { FLAGSHIP, TAKE_HOMES, LLD } from '../src/lib/content/product.js';
import { FRONTEND } from '../src/lib/content/frontend.js';
import { PLAN } from '../src/lib/plan-data.js';
import { SUNDAY_READS, SUNDAY_CORE, SUNDAY_OPTIONAL, READINESS, WEEK8_REVIEW } from '../src/lib/content/sundays.js';
import { EXPLORE_LATER, FOCUS_RULES, FDE_STAGES, BOARD_MAP } from '../src/lib/content/reference.js';

// Task 14: the three new DSA patterns each keep one free source link (curl 200 on 2026-11-15)
{
  const link = (id: string) => (DSA_PATTERNS as any[]).find((p) => p.id === id)?.link;
  assert.equal(link('matrix'), 'https://www.techinterviewhandbook.org/algorithms/matrix/');
  assert.equal(link('design-ds'), 'https://www.geeksforgeeks.org/system-design/lru-cache-implementation/');
  assert.equal(link('math'), 'https://www.techinterviewhandbook.org/algorithms/math/');
}
// Every v3 content list: unique ids across lists, kebab-case ids, https urls. The CAREER rows reuse the BEH, FDE, DECOMP
// and TEARDOWNS ids (their source items), so those source lists are left out here.
const MOCK_ROWS = (MOCK_DAY as any[]).flatMap((d) => [d.row, ...d.carry]);
const ALL_ID_LISTS: any[][] = [FOUNDATIONS, ADV_DSA, INTERVIEW_ENV, AI_CORE, AI_NEWS, SYSTEMS, PLATFORM, FLAGSHIP, TAKE_HOMES,
  TAKE_HOMES.flatMap((b: any) => b.parts), LLD, CAREER, MOCK_ROWS, FRONTEND,
  SUNDAY_READS, SUNDAY_CORE, SUNDAY_OPTIONAL, READINESS, [WEEK8_REVIEW], EXPLORE_LATER];
const byId = (list: any[], id: string) => list.find((x) => x.id === id);

// ---- shared shape; career ----
{
  // shared shape
  const ids = new Set<string>();
  for (const list of ALL_ID_LISTS) for (const it of list) {
    // A Frontend design's second slot is `<design id>:deep-dive`.
    assert.match(it.id, /^[a-z]+:[a-z0-9]+(-[a-z0-9]+)*(:deep-dive)?$/, `bad id ${it.id}`);
    assert.ok(!ids.has(it.id), `duplicate id ${it.id}`);
    ids.add(it.id);
    assert.ok(typeof (it.text ?? it.understand) === 'string', `${it.id} text`);
    if (it.url) assert.match(it.url, /^https:\/\//, `${it.id} url`);
    if (it.url2) assert.match(it.url2, /^https:\/\//, `${it.id} url2`);
  }

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

// ---- product: take-homes, LLD ----
{
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

  // LLD: 13, unchanged
  assert.equal(LLD.length, 13);
  assert.ok(LLD.every((x) => /^lld:/.test(x.id)));
}

// ---- decomposition, interview environment, Sundays, readiness, reference ----
{
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
  // none repeats a Systems case study (the v2 Monday how-it-works reads, §17)
  const caseStudies = (SYSTEMS as any[]).filter((r) => r.id.startsWith('jt:hiw-'));
  assert.equal(caseStudies.length, 10);
  assert.ok(SUNDAY_READS.every((x) => !caseStudies.some((h) => h.url === x.url)));

  // Sunday core (§17): weekly self-check (R1: hand-scored), reflection with a listen-back, next-week preview
  assert.deepEqual(SUNDAY_CORE.map((x) => x.id), ['sun:weekly-self-check', 'sun:reflection', 'sun:next-week-preview']);
  const [check, reflect, preview] = SUNDAY_CORE;
  assert.ok(check.text.startsWith('Weekly self-check: ') && check.scores === true && check.mins === 40);
  assert.match(reflect.text, /listen-back/i); assert.match(reflect.text, /one thing to change/);
  assert.match(preview.text, /next week/); assert.equal(preview.mins, 10);
  assert.deepEqual(SUNDAY_OPTIONAL.map((x) => [x.id, x.fromWeek, x.optional]), [['sun:apply-roles', 8, true]]);
  assert.match(SUNDAY_OPTIONAL[0].text, /apply to 3–5 roles/);

  // Readiness checks: 5, keyed by Grind week (the exact texts are checked against the spec in test-v3-coverage.ts)
  assert.deepEqual(READINESS.map((x) => x.week), [4, 8, 10, 12, 13]);
  for (const x of READINESS) assert.equal(x.id, `sun:readiness-w${x.week}`);
  assert.equal(WEEK8_REVIEW.id, 'sun:week8-review');
  assert.equal(WEEK8_REVIEW.week, 8);

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

  // plan-data.js is a thin merge of the v3 content files: EXTENSION, the v1 old shapes and the v2 modules are gone
  assert.ok(!('EXTENSION' in PLAN), 'Month 4 removed');
  for (const k of ['DSA', 'AI_UNITS', 'APPLY', 'FDE_PROMPTS']) assert.ok(!(k in PLAN), `v1 ${k} removed`);
  for (const k of ['UX', 'FE', 'FE_DEPTH_READS', 'MC', 'MC_TIMED', 'MC_SCREENSHOT', 'PROJECT', 'PROJECT_DEPTH_READS', 'SD', 'SD_MOCKS', 'AIB', 'AIB_MOVED',
    'AI_EVENING', 'AI_REVIEW', 'HOW_IT_WORKS', 'MEMOS', 'PRACTICAL', 'OSS_REPOS', 'OSS_FIXES', 'CODE_REVIEWS', 'JT_DEPTH_READS', 'DROPPED']) assert.ok(!(k in PLAN), `v2 ${k} removed`);
  assert.equal(PLAN.EXPLORE_LATER, EXPLORE_LATER);
  assert.equal(PLAN.FOCUS_RULES, FOCUS_RULES);
  assert.equal(PLAN.AI_NEWS, AI_NEWS);
  assert.equal(PLAN.INTERVIEW_ENV, INTERVIEW_ENV);
  // Reference tables point at v3 tracks, not the v2 blocks.
  for (const r of [...FDE_STAGES, ...BOARD_MAP, ...COMPANY_MAP]) assert.ok(!/machine-coding block|evening AI block|FDE sessions|UX block|Revision block|frontend & CS|email \+ chat/i.test(r[r.length - 1]), `${r[0]}: v3 placement`);
  assert.match(FDE_STAGES[1][2], /TypeScript only/, 'FDE stage 2: the Python part is left out');
  assert.equal(PLAN.SUNDAY_READS, SUNDAY_READS);
  assert.equal(PLAN.AI_CORE, AI_CORE);
  assert.equal(PLAN.SYSTEMS, SYSTEMS);
  assert.equal(PLAN.PLATFORM, PLATFORM);
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
