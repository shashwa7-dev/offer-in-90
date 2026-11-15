/* DSA page helpers (roadmap v2 §2): readiness dot, solve-log writing on tick, plan-day lookup. Pure: type-only imports. */
import type { SolveLog } from './state-types';

export type Dot = 'none' | 'check' | 'green';
/** none, the unseen check passed, green (the page draws each as a lucide icon). Green wins. */
export function readinessDot(g: { green: boolean; unseenCheckPassed: boolean }): Dot {
  return g.green ? 'green' : g.unseenCheckPassed ? 'check' : 'none';
}
export const DOT_LABEL: Record<Dot, string> = { none: 'Not started', check: 'Unseen check passed', green: 'Green' };

/** A Phase 3 set item (`dsa:google-1:<slug>`, also meta and revisit; v2 `dsa:timed-…`). */
export const PHASE3_SET = /^dsa:(timed-|google-|meta-|revisit-)/;

export const namePrompt = 'Unseen problem · press Start';

/** The solve log a task id writes: `p-<slug>`, a re-solve `rs:<slug>:<k>` → `rs:<slug>`, a Phase 3 timed-set item → `p-<slug>`. */
export function solveKeyOf(taskId: string): string | null {
  if (taskId.startsWith('p-')) return taskId;
  if (taskId.startsWith('rs:')) { const slug = taskId.split(':')[1]; return slug ? `rs:${slug}` : null; }
  if (PHASE3_SET.test(taskId)) { const parts = taskId.split(':'); return parts.length >= 3 && parts[parts.length - 1] ? `p-${parts[parts.length - 1]}` : null; }
  return null;
}

type Solves = Record<string, SolveLog>;

/**
 * The solves map after a task's status changes (R14: a log exists only while the task that created it is done).
 * Ticking a problem logs it (an unseen check defaults to unseen) unless already logged; a re-solve tick takes the new time;
 * a timed-set tick creates `p-<slug>` with `via: <task id>` when none exists. Un-ticking `p-<slug>` removes its log; un-ticking
 * `rs:<slug>:<k>` removes `rs:<slug>` unless another re-solve of that slug is still done; un-ticking a timed item removes the log
 * only if it created it. `done` is the done map before the change. Returns the same object when nothing changes.
 */
export function solveOnStatus(solves: Solves, taskId: string, next: string, now: number, unseenSlugs: ReadonlySet<string>, done: Record<string, number> = {}): Solves {
  const key = solveKeyOf(taskId);
  if (!key) return solves;
  const own = taskId === key;
  if (next === 'done') {
    if (key.startsWith('rs:')) return { ...solves, [key]: { unseen: false, at: now } };
    const cur = solves[key];
    if (cur) {
      if (own && cur.via) { const { via: _v, ...rest } = cur; void _v; return { ...solves, [key]: rest }; } // the problem itself now owns the log
      return solves;
    }
    return { ...solves, [key]: { unseen: unseenSlugs.has(key.slice(2)), at: now, ...(own ? {} : { via: taskId }) } };
  }
  const cur = solves[key];
  if (!cur) return solves;
  if (key.startsWith('rs:')) {
    const slug = key.slice(3);
    if (Object.keys(done).some((id) => id !== taskId && done[id] && id.startsWith(`rs:${slug}:`))) return solves;
  } else if (!own && cur.via !== taskId) return solves;
  const n = { ...solves }; delete n[key]; return n;
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
/** slug → the day numbers of its live re-solve copies (`rs:<slug>:<k>`), sorted and unique. */
export function resolveDayMap(days: PlanDays): Map<string, number[]> {
  const m = new Map<string, number[]>();
  for (const d of days) for (const b of d.blocks) for (const t of b.tasks) {
    if (!t.id.startsWith('rs:') || t.superseded) continue;
    const slug = t.id.split(':')[1];
    if (!slug) continue;
    const xs = m.get(slug) ?? [];
    if (!xs.includes(d.no)) xs.push(d.no);
    m.set(slug, xs);
  }
  for (const xs of m.values()) xs.sort((a, b) => a - b);
  return m;
}

/** The pattern the plan teaches on day index `idx` (its card or a must-solve, live copies only), or null. */
export function todayPattern(days: { blocks: { tasks: { id: string; pattern?: string; superseded?: true }[] }[] }[], idx: number): string | null {
  for (const b of days[idx]?.blocks ?? []) for (const t of b.tasks)
    if (t.pattern && !t.superseded && (t.id.startsWith('p-') || t.id.startsWith('dsa:card-') || t.id.startsWith('dsa:explain-back-'))) return t.pattern;
  return null;
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
