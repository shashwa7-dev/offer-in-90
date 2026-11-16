/* The two modes (roadmap v2 §14): Grind (13 weeks) and Steady (17 weeks, the default), and the synced mode history.
 * `modes` maps an ISO date to the entry the owner wrote that day; the latest entry on or before a date is in force.
 * Pure: type imports only (extensionless runtime imports don't resolve under node strip-types; see task-filter.ts). */
import type { ModeEntry, TrackId } from './state-types';

export type Mode = ModeEntry['mode'];
export type Modes = Record<string, ModeEntry>;

export const MODE_INFO = { grind: { weeks: 13, studyDays: 78 }, steady: { weeks: 17, studyDays: 102 } } as const;

const TRACK_IDS: TrackId[] = ['dsa', 'fe', 'mc', 'sd', 'jt', 'beh', 'ai'];
const zeroCursors = (): Record<TrackId, number> => Object.fromEntries(TRACK_IDS.map((t) => [t, 0])) as Record<TrackId, number>;

/** The entry in force on `isoDate`: the latest one dated on or before it, else Steady from the start. */
export function modeOn(modes: Modes, isoDate: string): ModeEntry & { since: string } {
  const since = Object.keys(modes).filter((d) => d <= isoDate).sort().at(-1);
  if (since === undefined) return { mode: 'steady', cursors: zeroCursors(), since: '' };
  return { ...modes[since], cursors: { ...zeroCursors(), ...modes[since].cursors }, since };
}

/** A new history with `today`'s entry written (a second switch the same day overwrites the first). `basis` is the
 * plan start `cursorsNow` was taken against (Ruling R11). */
export function switchMode(modes: Modes, today: string, mode: Mode, cursorsNow: Record<TrackId, number>, basis: string): Modes {
  return { ...modes, [today]: { mode, cursors: { ...zeroCursors(), ...cursorsNow }, basis } };
}

/** Grind week → Steady week (§14): round(w × 17/13). */
export const steadyWeek = (grindWeek: number) => Math.round((grindWeek * 17) / 13);

/** Steady week → Grind week: the last Grind week whose Steady week has started, so grindWeekOf(steadyWeek(w)) = w
 * and every "from week N" rule starts on Steady week steadyWeek(N). */
export function grindWeekOf(steadyWk: number): number {
  let w = 0;
  while (steadyWeek(w + 1) <= steadyWk) w++;
  return w;
}

/** "Steady mode" / "Grind mode": the mode in force on `isoDate` (sidebar and phone header). */
export const modeLine = (modes: Modes, isoDate: string): string => `${modeOn(modes, isoDate).mode === 'grind' ? 'Grind' : 'Steady'} mode`;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dayKey = (d: Date | string) => (typeof d === 'string' ? d : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);

/** Today's header badge: "Steady · week 3 of 17", "Grind · week 3 of 13", or "Steady · starts 16 Nov" before the start.
 * The week is the viewed day's plan week (Day.week). The total is the week count of the plan actually laid out
 * (its last day's week), so a mid-plan mode switch that changed the real length shows the real total; for a plan
 * that never switched this is the mode's own 17 or 13. */
export function modeBadge(modes: Modes, viewedDate: string, start: string, days: { date: Date | string; week: number }[]): string {
  const name = modeOn(modes, viewedDate).mode === 'grind' ? 'Grind' : 'Steady';
  const day = days.find((d) => dayKey(d.date) === viewedDate);
  if (viewedDate < start || !day) {
    const [, m, d] = start.split('-').map(Number);
    return `${name} · starts ${d} ${MONTHS[m - 1]}`;
  }
  return `${name} · week ${day.week} of ${days[days.length - 1].week}`;
}
