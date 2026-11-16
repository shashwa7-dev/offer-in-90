// Run: node --experimental-strip-types scripts/test-routine.ts
import assert from 'node:assert/strict';
import { WEEKDAY_BLOCKS, buildICS } from '../src/lib/schedule.js';
import { DEFAULT_ROUTINE, ROUTINE_BLOCK_KEY, resolveRoutine, validateRoutine, placeDay } from '../src/lib/routine.ts';

const mins = (hm: string) => Number(hm.slice(0, 2)) * 60 + Number(hm.slice(3));
const hm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
const must = (r: ReturnType<typeof placeDay>) => { assert.ok(r.ok, JSON.stringify(r)); return r as Extract<ReturnType<typeof placeDay>, { ok: true }>; };
const find = (bs: any[], k: string) => bs.find((b) => b.k === k);
const SLOT_KEYS = Object.values(ROUTINE_BLOCK_KEY);
const STUDY = WEEKDAY_BLOCKS.filter((b) => b.kind === 'study');
/** Every study block of the template is present at full length, and nothing overlaps. */
const fullDay = (bs: any[]) => {
  for (const t of STUDY) { const b = find(bs, t.k); assert.ok(b, `${t.k} kept`); assert.equal(mins(b.e) - mins(b.s), mins(t.e) - mins(t.s), `${t.k} full length`); }
  for (let i = 1; i < bs.length; i++) assert.ok(mins(bs[i].s) >= mins(bs[i - 1].e), `${bs[i - 1].k} / ${bs[i].k} overlap`);
};

// 1. defaults reproduce the template exactly, bedtime unmoved
{
  const d = must(placeDay(WEEKDAY_BLOCKS, DEFAULT_ROUTINE));
  assert.deepEqual(d.blocks, WEEKDAY_BLOCKS);
  assert.equal(d.bedtime, '22:00');
  assert.equal(d.bedShiftMin, 0);
  assert.deepEqual(must(placeDay(WEEKDAY_BLOCKS, {})).blocks, WEEKDAY_BLOCKS, 'an empty stored routine = defaults');
}
assert.deepEqual(ROUTINE_BLOCK_KEY, { breakfast: 'breakfast', lunch: 'lunch', dinner: 'dinner', extra: 'workout' });
assert.deepEqual(DEFAULT_ROUTINE.extra, { on: true, title: 'Gym', s: '18:00', min: 60 });
assert.deepEqual(DEFAULT_ROUTINE.lunch, { on: true, title: 'Lunch + 20 min power nap', s: '11:45', min: 75 });
assert.deepEqual(DEFAULT_ROUTINE.wake, { s: '05:00' });
assert.ok(!('bed' in DEFAULT_ROUTINE), 'no editable bedtime');

// 2. lunch at 12:30 for 60 min: everything still fits at full length; bedtime moves instead of refusing.
// sd 13:30-15:00, break2, rev, jt, beh shift; free (60) jumps gym and dinner to 20:00-21:00, shower 21:00-21:15,
// ai 21:15-22:15, review 22:15-22:45, so wind runs 22:45-23:15: bedtime 23:15, 75 min later.
{
  const r = must(placeDay(WEEKDAY_BLOCKS, { ...DEFAULT_ROUTINE, lunch: { on: true, title: 'Lunch', s: '12:30', min: 60 } }));
  fullDay(r.blocks);
  assert.equal(find(r.blocks, 'sd').s, '13:30');
  assert.equal(find(r.blocks, 'review').e, '22:45');
  assert.equal(r.bedShiftMin, 75);
  assert.equal(r.bedtime, '23:15');
  const w = find(r.blocks, 'wind');
  assert.deepEqual([w.s, w.e], ['22:45', '23:15']);
  assert.equal(w.title, 'Wind down, no screens · sleep at 23:15', 'the wind-down title shows the moved bedtime');
  assert.equal(r.blocks.at(-1).k, 'wind');
}
// a smaller shift that fits before wind: lunch 12:00 for 45 min
{
  const r = must(placeDay(WEEKDAY_BLOCKS, { ...DEFAULT_ROUTINE, lunch: { on: true, title: 'Lunch', s: '12:00', min: 45 } }));
  fullDay(r.blocks);
  assert.equal(find(r.blocks, 'sd').s, '13:00');
  assert.equal(r.bedShiftMin, 0);
  assert.deepEqual(find(r.blocks, 'wind'), WEEKDAY_BLOCKS.at(-1));
}

