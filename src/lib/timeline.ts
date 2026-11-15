// Roadmap stages and Today day bands. Pure: no runtime imports.
export type TrackKey = 'dsa' | 'ai' | 'sd' | 'mc' | 'platform' | 'career' | 'fe';

/** Progress and filter tracks (v3). Keyed by task category through trackOfCat (task-filter.ts), not by TrackId. */
export const TRACKS: { key: TrackKey; name: string }[] = [
  { key: 'dsa', name: 'DSA' },
  { key: 'ai', name: 'AI engineering' },
  { key: 'sd', name: 'Systems' },
  { key: 'mc', name: 'Product' },
  { key: 'platform', name: 'Platform' },
  { key: 'career', name: 'Career' },
  { key: 'fe', name: 'Frontend' },
];

export interface TimelineDay {
  week: number;
  s?: number;
  type: string;
  tasks: { id: string; cat: string; own?: string; pattern?: string; superseded?: true }[];
}

export interface Stage {
  track: TrackKey;
  label: string;
  /** Matches by content ID, category and pattern (never by study-day position, which moves with the mode). */
  match: (t: { id: string; cat: string; pattern?: string }) => boolean;
}

/** The first 12 DSA patterns (arrays to tries); the other 12 are heaps to bits. */
const EARLY_PATTERNS = new Set(['hash-map', 'prefix-sum', 'two-pointers', 'sliding-window', 'stack-monotonic', 'binary-search', 'cyclic-sort', 'fast-slow', 'll-reversal', 'tree-bfs', 'tree-dfs', 'trie']);
/** A morning pattern task: a problem, its pattern card or explain-back (not a re-solve or drill). */
const morning = (t: { id: string; pattern?: string }) => !!t.pattern && /^(p-|dsa:card-|dsa:explain-back-)/.test(t.id);
const FE_REVISION = /^fe:(revise|bfe)-/;
const FE_SD = /^sd:(internet|fe-)/;

export const STAGES: Stage[] = [
  { track: 'dsa', label: 'Foundations, arrays → tries', match: (t) => t.id.startsWith('dsa:foundations-') || (morning(t) && EARLY_PATTERNS.has(t.pattern!)) },
  { track: 'dsa', label: 'Heaps, graphs, DP, greedy', match: (t) => morning(t) && !EARLY_PATTERNS.has(t.pattern!) },
  { track: 'dsa', label: 'Advanced + timed sets + OA', match: (t) => /^(adv:|dsa:(timed-|oa-|google-|meta-|revisit-|ai-drill-))/.test(t.id) },
  { track: 'fe', label: 'JS, browser, React, web', match: (t) => t.id.startsWith('fe:') && !FE_REVISION.test(t.id) },
  { track: 'fe', label: 'Revision + quizzes', match: (t) => FE_REVISION.test(t.id) },
  { track: 'sd', label: 'Frontend system design', match: (t) => FE_SD.test(t.id) },
  { track: 'sd', label: 'HLD concepts + design problems', match: (t) => t.id.startsWith('sd:') && !FE_SD.test(t.id) },
  { track: 'sd', label: 'Mocks', match: (t) => t.id.startsWith('sdm:') },
  { track: 'mc', label: 'Builds + LLD Saturdays', match: (t) => /^(mc:|lld:)/.test(t.id) && !t.id.endsWith(':timed') },
  { track: 'mc', label: 'Flagship product', match: (t) => t.cat === 'proj' },
  { track: 'mc', label: 'Timed rebuilds', match: (t) => t.id.endsWith(':timed') },
  { track: 'ai', label: 'AI build', match: (t) => t.id.startsWith('aib:') },
  { track: 'ai', label: 'Papers, courses, AI design', match: (t) => t.id.startsWith('ai:') && !t.id.startsWith('ai:review-') && !t.id.startsWith('ai:revisit-') },
  { track: 'ai', label: 'Explain-it-back reviews', match: (t) => t.id.startsWith('ai:review-') || t.id.startsWith('ai:revisit-') },
  { track: 'career', label: 'Resume, LP stories, UX', match: (t) => t.id.startsWith('beh:') || t.id.startsWith('ux:') },
  { track: 'career', label: 'Forward-deployed', match: (t) => t.id.startsWith('fde:') },
];

export interface StageBar {
  track: TrackKey;
  label: string;
  fromWeek: number;
  toWeek: number;
  done: number;
  total: number;
}

/** Skipped (not done, status 'skipped') tasks are left out of totals. Local predicate: this module has no runtime imports. */
const isSkippedTask = (id: string, done: Record<string, number>, status: Record<string, 'progress' | 'skipped'>) => !done[id] && status[id] === 'skipped';

export function stageBars(days: TimelineDay[], done: Record<string, number>, status: Record<string, 'progress' | 'skipped'> = {}): StageBar[] {
  const bars: (StageBar | null)[] = STAGES.map(() => null);
  for (const d of days) {
    if (d.s == null) continue;
    for (const t of d.tasks) {
      if (t.own || t.superseded) continue;
      const i = STAGES.findIndex((st) => st.match(t));
      if (i < 0 || isSkippedTask(t.id, done, status)) continue;
      const b = bars[i] ?? (bars[i] = { track: STAGES[i].track, label: STAGES[i].label, fromWeek: d.week, toWeek: d.week, done: 0, total: 0 });
      b.fromWeek = Math.min(b.fromWeek, d.week);
      b.toWeek = Math.max(b.toWeek, d.week);
      b.total++;
      if (done[t.id]) b.done++;
    }
  }
  return bars.filter((b): b is StageBar => b !== null);
}

export type Band = 'morning' | 'afternoon' | 'evening';

export function bandOf(start: string): Band {
  const m = Number(start.slice(0, 2)) * 60 + Number(start.slice(3, 5));
  return m < 720 ? 'morning' : m < 1020 ? 'afternoon' : 'evening';
}
