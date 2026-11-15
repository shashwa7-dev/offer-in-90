// Run: node --experimental-strip-types scripts/test-layout.ts
import assert from 'node:assert/strict';
import * as dsa from '../src/lib/content/dsa.js';
import * as fe from '../src/lib/content/fe.js';
import * as ux from '../src/lib/content/ux.js';
import * as career from '../src/lib/content/career.js';
import * as ai from '../src/lib/content/ai.js';
import * as aiCore from '../src/lib/content/ai-core.js';
import * as mc from '../src/lib/content/mc.js';
import * as sd from '../src/lib/content/sd.js';
import * as judgment from '../src/lib/content/judgment.js';
import * as reference from '../src/lib/content/reference.js';
import { buildTracks } from '../src/lib/tracks.ts';
import { MODE_INFO, modeOn, switchMode, steadyWeek, grindWeekOf } from '../src/lib/modes.ts';
import { steadyRuns, layoutDays, cursorsAt, WEEKS } from '../src/lib/layout.ts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;
const content: Any = { ...dsa, ...fe, ...ux, ...career, ...ai, ...aiCore, ...mc, ...sd, ...judgment, ...reference };
const tracks: Any = buildTracks(content);
const TRACKS = ['dsa', 'fe', 'mc', 'sd', 'jt', 'beh', 'ai'];
const ZERO: Any = Object.fromEntries(TRACKS.map((t) => [t, 0]));
const START = '2026-11-16';

/** The live (not superseded) slot of track t on day d. */
const live = (d: Any, t: string) => (d.slots[t] && !d.slots[t].superseded ? d.slots[t] : undefined);
/** Every live (track, slot index) laid out, in calendar order. */
const placements = (days: Any[]) => days.flatMap((d) => TRACKS.filter((t) => live(d, t)).map((t) => [t, d.slots[t].index, d.no] as const));
const itemIds = (days: Any[]) => days.flatMap((d) => TRACKS.flatMap((t) => (live(d, t) ? d.slots[t].items.map((x: Any) => x.id) : [])));
/** Each track's slot indices, in calendar order. */
const sequences = (days: Any[]) => {
  const out: Record<string, number[]> = Object.fromEntries(TRACKS.map((t) => [t, []]));
  for (const [t, i] of placements(days)) out[t].push(i);
  return out;
};
const range78 = Array.from({ length: 78 }, (_, i) => i);
/** done map: every item laid out on a day before `date` is ticked. */
const doneBefore = (days: Any[], date: string) => {
  const done: Record<string, number> = {};
  for (const d of days) if (d.date < date) for (const t of TRACKS) for (const x of live(d, t)?.items ?? []) done[x.id] = 1;
  return done;
};
const plan = (start: string, modes: Any = {}, done: Any = {}) => layoutDays({ start, kickoff: true, modes, tracks, done });

// ---------- modes ----------
assert.deepEqual(MODE_INFO, { grind: { weeks: 13, studyDays: 78 }, steady: { weeks: 17, studyDays: 102 } });
assert.equal(steadyWeek(8), 10);
assert.equal(steadyWeek(4), 5);
assert.equal(steadyWeek(13), 17);
for (let w = 1; w <= 13; w++) assert.equal(grindWeekOf(steadyWeek(w)), w, `grindWeekOf(steadyWeek(${w}))`);
for (let s = 1; s <= 17; s++) assert.ok(grindWeekOf(s) <= grindWeekOf(s + 1), 'grindWeekOf is monotonic');
// layout.ts keeps local copies of the week helpers (no runtime imports): they must agree
for (let w = 0; w <= 20; w++) {
  assert.equal(WEEKS.steadyWeek(w), steadyWeek(w), `layout steadyWeek(${w})`);
  assert.equal(WEEKS.grindWeekOf(w), grindWeekOf(w), `layout grindWeekOf(${w})`);
}

