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
