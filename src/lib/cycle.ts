/* Cycle (plan week) analytics, modelled on Plane's cycles. Pure; no React.
   Not started ~ unstarted, In progress ~ started, Done ~ completed, Skipped ~ cancelled.
   Imports are type-only: extensionless runtime imports don't resolve under node strip-types. */
import type { StatusMap, TaskStatus } from './task-status';
import type { TrackKey } from './timeline';

export type CycleUnit = 'tasks' | 'hours';
export interface CycleDayInput { i: number; week: number; date: Date; type: string; tasks: { id: string; cat: string; min: number; study: boolean; own?: string; /** Minutes after midnight when the task's block ends; missing = end of day. */ end?: number }[] }
export interface CycleSummary {
  week: number; from: Date; to: Date; daysLeft: number;
  byStatus: Record<TaskStatus, number>; total: number; pct: number;
  days: { i: number; date: Date; isToday: boolean; byStatus: Record<TaskStatus, number> }[];
  /** A skipped task is in both pending and ideal until the end of the day it was skipped, then leaves both, so skipping
      never shifts the trailing count by itself. `total` excludes skipped tasks (same scope as the summary total). */
  burndown: Record<CycleUnit, { pending: (number | null)[]; ideal: number[]; total: number }>;
  trailing: Record<CycleUnit, number | null>;
  /** progress = share of the track's (non-skipped) tasks in progress and not done (0..1); done/total are counts. */
  tracks: { track: TrackKey; name: string; done: number; progress: number; total: number }[];
}

// Same order and names as TRACKS in timeline.ts.
const TRACKS: { key: TrackKey; name: string }[] = [
  { key: 'dsa', name: 'DSA' }, { key: 'fe', name: 'Frontend & CS' }, { key: 'sd', name: 'System design' },
  { key: 'mc', name: 'Machine coding' }, { key: 'ai', name: 'AI' }, { key: 'career', name: 'Career' },
];
// Local copy of trackOfCat (task-filter.ts).
const CAT_TRACK: Record<string, TrackKey> = { dsa: 'dsa', fe: 'fe', sd: 'sd', mc: 'mc', proj: 'mc', ai: 'ai', beh: 'career', ux: 'career', fde: 'career' };
const trackOfCat = (cat: string): TrackKey | null => (Object.prototype.hasOwnProperty.call(CAT_TRACK, cat) ? CAT_TRACK[cat] : null);
// Local copy of statusOf (task-status.ts).
const statusOf = (id: string, done: Record<string, number>, status: StatusMap): TaskStatus => (done[id] ? 'done' : status[id] ?? 'todo');

const UNITS: CycleUnit[] = ['tasks', 'hours'];
const empty = (): Record<TaskStatus, number> => ({ todo: 0, progress: 0, done: 0, skipped: 0 });
const endOfDate = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime(); // local midnight after
const startOfDate = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

export function cycleOf(
  days: CycleDayInput[], week: number, done: Record<string, number>, status: StatusMap,
  meta: Record<string, number>, todayIdx: number, now: number,
  /** Minutes after midnight now. Today's tasks whose block ends later aren't due yet, so they don't count as trailing. */
  nowMin = 1440,
): CycleSummary | null {
  void now;
  const wk = days.filter((d) => d.week === week).sort((a, b) => a.i - b.i);
  if (!wk.length) return null;
  const start = startOfDate(wk[0].date);
  const byStatus = empty();
  const trk = new Map<TrackKey, { done: number; doing: number; total: number }>();
  // time each task stopped being pending; -Infinity = before the cycle
  const all: { day: number; min: number; resolved: number; skipped: boolean; end: number }[] = [];

  const dayRows = wk.map((d, k) => {
    const ds = empty();
    for (const t of d.tasks) {
      if (!t.study) continue;
      const st = statusOf(t.id, done, status);
      ds[st]++; byStatus[st]++;
      let resolved = Infinity;
      if (st === 'done') resolved = Math.max(done[t.id], start);
      else if (st === 'skipped') resolved = meta[`status/${t.id}`] ?? start;
      all.push({ day: k, min: t.min, resolved, skipped: st === 'skipped', end: t.end ?? 1440 });
      const tr = trackOfCat(t.cat);
      if (tr && st !== 'skipped') {
        const e = trk.get(tr) ?? { done: 0, doing: 0, total: 0 };
        e.total++; if (st === 'done') e.done++; else if (st === 'progress') e.doing++;
        trk.set(tr, e);
      }
    }
    return { i: d.i, date: d.date, isToday: d.i === todayIdx, byStatus: ds };
  });

  const total = byStatus.todo + byStatus.progress + byStatus.done;
  const todayK = wk.findIndex((d) => d.i === todayIdx);
  const burndown = {} as CycleSummary['burndown'];
  const trailing = {} as CycleSummary['trailing'];
  for (const u of UNITS) {
    // Sum in integers (minutes), divide by 60 once, so hours carry no accumulated float noise.
    const w = (x: { min: number }) => (u === 'tasks' ? 1 : x.min);
    const out = (n: number) => (u === 'tasks' ? n : n / 60);
    const sum = (f: (x: (typeof all)[number]) => boolean) => all.reduce((a, x) => a + (f(x) ? w(x) : 0), 0);
    const tot = out(sum((x) => !x.skipped));
    const ideal = wk.map((d, k) => out(sum((x) => x.day > k && !(x.skipped && x.resolved < endOfDate(d.date)))));
    const pending = wk.map((d) => (d.i > todayIdx ? null : out(sum((x) => x.resolved >= endOfDate(d.date)))));
    burndown[u] = { pending, ideal, total: tot };
    // Scheduled-by-now: what is still planned after this moment (later days, or today's blocks that end after now).
    let idealNow = 0;
    if (todayK >= 0) {
      const eod = endOfDate(wk[todayK].date);
      idealNow = out(sum((x) => (x.day > todayK || (x.day === todayK && x.end > nowMin)) && !(x.skipped && x.resolved < eod)));
    }
    trailing[u] = todayK < 0 ? null : Math.round(((pending[todayK] as number) - idealNow) * 1e6) / 1e6;
  }

  return {
    week, from: wk[0].date, to: wk[wk.length - 1].date,
    daysLeft: wk.filter((d) => d.i >= todayIdx).length,
    byStatus, total, pct: total ? byStatus.done / total : 0,
    days: dayRows, burndown, trailing,
    tracks: TRACKS.filter((t) => trk.get(t.key)?.total).map((t) => {
      const e = trk.get(t.key)!;
      return { track: t.key, name: t.name, done: e.done, progress: e.doing / e.total, total: e.total };
    }),
  };
}

/** Previous, current and next cycle (first two / last two at the ends of the plan). */
export function cycleList(
  days: CycleDayInput[], todayIdx: number, done: Record<string, number>, status: StatusMap,
  meta: Record<string, number>, now: number,
): { week: number; pct: number; state: 'current' | 'upcoming' | 'past' }[] {
  const weeks = [...new Set(days.map((d) => d.week))].sort((a, b) => a - b);
  if (!weeks.length) return [];
  const todayDay = days.find((d) => d.i === todayIdx);
  const cur = todayDay ? todayDay.week
    : todayIdx < Math.min(...days.map((d) => d.i)) ? weeks[0] : weeks[weeks.length - 1];
  const ci = weeks.indexOf(cur);
  return weeks.slice(Math.max(0, ci - 1), ci + 2).map((week) => ({
    week,
    pct: cycleOf(days, week, done, status, meta, todayIdx, now)!.pct,
    state: week === cur ? 'current' : week < cur ? 'past' : 'upcoming',
  }));
}
