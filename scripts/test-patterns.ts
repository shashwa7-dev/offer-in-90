// Run: node --experimental-strip-types scripts/test-patterns.ts
import assert from 'node:assert/strict';
import { PATTERNS, PROBLEMS, FLAG_SOURCE, ADV_DSA } from '../src/lib/content/dsa.js';
import { addOwnProblem, greenStatus, PATTERN_IDS } from '../src/lib/patterns.ts';

const IDS = ['hash-map', 'prefix-sum', 'two-pointers', 'sliding-window', 'stack-monotonic', 'binary-search', 'cyclic-sort', 'fast-slow', 'll-reversal', 'tree-bfs', 'tree-dfs', 'trie', 'top-k', 'two-heaps', 'k-way-merge', 'backtracking', 'graph-traversal', 'topo-sort', 'union-find', 'shortest-path-mst', 'intervals', 'greedy', 'dp', 'bits'];
const NO_LINK = ['cyclic-sort', 'hash-map', 'bits', 'shortest-path-mst'];

// pattern list
assert.equal(PATTERNS.length, 24);
assert.deepEqual(PATTERNS.map((p: any) => p.id), IDS);
assert.deepEqual([...PATTERN_IDS], IDS);
for (const p of PATTERNS as any[]) {
  for (const k of ['name', 'topic', 'signal', 'template', 'why', 'complexity', 'notWhen']) assert.ok(typeof p[k] === 'string' && p[k].trim(), `${p.id}.${k}`);
  assert.ok(Array.isArray(p.traps) && p.traps.length >= 1 && p.traps.length <= 2, `${p.id}.traps`);
  if (NO_LINK.includes(p.id)) assert.equal(p.link, null, p.id);
  else assert.ok(typeof p.link === 'string' && p.link.startsWith('https://'), `${p.id}.link`);
}
assert.deepEqual(PATTERNS.find((p: any) => p.id === 'dp').sub, ['fibonacci', '0-1-knapsack', 'unbounded-knapsack', 'lcs-strings', 'palindromes', 'grid']);
assert.deepEqual(FLAG_SOURCE, { name: 'liquidslr/leetcode-company-wise-problems', asOf: '2025-10' });
assert.ok(Array.isArray(ADV_DSA) && ADV_DSA.length === 8);

// problem shape
const slugs = PROBLEMS.map((p: any) => p.slug);
assert.equal(new Set(slugs).size, slugs.length, 'slugs unique');
const DP_SUBS = PATTERNS.find((p: any) => p.id === 'dp').sub;
for (const p of PROBLEMS as any[]) {
  assert.ok(IDS.includes(p.pattern), `${p.slug} pattern`);
  assert.ok(['E', 'M', 'H'].includes(p.d), `${p.slug} d`);
  assert.ok(['must', 'optional'].includes(p.tier), `${p.slug} tier`);
  assert.ok(p.name && p.url.startsWith('https://'), `${p.slug} name/url`);
  if (p.tier === 'optional') assert.equal(p.role, undefined, `${p.slug} optional has no role`);
  else assert.ok(['teach', 'var', 'unseen'].includes(p.role), `${p.slug} role`);
  if (p.sub !== undefined) { assert.equal(p.pattern, 'dp'); assert.ok(DP_SUBS.includes(p.sub), p.slug); }
}

// must-solve set
const must = PROBLEMS.filter((p: any) => p.tier === 'must');
for (const id of IDS) {
  const m = must.filter((p: any) => p.pattern === id);
  assert.ok(m.length >= 3 && m.length <= 5, `${id} has ${m.length} must`);
  assert.equal(m.filter((p: any) => p.role === 'teach').length, 1, `${id} teach`);
  assert.equal(m.filter((p: any) => p.role === 'unseen').length, 1, `${id} unseen`);
}
assert.ok(must.length >= 90 && must.length <= 100, `must total ${must.length}`);
const mustSlugs = new Set(must.map((p: any) => p.slug));
for (const s of ['trapping-rain-water', 'minimum-window-substring', 'merge-k-sorted-lists', 'find-median-from-data-stream', 'word-ladder',
  'subarray-sum-equals-k', 'minimum-remove-to-make-valid-parentheses', 'lowest-common-ancestor-of-a-binary-tree', 'basic-calculator-ii', 'next-permutation', 'find-peak-element', 'merge-sorted-array'])
  assert.ok(mustSlugs.has(s), `must has ${s}`);