assert.deepEqual(modeOn({}, START), { mode: 'steady', cursors: ZERO, since: '' });
{
  let m: Any = {};
  m = switchMode(m, '2026-11-10', 'grind', ZERO, START);
  m = switchMode(m, '2026-12-05', 'steady', { ...ZERO, dsa: 12 }, START);
  assert.equal(modeOn(m, '2026-11-09').mode, 'steady', 'before any entry: default');
  assert.deepEqual(modeOn(m, '2026-11-10'), { mode: 'grind', cursors: ZERO, basis: START, since: '2026-11-10' });
  assert.equal(modeOn(m, '2026-12-04').mode, 'grind');
  assert.deepEqual(modeOn(m, '2026-12-30'), { mode: 'steady', cursors: { ...ZERO, dsa: 12 }, basis: START, since: '2026-12-05' });
  // twice on one day: the last write wins
  m = switchMode(m, '2026-12-05', 'grind', { ...ZERO, dsa: 13 }, START);
  assert.deepEqual(modeOn(m, '2026-12-05'), { mode: 'grind', cursors: { ...ZERO, dsa: 13 }, basis: START, since: '2026-12-05' });
  assert.equal(Object.keys(m).length, 2);
  // partial cursors are filled to all 7 tracks
  const p = switchMode({}, '2026-12-05', 'grind', { dsa: 3 } as Any, START);
  assert.deepEqual(p['2026-12-05'].cursors, { ...ZERO, dsa: 3 });
}

// ---------- rotation ----------
{
  const runs = TRACKS.map(() => 0);
  const skips = (t: string, d: number) => !steadyRuns(TRACKS.indexOf(t), d);
  for (let d = 0; d < 102; d++) {
    let n = 0;
    TRACKS.forEach((_, t) => {
      if (steadyRuns(t, d)) { runs[t]++; n++; }
      else assert.ok(d === 0 || steadyRuns(t, d - 1), `track ${TRACKS[t]} skips days ${d - 1} and ${d}`);
    });
    assert.ok(n >= 5, `day ${d} runs ${n} tracks`);
    assert.ok(!(skips('dsa', d) && skips('fe', d)), `day ${d}: DSA and AI core never rest together`);
    assert.equal(skips('fe', d), skips('mc', d), `day ${d}: fe and mc skip on the same days`);
  }
  assert.deepEqual(runs, TRACKS.map(() => 78), 'each track runs 78 of 102 days');
}

// ---------- grind calendar ----------
const GRIND_MODES = { '2026-11-01': { mode: 'grind', cursors: ZERO } };
const grind = plan(START, GRIND_MODES);
assert.equal(grind.length, 92, '91 days + prep');
assert.deepEqual([grind[0].no, grind[0].date, grind[0].kind], [0, '2026-11-15', 'prep']);
assert.deepEqual(grind[0].slots, {});
assert.equal(grind[1].date, START);
assert.equal(grind[7].no, 7);
assert.equal(grind[7].date, '2026-11-22');
assert.equal(grind[7].kind, 'sun');
assert.equal(grind[7].sundayNo, 1);
assert.equal(grind[91].date, '2027-02-14');
assert.equal(grind[91].sundayNo, 13);
assert.equal(grind.filter((d) => d.kind === 'study').length, 78);
assert.equal(grind.at(-1)!.studyNo, undefined);
assert.equal(grind[90].studyNo, 78);
for (const d of grind.slice(1)) {
  assert.equal(d.mode, 'grind');
  assert.equal(d.week, Math.ceil(d.no / 7));
  assert.equal(d.grindWeek, d.week);
  assert.equal(d.phase, d.grindWeek <= 4 ? 1 : d.grindWeek <= 9 ? 2 : 3);
  if (d.kind === 'sun') assert.deepEqual(d.slots, {});
  if (d.kind === 'study') assert.deepEqual(Object.keys(d.slots).sort(), [...TRACKS].sort(), `grind day ${d.no} runs every track`);
}
{
  const seq = sequences(grind);
  for (const t of TRACKS) assert.deepEqual(seq[t], range78, `grind ${t}: 78 slots once, in order`);
  // slots carry the track's content, sundayCarry included
  const studies = grind.filter((d) => d.kind === 'study');
  for (const t of TRACKS) studies.forEach((d, i) => assert.deepEqual(d.slots[t], { ...tracks[t][i], index: i }));
}

