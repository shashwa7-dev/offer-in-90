/* Owner-editable meal and gym slots, and how they are placed into a weekday template. Pure: no runtime imports. */
import type { RoutineKey, RoutineSlot } from './state-types';

export type Block = { s: string; e: string; k: string; title: string; kind: string; remind?: boolean };
export type PlaceResult = { ok: true; blocks: Block[] } | { ok: false; block: { k: string; title: string }; overMin: number };

export const ROUTINE_KEYS: RoutineKey[] = ['breakfast', 'lunch', 'extra', 'dinner'];
export const DEFAULT_ROUTINE: Record<RoutineKey, RoutineSlot> = {
  breakfast: { on: true, title: 'Breakfast, get ready', s: '07:15', min: 45 },
  lunch: { on: true, title: 'Lunch + 20 min power nap', s: '11:45', min: 75 },
  extra: { on: true, title: 'Gym', s: '18:00', min: 60 },
  dinner: { on: true, title: 'Dinner + family time', s: '19:15', min: 45 },
};
/** The template block each slot replaces. */
export const ROUTINE_BLOCK_KEY: Record<RoutineKey, string> = { breakfast: 'breakfast', lunch: 'lunch', dinner: 'dinner', extra: 'workout' };

const WAKE_END = 5 * 60 + 15, WIND_START = 21 * 60 + 30;
const LABEL: Record<RoutineKey, string> = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', extra: 'Gym' };

const toMin = (hm: string) => Number(hm.slice(0, 2)) * 60 + Number(hm.slice(3));
const toHM = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
const validHM = (s: unknown) => typeof s === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(s);

export function resolveRoutine(stored?: Partial<Record<RoutineKey, RoutineSlot>> | null): Record<RoutineKey, RoutineSlot> {
  const out = { ...DEFAULT_ROUTINE };
  for (const k of ROUTINE_KEYS) if (stored?.[k]) out[k] = { ...DEFAULT_ROUTINE[k], ...stored[k] };
  return out;
}

export function validateRoutine(r: Partial<Record<RoutineKey, RoutineSlot>>): { ok: true } | { ok: false; error: string } {
  const full = resolveRoutine(r);
  const spans: { k: RoutineKey; a: number; b: number }[] = [];
  for (const k of ROUTINE_KEYS) {
    const x = full[k], name = LABEL[k];
    const t = typeof x.title === 'string' ? x.title.trim() : '';
    if (t.length < 1 || t.length > 40) return { ok: false, error: `${name} needs a title of 1 to 40 characters.` };
    if (!Number.isInteger(x.min) || x.min < 5 || x.min > 180) return { ok: false, error: `${name} must last 5 to 180 minutes.` };
    if (!validHM(x.s)) return { ok: false, error: `${name} needs a valid start time.` };
    if (!x.on) continue;
    const a = toMin(x.s), b = a + x.min;
    if (a < WAKE_END) return { ok: false, error: `${name} starts before 05:15, when wake-up ends.` };
    if (b > WIND_START) return { ok: false, error: `${name} runs past 21:30, when wind-down starts.` };
    spans.push({ k, a, b });
  }
  for (let i = 0; i < spans.length; i++) for (let j = i + 1; j < spans.length; j++) {
    if (spans[i].a < spans[j].b && spans[j].a < spans[i].b) return { ok: false, error: `${LABEL[spans[i].k]} overlaps ${LABEL[spans[j].k]}.` };
  }
  return { ok: true };
}

export function placeDay(template: Block[], routine: Partial<Record<RoutineKey, RoutineSlot>>): PlaceResult {
  const full = resolveRoutine(routine);
  const replaced = new Set(Object.values(ROUTINE_BLOCK_KEY));
  const anchors: Block[] = [];
  for (const b of template) if (b.k === 'wake' || b.k === 'wind') anchors.push(b);
  for (const k of ROUTINE_KEYS) {
    const x = full[k];
    if (!x.on) continue;
    anchors.push({ s: x.s, e: toHM(toMin(x.s) + x.min), k: ROUTINE_BLOCK_KEY[k], title: x.title.trim(), kind: k === 'extra' ? 'health' : 'life', remind: true });
  }
  const wind = template.find((b) => b.k === 'wind');
  const windStart = wind ? toMin(wind.s) : WIND_START;
  const out: Block[] = [...anchors];
  let cursor = 0;
  for (const b of template) {
    if (b.k === 'wake' || b.k === 'wind' || replaced.has(b.k)) continue;
    const dur = toMin(b.e) - toMin(b.s);
    let s = Math.max(cursor, toMin(b.s));
    for (let moved = true; moved;) {
      moved = false;
      for (const a of anchors) if (s < toMin(a.e) && toMin(a.s) < s + dur) { s = toMin(a.e); moved = true; }
    }
    if (s + dur > windStart) return { ok: false, block: { k: b.k, title: b.title }, overMin: s + dur - windStart };
    out.push({ ...b, s: toHM(s), e: toHM(s + dur) });
    cursor = s + dur;
  }
  out.sort((p, q) => toMin(p.s) - toMin(q.s));
  return { ok: true, blocks: out };
}
