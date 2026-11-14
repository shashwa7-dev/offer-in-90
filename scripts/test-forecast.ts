// Run: node --experimental-strip-types scripts/test-forecast.ts
import assert from 'node:assert/strict';
import { forecast } from '../src/lib/forecast.ts';
import type { DayHours } from '../src/lib/forecast.ts';

const near = (a: number | null, b: number, eps = 0.01) => assert.ok(a !== null && Math.abs(a - b) < eps, `${a} !~ ${b}`);
const mk = (done: number[], n = 10): DayHours[] =>
  Array.from({ length: n }, (_, i) => ({ no: i + 1, planMin: 600, doneMin: done[i] ?? 0 }));

// basic
{
  const f = forecast(mk([120, 240]), 3);
  assert.equal(f.paceH, 2);
  assert.equal(f.projectedH, 20);
  near(f.neededH, 94 / 7);
  assert.equal(f.pct, 0.2);
  assert.equal(f.doneH, 6);
  assert.equal(f.planH, 100);
  assert.equal(f.cumPlan.length, 10);
  assert.equal(f.cumDone.length, 4);
}
// notStarted
{
  const f = forecast(mk([120, 240]), -2);
  assert.equal(f.paceH, null);
  assert.equal(f.projectedH, null);
  assert.equal(f.pct, null);
  assert.equal(f.neededH, 10);
  assert.deepEqual(f.cumDone, []);
}
// finished
{
  const days = mk([120, 240, 60, 60, 60, 60, 60, 60, 60, 60]);
  const f = forecast(days, 10);
  assert.equal(f.neededH, 0);
  near(f.paceH, (60 * 7) / 60 / 7);
  assert.equal(f.cumDone.length, 10);
}
// prepDayIgnoredInPace
{
  const days: DayHours[] = [{ no: 0, planMin: 240, doneMin: 240 }, ...mk([120, 240]).slice(0, 9)];
  const f = forecast(days, 4);
  assert.equal(f.paceH, 2);
  assert.equal(f.doneH, 10);
}
// windowIsSeven
{
  const done = Array.from({ length: 20 }, (_, i) => (i < 10 ? 600 : 0));
  assert.equal(forecast(mk(done, 20), 17).paceH, 0);
}
console.log('forecast: all tests passed');
