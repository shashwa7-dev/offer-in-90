// Roadmap stages and Today day bands. Pure: no runtime imports.
export type TrackKey = 'dsa' | 'ai' | 'sd' | 'mc' | 'platform' | 'career' | 'fe';

/** Progress and filter tracks (v3). Keyed by task category through trackOfCat (task-filter.ts), not by TrackId. */
export const TRACKS: { key: TrackKey; name: string }[] = [
  { key: 'dsa', name: 'DSA' },
  { key: 'ai', name: 'AI engineering' },
  { key: 'sd', name: 'Systems' },
  { key: 'mc', name: 'Product' },
  { key: 'platform', name: 'Platform' },
  { key: 'career', name: 'Career' },
  { key: 'fe', name: 'Frontend' },
];

export interface TimelineDay {
  week: number;
  s?: number;
  type: string;
  tasks: { id: string; cat: string; own?: string; pattern?: string; superseded?: true }[];
}

export interface Stage {
  track: TrackKey;
  label: string;
  /** Matches by content ID, category and pattern (never by study-day position, which moves with the mode). */
  match: (t: { id: string; cat: string; pattern?: string }) => boolean;
}

/** A morning pattern task: a problem, its pattern card or explain-back (not a re-solve or drill). */
const morning = (t: { id: string; pattern?: string }) => !!t.pattern && /^(p-|dsa:card-|dsa:explain-back-)/.test(t.id);
/** Generated tasks (recall, news, drills, re-solves, revisits, own tasks, updates) are not content: no stage counts them. */
const GENERATED = /^(d:|rs:|rv:|u-|upd-)/;
type T = { id: string; cat: string; pattern?: string };
/** Content of one category (the v3 tracks are keyed by category, like trackOfCat in task-filter.ts). */
const of = (t: T, ...cats: string[]) => cats.includes(t.cat) && !GENERATED.test(t.id);
const DSA_PHASE3 = /^(adv:|env:|dsa:(oa|google|meta|revisit)-)/;
const AI_DESIGN = /^(sd:ai-|sdm:ai-|ai:design-|ai:teach-back-)/;
const HLD = /^(sd:hld-|sdm:)/;
const MOCK_DAY = /^beh:(ai-drill|oa-round|peer-|mock-|loop-)/;
const FE_SD = /^sd:fe-/;

/** One or two stages per v3 track, labels from the spec's group names. Each content task matches at most one stage:
 * the take-home parts are flagship (cat proj), never LLD (cat mc). */
export const STAGES: Stage[] = [
  { track: 'dsa', label: 'Foundations + 27 patterns', match: (t) => of(t, 'dsa') && (t.id.startsWith('dsa:foundations-') || morning(t)) },
  { track: 'dsa', label: 'Phase 3: timed sets, OA, advanced', match: (t) => of(t, 'dsa') && DSA_PHASE3.test(t.id) },
  { track: 'ai', label: 'LLMs, RAG, evals, agents, serving', match: (t) => of(t, 'ai') && !AI_DESIGN.test(t.id) },
  { track: 'ai', label: 'AI designs, teach-backs, mocks', match: (t) => of(t, 'ai') && AI_DESIGN.test(t.id) },
  { track: 'sd', label: 'Fundamentals, DDIA, case studies', match: (t) => of(t, 'sd') && !HLD.test(t.id) },
  { track: 'sd', label: 'HLD designs + mocks', match: (t) => of(t, 'sd') && HLD.test(t.id) },
  { track: 'mc', label: 'Flagship + take-homes', match: (t) => of(t, 'proj') },
  { track: 'mc', label: 'LLD Saturdays', match: (t) => of(t, 'mc') },
  { track: 'platform', label: 'Platform, data and DevOps', match: (t) => of(t, 'platform') },
  { track: 'career', label: 'Career and FDE', match: (t) => of(t, 'beh', 'fde', 'ux') && !MOCK_DAY.test(t.id) },
  { track: 'career', label: 'Mock day', match: (t) => of(t, 'beh', 'fde') && MOCK_DAY.test(t.id) },
  { track: 'fe', label: 'Senior frontend + timed reps', match: (t) => of(t, 'fe') && !FE_SD.test(t.id) },
  { track: 'fe', label: 'Frontend system design', match: (t) => of(t, 'fe') && FE_SD.test(t.id) },
];

export interface StageBar {
  track: TrackKey;
  label: string;
  fromWeek: number;
  toWeek: number;
  done: number;
  total: number;
}

/** Skipped (not done, status 'skipped') tasks are left out of totals. Local predicate: this module has no runtime imports. */
const isSkippedTask = (id: string, done: Record<string, number>, status: Record<string, 'progress' | 'skipped'>) => !done[id] && status[id] === 'skipped';

export function stageBars(days: TimelineDay[], done: Record<string, number>, status: Record<string, 'progress' | 'skipped'> = {}): StageBar[] {
  const bars: (StageBar | null)[] = STAGES.map(() => null);
  for (const d of days) {
    if (d.s == null) continue;
    for (const t of d.tasks) {
      if (t.own || t.superseded) continue;
      const i = STAGES.findIndex((st) => st.match(t));
      if (i < 0 || isSkippedTask(t.id, done, status)) continue;
      const b = bars[i] ?? (bars[i] = { track: STAGES[i].track, label: STAGES[i].label, fromWeek: d.week, toWeek: d.week, done: 0, total: 0 });
      b.fromWeek = Math.min(b.fromWeek, d.week);
      b.toWeek = Math.max(b.toWeek, d.week);
      b.total++;
      if (done[t.id]) b.done++;
    }
  }
  return bars.filter((b): b is StageBar => b !== null);
}

export type Band = 'morning' | 'afternoon' | 'evening';

export function bandOf(start: string): Band {
  const m = Number(start.slice(0, 2)) * 60 + Number(start.slice(3, 5));
  return m < 720 ? 'morning' : m < 1020 ? 'afternoon' : 'evening';
}
