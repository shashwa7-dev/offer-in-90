// Run: node --experimental-strip-types scripts/test-track-progress.ts
import assert from 'node:assert/strict';
import { trackRows, weakestTrack } from '../src/lib/track-progress.ts';

const TRACKS = [{ key: 'dsa', name: 'DSA' }, { key: 'mc', name: 'Product' }, { key: 'career', name: 'Career' }, { key: 'fe', name: 'Frontend' }];
const MAP: Record<string, string> = { dsa: 'dsa', mc: 'mc', proj: 'mc', beh: 'career', fde: 'career', fe: 'fe' };
const trackOf = (c: string) => MAP[c] ?? null;
const days = [
  { i: 0, tasks: [{ id: 'k-env', cat: 'dsa' }, { id: 'baseline:dsa', cat: 'dsa' }, { id: 'k-log', cat: 'review' }] },
  { i: 1, tasks: [{ id: 'p-two-sum', cat: 'dsa' }, { id: 'lld:oop', cat: 'mc' }, { id: 'proj:pick', cat: 'proj' }, { id: 'beh:resume', cat: 'beh' }, { id: 'fde:intro', cat: 'fde' }] },
  { i: 2, tasks: [{ id: 'p-3sum', cat: 'dsa' }, { id: 'proj:brief', cat: 'proj' }] },
];

// Day 1 (todayIdx 1): only the prep day is due. One row per track, in track order; review tasks belong to no track.
{
  const rows = trackRows(days, 1, { 'k-env': 1 }, TRACKS, trackOf, () => false);
  assert.deepEqual(rows.map((r) => r.key), ['dsa', 'mc', 'career'], 'track order; Frontend has no tasks so it is left out');
  assert.deepEqual(rows[0], { key: 'dsa', name: 'DSA', due: 2, done: 1, all: 4, allDone: 1 });
  assert.deepEqual(rows[1], { key: 'mc', name: 'Product', due: 0, done: 0, all: 3, allDone: 0 }, 'LLD (mc) and flagship (proj) are one Product row');
  assert.deepEqual(rows[2], { key: 'career', name: 'Career', due: 0, done: 0, all: 2, allDone: 0 }, 'behavioral and forward-deployed are one Career row');
  assert.equal(weakestTrack(rows)?.key, 'dsa');
}
// Nothing due yet: no weakest track. Ticking ahead counts in the plan total, not in "due".
{
  const rows = trackRows(days, 0, { 'p-3sum': 1 }, TRACKS, trackOf, () => false);
  assert.ok(rows.every((r) => r.due === 0));
  assert.equal(rows[0].allDone, 1);
  assert.equal(weakestTrack(rows), null);
}
// Skipped tasks leave both counts.
{
  const rows = trackRows(days, 3, {}, TRACKS, trackOf, (id) => id === 'proj:brief');
  assert.equal(rows.find((r) => r.key === 'mc')!.all, 2);
  assert.equal(rows.find((r) => r.key === 'mc')!.due, 2);
}
console.log('track-progress: ok');
