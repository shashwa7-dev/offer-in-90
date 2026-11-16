// Run: node --experimental-strip-types scripts/test-labels.ts
import assert from 'node:assert/strict';
import { applyLabel, createGroup, createLabel, deleteLabel, labelsOf, removeLabel, renameLabel, recolorLabel, systemLabelsFor, visibleLabelIds } from '../src/lib/labels.ts';

type L = Record<string, any>;
const ok = (r: any) => { assert.ok(!('error' in r), JSON.stringify(r)); return r as { labels: L; id: string }; };

// duplicates: case-insensitive, and system names
let labels: L = {};
const weak = ok(createLabel(labels, { name: 'Weak', color: '#f00' }));
assert.deepEqual(createLabel(weak.labels, { name: 'weak', color: '#0f0' }), { error: 'duplicate' });
assert.deepEqual(createLabel(weak.labels, { name: 'Pattern', color: '#0f0' }), { error: 'duplicate' });
assert.deepEqual(createLabel(weak.labels, { name: 'Hot', color: '#0f0' }), { error: 'duplicate' });
assert.deepEqual(createGroup(weak.labels, { name: 'tier', single: true }), { error: 'duplicate' });
assert.deepEqual(createLabel(weak.labels, { name: '  ', color: '#0f0' }), { error: 'empty' });

// single-choice group
const co = ok(createGroup({}, { name: 'Company', single: true }));
const raz = ok(createLabel(co.labels, { name: 'Razorpay', color: '#00f', group: co.id }));
const swi = ok(createLabel(raz.labels, { name: 'Swiggy', color: '#0ff', group: co.id }));
let st = { labels: swi.labels, itemLabels: {} as Record<string, string[]> };
st = applyLabel(st, 'p-two-sum', raz.id);
st = applyLabel(st, 'p-two-sum', swi.id);
assert.deepEqual(st.itemLabels['p-two-sum'], [swi.id]);

// multi-choice keeps both
const mg = ok(createGroup(st.labels, { name: 'Topics', single: false }));
const a = ok(createLabel(mg.labels, { name: 'A', color: '#111', group: mg.id }));
const b = ok(createLabel(a.labels, { name: 'B', color: '#222', group: mg.id }));
let s2 = { labels: b.labels, itemLabels: {} as Record<string, string[]> };
s2 = applyLabel(applyLabel(s2, 'x', a.id), 'x', b.id);
assert.deepEqual(s2.itemLabels.x, [a.id, b.id]);
assert.deepEqual(applyLabel(s2, 'x', a.id).itemLabels.x, [a.id, b.id]);
s2 = removeLabel(s2, 'x', a.id);
assert.deepEqual(s2.itemLabels.x, [b.id]);
assert.equal(removeLabel(s2, 'x', b.id).itemLabels.x, undefined);

// delete a label in a single group: gone everywhere, group stays
let s3 = { labels: swi.labels, itemLabels: { p1: [raz.id], p2: [raz.id, 'sys-ignored'], p3: [swi.id] } as Record<string, string[]> };
s3 = deleteLabel(s3, raz.id);
assert.ok(!(raz.id in s3.labels) && co.id in s3.labels && swi.id in s3.labels);
assert.equal(s3.itemLabels.p1, undefined);
assert.deepEqual(s3.itemLabels.p2, ['sys-ignored']);
assert.deepEqual(s3.itemLabels.p3, [swi.id]);

// delete a group: labels and uses go
const s4 = deleteLabel({ labels: swi.labels, itemLabels: { p1: [raz.id, swi.id], p3: [swi.id] } }, co.id);
assert.deepEqual(s4.labels, {});
assert.deepEqual(s4.itemLabels, {});

// rename / recolor
assert.equal(renameLabel(swi.labels, swi.id, 'Zomato').labels[swi.id].name, 'Zomato');
assert.deepEqual(renameLabel(swi.labels, swi.id, 'razorpay'), { error: 'duplicate' });
assert.deepEqual(renameLabel(swi.labels, swi.id, ' '), { error: 'empty' });
assert.equal(renameLabel(swi.labels, swi.id, 'SWIGGY').labels[swi.id].name, 'SWIGGY');
assert.equal(recolorLabel(swi.labels, swi.id, '#abc')[swi.id].color, '#abc');

// system labels
assert.ok(systemLabelsFor({ id: 'u-1', own: '1' }).includes('sys:source:yours'));
assert.ok(systemLabelsFor({ id: 'p-x' }).includes('sys:source:plan'));
const sys = systemLabelsFor({ id: 'p-x', pattern: 'two-pointers', tier: 'must', flags: ['hot'] });
for (const id of ['sys:pattern:two-pointers', 'sys:tier:must', 'sys:freq:hot']) assert.ok(sys.includes(id), id);
const sys2 = systemLabelsFor({ id: 'p-y', flags: ['hard-hot'], depth: true, flagged: true });
for (const id of ['sys:freq:hard-hot', 'sys:depth', 'sys:flagged']) assert.ok(sys2.includes(id), id);

// system id ignored
const base = { labels: swi.labels, itemLabels: {} };
assert.equal(applyLabel(base, 'p', 'sys:tier:must'), base);
assert.equal(applyLabel(base, 'p', 'lb-missing'), base);
assert.equal(applyLabel(base, 'p', co.id), base);

// labelsOf
assert.deepEqual(labelsOf({ p: [swi.id] }, { id: 'p', tier: 'must' }), [swi.id, 'sys:tier:must', 'sys:source:plan']);

// an unseen check while hidden shows only owner labels and Source (no pattern, tier, frequency, depth, flagged)
{
  const ids = ['lb-1', 'sys:pattern:dp', 'sys:tier:must', 'sys:freq:hot', 'sys:depth', 'sys:flagged', 'sys:source:plan'];
  assert.deepEqual(visibleLabelIds(ids, true), ['lb-1', 'sys:source:plan']);
  assert.deepEqual(visibleLabelIds(ids, false), ids);
}
console.log('labels ok');