// no prep day without kickoff
{
  const noKick = layoutDays({ start: START, kickoff: false, modes: {}, tracks, done: {} });
  assert.equal(noKick.length, 119);
  assert.deepEqual([noKick[0].no, noKick[0].date, noKick[0].kind], [1, START, 'study']);
}

// ---------- steady calendar ----------
const steady = plan(START);
assert.equal(steady.length, 120, '119 days + prep');
assert.equal(steady[0].date, '2026-11-15');
assert.equal(steady.at(-1)!.kind, 'sun');
assert.equal(steady.at(-1)!.sundayNo, 17);
assert.equal(steady.filter((d) => d.kind === 'study').length, 102);
{
  const seq = sequences(steady);
  for (const t of TRACKS) assert.deepEqual(seq[t], range78, `steady ${t}: 78 slots once, in order`);
  for (const d of steady.filter((x) => x.kind === 'study')) assert.ok(Object.keys(d.slots).length >= 5, `steady day ${d.no}`);
  for (const d of steady.slice(1)) {
    assert.equal(d.mode, 'steady');
    assert.equal(d.grindWeek, grindWeekOf(d.week));
    assert.equal(d.phase, d.grindWeek <= 4 ? 1 : d.grindWeek <= 9 ? 2 : 3);
  }
  // week-pinned items: grind week w's Sunday is steady week steadyWeek(w), and that Sunday reports grindWeek w
  for (let w = 1; w <= 13; w++) {
    const sun = steady.find((d) => d.kind === 'sun' && d.week === steadyWeek(w))!;
    assert.equal(sun.grindWeek, w);
  }
}

// ---------- the `after` rule: every prerequisite on an earlier calendar day ----------
/** Every laid-out item with an `after` (the aib track is no longer laid out, so its content is not checked). */
const afterItems = (ts: Any) => TRACKS.flatMap((t) => ts[t].flatMap((s: Any) => s.items)).filter((x: Any) => typeof x.after === 'string')
  .map((x: Any) => ({ id: x.id.replace(/:part-\d+$/, ''), after: x.after }));
const withAfter: Any[] = afterItems(tracks);
function checkAfter(days: Any[], label: string, items: Any[] = withAfter) {
  const first = new Map<string, number>(), last = new Map<string, number>();
  for (const d of days) for (const t of TRACKS) for (const x of live(d, t)?.items ?? []) {
    const base = x.id.replace(/:part-\d+$/, '');
    if (!first.has(base)) first.set(base, d.no);
    last.set(base, d.no);
  }
  for (const x of items) {
    assert.ok(first.has(x.id) && last.has(x.after), `${label}: ${x.id} and ${x.after} laid out`);
    assert.ok(last.get(x.after)! < first.get(x.id)!, `${label}: ${x.after} (day ${last.get(x.after)}) before ${x.id} (day ${first.get(x.id)})`);
  }
}
checkAfter(grind, 'grind');
checkAfter(steady, 'steady');

// ---------- changing start (Review Focus 1) ----------
{
  const done = { 'ai:math-intuition': 1, 'p-two-sum': 1 };
  const a = plan(START, {}, done);
  const b = plan('2026-11-23', {}, done);
  assert.equal(b[0].date, '2026-11-22');
  assert.deepEqual(new Set(itemIds(a)), new Set(itemIds(b)), 'same content IDs');
  // the ticks are keyed by content ID, so both calendars carry exactly the ticked items, once each
  const ticked = (days: Any[]) => itemIds(days).filter((id) => id in done).sort();
  assert.deepEqual(ticked(a), ['ai:math-intuition', 'p-two-sum']);
  assert.deepEqual(ticked(b), ['ai:math-intuition', 'p-two-sum']);
}

