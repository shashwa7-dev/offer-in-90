// Plan assembly (Task 8). Run: node --experimental-strip-types scripts/test-engine.ts
// engine.ts has extensionless runtime imports, so this tests the pure builder (plan-build.ts) with the same wiring.
import assert from 'node:assert/strict';
import * as dsa from '../src/lib/content/dsa.js';
import * as career from '../src/lib/content/career.js';
import * as aiCore from '../src/lib/content/ai-core.js';
import * as frontend from '../src/lib/content/frontend.js';
import * as systems from '../src/lib/content/systems.js';
import * as platform from '../src/lib/content/platform.js';
import * as product from '../src/lib/content/product.js';
import * as reference from '../src/lib/content/reference.js';
import * as sundays from '../src/lib/content/sundays.js';
import { buildTracks } from '../src/lib/tracks.ts';
import { layoutDays, cursorsAt } from '../src/lib/layout.ts';
import { placeDay, resolveRoutine } from '../src/lib/routine.ts';
import { WEEKDAY_BLOCKS, BUFFER_BLOCK, SUNDAY_BLOCKS } from '../src/lib/schedule.js';
import { buildPlanFrom, cursorsNowFrom, drillPicks, isStudy } from '../src/lib/plan-build.ts';
import { switchMode } from '../src/lib/modes.ts';
import { counts } from '../src/lib/task-status.ts';
import { STAGES } from '../src/lib/timeline.ts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;
const content: Any = { ...dsa, ...career, ...aiCore, ...frontend, ...product, ...systems, ...platform, ...reference, ...sundays };
const tracks: Any = buildTracks(content);
const lib: Any = { content, tracks, layoutDays, cursorsAt, placeDay, resolveRoutine, WEEKDAY_BLOCKS, BUFFER_BLOCK, SUNDAY_BLOCKS };
const START = '2026-11-16'; // a Monday
const GRIND = { [START]: { mode: 'grind', cursors: {} } };
const base: Any = { start: START, kickoff: true, modes: GRIND, done: {}, sundayMode: {}, routine: {} };
const build = (s: Any = {}, updates: Any[] = [], custom: Any = {}) => buildPlanFrom({ ...base, ...s }, updates, custom, lib);
const isoOf = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const block = (d: Any, k: string) => d.blocks.find((b: Any) => b.k === k);
const ids = (d: Any, k: string) => (block(d, k)?.tasks ?? []).map((t: Any) => t.id);

// ---------- shape ----------
const G = build();
assert.equal(G.length, 92, 'Grind: prep + 91 days');
assert.equal(G.filter((d) => d.type !== 'kick').length, 91);
assert.equal(G[0].type, 'kick');
assert.equal(G[0].no, 0);
assert.equal(isoOf(G[0].date), '2026-11-15', 'prep day is the Sunday before start');
assert.equal(isoOf(G[1].date), START);
G.forEach((d, i) => assert.equal(d.i, i));
assert.equal(G.filter((d) => d.type === 'study').length, 78);
assert.equal(G.filter((d) => d.type === 'sun').length, 13);
assert.deepEqual(G.filter((d) => d.type === 'study').map((d) => d.s), Array.from({ length: 78 }, (_, i) => i + 1));
assert.deepEqual(G.filter((d) => d.type === 'sun').map((d) => d.n), Array.from({ length: 13 }, (_, i) => i + 1));
assert.equal(build({ kickoff: false }).length, 91);
const S = build({ modes: {} });
assert.equal(S.filter((d) => d.type !== 'kick').length, 119, 'Steady (default): 17 weeks');
for (const d of [...G, ...S]) for (const t of d.tasks) assert.ok(!('lld' in d) && !('mc' in d) && !('studyBefore' in d) && t.bk);

// ---------- day 1: each track's slot 0 in its block ----------
const d1 = G[1];
for (const t of ['dsa', 'fe', 'mc', 'sd', 'jt', 'beh', 'ai']) {
  assert.deepEqual(ids(d1, t), tracks[t][0].items.map((x: Any) => x.id), `day 1 ${t} block`);
}
assert.ok(!('aib' in tracks), 'aib is not a track');
// day 1: no AI-core slot yet (warm-up) and no Systems slot 3–7 days back, so the AI recall takes the full 50 min
assert.deepEqual(ids(d1, 'aib'), [`d:${START}:recall-ai`, `d:${START}:news`]);
assert.match(block(d1, 'aib').tasks[0].text, /^Warm-up:/);
assert.equal(block(d1, 'aib').tasks[0].mins, 50);
assert.deepEqual(ids(d1, 'review'), [`d:${START}:log`]);
assert.ok(block(d1, 'review').tasks[0].log);
// day 1 is foundations: no covered pattern yet, so no drill and no re-solves
assert.deepEqual(ids(d1, 'rev'), []);

