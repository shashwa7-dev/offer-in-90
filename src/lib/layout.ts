/* Calendar layout (roadmap v2 §14): the 8 track sequences (78 slots each) placed on calendar days in Grind or Steady,
 * following the owner's mode history.
 * - The prep day is day 0, the Sunday before `start` (a Monday). Weeks run Mon–Sun; Mon–Sat are study days.
 * - Grind: every track runs every study day (13 weeks). Steady: each track runs on 78 of every 102 study days (17 weeks).
 * - A mode entry dated after `start` is a switch: from that date each track resumes at `entry.cursors[track]` at the
 *   new pace, with the rotation restarting. Days before it are laid out exactly as before, except that a slot laid out
 *   again is marked `superseded` on its old day. Cursors taken against another start are re-derived from `done`.
 * - A slot waits while an item's `after` target is not yet on an earlier day (this only bites after a switch).
 * - The plan runs until every track's slots are placed, then to the end of that week (so a fresh plan is the mode's
 *   weeks × 7 days).
 * Pure: type imports only (extensionless runtime imports don't resolve under node strip-types; see task-filter.ts),
 * so the week helpers from modes.ts are local copies. */
import type { ModeEntry, TrackId } from './state-types';
import type { Slot } from './tracks';

type Mode = ModeEntry['mode'];
/** `superseded`: a past copy of a slot laid out again after a mode switch (Ruling R12); history only. */
export type LayoutSlot = Slot & { index: number; superseded?: true };
export type LayoutDay = {
  date: string; no: number; week: number; grindWeek: number; phase: 1 | 2 | 3; mode: Mode;
  kind: 'prep' | 'study' | 'sun'; studyNo?: number; sundayNo?: number;
  slots: Partial<Record<TrackId, LayoutSlot>>;
};
export type LayoutInput = {
  start: string; kickoff: boolean; modes: Record<string, ModeEntry>; tracks: Record<TrackId, Slot[]>;
  /** Ticks by content ID: re-derives a switch's cursors when they were taken against another start (R11). */
  done: Record<string, number>;
};

const TRACK_IDS: TrackId[] = ['dsa', 'aib', 'fe', 'mc', 'sd', 'jt', 'beh', 'ai'];
const STEADY_DAYS = 102;
const STEADY_SKIPS = STEADY_DAYS - 78;
/** Max days a plan can run, a guard against bad input (Steady from scratch is 119). */
const MAX_DAYS = 400;

// ---------- Steady rotation ----------
/* Bresenham: a track skips study day k (mod 102) when floor((k+1)·24/102) steps up, i.e. 24 skips in 102 days, 4 in
 * every 17, at least 4 days apart (so never 2 in a row). Tracks go in pairs with the same phase; the 4 pairs are
 * offset by 0–3 days, so on any day at most one pair skips and at least 6 of the 8 tracks run.
 * aib and ai share a pair: the AI build's cross-track prerequisites (`after` an ai item, 1+ slots earlier) then always
 * fall on an earlier day, since both tracks' k-th slots land on the same day. */
const PAIR_PHASE = [0, 1, 0, 2, 2, 3, 3, 1]; // dsa+fe, aib+ai, mc+sd, jt+beh

/** Does track `trackIndex` (dsa, aib, fe, mc, sd, jt, beh, ai) run on Steady study day `studyDay` (0-based)? */
export function steadyRuns(trackIndex: number, studyDay: number): boolean {
  const k = (((studyDay + PAIR_PHASE[trackIndex]) % STEADY_DAYS) + STEADY_DAYS) % STEADY_DAYS;
  return Math.floor(((k + 1) * STEADY_SKIPS) / STEADY_DAYS) === Math.floor((k * STEADY_SKIPS) / STEADY_DAYS);
}

