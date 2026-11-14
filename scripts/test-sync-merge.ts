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
console.log('sync-merge: all 9 scenarios pass');
