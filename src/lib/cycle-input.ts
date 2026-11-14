/* Shared by the Today rail, Roadmap › Weeks and the sidebar Cycles (kept here so those components don't import each other). */
import { type Day, study, toMin } from './engine';
import type { CycleDayInput } from './cycle';

/** Engine days as cycle input (own tasks are already merged into d.tasks). `end` is the task's block end, so
    today's later blocks don't count as trailing; own tasks take the end of the block they were added to. */
export const toCycleDays = (days: Day[]): CycleDayInput[] =>
  days.map(d => {
    const endOf = new Map(d.blocks.map(b => [b.k, toMin(b.e)]));
    return { i: d.i, week: d.week, date: d.date, type: d.type, tasks: d.tasks.map(t => ({ id: t.id, cat: t.cat, min: t.min, study: study(t), own: t.own, end: endOf.get(t.bk) })) };
  });

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** "5–11 Nov", or "29 Nov – 5 Dec" across a month boundary. */
export const dateRange = (a: Date, b: Date) => a.getMonth() === b.getMonth()
  ? `${a.getDate()}–${b.getDate()} ${MON[b.getMonth()]}`
  : `${a.getDate()} ${MON[a.getMonth()]} – ${b.getDate()} ${MON[b.getMonth()]}`;