// coverage: NeetCode 150 (snapshot of the old DSA_TOPICS), gap-fill, frequent extras
const NC150: string[] = ["contains-duplicate","valid-anagram","two-sum","group-anagrams","top-k-frequent-elements","encode-and-decode-strings","product-of-array-except-self","valid-sudoku","longest-consecutive-sequence","valid-palindrome","two-sum-ii-input-array-is-sorted","3sum","container-with-most-water","trapping-rain-water","best-time-to-buy-and-sell-stock","longest-substring-without-repeating-characters","longest-repeating-character-replacement","permutation-in-string","minimum-window-substring","sliding-window-maximum","valid-parentheses","min-stack","evaluate-reverse-polish-notation","generate-parentheses","daily-temperatures","car-fleet","largest-rectangle-in-histogram","binary-search","search-a-2d-matrix","koko-eating-bananas","find-minimum-in-rotated-sorted-array","search-in-rotated-sorted-array","time-based-key-value-store","median-of-two-sorted-arrays","reverse-linked-list","merge-two-sorted-lists","linked-list-cycle","reorder-list","remove-nth-node-from-end-of-list","copy-list-with-random-pointer","add-two-numbers","find-the-duplicate-number","lru-cache","merge-k-sorted-lists","reverse-nodes-in-k-group","invert-binary-tree","maximum-depth-of-binary-tree","diameter-of-binary-tree","balanced-binary-tree","same-tree","subtree-of-another-tree","lowest-common-ancestor-of-a-binary-search-tree","binary-tree-level-order-traversal","binary-tree-right-side-view","count-good-nodes-in-binary-tree","validate-binary-search-tree","kth-smallest-element-in-a-bst","construct-binary-tree-from-preorder-and-inorder-traversal","binary-tree-maximum-path-sum","serialize-and-deserialize-binary-tree","implement-trie-prefix-tree","design-add-and-search-words-data-structure","word-search-ii","kth-largest-element-in-a-stream","last-stone-weight","k-closest-points-to-origin","kth-largest-element-in-an-array","task-scheduler","design-twitter","find-median-from-data-stream","subsets","combination-sum","combination-sum-ii","permutations","subsets-ii","word-search","palindrome-partitioning","letter-combinations-of-a-phone-number","n-queens","number-of-islands","max-area-of-island","clone-graph","walls-and-gates","rotting-oranges","pacific-atlantic-water-flow","surrounded-regions","course-schedule","course-schedule-ii","graph-valid-tree","number-of-connected-components-in-an-undirected-graph","redundant-connection","word-ladder","network-delay-time","min-cost-to-connect-all-points","cheapest-flights-within-k-stops","reconstruct-itinerary","swim-in-rising-water","alien-dictionary","climbing-stairs","min-cost-climbing-stairs","house-robber","house-robber-ii","longest-palindromic-substring","palindromic-substrings","decode-ways","coin-change","maximum-product-subarray","word-break","longest-increasing-subsequence","partition-equal-subset-sum","unique-paths","longest-common-subsequence","best-time-to-buy-and-sell-stock-with-cooldown","coin-change-ii","target-sum","interleaving-string","edit-distance","longest-increasing-path-in-a-matrix","distinct-subsequences","burst-balloons","regular-expression-matching","maximum-subarray","jump-game","jump-game-ii","gas-station","hand-of-straights","merge-triplets-to-form-target-triplet","partition-labels","valid-parenthesis-string","meeting-rooms","insert-interval","merge-intervals","non-overlapping-intervals","meeting-rooms-ii","minimum-interval-to-include-each-query","happy-number","plus-one","rotate-image","spiral-matrix","set-matrix-zeroes","powx-n","multiply-strings","detect-squares","single-number","number-of-1-bits","counting-bits","reverse-bits","missing-number","sum-of-two-integers","reverse-integer"];
assert.equal(NC150.length, 150);
const GAP = ['continuous-subarray-sum', 'range-sum-query-immutable', 'first-missing-positive', 'find-all-numbers-disappeared-in-an-array', 'sliding-window-median', 'ipo', 'kth-smallest-element-in-a-sorted-matrix', 'find-k-pairs-with-smallest-sums', 'next-greater-element-ii', 'online-stock-span', 'middle-of-the-linked-list', 'palindrome-linked-list', 'reverse-linked-list-ii', 'accounts-merge'];
const EXTRA = ['valid-palindrome-ii', 'random-pick-with-weight', 'simplify-path', 'reorganize-string', 'shortest-path-in-binary-matrix', 'majority-element', 'longest-common-prefix', 'nested-list-weight-sum'];
const all = new Set(slugs);
for (const s of [...NC150, ...GAP, ...EXTRA]) assert.ok(all.has(s), `missing ${s}`);
// §2 lists the frequent extras as optional
for (const s of EXTRA) assert.equal(PROBLEMS.find((p: any) => p.slug === s).tier, 'optional', `${s} optional`);
// premium NeetCode slugs keep their neetcode.io link
assert.equal(PROBLEMS.find((p: any) => p.slug === 'alien-dictionary').url, 'https://neetcode.io/problems/foreign-dictionary');

