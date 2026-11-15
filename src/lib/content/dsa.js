/* eslint-disable */
// DSA content (roadmap v2 §2, Task 14): 27 patterns in teaching order, the tiered and flagged problem set, advanced topics.
// Problem IDs stay `p-<slug>`. Card text is short and follows each pattern's linked explainer.

const LC = s => `https://leetcode.com/problems/${s}/`;
const NC = s => `https://neetcode.io/problems/${s}`;
const HI = p => `https://www.hellointerview.com/learn/code/${p}`;

// Card fields: signal (cue in the question), template (one line), why (the invariant), complexity, traps (1–2), notWhen, link.
export const PATTERNS = [
  { id: 'hash-map', name: 'Hash map and counting', topic: 'Arrays and strings', link: null,
    signal: 'Need to find a pair, a duplicate, or a count in one pass; "have I seen X before?"',
    template: 'for x in input: check map for the complement/key, then record x (count or index).',
    why: 'The map holds every earlier element, so each lookup answers "seen before?" in O(1).',
    complexity: 'O(n) time, O(n) space.',
    traps: ['Inserting before checking (pairs an element with itself).', 'Using a mutable or unsorted key for grouping (sort or count the letters first).'],
    notWhen: 'Input is sorted and O(1) space is wanted: use two pointers.' },
  { id: 'prefix-sum', name: 'Prefix sum', topic: 'Arrays and strings', link: HI('prefix-sum/overview'),
    signal: 'Many range-sum queries, or "subarray whose sum equals / is divisible by k".',
    template: 'pre[i+1] = pre[i] + a[i]; sum(l..r) = pre[r+1] - pre[l]; for "sum = k" count earlier prefixes equal to pre - k in a map.',
    why: 'Any subarray sum is the difference of two prefix sums.',
    complexity: 'O(n) build, O(1) per query; O(n) space.',
    traps: ['Forget to seed the map with prefix 0 (count 1).', 'Off-by-one between pre[r+1] and pre[l].'],
    notWhen: 'All numbers are positive and you need a window: a sliding window uses O(1) space.' },
  { id: 'two-pointers', name: 'Two pointers', topic: 'Arrays and strings', link: HI('two-pointers/overview'),
    sub: ['dutch-flag', 'strings'],
    signal: 'Sorted array or string, pairs/triplets with a target, palindromes, in-place partition.',
    template: 'l = 0, r = n - 1; while l < r: compare a[l] + a[r] with target and move the pointer that can improve it.',
    why: 'Sortedness tells you which pointer\'s every remaining pairing is impossible, so each step discards a whole row of pairs.',
    complexity: 'O(n) per pass (O(n log n) if you sort first), O(1) space.',
    traps: ['Skipping duplicates after a match in 3Sum.', 'Moving the wrong pointer when values are equal.'],
    notWhen: 'Input is unsorted and order matters (indices must be returned): use a hash map.' },
  { id: 'sliding-window', name: 'Sliding window', topic: 'Arrays and strings', link: HI('sliding-window/variable-length'),
    signal: 'Longest/shortest/count of a contiguous subarray or substring that satisfies a condition.',
    template: 'for r in range(n): add a[r]; while window invalid: remove a[l], l += 1; update answer.',
    why: 'If a window is invalid, every larger window with the same left end is too, so l only moves forward.',
    complexity: 'O(n) time (each index enters and leaves once), O(k) space for the window state.',
    traps: ['Updating the answer before the window is valid again.', 'Negative numbers break the "shrink restores validity" rule.'],
    notWhen: 'Elements can be negative and the condition is a sum: use prefix sum + hash map.' },
  { id: 'stack-monotonic', name: 'Stack and monotonic stack/queue', topic: 'Stack', link: HI('stack/monotonic-stack'),
    sub: ['monotonic-queue'],
    signal: 'Matching brackets, nested expressions, or "next greater/smaller element", spans, max in every window.',
    template: 'for i: while stack and a[stack.top] < a[i]: pop j and resolve answer[j] = i; push i.',
    why: 'The stack keeps only candidates still waiting for their answer, in sorted order, so each index is pushed and popped once.',
    complexity: 'O(n) time, O(n) space.',
    traps: ['Storing values instead of indices when you need distances or widths.', 'Forgetting to flush what is left on the stack at the end.'],
    notWhen: 'You need arbitrary range min/max queries, not next-greater: use a sparse table or segment tree.' },
  { id: 'binary-search', name: 'Modified binary search', topic: 'Binary search', link: HI('binary-search/overview'),
    sub: ['on-answer'],
    signal: 'Sorted or rotated input, a monotonic yes/no condition, or "minimum value such that…" (search on the answer).',
    template: 'lo, hi = bounds; while lo < hi: mid = (lo + hi) // 2; if ok(mid): hi = mid else: lo = mid + 1.',
    why: 'ok() is monotonic (false…false true…true), so each check halves the range that can hold the first true.',
    complexity: 'O(log n) checks, times the cost of ok().',
    traps: ['Infinite loop from mid rounding with lo = mid.', 'Wrong bounds when searching on the answer (min and max possible answer).'],
    notWhen: 'No monotonic condition exists: scan or use another pattern.' },
  { id: 'cyclic-sort', name: 'Cyclic sort', topic: 'Arrays and strings', link: null,
    signal: 'Array of n numbers in range 1..n (or 0..n); find missing, duplicate or misplaced numbers in O(1) space.',
    template: 'i = 0; while i < n: j = a[i] - 1; if a[i] in range and a[j] != a[i]: swap(a[i], a[j]) else: i += 1. Then scan for a[i] != i + 1.',
    why: 'Each swap puts one value in its home slot for good, so there are at most n swaps.',
    complexity: 'O(n) time, O(1) extra space.',
    traps: ['Swapping when the target already holds the same value (infinite loop).', 'Not ignoring values outside 1..n (First Missing Positive).'],
    notWhen: 'Values are not bounded by n, or the array must not be modified: use a hash set.' },
  { id: 'fast-slow', name: 'Fast and slow pointers', topic: 'Linked list', link: HI('linked-list/overview'),
    signal: 'Cycle detection, the middle of a list, or a sequence x → f(x) that may loop.',
    template: 'slow = fast = head; while fast and fast.next: slow = slow.next; fast = fast.next.next; if slow is fast: cycle.',
    why: 'Inside a cycle the gap between them shrinks by one each step, so they must meet.',
    complexity: 'O(n) time, O(1) space.',
    traps: ['Null checks on fast.next before stepping twice.', 'Finding the cycle start needs a second phase from head.'],
    notWhen: 'Extra memory is fine and the code must be simple: a visited set also works.' },
  { id: 'll-reversal', name: 'In-place linked-list reversal', topic: 'Linked list', link: HI('linked-list/overview'),
    signal: 'Reverse a list or a part of it, reorder or compare halves, without extra memory.',
    template: 'prev = None; cur = head; while cur: nxt = cur.next; cur.next = prev; prev = cur; cur = nxt.',
    why: 'Each step flips one pointer while prev already heads the reversed part and cur heads the rest.',
    complexity: 'O(n) time, O(1) space.',
    traps: ['Losing the rest of the list by not saving next first.', 'Not reconnecting the reversed sub-list to its neighbours (use a dummy head).'],
    notWhen: 'You only need to read the list backwards: a stack or recursion is simpler.' },
  { id: 'tree-bfs', name: 'Tree BFS', topic: 'Trees', link: HI('breadth-first-search/fundamentals'),
    signal: 'Level by level, the leftmost/rightmost per level, or the shallowest node.',
    template: 'q = [root]; while q: size = len(q); for _ in range(size): node = q.popleft(); visit; push children.',
    why: 'The queue holds exactly one level at the start of each outer loop, so levels are processed in order.',
    complexity: 'O(n) time, O(width) space.',
    traps: ['Not snapshotting the level size before the inner loop.', 'Pushing null children.'],
    notWhen: 'The answer depends on whole subtrees (heights, paths): use DFS.' },
  { id: 'tree-dfs', name: 'Tree DFS', topic: 'Trees', link: HI('depth-first-search/fundamentals'),
    signal: 'Path sums, heights, diameters, validation, ancestors: anything built from children\'s answers.',
    template: 'def dfs(node): if not node: return base; l = dfs(node.left); r = dfs(node.right); update global; return combine(node, l, r).',
    why: 'Each subtree\'s answer is complete when it returns, so the parent combines finished results.',
    complexity: 'O(n) time, O(h) stack space.',
    traps: ['Mixing "what I return to my parent" with "the best answer through me".', 'Validating a BST with only the parent instead of min/max bounds.'],
    notWhen: 'You need the nearest or shallowest node, or a per-level result: use BFS.' },
  { id: 'trie', name: 'Trie', topic: 'Tries', link: HI('trie/overview'),
    signal: 'Many words with prefix queries, autocomplete, or word search over a grid.',
    template: 'node = root; for ch in word: node = node.children.setdefault(ch, Node()); node.end = True.',
    why: 'Words sharing a prefix share a path, so a prefix check costs its length, not the number of words.',
    complexity: 'O(L) per insert/search; O(total characters) space.',
    traps: ['Forgetting the end-of-word flag (prefix vs whole word).', 'Not pruning found words in Word Search II (TLE).'],
    notWhen: 'Only exact-match lookups are needed: a hash set is simpler.' },
  // Task 14 (2026-11-15): three patterns added. Links checked with curl on 2026-11-15 (200).
  { id: 'design-ds', name: 'Design a data structure', topic: 'Design', link: 'https://www.geeksforgeeks.org/system-design/lru-cache-implementation/',
    signal: '"Implement a class" whose operations must each be O(1) or O(log n): get/put with eviction, min in O(1), a random element, a feed.',
    template: 'List the operations and their target costs; pick one structure per need and keep them in sync: hash map + doubly linked list (LRU), stack of (value, min) pairs, array + index map (delete by swapping with the last).',
    why: 'Each structure answers one operation fast; updating all of them on every write keeps every invariant true, so every read stays cheap.',
    complexity: 'Usually O(1) per operation (O(log n) with a heap), O(n) space.',
    traps: ['Forgetting to update the second structure on delete or evict (stale map entries).', 'Edge cases: capacity 1, a repeated key, removing the last element.'],
    notWhen: 'Only one operation matters: use the single structure that answers it (heap, hash map) directly.' },
  { id: 'top-k', name: 'Top K (heap)', topic: 'Heap', link: HI('heap/overview'),
    sub: ['quickselect'],
    signal: '"K largest / smallest / most frequent / closest".',
    template: 'min-heap of size k: for x: push x; if len > k: pop. The heap holds the top k.',
    why: 'The heap root is the weakest of the current best k, so anything worse is discarded at once.',
    complexity: 'O(n log k) time, O(k) space.',
    traps: ['Using a max-heap of all n (O(n log n)).', 'Wrong comparator for ties or tuples.'],
    notWhen: 'k is close to n or values are small integers: sort, or bucket sort by count.' },
  { id: 'two-heaps', name: 'Two heaps', topic: 'Heap', link: HI('heap/overview'),
    signal: 'Running median, or splitting values into a smaller half and a larger half as they arrive.',
    template: 'max-heap low, min-heap high; push to low, move low.top to high, rebalance so len(low) >= len(high).',
    why: 'Every value in low is ≤ every value in high and the sizes differ by at most 1, so the median sits at the tops.',
    complexity: 'O(log n) per add, O(1) per median.',
    traps: ['Forgetting to rebalance after each insert.', 'Removing from the middle of a heap (sliding median needs lazy deletion).'],
    notWhen: 'All data is known up front and you need one median: quickselect.' },
  { id: 'k-way-merge', name: 'K-way merge', topic: 'Heap', link: HI('heap/overview'),
    signal: 'Several sorted lists/arrays/rows; merge them or find the k-th smallest across them.',
    template: 'heap of (value, list, index) for each list head; pop min, output it, push that list\'s next element.',
    why: 'The global minimum is always one of the current heads, and the heap holds exactly the heads.',
    complexity: 'O(N log k) for N elements across k lists, O(k) space.',
    traps: ['Pushing nodes without a tiebreaker (incomparable objects).', 'Pushing every element up front instead of just the heads.'],
    notWhen: 'There are only two lists: a plain two-pointer merge.' },
  { id: 'backtracking', name: 'Subsets and backtracking', topic: 'Backtracking', link: HI('backtracking/overview'),
    signal: '"All" subsets, permutations, combinations, partitions, or placements under constraints.',
    template: 'def bt(start, path): record/check path; for i in choices(start): choose i; bt(next, path); undo i.',
    why: 'The recursion tree enumerates each choice sequence once; undo restores state for the next branch.',
    complexity: 'Exponential: O(2^n) subsets, O(n!) permutations, times the copy cost.',
    traps: ['Appending path instead of a copy.', 'Duplicates: sort first and skip equal siblings.'],
    notWhen: 'Only a count or best value is asked and subproblems repeat: use DP.' },
  { id: 'graph-traversal', name: 'Graph traversal and islands', topic: 'Graphs', link: HI('depth-first-search/fundamentals'),
    sub: ['multi-source-bfs'],
    signal: 'Grid of cells or nodes and edges: count components, flood fill, shortest steps in an unweighted graph.',
    template: 'for each unvisited cell: count += 1; DFS/BFS marking neighbours visited. Multi-source BFS: push all sources first.',
    why: 'Marking on visit guarantees each node is expanded once; BFS reaches nodes in order of distance.',
    complexity: 'O(V + E) (O(rows × cols) for grids).',
    traps: ['Marking visited on pop instead of push (duplicates in the queue).', 'Recursion depth on large grids.'],
    notWhen: 'Edges have different weights: Dijkstra.' },
  { id: 'matrix', name: 'Matrix and simulation', topic: 'Arrays and strings', link: 'https://www.techinterviewhandbook.org/algorithms/matrix/',
    signal: 'A 2D grid you walk in a fixed order (spiral, diagonal), rotate or transform in place, or update by rules that read the old state.',
    template: 'Spiral: keep top/bottom/left/right bounds and shrink one after each side. Rotate: transpose, then reverse each row. Rule updates: keep old and new state in the same cell (two bits) or work on a copy.',
    why: 'Shrinking bounds visit each cell exactly once; transpose + reverse is a 90° rotation; storing both states means no update reads an already-changed neighbour.',
    complexity: 'O(rows × cols) time; O(1) extra space for the in-place versions.',
    traps: ['Off-by-one when a single row or column is left (the spiral visits it twice).', 'Overwriting a cell before its neighbours have read the old value (Game of Life, set zeroes).'],
    notWhen: 'You need connected regions or the fewest steps across the grid: graph traversal (DFS/BFS).' },
  { id: 'topo-sort', name: 'Topological sort', topic: 'Graphs', link: HI('graphs/topological-sort'),
    signal: 'Prerequisites, dependencies, build order, or "is there a cycle in this directed graph?"',
    template: 'indegree for each node; queue all with 0; pop u, append to order, decrement neighbours, push new zeros.',
    why: 'A node with indegree 0 has no unmet dependency; if some nodes never reach 0 there is a cycle.',
    complexity: 'O(V + E).',
    traps: ['Edge direction reversed (course → prereq).', 'Forgetting isolated nodes with no edges.'],
    notWhen: 'The graph is undirected: cycles and components use union find or DFS.' },
  { id: 'union-find', name: 'Union find', topic: 'Graphs', link: 'https://cp-algorithms.com/data_structures/disjoint_set_union.html',
    signal: 'Dynamic connectivity: merging groups, counting components, detecting a redundant edge.',
    template: 'find(x): path-compress to root; union(a, b): attach smaller rank under larger; same root = connected.',
    why: 'Each set is a tree with one root; union by rank and path compression keep trees almost flat.',
    complexity: 'Near O(1) amortised per operation (inverse Ackermann).',
    traps: ['Comparing x with parent[x] instead of the roots.', 'Forgetting to count components down on each successful union.'],
    notWhen: 'You need paths or distances, not just connectivity: BFS/DFS.' },
  { id: 'shortest-path-mst', name: 'Shortest path and MST', topic: 'Graphs', link: null,
    signal: 'Weighted edges: cheapest route, network delay, or connect all points at minimum cost.',
    template: 'Dijkstra: heap of (dist, node); pop, skip if stale, relax neighbours. MST: Prim (heap) or Kruskal (sorted edges + union find).',
    why: 'With non-negative weights the popped node\'s distance is final; MST: the cheapest edge crossing any cut is safe.',
    complexity: 'Dijkstra and Prim O(E log V); Kruskal O(E log E).',
    traps: ['Not skipping stale heap entries.', 'Negative weights or a stop limit (use Bellman-Ford / BFS by stops).'],
    notWhen: 'All edges weigh the same: plain BFS.' },
  { id: 'intervals', name: 'Intervals', topic: 'Intervals', link: HI('intervals/overview'),
    signal: 'Ranges with start/end: merge, insert, overlaps, rooms needed.',
    template: 'sort by start; for each: if start <= last.end: last.end = max(last.end, end) else: append.',
    why: 'After sorting by start, an interval can only overlap the last merged one.',
    complexity: 'O(n log n) for the sort, O(n) after.',
    traps: ['Touching intervals ([1,2],[2,3]): decide if they overlap.', 'Sorting by start when the greedy needs end (non-overlapping).'],
    notWhen: 'You need overlaps at arbitrary points with many queries: line sweep or difference array.' },
  { id: 'greedy', name: 'Greedy', topic: 'Greedy', link: HI('greedy/overview'),
    signal: 'One pass with a local best choice: max reach, running best, earliest end, partition points.',
    template: 'sort or scan once; keep the best-so-far state; take the locally best choice at each step.',
    why: 'An exchange argument shows some optimal answer agrees with the greedy choice at every step.',
    complexity: 'Usually O(n) or O(n log n).',
    traps: ['No proof: test a counterexample before trusting it.', 'Resetting the running sum at the wrong moment (Kadane).'],
    notWhen: 'A local choice can block a better later one (coin change with odd coins): use DP.' },
  { id: 'dp', name: 'Dynamic programming', topic: 'Dynamic programming', link: HI('dynamic-programming/fundamentals'),
    sub: ['fibonacci', '0-1-knapsack', 'unbounded-knapsack', 'lcs-strings', 'palindromes', 'grid'],
    signal: '"Count the ways", "min/max cost", "is it possible", where choices overlap into repeated subproblems.',
    template: 'define state dp[i] (or dp[i][j]); write the recurrence from smaller states; set base cases; fill in order (or memoise).',
    why: 'Optimal substructure: each state\'s best answer is built from best answers of smaller states, each computed once.',
    complexity: 'O(number of states × transitions per state).',
    traps: ['A state that does not capture everything the future needs.', 'Wrong loop order (0/1 knapsack iterates capacity backwards).'],
    notWhen: 'Subproblems do not repeat (plain recursion/backtracking), or a greedy choice is provably safe.' },
  { id: 'math', name: 'Math and number tricks', topic: 'Math', link: 'https://www.techinterviewhandbook.org/algorithms/math/',
    signal: 'Powers, roots, arithmetic on number strings, digits, primes or GCD, where halving or a formula beats simulating.',
    template: 'Fast power: while n: if n & 1: res *= x; x *= x; n >>= 1. Digits: d = n % 10, n = floor(n / 10). String arithmetic: right to left with a carry, as on paper.',
    why: 'Squaring halves the exponent at each step, so x^n takes O(log n) multiplications; digit-by-digit arithmetic is exact at any length.',
    complexity: 'O(log n) for fast power and a binary-searched root; O(m × n) for schoolbook multiplication.',
    traps: ['Negative exponents and overflow (−2^31 has no 32-bit negation).', 'Leading zeros and the final carry in string arithmetic.'],
    notWhen: 'The answer counts choices with overlaps: DP or combinatorics, not a closed formula.' },
  { id: 'bits', name: 'Bits and XOR', topic: 'Bit manipulation', link: null,
    signal: 'Find the single/missing number, count set bits, add without +, or O(1) space over integers.',
    template: 'x ^ x = 0 and x ^ 0 = x; x & (x - 1) clears the lowest set bit; (x >> i) & 1 reads bit i.',
    why: 'XOR is associative and cancels pairs, so only unpaired values survive.',
    complexity: 'O(n) or O(number of bits), O(1) space.',
    traps: ['Sign and overflow: JS bitwise ops are 32-bit signed (use >>> for unsigned).', 'Operator precedence: wrap & and ^ in parentheses.'],
    notWhen: 'Memory is not a concern and clarity matters: a hash set is fine.' },
];

