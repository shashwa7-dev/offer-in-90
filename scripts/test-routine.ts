// Run: node --experimental-strip-types scripts/test-routine.ts
import assert from 'node:assert/strict';
import { WEEKDAY_BLOCKS, buildICS } from '../src/lib/schedule.js';
import { DEFAULT_ROUTINE, ROUTINE_BLOCK_KEY, resolveRoutine, validateRoutine, placeDay } from '../src/lib/routine.ts';

const mins = (hm: string) => Number(hm.slice(0, 2)) * 60 + Number(hm.slice(3));
const must = (r: ReturnType<typeof placeDay>) => { assert.ok(r.ok, JSON.stringify(r)); return (r as any).blocks as any[]; };
const find = (bs: any[], k: string) => bs.find((b) => b.k === k);

// 1. defaults reproduce the template exactly
assert.deepEqual(must(placeDay(WEEKDAY_BLOCKS, DEFAULT_ROUTINE)), WEEKDAY_BLOCKS);
assert.deepEqual(ROUTINE_BLOCK_KEY, { breakfast: 'breakfast', lunch: 'lunch', dinner: 'dinner', extra: 'workout' });
assert.deepEqual(DEFAULT_ROUTINE.extra, { on: true, title: 'Gym', s: '18:00', min: 60 });
assert.deepEqual(DEFAULT_ROUTINE.lunch, { on: true, title: 'Lunch + 20 min power nap', s: '11:45', min: 75 });

// 2. lunch at 12:30 for 60 min: sd cannot fit before it, starts 13:30; durations kept; the computed result is a failure
const lr = placeDay(WEEKDAY_BLOCKS, { ...DEFAULT_ROUTINE, lunch: { on: true, title: 'Lunch', s: '12:30', min: 60 } });
// sd 13:30-15:00, break2, rev, jt, beh, free all shift; free (60) collides with gym and dinner and lands at 20:00-21:00,
// then shower 21:00-21:15 and ai (60) would collide with wind and move to 22:00-23:00, 90 min past 21:30.
assert.equal(lr.ok, false);
assert.equal((lr as any).block.k, 'ai');
assert.equal((lr as any).overMin, 90);
// a smaller shift that still works: lunch 12:00 for 45 min
const ok2 = must(placeDay(WEEKDAY_BLOCKS, { ...DEFAULT_ROUTINE, lunch: { on: true, title: 'Lunch', s: '12:00', min: 45 } }));
for (const b of ok2) { const t = WEEKDAY_BLOCKS.find((x) => x.k === b.k); if (t && !Object.values(ROUTINE_BLOCK_KEY).includes(b.k)) assert.equal(mins(b.e) - mins(b.s), mins(t.e) - mins(t.s), b.k); }
assert.equal(find(ok2, 'sd').s, '13:00');
// sorted, no overlap
for (let i = 1; i < ok2.length; i++) assert.ok(mins(ok2[i].s) >= mins(ok2[i - 1].e));

// 3. breakfast off
const nb = must(placeDay(WEEKDAY_BLOCKS, { ...DEFAULT_ROUTINE, breakfast: { ...DEFAULT_ROUTINE.breakfast, on: false } }));
assert.ok(!find(nb, 'breakfast'));
for (const b of nb) { const t = WEEKDAY_BLOCKS.find((x) => x.k === b.k)!; assert.ok(mins(b.s) >= mins(t.s), b.k); }
assert.equal(find(nb, 'fe').s, '08:00');

// 4. extra renamed Yoga
const yg = must(placeDay(WEEKDAY_BLOCKS, { ...DEFAULT_ROUTINE, extra: { on: true, title: 'Yoga', s: '17:00', min: 30 } }));
const y = yg.find((b) => b.title === 'Yoga');
assert.ok(y && y.kind === 'health' && y.s === '17:00' && y.e === '17:30' && y.remind === true);
assert.ok(!yg.some((b) => b.title === 'Gym'));

// 5. pushing study past wind fails, naming the first block that does not fit
const late = placeDay(WEEKDAY_BLOCKS, { ...DEFAULT_ROUTINE, dinner: { on: true, title: 'Dinner', s: '19:15', min: 180 } });
assert.equal(late.ok, false);
assert.ok((late as any).overMin > 0 && (late as any).block.k === 'ai');

// 6. validateRoutine
assert.deepEqual(validateRoutine(DEFAULT_ROUTINE), { ok: true });
const bad = (r: any) => { const v = validateRoutine({ ...DEFAULT_ROUTINE, ...r }); assert.equal(v.ok, false); return (v as any).error as string; };
assert.match(bad({ lunch: { on: true, title: 'Lunch', s: '17:30', min: 60 } }), /overlaps/);
assert.equal(bad({ lunch: { on: true, title: 'Lunch', s: '17:30', min: 60 }, extra: { on: true, title: 'Yoga', s: '18:00', min: 60 } }), 'Lunch overlaps Yoga.');
assert.equal(bad({ lunch: { on: true, title: 'Lunch', s: '12:00', min: 0 } }).length > 0, true);
bad({ lunch: { on: true, title: 'Lunch', s: '25:00', min: 60 } });
bad({ breakfast: { on: true, title: 'B', s: '05:00', min: 15 } });
bad({ dinner: { on: true, title: 'D', s: '21:00', min: 45 } });
bad({ lunch: { on: true, title: '   ', s: '12:00', min: 60 } });
bad({ lunch: { on: true, title: 'x'.repeat(41), s: '12:00', min: 60 } });
bad({ lunch: { on: true, title: 'L', s: '12:00', min: 181 } });
// a disabled overlapping slot is fine
assert.deepEqual(validateRoutine({ ...DEFAULT_ROUTINE, lunch: { on: false, title: 'Lunch', s: '18:00', min: 60 } }), { ok: true });

// 7. resolveRoutine overrides only what is stored
const rr = resolveRoutine({ lunch: { on: false, title: 'Lunch', s: '12:00', min: 60 } });
assert.equal(rr.lunch.on, false);
assert.deepEqual(rr.dinner, DEFAULT_ROUTINE.dinner);
assert.deepEqual(resolveRoutine({}), DEFAULT_ROUTINE);

// 8. buildICS uses the routine (reminders at the new gym time) and defaults unchanged
const ics = buildICS('2026-11-16', 91, { ...DEFAULT_ROUTINE, extra: { on: true, title: 'Yoga', s: '17:00', min: 30 } });
assert.ok(ics.includes('SUMMARY:Yoga') && !ics.includes('SUMMARY:Gym'));
assert.ok(buildICS('2026-11-16').includes('SUMMARY:Gym'));
// unplaceable routine falls back to the template
assert.ok(buildICS('2026-11-16', 91, { ...DEFAULT_ROUTINE, dinner: { on: true, title: 'Dinner', s: '19:15', min: 180 } }).includes('SUMMARY:Gym'));

console.log('routine: all scenarios pass');