// flags
const HOT = ['two-sum', 'best-time-to-buy-and-sell-stock', 'subarray-sum-equals-k', 'merge-intervals', 'add-two-numbers', 'longest-substring-without-repeating-characters', 'longest-palindromic-substring', '3sum', 'lru-cache', 'number-of-islands', 'container-with-most-water', 'longest-common-prefix', 'valid-parentheses', 'merge-sorted-array', 'majority-element', 'maximum-subarray', 'next-permutation', 'trapping-rain-water', 'median-of-two-sorted-arrays'];
const HARD_HOT = ['trapping-rain-water', 'median-of-two-sorted-arrays', 'merge-k-sorted-lists', 'sliding-window-maximum', 'minimum-window-substring', 'n-queens', 'largest-rectangle-in-histogram', 'find-median-from-data-stream', 'word-ladder', 'binary-tree-maximum-path-sum'];
assert.equal(HOT.length, 19); assert.equal(HARD_HOT.length, 10);
const withFlag = (f: string) => PROBLEMS.filter((p: any) => p.flags.includes(f)).map((p: any) => p.slug).sort();
assert.deepEqual(withFlag('hot'), [...HOT].sort());
assert.deepEqual(withFlag('hard-hot'), [...HARD_HOT].sort());
for (const p of PROBLEMS as any[]) assert.ok(p.flags.every((f: string) => f === 'hot' || f === 'hard-hot'), p.slug);
for (const s of HARD_HOT) assert.equal(PROBLEMS.find((p: any) => p.slug === s).d, 'H', `${s} is hard`);

// own problems
const plan = PROBLEMS as { slug: string }[];
assert.deepEqual(addOwnProblem({}, plan, { url: 'https://leetcode.com/problems/two-sum/', name: 'Two Sum', diff: 'E', pattern: 'hash-map' }), { error: 'in-plan' });
assert.deepEqual(addOwnProblem({}, plan, { url: 'https://leetcode.com/problems/Two-Sum/description/?envType=x', name: 'x', diff: 'E', pattern: 'hash-map' }), { error: 'in-plan' });
assert.deepEqual(addOwnProblem({}, plan, { url: 'https://example.com', name: 'X', diff: 'E', pattern: 'hash-map' }), { error: 'not-leetcode' });
assert.deepEqual(addOwnProblem({}, plan, { url: 'https://example.com/problems/foo', name: 'X', diff: 'E', pattern: 'hash-map' }), { error: 'not-leetcode' });
assert.deepEqual(addOwnProblem({}, plan, { url: 'https://leetcode.com/problems/', name: 'X', diff: 'E', pattern: 'hash-map' }), { error: 'not-leetcode' });
const r1: any = addOwnProblem({}, plan, { url: 'https://leetcode.com/problems/4sum/description/', name: '4Sum', diff: 'M', pattern: 'two-pointers' }, 1000);
assert.deepEqual(r1, { own: { '4sum': { slug: '4sum', url: 'https://leetcode.com/problems/4sum/', name: '4Sum', diff: 'M', pattern: 'two-pointers', at: 1000 } } });
// adding the same slug again keeps one entry
const r2: any = addOwnProblem(r1.own, plan, { url: 'leetcode.com/problems/4sum', name: '4Sum', diff: 'H', pattern: 'two-pointers' }, 2000);
assert.deepEqual(Object.keys(r2.own), ['4sum']);
assert.equal(r2.own['4sum'].diff, 'H');

