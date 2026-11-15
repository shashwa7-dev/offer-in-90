/* Plan assembly (roadmap v2, Task 8; v3 template): the calendar layout (layout.ts) over the 7 track sequences
 * (tracks.ts), turned into Day[] with block times and tasks. engine.ts wires in the content and the runtime helpers; tests pass their own.
 * Pure: type imports only (extensionless runtime imports don't resolve under node strip-types; see task-filter.ts),
 * so the layout, tracks and routine functions come in through `PlanLib`.
 *
 * Task IDs are content-based (Constraints): track items keep their content IDs, problems `p-<slug>`. Daily habits that
 * repeat use the date: `d:<date>:drill|log|wo|news|recall-ai|recall-sd|revisit-flagged` on study days,
 * `d:<date>:check|reflect|preview|walk|catchup|flagged|explore|apply|sunday-flagged` on Sundays. Teaching-problem re-solves are `rs:<slug>:<k>` for k = 3, 7, 21 (the day offset); Steady
 * DSA pattern revisits are `rv:<slug>:<date>`, Sunday problems `sp:<slug>:<date>`. */
import type { Block, CustomTask, Day, Task, UpdateItem, Cat } from './engine';
import type { LayoutDay, LayoutInput, LayoutSlot } from './layout';
import type { Slot, SlotItem, TrackContent } from './tracks';
import type { ModeEntry, RoutineMap, TrackId } from './state-types';
import type { Block as RoutineBlock, PlaceResult, ResolvedRoutine } from './routine';

export type PlanState = {
  start: string; kickoff: boolean; modes: Record<string, ModeEntry>; done: Record<string, number>;
  sundayMode: Record<string, 'rest' | 'revision'>; routine: RoutineMap;
};
type TemplateBlock = { s?: string; e?: string; k: string; title: string; kind: string; remind?: boolean };
export type PlanLib = {
  /** The merged exports of src/lib/content/*.js. */
  content: TrackContent;
  tracks: Record<TrackId, Slot[]>;
  layoutDays: (input: LayoutInput) => LayoutDay[];
  cursorsAt: (days: LayoutDay[], date: string, done: Record<string, number>) => Record<TrackId, number>;
  placeDay: (template: RoutineBlock[], routine: RoutineMap) => PlaceResult;
  resolveRoutine: (stored?: RoutineMap | null) => ResolvedRoutine;
  WEEKDAY_BLOCKS: readonly TemplateBlock[]; BUFFER_BLOCK: TemplateBlock; SUNDAY_BLOCKS: readonly TemplateBlock[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;
const TRACK_IDS: TrackId[] = ['dsa', 'fe', 'mc', 'sd', 'jt', 'beh', 'ai'];
const RESOLVE_AT = [3, 7, 21];
const MAX_RESOLVES = 3;
const DRILL_SIZE = 3;

// ---------- dates ----------
const addDays = (iso: string, n: number) => new Date(Date.parse(`${iso}T00:00:00Z`) + n * 86400000).toISOString().slice(0, 10);
const dowOf = (iso: string) => new Date(`${iso}T00:00:00Z`).getUTCDay();
const localDate = (iso: string) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); };
const toMin = (hm: string) => Number(hm.slice(0, 2)) * 60 + Number(hm.slice(3, 5));

const T = (id: string, text: string, cat: Cat, extra: Partial<Task> = {}): Task => ({ id, text, cat, min: 0, bk: '', ...extra });

/** Counts towards hours, progress and "behind": not health, not optional, not a superseded copy. */
export const isStudy = (t: Task) => t.cat !== 'health' && !t.optional && !t.superseded;

/** A slot item as a task. A superseded copy (R12) says where the slot moved. */
function fromItem(x: SlotItem, movedTo?: string): Task {
  const t = T(x.id, x.text, x.cat);
  const keys = ['url', 'url2', 'pattern', 'tier', 'role', 'depth', 'hiddenUntilStart', 'slug', 'mins', 'part', 'brief', 'practice', 'summary'] as const;
  for (const k of keys) if (x[k] !== undefined) (t as unknown as Record<string, unknown>)[k] = x[k];
  if (x.flags) t.flags = [...x.flags];
  if (x.diff === 'E' || x.diff === 'M' || x.diff === 'H') t.diff = x.diff;
  if (x.superseded) { t.superseded = true; if (movedTo) t.movedTo = movedTo; }
  return t;
}

