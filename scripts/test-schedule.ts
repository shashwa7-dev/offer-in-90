// Run: node --experimental-strip-types scripts/test-schedule.ts
import assert from 'node:assert/strict';
import { WEEKDAY_BLOCKS, SUNDAY_BLOCKS, BUFFER_BLOCK, buildICS } from '../src/lib/schedule.js';

const mins = (hm: string) => Number(hm.slice(0, 2)) * 60 + Number(hm.slice(3));
const find = (blocks: any[], k: string) => blocks.find((b) => b.k === k);

// Weekday: contiguous 05:00 to 22:00, no overlaps
assert.equal(WEEKDAY_BLOCKS[0].s, '05:00');
assert.equal(WEEKDAY_BLOCKS[WEEKDAY_BLOCKS.length - 1].e, '22:00');
for (let i = 1; i < WEEKDAY_BLOCKS.length; i++) {
  assert.equal(WEEKDAY_BLOCKS[i].s, WEEKDAY_BLOCKS[i - 1].e, `gap/overlap before ${WEEKDAY_BLOCKS[i].k}`);
  assert.ok(mins(WEEKDAY_BLOCKS[i].e) > mins(WEEKDAY_BLOCKS[i].s));
}
for (const [k, s, e] of [['dsa', '05:15', '06:45'], ['aib', '06:45', '07:15'], ['rev', '14:45', '15:15'], ['jt', '15:15', '16:00']]) {
  const b = find(WEEKDAY_BLOCKS, k);
  assert.ok(b, k);
  assert.deepEqual([b.s, b.e], [s, e], k);
}
assert.deepEqual(BUFFER_BLOCK, { k: 'buffer', title: 'Buffer: catch up, rest or explore', kind: 'life' });

// Sunday
const sun = SUNDAY_BLOCKS.map((b: any) => [b.k, b.s, b.e]);
assert.deepEqual(sun.map((x: any) => x[0]), ['wake', 'workout', 'core', 'read', 'sunday', 'rest', 'review', 'wind']);
assert.deepEqual(find(SUNDAY_BLOCKS, 'workout') && [find(SUNDAY_BLOCKS, 'workout').s, find(SUNDAY_BLOCKS, 'workout').e], ['05:15', '06:15']);
assert.deepEqual([find(SUNDAY_BLOCKS, 'core').s, find(SUNDAY_BLOCKS, 'core').e], ['09:00', '10:30']);
assert.deepEqual([find(SUNDAY_BLOCKS, 'read').s, find(SUNDAY_BLOCKS, 'read').e], ['10:30', '11:30']);
assert.deepEqual([find(SUNDAY_BLOCKS, 'sunday').s, find(SUNDAY_BLOCKS, 'sunday').e], ['11:30', '13:30']);
assert.deepEqual([find(SUNDAY_BLOCKS, 'rest').s, find(SUNDAY_BLOCKS, 'rest').e], ['13:30', '20:30']);
assert.equal(find(SUNDAY_BLOCKS, 'review').s, '20:30');
assert.equal(find(SUNDAY_BLOCKS, 'wind').s, '21:30');
assert.equal(find(SUNDAY_BLOCKS, 'wake').s, '05:00');

// ICS
const ics91 = buildICS('2026-11-16', 91);
assert.ok(ics91.includes('RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR,SA;UNTIL=20270214T235959'));
assert.ok(!ics91.includes('UNTIL=20270315'));
assert.ok(ics91.includes('SUMMARY:') && ics91.includes('BYDAY=SU;UNTIL=20270214'));
const ics119 = buildICS('2026-11-16', 119);
assert.ok(ics119.includes('UNTIL=20270314T235959'));
assert.ok(buildICS('2026-11-16').includes('UNTIL=20270214'));
console.log('schedule ok');
