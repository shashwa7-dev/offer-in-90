// Run: node --experimental-strip-types scripts/test-dsa-filter.ts
import assert from 'node:assert/strict';
import { EMPTY_DSA_FILTER, filterRows, facetCounts, groupProblems, isFilterEmpty, liveFilter, matchesFilter, parseDsaFilter, tierOf, type DsaFilter, type FilterRow } from '../src/lib/dsa-filter.ts';

const F = (x: Partial<DsaFilter> = {}): DsaFilter => ({ ...EMPTY_DSA_FILTER, ...x });
const R = (x: Partial<FilterRow> & { slug: string }): FilterRow => ({ name: x.slug, d: 'M', pattern: 'p1', tier: 'optional', flags: [], done: false, labels: [], ...x });
const rows: FilterRow[] = [
  R({ slug: 'two-sum', name: 'Two Sum', d: 'E', tier: 'must', flags: ['hot'], done: true, labels: ['sys:freq:hot', 'lb-weak'] }),
  R({ slug: 'trap', name: 'Trapping Rain Water', d: 'H', tier: 'must', flags: ['hot', 'hard-hot'], labels: ['sys:freq:hot', 'sys:freq:hard-hot'] }),
  R({ slug: 'pool', name: 'Pool Problem', d: 'M' }),
  R({ slug: 'mine', name: 'My Own', d: 'H', own: true, labels: ['sys:source:yours'] }),
  // an unstarted unseen check: anonymous, so its name, difficulty and flags never match
  R({ slug: 'secret-hard', name: 'Secret Hard', d: 'H', tier: 'must', hidden: true, flags: ['hot'], labels: ['sys:freq:hot', 'lb-weak'] }),
];
const slugs = (f: DsaFilter) => filterRows(rows, f).map((r) => r.slug);

// empty filter keeps everything
assert.ok(isFilterEmpty(EMPTY_DSA_FILTER));
assert.equal(isFilterEmpty(F({ q: '  ' })), true, 'blank search is empty');
assert.equal(isFilterEmpty(F({ diff: ['E'] })), false);
assert.deepEqual(slugs(F()), rows.map((r) => r.slug));

// tier: must / optional / yours (own problems are Yours, not Optional)
assert.equal(tierOf(rows[3]), 'yours'); assert.equal(tierOf(rows[2]), 'optional'); assert.equal(tierOf(rows[0]), 'must');
assert.deepEqual(slugs(F({ tier: ['optional'] })), ['pool']);
assert.deepEqual(slugs(F({ tier: ['yours', 'optional'] })), ['pool', 'mine']);

// status: done vs to do (anything not done)
assert.deepEqual(slugs(F({ status: ['done'] })), ['two-sum']);
assert.deepEqual(slugs(F({ status: ['todo'] })), ['trap', 'pool', 'mine', 'secret-hard']);

// difficulty and hot: OR within a facet, AND across facets; hidden rows never match them
assert.deepEqual(slugs(F({ diff: ['H'] })), ['trap', 'mine']);
assert.deepEqual(slugs(F({ diff: ['E', 'H'] })), ['two-sum', 'trap', 'mine']);
assert.deepEqual(slugs(F({ hot: ['hot'] })), ['two-sum', 'trap']);
assert.deepEqual(slugs(F({ hot: ['hard-hot'] })), ['trap']);
assert.deepEqual(slugs(F({ hot: ['hot'], diff: ['E'] })), ['two-sum']);

// labels: any of; a hidden row matches owner labels but never a frequency label
assert.deepEqual(slugs(F({ labels: ['lb-weak'] })), ['two-sum', 'secret-hard']);
assert.deepEqual(slugs(F({ labels: ['sys:freq:hot'] })), ['two-sum', 'trap']);

// name search: case-insensitive substring of the name or slug; hidden rows never match
assert.deepEqual(slugs(F({ q: 'rain' })), ['trap']);
assert.deepEqual(slugs(F({ q: 'TWO-SUM' })), ['two-sum']);
assert.deepEqual(slugs(F({ q: 'secret' })), []);
assert.deepEqual(slugs(F({ q: 'hard' })), [], 'the hidden name is not searchable');
assert.equal(matchesFilter(rows[4], F({ q: 'unseen' })), false, 'not even by the anonymous prompt');

