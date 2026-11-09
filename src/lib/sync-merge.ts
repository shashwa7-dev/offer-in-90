/*
 * Per-item merge for syncing between devices.
 * Every tick, flag, log, note, page and setting has its own "last changed" time in `meta`,
 * including deletions (an entry in meta with the item absent = deleted at that time).
 * Merging takes the newest version of each item, so edits on two devices never overwrite each other.
 */

export const MAPS = ['done', 'flags', 'notes', 'tnotes', 'pages', 'seenUpdates'] as const;
export const SCALARS = ['start', 'kickoff'] as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Doc = Record<string, any> & { meta?: Record<string, number>; updatedAt?: number };

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/** Record a change time for every item that differs between prev and next. */
export function stamp<T extends Doc>(prev: T, next: T, now = Date.now()): T {
  const meta = { ...(prev.meta || {}), ...(next.meta || {}) };
  for (const m of MAPS) {
    const a = prev[m] || {}, b = next[m] || {};
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) if (!same(a[k], b[k])) meta[`${m}/${k}`] = now;
  }
  for (const s of SCALARS) if (!same(prev[s], next[s])) meta[s] = now;
  return { ...next, meta, updatedAt: now };
}

/** Merge two copies item by item. The newer change wins; on a tie (or no history), local wins and items from both sides are kept. */
export function merge<T extends Doc>(local: T, remote: T): T {
  const lm = local.meta || {}, rm = remote.meta || {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const out: any = { ...local, meta: {} as Record<string, number> };
  for (const m of MAPS) {
    const a = local[m] || {}, b = remote[m] || {}, res: Record<string, unknown> = {};
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
      const p = `${m}/${k}`, tl = lm[p] || 0, tr = rm[p] || 0;
      const src = tr > tl ? b : tl > tr ? a : (k in a ? a : b);
      if (k in src) res[k] = src[k];
      if (tl || tr) out.meta[p] = Math.max(tl, tr);
    }
    // deletions recorded only on one side for items the other side never had: nothing to add
    out[m] = res;
  }
  for (const s of SCALARS) {
    const tl = lm[s] || 0, tr = rm[s] || 0;
    // Settings tie (no history on either side): keep the synced copy, so a new device can't reset your start date.
    out[s] = tr > tl ? remote[s] : tl > tr ? local[s] : (remote[s] ?? local[s]);
    if (tl || tr) out.meta[s] = Math.max(tl, tr);
  }
  // keep tombstones from both sides so deletions keep winning on future merges
  for (const [p, t] of Object.entries({ ...rm, ...lm })) out.meta[p] = Math.max(out.meta[p] || 0, lm[p] || 0, rm[p] || 0, t);
  out.updatedAt = Math.max(local.updatedAt || 0, remote.updatedAt || 0);
  return out as T;
}

/** True when two copies hold the same data (ignoring bookkeeping). */
export function sameData(a: Doc, b: Doc) {
  return [...MAPS, ...SCALARS].every(k => same(a[k], b[k]));
}