// ---------- mode switches (Review Focus 2) ----------
/** Switch on `date` with cursors from cursorsAt; `done` defaults to everything before the date. */
function switched(base: Any[], baseModes: Any, date: string, mode: 'steady' | 'grind', done: Any = doneBefore(base, date)) {
  const cursors = cursorsAt(base, date, done);
  const modes = switchMode(baseModes, date, mode, cursors, START);
  return { modes, done, days: plan(START, modes, done) };
}
/** R12: each track's slots 0..77 live exactly once, in order; superseded copies are only history before a switch. */
function checkOnce(days: Any[], label: string, items: Any[] = withAfter) {
  const seq = sequences(days);
  for (const t of TRACKS) assert.deepEqual(seq[t], range78, `${label} ${t}: every slot exactly once, in order`);
  const ids = itemIds(days);
  assert.equal(new Set(ids).size, ids.length, `${label}: no item twice`);
  for (const d of days) for (const t of TRACKS) if (d.slots[t]?.superseded) {
    assert.ok(d.slots[t].items.every((x: Any) => x.superseded), `${label}: superseded items marked`);
    assert.ok(placements(days).some(([u, i, no]) => u === t && i === d.slots[t].index && no > d.no), `${label}: superseded ${t}[${d.slots[t].index}] has a later live copy`);
  }
  checkAfter(days, label, items);
}
{
  const day20 = steady[20].date;
  // cursorsAt: everything before day 20 done → each track's next slot
  const cur = cursorsAt(steady, day20, doneBefore(steady, day20));
  const firstOnOrAfter = (t: string) => steady.find((d) => d.date >= day20 && d.slots[t])!.slots[t].index;
  for (const t of TRACKS) assert.equal(cur[t], firstOnOrAfter(t), `cursorsAt ${t}`);
  // nothing done → back to the start of the current entry
  assert.deepEqual(cursorsAt(steady, day20, {}), ZERO);
  // one part of a slot not done → that slot
  const d3 = steady.find((d) => d.slots.dsa && d.slots.dsa.index === 3)!;
  const partial = doneBefore(steady, day20);
  delete partial[d3.slots.dsa.items[0].id];
  assert.equal(cursorsAt(steady, day20, partial).dsa, 3);

  const s2g = switched(steady, {}, day20, 'grind');
  assert.deepEqual(s2g.days.slice(0, 20), steady.slice(0, 20), 'days before the switch unchanged');
  assert.equal(s2g.days[20].mode, 'grind');
  checkOnce(s2g.days, 'steady→grind');
  assert.equal(s2g.days.at(-1)!.kind, 'sun');
  // grind from the switch: every unfinished track runs every study day
  for (const d of s2g.days.slice(20)) if (d.kind === 'study') for (const t of TRACKS) {
    const lastIdx = Math.max(...s2g.days.filter((x) => x.slots[t]).map((x) => x.slots[t].index));
    if (d.no <= s2g.days.find((x) => x.slots[t]?.index === lastIdx)!.no) assert.ok(d.slots[t], `${t} runs on grind day ${d.no}`);
  }

  const g2s = switched(grind, GRIND_MODES, grind[20].date, 'steady');
  assert.deepEqual(g2s.days.slice(0, 20), grind.slice(0, 20));
  assert.equal(g2s.days[20].mode, 'steady');
  checkOnce(g2s.days, 'grind→steady');

  // Grind → Steady → Grind on the same date: the latest entry wins
  const date = grind[20].date;
  const first = switched(grind, GRIND_MODES, date, 'steady');
  const second = switched(first.days, first.modes, date, 'grind');
  assert.equal(Object.keys(second.modes).length, 2);
  assert.equal(second.modes[date].mode, 'grind');
  checkOnce(second.days, 'grind→steady→grind');
  assert.deepEqual(second.days, grind, 'same-day round trip back to grind = the plain grind plan');

  // several switches across the plan
  let cur2: Any = { modes: {}, days: steady };
  for (const [no, mode] of [[10, 'grind'], [33, 'steady'], [47, 'grind'], [47, 'steady'], [60, 'grind']] as const) {
    cur2 = switched(cur2.days, cur2.modes, cur2.days[no].date, mode);
    checkOnce(cur2.days, `multi switch at ${no} → ${mode}`);
  }
}

