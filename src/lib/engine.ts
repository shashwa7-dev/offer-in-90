/* The plan: days built from the track sequences and the calendar layout (plan-build.ts), hours/progress metrics, and the
 * update feed. This module wires the content and the runtime helpers into the pure builder. */
import { PLAN, CONTENT } from './plan-data';
import { WEEKDAY_BLOCKS, BUFFER_BLOCK, SUNDAY_BLOCKS } from './schedule';
import { studyCounts, type StatusMap } from './task-status';
import { buildTracks } from './tracks';
import { layoutDays, cursorsAt } from './layout';
import { placeDay, resolveRoutine } from './routine';
import { buildPlanFrom, cursorsNowFrom, isStudy, type PlanLib, type PlanState } from './plan-build';
import type { TrackId } from './state-types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const P: any = PLAN;
export { P };
const DAY_MS = 864e5;

export type Cat = 'dsa' | 'fe' | 'mc' | 'proj' | 'sd' | 'ux' | 'beh' | 'fde' | 'ai' | 'review' | 'health' | 'update';
export interface Task {
  id: string; text: string; cat: Cat; url?: string; diff?: 'E' | 'M' | 'H'; slug?: string;
  log?: boolean; min: number; bk: string; outdated?: UpdateItem; fromUpdate?: UpdateItem; newsId?: string;
  /** Id of the user's own task (State.custom). Only these can be edited or removed. */
  own?: string;
  pattern?: string; tier?: string; flags?: string[]; role?: string; depth?: boolean; hiddenUntilStart?: boolean;
  /** Labels are looked up with labelsOf, never stored on tasks. */
  labels?: never;
  /** Planned minutes when the content gives them (otherwise the block is split evenly). */
  mins?: number; part?: [number, number]; brief?: string; practice?: string; summary?: string;
  /** Optional: never counts towards hours or "behind" (Sunday read, suggestions). */
  optional?: boolean;
  /** A past copy of a slot laid out again after a mode switch (R12): history only, never counted. */
  superseded?: true;
  /** For a superseded copy: the ISO date the slot moved to. */
  movedTo?: string;
  /** Hand-scored 0–100: `baseline/<section>` is the full scores key; `w<n>` is a per-section prefix (`w<n>/<section>`). */
  scoreKey?: string;
  /** Recognition drill: its 3 problems, with the patterns kept back for "Reveal patterns". */
  drill?: { slug: string; name: string; url: string; pattern: string }[];
}
/** A task the user added. Pinned to a calendar date and block, so it stays put if the start date changes. */
export interface CustomTask { date: string; block: string; text: string; url?: string; at: number }
export interface Block { s: string; e: string; k: string; title: string; kind: 'study' | 'life' | 'health'; remind?: boolean; tasks: Task[] }
export interface Day {
  i: number; /** Day number shown to the user: 0 for the optional prep day, then 1…N. */ no: number; date: Date; week: number;
  phase: 1 | 2 | 3; type: 'kick' | 'study' | 'sun';
  /** 1-based study-day counter (study days). */ s?: number;
  /** Sunday number (Sundays). */ n?: number;
  grindWeek?: number; mode?: 'steady' | 'grind';
  blocks: Block[]; tasks: Task[];
}

export interface UpdateItem {
  id: string; date: string; kind: 'new' | 'outdated' | 'changed'; priority: 'must' | 'should' | 'fyi';
  area: string; title: string; why: string; url?: string; sources?: string[];
  target?: string;          // a task id ("fe:closures") or a URL used in the plan ("url:https://…")
  replacementUrl?: string;  // for outdated links/resources
  scheduleOn?: string;      // ISO date to add it as a task (defaults to the next Sunday after `date`)
}
export interface UpdatesFeed { generatedAt: string; items: UpdateItem[] }
export interface NewsItem { id: string; title: string; url: string; discussUrl?: string; source: string; points: number; comments: number; publishedAt: string; category: 'ai' | 'dev' | 'research' }
export interface NewsFeed { generatedAt: string; days: Record<string, NewsItem[]> }
export interface PulseCompany { company: string; reports: number; roles: string[]; loop: string; changes: string[]; questions: string[]; prep: string; confidence: 'high' | 'medium' | 'low'; citations: string[] }
export interface PulseWeek { weekOf: string; generatedAt: string; counts: Record<string, number>; headline: string; companies: PulseCompany[] }