// ---------- prep day: setup + baseline scored by hand ----------
const prep = G[0];
const SECTIONS = ['dsa', 'ai', 'sd', 'platform', 'product', 'fe'];
assert.deepEqual(ids(prep, 'baseline'), SECTIONS.map((x) => `baseline:${x}`));
assert.deepEqual(block(prep, 'baseline').tasks.map((t: Any) => t.scoreKey), SECTIONS.map((x) => `baseline/${x}`));
assert.deepEqual(block(prep, 'baseline').tasks.map((t: Any) => t.mins), [25, 15, 15, 10, 10, 15]);
assert.equal(block(prep, 'baseline').tasks.reduce((a: number, t: Any) => a + t.min, 0), 90);
assert.deepEqual(ids(prep, 'beh'), ['k-pos']);
assert.deepEqual(ids(prep, 'ai'), ['k-news']);
assert.ok(ids(prep, 'setup').includes('k-ics'));

// ---------- Sundays ----------
const sun = G.filter((d) => d.type === 'sun');
const s1 = sun[0], s1d = isoOf(s1.date);
assert.equal(s1.date.getDay(), 0);
assert.deepEqual(ids(s1, 'core').slice(0, 3), ['check', 'reflect', 'preview'].map((x) => `d:${s1d}:${x}`));
assert.equal(block(s1, 'core').tasks[0].scoreKey, 'w1');
assert.deepEqual(ids(s1, 'read'), [sundays.SUNDAY_READS[0].id], 'read 1 on Sunday 1');
sun.forEach((d, n) => assert.deepEqual(ids(d, 'read'), [sundays.SUNDAY_READS[n].id], `read ${n + 1} on Sunday ${n + 1}`));
assert.ok(!isStudy(block(s1, 'read').tasks[0]), 'the Sunday read is optional');
// default Sunday mode: active rest, one optional suggestion (health) that never counts
const explore = block(s1, 'sunday').tasks.find((t: Any) => t.id === `d:${s1d}:explore`);
assert.ok(explore && explore.cat === 'health' && !isStudy(explore));
assert.ok(!ids(s1, 'sunday').includes(`d:${s1d}:catchup`));
// revision mode: flagged re-solves + catch-up, no explore
{
  const R = build({ sundayMode: { [s1d]: 'revision' } });
  const r1 = R.find((d) => isoOf(d.date) === s1d)!;
  assert.ok(ids(r1, 'sunday').includes(`d:${s1d}:catchup`) && ids(r1, 'sunday').includes(`d:${s1d}:flagged`));
  assert.ok(!ids(r1, 'sunday').includes(`d:${s1d}:explore`));
  // other Sundays untouched
  assert.ok(ids(R.filter((d) => d.type === 'sun')[1], 'sunday').some((id: string) => id.endsWith(':explore')));
}
// readiness checks and the week-8 review on the Sunday ending that Grind week
for (const r of sundays.READINESS) assert.ok(ids(sun[r.week - 1], 'core').includes(r.id), `${r.id} on Sunday ${r.week}`);
assert.ok(ids(sun[7], 'core').includes(sundays.WEEK8_REVIEW.id));
assert.equal(sun.flatMap((d) => d.tasks).filter((t) => t.id.startsWith('sun:readiness-')).length, sundays.READINESS.length);
{
  // Steady: same checks, mapped onto Steady weeks (week 8 → Steady week 10)
  const ss = S.filter((d) => d.type === 'sun');
  assert.ok(ids(ss[9], 'core').includes(sundays.WEEK8_REVIEW.id), 'week-8 review on Steady Sunday 10');
  assert.equal(ss.flatMap((d) => d.tasks).filter((t) => t.id.startsWith('sun:readiness-')).length, sundays.READINESS.length);
  assert.ok(!ss[8].tasks.some((t) => t.id.endsWith(':apply')) && ss[9].tasks.some((t) => t.id.endsWith(':apply')), 'apply from Steady week 10');
  // weekly self-check score keys: one per Sunday, keyed by calendar week (Steady's 17 Sundays never share a key)
  for (const [plan, name] of [[G, 'grind'], [S, 'steady']] as const) {
    const keys = plan.filter((d) => d.type === 'sun').map((d) => block(d, 'core').tasks.find((t: Any) => t.scoreKey)?.scoreKey);
    assert.ok(keys.every(Boolean), `${name}: every Sunday has a self-check`);
    assert.equal(new Set(keys).size, keys.length, `${name}: score keys are unique (${keys.join(' ')})`);
    plan.filter((d) => d.type === 'sun').forEach((d, n) => assert.equal(keys[n], `w${d.week}`, `${name}: Sunday ${n + 1} keyed by its week`));
  }
  assert.equal(ss.length, 17);
}
// optional "apply to 3–5 roles" from Grind week 8
sun.forEach((d, n) => assert.equal(d.tasks.some((t) => t.id.endsWith(':apply')), n + 1 >= 8, `apply on Sunday ${n + 1}`));
for (const t of sun.flatMap((d) => d.tasks).filter((t) => t.id.endsWith(':apply'))) assert.ok(t.cat === 'health' && !isStudy(t));