/** Topic headings on the DSA page, in order of first appearance in the teaching order. */
export const TOPICS = [...new Set(PATTERNS.map(p => p.topic))];

// §2 flags, from LeetCode company tags (Google, Meta, Amazon, Microsoft).
export const FLAG_SOURCE = { name: 'liquidslr/leetcode-company-wise-problems', asOf: '2025-10' };
const HOT = ['two-sum', 'best-time-to-buy-and-sell-stock', 'subarray-sum-equals-k', 'merge-intervals', 'add-two-numbers', 'longest-substring-without-repeating-characters', 'longest-palindromic-substring', '3sum', 'lru-cache', 'number-of-islands', 'container-with-most-water', 'longest-common-prefix', 'valid-parentheses', 'merge-sorted-array', 'majority-element', 'maximum-subarray', 'next-permutation', 'trapping-rain-water', 'median-of-two-sorted-arrays'];
const HARD_HOT = ['trapping-rain-water', 'median-of-two-sorted-arrays', 'merge-k-sorted-lists', 'sliding-window-maximum', 'minimum-window-substring', 'n-queens', 'largest-rectangle-in-histogram', 'find-median-from-data-stream', 'word-ladder', 'binary-tree-maximum-path-sum'];

// [slug, difficulty, role ('teach' | 'var' | 'unseen' = must-solve; '' = optional pool), extra { nc: premium NeetCode slug, sub: sub-pattern (the pattern's `sub` list), lcPremium }]
// Task 14 demoted 7 overlapping var must-solves to optional (never a flagged one, never a teach/unseen) so the 3 new patterns
// keep the must-solve total ≤ 100: longest-repeating-character-replacement, middle-of-the-linked-list, reverse-linked-list-ii,
// k-closest-points-to-origin, find-k-pairs-with-smallest-sums, number-of-connected-components-in-an-undirected-graph, counting-bits.
const ROWS = {
  'hash-map': [
    ['two-sum', 'E', 'teach'], ['group-anagrams', 'M', 'var'], ['longest-consecutive-sequence', 'M', 'unseen'],
    ['contains-duplicate', 'E', ''], ['valid-anagram', 'E', ''], ['majority-element', 'E', ''], ['longest-common-prefix', 'E', ''],
    ['encode-and-decode-strings', 'M', '', { nc: 'string-encode-and-decode' }], ['valid-sudoku', 'M', ''], ['copy-list-with-random-pointer', 'M', ''],
    ['detect-squares', 'M', ''],
  ],
  'prefix-sum': [
    ['range-sum-query-immutable', 'E', 'teach'], ['subarray-sum-equals-k', 'M', 'var'], ['product-of-array-except-self', 'M', 'var'], ['continuous-subarray-sum', 'M', 'unseen'],
    ['random-pick-with-weight', 'M', ''],
  ],
  'two-pointers': [
    ['two-sum-ii-input-array-is-sorted', 'M', 'teach'], ['3sum', 'M', 'var'], ['container-with-most-water', 'M', 'var'], ['trapping-rain-water', 'H', 'var'], ['next-permutation', 'M', 'unseen'],
    ['valid-palindrome', 'E', ''], ['valid-palindrome-ii', 'E', ''], ['plus-one', 'E', ''], ['sort-colors', 'M', '', { sub: 'dutch-flag' }],
    ['find-the-index-of-the-first-occurrence-in-a-string', 'E', '', { sub: 'strings' }],
  ],
  'sliding-window': [
    ['longest-substring-without-repeating-characters', 'M', 'teach'], ['longest-repeating-character-replacement', 'M', ''], ['minimum-window-substring', 'H', 'var'], ['sliding-window-maximum', 'H', 'var'], ['permutation-in-string', 'M', 'unseen'],
  ],
  'stack-monotonic': [
    ['daily-temperatures', 'M', 'teach'], ['valid-parentheses', 'E', 'var'], ['minimum-remove-to-make-valid-parentheses', 'M', 'var'], ['largest-rectangle-in-histogram', 'H', 'var'], ['basic-calculator-ii', 'M', 'unseen'],
    ['evaluate-reverse-polish-notation', 'M', ''], ['car-fleet', 'M', ''], ['simplify-path', 'M', ''], ['next-greater-element-ii', 'M', ''], ['online-stock-span', 'M', ''],
    ['shortest-subarray-with-sum-at-least-k', 'H', '', { sub: 'monotonic-queue' }],
  ],
  'binary-search': [
    ['binary-search', 'E', 'teach'], ['search-in-rotated-sorted-array', 'M', 'var'], ['find-peak-element', 'M', 'var'], ['median-of-two-sorted-arrays', 'H', 'var'], ['koko-eating-bananas', 'M', 'unseen', { sub: 'on-answer' }],
    ['search-a-2d-matrix', 'M', ''], ['find-minimum-in-rotated-sorted-array', 'M', ''], ['time-based-key-value-store', 'M', ''],
  ],
  'cyclic-sort': [
    ['find-all-numbers-disappeared-in-an-array', 'E', 'teach'], ['missing-number', 'E', 'var'], ['first-missing-positive', 'H', 'unseen'],
  ],
  'fast-slow': [
    ['linked-list-cycle', 'E', 'teach'], ['middle-of-the-linked-list', 'E', ''], ['find-the-duplicate-number', 'M', 'var'], ['happy-number', 'E', 'unseen'],
    ['remove-nth-node-from-end-of-list', 'M', ''],
  ],
  'll-reversal': [
    ['reverse-linked-list', 'E', 'teach'], ['reverse-linked-list-ii', 'M', ''], ['reorder-list', 'M', 'var'], ['add-two-numbers', 'M', 'var'], ['palindrome-linked-list', 'E', 'unseen'],
    ['reverse-nodes-in-k-group', 'H', ''],
  ],
  'tree-bfs': [
    ['binary-tree-level-order-traversal', 'M', 'teach'], ['binary-tree-right-side-view', 'M', 'var'], ['serialize-and-deserialize-binary-tree', 'H', 'unseen'],
  ],
  'tree-dfs': [
    ['maximum-depth-of-binary-tree', 'E', 'teach'], ['validate-binary-search-tree', 'M', 'var'], ['lowest-common-ancestor-of-a-binary-tree', 'M', 'var'], ['binary-tree-maximum-path-sum', 'H', 'var'], ['construct-binary-tree-from-preorder-and-inorder-traversal', 'M', 'unseen'],
    ['invert-binary-tree', 'E', ''], ['diameter-of-binary-tree', 'E', ''], ['balanced-binary-tree', 'E', ''], ['same-tree', 'E', ''], ['subtree-of-another-tree', 'E', ''],
    ['lowest-common-ancestor-of-a-binary-search-tree', 'M', ''], ['count-good-nodes-in-binary-tree', 'M', ''], ['kth-smallest-element-in-a-bst', 'M', ''],
    ['nested-list-weight-sum', 'M', '', { lcPremium: true }],
  ],
  'trie': [
    ['implement-trie-prefix-tree', 'M', 'teach'], ['design-add-and-search-words-data-structure', 'M', 'var'], ['word-search-ii', 'H', 'unseen'],
  ],
  'design-ds': [
    ['min-stack', 'M', 'teach'], ['lru-cache', 'M', 'var'], ['insert-delete-getrandom-o1', 'M', 'unseen'],
    ['design-twitter', 'M', ''],
  ],
  'top-k': [
    ['kth-largest-element-in-an-array', 'M', 'teach', { sub: 'quickselect' }], ['top-k-frequent-elements', 'M', 'var'], ['k-closest-points-to-origin', 'M', ''], ['task-scheduler', 'M', 'unseen'],
    ['kth-largest-element-in-a-stream', 'E', ''], ['last-stone-weight', 'E', ''], ['reorganize-string', 'M', ''],
  ],
  'two-heaps': [
    ['find-median-from-data-stream', 'H', 'teach'], ['sliding-window-median', 'H', 'var'], ['ipo', 'H', 'unseen'],
  ],
  'k-way-merge': [
    ['merge-sorted-array', 'E', 'teach'], ['merge-k-sorted-lists', 'H', 'var'], ['find-k-pairs-with-smallest-sums', 'M', ''], ['kth-smallest-element-in-a-sorted-matrix', 'M', 'unseen'],
    ['merge-two-sorted-lists', 'E', ''],
  ],
  'backtracking': [
    ['subsets', 'M', 'teach'], ['permutations', 'M', 'var'], ['n-queens', 'H', 'var'], ['word-search', 'M', 'unseen'],
    ['combination-sum', 'M', ''], ['combination-sum-ii', 'M', ''], ['subsets-ii', 'M', ''], ['palindrome-partitioning', 'M', ''], ['letter-combinations-of-a-phone-number', 'M', ''], ['generate-parentheses', 'M', ''],
  ],
  'graph-traversal': [
    ['number-of-islands', 'M', 'teach'], ['rotting-oranges', 'M', 'var', { sub: 'multi-source-bfs' }], ['word-ladder', 'H', 'var'], ['pacific-atlantic-water-flow', 'M', 'unseen'],
    ['max-area-of-island', 'M', ''], ['clone-graph', 'M', ''], ['walls-and-gates', 'M', '', { nc: 'islands-and-treasure', sub: 'multi-source-bfs' }], ['surrounded-regions', 'M', ''],
    ['shortest-path-in-binary-matrix', 'M', ''], ['reconstruct-itinerary', 'H', ''],
  ],
  'matrix': [
    ['spiral-matrix', 'M', 'teach'], ['rotate-image', 'M', 'var'], ['game-of-life', 'M', 'unseen'],
    ['set-matrix-zeroes', 'M', ''],
  ],
  'topo-sort': [
    ['course-schedule', 'M', 'teach'], ['course-schedule-ii', 'M', 'var'], ['alien-dictionary', 'H', 'unseen', { nc: 'foreign-dictionary' }],
  ],
  'union-find': [
    ['redundant-connection', 'M', 'teach'], ['number-of-connected-components-in-an-undirected-graph', 'M', '', { nc: 'count-connected-components' }], ['accounts-merge', 'M', 'var'], ['graph-valid-tree', 'M', 'unseen', { nc: 'valid-tree' }],
  ],
  'shortest-path-mst': [
    ['network-delay-time', 'M', 'teach'], ['min-cost-to-connect-all-points', 'M', 'var'], ['cheapest-flights-within-k-stops', 'M', 'var'], ['swim-in-rising-water', 'H', 'unseen'],
  ],
  'intervals': [
    ['merge-intervals', 'M', 'teach'], ['insert-interval', 'M', 'var'], ['meeting-rooms-ii', 'M', 'var', { nc: 'meeting-schedule-ii' }], ['non-overlapping-intervals', 'M', 'unseen'],
    ['meeting-rooms', 'E', '', { nc: 'meeting-schedule' }], ['minimum-interval-to-include-each-query', 'H', ''],
  ],
  'greedy': [
    ['jump-game', 'M', 'teach'], ['maximum-subarray', 'M', 'var'], ['best-time-to-buy-and-sell-stock', 'E', 'var'], ['partition-labels', 'M', 'unseen'],
    ['jump-game-ii', 'M', ''], ['gas-station', 'M', ''], ['hand-of-straights', 'M', ''], ['merge-triplets-to-form-target-triplet', 'M', ''], ['valid-parenthesis-string', 'M', ''],
  ],
  'dp': [
    ['climbing-stairs', 'E', 'teach', { sub: 'fibonacci' }], ['coin-change', 'M', 'var', { sub: 'unbounded-knapsack' }], ['longest-common-subsequence', 'M', 'var', { sub: 'lcs-strings' }],
    ['longest-palindromic-substring', 'M', 'var', { sub: 'palindromes' }], ['partition-equal-subset-sum', 'M', 'unseen', { sub: '0-1-knapsack' }],
    ['min-cost-climbing-stairs', 'E', '', { sub: 'fibonacci' }], ['house-robber', 'M', '', { sub: 'fibonacci' }], ['house-robber-ii', 'M', '', { sub: 'fibonacci' }],
    ['decode-ways', 'M', '', { sub: 'fibonacci' }], ['maximum-product-subarray', 'M', '', { sub: 'fibonacci' }], ['best-time-to-buy-and-sell-stock-with-cooldown', 'M', '', { sub: 'fibonacci' }],
    ['palindromic-substrings', 'M', '', { sub: 'palindromes' }], ['word-break', 'M', '', { sub: 'unbounded-knapsack' }], ['coin-change-ii', 'M', '', { sub: 'unbounded-knapsack' }],
    ['target-sum', 'M', '', { sub: '0-1-knapsack' }], ['longest-increasing-subsequence', 'M', '', { sub: 'lcs-strings' }], ['interleaving-string', 'M', '', { sub: 'lcs-strings' }],
    ['edit-distance', 'M', '', { sub: 'lcs-strings' }], ['distinct-subsequences', 'H', '', { sub: 'lcs-strings' }], ['regular-expression-matching', 'H', '', { sub: 'lcs-strings' }],
    ['unique-paths', 'M', '', { sub: 'grid' }], ['longest-increasing-path-in-a-matrix', 'H', '', { sub: 'grid' }], ['burst-balloons', 'H', ''],
  ],
  'math': [
    ['powx-n', 'M', 'teach'], ['multiply-strings', 'M', 'var'], ['sqrtx', 'E', 'unseen'],
  ],
  'bits': [
    ['single-number', 'E', 'teach'], ['number-of-1-bits', 'E', 'var'], ['sum-of-two-integers', 'M', 'unseen'],
    ['reverse-bits', 'E', ''], ['reverse-integer', 'M', ''], ['counting-bits', 'E', ''],
  ],
};

