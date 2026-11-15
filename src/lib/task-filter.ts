/* Filter logic for the Today page filter bar. Pure; no React. */
import type { StatusMap, TaskStatus } from './task-status';
import type { TrackKey } from './timeline';

export type GroupBy = 'time' | 'status' | 'track';
export interface TaskFilter {
  status: 'all' | TaskStatus;
  tracks: TrackKey[];
  blocks: string[];
  /** Label ids, matching ANY: owner labels and system ids (sys:source:yours, sys:pattern:dp, ...). */
  labels: string[];
  diff: ('E' | 'M' | 'H')[];
}

export const EMPTY_FILTER: TaskFilter = { status: 'all', tracks: [], blocks: [], labels: [], diff: [] };

const CAT_TRACK: Record<string, TrackKey> = { dsa: 'dsa', fe: 'fe', sd: 'sd', mc: 'mc', proj: 'mc', ai: 'ai', beh: 'career', ux: 'career', fde: 'career' };
const TRACKS: TrackKey[] = ['dsa', 'fe', 'sd', 'mc', 'ai', 'career'];
const STATUSES = ['all', 'todo', 'progress', 'done', 'skipped'];
const DIFFS = ['E', 'M', 'H'];

export function trackOfCat(cat: string): TrackKey | null {
  return Object.prototype.hasOwnProperty.call(CAT_TRACK, cat) ? CAT_TRACK[cat] : null;
}

export function isActive(f: TaskFilter): boolean {
  return f.status !== 'all' || f.tracks.length > 0 || f.blocks.length > 0 || f.labels.length > 0 || f.diff.length > 0;
}

// Local copy of statusOf (task-status.ts): extensionless imports don't resolve under node strip-types.
function statusOf(id: string, done: Record<string, number>, status: StatusMap): TaskStatus {
  return done[id] ? 'done' : status[id] ?? 'todo';
}

type FilterTask = { id: string; cat: string; own?: string; diff?: 'E' | 'M' | 'H'; pattern?: string; tier?: string; flags?: string[]; depth?: boolean; flagged?: boolean; hiddenUntilStart?: boolean };

/** System label ids of a task (local copy of systemLabelsFor in labels.ts, for the same import reason). */
function systemIds(t: FilterTask, showPattern: boolean): string[] {
  const out: string[] = [];
  if (t.pattern && showPattern) out.push(`sys:pattern:${t.pattern}`);
  if (t.tier) out.push(`sys:tier:${t.tier}`);
  for (const x of t.flags || []) out.push(`sys:freq:${x}`);
  out.push(t.own ? 'sys:source:yours' : 'sys:source:plan');
  if (t.flagged) out.push('sys:flagged');
  if (t.depth) out.push('sys:depth');
  return out;
}

export function matches(
  t: FilterTask,
  blockKey: string, f: TaskFilter, done: Record<string, number>, status: StatusMap,
  itemLabels: Record<string, string[]> = {},
): boolean {
  const st = statusOf(t.id, done, status);
  if (f.status !== 'all' && st !== f.status) return false;
  if (f.tracks.length) {
    const tr = trackOfCat(t.cat);
    if (!tr || !f.tracks.includes(tr)) return false;
  }
  if (f.blocks.length && !f.blocks.includes(blockKey)) return false;
  if (f.labels.length) {
    // An unseen problem keeps its pattern hidden until Start.
    const ids = [...(itemLabels[t.id] || []), ...systemIds(t, !(t.hiddenUntilStart && st === 'todo'))];
    if (!f.labels.some(l => ids.includes(l))) return false;
  }
  if (f.diff.length && (!t.diff || !f.diff.includes(t.diff))) return false;
  return true;
}

export function statusCounts(tasks: { id: string }[], done: Record<string, number>, status: StatusMap): Record<'all' | TaskStatus, number> {
  const c: Record<'all' | TaskStatus, number> = { all: 0, todo: 0, progress: 0, done: 0, skipped: 0 };
  for (const t of tasks) { c.all++; c[statusOf(t.id, done, status)]++; }
  return c;
}

const empty = (): TaskFilter => ({ status: 'all', tracks: [], blocks: [], labels: [], diff: [] });

/** Tolerant of junk: bad fields fall back to defaults, unknown list items are dropped. */
export function parseFilter(raw: unknown): { filter: TaskFilter; groupBy: GroupBy } {
  const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const f = o.filter && typeof o.filter === 'object' ? (o.filter as Record<string, unknown>) : {};
  const filter = empty();
  if (typeof f.status === 'string' && STATUSES.includes(f.status)) filter.status = f.status as TaskFilter['status'];
  if (Array.isArray(f.tracks)) filter.tracks = f.tracks.filter((x): x is TrackKey => TRACKS.includes(x));
  if (Array.isArray(f.blocks)) filter.blocks = f.blocks.filter((x): x is string => typeof x === 'string');
  if (Array.isArray(f.labels)) filter.labels = f.labels.filter((x): x is string => typeof x === 'string');
  // Old saved filters had Yours / Plan: that is now the Source system label.
  if ((f.owner === 'own' || f.owner === 'plan') && !filter.labels.some(l => l.startsWith('sys:source:'))) filter.labels.push(f.owner === 'own' ? 'sys:source:yours' : 'sys:source:plan');
  if (Array.isArray(f.diff)) filter.diff = f.diff.filter((x): x is 'E' | 'M' | 'H' => DIFFS.includes(x));
  const groupBy: GroupBy = o.groupBy === 'status' || o.groupBy === 'track' ? o.groupBy : 'time';
  return { filter, groupBy };
}
