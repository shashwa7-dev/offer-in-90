/* Pure helpers for the Setup page: Monday snapping, the routine form, the bedtime line. No runtime imports. */
import type { ModeEntry, RoutineKey, RoutineMap, RoutineSlot, RoutineTime } from './state-types';

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

/** The whole "My routine" form as typed: four slot rows plus wake-up ('HH:MM'). */
export type RoutineForm = Record<RoutineKey, RoutineDraft> & { wake: string };
type FullRoutine = Record<RoutineKey, RoutineSlot> & { wake: RoutineTime };

export const toRoutineForm = (r: FullRoutine): RoutineForm =>
  ({ breakfast: toDraft(r.breakfast), lunch: toDraft(r.lunch), extra: toDraft(r.extra), dinner: toDraft(r.dinner), wake: r.wake.s });

export const parseRoutineForm = (form: RoutineForm): FullRoutine => ({
  breakfast: parseDraft(form.breakfast), lunch: parseDraft(form.lunch), extra: parseDraft(form.extra), dinner: parseDraft(form.dinner),
  wake: { s: form.wake },
});

const SLOT_KEYS: RoutineKey[] = ['breakfast', 'lunch', 'extra', 'dinner'];

/** What gets stored: wake-up if it is not `defaultWake`, and every touched slot (saved before, or edited in the form)
 * as absolute times. Untouched slots are never written, so they stay relative to wake-up; a touched slot stays
 * absolute even when it happens to equal its wake-relative default (only Reset makes slots relative again). */
export function routineToStore(full: FullRoutine, touched: readonly RoutineKey[], defaultWake: string): RoutineMap {
  const out: RoutineMap = {};
  for (const k of SLOT_KEYS) if (touched.includes(k)) out[k] = full[k];
  if (full.wake.s !== defaultWake) out.wake = full.wake;
  return out;
}

type TBlock = { s: string; e: string; k: string; kind: string };
/** Wake-up, gym start (if on), bedtime and study hours of a placed study day, for the Setup timetable. */
export function timetableSummary(blocks: readonly TBlock[]): { wake: string; gym?: string; sleep: string; studyH: number } {
  const m = (hm: string) => Number(hm.slice(0, 2)) * 60 + Number(hm.slice(3));
  const gym = blocks.find((b) => b.k === 'workout')?.s;
  return {
    wake: blocks.find((b) => b.k === 'wake')?.s ?? blocks[0].s,
    ...(gym ? { gym } : {}),
    sleep: blocks.find((b) => b.k === 'wind')?.e ?? blocks[blocks.length - 1].e,
    studyH: blocks.filter((b) => b.kind === 'study').reduce((n, b) => n + m(b.e) - m(b.s), 0) / 60,
  };
}

/** The line shown when the day needs a later bedtime than the usual one. */
export const bedtimeMessage = (bedtime: string) => `Bedtime moves to ${bedtime} on study days to fit everything.`;

const STATE_MAPS = ['status', 'seenUpdates', 'bookmarks', 'custom', 'modes', 'labels', 'itemLabels', 'own', 'solves', 'sundayMode', 'scores', 'routine', 'meta'] as const;

/** A saved state (or nothing) → a complete v6 state over `f` (a fresh one). The start always lands on a Monday: a
 * non-Monday start snaps to the next Monday, so day 1 is a Monday and weeks run Mon–Sun. Remote copies are normalized
 * the same way, so both sides of a sync agree. */
export function normalizeState<S extends { v: number; start: string; targets: unknown; pages: unknown }>(s: Partial<S> | null, f: S): S {
  if (!s || !s.start) return { ...f, start: nextMonday(f.start) };
  const out: Record<string, unknown> = { ...f, ...s, targets: s.targets ?? f.targets, pages: s.pages ?? f.pages };
  for (const k of STATE_MAPS) out[k] = (s as Record<string, unknown>)[k] || {};
  return { ...(out as S), v: 6, start: nextMonday(s.start) };
}

/** True when a saved state predates roadmap v2 (v < 6): Today shows the one-time "Roadmap v2 is here" line. */
export const isPreV2 = (s: { v?: number; start?: string } | null): boolean => !!s && !!s.start && (s.v ?? 0) < 6;

/** Setup › Start over (pure; `start` is the next Monday, worked out by the caller). Clears the plan's progress: ticks,
 * statuses, flags, daily logs, solve logs (R14: a log lives only while its task is done), scores and Sunday modes. Keeps
 * the owner's own things (labels, item labels, own problems and tasks, routine, pages, bookmarks, task notes). The
 * mode in force at the new start carries over as the one mode entry, from the start with zero cursors (Steady: `{}`,
 * the fresh default). */
export function startOver<S extends { start: string; modes: Record<string, ModeEntry> }>(s: S, start: string): S & {
  done: Record<string, never>; status: Record<string, never>; flags: Record<string, never>; notes: Record<string, never>;
  solves: Record<string, never>; scores: Record<string, never>; sundayMode: Record<string, never>;
} {
  const since = Object.keys(s.modes).filter((d) => d <= start).sort().at(-1);
  const mode = since ? s.modes[since].mode : 'steady';
  const cursors = { dsa: 0, aib: 0, fe: 0, mc: 0, sd: 0, jt: 0, beh: 0, ai: 0 };
  const modes: Record<string, ModeEntry> = mode === 'steady' ? {} : { [start]: { mode, cursors, basis: start } };
  return { ...s, start, modes, done: {}, status: {}, flags: {}, notes: {}, solves: {}, scores: {}, sundayMode: {} };
}
