// Run: node --experimental-strip-types scripts/test-sundays.ts
import assert from 'node:assert/strict';
import { burnoutGuard, comingSunday, optionalLast, parseScore, scoreFields, scoreTable, withScore } from '../src/lib/sundays.ts';
import { CONTENT } from '../src/lib/plan-data.js';

assert.equal(parseScore('0'), 0); assert.equal(parseScore(' 85 '), 85); assert.equal(parseScore('100'), 100);
for (const bad of ['', '101', '-1', '7.5', 'abc', '1e2', '1000']) assert.equal(parseScore(bad), null, bad);

assert.deepEqual(scoreFields('baseline/dsa'), [{ key: 'baseline/dsa', label: 'Score' }]);
assert.deepEqual(scoreFields('w3').map((f) => f.key), ['w3/dsa', 'w3/fe', 'w3/sd', 'w3/ai']);

const a = { 'baseline/dsa': 40 };
const b = withScore(a, 'w2/dsa', 60);
assert.deepEqual(a, { 'baseline/dsa': 40 }); assert.deepEqual(b, { 'baseline/dsa': 40, 'w2/dsa': 60 });
assert.deepEqual(withScore(b, 'w2/dsa', null), a);

assert.deepEqual(scoreTable({}), { columns: [], rows: [] });
const t = scoreTable({ 'baseline/dsa': 40, 'baseline/sd': 30, 'w10/dsa': 70, 'w2/dsa': 55, 'w2/ai': 20 });
assert.deepEqual(t.columns.map((c) => c.id), ['baseline', 'w2', 'w10']);
assert.deepEqual(t.rows.map((r) => [r.section, r.cells]), [['dsa', [40, 55, 70]], ['sd', [30, null, null]], ['ai', [null, 20, null]]]);

// burnout guard: strictly more than 8 h, weekend only
assert.equal(burnoutGuard(481, 6), true); assert.equal(burnoutGuard(481, 0), true);
assert.equal(burnoutGuard(480, 6), false); assert.equal(burnoutGuard(900, 3), false); assert.equal(burnoutGuard(900, 5), false);

const days = [{ i: 0, type: 'kick' }, { i: 1, type: 'study' }, { i: 7, type: 'sun' }, { i: 8, type: 'study' }, { i: 14, type: 'sun' }];
assert.equal(comingSunday(days, 1), 7); assert.equal(comingSunday(days, 7), 7); assert.equal(comingSunday(days, 8), 14); assert.equal(comingSunday(days, 15), null);

assert.deepEqual(optionalLast([{ id: 'a', optional: true }, { id: 'b' }, { id: 'c', optional: true }, { id: 'd' }]).map((x) => x.id), ['b', 'd', 'a', 'c']);

// content: 4 depth tests, reads listed
assert.equal(CONTENT.DEPTH_AREAS.length, 4);
for (const d of CONTENT.DEPTH_AREAS) assert.ok(d.id && d.area && d.where && d.test, d.id);
assert.ok(CONTENT.SUNDAY_READS.length >= 15);
console.log('sundays: ok');
