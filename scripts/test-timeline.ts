// Run: node --experimental-strip-types scripts/test-timeline.ts
import assert from 'node:assert/strict';
import { bandOf, stageBars, STAGES, TRACKS } from '../src/lib/timeline.ts';
import type { TimelineDay } from '../src/lib/timeline.ts';

// bandOf
assert.equal(bandOf('00:00'), 'morning');
assert.equal(bandOf('11:59'), 'morning');
assert.equal(bandOf('12:00'), 'afternoon');
assert.equal(bandOf('16:59'), 'afternoon');
assert.equal(bandOf('17:00'), 'evening');
assert.equal(bandOf('23:30'), 'evening');

assert.equal(TRACKS.length, 6);
assert.equal(STAGES.length, 16);

const T = (id: string, cat: string, own?: string) => (own ? { id, cat, own } : { id, cat });
const days: TimelineDay[] = [
  { week: 1, type: 'prep', tasks: [T('p-ignored', 'dsa')] }, // prep: no s
  { week: 1, s: 1, type: 'study', tasks: [T('p-two-sum', 'dsa'), T('fe-1', 'fe'), T('s1-news', 'ai'), T('ai-1', 'ai')] },
  { week: 1, s: 2, type: 'study', tasks: [T('p-valid-anagram', 'dsa'), T('sd-2', 'sd'), T('sd-2-d', 'sd'), T('mine', 'dsa', 'u1')] },
  { week: 1, type: 'sunday', tasks: [T('p-sunday', 'dsa')] }, // Sunday: no s
  { week: 2, s: 8, type: 'study', tasks: [T('s8-pat-arrays', 'dsa'), T('mc-8', 'mc'), T('lld-8', 'mc'), T('beh-8', 'beh'), T('ux-8', 'ux')] },
  { week: 3, s: 18, type: 'study', tasks: [T('p-last-tree', 'dsa'), T('ai-18', 'ai'), T('sd-18', 'sd'), T('proj-2', 'proj')] },
  { week: 9, s: 50, type: 'study', tasks: [T('s50-ferev', 'fe'), T('s50-bfe', 'fe')] },
  { week: 10, s: 61, type: 'study', tasks: [T('s61-sdm', 'sd'), T('s61-sdm-r', 'sd'), T('s70-mct', 'mc'), T('beh-61', 'beh'), T('fde-3', 'fde')] },
];
const done = { 'p-two-sum': 1, 'p-last-tree': 1, 's1-news': 1, mine: 1, 'p-sunday': 1, 'p-ignored': 1, 'sd-2': 0 };
const bars = stageBars(days, done);
const get = (label: string) => bars.find((b) => b.label === label);

const arr = get('Arrays → Trees')!;
assert.equal(arr.track, 'dsa');
assert.equal(arr.fromWeek, 1);
assert.equal(arr.toWeek, 3);
assert.equal(arr.total, 4); // two-sum, valid-anagram, pat-arrays, last-tree
assert.equal(arr.done, 2);

assert.equal(get('Graphs, DP, greedy'), undefined); // no tasks -> no bar
assert.equal(get('JS, browser, React, web')!.total, 1); // fe-1 only
assert.equal(get('Revision + quizzes')!.total, 2);
assert.equal(get('Revision + quizzes')!.fromWeek, 9);
assert.equal(get('HLD fundamentals')!.total, 2);
assert.equal(get('Design problems')!.total, 1);
assert.equal(get('Mocks')!.total, 2);
assert.equal(get('Builds + LLD Saturdays')!.total, 2);
assert.equal(get('Flagship product')!.total, 1);
assert.equal(get('Timed rebuilds')!.total, 1);
assert.equal(get('Nets → GPT from scratch')!.total, 1);
assert.equal(get('Papers, RAG, agents, evals')!.total, 1);
assert.equal(get('Resume, LP stories, UX')!.total, 2);
assert.equal(get('Forward-deployed + applications')!.total, 2);

// never counts news, own, prep, Sunday
const all = bars.reduce((n, b) => n + b.total, 0);
assert.ok(!bars.some((b) => b.label === 'Arrays → Trees' && b.total > 4));
assert.equal(bars.filter((b) => b.track === 'ai').reduce((n, b) => n + b.total, 0), 2);

// skipped tasks never count (done wins over skipped)
{
  const sk = stageBars(days, done, { 'p-valid-anagram': 'skipped', 'p-two-sum': 'skipped', 'fe-1': 'skipped' });
  const a2 = sk.find((b) => b.label === 'Arrays → Trees')!;
  assert.equal(a2.total, 3); // valid-anagram dropped; done two-sum stays counted
  assert.equal(a2.done, 2);
  assert.equal(sk.find((b) => b.label === 'JS, browser, React, web'), undefined); // all skipped -> no bar
}

// bars follow STAGES order
const order = bars.map((b) => STAGES.findIndex((s) => s.label === b.label));
assert.deepEqual(order, [...order].sort((a, b) => a - b));
assert.ok(all > 0);

console.log('timeline ok');