// ---------- sundayCarry items land on their week's Sunday (R9) ----------
// A synthetic carry item rides on the jt slots of Grind weeks 1, 4 and 9's Saturdays, so the mechanism is tested on its
// own; the real Career carries are checked after it.
{
  const CARRY_AT = [5, 23, 53];
  const carryTracks: Any = { ...tracks, jt: tracks.jt.map((s: Any, i: number) => (CARRY_AT.includes(i)
    ? { items: [...s.items, { id: `test:carry-${i}`, text: 'Carried round (45 min)', cat: 'platform', mins: 45, sundayCarry: true }] } : s)) };
  const carryLib: Any = { ...lib, tracks: carryTracks };
  for (const [modes, name] of [[GRIND, 'grind'], [{}, 'steady']] as const) {
    const plan = buildPlanFrom({ ...base, modes }, [], {}, carryLib);
    const layout = layoutDays({ start: START, kickoff: true, modes, tracks: carryTracks, done: {} } as Any);
    const carried = new Set<string>();
    plan.forEach((d, i) => {
      if (d.type !== 'study') return;
      for (const t of d.blocks.flatMap((b) => b.tasks)) assert.ok(!t.id.startsWith('test:carry-'), `${name}: carry item ${t.id} not on a study day`);
      const jtBlock = ids(d, 'jt'), slot = layout[i].slots.jt;
      for (const x of slot?.items ?? []) {
        if (!x.sundayCarry) { assert.ok(jtBlock.includes(x.id), `${name}: ${x.id} stays in its slot`); continue; }
        const next = plan.slice(i).find((y) => y.type === 'sun')!;
        assert.ok(ids(next, 'sunday').includes(x.id), `${name}: ${x.id} on the next Sunday`);
        assert.ok(isStudy(block(next, 'sunday').tasks.find((t: Any) => t.id === x.id)), 'carried items are not optional');
        carried.add(x.id);
      }
    });
    assert.equal(carried.size, CARRY_AT.length, `${name}: every carry item placed`);
  }
  // The real tracks: only Career carries, its Saturday rounds (v3 §6) — peer mocks from week 4, solo mocks from week 5,
  // loop rounds 2–3 in weeks 10–13.
  const CARRIED = ['beh:peer-w4-behavioral', 'beh:mock-w5-sd', 'beh:peer-w6-decomposition', 'beh:mock-w7-ai', 'beh:peer-w8-sd', 'beh:mock-w9-ai',
    ...[1, 2, 3, 4].flatMap((n) => [`beh:loop-${n}-round-2`, `beh:loop-${n}-round-3`])];
  const real = Object.entries(tracks).flatMap(([t, slots]: Any) => slots.flatMap((s: Any) => s.items.filter((x: Any) => x.sundayCarry).map((x: Any) => `${t}/${x.id}`)));
  assert.deepEqual(real, CARRIED.map((id) => `beh/${id}`), 'only Career carries to Sunday');
  // On the real Grind calendar: the Sunday after week 4 has the behavioral peer mock in its `sunday` block, and every
  // carried round lands on the Sunday of its own week.
  const sun4 = G.find((d) => d.type === 'sun' && d.week === 4)!;
  assert.ok(ids(sun4, 'sunday').includes('beh:peer-w4-behavioral'), 'week 4 Sunday has the behavioral peer mock');
  for (const d of G.filter((d) => d.type === 'study')) for (const t of d.blocks.flatMap((b: Any) => b.tasks)) assert.ok(!CARRIED.includes(t.id), `${t.id} not on a study day`);
  const weekOfCarry = (id: string) => (/^beh:loop-(\d)-/.test(id) ? 9 + Number(id.match(/^beh:loop-(\d)-/)![1]) : Number(id.match(/-w(\d+)-/)![1]));
  for (const id of CARRIED) {
    const d = G.find((x) => x.type === 'sun' && ids(x, 'sunday').includes(id));
    assert.equal(d?.week, weekOfCarry(id), `${id} on the week ${weekOfCarry(id)} Sunday`);
  }
}