// ---------- dates and weeks ----------
const addDays = (iso: string, n: number) => new Date(Date.parse(`${iso}T00:00:00Z`) + n * 86400000).toISOString().slice(0, 10);
const isSunday = (iso: string) => new Date(`${iso}T00:00:00Z`).getUTCDay() === 0;
const phaseOf = (grindWeek: number): 1 | 2 | 3 => (grindWeek <= 4 ? 1 : grindWeek <= 9 ? 2 : 3);
// Local copies of modes.ts steadyWeek / grindWeekOf.
const steadyWeek = (grindWeek: number) => Math.round((grindWeek * 17) / 13);
/** Exposed so a test can check the copies against modes.ts. */
export const WEEKS = { steadyWeek, grindWeekOf };
function grindWeekOf(steadyWk: number): number {
  let w = 0;
  while (steadyWeek(w + 1) <= steadyWk) w++;
  return w;
}
const zeroCursors = (): Record<TrackId, number> => Object.fromEntries(TRACK_IDS.map((t) => [t, 0])) as Record<TrackId, number>;

/** One stretch of the plan in one mode, from `from` until the next entry. `cursors` undefined: re-derive them. */
type Segment = { from: string; mode: Mode; cursors?: Record<TrackId, number> };

/** The mode in force at `start` (cursors 0: the plan always begins at the start), then every later entry, by date.
 * A later entry keeps its cursors only when they were taken against this start (`basis`, Ruling R11). */
function segmentsOf(start: string, modes: Record<string, ModeEntry>): Segment[] {
  const dates = Object.keys(modes).sort();
  const atStart = dates.filter((d) => d <= start).at(-1);
  const first: Segment = { from: start, mode: atStart ? modes[atStart].mode : 'steady', cursors: zeroCursors() };
  const later = dates.filter((d) => d > start).map((d): Segment => {
    const e = modes[d];
    return { from: d, mode: e.mode, cursors: e.basis === start ? { ...zeroCursors(), ...e.cursors } : undefined };
  });
  return [first, ...later];
}

/** Where each content item ends: its track and its last slot (the last part of a 2-slot item). */
function lastSlots(tracks: Record<TrackId, Slot[]>): Map<string, { track: TrackId; index: number }> {
  const out = new Map<string, { track: TrackId; index: number }>();
  for (const t of TRACK_IDS) tracks[t].forEach((s, index) => {
    for (const x of s.items) out.set(x.id.replace(/:part-\d+$/, ''), { track: t, index });
  });
  return out;
}

