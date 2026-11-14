// Run: node --experimental-strip-types scripts/test-cycle.ts
import assert from 'node:assert/strict';
import { cycleList, cycleOf } from '../src/lib/cycle.ts';
import type { CycleDayInput } from '../src/lib/cycle.ts';

const d = (n: number) => new Date(2026, 0, n); // Jan n, local
const T = (n: number, h = 12) => new Date(2026, 0, n, h).getTime(); // timestamp on Jan n
const task = (id: string, cat = 'dsa', min = 60) => ({ id, cat, min, study: true });

// Week 1: Jan 1..7 (i 0..6). Day i=4 (Jan 5) has no tasks.
const w1: CycleDayInput[] = [
  { i: 0, week: 1, date: d(1), type: 'kick', tasks: [task('a'), task('b')] },
  { i: 1, week: 1, date: d(2), type: 'work', tasks: [task('c', 'fe'), { id: 'r', cat: 'review', min: 30, study: false }] },
  { i: 2, week: 1, date: d(3), type: 'work', tasks: [task('e', 'proj', 120)] },
  { i: 3, week: 1, date: d(4), type: 'work', tasks: [task('f'), task('g')] },
  { i: 4, week: 1, date: d(5), type: 'work', tasks: [] },
  { i: 5, week: 1, date: d(6), type: 'work', tasks: [task('h')] },
  { i: 6, week: 1, date: d(7), type: 'work', tasks: [task('k')] },
];
const w2: CycleDayInput[] = [
  { i: 7, week: 2, date: d(8), type: 'work', tasks: [task('x')] },
  { i: 8, week: 2, date: d(9), type: 'work', tasks: [task('y')] },
];
const w3: CycleDayInput[] = [{ i: 9, week: 3, date: d(10), type: 'work', tasks: [task('z')] }];
const days = [...w1, ...w2, ...w3];
const now = T(4, 15);

// byStatus + pct (non-study 'r' ignored); 9 study tasks
let s = cycleOf(days, 1, { a: T(1, 9), b: T(1, 10) }, { c: 'progress', e: 'skipped' }, { 'status/e': T(3, 9) }, 3, now)!;
assert.deepEqual(s.byStatus, { todo: 4, progress: 1, done: 2, skipped: 1 });
assert.equal(s.total, 7); // excludes skipped
assert.equal(s.pct, 2 / 7);
assert.equal(s.week, 1);
assert.equal(s.daysLeft, 4); // today = 4th day; counts today
assert.deepEqual(s.days.map((x) => x.isToday), [false, false, false, true, false, false, false]);
assert.deepEqual(s.days[0].byStatus, { todo: 0, progress: 0, done: 2, skipped: 0 });
assert.equal(s.from.getTime(), d(1).getTime());
assert.equal(s.to.getTime(), d(7).getTime());

// pending is null after today; length = cycle days
assert.equal(s.burndown.tasks.pending.length, 7);
assert.deepEqual(s.burndown.tasks.pending.slice(4), [null, null, null]);
// skipped task e (meta Jan 3 09:00) leaves pending and ideal from day Jan 3; burndown total excludes skipped (matches summary total)
assert.equal(s.burndown.tasks.total, 7);
assert.equal(s.burndown.tasks.total, s.total);
// a,b done Jan 1 -> pending(day0)=8-2=6; c..: day1 6; Jan3 skip -> 5; day3 5
assert.deepEqual(s.burndown.tasks.pending.slice(0, 4), [6, 6, 5, 5]);
// ideal follows the schedule: 8 - cumulative scheduled (2,3,4,6,6,7,8); flat on empty day
assert.deepEqual(s.burndown.tasks.ideal, [6, 5, 4, 2, 2, 1, 0]);
// trailing = pending(today) - ideal(today)
assert.equal(s.trailing.tasks, 5 - 2);

// hours unit: minutes/60. total excludes skipped e: 7 hours.
assert.equal(s.burndown.hours.total, 7);
assert.deepEqual(s.burndown.hours.ideal, [7, 6, 4, 2, 2, 1, 0]);
assert.deepEqual(s.burndown.hours.pending.slice(0, 4), [7, 7, 5, 5]); // e (2h) skipped on day 3
assert.equal(s.trailing.hours, 3);

// done after day k is still pending on day k; ticked-late task not pending after tick time
s = cycleOf(days, 1, { a: T(3, 9) }, {}, {}, 5, T(6, 9))!;
assert.equal(s.burndown.tasks.pending[0], 8); // a done Jan 3, still pending Jan 1
assert.equal(s.burndown.tasks.pending[1], 8);
assert.equal(s.burndown.tasks.pending[2], 7); // gone from Jan 3 end
assert.equal(s.burndown.tasks.pending[5], 7);
// done before the cycle starts counts from day 1
s = cycleOf(days, 1, { a: T(1, 0) - 86400000 * 30 }, {}, {}, 0, now)!;
assert.equal(s.burndown.tasks.pending[0], 7);
// skipped without meta: resolved since cycle start
s = cycleOf(days, 1, {}, { a: 'skipped' }, {}, 0, now)!;
assert.equal(s.burndown.tasks.pending[0], 7);