// ---------- seeded shuffle (recognition drill) ----------
function seedOf(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function shuffled<X>(xs: X[], seed: string): X[] {
  let a = seedOf(seed);
  const rnd = () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const out = [...xs];
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
}

/** The 3 drill problems for `date`: from covered patterns, never an unseen check, optional-pool problems first. */
export function drillPicks(problems: Row[], covered: Set<string>, date: string): Row[] {
  const ok = problems.filter((p) => covered.has(p.pattern) && p.role !== 'unseen');
  const pool = shuffled(ok.filter((p) => p.tier === 'optional'), date);
  const rest = shuffled(ok.filter((p) => p.tier !== 'optional'), `${date}:must`);
  return [...pool, ...rest].slice(0, DRILL_SIZE);
}

// ---------- layout ----------
export function layoutOf(state: Pick<PlanState, 'start' | 'kickoff' | 'modes' | 'done'>, lib: PlanLib): LayoutDay[] {
  return lib.layoutDays({ start: state.start, kickoff: state.kickoff, modes: state.modes, tracks: lib.tracks, done: state.done });
}
export function cursorsNowFrom(state: Pick<PlanState, 'start' | 'kickoff' | 'modes' | 'done'>, today: string, lib: PlanLib): Record<TrackId, number> {
  return lib.cursorsAt(layoutOf(state, lib), today, state.done);
}

const live = (L: LayoutDay, t: TrackId): LayoutSlot | undefined => (L.slots[t] && !L.slots[t]!.superseded ? L.slots[t] : undefined);

type Resolve = { id: string; slug: string; name: string; url?: string; diff?: string; k: number; due: string };
/** Re-solves of teaching problems at +3/+7/+21 days, at most 3 per revision block, earliest due first. Returns the
 * tasks per date and any that never found a day. */
function planResolves(layout: LayoutDay[]): { byDate: Map<string, Task[]>; left: Task[] } {
  const due: Resolve[] = [];
  for (const L of layout) {
    if (L.kind !== 'study') continue;
    for (const x of live(L, 'dsa')?.items ?? []) {
      if (x.role !== 'teach' || !x.slug) continue;
      for (const k of RESOLVE_AT) due.push({ id: `rs:${x.slug}:${k}`, slug: x.slug, name: x.text, url: x.url, diff: x.diff, k, due: addDays(L.date, k) });
    }
  }
  due.sort((a, b) => (a.due < b.due ? -1 : a.due > b.due ? 1 : a.k - b.k));
  const task = (r: Resolve) => T(r.id, `Re-solve without looking: ${r.name} (blank file, +${r.k} days)`, 'dsa', {
    slug: r.slug, ...(r.url ? { url: r.url } : {}), ...(r.diff === 'E' || r.diff === 'M' || r.diff === 'H' ? { diff: r.diff } : {}),
  });
  const byDate = new Map<string, Task[]>();
  let q = due;
  for (const L of layout) {
    if (L.kind !== 'study') continue;
    let n = 0;
    while (n < q.length && n < MAX_RESOLVES && q[n].due <= L.date) n++;
    if (n) { byDate.set(L.date, q.slice(0, n).map(task)); q = q.slice(n); }
  }
  return { byDate, left: q.map(task) };
}

// ---------- recall + news (the `aib` block, generated every study day) ----------
const RECALL_AI = 30, RECALL_SD = 20, SD_WINDOW = [3, 7];
/** AI recall of the latest AI-core (`fe`) slot on an earlier study day (a warm-up before the first one), Systems recall
 * of the latest `sd` slot placed 3–7 study days earlier (with none, the AI recall takes its 20 min), then the AI news.
 * Either prefers a learning slot (one with an `:explain` item) over a rep or mock. */
function recallTasks(L: LayoutDay, layout: LayoutDay[], i: number): Task[] {
  const k = (x: string) => `d:${L.date}:${x}`;
  const earlier = layout.slice(0, i).filter((x) => x.kind === 'study');
  const latest = (xs: LayoutDay[], t: TrackId) => (xs.filter((x) => x.slots[t]!.items.some((y) => y.id.endsWith(':explain'))).at(-1) ?? xs.at(-1))?.slots[t]!.items[0];
  const ai = latest(earlier.filter((x) => live(x, 'fe')), 'fe');
  const sd = latest(earlier.filter((x) => live(x, 'sd') && x.studyNo! >= L.studyNo! - SD_WINDOW[1] && x.studyNo! <= L.studyNo! - SD_WINDOW[0]), 'sd');
  const aiMins = sd ? RECALL_AI : RECALL_AI + RECALL_SD;
  const out: Task[] = [ai
    ? T(k('recall-ai'), `AI recall (${aiMins} min): without notes, explain "${ai.text}" out loud or on paper. Then check against its link and note what you missed.`, 'ai', { mins: aiMins, ...(ai.url ? { url: ai.url } : {}) })
    : T(k('recall-ai'), `Warm-up: write down what you already know about LLMs (how they are trained, how they answer a prompt, where they go wrong), with no notes and no searching (${aiMins} min).`, 'ai', { mins: aiMins })];
  if (sd) out.push(T(k('recall-sd'), `Systems recall (${RECALL_SD} min): without notes, explain "${sd.text}" from a few days ago. Then check against its link and note what you missed.`, 'sd', { mins: RECALL_SD, ...(sd.url ? { url: sd.url } : {}) }));
  out.push(T(k('news'), NEWS_TASK, 'ai', { newsId: 'reads', mins: 10 }));
  return out;
}

// ---------- Steady DSA pattern revisit (the 05:15 block on a DSA rest day) ----------
/** Hardest first: a revisit draws from these patterns while any of them is covered and has problems left. */
const HARD_PATTERNS = ['dp', 'graph-traversal', 'topo-sort', 'union-find', 'shortest-path-mst', 'backtracking', 'tree-dfs', 'tree-bfs', 'top-k', 'two-heaps', 'k-way-merge', 'intervals', 'sliding-window', 'binary-search'];
const REVISIT_PICKS = 2, REVISIT_MINS = 45, SUNDAY_MINS = 35, SUNDAY_MIN_MINS = 30;

// ---------- fixed templates ----------
const PREP_BLOCKS: TemplateBlock[] = [
  { s: '15:30', e: '16:30', k: 'setup', title: 'Prep: set everything up', kind: 'study' },
  { s: '16:30', e: '18:00', k: 'baseline', title: 'Baseline test, scored by hand (90 min)', kind: 'study' },
  { s: '18:00', e: '19:00', k: 'workout', title: 'Gym', kind: 'health' },
  { s: '19:00', e: '20:00', k: 'dinner', title: 'Shower, dinner + family time', kind: 'life' },
  { s: '20:00', e: '20:30', k: 'beh', title: 'Career: decide where you are going', kind: 'study' },
  { s: '20:30', e: '21:00', k: 'ai', title: 'AI: news', kind: 'study' },
  { s: '21:00', e: '21:30', k: 'review', title: 'Daily review', kind: 'study' },
  { s: '21:30', e: '22:00', k: 'wind', title: 'Wind down · sleep at 22:00', kind: 'life' },
];
const NEWS_TASK = "Skim today's News tab and open the 1–2 reads that matter. Save one takeaway in AI notes (10 min)";
/** Block titles chosen by the slot, not the weekday (Steady moves LLD and mock-day slots off Saturdays): the product
 * block of an LLD slot (cat mc) and the career block of a mock-day slot (a MOCK_DAY row, as timeline.ts's mock-day stage). */
const SLOT_TITLE: Record<string, string> = { mc: 'Deep work 3 · Low-level design', beh: 'Career · Mock day' };
const WORKOUTS = ['', 'Workout: push (chest, shoulders, triceps)', 'Workout: pull (back, biceps)', 'Workout: legs + core', 'Workout: 30 min run or cycling', 'Workout: full body', 'Workout: yoga + mobility'];

function prepTasks(): Record<string, Task[]> {
  return {
    setup: [
      T('k-ics', 'Import calendar reminders (Setup tab) + set a 04:55 phone alarm', 'review'),
      T('k-acc', 'Create a GitHub repo "interview-prep" for solutions and builds; log in to LeetCode', 'review', { url: 'https://leetcode.com/' }),
      T('k-env', 'Set up a TypeScript scratch project with Vitest for daily solutions', 'dsa', { url: 'https://vitest.dev/guide/' }),
      T('k-tour', 'Skim the Roadmap tab so you know the whole plan', 'review'),
    ],
    // One task per score section (sundays.ts SCORE_SECTIONS), 90 min in all, each self-scored 0–100.
    baseline: [
      T('baseline:dsa', 'Baseline · DSA (25 min, timed): 2 problems you haven\'t seen, one easy and one medium, in TypeScript from a blank file. Score yourself 0–100.', 'dsa', { scoreKey: 'baseline/dsa', mins: 25, url: 'https://leetcode.com/problemset/' }),
      T('baseline:ai', 'Baseline · AI engineering (15 min): explain out loud, without notes, how an LLM answers a prompt, from the text you type to the words it writes back. Score yourself 0–100.', 'ai', { scoreKey: 'baseline/ai', mins: 15 }),
      T('baseline:sd', 'Baseline · Systems (15 min): a mini design of a URL shortener, out loud, with a diagram. Score yourself 0–100 on requirements, API, data model and scaling.', 'sd', { scoreKey: 'baseline/sd', mins: 15, url: 'https://excalidraw.com/' }),
      T('baseline:platform', 'Baseline · Platform & DevOps (10 min): write down how you would deploy an app and how you would monitor it once it is live. Score yourself 0–100.', 'platform', { scoreKey: 'baseline/platform', mins: 10 }),
      T('baseline:product', 'Baseline · Product (10 min): critique a product you use every week. Who is it for, what works, and what would you change first, and why? Score yourself 0–100.', 'proj', { scoreKey: 'baseline/product', mins: 10 }),
      T('baseline:fe', 'Baseline · Frontend (15 min): answer 10 senior frontend questions from memory (rendering, performance, React internals, state, accessibility), then check your answers. Score yourself 0–100.', 'fe', { scoreKey: 'baseline/fe', mins: 15 }),
    ],
    workout: [T('k-wo', 'Workout: full body (first gym day)', 'health')],
    beh: [T('k-pos', 'Write your target: role titles (frontend / full-stack / forward-deployed), 10 dream companies, and why', 'beh', { url: 'https://www.linkedin.com/jobs/' })],
    ai: [T('k-news', NEWS_TASK, 'ai', { newsId: 'reads' })],
    review: [T('k-log', 'Write a one-line log below, look at tomorrow (day 1)', 'review', { log: true })],
  };
}

const withTasks = (tpl: readonly TemplateBlock[], by: Record<string, Task[]>): Block[] =>
  tpl.map((b) => ({ ...b, tasks: by[b.k] || [] }) as Block);

// ---------- build ----------
/** Build every day of the plan from the layout. Updates mark outdated tasks and add must-reads; own tasks go last. */
export function buildPlanFrom(state: PlanState, updates: UpdateItem[], custom: Record<string, CustomTask>, lib: PlanLib): Day[] {
  const c = lib.content;
  const layout = layoutOf(state, lib);
  const routine = lib.resolveRoutine(state.routine);
  const problems: Row[] = c.PROBLEMS ?? [];
  const patternName = new Map<string, string>((c.PATTERNS ?? []).map((p: Row) => [p.id, p.name]));

  // Where each slot's latest (live) copy sits, for "moved to <date>" on superseded copies.
  const liveAt = new Map<string, string>();
  for (const L of layout) for (const t of TRACK_IDS) { const s = live(L, t); if (s) liveAt.set(`${t}:${s.index}`, L.date); }

  const { byDate: resolves, left: unplacedResolves } = planResolves(layout);
  const sundays = layout.filter((L) => L.kind === 'sun');
  // Readiness checks and the week-8 review: the first Sunday in that Grind week (Steady week round(w × 17/13), as
  // "Grind week 8 / Steady week 10" in sundays.js), else the first one after it (a switch can skip a week).
  const sundayFor = (week: number) => sundays.find((L) => L.grindWeek >= week)?.date;
  const pinned = new Map<string, Task[]>();
  const pin = (date: string | undefined, t: Task) => { if (date) pinned.set(date, [...(pinned.get(date) ?? []), t]); };
  for (const r of (c.READINESS ?? []) as Row[]) pin(sundayFor(r.week), T(r.id, `Readiness check (week ${r.week}): ${r.text}`, 'review'));
  if (c.WEEK8_REVIEW) pin(sundayFor(c.WEEK8_REVIEW.week), T(c.WEEK8_REVIEW.id, c.WEEK8_REVIEW.text, 'review'));

  const mockDayIds = new Set<string>(((c.MOCK_DAY ?? []) as Row[]).flatMap((d) => [d.row.id, ...d.carry.map((r: Row) => r.id)]));
  const covered = new Set<string>();
  const carry: Task[] = []; // sundayCarry items waiting for this week's Sunday (R9)

  // Steady DSA rest days (until the track is finished): a pattern revisit instead of a buffer. The pool is the former
  // `var` and the optional problems that no track slot uses.
  const inSlots = new Set(TRACK_IDS.flatMap((t) => lib.tracks[t].flatMap((s) => s.items.flatMap((x) => (x.slug ? [x.slug] : [])))));
  const revisitPool = problems.filter((p) => (p.role === 'var' || p.tier === 'optional') && !inSlots.has(p.slug));
  const patternRank = new Map<string, number>((c.PATTERNS ?? []).map((p: Row, j: number) => [p.id, j]));
  const lastDsaDate = layout.filter((L) => live(L, 'dsa')).at(-1)?.date ?? '';
  const revisitUsed = new Set<string>();
  const revisits = (L: LayoutDay) => L.mode === 'steady' && L.kind === 'study' && !L.slots.dsa && L.date < lastDsaDate;
  /** `n` problems not solved yet from covered patterns, marked used: the hard patterns first (any covered pattern before
   * one is covered), `var` before optional, `hot` first. Steady revisit days and Sunday problems share `used`. */
  function revisitPicks(seen: Set<string>, used: Set<string>, n: number): Row[] {
    const rank = (p: Row) => [p.role === 'var' ? 0 : 1, p.flags?.includes('hot') ? 0 : 1, HARD_PATTERNS.includes(p.pattern) ? HARD_PATTERNS.indexOf(p.pattern) : HARD_PATTERNS.length + (patternRank.get(p.pattern) ?? 0)];
    const byRank = (a: Row, b: Row) => { const x = rank(a), y = rank(b); return x[0] - y[0] || x[1] - y[1] || x[2] - y[2]; };
    const open = revisitPool.filter((p) => seen.has(p.pattern) && !used.has(p.slug));
    const hard = open.filter((p) => HARD_PATTERNS.includes(p.pattern)).sort(byRank);
    const picks = [...hard, ...open.filter((p) => !HARD_PATTERNS.includes(p.pattern)).sort(byRank)].slice(0, n);
    for (const p of picks) used.add(p.slug);
    return picks;
  }
  const problemExtra = (p: Row) => ({ slug: p.slug, ...(p.url ? { url: p.url } : {}), ...(p.d === 'E' || p.d === 'M' || p.d === 'H' ? { diff: p.d } : {}) });
  /** 2 revisit problems. With nothing covered yet: re-solve a flagged problem. */
  function revisitTasks(L: LayoutDay, seen: Set<string>, used: Set<string>): Task[] {
    const picks = revisitPicks(seen, used, REVISIT_PICKS);
    if (!picks.length) {
      return [T(`d:${L.date}:revisit-flagged`, `Re-solve one flagged or hardest problem so far from a blank file, timed (${REVISIT_MINS} min), talking out loud. Log it with your minutes.`, 'dsa', { mins: REVISIT_MINS })];
    }
    return picks.map((p) => T(`rv:${p.slug}:${L.date}`, `Pattern revisit (unseen, timed: ${REVISIT_MINS} min for ${picks.length === 1 ? 'it' : 'both'}): solve ${p.name} from a blank file, talking out loud. Log it as unseen with your minutes.`, 'dsa', {
      ...problemExtra(p), mins: REVISIT_MINS / picks.length,
    }));
  }
  /** The Sunday problem (owner rule 2026-11-15): 1 problem from the revisit pool, 35 min, or 30 when carried items leave
   * only that in the block (a mock-loop Sunday). With nothing covered yet: a flagged re-solve. */
  const sb = lib.SUNDAY_BLOCKS.find((b) => b.k === 'sunday'), sundayLen = sb?.s && sb.e ? toMin(sb.e) - toMin(sb.s) : SUNDAY_MINS;
  function sundayProblem(L: LayoutDay, carried: Task[]): Task {
    const mins = Math.max(SUNDAY_MIN_MINS, Math.min(SUNDAY_MINS, sundayLen - carried.reduce((a, t) => a + (t.mins ?? 0), 0)));
    const [p] = revisitPicks(covered, revisitUsed, 1);
    if (!p) return T(`d:${L.date}:sunday-flagged`, `Re-solve one flagged or hardest problem so far from a blank file, timed (${mins} min), talking out loud. Log it with your minutes.`, 'dsa', { mins });
    return T(`sp:${p.slug}:${L.date}`, `Sunday problem (30–40 min, timed): ${p.name}. A problem you haven't solved, from a pattern you've covered. Log it as unseen with your minutes.`, 'dsa', {
      ...problemExtra(p), mins,
    });
  }

  const days: Day[] = layout.map((L, i) => {
    const date = localDate(L.date);
    const base = { i, no: L.no, date, week: Math.max(1, L.week), grindWeek: L.grindWeek, phase: L.phase, mode: L.mode };
    if (L.kind === 'prep') return { ...base, type: 'kick', blocks: withTasks(PREP_BLOCKS, prepTasks()), tasks: [] };

    if (L.kind === 'sun') {
      const by: Record<string, Task[]> = {};
      const k = (x: string) => `d:${L.date}:${x}`;
      by.workout = [T(k('walk'), 'Long walk or easy run, 45–60 min', 'health')];
      const core: Row[] = c.SUNDAY_CORE ?? [];
      const coreId = ['check', 'reflect', 'preview'];
      by.core = [
        ...core.map((x, j) => T(k(coreId[j] ?? x.id), x.text, 'review', {
          ...(x.mins ? { mins: x.mins } : {}), ...(x.scores ? { scoreKey: `w${L.week}` } : {}), ...(j === 1 ? { log: true } : {}),
        })),
        ...(pinned.get(L.date) ?? []),
      ];
      const read: Row = (c.SUNDAY_READS ?? [])[L.sundayNo! - 1];
      if (read) by.read = [T(read.id, read.text, 'review', { url: read.url, mins: read.mins, optional: true })];
      const carried = carry.splice(0);
      by.sunday = [...carried, sundayProblem(L, carried)];
      if ((state.sundayMode[L.date] ?? 'rest') === 'revision') {
        by.sunday.push(T(k('flagged'), 'Re-solve every flagged problem from a blank file; unflag the ones you nailed', 'dsa'),
          T(k('catchup'), "Catch up on this week's missed tasks (Today › Missed), then re-read this week's pattern cards and ADRs", 'review'));
      } else {
        const xl: Row[] = c.EXPLORE_LATER ?? [];
        const x = xl.length ? xl[(L.sundayNo! - 1) % xl.length] : undefined, res = x?.resources?.[0];
        by.sunday.push(T(k('explore'), `Optional, active rest (no new material): ${x ? `one Explore-later item, ${x.area}: ${res?.text ?? x.text}. ` : ''}Or an engineering blog, a product teardown, or time outside.`,
          'health', { optional: true, ...(res?.url ? { url: res.url } : {}) }));
      }
      const apply: Row = (c.SUNDAY_OPTIONAL ?? []).find((x: Row) => x.id === 'sun:apply-roles');
      if (apply && L.grindWeek >= apply.fromWeek) by.sunday.push(T(k('apply'), apply.text, 'health', { optional: true, ...(apply.url ? { url: apply.url } : {}) }));
      if (L === sundays.at(-1)) by.sunday.push(...unplacedResolves);
      return { ...base, type: 'sun', n: L.sundayNo, blocks: withTasks(lib.SUNDAY_BLOCKS, by), tasks: [] };
    }

    // Mon–Sat study day. A track block with no slot today becomes a buffer at the same times (Steady rotation, or a
    // track already finished), except a Steady DSA rest day, which is a pattern revisit.
    const revisit = revisits(L);
    const slotTitled = (k: string) => (k === 'mc' ? !!L.slots.mc?.items.some((x) => x.cat === 'mc') : k === 'beh' && !!L.slots.beh?.items.some((x) => mockDayIds.has(x.id)));
    const tpl: TemplateBlock[] = lib.WEEKDAY_BLOCKS.map((b) => (TRACK_IDS.includes(b.k as TrackId) && !L.slots[b.k as TrackId] && !(revisit && b.k === 'dsa')
      ? { ...b, ...lib.BUFFER_BLOCK, k: `${lib.BUFFER_BLOCK.k}-${b.k}`, s: b.s, e: b.e } : { ...b, ...(slotTitled(b.k) ? { title: SLOT_TITLE[b.k] } : {}) }));
    const placed = lib.placeDay(tpl as RoutineBlock[], routine);
    const blocks = (placed.ok ? placed.blocks : tpl) as TemplateBlock[];

    const by: Record<string, Task[]> = {};
    for (const t of TRACK_IDS) {
      const slot = L.slots[t];
      if (!slot) continue;
      const moved = slot.superseded ? liveAt.get(`${t}:${slot.index}`) : undefined;
      by[t] = [];
      for (const x of slot.items) {
        if (x.sundayCarry) carry.push(fromItem(x, moved));
        else by[t].push(fromItem(x, moved));
      }
    }
    const k = (x: string) => `d:${L.date}:${x}`;
    if (revisit) by.dsa = revisitTasks(L, covered, revisitUsed);
    by.aib = recallTasks(L, layout, i);
    by.rev = [...(resolves.get(L.date) ?? [])];
    // Only patterns from earlier days: the drill never draws from the pattern taught today.
    const picks = drillPicks(problems, covered, L.date);
    if (picks.length) {
      by.rev.push(T(k('drill'), `Recognition drill (10 min): name the pattern and why for each, no code. ${picks.map((p, j) => `${j + 1}) ${p.name} (${p.url})`).join('; ')}`, 'dsa', {
        drill: picks.map((p) => ({ slug: p.slug, name: p.name, url: p.url, pattern: patternName.get(p.pattern) ?? p.pattern })),
      }));
    }
    for (const x of live(L, 'dsa')?.items ?? []) if (x.pattern) covered.add(x.pattern);
    by.workout = [T(k('wo'), WORKOUTS[dowOf(L.date)] || 'Workout', 'health')];
    by.review = [T(k('log'), 'Tick off today, write a one-line log below, glance at tomorrow', 'review', { log: true })];
    return { ...base, type: 'study', s: L.studyNo, blocks: withTasks(blocks, by), tasks: [] };
  });

  applyUpdates(days, updates);
  applyCustom(days, custom);
  for (const d of days) {
    for (const b of d.blocks) {
      const mins = toMin(b.e) - toMin(b.s);
      const counted = b.kind === 'study' ? b.tasks.filter(isStudy) : [];
      const fixed = counted.filter((t) => t.mins), free = counted.filter((t) => !t.mins);
      const share = free.length ? Math.max(0, mins - fixed.reduce((a, t) => a + t.mins!, 0)) / free.length : 0;
      for (const t of b.tasks) { t.bk = b.k; t.min = counted.includes(t) ? (t.mins ?? share) : 0; }
    }
    d.tasks = d.blocks.flatMap((b) => b.tasks);
  }
  return days;
}

