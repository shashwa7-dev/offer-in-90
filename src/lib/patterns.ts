/* DSA patterns: own problems and the per-pattern "green" rule (roadmap v2 §2). Pure: type-only imports. */
import type { OwnProblem, SolveLog } from './state-types';

export const PATTERN_IDS = ['hash-map', 'prefix-sum', 'two-pointers', 'sliding-window', 'stack-monotonic', 'binary-search', 'cyclic-sort', 'fast-slow', 'll-reversal', 'tree-bfs', 'tree-dfs', 'trie', 'design-ds', 'top-k', 'two-heaps', 'k-way-merge', 'backtracking', 'graph-traversal', 'matrix', 'topo-sort', 'union-find', 'shortest-path-mst', 'intervals', 'greedy', 'dp', 'math', 'bits'] as const;
export type PatternId = (typeof PATTERN_IDS)[number];
type Diff = 'E' | 'M' | 'H';
type PlanProblem = { slug: string; d: Diff | string; pattern: string; role?: string };

/** Unseen solves within these minutes count towards green (inclusive). */
export const TIME_LIMIT: Record<Diff, number> = { E: 15, M: 25, H: 40 };
const DAY = 86_400_000;

/** Slug from a leetcode.com/problems/<slug> URL, or null. Scheme and www are optional; trailing path and query are ignored. */
export function leetcodeSlug(url: string): string | null {
  const m = /^(?:https?:\/\/)?(?:www\.)?leetcode\.com\/problems\/([a-z0-9-]+)/i.exec(url.trim());
  return m ? m[1].toLowerCase() : null;
}

/** Add (or replace) an owner problem, keyed by slug. A plan slug is refused so it is stored and counted once. */
export function addOwnProblem(
  own: Record<string, OwnProblem>,
  plan: { slug: string }[],
  input: { url: string; name: string; diff: Diff; pattern: string },
  at: number = Date.now(),
): { own: Record<string, OwnProblem> } | { error: 'not-leetcode' | 'in-plan' } {
  const slug = leetcodeSlug(input.url);
  if (!slug) return { error: 'not-leetcode' };
  if (plan.some((p) => p.slug === slug)) return { error: 'in-plan' };
  const entry: OwnProblem = { slug, url: `https://leetcode.com/problems/${slug}/`, name: input.name.trim() || slug, diff: input.diff, pattern: input.pattern, at };
  return { own: { ...own, [slug]: entry } };
}

/**
 * Green = 2+ unseen problems solved in time, plus a blank-file re-solve (`rs:<slug>`, not unseen)
 * 7+ days after that problem's first solve (`p-<slug>`). Logs dated after `now` are ignored.
 */
export function greenStatus(
  pattern: string,
  problems: PlanProblem[],
  own: Record<string, OwnProblem>,
  solves: Record<string, SolveLog>,
  now: number,
): { unseenSolved: number; blankResolve: boolean; green: boolean; unseenCheckPassed: boolean } {
  const log = (k: string) => { const s = solves[k]; return s && s.at <= now ? s : undefined; };
  const pool = new Map<string, { d: string; role?: string }>();
  for (const p of problems) if (p.pattern === pattern) pool.set(p.slug, { d: p.d, role: p.role });
  for (const o of Object.values(own)) if (o.pattern === pattern && !pool.has(o.slug)) pool.set(o.slug, { d: o.diff });

  const inTime = (slug: string, d: string) => {
    const s = log(`p-${slug}`);
    if (!s || !s.unseen) return false;
    return s.minutes == null || s.minutes <= (TIME_LIMIT[d as Diff] ?? TIME_LIMIT.M);
  };
  let unseenSolved = 0, blankResolve = false, unseenCheckPassed = false;
  for (const [slug, p] of pool) {
    const ok = inTime(slug, p.d);
    if (ok) unseenSolved++;
    if (ok && p.role === 'unseen') unseenCheckPassed = true;
    const first = log(`p-${slug}`), rs = log(`rs:${slug}`);
    if (first && rs && !rs.unseen && rs.at - first.at >= 7 * DAY) blankResolve = true;
  }
  return { unseenSolved, blankResolve, green: unseenSolved >= 2 && blankResolve, unseenCheckPassed };
}
