/* eslint-disable */
// Curriculum entry point. All content lives in src/lib/content/*.js with content-based ids (<prefix>:<slug>). This file re-exports
// it as PLAN, adapting the moved tracks to the old shapes that engine.ts reads until Task 8 (engine.ts still derives positional task
// ids such as p-<slug>, fe-N, ai-N from those shapes). The only data left here is v1-only (the NeetCode 150 list, FDE_PROMPTS and
// APPLY), which the old engine reads and Task 8 deletes with the adapters. Built from the "Amazon Interview Prep by AnubhavInTech"
// Whimsical board, extended for frontend / full-stack loops at Google, Meta, Microsoft, Amazon.

import { ADV_DSA } from './content/dsa.js';
import { FE as FE_NEW } from './content/fe.js';
import { UX as UX_NEW } from './content/ux.js';
import { BEH as BEH_NEW, FDE as FDE_NEW, COMPANY_MAP } from './content/career.js';
import { AIB_MOVED, AIB, AI_EVENING, AI_REVIEW as AI_REVIEW_NEW } from './content/ai.js';
import { MC as MC_NEW, MC_TIMED as MC_TIMED_NEW, PROJECT as PROJECT_NEW, LLD as LLD_NEW } from './content/mc.js';
import { SD as SD_NEW, SD_MOCKS as SD_MOCKS_NEW } from './content/sd.js';
import { FOCUS_RULES, EXPLORE_LATER, RULES, HLD_FRAMEWORK, FDE_STAGES, BOARD_MAP, OA_LINKS } from './content/reference.js';
import * as JUDGMENT from './content/judgment.js';
import * as SUNDAYS from './content/sundays.js';

// Adapter (Task 4a): the content files hold the new { id, text, ... } items; engine.ts still reads the old tuples until Task 8 rewrites it.
// FDE: the Python and Stage-6 cloud items moved to ai.js; they are put back at their original positions so the old engine keeps its order.
const aibById = id => AIB_MOVED.find(x => x.id === id);
const FDE_BACK = {
  'fde:decomposition-framework': ['aib:python-for-js', 'aib:pandas'].map(aibById),
  'fde:reengineering-round': ['aib:aws', 'aib:terraform', 'aib:containers', 'aib:devops'].map(aibById),
};
const FE = FE_NEW.map(x => [x.text, x.practice, x.url]);
const UX = UX_NEW.map(x => [x.text, x.url || '']);
const BEH = BEH_NEW.map(x => [x.text, x.url || '']);
const FDE = FDE_NEW.flatMap(x => [x, ...(FDE_BACK[x.id] || [])]).map(x => [x.text, x.url || '']);

const LC = s => `https://leetcode.com/problems/${s}/`;
const NC = s => `https://neetcode.io/problems/${s}`;