export function layoutDays({ start, kickoff, modes, tracks, done }: LayoutInput): LayoutDay[] {
  const segments = segmentsOf(start, modes);
  const ends = lastSlots(tracks);
  const days: LayoutDay[] = [];
  if (kickoff) days.push({ date: addDays(start, -1), no: 0, week: 0, grindWeek: 0, phase: 1, mode: segments[0].mode, kind: 'prep', slots: {} });

  const len = (t: TrackId) => tracks[t].length;
  let next = 0; // the next segment to apply
  let mode: Mode = segments[0].mode;
  const ptr = zeroCursors(); // each track's next slot
  const segFrom = zeroCursors(); // each track's cursor when the current segment began
  let segStudy = 0; // study days into the current segment (the Steady rotation restarts with each segment)
  // The Grind-week clock: the segment began in calendar week `fromWeek`, at Grind week `fromGrind`.
  let fromWeek = 1, fromGrind = 1;
  const grindWeekAt = (week: number) => (mode === 'grind' ? fromGrind + week - fromWeek : grindWeekOf(steadyWeek(fromGrind) + week - fromWeek));
  let studyNo = 0, sundayNo = 0;
  const placed = new Map<string, { no: number; slot: LayoutSlot }>(); // `${track}:${index}` → its latest copy

  /** The first slot from the segment's start with any item not done (no further than the next unplaced slot). */
  const firstNotDone = (t: TrackId) => {
    let i = segFrom[t];
    while (i < ptr[t] && tracks[t][i].items.every((x) => done[x.id])) i++;
    return i;
  };
  /** Every prerequisite of this slot already sits on an earlier day (or was passed over by a cursor). */
  const ready = (slot: Slot, no: number) => slot.items.every((x) => {
    const end = x.after === undefined ? undefined : ends.get(x.after);
    if (!end) return true;
    return end.index < ptr[end.track] && placed.get(`${end.track}:${end.index}`)?.no !== no;
  });
  /** After a switch: a slot behind its track's cursor (so it won't be laid again) whose prerequisite is ahead of its
   * own track's cursor (so it will be) would end up before it. Pull such a track back to that slot, until stable. */
  const rewindDependents = () => {
    for (let changed = true; changed; ) {
      changed = false;
      for (const t of TRACK_IDS) {
        const j = tracks[t].slice(0, ptr[t]).findIndex((s) => s.items.some((x) => {
          const end = x.after === undefined ? undefined : ends.get(x.after);
          return end !== undefined && end.index >= ptr[end.track];
        }));
        if (j >= 0) { ptr[t] = j; changed = true; }
      }
    }
  };
  /** Lay slot `ptr[t]` on day `no`; an earlier copy of the same slot becomes superseded history (Ruling R12). */
  const place = (t: TrackId, no: number): LayoutSlot => {
    const key = `${t}:${ptr[t]}`;
    const prev = placed.get(key);
    if (prev) Object.assign(prev.slot, { superseded: true, items: prev.slot.items.map((x) => ({ ...x, superseded: true })) });
    const slot: LayoutSlot = { ...tracks[t][ptr[t]], index: ptr[t] };
    placed.set(key, { no, slot });
    ptr[t]++;
    return slot;
  };

  for (let no = 1; no <= MAX_DAYS; no++) {
    const date = addDays(start, no - 1);
    const week = Math.ceil(no / 7);
    while (next < segments.length && segments[next].from <= date) {
      const seg = segments[next++];
      if (no > 1) fromGrind = grindWeekAt(week);
      fromWeek = week;
      mode = seg.mode;
      const cursors = seg.cursors ?? Object.fromEntries(TRACK_IDS.map((t) => [t, firstNotDone(t)]));
      for (const t of TRACK_IDS) ptr[t] = Math.min(Math.max(0, cursors[t]), len(t));
      rewindDependents();
      for (const t of TRACK_IDS) segFrom[t] = ptr[t];
      segStudy = 0;
    }
    const grindWeek = grindWeekAt(week);
    const day = { date, no, week, grindWeek, phase: phaseOf(grindWeek), mode };

    if (isSunday(date)) {
      days.push({ ...day, kind: 'sun', sundayNo: ++sundayNo, slots: {} });
      if (TRACK_IDS.every((t) => ptr[t] >= len(t))) break;
      continue;
    }
    // A track runs when it has slots left, the Steady rotation gives it the day, and its next slot's prerequisites
    // are on earlier days (otherwise it waits: after an uneven switch, an aib build waits for its ai read).
    const slots: LayoutDay['slots'] = {};
    TRACK_IDS.forEach((t, i) => {
      if (ptr[t] >= len(t) || (mode === 'steady' && !steadyRuns(i, segStudy))) return;
      if (ready(tracks[t][ptr[t]], no)) slots[t] = place(t, no);
    });
    segStudy++;
    days.push({ ...day, kind: 'study', studyNo: ++studyNo, slots });
  }
  return days;
}

/** For each track, the first slot (at or after the cursor of the mode entry in force on `date`) with any item not
 * done; one past the last slot when all are done. The entry's cursor is read off the days: the lowest slot index placed
 * (superseded copies aside) in the run of same-mode days containing `date`. */
export function cursorsAt(days: LayoutDay[], date: string, done: Record<string, number>): Record<TrackId, number> {
  const out = zeroCursors();
  const at = days.findLastIndex((d) => d.date <= date);
  if (at < 0) return out;
  let from = at;
  while (from > 0 && days[from - 1].mode === days[at].mode && days[from - 1].kind !== 'prep') from--;
  let to = at;
  while (to + 1 < days.length && days[to + 1].mode === days[at].mode) to++;
  for (const t of TRACK_IDS) {
    const bySlot = new Map<number, LayoutSlot>();
    for (const d of days.slice(from, to + 1)) if (d.slots[t] && !d.slots[t]!.superseded) bySlot.set(d.slots[t]!.index, d.slots[t]!);
    if (!bySlot.size) {
      // Finished before this entry: past its last slot.
      const placed = days.flatMap((d) => (d.slots[t] && !d.slots[t]!.superseded ? [d.slots[t]!.index] : []));
      out[t] = placed.length ? Math.max(...placed) + 1 : 0;
      continue;
    }
    let i = Math.min(...bySlot.keys());
    while (bySlot.has(i) && bySlot.get(i)!.items.every((x) => done[x.id])) i++;
    out[t] = i;
  }
  return out;
}
