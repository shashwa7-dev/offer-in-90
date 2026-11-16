// Run: node --experimental-strip-types scripts/test-patterns.ts
import assert from 'node:assert/strict';
import { PATTERNS, PROBLEMS, FLAG_SOURCE, ADV_DSA, TOPICS } from '../src/lib/content/dsa.js';
import { addOwnProblem, greenStatus, PATTERN_IDS } from '../src/lib/patterns.ts';

// Task 14: 27 patterns. matrix after graph-traversal, design-ds after trie, math before bits.
const IDS = ['hash-map', 'prefix-sum', 'two-pointers', 'sliding-window', 'stack-monotonic', 'binary-search', 'cyclic-sort', 'fast-slow', 'll-reversal', 'tree-bfs', 'tree-dfs', 'trie', 'design-ds', 'top-k', 'two-heaps', 'k-way-merge', 'backtracking', 'graph-traversal', 'matrix', 'topo-sort', 'union-find', 'shortest-path-mst', 'intervals', 'greedy', 'dp', 'math', 'bits'];
const NEW = ['matrix', 'design-ds', 'math'];
const NO_LINK = ['cyclic-sort', 'hash-map', 'bits', 'shortest-path-mst'];

// pattern list
assert.equal(PATTERNS.length, 27);
assert.deepEqual(PATTERNS.map((p: any) => p.id), IDS);
assert.deepEqual([...PATTERN_IDS], IDS);
for (const p of PATTERNS as any[]) {
  for (const k of ['name', 'topic', 'signal', 'template', 'why', 'complexity', 'notWhen']) assert.ok(typeof p[k] === 'string' && p[k].trim(), `${p.id}.${k}`);
  assert.ok(Array.isArray(p.traps) && p.traps.length >= 1 && p.traps.length <= 2, `${p.id}.traps`);
  if (NO_LINK.includes(p.id)) assert.equal(p.link, null, p.id);
  else assert.ok(typeof p.link === 'string' && p.link.startsWith('https://'), `${p.id}.link`);
}
assert.deepEqual(PATTERNS.find((p: any) => p.id === 'dp').sub, ['fibonacci', '0-1-knapsack', 'unbounded-knapsack', 'lcs-strings', 'palindromes', 'grid']);
const subOf = (id: string) => PATTERNS.find((p: any) => p.id === id).sub;
assert.deepEqual(subOf('binary-search'), ['on-answer']);
assert.deepEqual(subOf('top-k'), ['quickselect']);
assert.deepEqual(subOf('graph-traversal'), ['multi-source-bfs']);
assert.deepEqual(subOf('stack-monotonic'), ['monotonic-queue']);
assert.deepEqual(subOf('two-pointers'), ['dutch-flag', 'strings']);
const pat = (id: string) => PATTERNS.find((p: any) => p.id === id);
assert.deepEqual(NEW.map((id) => [pat(id).name, pat(id).topic]), [['Matrix and simulation', 'Arrays and strings'], ['Design a data structure', 'Design'], ['Math and number tricks', 'Math']]);
for (const id of NEW) assert.ok(typeof pat(id).link === 'string', `${id} has one free link`);

// topics: 13 + Design + Math, in order of first appearance in the teaching order; old names merged away
const TOPIC_LIST = ['Arrays and strings', 'Stack', 'Binary search', 'Linked list', 'Trees', 'Tries', 'Design', 'Heap', 'Backtracking', 'Graphs', 'Intervals', 'Greedy', 'Dynamic programming', 'Math', 'Bit manipulation'];
assert.deepEqual(TOPICS, TOPIC_LIST);
assert.deepEqual([...new Set(PATTERNS.map((p: any) => p.topic))], TOPIC_LIST);
for (const t of ['Arrays and hashing', 'Arrays', 'Advanced graphs']) assert.ok(!PATTERNS.some((p: any) => p.topic === t), `${t} merged`);
assert.deepEqual(FLAG_SOURCE, { name: 'liquidslr/leetcode-company-wise-problems', asOf: '2025-10' });
assert.ok(Array.isArray(ADV_DSA) && ADV_DSA.length === 3);

