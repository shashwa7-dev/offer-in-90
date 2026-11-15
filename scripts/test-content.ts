// Content assertions (roadmap v2 Task 4). Run: node --experimental-strip-types scripts/test-content.ts
import assert from 'node:assert/strict';
import { FE, FE_DEPTH_READS } from '../src/lib/content/fe.js';
import { UX } from '../src/lib/content/ux.js';
import { BEH, FDE, COMPANY_MAP, TEARDOWNS } from '../src/lib/content/career.js';
import { AIB_MOVED, AIB, AI_EVENING, AI_REVIEW, AI_NEWS } from '../src/lib/content/ai.js';
import { createHash } from 'node:crypto';
import { PLAN } from '../src/lib/plan-data.js';

// AIB contains the AIB_MOVED items, so AIB_MOVED itself is not listed again.
const ALL_ID_LISTS: any[][] = [FE, FE_DEPTH_READS, UX, BEH, FDE, TEARDOWNS, AIB, AI_EVENING, AI_REVIEW, AI_NEWS];
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

  // plan-data still feeds the old engine in the old shapes
  assert.equal(PLAN.FE.length, 49);
  assert.deepEqual(PLAN.FE[0].length, 3);
  assert.equal(PLAN.UX[0].length, 2);
  assert.equal(PLAN.BEH[0].length, 2);
  assert.equal(PLAN.FDE.length, 42, 'old engine still sees the moved items');
  // old FDE order is preserved (moved items back at their original positions)
  const OLD_ORDER = `fde:stage1-intro fde:stage1-glossary fde:decomposition-framework aib:python-for-js aib:pandas fde:git-beyond-basics fde:linux-shell fde:practical-coding-log fde:data-audit-modeling fde:sql-analysis fde:data-pipelines fde:data-warehouses fde:decomposition-2 fde:context-engineering fde:model-providers fde:agents-memory fde:integration-engineering fde:reengineering-round aib:aws aib:terraform aib:containers aib:devops fde:client-simulation-1 fde:eval-pipelines fde:debugging-agents fde:inference-optimization fde:security fde:governance-privacy fde:mlops fde:learning-round fde:discovery fde:scoping fde:business-acumen fde:stakeholders fde:communication fde:decomposition-3 fde:client-simulation-2 fde:take-home-1 fde:take-home-2 fde:take-home-3 fde:decomposition-4 fde:mock-fde-loop`.split(' ');
  assert.equal(OLD_ORDER.length, 42);
  assert.deepEqual(PLAN.FDE.map((r: any) => r[0]), OLD_ORDER.map((id) => [...FDE, ...AIB_MOVED].find((x) => x.id === id)!.text));
  assert.equal(PLAN.COMPANY_MAP.length, 9);
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
  // the old engine's AI_UNITS (21 units, 61 days) as of c6d617f; 11 of those days are the four `Build ·` units
  const OLD_UNITS = PLAN.AI_UNITS as [string, [string, string][]][];
  const sha = (v: unknown) => createHash('sha256').update(JSON.stringify(v)).digest('hex');
  assert.equal(sha(PLAN.AI_UNITS), '3c643583137660a467fa1dc942dde814502b294a41bcbf63efb57d3275b6859d', 'old-shape AI_UNITS unchanged');
  assert.equal(sha(PLAN.AI_REVIEW), 'b0c7f594bc75e514b07d1ada603529506cb4d7b2d9df2de96cb036213c5cfcc2', 'old-shape AI_REVIEW unchanged');
  const oldDays = OLD_UNITS.flatMap(([unit, days]) => days.map(([text, url]) => ({ unit, text, url })));
  assert.equal(oldDays.length, 61);
  const buildDays = oldDays.map((d, day) => ({ ...d, day })).filter((d) => d.unit.startsWith('Build · '));
  assert.equal(buildDays.length, 11);

  // AI_EVENING: every paper/course day at its old day index, plus the 7 depth reads
  const kept = AI_EVENING.filter((x) => x.day !== undefined);
  assert.equal(kept.length, 61 - 11);
  for (const x of kept) {
    const d = oldDays[x.day];
    assert.ok(!d.unit.startsWith('Build · '), `${x.id} is not a build day`);
    assert.equal(x.text, d.text); assert.equal(x.unit, d.unit); assert.equal(x.url || '', d.url);
    assert.match(x.id, /^ai:/);
  }
  assert.deepEqual(kept.map((x) => x.day), [...kept.map((x) => x.day)].sort((a, b) => a - b), 'evening keeps old order');
  const depth = AI_EVENING.filter((x) => x.depth);
  assert.equal(depth.length, 7);
  assert.equal(AI_EVENING.length, 57);
  assert.ok(depth.every((x) => x.day === undefined && x.after && AI_EVENING.some((y) => y.id === x.after)));
  const ddia = depth.filter((x) => x.id.startsWith('ai:depth-ddia-'));
  assert.equal(ddia.length, 4);
  assert.ok(ddia.every((x) => x.url === 'https://dataintensive.net/'));
  for (const t of [/data models/i, /storage/i, /replication/i, /transactions/i]) assert.ok(ddia.some((x) => t.test(x.text)), String(t));
  const applied = depth.filter((x) => x.url.startsWith('https://applied-llms.org/'));
  assert.equal(applied.length, 2);
  assert.deepEqual(depth.filter((x) => x.url === 'https://eugeneyan.com/writing/llm-patterns/').length, 1);
  assert.ok(depth.every((x) => /explain/i.test(x.text)), 'depth tasks end with an explain-back');

  // AIB: Python first, 6 new hands-on days, the 11 build days, the 4 cloud sessions
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
  assert.equal(moved.length, 11);
  for (const b of buildDays) {
    const x = moved.find((y) => y.day === b.day)!;
    assert.ok(x, `build day ${b.day}`);
    assert.equal(x.text, b.text); assert.equal(x.unit, b.unit); assert.equal(x.url || '', b.url); assert.equal(x.slots, 2);
    assert.match(x.id, /^aib:/);
  }
  assert.equal(AIB.length, 6 + 6 + 11);
  const slots = AIB.reduce((a, x) => a + (x.slots ?? 1), 0);
  assert.ok(slots <= 78, `AIB slots ${slots}`);
  assert.equal(slots, 40);
  // no AI_UNITS day lives in both tracks
  assert.equal(new Set([...kept, ...moved].map((x) => x.day)).size, 61);

  assert.equal(AI_REVIEW.length, 8);
  assert.equal(AI_NEWS.length, 7);
}

console.log('test-content: ok');