// ---------- revision block: ≤ 3 re-solves + 1 drill; the drill never picks an unseen check ----------
{
  const unseen = new Set(dsa.PROBLEMS.filter((p: Any) => p.role === 'unseen').map((p: Any) => p.slug));
  const teach = new Set(dsa.PROBLEMS.filter((p: Any) => p.role === 'teach').map((p: Any) => p.slug));
  let drills = 0, resolves = 0;
  for (const plan of [G, S]) for (const d of plan.filter((x) => x.type === 'study')) {
    const rev = block(d, 'rev');
    assert.ok(rev, `${isoOf(d.date)}: the revision block is never merged away`);
    const rs = rev.tasks.filter((t: Any) => t.id.startsWith('rs:'));
    const dr = rev.tasks.filter((t: Any) => /^d:.*:drill$/.test(t.id));
    assert.ok(rs.length <= 3, `${isoOf(d.date)}: ≤ 3 re-solves`);
    assert.ok(dr.length <= 1);
    assert.equal(rev.tasks.length, rs.length + dr.length);
    for (const t of rs) assert.ok(teach.has(t.slug), `${t.id} is a teaching problem`);
    for (const t of dr) {
      assert.equal(t.drill.length, 3);
      for (const p of t.drill) assert.ok(!unseen.has(p.slug), `drill never picks unseen ${p.slug}`);
      assert.ok(!t.url, 'drill keeps its links in the text');
    }
    drills += dr.length; resolves += rs.length;
  }
  assert.ok(drills > 100 && resolves > 100);
  // every teaching problem gets its +3/+7/+21 re-solves, each once, on or after it is due
  const placed = G.flatMap((d) => d.tasks.filter((t) => t.id.startsWith('rs:')).map((t) => [t.id, isoOf(d.date)] as const));
  assert.equal(new Set(placed.map(([id]) => id)).size, placed.length, 'each re-solve once');
  const taught = new Map<string, string>();
  for (const d of G) for (const t of block(d, 'dsa')?.tasks ?? []) if (t.role === 'teach') taught.set(t.slug, isoOf(d.date));
  assert.equal(placed.length, taught.size * 3);
  for (const [id, date] of placed) {
    const [, slug, k] = id.split(':');
    const due = new Date(Date.parse(`${taught.get(slug)}T00:00:00Z`) + Number(k) * 864e5).toISOString().slice(0, 10);
    assert.ok(date >= due, `${id} not before it is due`);
  }
  // the drill prefers optional-pool problems and is stable per date
  const covered = new Set(['hash-map', 'two-pointers']);
  const a = drillPicks(dsa.PROBLEMS, covered, '2026-12-01'), b = drillPicks(dsa.PROBLEMS, covered, '2026-12-01');
  assert.deepEqual(a, b);
  assert.ok(a.every((p: Any) => p.tier === 'optional' && covered.has(p.pattern)));
  assert.notDeepEqual(a.map((p: Any) => p.slug), drillPicks(dsa.PROBLEMS, covered, '2026-12-02').map((p: Any) => p.slug));
  assert.deepEqual(drillPicks(dsa.PROBLEMS, new Set(), '2026-12-01'), []);
}
// Saturdays: no revision merge in v3; the product block is low-level design and the career block a mock day
{
  for (const sat of G.filter((d) => d.type === 'study' && d.date.getDay() === 6)) {
    assert.deepEqual([block(sat, 'rev').s, block(sat, 'rev').e], ['14:45', '15:15']);
    assert.deepEqual([block(sat, 'jt').s, block(sat, 'jt').e, block(sat, 'jt').title], ['15:15', '16:00', 'Platform, data and DevOps']);
    assert.equal(block(sat, 'mc').title, 'Deep work 3 · Low-level design');
    assert.equal(block(sat, 'beh').title, 'Career · Mock day');
  }
  assert.equal(block(d1, 'mc').title, 'Deep work 3 · Product: the flagship');
  assert.equal(block(d1, 'beh').title, 'Career and FDE');
}
// block titles follow the slot, not the weekday: Steady's rotation moves LLD and mock-day slots off Saturdays
{
  const LLD = 'Deep work 3 · Low-level design', MOCK = 'Career · Mock day';
  const mockDay = STAGES.find((s) => s.label === 'Mock day')!.match;
  for (const [plan, name] of [[G, 'grind'], [S, 'steady']] as const) {
    let offSat = 0, lldDays = 0, mockDays = 0;
    for (const d of plan.filter((x) => x.type === 'study')) {
      const mc = block(d, 'mc'), beh = block(d, 'beh');
      const lld = !!mc?.tasks.some((t: Any) => t.cat === 'mc'), mock = !!beh?.tasks.some((t: Any) => mockDay(t));
      if (mc) assert.equal(mc.title === LLD, lld, `${name} ${isoOf(d.date)}: mc title "${mc.title}"`);
      if (beh) assert.equal(beh.title === MOCK, mock, `${name} ${isoOf(d.date)}: beh title "${beh.title}"`);
      lldDays += +lld; mockDays += +mock;
      if ((lld || mock) && d.date.getDay() !== 6) offSat++;
    }
    assert.deepEqual([lldDays, mockDays], [13, 13], `${name}: 13 LLD and 13 mock days`);
    if (name === 'steady') assert.ok(offSat > 0, 'Steady puts some LLD or mock-day slots on other weekdays');
  }
}

