// Roadmap stages and Today day bands. Pure: no runtime imports.
export type TrackKey = 'dsa' | 'fe' | 'sd' | 'mc' | 'ai' | 'career';

export const TRACKS: { key: TrackKey; name: string }[] = [
  { key: 'dsa', name: 'DSA' },
  { key: 'fe', name: 'Frontend & CS' },
  { key: 'sd', name: 'System design' },
  { key: 'mc', name: 'Machine coding' },
  { key: 'ai', name: 'AI' },
  { key: 'career', name: 'Career' },
];

export interface TimelineDay {
  week: number;
  s?: number;
  type: string;
  tasks: { id: string; cat: string; own?: string }[];
}

export interface Stage {
  track: TrackKey;
  label: string;
  match: (t: { id: string; cat: string }, s: number) => boolean;
}

const SD = /^sd-\d+/;

export const STAGES: Stage[] = [
  { track: 'dsa', label: 'Arrays → Trees', match: (t, s) => t.cat === 'dsa' && s <= 24 },
  { track: 'dsa', label: 'Graphs, DP, greedy', match: (t, s) => t.cat === 'dsa' && s >= 25 && s <= 60 },
  { track: 'dsa', label: 'Timed sets + OA', match: (t, s) => t.cat === 'dsa' && s > 60 },
  { track: 'fe', label: 'JS, browser, React, web', match: (t) => t.id.startsWith('fe-') },
  { track: 'fe', label: 'Revision + quizzes', match: (t, s) => t.cat === 'fe' && s > 48 },
  { track: 'sd', label: 'HLD fundamentals', match: (t, s) => SD.test(t.id) && s <= 14 },
  { track: 'sd', label: 'Design problems', match: (t, s) => SD.test(t.id) && s > 14 },
  { track: 'sd', label: 'Mocks', match: (t) => t.cat === 'sd' && t.id.includes('-sdm') },
  { track: 'mc', label: 'Builds + LLD Saturdays', match: (t) => t.id.startsWith('mc-') || t.id.startsWith('lld-') },
  { track: 'mc', label: 'Flagship product', match: (t) => t.cat === 'proj' },
  { track: 'mc', label: 'Timed rebuilds', match: (t) => t.id.includes('-mct') },
  { track: 'ai', label: 'Nets → GPT from scratch', match: (t, s) => t.id.startsWith('ai-') && s <= 17 },
  { track: 'ai', label: 'Papers, RAG, agents, evals', match: (t, s) => t.id.startsWith('ai-') && s >= 18 && s <= 61 },
  { track: 'ai', label: 'Review + AI design', match: (t, s) => t.id.startsWith('ai-') && s > 61 },
  { track: 'career', label: 'Resume, LP stories, UX', match: (t, s) => (t.cat === 'beh' || t.cat === 'ux') && s <= 35 },
  { track: 'career', label: 'Forward-deployed + applications', match: (t, s) => (t.cat === 'fde' || t.cat === 'beh') && s > 35 },
];

export interface StageBar {
  track: TrackKey;
  label: string;
  fromWeek: number;
  toWeek: number;
  done: number;
  total: number;
}

export function stageBars(days: TimelineDay[], done: Record<string, number>): StageBar[] {
  const bars: (StageBar | null)[] = STAGES.map(() => null);
  for (const d of days) {
    if (d.s == null) continue;
    for (const t of d.tasks) {
      if (t.own || t.id.endsWith('-news')) continue;
      const i = STAGES.findIndex((st) => st.match(t, d.s as number));
      if (i < 0) continue;
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
