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
// v3 times and titles (spec: Track identity)
for (const [k, s, e, title] of [
  ['dsa', '05:15', '06:15', 'Deep work 1 · DSA pattern'],
  ['aib', '06:15', '07:15', 'Recall + AI news'],
  ['fe', '08:00', '10:00', 'Deep work 2 · AI engineering core'],
  ['mc', '10:15', '11:45', 'Deep work 3 · Product: the flagship'],
  ['sd', '13:00', '14:30', 'Deep work 4 · Systems and architecture'],
  ['rev', '14:45', '15:15', 'DSA revision + recognition drill'],
  ['jt', '15:15', '16:00', 'Platform, data and DevOps'],
  ['beh', '16:00', '17:00', 'Career and FDE'],
  ['ai', '20:00', '21:00', 'Frontend (senior)'],
]) {
  const b = find(WEEKDAY_BLOCKS, k);
  assert.ok(b, k);
  assert.deepEqual([b.s, b.e, b.title], [s, e, title], k);
}
const studyMin = WEEKDAY_BLOCKS.filter((b: any) => b.kind === 'study').reduce((a: number, b: any) => a + mins(b.e) - mins(b.s), 0);
assert.equal(studyMin, 645, 'study time 10.75 h');
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
assert.ok(ics91.includes('X-WR-CALNAME:IDT'));
assert.ok(ics91.includes('PRODID:-//IDT//Interview Prep//EN'));
assert.ok(ics91.includes('UID:wk-dsa-2026-11-16@faang-prep'), 'event UIDs unchanged');
console.log('schedule ok');
