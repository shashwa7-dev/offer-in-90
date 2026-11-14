// Run: node --experimental-strip-types scripts/test-search.ts
import assert from 'node:assert/strict';
import { buildIndex, search } from '../src/lib/search.ts';
import type { Hit } from '../src/lib/search.ts';

const now = new Date(2026, 10, 14, 12).getTime();
const days = Array.from({ length: 92 }, (_, i) => ({
  i, no: i, date: new Date(2026, 10, 1 + i),
  tasks: i === 0 ? [{ id: 'k-wo', text: 'Workout', cat: 'health' }]
    : i === 3 ? [{ id: 'p-two-sum', text: 'Two Sum', cat: 'dsa', track: 'DSA' }, { id: 'fe-3', text: 'Event loop basics', cat: 'fe', track: 'Frontend & CS' }]
    : i === 10 ? [{ id: 'p-two-sum@10', text: 'Two Sum', cat: 'dsa', track: 'DSA' }, { id: 'u-own1', text: 'Call recruiter Zeta', cat: 'beh', track: 'Career', own: 'own1' }]
    : i === 12 ? [{ id: 'sd-12', text: 'Design a URL shortener', cat: 'sd', track: 'System design' }]
    : [],
}));
const pages = {
  pg1: { title: 'Pattern cheat sheet', body: 'Sliding window and two pointers. Monotonic stack.', upd: now - 3600e3 },
  pg2: { title: 'Sum tricks', body: 'Prefix sums.', upd: now - 60e3 },
};
const tnotes = {
  'p-two-sum': { title: 'Two Sum', body: 'Use a hash map of value to index.', upd: now - 7200e3 },
  'fe-3': { title: 'Event loop basics', body: '   ', upd: now },
};
const ix = buildIndex({ days, pages, tnotes, posts: [{ company: 'Google', title: 'Google L4 frontend loop', url: 'https://www.leetcode.com/discuss/1' }], reads: [{ id: 'n1', title: 'React compiler ships', url: 'https://react.dev/blog/x', source: 'React blog' }], now });

const group = (q: string, g: string) => search(ix, q).find(x => x.group === g)?.hits ?? [];
const titles = (hs: Hit[]) => hs.map(h => h.title);

// empty query → nothing
assert.deepEqual(search(ix, ''), []);
assert.deepEqual(search(ix, '   '), []);

// task hit shape: Day N · Track, duplicates kept, earliest day first
const ts = group('two sum', 'Tasks');
assert.deepEqual(ts.map(h => h.kind === 'task' && [h.id, h.dayIdx, h.meta]), [['p-two-sum', 3, 'Day 3 · DSA'], ['p-two-sum@10', 10, 'Day 10 · DSA']]);
// no track → just "Day N"
assert.equal(group('workout', 'Tasks')[0]?.meta, 'Day 0');

// multi-word AND (case-insensitive): every word must match
assert.deepEqual(titles(group('EVENT loop', 'Tasks')), ['Event loop basics']);
assert.deepEqual(group('event shortener', 'Tasks'), []);
// words may match across title and meta
assert.deepEqual(titles(group('design url', 'Tasks')), ['Design a URL shortener']);

// title match ranks above a body-only match: pg1 has "two" only in its body, the "Two Sum" task note in its
// title, so the note ranks first although pg1 was updated more recently
const ns = group('two', 'Notes');
assert.deepEqual(ns.map(h => h.kind === 'note' && h.key), ['p-two-sum', 'pg1']);
assert.equal(ns[0].kind === 'note' && ns[0].noteKind, 'task');
assert.equal(ns[0].meta, 'Note');
assert.equal(ns[1].kind === 'note' && ns[1].noteKind, 'page');
assert.equal(ns[1].meta, 'Page · 1 h ago');
// equal scores: most recent update first ("sum" in both titles: pg2 newer than the task note)
assert.deepEqual(group('sum', 'Notes').map(h => h.kind === 'note' && h.key), ['pg2', 'p-two-sum']);
// task notes with an empty body are not indexed
assert.deepEqual(group('event', 'Notes'), []);

// notes body search finds a page by a body word
assert.deepEqual(group('monotonic', 'Notes').map(h => h.kind === 'note' && h.key), ['pg1']);

// own tasks are searchable
assert.deepEqual(group('recruiter', 'Tasks').map(h => h.kind === 'task' && h.id), ['u-own1']);

// numeric query adds "Go to Day N" when that day exists, none out of range
const g30 = group('30', 'Go to');
assert.deepEqual(g30.map(h => h.kind === 'day' && [h.dayIdx, h.title]), [[30, 'Go to Day 30']]);
assert.deepEqual(group('120', 'Go to'), []);
assert.deepEqual(group('0', 'Go to').map(h => h.kind === 'day' && h.dayIdx), [0]);
const short = buildIndex({ days: days.slice(0, 20), pages: {}, tnotes: {}, posts: [], reads: [] });
assert.deepEqual(search(short, '30'), []);
// prep day off: Day 1 is at index 0
const shifted = buildIndex({ days: days.slice(1).map((d, i) => ({ ...d, i, no: i + 1 })), pages: {}, tnotes: {}, posts: [], reads: [] });
assert.deepEqual(search(shifted, '1').find(x => x.group === 'Go to')?.hits.map(h => h.kind === 'day' && h.dayIdx), [0]);
assert.equal(search(shifted, '0').find(x => x.group === 'Go to'), undefined);

// posts and reads
const ps = group('google frontend', 'Interviews');
assert.deepEqual(ps.map(h => h.kind === 'post' && [h.url, h.meta]), [['https://www.leetcode.com/discuss/1', '#Google · leetcode.com']]);
const rs = group('react', 'Reads');
assert.deepEqual(rs.map(h => h.kind === 'read' && [h.id, h.url]), [['n1', 'https://react.dev/blog/x']]);

// index built with no posts or reads still returns task and note hits
const bare = buildIndex({ days, pages, tnotes, posts: [], reads: [] });
const groups = search(bare, 'two').map(g => g.group);
assert.deepEqual(groups, ['Tasks', 'Notes']);

// per-group cap (default 6) and explicit limit
const many = buildIndex({ days: Array.from({ length: 10 }, (_, i) => ({ i, no: i + 1, date: new Date(2026, 0, i + 1), tasks: [{ id: `t${i}`, text: `Graph drill ${i}`, cat: 'dsa' }] })), pages: {}, tnotes: {}, posts: [], reads: [] });
assert.equal(search(many, 'graph')[0].hits.length, 6);
assert.equal(search(many, 'graph', 3)[0].hits.length, 3);
assert.deepEqual(search(many, 'graph')[0].hits.map(h => h.kind === 'task' && h.dayIdx), [0, 1, 2, 3, 4, 5]);

// "Go to" comes first so Enter on a number goes to the day
assert.equal(search(ix, '3')[0].group, 'Go to');

console.log('search: all tests passed');
