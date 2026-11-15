import assert from 'node:assert/strict';
import { nextMonday, parseDraft, parseRoutineForm, toDraft, overflowMessage } from '../src/lib/setup-helpers.ts';
import { DEFAULT_ROUTINE } from '../src/lib/routine.ts';

// 2026-11-16 is a Monday
assert.equal(nextMonday('2026-11-16'), '2026-11-16');
assert.equal(nextMonday('2026-11-15'), '2026-11-16'); // Sunday
assert.equal(nextMonday('2026-11-17'), '2026-11-23'); // Tuesday
assert.equal(nextMonday('2026-11-21'), '2026-11-23'); // Saturday
assert.equal(nextMonday('2026-12-29'), '2027-01-04'); // across the year

assert.deepEqual(parseDraft({ on: true, title: '  Yoga ', s: '18:00', min: ' 45 ' }), { on: true, title: 'Yoga', s: '18:00', min: 45 });
assert.ok(Number.isNaN(parseDraft({ on: true, title: 'x', s: '18:00', min: '4.5' }).min));
assert.ok(Number.isNaN(parseDraft({ on: true, title: 'x', s: '18:00', min: '' }).min));
const form = { breakfast: toDraft(DEFAULT_ROUTINE.breakfast), lunch: toDraft(DEFAULT_ROUTINE.lunch), extra: toDraft(DEFAULT_ROUTINE.extra), dinner: toDraft(DEFAULT_ROUTINE.dinner) };
assert.deepEqual(parseRoutineForm(form), DEFAULT_ROUTINE);

assert.equal(overflowMessage('Deep work 3 · Machine coding', 40), "Doesn't fit: 'Deep work 3 · Machine coding' would run 40 min past 21:30. Move a slot or shorten it.");
console.log('setup-helpers ok');