export const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const parseISO = (s: string) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
export const toMin = (hm: string) => { const [h, m] = hm.split(':').map(Number); return h * 60 + m; };
export const fmtDate = (d: Date) => d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
export const hrs = (m: number) => { const h = m / 60; return h >= 10 ? Math.round(h) : Math.round(h * 10) / 10; };
/** Calendar days from `start` (day 1) to `date`. The days array index is this plus 1 when the prep day is on. */
export const dayIndexOf = (start: string, date = new Date()) => Math.round((new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() - parseISO(start).getTime()) / DAY_MS);
export const phaseName = (p: number) => ['', 'Foundations', 'Depth', 'Interview mode'][p];
export const catName: Record<string, string> = { dsa: 'DSA', fe: 'Frontend & CS', mc: 'Machine coding & LLD', proj: 'Flagship project', sd: 'System design', ux: 'Product & UX', beh: 'Career', fde: 'Forward-deployed', ai: 'AI', review: 'Review', update: 'Updates' };

const LIB: PlanLib = {
  content: CONTENT, tracks: buildTracks(CONTENT), layoutDays, cursorsAt, placeDay, resolveRoutine,
  WEEKDAY_BLOCKS, BUFFER_BLOCK, SUNDAY_BLOCKS,
};

/** Build every day of the plan (prep day, study days, Sundays) in the owner's mode history and routine. */
export function buildPlan(state: Pick<PlanState, 'start' | 'kickoff' | 'modes' | 'done' | 'sundayMode' | 'routine'>, updates: UpdateItem[] = [], custom: Record<string, CustomTask> = {}): Day[] {
  return buildPlanFrom(state, updates, custom, LIB);
}
/** Plan days, not counting the prep day (91 in Grind, 119 in Steady, longer after a switch). */
export const totalDays = (days: Day[]) => days.filter(d => d.type !== 'kick').length;
/** Where each track's sequence stands on `today` (for a mode switch). */
export function cursorsNow(state: Pick<PlanState, 'start' | 'kickoff' | 'modes' | 'done'>, today: string): Record<TrackId, number> {
  return cursorsNowFrom(state, today, LIB);
}
/** Phase bands as calendar weeks, from the days themselves (Grind W1–4 / W5–9 / W10–13; Steady is longer). */
export function phaseSpans(days: Day[]): { p: 1 | 2 | 3; name: string; from: number; to: number }[] {
  return ([1, 2, 3] as const).flatMap(p => {
    const ws = days.filter(d => d.type !== 'kick' && d.phase === p).map(d => d.week);
    return ws.length ? [{ p, name: phaseName(p), from: Math.min(...ws), to: Math.max(...ws) }] : [];
  });
}
export const weekCount = (days: Day[]) => Math.max(1, ...days.map(d => d.week));

// ---------- metrics ----------
export const study = isStudy;
export function dayStats(d: Day, done: Record<string, number>, status: StatusMap = {}) {
  const c = studyCounts(d.tasks.map(t => ({ id: t.id, min: t.min, study: study(t) })), done, status);
  return { ...c, pct: c.total ? c.n / c.total : 0 };
}
export function overall(days: Day[], done: Record<string, number>, ti: number, marks: StatusMap = {}) {
  let planAll = 0, doneAll = 0, duePlan = 0, dueDone = 0;
  days.forEach(d => { const st = dayStats(d, done, marks); planAll += st.planMin; doneAll += st.doneMin; if (d.i < ti) { duePlan += st.planMin; dueDone += st.doneMin; } });
  const behindMin = duePlan - dueDone;
  const status: ['ok' | 'behind' | 'late', string] = ti <= 0 || duePlan === 0 || behindMin <= 60 ? ['ok', 'On track'] : behindMin <= 480 ? ['behind', `${hrs(behindMin)} h behind`] : ['late', `${hrs(behindMin)} h behind`];
  return { planAll, doneAll, leftAll: planAll - doneAll, behindMin, status, daysLeft: Math.max(0, Math.min(totalDays(days), days.length - Math.max(0, ti))) };
}
const PATTERN_NAME = new Map<string, string>((P.PATTERNS as { id: string; name: string }[]).map(p => [p.id, p.name]));
export const patternNameOf = (id: string) => PATTERN_NAME.get(id) ?? id;
/** "Topic", the short head of a content text ("Closures and scope: …" → "Closures and scope"). */
export const shortText = (text: string) => text.replace(/^[A-Za-z &]+ · /, '').split(/[:,(.]/)[0].trim();
export function dayTitle(d: Day) {
  if (d.type === 'kick') return 'Prep day: set up and take the baseline';
  if (d.type === 'sun') return 'Weekly core, Sunday read, recharge';
  const pat = d.blocks.find(b => b.k === 'dsa')?.tasks.find(t => t.pattern && !t.superseded)?.pattern;
  const fe = d.blocks.find(b => b.k === 'fe')?.tasks.find(t => !t.superseded && !t.own);
  if (pat) return fe ? `${patternNameOf(pat)} + ${shortText(fe.text)}` : patternNameOf(pat);
  return fe ? shortText(fe.text) : 'Interview mode: timed practice';
}