// v1 only (Task 8 deletes it): NeetCode 150 in learning order, read by the old engine. v2 problems live in content/dsa.js.
// NeetCode 150 in learning order: [topic, [[slug, difficulty, premiumNeetcodeSlug?]]]
const DSA_TOPICS = [
  ['Arrays & Hashing', [['contains-duplicate','E'],['valid-anagram','E'],['two-sum','E'],['group-anagrams','M'],['top-k-frequent-elements','M'],['encode-and-decode-strings','M','string-encode-and-decode'],['product-of-array-except-self','M'],['valid-sudoku','M'],['longest-consecutive-sequence','M']]],
  ['Two Pointers', [['valid-palindrome','E'],['two-sum-ii-input-array-is-sorted','M'],['3sum','M'],['container-with-most-water','M'],['trapping-rain-water','H']]],
  ['Sliding Window', [['best-time-to-buy-and-sell-stock','E'],['longest-substring-without-repeating-characters','M'],['longest-repeating-character-replacement','M'],['permutation-in-string','M'],['minimum-window-substring','H'],['sliding-window-maximum','H']]],
  ['Stack', [['valid-parentheses','E'],['min-stack','M'],['evaluate-reverse-polish-notation','M'],['generate-parentheses','M'],['daily-temperatures','M'],['car-fleet','M'],['largest-rectangle-in-histogram','H']]],
  ['Binary Search', [['binary-search','E'],['search-a-2d-matrix','M'],['koko-eating-bananas','M'],['find-minimum-in-rotated-sorted-array','M'],['search-in-rotated-sorted-array','M'],['time-based-key-value-store','M'],['median-of-two-sorted-arrays','H']]],
  ['Linked List', [['reverse-linked-list','E'],['merge-two-sorted-lists','E'],['linked-list-cycle','E'],['reorder-list','M'],['remove-nth-node-from-end-of-list','M'],['copy-list-with-random-pointer','M'],['add-two-numbers','M'],['find-the-duplicate-number','M'],['lru-cache','M'],['merge-k-sorted-lists','H'],['reverse-nodes-in-k-group','H']]],
  ['Trees', [['invert-binary-tree','E'],['maximum-depth-of-binary-tree','E'],['diameter-of-binary-tree','E'],['balanced-binary-tree','E'],['same-tree','E'],['subtree-of-another-tree','E'],['lowest-common-ancestor-of-a-binary-search-tree','M'],['binary-tree-level-order-traversal','M'],['binary-tree-right-side-view','M'],['count-good-nodes-in-binary-tree','M'],['validate-binary-search-tree','M'],['kth-smallest-element-in-a-bst','M'],['construct-binary-tree-from-preorder-and-inorder-traversal','M'],['binary-tree-maximum-path-sum','H'],['serialize-and-deserialize-binary-tree','H']]],
  ['Tries', [['implement-trie-prefix-tree','M'],['design-add-and-search-words-data-structure','M'],['word-search-ii','H']]],
  ['Heap / Priority Queue', [['kth-largest-element-in-a-stream','E'],['last-stone-weight','E'],['k-closest-points-to-origin','M'],['kth-largest-element-in-an-array','M'],['task-scheduler','M'],['design-twitter','M'],['find-median-from-data-stream','H']]],
  ['Backtracking', [['subsets','M'],['combination-sum','M'],['combination-sum-ii','M'],['permutations','M'],['subsets-ii','M'],['word-search','M'],['palindrome-partitioning','M'],['letter-combinations-of-a-phone-number','M'],['n-queens','H']]],
  ['Graphs', [['number-of-islands','M'],['max-area-of-island','M'],['clone-graph','M'],['walls-and-gates','M','islands-and-treasure'],['rotting-oranges','M'],['pacific-atlantic-water-flow','M'],['surrounded-regions','M'],['course-schedule','M'],['course-schedule-ii','M'],['graph-valid-tree','M','valid-tree'],['number-of-connected-components-in-an-undirected-graph','M','count-connected-components'],['redundant-connection','M'],['word-ladder','H']]],
  ['Advanced Graphs', [['network-delay-time','M'],['min-cost-to-connect-all-points','M'],['cheapest-flights-within-k-stops','M'],['reconstruct-itinerary','H'],['swim-in-rising-water','H'],['alien-dictionary','H','foreign-dictionary']]],
  ['1-D Dynamic Programming', [['climbing-stairs','E'],['min-cost-climbing-stairs','E'],['house-robber','M'],['house-robber-ii','M'],['longest-palindromic-substring','M'],['palindromic-substrings','M'],['decode-ways','M'],['coin-change','M'],['maximum-product-subarray','M'],['word-break','M'],['longest-increasing-subsequence','M'],['partition-equal-subset-sum','M']]],
  ['2-D Dynamic Programming', [['unique-paths','M'],['longest-common-subsequence','M'],['best-time-to-buy-and-sell-stock-with-cooldown','M'],['coin-change-ii','M'],['target-sum','M'],['interleaving-string','M'],['edit-distance','M'],['longest-increasing-path-in-a-matrix','H'],['distinct-subsequences','H'],['burst-balloons','H'],['regular-expression-matching','H']]],
  ['Greedy', [['maximum-subarray','M'],['jump-game','M'],['jump-game-ii','M'],['gas-station','M'],['hand-of-straights','M'],['merge-triplets-to-form-target-triplet','M'],['partition-labels','M'],['valid-parenthesis-string','M']]],
  ['Intervals', [['meeting-rooms','E','meeting-schedule'],['insert-interval','M'],['merge-intervals','M'],['non-overlapping-intervals','M'],['meeting-rooms-ii','M','meeting-schedule-ii'],['minimum-interval-to-include-each-query','H']]],
  ['Math & Geometry', [['happy-number','E'],['plus-one','E'],['rotate-image','M'],['spiral-matrix','M'],['set-matrix-zeroes','M'],['powx-n','M'],['multiply-strings','M'],['detect-squares','M']]],
  ['Bit Manipulation', [['single-number','E'],['number-of-1-bits','E'],['counting-bits','E'],['reverse-bits','E'],['missing-number','E'],['sum-of-two-integers','M'],['reverse-integer','M']]],
];
const NAME_FIX = { '3sum': '3Sum', 'powx-n': 'Pow(x, n)', 'implement-trie-prefix-tree': 'Implement Trie (Prefix Tree)', 'two-sum-ii-input-array-is-sorted': 'Two Sum II (Sorted Input)', 'lru-cache': 'LRU Cache', 'kth-smallest-element-in-a-bst': 'Kth Smallest Element in a BST', 'number-of-1-bits': 'Number of 1 Bits', 'n-queens': 'N-Queens', 'house-robber-ii': 'House Robber II', 'coin-change-ii': 'Coin Change II', 'jump-game-ii': 'Jump Game II', 'combination-sum-ii': 'Combination Sum II', 'subsets-ii': 'Subsets II', 'course-schedule-ii': 'Course Schedule II', 'meeting-rooms-ii': 'Meeting Rooms II', 'word-search-ii': 'Word Search II' };
const prettify = s => NAME_FIX[s] || s.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ').replace(/\b(Of|In|A|An|The|To|From|And|With|By|On)\b/g, m => m.toLowerCase()).replace(/^./, c => c.toUpperCase());
const DSA = [];
DSA_TOPICS.forEach(([topic, list]) => list.forEach(([slug, d, nc]) => DSA.push({ slug, d, topic, name: prettify(slug), url: nc ? NC(nc) : LC(slug), premium: !!nc })));


