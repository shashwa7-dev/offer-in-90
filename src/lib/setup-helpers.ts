/* Pure helpers for the Setup page: Monday snapping, the routine form, the overflow line. No runtime imports. */
import type { RoutineKey, RoutineSlot } from './state-types';

const pad = (n: number) => String(n).padStart(2, '0');
const isoOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** The ISO date of `todayIso` if it is a Monday, else of the next Monday. */
export function nextMonday(todayIso: string): string {
  const [y, m, d] = todayIso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + ((8 - date.getDay()) % 7));
  return isoOf(date);
}

/** One routine row as typed: the minutes stay text until saved. */
export type RoutineDraft = { on: boolean; title: string; s: string; min: string };

export const toDraft = (x: RoutineSlot): RoutineDraft => ({ on: x.on, title: x.title, s: x.s, min: String(x.min) });

/** A row → a slot. Minutes that are not a whole number become NaN, which validateRoutine rejects. */
export function parseDraft(d: RoutineDraft): RoutineSlot {
  const t = d.min.trim();
  return { on: d.on, title: d.title.trim(), s: d.s, min: /^\d+$/.test(t) ? Number(t) : NaN };
}

export const parseRoutineForm = (form: Record<RoutineKey, RoutineDraft>): Record<RoutineKey, RoutineSlot> =>
  ({ breakfast: parseDraft(form.breakfast), lunch: parseDraft(form.lunch), extra: parseDraft(form.extra), dinner: parseDraft(form.dinner) });

/** The line shown when a block no longer fits before wind-down. */
export const overflowMessage = (title: string, overMin: number, windStart = '21:30') =>
  `Doesn't fit: '${title}' would run ${overMin} min past ${windStart}. Move a slot or shorten it.`;
