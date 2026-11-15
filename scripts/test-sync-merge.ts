// Run: node --experimental-strip-types scripts/test-sync-merge.ts
import assert from 'node:assert/strict';
import { merge, stamp, sameData } from '../src/lib/sync-merge.ts';

const base = { start: '2026-11-09', kickoff: true, done: {}, flags: {}, notes: {}, tnotes: {}, pages: { pg1: { title: 'A', body: 'x', upd: 1 } }, seenUpdates: {}, meta: {}, updatedAt: 0 };
let t = 1000;
const edit = (s: typeof base, fn: (s: typeof base) => typeof base) => stamp(s, fn(structuredClone(s)), ++t);

// 1. Ticks on two devices both survive
let phone = edit(base, s => ({ ...s, done: { a: 1, b: 1, c: 1 } }));
const laptop = edit(base, s => ({ ...s, notes: { 3: 'good day' } }));
let m = merge(laptop, phone);
assert.deepEqual(Object.keys(m.done).sort(), ['a', 'b', 'c']);
assert.equal(m.notes[3], 'good day');

// 2. Untick on one device beats an older tick elsewhere (no resurrection)
const both = merge(phone, laptop);
phone = edit(both, s => { const d = { ...s.done }; delete d.b; return { ...s, done: d }; });
m = merge(both, phone); // laptop still has b
assert.ok(!('b' in m.done), 'untick must win');
m = merge(m, both); // merging the stale copy again must not bring it back
assert.ok(!('b' in m.done), 'tombstone must survive later merges');

// 3. Same note edited on both: newest wins
const a = edit(both, s => ({ ...s, tnotes: { 'p-two-sum': { title: 'Two Sum', body: 'old', upd: 1 } } }));
const b = edit(a, s => ({ ...s, tnotes: { 'p-two-sum': { title: 'Two Sum', body: 'new', upd: 2 } } }));
assert.equal(merge(a, b).tnotes['p-two-sum'].body, 'new');
assert.equal(merge(b, a).tnotes['p-two-sum'].body, 'new');

// 4. Deleted page stays deleted; a page added elsewhere is kept
const del = edit(both, s => { const p = { ...s.pages }; delete p.pg1; return { ...s, pages: p }; });
const add = edit(both, s => ({ ...s, pages: { ...s.pages, pg9: { title: 'New', body: '', upd: 5 } } }));
m = merge(add, del);
assert.ok(!('pg1' in m.pages) && 'pg9' in m.pages);

// 5. Settings: newest start date wins
const s1 = edit(both, s => ({ ...s, start: '2026-11-10' }));
assert.equal(merge(both, s1).start, '2026-11-10');

// 6. Old data without history: union, nothing lost
const legacyA = { ...base, done: { x: 1 } }, legacyB = { ...base, done: { y: 1 } };
assert.deepEqual(Object.keys(merge(legacyA, legacyB).done).sort(), ['x', 'y']);

// 7. A brand-new device (start = its own today, no history) must not reset the synced start date
const newPhone = { ...base, start: '2026-11-12' };
assert.equal(merge(newPhone, { ...base, start: '2026-11-09' }).start, '2026-11-09');

// 8. Bookmarks saved on two devices both survive; an unsave wins over an older save
const bmBase = { ...base, bookmarks: {} as Record<string, unknown> };
const bmPhone = stamp(bmBase, { ...bmBase, bookmarks: { 'news:a': { title: 'A' } } }, 5000);
const bmLaptop = stamp(bmBase, { ...bmBase, bookmarks: { 'news:b': { title: 'B' } } }, 5001);
const bm = merge(bmLaptop, bmPhone);
assert.deepEqual(Object.keys(bm.bookmarks).sort(), ['news:a', 'news:b']);
const unsaved = stamp(bm, { ...bm, bookmarks: { 'news:b': { title: 'B' } } }, 6000);
assert.ok(!('news:a' in merge(bm, unsaved).bookmarks));

