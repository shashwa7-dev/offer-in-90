/* DSA page helpers (roadmap v2 §2): readiness dot, solve-log writing on tick, plan-day lookup. Pure: type-only imports. */
import type { SolveLog } from './state-types';

export type Dot = 'none' | 'check' | 'green';
/** ○ none, ◐ the unseen check passed, ● green. Green wins. */
export function readinessDot(g: { green: boolean; unseenCheckPassed: boolean }): Dot {
  return g.green ? 'green' : g.unseenCheckPassed ? 'check' : 'none';
}
export const DOT_GLYPH: Record<Dot, string> = { none: '○', check: '◐', green: '●' };
export const DOT_LABEL: Record<Dot, string> = { none: 'Not started', check: 'Unseen check passed', green: 'Green' };

export const namePrompt = 'Unseen problem · press Start';

/** The solve log a task id writes: `p-<slug>`, a re-solve `rs:<slug>:<k>` → `rs:<slug>`, a Phase 3 timed-set item → `p-<slug>`. */
export function solveKeyOf(taskId: string): string | null {
  if (taskId.startsWith('p-')) return taskId;
  if (taskId.startsWith('rs:')) { const slug = taskId.split(':')[1]; return slug ? `rs:${slug}` : null; }
  if (taskId.startsWith('dsa:timed-')) { const parts = taskId.split(':'); return parts.length >= 3 && parts[parts.length - 1] ? `p-${parts[parts.length - 1]}` : null; }
  return null;
}

type Solves = Record<string, SolveLog>;

/**
 * The solves map after a task's status changes. Ticking logs the problem (an unseen check defaults to unseen) unless it
 * is already logged; a re-solve tick always takes the new time. Un-ticking a problem removes its own log; a re-solve
 * or timed-set item leaves its log alone. Returns the same object when nothing changes.
 */
export function solveOnStatus(solves: Solves, taskId: string, next: string, now: number, unseenSlugs: ReadonlySet<string>): Solves {
  const key = solveKeyOf(taskId);
  if (!key) return solves;
  if (next === 'done') {
    if (key.startsWith('rs:')) return { ...solves, [key]: { unseen: false, at: now } };
    if (solves[key]) return solves;
    return { ...solves, [key]: { unseen: unseenSlugs.has(key.slice(2)), at: now } };
  }
  if (taskId === key && solves[key]) { const n = { ...solves }; delete n[key]; return n; }
  return solves;
}

/** Edit a solve log from the "solved without seeing it" box or the Minutes field. Keeps `at`; null minutes clears them. */
export function patchSolve(solves: Solves, key: string, patch: { unseen?: boolean; minutes?: number | null }, now: number): Solves {
  if (patch.minutes != null && !(patch.minutes >= 0 && Number.isFinite(patch.minutes))) throw new Error('minutes must be a number of 0 or more');
  const cur = solves[key] ?? { unseen: false, at: now };
  const n: SolveLog = { unseen: patch.unseen ?? cur.unseen, at: cur.at };
  const minutes = patch.minutes === undefined ? cur.minutes : patch.minutes;
  if (minutes != null) n.minutes = minutes;
  return { ...solves, [key]: n };
}

type PlanDays = { no: number; blocks: { tasks: { id: string; superseded?: true }[] }[] }[];
/** slug → day number of the first live copy of `p-<slug>` in the plan. Optional-pool and own problems are absent ("Pool"). */
export function planDayMap(days: PlanDays): Map<string, number> {
  const m = new Map<string, number>();
  for (const d of days) for (const b of d.blocks) for (const t of b.tasks) if (t.id.startsWith('p-') && !t.superseded && !m.has(t.id.slice(2))) m.set(t.id.slice(2), d.no);
  return m;
}
/** Day number of a problem in the plan (first live copy), or null. */
export const planDayOf = (days: PlanDays, slug: string): number | null => planDayMap(days).get(slug) ?? null;

export const ROUND_SCRIPT = [
  '2–3 clarifying questions.',
  'Brute force and its complexity.',
  'A better approach, then wait for a "go".',
  'Code while talking.',
  'Test normal and edge cases before saying "done".',
  'Answer "what if the input were 10× bigger?"',
];