// ahead: negative trailing
s = cycleOf(days, 1, { a: T(1, 9), b: T(1, 9), c: T(2, 9), e: T(3, 9), f: T(3, 9), g: T(3, 9) }, {}, {}, 3, now)!;
assert.equal(s.burndown.tasks.pending[3], 2); // h,k left... a,b,c,e,f,g done of 8 -> 2
s = cycleOf(days, 1, { a: 1, b: 1, c: 1, e: 1, f: 1, g: 1, h: 1 }, {}, {}, 3, now)!;
assert.ok(s.trailing.tasks! < 0, 'ahead is negative');
assert.equal(s.trailing.tasks, 1 - 2);

// today outside cycle
s = cycleOf(days, 1, {}, {}, {}, 8, now)!;
assert.equal(s.trailing.tasks, null);
assert.equal(s.trailing.hours, null);
assert.equal(s.daysLeft, 0);
s = cycleOf(days, 2, {}, {}, {}, 0, now)!; // before the cycle
assert.equal(s.trailing.tasks, null);
assert.equal(s.daysLeft, 2);
assert.deepEqual(s.burndown.tasks.pending, [null, null]);

// all-skipped week: no NaN
const allSk = cycleOf(days, 3, {}, { z: 'skipped' }, {}, 9, now)!;
assert.equal(allSk.total, 0);
assert.equal(allSk.pct, 0);
for (const u of ['tasks', 'hours'] as const) {
  const b = allSk.burndown[u];
  for (const v of [...b.pending, ...b.ideal, b.total, allSk.trailing[u]]) assert.ok(v === null || Number.isFinite(v), `${u} finite`);
}
assert.deepEqual(allSk.tracks, []);

// tracks: omit empty; proj -> Machine coding; skipped excluded
s = cycleOf(days, 1, { a: 5 }, {}, {}, 3, now)!;
assert.deepEqual(s.tracks.map((t) => t.name), ['DSA', 'Frontend & CS', 'Machine coding']);
assert.deepEqual(s.tracks.map((t) => t.track), ['dsa', 'fe', 'mc']);
assert.deepEqual(s.tracks[0], { track: 'dsa', name: 'DSA', done: 1, progress: 1 / 6, total: 6 });

// cycleList
assert.deepEqual(cycleList(days, 0, {}, {}, {}, now).map((x) => [x.week, x.state]), [[1, 'current'], [2, 'upcoming']]);
assert.deepEqual(cycleList(days, 8, {}, {}, {}, now).map((x) => [x.week, x.state]), [[1, 'past'], [2, 'current'], [3, 'upcoming']]);
assert.deepEqual(cycleList(days, 9, {}, {}, {}, now).map((x) => [x.week, x.state]), [[2, 'past'], [3, 'current']]);
assert.equal(cycleList(days, 0, { a: 1 }, {}, {}, now)[0].pct, 1 / 8);

// skipping a FUTURE task leaves trailing unchanged (it leaves pending and ideal together)
{
  const base = cycleOf(days, 1, { a: T(1, 9) }, {}, {}, 3, now)!;
  const sk = cycleOf(days, 1, { a: T(1, 9) }, { k: 'skipped' }, { 'status/k': T(4, 9) }, 3, now)!;
  for (const u of ['tasks', 'hours'] as const) assert.equal(sk.trailing[u], base.trailing[u], `future skip ${u}`);
  assert.equal(sk.burndown.tasks.pending[3], base.burndown.tasks.pending[3]! - 1);
}
// skipping an OVERDUE task lowers trailing by its weight, and never below the no-overdue level
{
  const allPast = { a: T(1, 9), b: T(1, 9), c: T(2, 9), e: T(3, 9) };
  const clean = cycleOf(days, 1, { ...allPast, f: T(4, 9), g: T(4, 9) }, {}, {}, 3, now)!; // nothing overdue
  const overdue = cycleOf(days, 1, allPast, {}, {}, 3, now)!; // f, g overdue
  const skipped = cycleOf(days, 1, allPast, { f: 'skipped' }, { 'status/f': T(4, 9) }, 3, now)!;
  assert.equal(overdue.trailing.tasks, 2);
  assert.equal(skipped.trailing.tasks, 1);
  assert.ok(skipped.trailing.tasks! >= clean.trailing.tasks!);
  const skipAll = cycleOf(days, 1, allPast, { f: 'skipped', g: 'skipped' }, { 'status/f': T(4, 9), 'status/g': T(4, 9) }, 3, now)!;
  assert.equal(skipAll.trailing.tasks, clean.trailing.tasks);
}

// hours: exact values, no float noise (45 min = 0.75, 20 min thirds)
{
  const fd: CycleDayInput[] = [
    { i: 0, week: 1, date: d(1), type: 'work', tasks: [task('p', 'dsa', 45), task('q', 'dsa', 20), task('r2', 'dsa', 20)] },
    { i: 1, week: 1, date: d(2), type: 'work', tasks: [task('s', 'dsa', 45), task('t', 'dsa', 20)] },
  ];
  const h = cycleOf(fd, 1, {}, {}, {}, 1, now)!;
  assert.equal(h.burndown.hours.total, 150 / 60);
  assert.deepEqual(h.burndown.hours.ideal, [65 / 60, 0]);
  assert.deepEqual(h.burndown.hours.pending, [150 / 60, 150 / 60]);
  assert.equal(h.trailing.hours, 150 / 60);
  const h2 = cycleOf([{ ...fd[0], tasks: [task('p', 'dsa', 45)] }], 1, {}, {}, {}, 0, now)!;
  assert.equal(h2.burndown.hours.total, 0.75);
}

// unknown week
assert.equal(cycleOf(days, 99, {}, {}, {}, 0, now), null);
console.log('test-cycle: ok');
