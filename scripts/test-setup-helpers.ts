import assert from 'node:assert/strict';
import { nextMonday, parseDraft, parseRoutineForm, toDraft, toRoutineForm, routineDiff, bedtimeMessage, normalizeState, isPreV2, startOver } from '../src/lib/setup-helpers.ts';
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
const form = toRoutineForm(DEFAULT_ROUTINE);
assert.deepEqual(form.breakfast, toDraft(DEFAULT_ROUTINE.breakfast));
assert.equal(form.wake, '05:00'); assert.ok(!('bed' in form));
assert.deepEqual(parseRoutineForm(form), DEFAULT_ROUTINE);
assert.deepEqual(parseRoutineForm({ ...form, wake: '06:00' }).wake, { s: '06:00' });
// only what differs from the defaults is stored (so Reset / reverting a field records the deletion)
assert.deepEqual(routineDiff(DEFAULT_ROUTINE, DEFAULT_ROUTINE), {});
assert.deepEqual(routineDiff({ ...DEFAULT_ROUTINE, wake: { s: '04:30' }, lunch: { ...DEFAULT_ROUTINE.lunch, min: 60 } }, DEFAULT_ROUTINE),
  { wake: { s: '04:30' }, lunch: { ...DEFAULT_ROUTINE.lunch, min: 60 } });

assert.equal(bedtimeMessage('22:40'), 'Bedtime moves to 22:40 on study days to fit everything.');
// normalize: a saved or fresh state always starts on a Monday (non-Monday starts snap to the next Monday)
{
  const f = { v: 6, start: '2026-11-15', kickoff: true, targets: ['A'], pages: { p: 1 }, done: {}, status: {}, flags: {}, notes: {}, tnotes: {}, seenUpdates: {}, bookmarks: {}, custom: {}, modes: {}, labels: {}, itemLabels: {}, own: {}, solves: {}, sundayMode: {}, scores: {}, routine: {}, meta: {}, updatedAt: 0 };
  assert.equal(normalizeState(null, f).start, '2026-11-16', 'fresh Sunday start → Monday');
  assert.equal(normalizeState({ start: '2026-11-18', v: 5, done: { x: 1 } }, f).start, '2026-11-23', 'Wednesday → next Monday');
  assert.equal(normalizeState({ start: '2026-11-16' }, f).start, '2026-11-16', 'a Monday is kept');
  const n = normalizeState({ start: '2026-11-18', v: 5, done: { x: 1 } }, f);
  assert.equal(n.v, 6); assert.deepEqual(n.done, { x: 1 }); assert.deepEqual(n.solves, {}); assert.deepEqual(n.targets, ['A']); assert.deepEqual(n.pages, { p: 1 });
  assert.equal(normalizeState({ start: '2026-11-16', v: 6 }, f).start, normalizeState(normalizeState({ start: '2026-11-16', v: 6 }, f), f).start, 'idempotent');
  // one-time notice only for states saved before v6
  assert.equal(isPreV2({ v: 5, start: '2026-11-02' }), true);
  assert.equal(isPreV2({ start: '2026-11-02' }), true, 'no version = old');
  assert.equal(isPreV2({ v: 6, start: '2026-11-02' }), false);
  assert.equal(isPreV2(null), false); assert.equal(isPreV2({ v: 5 }), false, 'nothing saved yet');
}
// Start over: the plan's progress goes (ticks, statuses, flags, logs, solves, scores, Sunday modes); the owner's own
// things stay (labels, item labels, own problems and tasks, routine, pages, bookmarks, task notes). The current mode is kept.
{
  const z = { dsa: 3, aib: 0, fe: 2, mc: 0, sd: 0, jt: 0, beh: 0, ai: 0 };
  const s = {
    start: '2026-10-05', done: { a: 1 }, status: { b: 'skipped' as const }, flags: { c: 1 }, notes: { 1: 'log' }, solves: { 'p-x': { mins: 20 } },
    scores: { 'w2/dsa': 60 }, sundayMode: { '2026-10-11': 'revision' as const }, labels: { l: 1 }, itemLabels: { i: ['l'] }, own: { o: 1 },
    routine: { lunch: 1 }, custom: { ct: 1 }, pages: { pg: 1 }, bookmarks: { bk: 1 }, tnotes: { tn: 1 },
    modes: { '2026-10-05': { mode: 'steady' as const, cursors: z }, '2026-10-20': { mode: 'grind' as const, cursors: z, basis: '2026-10-05' } },
  };
  const r = startOver(s, '2026-11-16');
  assert.equal(r.start, '2026-11-16');
  for (const k of ['done', 'status', 'flags', 'notes', 'solves', 'scores', 'sundayMode'] as const) assert.deepEqual(r[k], {}, `${k} cleared`);
  for (const k of ['labels', 'itemLabels', 'own', 'routine', 'custom', 'pages', 'bookmarks', 'tnotes'] as const) assert.deepEqual(r[k], s[k], `${k} kept`);
  assert.deepEqual(r.modes, { '2026-11-16': { mode: 'grind', cursors: { dsa: 0, aib: 0, fe: 0, mc: 0, sd: 0, jt: 0, beh: 0, ai: 0 }, basis: '2026-11-16' } }, 'Grind kept, from the new start');
  assert.deepEqual(startOver({ ...s, modes: { '2026-10-05': { mode: 'steady' as const, cursors: z } } }, '2026-11-16').modes, {}, 'Steady → the fresh default');
  assert.deepEqual(startOver({ ...s, modes: {} }, '2026-11-16').modes, {});
}
console.log('setup-helpers ok');
