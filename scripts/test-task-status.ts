// Run: node --experimental-strip-types scripts/test-task-status.ts
import assert from 'node:assert/strict';
import { STATUS_LABEL, applyStatus, goodStreak, isSkipped, rate, statusOf, studyCounts } from '../src/lib/task-status.ts';

assert.deepEqual(STATUS_LABEL, { todo: 'Not started', progress: 'In progress', done: 'Done', skipped: 'Skipped' });

// done wins over status
assert.equal(statusOf('a', { a: 5 }, { a: 'progress' }), 'done');
assert.equal(statusOf('a', {}, { a: 'progress' }), 'progress');
assert.equal(statusOf('a', {}, { a: 'skipped' }), 'skipped');
assert.equal(statusOf('a', {}, {}), 'todo');

// applyStatus
let r = applyStatus({ done: { a: 1 }, status: {} }, 'a', 'progress', 99);
assert.deepEqual(r, { done: {}, status: { a: 'progress' } });
r = applyStatus({ done: {}, status: { a: 'skipped' } }, 'a', 'done', 99);
assert.deepEqual(r, { done: { a: 99 }, status: {} });
r = applyStatus({ done: { a: 1 }, status: {} }, 'a', 'done', 99);
assert.equal(r.done.a, 1, 'existing done timestamp kept');
r = applyStatus({ done: { a: 1 }, status: { b: 'progress' } }, 'a', 'todo', 99);
assert.deepEqual(r, { done: {}, status: { b: 'progress' } });
r = applyStatus({ done: {}, status: { a: 'progress' } }, 'a', 'skipped', 99);
assert.deepEqual(r, { done: {}, status: { a: 'skipped' } });

// no mutation
const done = { a: 1 }, status = { b: 'progress' as const };
const out = applyStatus({ done, status }, 'a', 'todo', 5);
assert.deepEqual(done, { a: 1 });
assert.deepEqual(status, { b: 'progress' });
assert.notEqual(out.done, done);
assert.notEqual(out.status, status);

// studyCounts
const ts = [1, 2, 3].map(i => ({ id: `t${i}`, min: 60, study: true }));
let c = studyCounts(ts, {}, { t3: 'skipped' });
assert.equal(c.total, 2); assert.equal(c.planMin, 120); assert.equal(c.n, 0);
assert.deepEqual(c.byStatus, { todo: 2, progress: 0, done: 0, skipped: 1 });
c = studyCounts(ts, {}, { t1: 'skipped', t2: 'skipped', t3: 'skipped' });
assert.equal(c.total, 0); assert.equal(c.planMin, 0);
c = studyCounts([...ts, { id: 'h', min: 30, study: false }], { t1: 1, h: 1 }, { t2: 'progress' });
assert.equal(c.n, 1); assert.equal(c.doneMin, 60); assert.equal(c.total, 3); assert.equal(c.planMin, 180);
assert.deepEqual(c.byStatus, { todo: 1, progress: 1, done: 1, skipped: 0 });

// isSkipped
assert.equal(isSkipped('a', {}, { a: 'skipped' }), true);
assert.equal(isSkipped('a', { a: 1 }, { a: 'skipped' }), false);
assert.equal(isSkipped('a', {}, { a: 'progress' }), false);
assert.equal(isSkipped('a', {}, {}), false);

// rate: all-skipped day is neutral, not 0%
assert.equal(rate({ n: 0, total: 0 }), null);
assert.equal(rate({ n: 1, total: 2 }), 0.5);
// streak: neutral days are skipped, weak days break it
assert.equal(goodStreak([0.2, 1, null, 0.9]), 2);
assert.equal(goodStreak([1, 0.5, null]), 0);
assert.equal(goodStreak([null, null]), 0);

console.log('task-status: all checks pass');
