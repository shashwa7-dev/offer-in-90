// Content assertions (roadmap v2 Task 4). Run: node --experimental-strip-types scripts/test-content.ts
import assert from 'node:assert/strict';
import { FE, FE_DEPTH_READS } from '../src/lib/content/fe.js';
import { UX } from '../src/lib/content/ux.js';
import { BEH, FDE, COMPANY_MAP, TEARDOWNS } from '../src/lib/content/career.js';
import { AIB_MOVED } from '../src/lib/content/ai.js';
import { PLAN } from '../src/lib/plan-data.js';

const ALL_ID_LISTS: any[][] = [FE, FE_DEPTH_READS, UX, BEH, FDE, AIB_MOVED, TEARDOWNS];
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
  for (const slug of ['sql', 'nosql', 'redis', 'queues', 'api-design', 'websockets-sse']) {
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
  assert.ok(FDE.some((x) => x.id === 'fde:terraform' || x.text.includes('Terraform')) === false);

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

console.log('test-content: ok');