// 3. wake 06:00 shifts every template block by 60 min (slots moved by the owner too, since slots keep absolute times)
{
  const plus = (x: { s: string; min: number }) => ({ ...x, s: hm(mins(x.s) + 60) });
  const R = { wake: { s: '06:00' }, breakfast: plus(DEFAULT_ROUTINE.breakfast), lunch: plus(DEFAULT_ROUTINE.lunch), extra: plus(DEFAULT_ROUTINE.extra), dinner: plus(DEFAULT_ROUTINE.dinner) };
  const r = must(placeDay(WEEKDAY_BLOCKS, R));
  assert.equal(r.blocks.length, WEEKDAY_BLOCKS.length);
  for (const t of WEEKDAY_BLOCKS) {
    const b = find(r.blocks, t.k);
    assert.equal(b.s, hm(mins(t.s) + 60), `${t.k} start +60`);
    assert.equal(b.e, hm(mins(t.e) + 60), `${t.k} end +60`);
  }
  assert.equal(find(r.blocks, 'wake').s, '06:00');
  // bedtime shifts with wake-up (17 h later): 23:00 is the usual bedtime here, so it has not moved
  assert.equal(r.bedtime, '23:00'); assert.equal(r.bedShiftMin, 0);
  assert.equal(find(r.blocks, 'wind').title, 'Wind down, no screens · sleep at 23:00');
}

// 3b. R15: a slot the owner never set moves with wake-up; a saved slot keeps its absolute time
const shifted = (off: number) => WEEKDAY_BLOCKS.map((b) => ({ ...b, s: hm(mins(b.s) + off), e: hm(mins(b.e) + off),
  ...(b.k === 'wind' ? { title: b.title.replace('22:00', hm(mins('22:00') + off)) } : {}) }));
{
  // wake 06:00, untouched routine: the default day exactly one hour later
  const r = must(placeDay(WEEKDAY_BLOCKS, { wake: { s: '06:00' } }));
  assert.deepEqual(r.blocks, shifted(60));
  assert.equal(r.bedtime, '23:00'); assert.equal(r.bedShiftMin, 0);
  // wake 04:30, untouched: 30 min earlier
  const e = must(placeDay(WEEKDAY_BLOCKS, { wake: { s: '04:30' } }));
  assert.deepEqual(e.blocks, shifted(-30));
  assert.equal(e.bedtime, '21:30'); assert.equal(e.bedShiftMin, 0);
  // wake 06:00 with lunch explicitly saved at 11:45/75: lunch stays at 11:45, the other slots move. Computed: mc jumps
  // past lunch to 13:00 and the push carries past gym and dinner, so the day would end 16 min after 23:59: refused.
  const LUNCH = { on: true, title: 'Lunch + 20 min power nap', s: '11:45', min: 75 };
  const x = placeDay(WEEKDAY_BLOCKS, { wake: { s: '06:00' }, lunch: LUNCH });
  assert.equal(x.ok, false);
  assert.match((x as any).error, /16 min past 23:59/);
  // wake 05:30 with the same saved lunch fits: lunch absolute, breakfast/gym/dinner +30, bedtime moves 75 min
  const y = must(placeDay(WEEKDAY_BLOCKS, { wake: { s: '05:30' }, lunch: LUNCH }));
  fullDay(y.blocks);
  assert.deepEqual([find(y.blocks, 'lunch').s, find(y.blocks, 'lunch').e], ['11:45', '13:00']);
  assert.equal(find(y.blocks, 'breakfast').s, '07:45');
  assert.equal(find(y.blocks, 'workout').s, '18:30');
  assert.equal(find(y.blocks, 'dinner').s, '19:45');
  assert.equal(find(y.blocks, 'mc').s, '13:00');
  assert.equal(y.bedtime, '23:45'); assert.equal(y.bedShiftMin, 75);
  assert.equal(find(y.blocks, 'wind').title, 'Wind down, no screens · sleep at 23:45');
}