// ---------- uneven progress at a switch: prerequisites still on an earlier day (fix I1) ----------
// Synthetic fixture: the real tracks, with product slot 31 `after` AI-core slot 30 (the v3 product → AI-core link).
const fx: Any = { ...tracks, mc: tracks.mc.map((s: Any, i: number) => (i === 31 ? { items: s.items.map((x: Any, j: number) => (j === 0 ? { ...x, after: tracks.fe[30].items[0].id } : x)) } : s)) };
const fxAfter = afterItems(fx);
assert.ok(fxAfter.some((x: Any) => x.after === tracks.fe[30].items[0].id), 'fixture has the mc → fe prerequisite');
const fxPlan = (modes: Any = {}, done: Any = {}) => layoutDays({ start: START, kickoff: true, modes, tracks: fx, done });
{
  const fxSteady = fxPlan(), fxGrind = fxPlan(GRIND_MODES);
  checkOnce(fxSteady, 'fixture steady', fxAfter);
  checkOnce(fxGrind, 'fixture grind', fxAfter);
  const slotDay = (days: Any[], t: string, i: number) => days.find((d) => live(d, t)?.index === i)!;
  for (const [label, base, baseModes, mode] of [['steady→grind', fxSteady, {}, 'grind'], ['grind→steady', fxGrind, GRIND_MODES, 'steady']] as const) {
    const date = base[50].date;
    const fe30 = slotDay(base, 'fe', 30);
    assert.ok(fe30.date < date);
    const done = doneBefore(base, date);
    for (const x of fe30.slots.fe.items) delete done[x.id];
    const cur = cursorsAt(base, date, done);
    assert.equal(cur.fe, 30, `${label}: fe cursor back at the undone slot`);
    assert.ok(cur.mc > 31, `${label}: mc ahead of it`);
    const modes = switchMode(baseModes, date, mode, cur, START);
    const s = fxPlan(modes, done);
    checkOnce(s, `uneven ${label}`, fxAfter);
    assert.ok(s.find((d) => d.no === fe30.no)!.slots.fe.superseded, `${label}: the old fe[30] copy is superseded`);
    const liveMc31 = slotDay(s, 'mc', 31), liveFe30 = slotDay(s, 'fe', 30);
    assert.ok(liveFe30.no < liveMc31.no, `${label}: mc[31] (day ${liveMc31.no}) waits for fe[30] (day ${liveFe30.no})`);
  }
  // Review Focus 1: Grind → Steady at study day 25 with every earlier slot ticked: every slot placed once, and it returns
  const sw = fxGrind.find((d) => d.studyNo === 25)!.date;
  const done = doneBefore(fxGrind, sw);
  const g2s = fxPlan(switchMode(GRIND_MODES, sw, 'steady', cursorsAt(fxGrind, sw, done), START), done);
  checkOnce(g2s, 'grind→steady at study day 25', fxAfter);
  assert.equal(g2s.at(-1)!.kind, 'sun');
}

// ---------- nothing done at a switch: the past stays as history, marked superseded (Ruling R12) ----------
{
  const day20 = steady[20].date;
  const s = switched(steady, {}, day20, 'grind', {});
  assert.deepEqual(cursorsAt(steady, day20, {}), ZERO);
  checkOnce(s.days, 'switch with nothing done');
  for (const d of s.days.slice(1, 20)) for (const t of TRACKS) if (steady[d.no].slots[t]) {
    assert.equal(d.slots[t].superseded, true, `day ${d.no} ${t} superseded`);
    assert.equal(d.slots[t].index, steady[d.no].slots[t].index, 'still on its past day');
  }
}

// ---------- changing start after a switch (fix I2, Ruling R11) ----------
{
  const date = '2026-12-05';
  const done = doneBefore(steady, date);
  const modes = switchMode({}, date, 'grind', cursorsAt(steady, date, done), START);
  const same = plan(START, modes, done);
  checkOnce(same, 'switch, same start');
  // an entry without `basis` has its cursors re-derived from done: here the same ones
  const noBasis = { [date]: { mode: 'grind', cursors: modes[date].cursors } };
  assert.deepEqual(plan(START, noBasis, done), same, 'basis-less entry re-derives the same cursors');
  // stale cursors (another basis) are not trusted
  const stale = { [date]: { mode: 'grind', cursors: { ...ZERO, dsa: 70 }, basis: '2026-10-05' } };
  assert.deepEqual(plan(START, stale, done), same, 'stale cursors re-derived');
  for (const start of ['2026-11-23', '2026-11-30', '2026-11-09']) {
    const days = plan(start, modes, done);
    checkOnce(days, `start ${start} after a switch`);
    assert.equal(days.find((d) => d.date === date)!.mode, 'grind', `start ${start}: still grind from ${date}`);
    assert.ok(itemIds(days).includes('ai:math-intuition'));
  }
}

