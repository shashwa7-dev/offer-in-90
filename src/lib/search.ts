/* ⌘K search: one index over plan tasks, notes, interview posts and daily reads. Pure; no runtime imports
   (node strip-types tests). Every word of the query must match (AND, case-insensitive); a hit whose title holds
   every word ranks above one that needs its body or meta. Ties: earliest day for tasks, newest update for notes. */

export type Hit =
  | { kind: 'task'; id: string; dayIdx: number; title: string; meta: string }
  | { kind: 'note'; key: string; noteKind: 'page' | 'task'; title: string; meta: string }
  | { kind: 'post'; url: string; title: string; meta: string }
  | { kind: 'read'; id: string; url: string; title: string; meta: string }
  | { kind: 'day'; dayIdx: number; title: string; meta: string };

export interface SearchIndex { tasks: Hit[]; notes: Hit[]; posts: Hit[]; reads: Hit[]; dayCount: number; dayIdxOfNo: Record<number, number> }

export type SearchGroup = 'Tasks' | 'Notes' | 'Interviews' | 'Reads' | 'Go to';

export interface SearchInput {
  /** Plan days; `track` is the task's track name (omitted when it has none). */
  days: { i: number; no: number; date?: Date; tasks: { id: string; text: string; cat: string; own?: string; track?: string }[] }[];
  pages: Record<string, { title: string; body: string; upd?: number }>;
  tnotes: Record<string, { title: string; body: string; upd?: number }>;
  posts: { company: string; title: string; url: string }[];
  reads: { id: string; title: string; url: string; source: string; category?: string }[];
  /** Clock for the "Page · 3 h ago" meta (default Date.now()). */
  now?: number;
}

/** Lower-cased title, lower-cased title+body+meta, and the tie-break order (lower first). Kept off the hit. */
const KEYS = new WeakMap<Hit, { t: string; h: string; o: number }>();
const put = (hit: Hit, body: string, o: number) => { KEYS.set(hit, { t: hit.title.toLowerCase(), h: `${hit.title} ${body} ${hit.meta}`.toLowerCase(), o }); return hit; };

const domain = (url: string) => { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; } };
const ago = (ts: number, now: number) => { const m = Math.round((now - ts) / 6e4); return m < 1 ? 'just now' : m < 60 ? `${m} min ago` : m < 1440 ? `${Math.round(m / 60)} h ago` : `${Math.round(m / 1440)} d ago`; };
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function buildIndex(input: SearchInput): SearchIndex {
  const now = input.now ?? Date.now();
  const tasks: Hit[] = [];
  const dayIdxOfNo: Record<number, number> = {};
  let n = 0;
  for (const d of input.days) {
    dayIdxOfNo[d.no] = d.i;
    for (const t of d.tasks) {
      const meta = `Day ${d.no}${t.track ? ` · ${t.track}` : ''}`;
      tasks.push(put({ kind: 'task', id: t.id, dayIdx: d.i, title: t.text, meta }, '', n++));
    }
  }
  const notes: Hit[] = [];
  for (const [id, p] of Object.entries(input.pages)) {
    const upd = p.upd ?? 0;
    notes.push(put({ kind: 'note', key: id, noteKind: 'page', title: p.title || 'Untitled', meta: upd ? `Page · ${ago(upd, now)}` : 'Page' }, p.body, -upd));
  }
  for (const [key, t] of Object.entries(input.tnotes)) {
    if (!t.body.trim()) continue;
    notes.push(put({ kind: 'note', key, noteKind: 'task', title: t.title || 'Untitled', meta: 'Note' }, t.body, -(t.upd ?? 0)));
  }
  const posts = input.posts.map((p, i) => put({ kind: 'post', url: p.url, title: p.title.trim(), meta: `#${p.company} · ${domain(p.url)}` }, '', i));
  const reads = input.reads.map((r, i) => put({ kind: 'read', id: r.id, url: r.url, title: r.title.trim(), meta: `${r.source} · ${domain(r.url)}` }, r.category ?? '', i));
  const ix: SearchIndex = { tasks, notes, posts, reads, dayCount: input.days.length, dayIdxOfNo };
  // Date labels for "Go to Day N" (e.g. "Sat 14 Nov").
  const dates: Record<number, string> = {};
  for (const d of input.days) if (d.date) dates[d.i] = `${DOW[d.date.getDay()]} ${d.date.getDate()} ${MON[d.date.getMonth()]}`;
  DATES.set(ix, dates);
  return ix;
}
const DATES = new WeakMap<SearchIndex, Record<number, string>>();

function rank(list: Hit[], words: string[], limit: number): Hit[] {
  const scored: { h: Hit; s: number; o: number }[] = [];
  for (const h of list) {
    const k = KEYS.get(h);
    if (!k || !words.every(w => k.h.includes(w))) continue;
    scored.push({ h, s: words.every(w => k.t.includes(w)) ? 2 : 1, o: k.o });
  }
  scored.sort((a, b) => b.s - a.s || a.o - b.o);
  return scored.slice(0, limit).map(x => x.h);
}

export function search(ix: SearchIndex, q: string, limitPerGroup = 6): { group: SearchGroup; hits: Hit[] }[] {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const out: { group: SearchGroup; hits: Hit[] }[] = [];
  const t = q.trim();
  if (/^\d+$/.test(t)) {
    const no = Number(t);
    const i = ix.dayIdxOfNo[no];
    if (no <= 91 && i !== undefined && i < ix.dayCount) out.push({ group: 'Go to', hits: [{ kind: 'day', dayIdx: i, title: `Go to Day ${no}`, meta: DATES.get(ix)?.[i] ?? '' }] });
  }
  const groups: [SearchGroup, Hit[]][] = [['Tasks', ix.tasks], ['Notes', ix.notes], ['Interviews', ix.posts], ['Reads', ix.reads]];
  for (const [group, list] of groups) {
    const hits = rank(list, words, limitPerGroup);
    if (hits.length) out.push({ group, hits });
  }
  return out;
}