const NAME_FIX = { 'sqrtx': 'Sqrt(x)', 'insert-delete-getrandom-o1': 'Insert Delete GetRandom O(1)', '3sum': '3Sum', 'powx-n': 'Pow(x, n)', 'implement-trie-prefix-tree': 'Implement Trie (Prefix Tree)', 'two-sum-ii-input-array-is-sorted': 'Two Sum II (Sorted Input)', 'lru-cache': 'LRU Cache', 'kth-smallest-element-in-a-bst': 'Kth Smallest Element in a BST', 'number-of-1-bits': 'Number of 1 Bits', 'n-queens': 'N-Queens', 'ipo': 'IPO', 'range-sum-query-immutable': 'Range Sum Query – Immutable' };
const prettify = s => NAME_FIX[s] || s.split('-').map(w => w === 'ii' ? 'II' : w[0].toUpperCase() + w.slice(1)).join(' ').replace(/\b(Of|In|A|An|The|To|From|And|With|By|On)\b/g, m => m.toLowerCase()).replace(/^./, c => c.toUpperCase());

export const PROBLEMS = [];
for (const [pattern, rows] of Object.entries(ROWS)) for (const [slug, d, role, x = {}] of rows) {
  const flags = [];
  if (HOT.includes(slug)) flags.push('hot');
  if (HARD_HOT.includes(slug)) flags.push('hard-hot');
  const p = { slug, name: prettify(slug), d, pattern, tier: role ? 'must' : 'optional', flags, url: x.nc ? NC(x.nc) : LC(slug) };
  if (x.sub) p.sub = x.sub;
  if (role) p.role = role;
  if (x.nc || x.lcPremium) p.premium = true;
  PROBLEMS.push(p);
}

