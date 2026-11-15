/* Owner-editable wake-up, meal and gym slots, and how they are placed into a weekday template. Pure: no
 * runtime imports. The rule (owner, 2026-11-15): bedtime may move, the roadmap may not. Study blocks are never split,
 * shortened or dropped; when they run into wind-down, wind-down (and so bedtime) moves later instead. */
import type { RoutineKey, RoutineMap, RoutineSlot, RoutineTime } from './state-types';

export type Block = { s: string; e: string; k: string; title: string; kind: string; remind?: boolean };
/** `bedtime` is when the placed wind-down ends; `bedShiftMin` is how much later that is than the usual bedtime
 * (the template's, shifted with wake-up: 17 h after wake, 22:00 for 05:00). */
export type PlaceResult = { ok: true; blocks: Block[]; bedtime: string; bedShiftMin: number } | { ok: false; error: string };
export type ResolvedRoutine = Record<RoutineKey, RoutineSlot> & { wake: RoutineTime };

export const ROUTINE_KEYS: RoutineKey[] = ['breakfast', 'lunch', 'extra', 'dinner'];
export const DEFAULT_ROUTINE: ResolvedRoutine = {
  breakfast: { on: true, title: 'Breakfast, get ready', s: '07:15', min: 45 },
  lunch: { on: true, title: 'Lunch + 20 min power nap', s: '11:45', min: 75 },
  extra: { on: true, title: 'Gym', s: '18:00', min: 60 },
  dinner: { on: true, title: 'Dinner + family time', s: '19:15', min: 45 },
  wake: { s: '05:00' },
};
/** The template block each slot replaces. */
export const ROUTINE_BLOCK_KEY: Record<RoutineKey, string> = { breakfast: 'breakfast', lunch: 'lunch', dinner: 'dinner', extra: 'workout' };

/** The wake-up block lasts this long; routine slots may start only after it. */
const WAKE_MIN = 15;
const DAY_END = 23 * 60 + 59;
const LABEL: Record<RoutineKey, string> = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', extra: 'Gym' };

const toMin = (hm: string) => Number(hm.slice(0, 2)) * 60 + Number(hm.slice(3));
const toHM = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
const validHM = (s: unknown) => typeof s === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(s);

/** Fill in what is not stored. A slot the owner never set is relative to wake-up: it moves by (wake − 05:00) with
 * the template (R15). A slot the owner saved keeps its absolute time. With an invalid wake nothing shifts (validation
 * rejects it anyway). */
export function resolveRoutine(stored?: RoutineMap | null): ResolvedRoutine {
  const out = { ...DEFAULT_ROUTINE };
  if (stored?.wake) out.wake = { ...DEFAULT_ROUTINE.wake, ...stored.wake };
  const off = validHM(out.wake.s) ? toMin(out.wake.s) - toMin(DEFAULT_ROUTINE.wake.s) : 0;
  for (const k of ROUTINE_KEYS) {
    if (stored?.[k]) out[k] = { ...DEFAULT_ROUTINE[k], ...stored[k] };
    else if (off) out[k] = { ...DEFAULT_ROUTINE[k], s: toHM(toMin(DEFAULT_ROUTINE[k].s) + off) };
  }
  return out;
}

export function validateRoutine(r: RoutineMap): { ok: true } | { ok: false; error: string } {
  const full = resolveRoutine(r);
  if (!validHM(full.wake.s)) return { ok: false, error: 'Wake up needs a valid time.' };
  const wakeEnd = toMin(full.wake.s) + WAKE_MIN;
  const spans: { k: RoutineKey; a: number; b: number; name: string }[] = [];
  for (const k of ROUTINE_KEYS) {
    const x = full[k];
    const t = typeof x.title === 'string' ? x.title.trim() : '';
    const name = t.length >= 1 && t.length <= 40 ? t : LABEL[k];
    if (t.length < 1 || t.length > 40) return { ok: false, error: `${name} needs a title of 1 to 40 characters.` };
    if (!Number.isInteger(x.min) || x.min < 5 || x.min > 180) return { ok: false, error: `${name} must last 5 to 180 minutes.` };
    if (!validHM(x.s)) return { ok: false, error: `${name} needs a valid start time.` };
    if (!x.on) continue;
    const a = toMin(x.s), b = a + x.min;
    if (a < wakeEnd) return { ok: false, error: `${name} starts before ${toHM(wakeEnd)}, when wake-up ends.` };
    spans.push({ k, a, b, name });
  }
  for (let i = 0; i < spans.length; i++) for (let j = i + 1; j < spans.length; j++) {
    if (spans[i].a < spans[j].b && spans[j].a < spans[i].b) return { ok: false, error: `${spans[i].name} overlaps ${spans[j].name}.` };
  }
  return { ok: true };
}