// green
const DAY = 86_400_000;
const T0 = Date.UTC(2026, 11, 1);
const NOW = T0 + 30 * DAY;
const probs = [
  { slug: 'a', d: 'E', pattern: 'two-pointers', role: 'teach' },
  { slug: 'b', d: 'M', pattern: 'two-pointers', role: 'unseen' },
  { slug: 'c', d: 'M', pattern: 'two-pointers' },
  { slug: 'z', d: 'E', pattern: 'hash-map', role: 'unseen' },
];
const base = {
  'p-a': { unseen: false, at: T0 },
  'p-b': { unseen: true, minutes: 20, at: T0 + DAY },
  'p-c': { unseen: true, at: T0 + 2 * DAY }, // no minutes: self-declared in time
};
let g = greenStatus('two-pointers', probs, {}, { ...base, 'rs:a': { unseen: false, at: T0 + 8 * DAY } }, NOW);
assert.deepEqual(g, { unseenSolved: 2, blankResolve: true, green: true, unseenCheckPassed: true });
g = greenStatus('two-pointers', probs, {}, { ...base, 'rs:a': { unseen: false, at: T0 + 3 * DAY } }, NOW);
assert.equal(g.green, false); assert.equal(g.blankResolve, false); assert.equal(g.unseenSolved, 2);
// an M solved unseen in 30 minutes does not count
g = greenStatus('two-pointers', probs, {}, { ...base, 'p-b': { unseen: true, minutes: 30, at: T0 + DAY }, 'rs:a': { unseen: false, at: T0 + 8 * DAY } }, NOW);
assert.deepEqual(g, { unseenSolved: 1, blankResolve: true, green: false, unseenCheckPassed: false });
// limits are inclusive: E 15, M 25, H 40
g = greenStatus('two-pointers', [{ slug: 'h', d: 'H', pattern: 'two-pointers', role: 'unseen' }], {}, { 'p-h': { unseen: true, minutes: 40, at: T0 } }, NOW);
assert.equal(g.unseenSolved, 1); assert.equal(g.unseenCheckPassed, true);
g = greenStatus('two-pointers', [{ slug: 'e', d: 'E', pattern: 'two-pointers' }], {}, { 'p-e': { unseen: true, minutes: 16, at: T0 } }, NOW);
assert.equal(g.unseenSolved, 0);
// an unseen re-solve does not count as the blank-file re-solve; nor does a re-solve without a first solve
g = greenStatus('two-pointers', probs, {}, { ...base, 'rs:a': { unseen: true, at: T0 + 8 * DAY } }, NOW);
assert.equal(g.blankResolve, false);
g = greenStatus('two-pointers', probs, {}, { 'p-b': base['p-b'], 'p-c': base['p-c'], 'rs:a': { unseen: false, at: T0 + 8 * DAY } }, NOW);
assert.equal(g.blankResolve, false);
// other patterns' solves don't leak in
g = greenStatus('two-pointers', probs, {}, { 'p-z': { unseen: true, at: T0 } }, NOW);
assert.equal(g.unseenSolved, 0);
// own problems count; an own problem that is also a plan slug counts once
const own = {
  q: { slug: 'q', url: 'https://leetcode.com/problems/q/', name: 'Q', diff: 'E' as const, pattern: 'two-pointers', at: T0 },
  b: { slug: 'b', url: 'https://leetcode.com/problems/b/', name: 'B', diff: 'M' as const, pattern: 'two-pointers', at: T0 },
};
g = greenStatus('two-pointers', probs, own, { 'p-b': base['p-b'], 'p-q': { unseen: true, minutes: 10, at: T0 } }, NOW);
assert.equal(g.unseenSolved, 2);
g = greenStatus('two-pointers', probs, { b: own.b }, { 'p-b': base['p-b'] }, NOW);
assert.equal(g.unseenSolved, 1);
// the real dataset: every pattern starts not green
for (const id of IDS) assert.deepEqual(greenStatus(id, PROBLEMS as any, {}, {}, NOW), { unseenSolved: 0, blankResolve: false, green: false, unseenCheckPassed: false });

console.log('patterns: ok');
