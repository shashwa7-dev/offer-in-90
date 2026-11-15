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

assert.deepEqual(TRACKS.map((t) => [t.key, t.name]), [['dsa', 'DSA'], ['ai', 'AI engineering'], ['sd', 'Systems'], ['mc', 'Product'], ['platform', 'Platform'], ['career', 'Career'], ['fe', 'Frontend']]);
assert.equal(STAGES.length, 16);

const T = (id: string, cat: string, own?: string, pattern?: string) => ({ id, cat, ...(own ? { own } : {}), ...(pattern ? { pattern } : {}) });
const days: TimelineDay[] = [
  { week: 1, type: 'prep', tasks: [T('p-ignored', 'dsa', undefined, 'hash-map')] }, // prep: no s
  { week: 1, s: 1, type: 'study', tasks: [T('dsa:foundations-big-o', 'dsa'), T('fe:closures', 'fe'), T('d:2026-11-16:news', 'ai'), T('ai:3b1b-neural-network', 'ai'), T('aib:python-for-js', 'ai')] },
  { week: 1, s: 2, type: 'study', tasks: [T('p-two-sum', 'dsa', undefined, 'hash-map'), T('sd:internet', 'sd'), T('sd:fe-radio', 'sd'), T('mine', 'dsa', 'u1', 'hash-map'), T('rs:two-sum:3', 'dsa'), T('d:2026-11-17:drill', 'dsa')] },
  { week: 1, type: 'sun', tasks: [T('p-sunday', 'dsa', undefined, 'hash-map')] }, // Sunday: no s
  { week: 2, s: 8, type: 'study', tasks: [T('dsa:card-two-pointers', 'dsa', undefined, 'two-pointers'), T('mc:accordion', 'mc'), T('lld:oop-solid', 'mc'), T('beh:resume', 'beh'), T('ux:laws-of-ux', 'ux')] },
  { week: 3, s: 18, type: 'study', tasks: [T('p-last-tree', 'dsa', undefined, 'tree-dfs'), T('ai:review-rag', 'ai'), T('sd:hld-bitly', 'sd'), T('proj:setup', 'proj')] },
  { week: 7, s: 40, type: 'study', tasks: [T('p-climbing-stairs', 'dsa', undefined, 'dp'), T('dsa:explain-back-dp', 'dsa', undefined, 'dp')] },
  { week: 9, s: 50, type: 'study', tasks: [T('fe:revise-closures-this-bind', 'fe'), T('fe:bfe-1', 'fe')] },
  { week: 10, s: 61, type: 'study', tasks: [T('sdm:fe-news-feed', 'sd'), T('sdm:fe-news-feed:2', 'sd'), T('mc:kanban:timed', 'mc'), T('fde:stage1-intro', 'fde'), T('dsa:timed-meta-1', 'dsa'), T('adv:segment-tree', 'dsa')] },
  { week: 11, s: 62, type: 'study', tasks: [{ ...T('p-two-sum', 'dsa', undefined, 'hash-map'), superseded: true as const }] }, // history only
];
const done = { 'p-two-sum': 1, 'p-last-tree': 1, 'd:2026-11-16:news': 1, mine: 1, 'p-sunday': 1, 'p-ignored': 1, 'sd:internet': 0 };
const bars = stageBars(days, done);
const get = (label: string) => bars.find((b) => b.label === label);

const arr = get('Foundations, arrays → tries')!;
assert.equal(arr.track, 'dsa');
assert.equal(arr.fromWeek, 1);
assert.equal(arr.toWeek, 3);
assert.equal(arr.total, 4); // foundations, two-sum, card-two-pointers, last-tree (not own, re-solve, drill, superseded)
assert.equal(arr.done, 2);

assert.equal(get('Heaps, graphs, DP, greedy')!.total, 2);
assert.equal(get('Heaps, graphs, DP, greedy')!.fromWeek, 7);
assert.equal(get('Advanced + timed sets + OA')!.total, 2);
assert.equal(get('JS, browser, React, web')!.total, 1);
assert.equal(get('Revision + quizzes')!.total, 2);
assert.equal(get('Revision + quizzes')!.fromWeek, 9);
assert.equal(get('Frontend system design')!.total, 2);
assert.equal(get('HLD concepts + design problems')!.total, 1);
assert.equal(get('Mocks')!.total, 2);
assert.equal(get('Builds + LLD Saturdays')!.total, 2);
assert.equal(get('Flagship product')!.total, 1);
assert.equal(get('Timed rebuilds')!.total, 1);
assert.equal(get('AI build')!.total, 1);
assert.equal(get('Papers, courses, AI design')!.total, 1);
assert.equal(get('Explain-it-back reviews')!.total, 1);
assert.equal(get('Resume, LP stories, UX')!.total, 2);
assert.equal(get('Forward-deployed')!.total, 1);

// never counts news, own, prep, Sunday, re-solves, drills or superseded copies
const all = bars.reduce((n, b) => n + b.total, 0);
assert.equal(bars.filter((b) => b.track === 'ai').reduce((n, b) => n + b.total, 0), 3);

// skipped tasks never count (done wins over skipped)
{
  const sk = stageBars(days, done, { 'dsa:card-two-pointers': 'skipped', 'p-two-sum': 'skipped', 'fe:closures': 'skipped' });
  const a2 = sk.find((b) => b.label === 'Foundations, arrays → tries')!;
  assert.equal(a2.total, 3); // card dropped; done two-sum stays counted
  assert.equal(a2.done, 2);
  assert.equal(sk.find((b) => b.label === 'JS, browser, React, web'), undefined); // all skipped -> no bar
}

// bars follow STAGES order
const order = bars.map((b) => STAGES.findIndex((s) => s.label === b.label));
assert.deepEqual(order, [...order].sort((a, b) => a - b));
assert.ok(all > 0);

console.log('timeline ok');