// 4. wake 04:30 brings the usual bedtime to 21:30; an overrun is measured from there
{
  const r = must(placeDay(WEEKDAY_BLOCKS, { wake: { s: '04:30' }, lunch: { on: true, title: 'Lunch', s: '12:30', min: 60 } }));
  fullDay(r.blocks);
  assert.equal(r.bedShiftMin, mins(r.bedtime) - mins('21:30'));
  assert.ok(r.bedShiftMin > 0);
}

// 5. a day that would run past 23:59 is refused
{
  const late = placeDay(WEEKDAY_BLOCKS, { ...DEFAULT_ROUTINE, dinner: { on: true, title: 'Dinner', s: '19:15', min: 180 } });
  assert.equal(late.ok, false);
  assert.match((late as any).error, /23:59/);
  const late2 = placeDay(WEEKDAY_BLOCKS, { wake: { s: '08:00' } });
  assert.equal(late2.ok, false, 'wake 08:00 pushes the day past midnight');
  // invalid input is refused too
  assert.equal(placeDay(WEEKDAY_BLOCKS, { lunch: { on: true, title: 'Lunch', s: '17:30', min: 60 } }).ok, false);
}

// 6. breakfast off
{
  const nb = must(placeDay(WEEKDAY_BLOCKS, { ...DEFAULT_ROUTINE, breakfast: { ...DEFAULT_ROUTINE.breakfast, on: false } })).blocks;
  assert.ok(!find(nb, 'breakfast'));
  for (const b of nb) { const t = WEEKDAY_BLOCKS.find((x) => x.k === b.k)!; assert.ok(mins(b.s) >= mins(t.s), b.k); }
  assert.equal(find(nb, 'fe').s, '08:00');
}

// 7. extra renamed Yoga
{
  const yg = must(placeDay(WEEKDAY_BLOCKS, { ...DEFAULT_ROUTINE, extra: { on: true, title: 'Yoga', s: '17:00', min: 30 } })).blocks;
  const y = yg.find((b) => b.title === 'Yoga');
  assert.ok(y && y.kind === 'health' && y.s === '17:00' && y.e === '17:30' && y.remind === true);
  assert.ok(!yg.some((b) => b.title === 'Gym'));
}

// 8. validateRoutine
assert.deepEqual(validateRoutine(DEFAULT_ROUTINE), { ok: true });
assert.deepEqual(validateRoutine({}), { ok: true });
const bad = (r: any) => { const v = validateRoutine({ ...DEFAULT_ROUTINE, ...r }); assert.equal(v.ok, false, JSON.stringify(r)); return (v as any).error as string; };
assert.match(bad({ lunch: { on: true, title: 'Lunch', s: '17:30', min: 60 } }), /overlaps/);
assert.equal(bad({ lunch: { on: true, title: 'Lunch', s: '17:30', min: 60 }, extra: { on: true, title: 'Yoga', s: '18:00', min: 60 } }), 'Lunch overlaps Yoga.');
assert.equal(bad({ lunch: { on: true, title: 'Lunch', s: '12:00', min: 0 } }).length > 0, true);
bad({ lunch: { on: true, title: 'Lunch', s: '25:00', min: 60 } });
assert.equal(bad({ breakfast: { on: true, title: 'B', s: '05:00', min: 15 } }), 'B starts before 05:15, when wake-up ends.');
assert.equal(bad({ wake: { s: '06:00' }, breakfast: { on: true, title: 'B', s: '06:00', min: 15 } }), 'B starts before 06:15, when wake-up ends.');
bad({ lunch: { on: true, title: '   ', s: '12:00', min: 60 } });
bad({ lunch: { on: true, title: 'x'.repeat(41), s: '12:00', min: 60 } });
bad({ lunch: { on: true, title: 'L', s: '12:00', min: 181 } });
// wake-up
assert.equal(bad({ wake: { s: '5:00' } }), 'Wake up needs a valid time.');
assert.equal(bad({ wake: { s: '24:00' } }), 'Wake up needs a valid time.');
// a late dinner no longer fails validation: bedtime moves instead
assert.deepEqual(validateRoutine({ ...DEFAULT_ROUTINE, dinner: { on: true, title: 'D', s: '21:00', min: 45 } }), { ok: true });
// a disabled overlapping slot is fine
assert.deepEqual(validateRoutine({ ...DEFAULT_ROUTINE, lunch: { on: false, title: 'Lunch', s: '18:00', min: 60 } }), { ok: true });