// Advanced DSA from the board. Moves to morning DSA slots once the 27 patterns are done (§2).
export const ADV_DSA = [
  ['Advanced DSA: Union-Find / DSU', 'https://leetcode.com/discuss/post/1072418/disjoint-set-union-dsuunion-find-a-compl-2oqn/'],
  ['Advanced DSA: Difference array', 'https://medium.com/@p.thapar99/the-beauty-of-difference-array-technique-in-problem-solving-6d45eb726531'],
  ['Advanced DSA: Line sweep', 'https://leetcode.com/discuss/post/2166045/line-sweep-algorithms-by-c0d3m-8ebq/'],
  ['Advanced DSA: Fenwick tree (BIT)', 'https://leetcode.com/discuss/post/1093346/introduction-to-fenwick-treebinary-index-tp6h/'],
  ['Advanced DSA: Segment tree', 'https://www.youtube.com/watch?v=jGA1DonowlQ'],
  ['Advanced DSA: DP on trees', 'https://www.youtube.com/watch?v=kM3A6AjHvjM'],
  ['Advanced DSA: Digit DP', 'https://www.youtube.com/watch?v=KaU-AM8wo4Q'],
  ['DP roadmap: map the DP patterns you know vs the ones you don\'t', 'https://www.reddit.com/r/leetcode/comments/14o10jd/the_ultimate_dynamic_programming_roadmap/'],
];

// Week 1 foundations (§2): about 5 morning DSA blocks before the patterns start. URLs checked 2026-11-15 (curl, 200).
export const FOUNDATIONS = [
  { id: 'dsa:foundations-big-o', url: 'https://www.bigocheatsheet.com/',
    text: 'Foundations · Big-O as reasoning: from the input size to the complexity you need ("n = 10⁵ means I need n log n").' },
  { id: 'dsa:foundations-recursion', url: 'https://javascript.info/recursion',
    text: 'Foundations · Recursion and the call stack: base case, the stack frames, depth limits. Trace 3 recursive functions by hand.' },
  { id: 'dsa:foundations-build-1', url: 'https://github.com/trekhleb/javascript-algorithms',
    text: 'Foundations · Build it yourself in TypeScript, with tests: dynamic array, hash map, linked list.' },
  { id: 'dsa:foundations-build-2', url: 'https://github.com/trekhleb/javascript-algorithms',
    text: 'Foundations · Build it yourself in TypeScript, with tests: stack/queue, binary heap, BST.' },
  { id: 'dsa:foundations-build-3', url: 'https://github.com/trekhleb/javascript-algorithms',
    text: 'Foundations · Build it yourself in TypeScript, with tests: trie, graph adjacency list, union-find.' },
];