// ---------- routine changes block times ----------
{
  const R = build({ routine: { lunch: { on: true, title: 'Lunch', s: '12:00', min: 60 }, extra: { on: false, title: 'Gym', s: '18:00', min: 60 } } });
  const before = Object.fromEntries(G[1].blocks.map((b) => [b.k, b.s])), after = Object.fromEntries(R[1].blocks.map((b) => [b.k, b.s]));
  assert.equal(before.lunch, '11:45');
  assert.equal(after.lunch, '12:00');
  assert.equal(after.workout, undefined, 'gym off: no gym block');
  // a routine that overruns moves bedtime: every study block keeps its full length, wind-down shows the new time
  const F = build({ routine: { lunch: { on: true, title: 'Lunch', s: '12:00', min: 90 } } });
  const dur = (b: { s?: string; e?: string }) => Number(b.e!.slice(0, 2)) * 60 + Number(b.e!.slice(3)) - Number(b.s!.slice(0, 2)) * 60 - Number(b.s!.slice(3));
  for (const b of G[1].blocks.filter((x) => x.kind === 'study')) assert.equal(dur(F[1].blocks.find((x) => x.k === b.k)!), dur(b), `${b.k} full length`);
  const fw = F[1].blocks.find((b) => b.k === 'wind')!;
  assert.ok(fw.s! > '21:30', 'wind-down moved later');
  assert.equal(fw.title, `Wind down, no screens · sleep at ${fw.e}`);
  // a routine that cannot be placed (past 23:59) falls back to the template
  const X = build({ routine: { dinner: { on: true, title: 'Dinner', s: '19:15', min: 180 } } });
  assert.deepEqual(X[1].blocks.map((b) => b.s), G[1].blocks.map((b) => b.s));
  // wake-up shifts study days, not Sundays
  const W = build({ routine: { wake: { s: '04:30' } } });
  assert.equal(W[1].blocks.find((b) => b.k === 'wake')!.s, '04:30');
  assert.equal(W[1].blocks.find((b) => b.k === 'dsa')!.s, '04:45');
  const wSun = G.findIndex((d) => d.type === 'sun');
  assert.deepEqual(W[wSun].blocks.map((b) => b.s), G[wSun].blocks.map((b) => b.s), 'Sundays ignore wake-up');
  assert.equal(R[1].blocks.find((b) => b.k === 'lunch')!.title, 'Lunch');
  assert.deepEqual(R[0].blocks.map((b) => b.s), G[0].blocks.map((b) => b.s), 'prep day keeps its template');
  const sunIdx = G.findIndex((d) => d.type === 'sun');
  assert.deepEqual(R[sunIdx].blocks.map((b) => b.s), G[sunIdx].blocks.map((b) => b.s), 'Sundays keep their template');
}

// ---------- Steady: a track that doesn't run that day leaves a buffer block ----------
{
  const day = S.find((d) => d.type === 'study' && d.blocks.some((b) => b.k.startsWith('buffer-')))!;
  assert.ok(day);
  const buf = day.blocks.find((b) => b.k.startsWith('buffer-'))!;
  assert.equal(buf.tasks.length, 0);
  assert.equal(buf.kind, 'life');
  assert.equal(block(day, buf.k.slice('buffer-'.length)), undefined);
}

// ---------- minutes ----------
{
  const dsaB = block(d1, 'dsa');
  assert.equal(dsaB.tasks.reduce((a: number, t: Any) => a + t.min, 0), 60);
  for (const d of G.filter((x) => x.type === 'study')) {
    const study = d.blocks.filter((b) => b.kind === 'study');
    assert.equal(study.reduce((a, b) => a + (Number(b.e.slice(0, 2)) * 60 + Number(b.e.slice(3)) - Number(b.s.slice(0, 2)) * 60 - Number(b.s.slice(3))), 0), 645, `${isoOf(d.date)}: 10.75 h of study blocks`);
  }
  for (const d of G) for (const t of d.tasks) if (!isStudy(t)) assert.equal(t.min, 0, `${t.id} not counted`);
}

// ---------- mode switch: superseded copies are history, never counted ----------
{
  const today = '2026-11-25'; // Wednesday of week 2
  const done: Any = {};
  for (const d of G) if (isoOf(d.date) < today) for (const t of d.tasks) done[t.id] = 1;
  delete done[tracks.dsa[5].items[0].id]; // one slot left undone: it is laid again after the switch
  const cur = cursorsNowFrom({ ...base, done }, today, lib);
  assert.equal(cur.dsa, 5);
  const modes = switchMode(GRIND as Any, today, 'steady', cur, START);
  const X = build({ modes, done });
  const sup = X.flatMap((d) => d.tasks.filter((t) => t.superseded).map((t) => ({ t, d })));
  assert.ok(sup.length > 0, 'the re-laid slot leaves a superseded copy');
  for (const { t, d } of sup) {
    assert.ok(!isStudy(t) && t.min === 0, `${t.id} never counted`);
    assert.ok(t.movedTo && t.movedTo > isoOf(d.date), `${t.id} says where it moved`);
    const live = X.find((y) => isoOf(y.date) === t.movedTo)!;
    assert.ok(live.tasks.some((y) => y.id === t.id && !y.superseded));
  }
}

// ---------- updates and own tasks ----------
{
  const target = tracks.fe[0].items[0].id;
  const U = build({}, [
    { id: 'u1', date: START, kind: 'outdated', priority: 'should', area: 'fe', title: 'x', why: 'moved', target, replacementUrl: 'https://example.com/new' },
    { id: 'u2', date: START, kind: 'new', priority: 'must', area: 'ai', title: 'Big paper', why: 'w', url: 'https://example.com/p' },
  ], { c1: { date: START, block: 'dsa', text: 'Mine', at: 1 } });
  const t = U[1].tasks.find((x) => x.id === target)!;
  assert.ok(t.outdated && t.url === 'https://example.com/new');
  const firstSun = U.find((d) => d.type === 'sun')!;
  assert.ok(ids(firstSun, 'sunday').includes('upd-u2'), 'must-read lands in the Sunday block');
  assert.ok(ids(U[1], 'dsa').includes('u-c1'));
}

