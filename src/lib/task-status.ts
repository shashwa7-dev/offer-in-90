/* Task statuses. "done" lives in state.done (timestamp); state.status holds only 'progress' | 'skipped'. */
export type TaskStatus = 'todo' | 'progress' | 'done' | 'skipped';
export type StatusMap = Record<string, 'progress' | 'skipped'>;

export const STATUS_LABEL: Record<TaskStatus, string> = { todo: 'Not started', progress: 'In progress', done: 'Done', skipped: 'Skipped' };

/** Done wins over any stored status. */
export function statusOf(id: string, done: Record<string, number>, status: StatusMap): TaskStatus {
  return done[id] ? 'done' : status[id] ?? 'todo';
}

export function applyStatus(s: { done: Record<string, number>; status: StatusMap }, id: string, next: TaskStatus, now: number): { done: Record<string, number>; status: StatusMap } {
  const done = { ...s.done }, status = { ...s.status };
  delete status[id];
  if (next === 'done') { done[id] = done[id] || now; }
  else {
    delete done[id];
    if (next === 'progress' || next === 'skipped') status[id] = next;
  }
  return { done, status };
}

/** Counts over study tasks. Skipped tasks are left out of n/total/minutes (and so out of rings and "behind"). */
export function studyCounts(tasks: { id: string; min: number; study: boolean }[], done: Record<string, number>, status: StatusMap) {
  const byStatus: Record<TaskStatus, number> = { todo: 0, progress: 0, done: 0, skipped: 0 };
  let n = 0, total = 0, doneMin = 0, planMin = 0;
  for (const t of tasks) {
    if (!t.study) continue;
    const st = statusOf(t.id, done, status);
    byStatus[st]++;
    if (st === 'skipped') continue;
    total++; planMin += t.min;
    if (st === 'done') { n++; doneMin += t.min; }
  }
  return { n, total, doneMin, planMin, byStatus };
}

/** Skipped and not done: left out of counts, rings and "missed". */
export function isSkipped(id: string, done: Record<string, number>, status: StatusMap): boolean {
  return !done[id] && status[id] === 'skipped';
}

/** A task that counts (not health, optional or a superseded copy, R12), the same rule as engine `study`. */
export function counts(t: { cat: string; optional?: boolean; superseded?: true }): boolean {
  return t.cat !== 'health' && !t.optional && !t.superseded;
}
/** Still owed: it counts and is neither done nor skipped. Only these make a block, a row or a day "missed". */
export function owes(t: { id: string; cat: string; optional?: boolean; superseded?: true }, done: Record<string, number>, status: StatusMap): boolean {
  return counts(t) && !done[t.id] && !isSkipped(t.id, done, status);
}
/** Nothing left to do: done, skipped, or a superseded copy (history only). */
export function settled(t: { id: string; superseded?: true }, done: Record<string, number>, status: StatusMap): boolean {
  return !!t.superseded || !!done[t.id] || isSkipped(t.id, done, status);
}

/** Share done for a day or block; null when nothing counts (empty or all skipped), so it is neutral rather than 0%. */
export function rate(c: { n: number; total: number }): number | null {
  return c.total > 0 ? c.n / c.total : null;
}

/** Consecutive good days ending at the newest one. Neutral (null) days are skipped, a weak day ends the run. */
export function goodStreak(rates: (number | null)[], good = 0.8): number {
  let k = 0;
  for (let i = rates.length - 1; i >= 0; i--) {
    const r = rates[i];
    if (r === null) continue;
    if (r >= good) k++; else break;
  }
  return k;
}

/** An unseen check stays anonymous (name, pattern, difficulty and hints hidden) until it is started or done; skipping
 * it does not reveal it. */
export function unseenHidden(hiddenUntilStart: boolean | undefined, st: TaskStatus): boolean {
  return !!hiddenUntilStart && (st === 'todo' || st === 'skipped');
}