// 9. Merge is stable: merging equal copies changes nothing
assert.ok(sameData(merge(m, m), m));
// 10. Target companies: last writer wins; a side without targets never erases a defined one
const tBase = { ...base, targets: ['Google'] as string[] };
const tLaptop = stamp(tBase, { ...tBase, targets: ['Google'] }, 7000);
const tPhone = stamp(tBase, { ...tBase, targets: ['Amazon'] }, 7001);
assert.deepEqual(merge(tLaptop, tPhone).targets, ['Amazon']);
assert.deepEqual(merge(tPhone, tLaptop).targets, ['Amazon']);
assert.deepEqual(merge(base as typeof tBase, tBase).targets, ['Google']);
assert.deepEqual(merge(tBase, base as typeof tBase).targets, ['Google']);

// 11. Task status map syncs per item; an old state without `status` keeps the other side's
const stBase = { ...base, status: {} as Record<string, string> };
const stPhone = stamp(stBase, { ...stBase, status: { a: 'progress' } }, 8000);
const oldState = { ...base } as typeof stBase; // saved before statuses existed
assert.deepEqual(merge(oldState, stPhone).status, { a: 'progress' });
assert.deepEqual(merge(stPhone, oldState).status, { a: 'progress' });
const cleared = stamp(stPhone, { ...stPhone, status: {} }, 9000);
assert.deepEqual(merge(stPhone, cleared).status, {});

// 12. v5 device syncing with an R1 (v6) device: the new maps from the R1 side survive, the v5 side contributes empty maps
const r1Base = { ...base, modes: {} as Record<string, unknown>, labels: {} as Record<string, unknown>, itemLabels: {} as Record<string, string[]> };
const r1 = stamp(r1Base, {
  ...r1Base,
  labels: { l1: { id: 'l1', name: 'Hard', color: '#f00', kind: 'label' } },
  itemLabels: { 'p-two-sum': ['l1'] },
  modes: { '2026-11-16': { mode: 'grind', cursors: { dsa: 3 } } },
}, 10000);
const v5 = { ...base } as typeof r1Base; // no new maps at all
for (const mm of [merge(v5, r1), merge(r1, v5)]) {
  assert.equal((mm.labels.l1 as { name: string }).name, 'Hard');
  assert.deepEqual(mm.itemLabels['p-two-sum'], ['l1']);
  assert.equal((mm.modes['2026-11-16'] as { mode: string }).mode, 'grind');
}
assert.deepEqual(merge(v5, v5).labels, {}); // empty on both sides

// 13. Renaming a label stamps meta['labels/<id>']
const renamed = stamp(r1, { ...r1, labels: { l1: { id: 'l1', name: 'Tricky', color: '#f00', kind: 'label' } } }, 11000);
assert.equal(renamed.meta['labels/l1'], 11000);

// 14. A deleted label (tombstone) beats an older remote copy, and its item link goes with it
const gone = stamp(r1, { ...r1, labels: {}, itemLabels: {} }, 12000);
m = merge(r1, gone);
assert.ok(!('l1' in m.labels) && !('p-two-sum' in m.itemLabels));
m = merge(gone, r1);
assert.ok(!('l1' in m.labels) && !('p-two-sum' in m.itemLabels));

// 15. Other new maps (own, solves, sundayMode, scores) merge per key
const nBase = { ...base, own: {}, solves: {}, sundayMode: {}, scores: {} } as typeof base & Record<string, Record<string, unknown>>;
const nA = stamp(nBase, { ...nBase, solves: { 'p-x': { unseen: true, at: 1 } }, scores: { 'baseline/dsa': 40 } }, 13000);
const nB = stamp(nBase, { ...nBase, sundayMode: { '2026-11-15': 'rest' }, scores: { 'w3/fe': 70 } }, 13001);
m = merge(nA, nB) as typeof m;
const nm = m as unknown as typeof nBase;
assert.ok('p-x' in nm.solves && nm.sundayMode['2026-11-15'] === 'rest');
assert.deepEqual(Object.keys(nm.scores).sort(), ['baseline/dsa', 'w3/fe']);

console.log('sync-merge: all 15 scenarios pass');