// ---------- isStudy matches task-status `counts` (the rule today-view uses for "missed") ----------
for (const d of [...G, ...S]) for (const t of d.tasks) assert.equal(isStudy(t), counts(t), t.id);

// ---------- the drill never draws from a pattern first taught that day ----------
for (const plan of [G, S]) {
  const seen = new Set<string>();
  for (const d of plan.filter((x) => x.type === 'study')) {
    const today = new Set((block(d, 'dsa')?.tasks ?? []).filter((t: Any) => t.pattern && !t.superseded).map((t: Any) => t.pattern));
    const drill = (block(d, 'rev')?.tasks ?? []).find((t: Any) => t.drill);
    const byName = new Map(dsa.PATTERNS.map((p: Any) => [p.name, p.id]));
    for (const p of drill?.drill ?? []) assert.ok(seen.has(byName.get(p.pattern) as string), `${isoOf(d.date)}: drill pattern ${p.pattern} covered on an earlier day`);
    for (const p of today) seen.add(p as string);
  }
}

// ---------- recall + news (the aib block, generated every study day; Review Focus 2) ----------
for (const [plan, modes, name] of [[G, GRIND, 'grind'], [S, {}, 'steady']] as const) {
  const L = layoutDays({ start: START, kickoff: true, modes, tracks, done: {} } as Any);
  const liveSlot = (x: Any, t: string) => (x.slots[t] && !x.slots[t].superseded ? x.slots[t] : undefined);
  plan.forEach((d, i) => {
    if (d.type !== 'study') return;
    const date = isoOf(d.date), aib = block(d, 'aib');
    // the latest learning slot (one with an :explain item), else the latest slot (a rep or mock)
    const learning = (x: Any, t: string) => x.slots[t].items.some((it: Any) => it.id.endsWith(':explain'));
    const latest = (xs: Any[], t: string) => xs.filter((x) => learning(x, t)).at(-1) ?? xs.at(-1);
    const aiSrc = latest(L.slice(0, i).filter((x: Any) => x.kind === 'study' && liveSlot(x, 'fe')), 'fe');
    const sdSrc = latest(L.slice(0, i).filter((x: Any) => x.kind === 'study' && liveSlot(x, 'sd') && x.studyNo >= L[i].studyNo - 7 && x.studyNo <= L[i].studyNo - 3), 'sd');
    assert.deepEqual(ids(d, 'aib'), [`d:${date}:recall-ai`, ...(sdSrc ? [`d:${date}:recall-sd`] : []), `d:${date}:news`], `${name} ${date} recall ids`);
    const [ra] = aib.tasks;
    assert.equal(ra.mins, sdSrc ? 30 : 50, `${name} ${date} recall-ai mins`);
    if (aiSrc) {
      const src = aiSrc.slots.fe.items[0];
      assert.ok(ra.text.includes(src.text), `${name} ${date}: AI recall of ${src.id}`);
      assert.equal(ra.url, src.url);
    } else assert.match(ra.text, /^Warm-up:/);
    if (sdSrc) {
      const rs = aib.tasks[1], src = sdSrc.slots.sd.items[0];
      assert.equal(rs.mins, 20);
      assert.ok(rs.text.includes(src.text), `${name} ${date}: Systems recall of ${src.id}`);
      assert.equal(rs.url, src.url);
    }
    const news = aib.tasks.at(-1);
    assert.deepEqual([news.mins, news.newsId, news.cat], [10, 'reads', 'ai']);
    assert.equal(aib.tasks.reduce((a: number, t: Any) => a + t.min, 0), 60);
    assert.ok(!(block(d, 'ai')?.tasks ?? []).some((t: Any) => t.newsId), `${name} ${date}: no news in the evening block`);
  });
  assert.ok(plan.some((d) => d.type === 'study' && ids(d, 'aib').some((id: string) => id.endsWith(':recall-sd'))), `${name}: Systems recall happens`);
}