// Adapter (Task 4c): machine coding, flagship and LLD live in content/mc.js. The old engine reads MC as build texts in the
// old order, MC_TIMED as 1-based MC indexes, and PROJECT as 20 [text, url] steps: merged flagship steps are split back into
// their `oldSteps` and every step is put back at its old 1-based position (`v1`), with its old text (`oldText`).
const MC = MC_NEW.map(x => x.text);
const MC_TIMED = MC_TIMED_NEW.map(id => MC_NEW.findIndex(x => x.id === id) + 1);
const byV1 = (a, b) => a.v1 - b.v1;
const PROJECT = PROJECT_NEW.flatMap(x => x.oldSteps ?? [{ v1: x.v1, text: x.oldText ?? x.text, url: x.url || '' }]).sort(byV1).map(x => [x.text, x.url]);

// Adapter (Task 4c): system design lives in content/sd.js in the §6 order. The old engine reads SD as [text, url] in the old
// order (`v1`, old text in `oldText`; the new numbers card has no `v1` and is left out) and SD_MOCKS as texts.
const SD = SD_NEW.filter(x => x.v1 !== undefined).sort(byV1).map(x => [x.oldText ?? x.text, x.url || '']);
const SD_MOCKS = SD_MOCKS_NEW.map(x => x.text);

// v1 only (Task 8 deletes it): career block after BEH runs out, a short application task + one FDE item each day.
// v2 has the optional Sunday item sun:apply-roles (content/sundays.js) instead.
const APPLY = [
  ['Apply / ask for referrals: 3–5 roles today, follow up on last week. Log them in Job tracker.', 'https://www.linkedin.com/jobs/'],
  ['Apply / ask for referrals: 3–5 roles today (mix big tech, AI companies, practice companies).', 'https://www.linkedin.com/jobs/'],
];

// v1 only (Task 8 deletes it): the old engine's FDE prompt rotation. v2 has these prompts in content/judgment.js (DECOMP and
// jt:practical-merge-csvs); the second one repeats fde:client-simulation-2.
const FDE_PROMPTS = [
  'Decomposition: "A bank wants to flag fraudulent transactions in real time"',
  'Client simulation: the customer says your AI tool gave a wrong answer to their CEO',
  'Decomposition: "A logistics company wants to predict delivery delays"',
  'Practical coding (Python): merge two messy CSVs and report mismatches in 45 min',
  'Decomposition: "A hospital wants an AI assistant for nurses on night shifts"',
  'Client simulation: scope cut. The customer wants 10 features in 4 weeks',
];

const LLD = LLD_NEW.map(x => [x.text, x.url]);

// Adapter (Task 4b): the old engine reads AI_UNITS as [unit, [[text, url]]] in the old 61-day order.
// The reading/course days live in AI_EVENING and the build days in AIB; both keep `unit` and `day` (and `oldText` where the text
// gained an explain-back), so the old order and text are rebuilt here.
const AI_UNITS = [...AI_EVENING, ...AIB].filter(x => x.day !== undefined).sort((a, b) => a.day - b.day)
  .reduce((units, x) => {
    const last = units[units.length - 1];
    const step = [x.oldText ?? x.text, x.url || ''];
    if (last && last[0] === x.unit) last[1].push(step);
    else units.push([x.unit, [step]]);
    return units;
  }, []);
const AI_REVIEW = AI_REVIEW_NEW.map(x => [x.text, x.url || '']);

export const PLAN = {
  // old shapes, read by engine.ts until Task 8
  PROJECT, UX, AI_UNITS, AI_REVIEW, APPLY, FDE, FDE_PROMPTS, LLD, DSA, FE, MC, MC_TIMED, SD, SD_MOCKS, BEH, ADV_DSA, OA_LINKS,
  // reference, read by roadmap-reference.tsx ("Month 4" / EXTENSION is replaced by EXPLORE_LATER, §16)
  COMPANY_MAP, FOCUS_RULES, FDE_STAGES, RULES, HLD_FRAMEWORK, BOARD_MAP, EXPLORE_LATER,
  // v2 content with ids: the judgment thread, Sundays and readiness (laid out by Task 5)
  ...JUDGMENT, ...SUNDAYS,
};