// problem shape
const slugs = PROBLEMS.map((p: any) => p.slug);
assert.equal(new Set(slugs).size, slugs.length, 'slugs unique');
const DP_SUBS = PATTERNS.find((p: any) => p.id === 'dp').sub;
for (const p of PROBLEMS as any[]) {
  assert.ok(IDS.includes(p.pattern), `${p.slug} pattern`);
  assert.ok(['E', 'M', 'H'].includes(p.d), `${p.slug} d`);
  assert.ok(['must', 'optional'].includes(p.tier), `${p.slug} tier`);
  assert.ok(p.name && p.url.startsWith('https://'), `${p.slug} name/url`);
  if (p.tier === 'optional') assert.ok(p.role === undefined || p.role === 'var', `${p.slug} optional is plain or var`);
  else assert.ok(['teach', 'unseen'].includes(p.role), `${p.slug} must is teach or unseen`);
  if (p.sub !== undefined) assert.ok((pat(p.pattern).sub ?? []).includes(p.sub), `${p.slug} sub ${p.sub}`);
}
void DP_SUBS;
// every declared sub-tag has at least one problem
for (const pt of PATTERNS as any[]) for (const sub of pt.sub ?? []) assert.ok(PROBLEMS.some((p: any) => p.pattern === pt.id && p.sub === sub), `${pt.id}/${sub} has a problem`);
const bySlug = (s: string) => PROBLEMS.find((p: any) => p.slug === s);
assert.equal(bySlug('koko-eating-bananas').sub, 'on-answer');
assert.equal(bySlug('kth-largest-element-in-an-array').sub, 'quickselect');
assert.equal(bySlug('rotting-oranges').sub, 'multi-source-bfs');

// refiles (happy-number stays under fast-slow) and new problems
const REFILE: Record<string, string> = { 'spiral-matrix': 'matrix', 'rotate-image': 'matrix', 'set-matrix-zeroes': 'matrix', 'game-of-life': 'matrix',
  'lru-cache': 'design-ds', 'min-stack': 'design-ds', 'design-twitter': 'design-ds', 'insert-delete-getrandom-o1': 'design-ds',
  'powx-n': 'math', 'multiply-strings': 'math', 'sqrtx': 'math', 'happy-number': 'fast-slow', 'sort-colors': 'two-pointers',
  'find-the-index-of-the-first-occurrence-in-a-string': 'two-pointers' };
for (const [s, p] of Object.entries(REFILE)) assert.equal(bySlug(s)?.pattern, p, `${s} → ${p}`);
assert.equal(bySlug('sort-colors').sub, 'dutch-flag');
assert.equal(bySlug('find-the-index-of-the-first-occurrence-in-a-string').sub, 'strings');
assert.equal(bySlug('find-the-index-of-the-first-occurrence-in-a-string').tier, 'optional', 'KMP is optional');
assert.equal(bySlug('sqrtx').name, 'Sqrt(x)');
assert.equal(bySlug('insert-delete-getrandom-o1').name, 'Insert Delete GetRandom O(1)');

// must-solve set
const must = PROBLEMS.filter((p: any) => p.tier === 'must');
for (const id of IDS) {
  const m = must.filter((p: any) => p.pattern === id);
  assert.equal(m.length, 2, `${id} has ${m.length} must`);
  assert.equal(m.filter((p: any) => p.role === 'teach').length, 1, `${id} teach`);
  assert.equal(m.filter((p: any) => p.role === 'unseen').length, 1, `${id} unseen`);
  assert.ok(PROBLEMS.some((p: any) => p.pattern === id && p.role === 'var'), `${id} keeps a var problem (optional tier)`);
}
assert.equal(must.length, 54, 'must total (v3: teach + unseen per pattern)');
assert.equal(PROBLEMS.filter((p: any) => p.role === 'var').length, 45, '45 var problems');
assert.ok(PROBLEMS.filter((p: any) => p.role === 'var').every((p: any) => p.tier === 'optional'), 'var problems left the must tier');
// demoted to optional to keep the must-solve total ≤ 100 (never a hot/hard-hot problem; nothing deleted)
const DEMOTED = ['longest-repeating-character-replacement', 'middle-of-the-linked-list', 'reverse-linked-list-ii', 'k-closest-points-to-origin', 'find-k-pairs-with-smallest-sums', 'number-of-connected-components-in-an-undirected-graph', 'counting-bits'];
for (const s of DEMOTED) { assert.equal(bySlug(s).tier, 'optional', `${s} demoted`); assert.deepEqual(bySlug(s).flags, [], `${s} not flagged`); }
// flagged problems that left the must tier keep their flags (nothing deleted); the must set is teach + unseen only
const mustSlugs = new Set(must.map((p: any) => p.slug));
for (const s of ['basic-calculator-ii', 'next-permutation', 'merge-sorted-array']) assert.ok(mustSlugs.has(s), `must has ${s}`);
for (const s of ['trapping-rain-water', 'minimum-window-substring', 'merge-k-sorted-lists', 'word-ladder', 'subarray-sum-equals-k']) assert.ok(!mustSlugs.has(s) && bySlug(s).role === 'var', `${s} is optional var`);

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
assert.ok(PATTERN_IDS.includes('matrix' as any) && PATTERN_IDS.includes('design-ds' as any) && PATTERN_IDS.includes('math' as any));
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