// ---------- Steady: DSA rest days are a pattern revisit, not a buffer (Review Focus 3) ----------
// Run on the real plan, and on one whose first DSA slots carry no pattern (4 Phase 3 slots moved to the front), so a rest day
// before any pattern is covered still happens: v3 has only 2 foundation days.
const tracksEarly: Any = { ...tracks, dsa: [...tracks.dsa.slice(56, 60), ...tracks.dsa.slice(0, 56), ...tracks.dsa.slice(60)] };
const SEarly = buildPlanFrom({ ...base, modes: {} }, [], {}, { ...lib, tracks: tracksEarly });
for (const [tr, plan, early] of [[tracks, S, false], [tracksEarly, SEarly, true]] as Any[]) {
  const tracks = tr, S = plan;
  const HARD = ['dp', 'graph-traversal', 'topo-sort', 'union-find', 'shortest-path-mst', 'backtracking', 'tree-dfs', 'tree-bfs', 'top-k', 'two-heaps', 'k-way-merge', 'intervals', 'sliding-window', 'binary-search'];
  const inSlots = new Set(Object.values(tracks).flatMap((ts: Any) => ts.flatMap((s: Any) => s.items.map((x: Any) => x.slug).filter(Boolean))));
  const pool = (dsa.PROBLEMS as Any[]).filter((p) => (p.role === 'var' || p.tier === 'optional') && !inSlots.has(p.slug));
  const bySlug = new Map(pool.map((p) => [p.slug, p]));
  const L = layoutDays({ start: START, kickoff: true, modes: {}, tracks, done: {} } as Any);
  const lastDsa = L.findLastIndex((x: Any) => x.slots.dsa);
  const covered = new Set<string>(), used = new Set<string>();
  let revisits = 0, flaggedDays = 0, nonHardDays = 0;
  S.forEach((d, i) => {
    // Sunday problems draw from the same pool (owner rule 2026-11-15), so a revisit never repeats one.
    if (d.type === 'sun') for (const t of d.tasks) if (t.id.startsWith('sp:')) used.add(t.slug!);
    if (d.type !== 'study') return;
    const date = isoOf(d.date);
    if (!L[i].slots.dsa && i < lastDsa) {
      revisits++;
      assert.equal(block(d, 'buffer-dsa'), undefined, `${date}: no DSA buffer`);
      const ts = block(d, 'dsa').tasks;
      if (!covered.size) {
        assert.deepEqual(ts.map((t: Any) => t.id), [`d:${date}:revisit-flagged`]);
        assert.match(ts[0].text, /^Re-solve one flagged or hardest problem so far/);
        flaggedDays++;
      } else {
        assert.equal(ts.length, 2, `${date}: 2 revisit problems`);
        assert.equal(ts.reduce((a: number, t: Any) => a + t.mins, 0), 45);
        const avail = pool.filter((p) => covered.has(p.pattern) && !used.has(p.slug));
        const hardAvail = avail.filter((p) => HARD.includes(p.pattern));
        for (const t of ts) {
          assert.equal(t.id, `rv:${t.slug}:${date}`);
          assert.equal(t.cat, 'dsa');
          const p = bySlug.get(t.slug);
          assert.ok(p && covered.has(p.pattern), `${t.id} from a covered pattern`);
          assert.ok(!used.has(t.slug), `${t.slug} never revisited twice`);
          if (!HARD.includes(p.pattern)) assert.ok(hardAvail.length < 2, `${t.id}: hard patterns first`);
          if (p.role !== 'var') assert.ok(!(HARD.includes(p.pattern) ? hardAvail : avail).some((q) => q.role === 'var' && !ts.some((x: Any) => x.slug === q.slug)), `${t.id}: var before optional`);
        }
        if (!ts.some((t: Any) => HARD.includes(bySlug.get(t.slug).pattern))) nonHardDays++;
        for (const t of ts) used.add(t.slug);
      }
    } else if (!L[i].slots.dsa) assert.ok(block(d, 'buffer-dsa'), `${date}: DSA finished, a buffer`);
    for (const x of L[i].slots.dsa?.items ?? []) if (x.pattern) covered.add(x.pattern);
  });
  assert.ok(revisits >= 20, `Steady has ${revisits} revisit days`);
  // The spec's count: 23 (the last DSA rest day falls after DSA's final slot, so it is a buffer).
  if (!early) assert.equal(revisits, 23, 'Steady has 23 revisit days');
  if (early) assert.ok(flaggedDays >= 1, 'early revisit day with nothing covered: re-solve a flagged problem');
  assert.ok(nonHardDays >= 1, 'before any hard pattern: picks from any covered pattern');
  // Grind never revisits
  assert.ok(!G.some((d) => d.tasks.some((t) => t.id.startsWith('rv:') || t.id.endsWith(':revisit-flagged'))));
}
// A revisit problem without a url gets no `url` key (not `url: undefined`).
{
  const noUrl: Any = { ...content, PROBLEMS: (content.PROBLEMS as Any[]).map(({ url, ...p }: Any) => (p.role === 'var' || p.tier === 'optional' ? p : { ...p, url })) };
  const rv = buildPlanFrom({ ...base, modes: {} }, [], {}, { ...lib, content: noUrl }).flatMap((d) => d.tasks).filter((t: Any) => t.id.startsWith('rv:'));
  assert.ok(rv.length > 0, 'revisits built');
  assert.ok(rv.every((t: Any) => !('url' in t)), 'no url key on a url-less revisit');
}