/** Place the owner's routine into a weekday template. Template times shift by (wake − the template's wake); routine
 * slots keep their absolute times and act as anchors; every other block keeps its full duration, starts at
 * max(previous end, its shifted start) and jumps past anchors. Wind-down keeps its shifted template time (ending 17 h
 * after wake), or moves later when the day needs it. Fails only for invalid input or a day that would end after 23:59. */
export function placeDay(template: Block[], routine: RoutineMap): PlaceResult {
  const v = validateRoutine(routine);
  if (!v.ok) return v;
  const full = resolveRoutine(routine);
  const replaced = new Set(Object.values(ROUTINE_BLOCK_KEY));
  const tplWake = template.find((b) => b.k === 'wake');
  const off = toMin(full.wake.s) - (tplWake ? toMin(tplWake.s) : toMin(DEFAULT_ROUTINE.wake.s));
  const shift = (b: Block): Block => (off ? { ...b, s: toHM(toMin(b.s) + off), e: toHM(toMin(b.e) + off) } : b);
  const anchors: Block[] = [];
  if (tplWake) anchors.push(shift(tplWake));
  for (const k of ROUTINE_KEYS) {
    const x = full[k];
    if (!x.on) continue;
    anchors.push({ s: x.s, e: toHM(toMin(x.s) + x.min), k: ROUTINE_BLOCK_KEY[k], title: x.title.trim(), kind: k === 'extra' ? 'health' : 'life', remind: true });
  }
  const out: Block[] = [...anchors];
  let cursor = 0;
  for (const b of template) {
    if (b.k === 'wake' || b.k === 'wind' || replaced.has(b.k)) continue;
    const dur = toMin(b.e) - toMin(b.s);
    let s = Math.max(cursor, toMin(b.s) + off);
    for (let moved = true; moved;) {
      moved = false;
      for (const a of anchors) if (s < toMin(a.e) && toMin(a.s) < s + dur) { s = toMin(a.e); moved = true; }
    }
    if (s + dur > DAY_END) return pastMidnight(s + dur);
    out.push({ ...b, s: toHM(s), e: toHM(s + dur) });
    cursor = s + dur;
  }
  const wind = template.find((b) => b.k === 'wind');
  if (!wind) return { ok: true, blocks: sorted(out), bedtime: '', bedShiftMin: 0 };
  const asked = toMin(wind.e) + off;
  const windMin = toMin(wind.e) - toMin(wind.s);
  const lastEnd = Math.max(...out.map((b) => toMin(b.e)));
  const ws = Math.max(asked - windMin, lastEnd), bed = ws + windMin;
  if (bed > DAY_END) return pastMidnight(bed);
  out.push({ ...wind, s: toHM(ws), e: toHM(bed), title: wind.title.replace(/sleep at \d\d:\d\d/, `sleep at ${toHM(bed)}`) });
  return { ok: true, blocks: sorted(out), bedtime: toHM(bed), bedShiftMin: bed - asked };
}

const sorted = (bs: Block[]) => bs.sort((p, q) => toMin(p.s) - toMin(q.s));
const pastMidnight = (end: number): PlaceResult =>
  ({ ok: false, error: `With these times the day would run ${end - DAY_END} min past 23:59. Move a slot or wake up earlier.` });
