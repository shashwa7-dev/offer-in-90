/* Sunday helpers (roadmap v2 §11, §17): score fields, the Scores table, the burnout guard. Pure: no imports. */

export type ScoreSection = 'dsa' | 'fe' | 'sd' | 'ai';
export const SCORE_SECTIONS: { key: ScoreSection; label: string }[] = [
  { key: 'dsa', label: 'DSA' }, { key: 'fe', label: 'Frontend & CS' }, { key: 'sd', label: 'System design' }, { key: 'ai', label: 'AI' },
];

/** A hand-typed score: a whole number 0–100, or null (empty or invalid). */
export function parseScore(raw: string): number | null {
  const s = raw.trim();
  if (!/^\d{1,3}$/.test(s)) return null;
  const n = Number(s);
  return n >= 0 && n <= 100 ? n : null;
}

/** The `scores` keys one task asks for. `baseline/<section>` is one field; `w<n>` is the weekly self-check (all four sections). */
export function scoreFields(scoreKey: string): { key: string; label: string }[] {
  if (scoreKey.includes('/')) return [{ key: scoreKey, label: 'Score' }];
  return SCORE_SECTIONS.map((s) => ({ key: `${scoreKey}/${s.key}`, label: s.label }));
}

/** Set one score (a new map; null clears it). */
export function withScore(scores: Record<string, number>, key: string, value: number | null): Record<string, number> {
  const next = { ...scores };
  if (value === null) delete next[key]; else next[key] = value;
  return next;
}

/** The Scores table: one column for the baseline (when any is entered) and one per plan week (calendar week, `w<week>`) with a score, one row per section. */
export function scoreTable(scores: Record<string, number>): { columns: { id: string; label: string }[]; rows: { section: ScoreSection; label: string; cells: (number | null)[] }[] } {
  const weeks = new Set<number>();
  let baseline = false;
  for (const k of Object.keys(scores)) {
    const m = /^w(\d+)\//.exec(k);
    if (m) weeks.add(Number(m[1])); else if (k.startsWith('baseline/')) baseline = true;
  }
  const columns = [...(baseline ? [{ id: 'baseline', label: 'Baseline' }] : []), ...[...weeks].sort((a, b) => a - b).map((w) => ({ id: `w${w}`, label: `Week ${w}` }))];
  const rows = SCORE_SECTIONS.map((s) => ({ section: s.key, label: s.label, cells: columns.map((c) => scores[`${c.id}/${s.key}`] ?? null) }))
    .filter((r) => r.cells.some((c) => c !== null));
  return { columns, rows };
}

/** §17 burnout guard: more than 8 h behind on a Saturday or Sunday (getDay 6 or 0). */
export function burnoutGuard(behindMin: number, dow: number): boolean {
  return behindMin > 480 && (dow === 0 || dow === 6);
}

/** Index of the first Sunday on or after `from` (null when none is left). */
export function comingSunday(days: { i: number; type: string }[], from: number): number | null {
  const d = days.find((x) => x.type === 'sun' && x.i >= from);
  return d ? d.i : null;
}

/** Optional tasks last, order otherwise kept. */
export function optionalLast<T extends { optional?: boolean }>(tasks: T[]): T[] {
  return [...tasks.filter((t) => !t.optional), ...tasks.filter((t) => t.optional)];
}
