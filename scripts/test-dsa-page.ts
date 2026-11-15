// Run: node --experimental-strip-types scripts/test-dsa-page.ts
import assert from 'node:assert/strict';
import { readinessDot, solveKeyOf, solveOnStatus, patchSolve, planDayOf, planDayMap } from '../src/lib/dsa-page.ts';

// readiness dot: none / unseen check passed / green
assert.equal(readinessDot({ unseenSolved: 0, blankResolve: false, green: false, unseenCheckPassed: false }), 'none');
assert.equal(readinessDot({ unseenSolved: 1, blankResolve: false, green: false, unseenCheckPassed: true }), 'check');
assert.equal(readinessDot({ unseenSolved: 2, blankResolve: true, green: true, unseenCheckPassed: true }), 'green');
assert.equal(readinessDot({ unseenSolved: 2, blankResolve: true, green: true, unseenCheckPassed: false }), 'green');

// which solve log a task id writes
assert.equal(solveKeyOf('p-two-sum'), 'p-two-sum');
assert.equal(solveKeyOf('rs:two-sum:7'), 'rs:two-sum');
assert.equal(solveKeyOf('dsa:timed-meta-1:3sum'), 'p-3sum');
assert.equal(solveKeyOf('dsa:timed-meta-1'), null);
assert.equal(solveKeyOf('dsa:card-dp'), null);
assert.equal(solveKeyOf('fe:closures'), null);

const U = new Set(['longest-consecutive-sequence']);
const T = 1_000;
// ticking a problem logs it; unseen defaults to true only for an unseen check
let s = solveOnStatus({}, 'p-longest-consecutive-sequence', 'done', T, U);
assert.deepEqual(s, { 'p-longest-consecutive-sequence': { unseen: true, at: T } });
s = solveOnStatus({}, 'p-two-sum', 'done', T, U);
assert.deepEqual(s, { 'p-two-sum': { unseen: false, at: T } });
// an existing log is kept (minutes, at)
const kept = { 'p-two-sum': { unseen: true, minutes: 12, at: 5 } };
assert.equal(solveOnStatus(kept, 'p-two-sum', 'done', T, U), kept);
// progress / skipped on a never-solved problem changes nothing
const none = {};
assert.equal(solveOnStatus(none, 'p-two-sum', 'progress', T, U), none);
// un-ticking removes the problem's own log
assert.deepEqual(solveOnStatus(kept, 'p-two-sum', 'todo', T, U), {});
// R14: a log exists only while the task that created it is done
// a re-solve tick writes rs:<slug> (not unseen), the latest tick wins
s = solveOnStatus({ 'rs:two-sum': { unseen: false, at: 1 } }, 'rs:two-sum:7', 'done', T, U);
assert.deepEqual(s, { 'rs:two-sum': { unseen: false, at: T } });
// un-ticking the only done re-solve removes the log
const rs = { 'rs:two-sum': { unseen: false, at: 1 } };
assert.deepEqual(solveOnStatus(rs, 'rs:two-sum:7', 'todo', T, U, { 'rs:two-sum:7': 5 }), {});
// ... but not while another re-solve of that slug is still done
assert.equal(solveOnStatus(rs, 'rs:two-sum:7', 'todo', T, U, { 'rs:two-sum:7': 5, 'rs:two-sum:3': 4 }), rs);
// a timed-set tick creates p-<slug> with via; un-ticking that task removes it
s = solveOnStatus({}, 'dsa:timed-meta-1:3sum', 'done', T, U);
assert.deepEqual(s, { 'p-3sum': { unseen: false, at: T, via: 'dsa:timed-meta-1:3sum' } });
assert.deepEqual(solveOnStatus(s, 'dsa:timed-meta-1:3sum', 'todo', T, U), {});
// a log made by someone else (the problem's own tick, or another timed task) survives
const have = { 'p-3sum': { unseen: true, minutes: 20, at: 7 } };
assert.equal(solveOnStatus(have, 'dsa:timed-meta-1:3sum', 'done', T, U), have);
assert.equal(solveOnStatus(have, 'dsa:timed-meta-1:3sum', 'todo', T, U), have);
const viaOther = { 'p-3sum': { unseen: false, at: 7, via: 'dsa:timed-google-1:3sum' } };
assert.equal(solveOnStatus(viaOther, 'dsa:timed-meta-1:3sum', 'todo', T, U), viaOther);
// ticking the problem itself takes over a timed log: un-ticking the timed task then keeps it
s = solveOnStatus(viaOther, 'p-3sum', 'done', T, U);
assert.deepEqual(s, { 'p-3sum': { unseen: false, at: 7 } });
assert.equal(solveOnStatus(s, 'dsa:timed-google-1:3sum', 'todo', T, U), s);
// other tasks never touch solves
const o = {};
assert.equal(solveOnStatus(o, 'fe:closures', 'done', T, U), o);

// the checkbox and minutes field edit the log; `at` is kept, empty minutes clears it
assert.deepEqual(patchSolve({}, 'p-x', { unseen: true }, T), { 'p-x': { unseen: true, at: T } });
assert.deepEqual(patchSolve({ 'p-x': { unseen: false, at: 3 } }, 'p-x', { unseen: true, minutes: 20 }, T), { 'p-x': { unseen: true, minutes: 20, at: 3 } });
assert.deepEqual(patchSolve({ 'p-x': { unseen: true, minutes: 20, at: 3 } }, 'p-x', { minutes: null }, T), { 'p-x': { unseen: true, at: 3 } });
assert.deepEqual(patchSolve({}, 'p-x', { minutes: 20 }, T), { 'p-x': { unseen: false, minutes: 20, at: T } });
assert.throws(() => patchSolve({}, 'p-x', { minutes: -1 }, T));

// plan day: first non-superseded copy; null when not in the plan
const days = [
  { no: 0, blocks: [{ tasks: [{ id: 'a' }] }] },
  { no: 3, blocks: [{ tasks: [{ id: 'p-old', superseded: true as const }] }] },
  { no: 4, blocks: [{ tasks: [{ id: 'x' }, { id: 'p-two-sum' }, { id: 'p-old' }] }] },
];
assert.equal(planDayOf(days, 'two-sum'), 4);
assert.equal(planDayOf(days, 'old'), 4);
assert.equal(planDayOf(days, 'nope'), null);

console.log('test-dsa-page: ok');
assert.deepEqual([...planDayMap(days)], [['two-sum', 4], ['old', 4]]);
