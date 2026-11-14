// Run: node --experimental-strip-types scripts/test-own-tasks.ts
import assert from 'node:assert/strict';
import { defaultBlock, pickable, restoreOwn, snapshotOwn, withoutOwn } from '../src/lib/own-tasks.ts';

const blocks = [
  { k: 'dsa', s: '05:15', e: '07:00', kind: 'study' as const },
  { k: 'eat', s: '07:00', e: '07:30', kind: 'life' as const },
  { k: 'fe', s: '13:00', e: '15:00', kind: 'study' as const },
  { k: 'lunch', s: '15:00', e: '15:30', kind: 'life' as const },
  { k: 'beh', s: '17:30', e: '18:00', kind: 'study' as const },
  { k: 'workout', s: '18:00', e: '19:00', kind: 'health' as const },
  { k: 'sleep', s: '22:00', e: '23:00', kind: 'life' as const },
];
const at = (hm: string) => +hm.slice(0, 2) * 60 + +hm.slice(3);

// only study and health blocks can hold own tasks
assert.deepEqual(pickable(blocks).map(b => b.k), ['dsa', 'fe', 'beh', 'workout']);
// a date that isn't today: first study block
assert.equal(defaultBlock(blocks)?.k, 'dsa');
// today, inside a block
assert.equal(defaultBlock(blocks, at('14:10'))?.k, 'fe');
assert.equal(defaultBlock(blocks, at('18:00'))?.k, 'workout');
// today, between blocks (or inside a life block): the next block
assert.equal(defaultBlock(blocks, at('15:10'))?.k, 'beh');
assert.equal(defaultBlock(blocks, at('04:00'))?.k, 'dsa');
// today, after the last block: the last study block
assert.equal(defaultBlock(blocks, at('21:00'))?.k, 'beh');
// nothing pickable
assert.equal(defaultBlock([{ k: 'x', s: '01:00', e: '02:00', kind: 'life' as const }]), undefined);

// delete + undo of an own task restores its tick and note exactly
const s0 = {
  custom: { a: { date: '2026-11-12', block: 'fe', text: 'Mine', at: 1 }, b: { date: '2026-11-12', block: 'fe', text: 'Other', at: 2 } },
  done: { 'u-a': 111, 'fe-1': 5 } as Record<string, number>,
  tnotes: { 'u-a': { title: 'Mine', body: 'note', upd: 3 } } as Record<string, { title: string; body: string; upd: number }>,
  status: { 'u-b': 'skipped', 'fe-3': 'progress' } as Record<string, 'progress' | 'skipped'>,
  other: 'kept',
};
const snap = snapshotOwn(s0, 'a');
const s1 = withoutOwn(s0, 'a');
assert.equal(s1.custom.a, undefined);
assert.equal(s1.done['u-a'], undefined);
assert.equal(s1.tnotes['u-a'], undefined);
assert.ok(s1.custom.b);
assert.equal(s1.done['fe-1'], 5);
assert.equal(s1.other, 'kept');
assert.ok(s0.custom.a, 'original state not mutated');
// something else changed in the meantime: undo keeps it
const s2 = { ...s1, done: { ...s1.done, 'fe-2': 9 } };
const s3 = restoreOwn(s2, snap);
assert.deepEqual(s3.custom.a, s0.custom.a);
assert.equal(s3.done['u-a'], 111);
assert.deepEqual(s3.tnotes['u-a'], s0.tnotes['u-a']);
assert.equal(s3.done['fe-2'], 9);
// a task that was never ticked and has no note comes back without either
const snapB = snapshotOwn(s0, 'b');
const s4 = restoreOwn(withoutOwn(s0, 'b'), snapB);
assert.ok(s4.custom.b);
assert.ok(!('u-b' in s4.done));
assert.ok(!('u-b' in s4.tnotes));


// delete + undo keeps the task's status (In progress / Skipped) and leaves no orphan behind
const sp = { ...s0, status: { ...s0.status, 'u-a': 'progress' as const } };
const snapP = snapshotOwn(sp, 'a');
const sp1 = withoutOwn(sp, 'a');
assert.ok(!('u-a' in sp1.status), 'delete removes the status');
assert.equal(sp1.status['fe-3'], 'progress', 'other statuses kept');
assert.equal(sp1.status['u-b'], 'skipped');
const sp2 = restoreOwn({ ...sp1, status: { ...sp1.status, 'fe-4': 'skipped' as const } }, snapP);
assert.equal(sp2.status['u-a'], 'progress', 'undo restores the status');
assert.equal(sp2.status['fe-4'], 'skipped', 'undo keeps later status changes');
// skipped own task: restored as skipped, not as a missed task
const sk = restoreOwn(withoutOwn(s0, 'b'), snapshotOwn(s0, 'b'));
assert.equal(sk.status['u-b'], 'skipped');
// a task with no status comes back without one
assert.ok(!('u-a' in restoreOwn(withoutOwn(s0, 'a'), snapshotOwn(s0, 'a')).status));

console.log('own-tasks: ok');
