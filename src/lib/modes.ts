/* The two modes (roadmap v2 §14): Grind (13 weeks) and Steady (17 weeks, the default), and the synced mode history.
 * `modes` maps an ISO date to the entry the owner wrote that day; the latest entry on or before a date is in force.
 * Pure: type imports only (extensionless runtime imports don't resolve under node strip-types; see task-filter.ts). */
import type { ModeEntry, TrackId } from './state-types';

export type Mode = ModeEntry['mode'];
export type Modes = Record<string, ModeEntry>;

export const MODE_INFO = { grind: { weeks: 13, studyDays: 78 }, steady: { weeks: 17, studyDays: 102 } } as const;

const TRACK_IDS: TrackId[] = ['dsa', 'aib', 'fe', 'mc', 'sd', 'jt', 'beh', 'ai'];
const zeroCursors = (): Record<TrackId, number> => Object.fromEntries(TRACK_IDS.map((t) => [t, 0])) as Record<TrackId, number>;

/** The entry in force on `isoDate`: the latest one dated on or before it, else Steady from the start. */
export function modeOn(modes: Modes, isoDate: string): ModeEntry & { since: string } {
  const since = Object.keys(modes).filter((d) => d <= isoDate).sort().at(-1);
  if (since === undefined) return { mode: 'steady', cursors: zeroCursors(), since: '' };
  return { mode: modes[since].mode, cursors: { ...zeroCursors(), ...modes[since].cursors }, since };
}

/** A new history with `today`'s entry written (a second switch the same day overwrites the first). */
export function switchMode(modes: Modes, today: string, mode: Mode, cursorsNow: Record<TrackId, number>): Modes {
  return { ...modes, [today]: { mode, cursors: { ...zeroCursors(), ...cursorsNow } } };
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