/** Add the user's own tasks to the end of their block. Built-in tasks are never changed. */
export function applyCustom(days: Day[], custom: Record<string, CustomTask>) {
  const byDate = new Map(days.map((d) => [isoOf(d.date), d]));
  Object.entries(custom).sort((a, b) => a[1].at - b[1].at).forEach(([id, x]) => {
    const b = byDate.get(x.date)?.blocks.find((y) => y.k === x.block);
    if (!b) return;
    const cat = b.tasks.find((t) => t.cat !== 'review' && t.cat !== 'update' && !t.own)?.cat || (b.kind === 'health' ? 'health' : 'review');
    b.tasks.push(T(`u-${id}`, x.text, cat, { own: id, ...(x.url ? { url: x.url } : {}) }));
  });
}

const isoOf = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function applyUpdates(days: Day[], updates: UpdateItem[]) {
  if (!updates.length) return;
  const all = days.flatMap((d) => d.blocks.flatMap((b) => b.tasks));
  for (const u of updates) {
    if ((u.kind === 'outdated' || u.kind === 'changed') && u.target) {
      const hit = u.target.startsWith('url:') ? all.filter((t) => t.url === u.target!.slice(4)) : all.filter((t) => t.id === u.target);
      hit.forEach((t) => { t.outdated = u; if (u.replacementUrl) t.url = u.replacementUrl; });
    }
    if (u.kind === 'new' && u.priority !== 'fyi') {
      // Must-reads land in the Sunday block of the scheduled day (default: first Sunday on/after the update date).
      const when = localDate(u.scheduleOn ?? u.date);
      const day = days.find((d) => d.date >= when && (u.scheduleOn ? true : d.type === 'sun')) || days[days.length - 1];
      const block = day.blocks.find((b) => b.k === 'sunday') || day.blocks.find((b) => b.k === 'rev') || day.blocks.find((b) => b.tasks.length && b.kind === 'study');
      block?.tasks.push(T(`upd-${u.id}`, `${u.priority === 'must' ? 'Must-read' : 'Worth reading'}: ${u.title}`, 'update', { url: u.url, fromUpdate: u }));
    }
  }
}