// ---------- Owner rule (2026-11-15): at least one DSA problem every day, Sundays included ----------
// Plan length is unchanged by the Sunday problem (values at 70d9a96, before it).
assert.equal(G.length, 92, 'Grind length unchanged');
assert.equal(S.length, 120, 'Steady length unchanged');
{
  const HARD = ['dp', 'graph-traversal', 'topo-sort', 'union-find', 'shortest-path-mst', 'backtracking', 'tree-dfs', 'tree-bfs', 'top-k', 'two-heaps', 'k-way-merge', 'intervals', 'sliding-window', 'binary-search'];
  const bySlug = new Map((dsa.PROBLEMS as Any[]).map((p) => [p.slug, p]));
  const trackSlugs = new Set(Object.values(tracks).flatMap((ts: Any) => ts.flatMap((s: Any) => s.items.map((x: Any) => x.slug).filter(Boolean))));
  /** A task that has the owner solve a problem: a named problem (a slug), a Phase 3 OA slot, an advanced slot's "solve 1",
   * or the prep day's baseline problems (the spec's list). */
  const isProblem = (t: Any) => t.cat === 'dsa' && (!!t.slug || /^dsa:oa-\d+$/.test(t.id) || /^adv:[a-z-]+:do$/.test(t.id) || t.id === 'baseline:dsa');
  for (const [name, plan, modes] of [['grind', G, GRIND], ['steady', S, {}]] as Any[]) {
    for (const sundayMode of ['rest', 'revision'] as const) {
      const sm = Object.fromEntries(plan.filter((d: Any) => d.type === 'sun').map((d: Any) => [isoOf(d.date), sundayMode]));
      const P = sundayMode === 'rest' ? plan : build({ modes, sundayMode: sm });
      assert.equal(P.length, plan.length, `${name} ${sundayMode}: same length`);
      const lastDsa = P.findLastIndex((d: Any) => d.type === 'study' && block(d, 'dsa'));
      P.forEach((d: Any, i: number) => {
        // A Steady study day after DSA's final slot has a DSA buffer (spec count: 23 revisit days): see the report.
        if (d.type === 'study' && i > lastDsa) return;
        assert.ok(d.tasks.some(isProblem), `${name} ${sundayMode} day ${d.no} (${d.type}): a DSA problem`);
      });
      const covered = new Set<string>(), seen = new Set<string>();
      const revisitSlugs = new Set(P.flatMap((d: Any) => d.tasks.filter((t: Any) => t.id.startsWith('rv:')).map((t: Any) => t.slug)));
      for (const d of P) {
        if (d.type === 'study') {
          for (const t of block(d, 'dsa')?.tasks ?? []) if (t.pattern && !t.id.startsWith('rv:')) covered.add(t.pattern);
          continue;
        }
        if (d.type !== 'sun') continue;
        const date = isoOf(d.date), ts = block(d, 'sunday').tasks, sp = ts.filter((t: Any) => t.id.startsWith('sp:'));
        assert.equal(sp.length, 1, `${name} ${sundayMode} ${date}: one Sunday problem`);
        const [t] = sp, p = bySlug.get(t.slug);
        assert.equal(t.id, `sp:${t.slug}:${date}`);
        // 35 min, or 30 on a mock-loop Sunday whose 2 carried rounds (90 min) leave only that in the 120-min block.
        const carried = ts.filter((x: Any) => x.id.startsWith('beh:loop-')).reduce((a: number, x: Any) => a + x.mins, 0);
        assert.deepEqual([t.cat, t.mins, t.url, t.diff], ['dsa', carried === 90 ? 30 : 35, p.url, p.d], `${t.id} minutes`);
        assert.equal(t.text, `Sunday problem (30–40 min, timed): ${p.name}. A problem you haven't solved, from a pattern you've covered. Log it as unseen with your minutes.`);
        assert.ok(!t.optional && isStudy(t), `${t.id} counts as study time`);
        assert.ok(covered.has(p.pattern), `${t.id}: from a pattern covered on an earlier day`);
        assert.ok(p.role === 'var' || p.tier === 'optional', `${t.id}: from the revisit pool`);
        assert.ok(!trackSlugs.has(t.slug) && !revisitSlugs.has(t.slug), `${t.id}: not a track or revisit problem`);
        assert.ok(!seen.has(t.slug), `${t.id}: never reused`); seen.add(t.slug);
        if (!HARD.includes(p.pattern)) assert.ok(!(dsa.PROBLEMS as Any[]).some((q) => HARD.includes(q.pattern) && covered.has(q.pattern) && (q.role === 'var' || q.tier === 'optional') && !trackSlugs.has(q.slug) && !revisitSlugs.has(q.slug) && !seen.has(q.slug)), `${t.id}: hard patterns first`);
        const ex = ts.findIndex((x: Any) => x.id === `d:${date}:explore`);
        if (sundayMode === 'rest') assert.ok(ex > ts.indexOf(t), `${date}: the Sunday problem sits before the optional explore item`);
        assert.ok(block(d, 'sunday').tasks.reduce((a: number, x: Any) => a + x.min, 0) <= 120, `${date}: fits the 11:30–13:30 block`);
      }
    }
  }
  // Nothing covered yet (the early-Phase-3 plan's first Sunday): re-solve a flagged or hardest problem instead.
  const e1 = SEarly.find((d) => d.type === 'sun')!, e1d = isoOf(e1.date);
  assert.ok(!ids(e1, 'sunday').some((id: string) => id.startsWith('sp:')));
  const fb = block(e1, 'sunday').tasks.find((t: Any) => t.id === `d:${e1d}:sunday-flagged`);
  assert.ok(fb && fb.cat === 'dsa' && /^Re-solve one flagged or hardest problem so far/.test(fb.text) && isStudy(fb), 'empty pool: flagged re-solve');
}

console.log('test-engine: ok');
