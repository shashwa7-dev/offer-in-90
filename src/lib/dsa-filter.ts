/* DSA page filters (Task 14): status, difficulty, tier, hot, labels and name search, with a count per option, and the
 * topic → pattern grouping of the problem list. Pure: no runtime imports.
 * An unstarted unseen check (`hidden`) is anonymous: its name, difficulty and frequency flags never match and are never counted. */

export type Status = 'todo' | 'done';
export type Diff = 'E' | 'M' | 'H';
export type Tier = 'must' | 'optional' | 'yours';
export type Hot = 'hot' | 'hard-hot';
export interface DsaFilter { status: Status[]; diff: Diff[]; tier: Tier[]; hot: Hot[]; labels: string[]; q: string }
export type Facet = 'status' | 'diff' | 'tier' | 'hot' | 'labels';

export const STATUSES: Status[] = ['todo', 'done'];
export const DIFFS: Diff[] = ['E', 'M', 'H'];
export const TIERS: Tier[] = ['must', 'optional', 'yours'];
export const HOTS: Hot[] = ['hot', 'hard-hot'];
export const EMPTY_DSA_FILTER: DsaFilter = Object.freeze({ status: [], diff: [], tier: [], hot: [], labels: [], q: '' }) as DsaFilter;

export interface FilterRow {
  slug: string; name: string; d: string; pattern: string; tier: 'must' | 'optional'; flags: string[];
  own?: boolean; hidden?: boolean; done: boolean;
  /** The row's label ids (labelsOf), system and owner. */
  labels: string[];
}

export const tierOf = (r: Pick<FilterRow, 'tier' | 'own'>): Tier => (r.own ? 'yours' : r.tier);
export const isFilterEmpty = (f: DsaFilter) => !f.status.length && !f.diff.length && !f.tier.length && !f.hot.length && !f.labels.length && !f.q.trim();

const visibleLabels = (r: FilterRow) => (r.hidden ? r.labels.filter((id) => !id.startsWith('sys:freq:')) : r.labels);

/** Does the row pass the filter? `skip` leaves one facet out (for that facet's own counts). */
export function matchesFilter(r: FilterRow, f: DsaFilter, skip?: Facet): boolean {
  if (skip !== 'status' && f.status.length && !f.status.includes(r.done ? 'done' : 'todo')) return false;
  if (skip !== 'diff' && f.diff.length && (r.hidden || !f.diff.includes(r.d as Diff))) return false;
  if (skip !== 'tier' && f.tier.length && !f.tier.includes(tierOf(r))) return false;
  if (skip !== 'hot' && f.hot.length && (r.hidden || !f.hot.some((h) => r.flags.includes(h)))) return false;
  if (skip !== 'labels' && f.labels.length && !visibleLabels(r).some((id) => f.labels.includes(id))) return false;
  const q = f.q.trim().toLowerCase();
  if (q && (r.hidden || !(r.name.toLowerCase().includes(q) || r.slug.includes(q)))) return false;
  return true;
}

export const filterRows = <R extends FilterRow>(rows: R[], f: DsaFilter): R[] => rows.filter((r) => matchesFilter(r, f));

export interface FacetCounts { status: Record<Status, number>; diff: Record<Diff, number>; tier: Record<Tier, number>; hot: Record<Hot, number>; labels: Record<string, number> }
const zero = <K extends string>(ks: readonly K[]) => Object.fromEntries(ks.map((k) => [k, 0])) as Record<K, number>;

/** Per option, how many rows would show with that option on, given every other facet (and the search) as set. */
export function facetCounts(rows: FilterRow[], f: DsaFilter, labelIds: string[]): FacetCounts {
  const c: FacetCounts = { status: zero(STATUSES), diff: zero(DIFFS), tier: zero(TIERS), hot: zero(HOTS), labels: zero(labelIds) };
  for (const r of rows) {
    if (matchesFilter(r, f, 'status')) c.status[r.done ? 'done' : 'todo']++;
    if (!r.hidden && matchesFilter(r, f, 'diff') && (DIFFS as string[]).includes(r.d)) c.diff[r.d as Diff]++;
    if (matchesFilter(r, f, 'tier')) c.tier[tierOf(r)]++;
    if (!r.hidden && matchesFilter(r, f, 'hot')) for (const h of HOTS) if (r.flags.includes(h)) c.hot[h]++;
    if (matchesFilter(r, f, 'labels')) { const ls = visibleLabels(r); for (const id of labelIds) if (ls.includes(id)) c.labels[id]++; }
  }
  return c;
}

/** Drop label ids that no longer exist (deleted on another device); system labels always stay. Same object when nothing changes. */
export function liveFilter(f: DsaFilter, exists: (id: string) => boolean): DsaFilter {
  const labels = f.labels.filter((id) => id.startsWith('sys:') || exists(id));
  return labels.length === f.labels.length ? f : { ...f, labels };
}

/** A filter read back from storage. Malformed input gives the empty filter; unknown values are dropped. */
export function parseDsaFilter(raw: string | null | undefined): DsaFilter {
  let v: unknown;
  try { v = raw ? JSON.parse(raw) : null; } catch { return EMPTY_DSA_FILTER; }
  if (!v || typeof v !== 'object') return EMPTY_DSA_FILTER;
  const o = v as Record<string, unknown>;
  const pick = <T extends string>(x: unknown, ok?: readonly T[]): T[] => (Array.isArray(x) ? x.filter((y): y is T => typeof y === 'string' && (!ok || ok.includes(y as T))) : []);
  return { status: pick(o.status, STATUSES), diff: pick(o.diff, DIFFS), tier: pick(o.tier, TIERS), hot: pick(o.hot, HOTS), labels: pick<string>(o.labels), q: typeof o.q === 'string' ? o.q : '' };
}

export type DsaView = { kind: 'all' } | { kind: 'topic'; topic: string } | { kind: 'pattern'; id: string };
export interface TopicSection<R> { topic: string; groups: { pattern: string; rows: R[] }[] }

/** Rows in the view, grouped by topic then pattern in teaching order. Empty groups drop out, except the selected pattern's own. */
export function groupProblems<R extends { pattern: string }>(rows: R[], patterns: { id: string; topic: string }[], view: DsaView): TopicSection<R>[] {
  const inView = patterns.filter((p) => view.kind === 'all' || (view.kind === 'topic' ? p.topic === view.topic : p.id === view.id));
  const out: TopicSection<R>[] = [];
  for (const p of inView) {
    const rs = rows.filter((r) => r.pattern === p.id);
    if (!rs.length && view.kind !== 'pattern') continue;
    let t = out.find((x) => x.topic === p.topic);
    if (!t) out.push((t = { topic: p.topic, groups: [] }));
    t.groups.push({ pattern: p.id, rows: rs });
  }
  return out;
}
