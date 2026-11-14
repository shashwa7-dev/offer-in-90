// Run: node --experimental-strip-types scripts/test-interview-feed.ts
import assert from 'node:assert/strict';
import { flattenThreads, filterPosts, sortPosts, companyCounts, domainOf, DEFAULT_TARGETS } from '../src/lib/interview-feed.ts';
import type { ThreadsFeed, ThreadPost } from '../src/lib/interview-feed.ts';

const p = (title: string, o: Partial<ThreadPost> = {}): ThreadPost => ({
  title, url: `https://example.com/${title}`, source: 'reddit', createdAt: '2026-11-01T00:00:00Z', upvotes: 1, comments: 1, views: 1, roles: [], ...o,
});
const feed: ThreadsFeed = {
  collectedAt: '2026-11-10T00:00:00Z',
  window: { days: 14 },
  companies: {
    Amazon: { group: 'Big tech', threads: 3, engagement: 0, roles: [], top: [p('a1', { roles: ['frontend'], upvotes: 5, comments: 2, views: 10 }), p('a2', { roles: ['fde'], upvotes: 5, comments: 2, views: 20, createdAt: '2026-11-05T00:00:00Z' }), p('a3', { upvotes: 5, comments: 1 })] },
    Anthropic: { group: 'AI & FDE', threads: 2, engagement: 0, roles: [], top: [p('n1', { roles: ['fullstack'], upvotes: 9, createdAt: 'garbage' }), p('n2', { createdAt: '2026-11-09T00:00:00Z' })] },
    Zoho: { group: 'India product', threads: 1, engagement: 0, roles: [], top: [p('z1', { roles: ['swe'] })] },
  },
};

// flatten
{
  assert.deepEqual(flattenThreads(null), []);
  const all = flattenThreads(feed);
  assert.equal(all.length, 6);
  assert.ok(all.every((x) => x.company && x.group));
  assert.equal(all.find((x) => x.title === 'n1')!.group, 'AI & FDE');
}
const all = flattenThreads(feed);
const titles = (xs: { title: string }[]) => xs.map((x) => x.title).sort();
// roleFrontendIncludesFullstack
assert.deepEqual(titles(filterPosts(all, { companies: null, role: 'frontend' })), ['a1', 'n1']);
assert.deepEqual(titles(filterPosts(all, { companies: null, role: 'fde' })), ['a2']);
// roleAllKeepsUntagged
assert.equal(filterPosts(all, { companies: null, role: 'all' }).length, 6);
// companiesFilter
assert.deepEqual(titles(filterPosts(all, { companies: ['Amazon'], role: 'all' })), ['a1', 'a2', 'a3']);
assert.deepEqual(filterPosts(all, { companies: [], role: 'all' }), []);
assert.equal(filterPosts(all, { companies: null, role: 'all' }).length, 6);
// topSort
{
  const amazon = all.filter((x) => x.company === 'Amazon');
  assert.deepEqual(sortPosts(amazon, 'top').map((x) => x.title), ['a2', 'a1', 'a3']);
  const before = amazon.map((x) => x.title);
  sortPosts(amazon, 'top');
  assert.deepEqual(amazon.map((x) => x.title), before);
  const nw = sortPosts(all, 'newest').map((x) => x.title);
  assert.deepEqual(nw.slice(0, 2), ['n2', 'a2']);
  assert.equal(nw[nw.length - 1], 'n1');
  assert.deepEqual(sortPosts([], 'newest'), []);
}
// counts
{
  const c = companyCounts(all, ['Zoho', 'Meta', 'Amazon']);
  assert.deepEqual(c, [
    { company: 'Amazon', count: 3, target: true },
    { company: 'Zoho', count: 1, target: true },
    { company: 'Anthropic', count: 2, target: false },
  ]);
  assert.deepEqual(companyCounts([], DEFAULT_TARGETS), []);
}
assert.equal(DEFAULT_TARGETS.length, 8);
// domain
assert.equal(domainOf('https://www.leetcode.com/discuss/1'), 'leetcode.com');
assert.equal(domainOf('https://blog.example.com/x'), 'blog.example.com');
assert.equal(domainOf('not a url'), 'not a url');
console.log('interview-feed ok');
