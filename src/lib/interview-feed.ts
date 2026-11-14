export interface ThreadPost { title: string; url: string; source: string; createdAt: string; upvotes: number; comments: number; views: number; roles: string[] }
export interface ThreadsFeed { collectedAt: string; window: { days: number }; sources?: unknown; companies: Record<string, { group: string; threads: number; engagement: number; roles: string[]; top: ThreadPost[] }> }
export interface Post extends ThreadPost { company: string; group: string }
export type RoleFilter = 'all' | 'frontend' | 'fde';
export type SortKey = 'top' | 'newest';

export const DEFAULT_TARGETS: string[] = ['Google', 'Meta', 'Microsoft', 'Amazon', 'Databricks', 'OpenAI', 'Anthropic', 'Palantir'];

export function flattenThreads(feed: ThreadsFeed | null): Post[] {
  if (!feed) return [];
  const out: Post[] = [];
  for (const [company, c] of Object.entries(feed.companies ?? {})) {
    for (const t of c.top ?? []) out.push({ ...t, company, group: c.group });
  }
  return out;
}

export function filterPosts(posts: Post[], opts: { companies: string[] | null; role: RoleFilter }): Post[] {
  const { companies, role } = opts;
  return posts.filter((p) => {
    if (companies && !companies.includes(p.company)) return false;
    if (role === 'frontend') return p.roles.includes('frontend') || p.roles.includes('fullstack');
    if (role === 'fde') return p.roles.includes('fde');
    return true;
  });
}

export function sortPosts(posts: Post[], key: SortKey): Post[] {
  const out = [...posts];
  if (key === 'newest') {
    const ts = (p: Post) => { const n = Date.parse(p.createdAt); return Number.isNaN(n) ? -Infinity : n; };
    return out.sort((a, b) => { const x = ts(a), y = ts(b); return x === y ? 0 : y > x ? 1 : -1; });
  }
  return out.sort((a, b) => b.upvotes - a.upvotes || b.comments - a.comments || b.views - a.views);
}

export function companyCounts(posts: Post[], targets: string[]): { company: string; count: number; target: boolean }[] {
  const m = new Map<string, number>();
  for (const p of posts) m.set(p.company, (m.get(p.company) ?? 0) + 1);
  return [...m].map(([company, count]) => ({ company, count, target: targets.includes(company) }))
    .sort((a, b) => Number(b.target) - Number(a.target) || b.count - a.count || a.company.localeCompare(b.company));
}

export function domainOf(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; }
}