// counts: each option counts the rows that would show with that option, given the other facets
let c = facetCounts(rows, F(), ['lb-weak', 'lb-gone']);
assert.deepEqual(c.status, { todo: 4, done: 1 });
assert.deepEqual(c.diff, { E: 1, M: 1, H: 2 }, 'hidden row not counted under its difficulty');
assert.deepEqual(c.tier, { must: 3, optional: 1, yours: 1 });
assert.deepEqual(c.hot, { hot: 2, 'hard-hot': 1 });
assert.deepEqual(c.labels, { 'lb-weak': 2, 'lb-gone': 0 });
c = facetCounts(rows, F({ diff: ['H'] }), []);
assert.deepEqual(c.diff, { E: 1, M: 1, H: 2 }, 'a facet does not filter its own counts');
assert.deepEqual(c.tier, { must: 1, optional: 0, yours: 1 });
assert.deepEqual(c.status, { todo: 2, done: 0 });
c = facetCounts(rows, F({ q: 'two' }), []);
assert.deepEqual(c.tier, { must: 1, optional: 0, yours: 0 }, 'search narrows every count');

// stale label ids (deleted elsewhere) drop out; system labels stay
const lf = liveFilter(F({ labels: ['lb-weak', 'lb-gone', 'sys:freq:hot'] }), (id) => id === 'lb-weak');
assert.deepEqual(lf.labels, ['lb-weak', 'sys:freq:hot']);
const same = F({ labels: ['lb-weak'] });
assert.equal(liveFilter(same, () => true), same, 'unchanged filter is the same object');

// persisted filters: anything malformed falls back to empty, unknown values are dropped
assert.deepEqual(parseDsaFilter(null), EMPTY_DSA_FILTER);
assert.deepEqual(parseDsaFilter('not json'), EMPTY_DSA_FILTER);
assert.deepEqual(parseDsaFilter(JSON.stringify({ status: ['done', 'nope'], diff: ['H', 7], tier: ['yours'], hot: ['hard-hot'], labels: ['lb-a', 3], q: 'x' })),
  { status: ['done'], diff: ['H'], tier: ['yours'], hot: ['hard-hot'], labels: ['lb-a'], q: 'x' });
assert.deepEqual(parseDsaFilter(JSON.stringify({ q: 5, diff: 'H' })), EMPTY_DSA_FILTER);

// grouping: a pattern view, a topic view (by pattern), All problems (by topic, then pattern); empty groups drop out
const PATS = [{ id: 'p1', topic: 'A' }, { id: 'p2', topic: 'B' }, { id: 'p3', topic: 'A' }, { id: 'p4', topic: 'C' }];
const g = [R({ slug: 'a', pattern: 'p1' }), R({ slug: 'b', pattern: 'p2' }), R({ slug: 'c', pattern: 'p3' }), R({ slug: 'd', pattern: 'p1' })];
const shape = (s: ReturnType<typeof groupProblems>) => s.map((t) => [t.topic, t.groups.map((x) => [x.pattern, x.rows.map((r) => r.slug)])]);
assert.deepEqual(shape(groupProblems(g, PATS, { kind: 'pattern', id: 'p1' })), [['A', [['p1', ['a', 'd']]]]]);
assert.deepEqual(shape(groupProblems(g, PATS, { kind: 'topic', topic: 'A' })), [['A', [['p1', ['a', 'd']], ['p3', ['c']]]]]);
assert.deepEqual(shape(groupProblems(g, PATS, { kind: 'all' })), [['A', [['p1', ['a', 'd']], ['p3', ['c']]]], ['B', [['p2', ['b']]]]]);
// a selected pattern with no rows still shows its (empty) group so the card's table has a heading
assert.deepEqual(shape(groupProblems([], PATS, { kind: 'pattern', id: 'p4' })), [['C', [['p4', []]]]]);

console.log('dsa-filter: ok');