// ---------- regression: a cursor never skips past the next unplaced slot (fix round 2) ----------
{
  // (a) two switches with one item left unticked (jt[1]): live slots stay in order, same-track `after` holds
  const d1 = steady[25].date;
  const done = doneBefore(steady, d1);
  for (const x of tracks.jt[1].items) delete done[x.id];
  const m1 = switchMode({}, d1, 'grind', cursorsAt(steady, d1, done), START);
  const p1 = plan(START, m1, done);
  checkOnce(p1, 'jt[1] unticked, 1 switch');
  const d2 = p1[40].date;
  Object.assign(done, doneBefore(p1, d2));
  const m2 = switchMode(m1, d2, 'steady', cursorsAt(p1, d2, done), START);
  checkOnce(plan(START, m2, done), 'jt[1] unticked, 2 switches');

  // (b) switch right after ticking that day's work: the day's slots are not dropped
  const date = steady[20].date;
  const ticked: Record<string, number> = {};
  for (const d of steady) if (d.no <= 20) for (const t of TRACKS) for (const x of live(d, t)?.items ?? []) ticked[x.id] = 1;
  const cur = cursorsAt(steady, date, ticked);
  assert.ok(TRACKS.every((t) => cur[t] > steady[20].slots[t]?.index), 'cursors past the ticked day');
  checkOnce(plan(START, switchMode({}, date, 'grind', cur, START), ticked), 'switch after ticking the day');
}

// ---------- property test: random switches, ticks and start moves (seeded) ----------
{
  let seed = 20261116;
  const rnd = () => { // mulberry32
    seed = (seed + 0x6d2b79f5) | 0;
    let r = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
  const int = (lo: number, hi: number) => lo + Math.floor(rnd() * (hi - lo + 1));
  const STARTS = ['2026-11-09', '2026-11-23', '2026-11-30', '2026-12-07'];
  for (let trial = 0; trial < 100; trial++) {
    let modes: Any = rnd() < 0.5 ? {} : GRIND_MODES;
    const done: Record<string, number> = {};
    let days = plan(START, modes, done);
    let no = 0;
    const switches = int(1, 4);
    for (let k = 0; k < switches; k++) {
      no = Math.min(no + int(1, 30), days.length - 2);
      const date = days[no].date;
      const ratio = rnd(), today = rnd() < 0.3; // sometimes the day's own work is ticked before the switch
      for (const d of days) if (d.no < no || (today && d.no === no)) for (const t of TRACKS) for (const x of live(d, t)?.items ?? []) if (rnd() < ratio) done[x.id] = 1;
      modes = switchMode(modes, date, rnd() < 0.5 ? 'grind' : 'steady', cursorsAt(days, date, done), START);
      days = plan(START, modes, done);
      checkOnce(days, `trial ${trial} switch ${k + 1}`);
    }
    for (const start of [STARTS[int(0, 3)], STARTS[int(0, 3)]]) checkOnce(plan(start, modes, done), `trial ${trial} start ${start}`);
  }
}

// ---------- old state: a v1/v2 mode entry with an `aib` cursor is ignored (Review Focus 4) ----------
{
  const date = steady[20].date;
  const cur = cursorsAt(steady, date, doneBefore(steady, date));
  const clean = plan(START, switchMode({}, date, 'grind', cur, START), doneBefore(steady, date));
  const old = plan(START, { [date]: { mode: 'grind', cursors: { ...cur, aib: 12 }, basis: START } }, doneBefore(steady, date));
  assert.deepEqual(old, clean, 'aib cursor ignored');
  for (const d of old) assert.ok(!('aib' in d.slots), 'no aib slots');
}

// layoutDays never stops silently
assert.throws(() => layoutDays({ start: START, kickoff: true, modes: {}, tracks: { ...tracks, dsa: Array.from({ length: 500 }, () => tracks.dsa[0]) }, done: {} }), /unplaced/);

console.log('layout: ok');