// 9. resolveRoutine overrides only what is stored
{
  const rr = resolveRoutine({ lunch: { on: false, title: 'Lunch', s: '12:00', min: 60 }, wake: { s: '04:45' } });
  assert.equal(rr.lunch.on, false);
  assert.deepEqual(rr.dinner, { ...DEFAULT_ROUTINE.dinner, s: '19:00' }, 'an unset slot moves with wake-up');
  assert.deepEqual(rr.lunch.s, '12:00', 'a saved slot keeps its time');
  assert.deepEqual(rr.wake, { s: '04:45' });
  assert.deepEqual(resolveRoutine({ wake: { s: '5:00' } }).dinner, DEFAULT_ROUTINE.dinner, 'invalid wake: nothing shifts');
  assert.deepEqual(resolveRoutine({ lunch: rr.lunch }).wake, { s: '05:00' });
  assert.deepEqual(resolveRoutine({}), DEFAULT_ROUTINE);
  assert.deepEqual(resolveRoutine(null), DEFAULT_ROUTINE);
}

// 10. buildICS uses the placed blocks (moved bedtime included) and defaults unchanged
{
  const ics = buildICS('2026-11-16', 91, { ...DEFAULT_ROUTINE, extra: { on: true, title: 'Yoga', s: '17:00', min: 30 } });
  assert.ok(ics.includes('SUMMARY:Yoga') && !ics.includes('SUMMARY:Gym'));
  assert.ok(buildICS('2026-11-16').includes('SUMMARY:Gym'));
  const moved = buildICS('2026-11-16', 91, { ...DEFAULT_ROUTINE, lunch: { on: true, title: 'Lunch', s: '12:30', min: 60 } });
  assert.ok(moved.includes('SUMMARY:Wind down, no screens · sleep at 23:15'));
  assert.ok(moved.includes('DTSTART:20261116T224500'), 'wind-down event at the moved time');
  // a day past 23:59 cannot be placed: falls back to the template
  assert.ok(buildICS('2026-11-16', 91, { ...DEFAULT_ROUTINE, dinner: { on: true, title: 'Dinner', s: '19:15', min: 180 } }).includes('SUMMARY:Gym'));
}

// Review Focus 5: a moved wake-up on the v3 60/60 DSA/recall split keeps every block and 10.75 study hours
{
  const r = must(placeDay(WEEKDAY_BLOCKS, { wake: { s: '06:30' } }));
  fullDay(r.blocks);
  assert.equal(find(r.blocks, 'dsa').s, '06:45');
  assert.equal(find(r.blocks, 'aib').s, '07:45');
  const study = r.blocks.filter((b: any) => b.kind === 'study').reduce((a: number, b: any) => a + mins(b.e) - mins(b.s), 0);
  assert.equal(study, 645);
}

console.log('routine: all scenarios pass');
