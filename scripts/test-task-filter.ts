// Run: node --experimental-strip-types scripts/test-task-filter.ts
import assert from 'node:assert/strict';
import { EMPTY_FILTER, isActive, matches, parseFilter, statusCounts, trackOfCat } from '../src/lib/task-filter.ts';

// trackOfCat
const map: Record<string, string | null> = { dsa: 'dsa', fe: 'fe', sd: 'sd', mc: 'mc', proj: 'mc', ai: 'ai', beh: 'career', ux: 'career', fde: 'career', review: null, health: null, update: null, nope: null };
for (const [cat, tr] of Object.entries(map)) assert.equal(trackOfCat(cat), tr, cat);

assert.equal(isActive(EMPTY_FILTER), false);
assert.equal(isActive({ ...EMPTY_FILTER, status: 'done' }), true);
assert.equal(isActive({ ...EMPTY_FILTER, tracks: ['dsa'] }), true);
assert.equal(isActive({ ...EMPTY_FILTER, blocks: ['b'] }), true);
assert.equal(isActive({ ...EMPTY_FILTER, owner: 'own' }), true);
assert.equal(isActive({ ...EMPTY_FILTER, diff: ['E'] }), true);

const t = { id: 'a', cat: 'dsa', own: 'x', diff: 'M' as const };
const none = { id: 'b', cat: 'proj' };
assert.equal(matches(t, 'k', EMPTY_FILTER, {}, {}), true);

// status
assert.equal(matches(t, 'k', { ...EMPTY_FILTER, status: 'done' }, { a: 1 }, {}), true);
assert.equal(matches(t, 'k', { ...EMPTY_FILTER, status: 'done' }, {}, {}), false);
assert.equal(matches(t, 'k', { ...EMPTY_FILTER, status: 'progress' }, {}, { a: 'progress' }), true);
assert.equal(matches(t, 'k', { ...EMPTY_FILTER, status: 'todo' }, {}, { a: 'skipped' }), false);

// tracks OR within, AND across
assert.equal(matches(t, 'k', { ...EMPTY_FILTER, tracks: ['fe', 'dsa'] }, {}, {}), true);
assert.equal(matches(t, 'k', { ...EMPTY_FILTER, tracks: ['fe'] }, {}, {}), false);
assert.equal(matches(none, 'k', { ...EMPTY_FILTER, tracks: ['mc'] }, {}, {}), true);
assert.equal(matches({ id: 'r', cat: 'review' }, 'k', { ...EMPTY_FILTER, tracks: ['dsa'] }, {}, {}), false);
assert.equal(matches(t, 'k', { ...EMPTY_FILTER, tracks: ['dsa'], status: 'done' }, {}, {}), false);

// blocks
assert.equal(matches(t, 'k', { ...EMPTY_FILTER, blocks: ['k', 'z'] }, {}, {}), true);
assert.equal(matches(t, 'k', { ...EMPTY_FILTER, blocks: ['z'] }, {}, {}), false);

// owner
assert.equal(matches(t, 'k', { ...EMPTY_FILTER, owner: 'own' }, {}, {}), true);
assert.equal(matches(t, 'k', { ...EMPTY_FILTER, owner: 'plan' }, {}, {}), false);
assert.equal(matches(none, 'k', { ...EMPTY_FILTER, owner: 'plan' }, {}, {}), true);
assert.equal(matches(none, 'k', { ...EMPTY_FILTER, owner: 'own' }, {}, {}), false);

// diff excludes tasks without diff
assert.equal(matches(t, 'k', { ...EMPTY_FILTER, diff: ['M', 'H'] }, {}, {}), true);
assert.equal(matches(t, 'k', { ...EMPTY_FILTER, diff: ['E'] }, {}, {}), false);
assert.equal(matches(none, 'k', { ...EMPTY_FILTER, diff: ['E', 'M', 'H'] }, {}, {}), false);

// statusCounts
const c = statusCounts([{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }], { a: 1 }, { b: 'progress', c: 'skipped' });
assert.deepEqual(c, { all: 4, todo: 1, progress: 1, done: 1, skipped: 1 });
assert.deepEqual(statusCounts([], {}, {}), { all: 0, todo: 0, progress: 0, done: 0, skipped: 0 });

// parseFilter
const def = { filter: EMPTY_FILTER, groupBy: 'time' };
assert.deepEqual(parseFilter('garbage'), def);
assert.deepEqual(parseFilter(null), def);
assert.deepEqual(parseFilter({ status: 'nope' }), def);
const p = parseFilter({ filter: { status: 'done', tracks: ['dsa', 'zzz'], blocks: ['b', 3], owner: 'own', diff: ['E', 'X'] }, groupBy: 'track' });
assert.deepEqual(p, { filter: { status: 'done', tracks: ['dsa'], blocks: ['b'], owner: 'own', diff: ['E'] }, groupBy: 'track' });
assert.equal(parseFilter({ filter: {}, groupBy: 'bad' }).groupBy, 'time');
assert.notEqual(parseFilter('x').filter, EMPTY_FILTER, 'fresh copy, not shared');

console.log('task-filter: all checks pass');
