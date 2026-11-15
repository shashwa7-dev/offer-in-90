// Run: node --experimental-strip-types scripts/test-task-filter.ts
import assert from 'node:assert/strict';
import { EMPTY_FILTER, isActive, matches, parseFilter, statusCounts, trackOfCat } from '../src/lib/task-filter.ts';

// trackOfCat
const map: Record<string, string | null> = { dsa: 'dsa', fe: 'fe', sd: 'sd', mc: 'mc', proj: 'mc', ai: 'ai', platform: 'platform', beh: 'career', ux: 'career', fde: 'career', review: null, health: null, update: null, nope: null };
for (const [cat, tr] of Object.entries(map)) assert.equal(trackOfCat(cat), tr, cat);

assert.equal(isActive(EMPTY_FILTER), false);
assert.equal(isActive({ ...EMPTY_FILTER, status: 'done' }), true);
assert.equal(isActive({ ...EMPTY_FILTER, tracks: ['dsa'] }), true);
assert.equal(isActive({ ...EMPTY_FILTER, blocks: ['b'] }), true);
assert.equal(isActive({ ...EMPTY_FILTER, labels: ['lb-1'] }), true);
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

// labels (ANY); Source is a system label group
const IL = { a: ['lb-1'] };
assert.equal(matches(t, 'k', { ...EMPTY_FILTER, labels: ['lb-1'] }, {}, {}, IL), true);
assert.equal(matches(none, 'k', { ...EMPTY_FILTER, labels: ['lb-1'] }, {}, {}, IL), false);
assert.equal(matches(t, 'k', { ...EMPTY_FILTER, labels: ['lb-9', 'lb-1'] }, {}, {}, IL), true, 'ANY');
assert.equal(matches(t, 'k', { ...EMPTY_FILTER, labels: ['lb-1'] }, {}, {}), false, 'no itemLabels given');
assert.equal(matches(t, 'k', { ...EMPTY_FILTER, labels: ['sys:source:yours'] }, {}, {}, {}), true);
assert.equal(matches(none, 'k', { ...EMPTY_FILTER, labels: ['sys:source:yours'] }, {}, {}, {}), false);
assert.equal(matches(none, 'k', { ...EMPTY_FILTER, labels: ['sys:source:plan'] }, {}, {}, {}), true);
const pat = { id: 'p', cat: 'dsa', pattern: 'dp', tier: 'must', flags: ['hot'], depth: true, flagged: true };
for (const id of ['sys:pattern:dp', 'sys:tier:must', 'sys:freq:hot', 'sys:flagged', 'sys:depth']) assert.equal(matches(pat, 'k', { ...EMPTY_FILTER, labels: [id] }, {}, {}, {}), true, id);
assert.equal(matches(pat, 'k', { ...EMPTY_FILTER, labels: ['sys:pattern:trie'] }, {}, {}, {}), false);
// an unseen problem does not reveal its pattern through the filter before Start
const hid = { ...pat, hiddenUntilStart: true };
assert.equal(matches(hid, 'k', { ...EMPTY_FILTER, labels: ['sys:pattern:dp'] }, {}, {}, {}), false);
assert.equal(matches(hid, 'k', { ...EMPTY_FILTER, labels: ['sys:pattern:dp'] }, {}, { p: 'progress' }, {}), true);
// ...nor its frequency, tier, depth or difficulty; Source still matches; skipping keeps it hidden; Start/done reveals
const hidD = { ...hid, diff: 'H' as const };
for (const id of ['sys:freq:hot', 'sys:tier:must', 'sys:depth', 'sys:flagged']) assert.equal(matches(hidD, 'k', { ...EMPTY_FILTER, labels: [id] }, {}, {}, {}), false, `hidden: ${id}`);
assert.equal(matches(hidD, 'k', { ...EMPTY_FILTER, labels: ['sys:source:plan'] }, {}, {}, {}), true, 'hidden: Source still matches');
assert.equal(matches(hidD, 'k', { ...EMPTY_FILTER, labels: ['lb-1'] }, {}, {}, { p: ['lb-1'] }), true, 'hidden: owner labels still match');
assert.equal(matches(hidD, 'k', { ...EMPTY_FILTER, diff: ['H'] }, {}, {}, {}), false, 'hidden: difficulty');
assert.equal(matches(hidD, 'k', { ...EMPTY_FILTER, diff: ['H'] }, {}, { p: 'skipped' }, {}), false, 'skipped stays hidden');
assert.equal(matches(hidD, 'k', { ...EMPTY_FILTER, labels: ['sys:freq:hot'] }, {}, { p: 'skipped' }, {}), false, 'skipped stays hidden (labels)');
assert.equal(matches(hidD, 'k', { ...EMPTY_FILTER, diff: ['H'] }, {}, { p: 'progress' }, {}), true, 'started: difficulty matches');
assert.equal(matches(hidD, 'k', { ...EMPTY_FILTER, labels: ['sys:freq:hot'] }, { p: 1 }, {}, {}), true, 'done: frequency matches');

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
const p = parseFilter({ filter: { status: 'done', tracks: ['dsa', 'zzz'], blocks: ['b', 3], diff: ['E', 'X'], labels: [1, 'x'] }, groupBy: 'track' });
assert.deepEqual(p, { filter: { status: 'done', tracks: ['dsa'], blocks: ['b'], diff: ['E'], labels: ['x'] }, groupBy: 'track' });
// an old saved owner filter becomes the Source label
assert.deepEqual(parseFilter({ filter: { owner: 'own' } }).filter.labels, ['sys:source:yours']);
assert.deepEqual(parseFilter({ filter: { owner: 'plan', labels: ['x'] } }).filter.labels, ['x', 'sys:source:plan']);
assert.equal(parseFilter({ filter: {}, groupBy: 'bad' }).groupBy, 'time');
// old saved filters: an unknown track key (v2 had none for platform; a stray `aib`) is dropped and never throws
assert.deepEqual(parseFilter({ filter: { tracks: ['aib', 'platform', 'fe'] } }).filter.tracks, ['platform', 'fe']);
for (const cat of ['dsa', 'ai', 'fe', 'platform', 'review']) assert.equal(matches({ id: 'x', cat }, 'k', { ...EMPTY_FILTER, tracks: ['aib' as never] }, {}, {}), false, `unknown track matches nothing (${cat})`);
assert.notEqual(parseFilter('x').filter, EMPTY_FILTER, 'fresh copy, not shared');

console.log('task-filter: all checks pass');
