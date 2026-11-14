/* Builds the 91-day plan from the curriculum, computes hours/progress, and applies the update feed. */
import { PLAN } from './plan-data';
import { WEEKDAY_BLOCKS, SUNDAY_BLOCKS } from './schedule';
import { studyCounts, type StatusMap } from './task-status';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const P: any = PLAN;
export { P };
export const TOTAL = 91;
const DAY_MS = 864e5;

export type Cat = 'dsa' | 'fe' | 'mc' | 'proj' | 'sd' | 'ux' | 'beh' | 'fde' | 'ai' | 'review' | 'health' | 'update';
export interface Task {
  id: string; text: string; cat: Cat; url?: string; diff?: 'E' | 'M' | 'H'; slug?: string; topic?: string;
  log?: boolean; min: number; bk: string; outdated?: UpdateItem; fromUpdate?: UpdateItem; newsId?: string;
  /** Id of the user's own task (State.custom). Only these can be edited or removed. */
  own?: string;
}
/** A task the user added. Pinned to a calendar date and block, so it stays put if the start date changes. */
export interface CustomTask { date: string; block: string; text: string; url?: string; at: number }
export interface Block { s: string; e: string; k: string; title: string; kind: 'study' | 'life' | 'health'; remind?: boolean; tasks: Task[] }
export interface Day { i: number; /** Day number shown to the user: 0 for the optional prep day, then 1…91. */ no: number; date: Date; week: number; phase: 1 | 2 | 3; type: 'kick' | 'study' | 'sun'; s?: number; n?: number; studyBefore?: number; lld?: number; mc?: number; blocks: Block[]; tasks: Task[] }

export interface UpdateItem {
  id: string; date: string; kind: 'new' | 'outdated' | 'changed'; priority: 'must' | 'should' | 'fyi';
  area: string; title: string; why: string; url?: string; sources?: string[];
  target?: string;          // a task id ("ai-14") or a URL used in the plan ("url:https://…")
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
export const dayIndexOf = (start: string, date = new Date()) => Math.round((new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() - parseISO(start).getTime()) / DAY_MS);
export const phaseName = (p: number) => ['', 'Foundations', 'Depth', 'Interview mode'][p];
export const catName: Record<string, string> = { dsa: 'DSA', fe: 'Frontend & CS', mc: 'Machine coding & LLD', proj: 'Flagship project', sd: 'System design', ux: 'Product & UX', beh: 'Career', fde: 'Forward-deployed', ai: 'AI', review: 'Review', update: 'Updates' };

const KICKOFF_BLOCKS = [
  { s: '15:30', e: '16:30', k: 'setup', title: 'Kickoff: set everything up', kind: 'study' },
  { s: '16:30', e: '17:30', k: 'dsa', title: 'DSA warm-up', kind: 'study' },
  { s: '17:30', e: '18:00', k: 'beh', title: 'Career: decide where you are going', kind: 'study' },
  { s: '18:00', e: '19:00', k: 'workout', title: 'Gym', kind: 'health' },
  { s: '19:00', e: '20:00', k: 'dinner', title: 'Shower, dinner + family time', kind: 'life' },
  { s: '20:00', e: '21:00', k: 'ai', title: 'AI: news + papers & courses', kind: 'study' },
  { s: '21:00', e: '21:30', k: 'review', title: 'Daily review', kind: 'study' },
  { s: '21:30', e: '22:00', k: 'wind', title: 'Wind down · sleep at 22:00', kind: 'life' },
];
const PER_DAY = P.DSA.length / 60;
const probsFor = (s: number) => (s < 1 || s > 60 ? [] : P.DSA.slice(Math.floor((s - 1) * PER_DAY), Math.floor(s * PER_DAY)));
const T = (id: string, text: string, cat: Cat, extra: Partial<Task> = {}): Task => ({ id, text, cat, min: 0, bk: '', ...extra });
const workouts = ['', 'Workout: push (chest, shoulders, triceps)', 'Workout: pull (back, biceps)', 'Workout: legs + core', 'Workout: 30 min run or cycling', 'Workout: full body', 'Workout: yoga + mobility'];
const AI_DAYS = P.AI_UNITS.flatMap(([unit, days]: [string, [string, string][]]) => days.map(([t, url], j) => ({ text: `${unit} · day ${j + 1}/${days.length}: ${t}`, url })));
const AI_DAYS_REVIEW = P.AI_REVIEW.map(([text, url]: [string, string]) => ({ text, url }));
const AI_DRILL = 'AI-enabled coding drill (Meta-style, 60 min): read a small multi-file repo for 5 min, fix one bug without AI, add a feature using AI chat only (no autocomplete), then optimize for a 10× input. Narrate everything.';
const AI_DRILL_URL = 'https://www.hellointerview.com/blog/meta-ai-enabled-coding';
const NEWS_TASK = "Skim today's News tab and open the 1–2 reads that matter. Save one takeaway in AI notes (10 min)";
export const aiUnitOf = (s: number) => (AI_DAYS[s - 1]?.text || '').split(' · ')[0];

function kickBlocks(): Block[] {
  const by: Record<string, Task[]> = {
    setup: [T('k-ics', 'Import calendar reminders (Setup tab) + set a 04:55 phone alarm', 'review'), T('k-acc', 'Create a GitHub repo "interview-prep" for solutions and builds; log in to LeetCode', 'review', { url: 'https://leetcode.com/' }), T('k-tour', 'Skim the Roadmap tab so you know the full 13 weeks', 'review')],
    dsa: [T('k-bigo', 'Big-O refresher: time and space cost of common operations', 'dsa', { url: 'https://www.bigocheatsheet.com/' }), T('k-env', 'Set up a TypeScript scratch project with Vitest for daily solutions', 'dsa', { url: 'https://vitest.dev/guide/' })],
    workout: [T('k-wo', 'Workout: full body (first gym day)', 'health')],
    beh: [T('k-pos', 'Write your target: role titles (frontend / full-stack / forward-deployed), 10 dream companies, and why', 'beh', { url: 'https://www.linkedin.com/jobs/' })],
    ai: [T('k-news', NEWS_TASK, 'ai', { newsId: 'reads' }), T('k-ai', 'AI landscape: which models lead today and what they cost', 'ai', { url: 'https://artificialanalysis.ai/' })],
    review: [T('k-log', 'Write a one-line log below, look at tomorrow (day 2)', 'review', { log: true })],
  };
  return KICKOFF_BLOCKS.map(b => ({ ...b, tasks: by[b.k] || [] })) as Block[];
}

function studyBlocks(d: Day): Block[] {
  const s = d.s!, k = `s${s}`, by: Record<string, Task[]> = {};
  by.workout = [T(`${k}-wo`, workouts[d.date.getDay()], 'health')];
  if (s <= 60) {
    const ps = probsFor(s), prevLast = probsFor(s - 1).slice(-1)[0];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const topics = [...new Set<string>(ps.map((p: any) => p.topic))].filter((t, idx) => idx > 0 || !prevLast || prevLast.topic !== t);
    by.dsa = [...topics.map(t => T(`${k}-pat-${t}`, `Learn the pattern: ${t}. Add the template to your Pattern cheat sheet.`, 'dsa', { url: 'https://neetcode.io/roadmap' })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...ps.map((p: any) => T(`p-${p.slug}`, p.name, 'dsa', { url: p.url, diff: p.d, slug: p.slug, topic: p.topic }))];
  } else {
    const j = s - 61;
    if (j % 4 === 2) by.dsa = [T(`${k}-oa`, 'Amazon OA simulation: 2 problems from this post in 70 minutes', 'dsa', { url: P.OA_LINKS[Math.floor(j / 4) % P.OA_LINKS.length] })];
    else if (j % 4 === 3) by.dsa = [T(`${k}-aic`, AI_DRILL, 'dsa', { url: AI_DRILL_URL })];
    else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pool = P.DSA.filter((p: any) => p.d !== 'E');
      by.dsa = [T(`${k}-timer`, j % 4 === 0 ? 'Meta speed set: first 2 problems in 40 minutes, then the third. Talk out loud.' : 'Google set: 3 problems in 90 min, typed in a plain Google Doc (no autocomplete, no running code)', 'dsa'),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...[0, 1, 2].map(x => pool[((j * 3 + x) * 17) % pool.length]).map((p: any) => T(`${k}-t-${p.slug}`, `${p.name} · ${p.topic}`, 'dsa', { url: p.url, diff: p.d, slug: p.slug }))];
    }
  }
  if (s <= 48) {
    const [topic, practice, url] = P.FE[s - 1];
    by.fe = [T(`fe-${s}`, `Learn: ${topic}`, 'fe', { url }), T(`fe-${s}-p`, `Practice: ${practice}`, 'fe'), T(`fe-${s}-q`, 'Write 3 likely interview questions on this topic and answer them out loud', 'fe')];
  } else {
    const a = ((s - 49) * 2) % 48, b = a + 1;
    by.fe = [T(`${k}-ferev`, `Revise and explain out loud (3 min each): ${P.FE[a][0]}; ${P.FE[b][0]}`, 'fe', { url: P.FE[a][2] }), T(`${k}-bfe`, 'Solve 2 JS / React questions + a 10-question output quiz', 'fe', { url: 'https://bigfrontend.dev/problem' })];
  }
  if (d.lld) { const [lt, lu] = P.LLD[d.lld - 1]; by.mc = [T(`lld-${d.lld}`, lt, 'mc', { url: lu }), T(`lld-${d.lld}-c`, d.lld <= 4 ? 'Write the key ideas into Notes with one TypeScript example' : 'Write classes + interfaces in TypeScript, then explain the design out loud', 'mc')]; }
  else if (d.mc! <= P.MC.length) by.mc = [T(`mc-${d.mc}`, `Build: ${P.MC[d.mc! - 1]}`, 'mc'), T(`mc-${d.mc}-r`, 'Push to your repo + note 2 things to do better', 'mc')];
  else if (d.mc! - P.MC.length <= P.PROJECT.length) { const n = d.mc! - P.MC.length, [pt, pu] = P.PROJECT[n - 1]; by.mc = [T(`proj-${n}`, `Flagship ${n}/${P.PROJECT.length}: ${pt}`, 'proj', pu ? { url: pu } : {}), T(`proj-${n}-r`, n <= 3 ? 'Save it as a page in Notes' : 'Review every AI-written line, commit, and update the design doc if anything changed', 'proj')]; }
  else by.mc = [T(`${k}-mct`, `Timed rebuild, 60 min, from scratch, talking out loud: ${P.MC[P.MC_TIMED[(d.mc! - P.MC.length - P.PROJECT.length - 1) % P.MC_TIMED.length] - 1]}`, 'mc')];
  if (s <= P.SD.length) {
    const [topic, url] = P.SD[s - 1];
    by.sd = [T(`sd-${s}`, topic, 'sd', { url }), T(`sd-${s}-d`, s <= 14 ? 'Make a 1-page summary with a diagram' : 'Draw the full design yourself, then compare with the reference', 'sd', s > 14 ? { url: 'https://excalidraw.com/' } : {})];
  } else by.sd = [T(`${k}-sdm`, `Mock, 45 min, timed, out loud: ${P.SD_MOCKS[(s - P.SD.length - 1) % P.SD_MOCKS.length]}`, 'sd'), T(`${k}-sdm-r`, 'Self-review against the HLD framework: what did you skip?', 'sd')];
  if (s === 1) by.rev = [T('s1-rev', "Re-solve today's problems from a blank file, no peeking", 'dsa'), T('s1-cheat', 'Start your Pattern cheat sheet page in Notes', 'dsa')];
  else if (s <= 60) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const seen = new Set<string>(), items: any[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [[s - 1, 99], [s - 3, 1], [s - 7, 1], [s - 14, 1]].forEach(([x, n]) => probsFor(x).slice(0, n).forEach((p: any) => { if (!seen.has(p.slug)) { seen.add(p.slug); items.push(p); } }));
    by.rev = items.map(p => T(`${k}-r-${p.slug}`, `Re-solve without looking: ${p.name}`, 'dsa', { url: p.url, diff: p.d, slug: p.slug }));
    if (s >= 40 && (s - 40) % 2 === 0 && (s - 40) / 2 < P.ADV_DSA.length) { const [at, au] = P.ADV_DSA[(s - 40) / 2]; by.rev.push(T(`adv-${s}`, `${at} (learn it + solve 1 problem)`, 'dsa', { url: au })); }
  } else by.rev = [T(`${k}-co`, 'Company-wise list: 2 recent problems for your top target company', 'dsa', { url: 'https://github.com/liquidslr/leetcode-company-wise-problems' }), T(`${k}-fl`, 'Re-solve 1 flagged problem', 'dsa')];
  if (s <= P.BEH.length) {
    const [bt, bu] = P.BEH[s - 1]; by.beh = [T(`beh-${s}`, bt, 'beh', bu ? { url: bu } : {})];
    if (P.UX[s - 1]) { const [ut, uu] = P.UX[s - 1]; by.beh.push(T(`ux-${s}`, `Product & UX: ${ut}`, 'ux', uu ? { url: uu } : {})); }
  } else {
    const f = s - P.BEH.length;
    const [ft, fu] = f <= P.FDE.length ? P.FDE[f - 1] : [P.FDE_PROMPTS[(f - P.FDE.length - 1) % P.FDE_PROMPTS.length] + ' (45 min, out loud)', ''];
    const [apt, apu] = P.APPLY[s % P.APPLY.length];
    by.beh = [T(`fde-${f}`, ft, 'fde', fu ? { url: fu } : {}), T(`${k}-apply`, apt, 'beh', { url: apu })];
  }
  const ai = AI_DAYS[s - 1] || AI_DAYS_REVIEW[(s - AI_DAYS.length - 1) % AI_DAYS_REVIEW.length];
  by.ai = [T(`${k}-news`, NEWS_TASK, 'ai', { newsId: 'reads' }), T(`ai-${s}`, ai.text, 'ai', ai.url ? { url: ai.url } : {})];
  by.review = [T(`${k}-log`, 'Tick off today, write a one-line log below, glance at tomorrow', 'review', { log: true })];
  return (WEEKDAY_BLOCKS as unknown as Omit<Block, 'tasks'>[]).map(b => ({ ...b, tasks: by[b.k] || [] }));
}

function sundayBlocks(d: Day): Block[] {
  const k = `w${d.n}`, by: Record<string, Task[]> = {};
  by.workout = [T(`${k}-wo`, 'Long walk or easy run, 45–60 min', 'health')];
  if (d.phase === 2 && d.n! % 2 === 0) by.mock = [T(`${k}-aic`, AI_DRILL, 'dsa', { url: AI_DRILL_URL })];
  else if (d.phase < 3) {
    const end = Math.floor(Math.min(60, d.studyBefore!) * PER_DAY);
    const recent = P.DSA[Math.max(0, end - 1)], old = P.DSA[(d.n! * 37) % Math.max(1, end - 10)] || P.DSA[0];
    by.mock = [T(`${k}-m`, `Weekly mock: these 2 problems in ${d.phase === 1 ? 90 : 60} minutes, timed, out loud`, 'dsa'),
      T(`${k}-m1`, recent.name, 'dsa', { url: recent.url, diff: recent.d, slug: recent.slug }), T(`${k}-m2`, old.name, 'dsa', { url: old.url, diff: old.d, slug: old.slug })];
  } else by.mock = [T(`${k}-loop`, 'Full mock loop with a peer: DSA + frontend coding + system design, 45 min each', 'dsa', { url: 'https://www.tryexponent.com/practice' })];
  by.catchup = [T(`${k}-c1`, 'Clear the catch-up list (missed tasks from this week)', 'review'), T(`${k}-c2`, 'Re-solve every flagged problem; unflag the ones you nailed', 'dsa')];
  by.weekly = [T(`${k}-pulse`, "Read this week's Interview pulse (News tab). Write 1 thing that changes your prep in Notes (15 min)", 'beh', { newsId: 'pulse' }),
    T(`${k}-mkt`, 'Market check: read 5 new job posts for your target roles; add new skills to Job tracker', 'beh', { url: 'https://www.linkedin.com/jobs/' }),
    T(`${k}-r1`, 'Weekly reflection: what worked, what to fix (write below). Read this week\'s Updates.', 'review', { log: true })];
  by.rest = [T(`${k}-rest`, 'Take the afternoon off. Rest is part of the plan.', 'health')];
  by.review = [T(`${k}-post`, 'Optional: post one thing you built or learned this week', 'beh', { url: 'https://www.linkedin.com/' })];
  return (SUNDAY_BLOCKS as unknown as Omit<Block, 'tasks'>[]).map(b => ({ ...b, tasks: by[b.k] || [] }));
}

/** Build all 91 days. Updates from the engine mark outdated tasks and add must-reads as tasks. */
export function buildPlan(start: string, kickoff: boolean, updates: UpdateItem[] = [], custom: Record<string, CustomTask> = {}): Day[] {
  const days: Day[] = [];
  const s0 = parseISO(start);
  let s = 0, sun = 0, mcN = 0, lldN = 0;
  // With the prep day on, it is day 0 (the start date) and the 91 plan days follow it.
  for (let i = 0; i < TOTAL + (kickoff ? 1 : 0); i++) {
    const date = new Date(s0); date.setDate(s0.getDate() + i);
    const no = kickoff ? i : i + 1, week = Math.floor(Math.max(0, no - 1) / 7) + 1, phase = (week <= 4 ? 1 : week <= 9 ? 2 : 3) as 1 | 2 | 3;
    let d: Day;
    if (i === 0 && kickoff) d = { i, no, date, week, phase, type: 'kick', blocks: [], tasks: [] };
    else if (date.getDay() === 0) d = { i, no, date, week, phase, type: 'sun', n: ++sun, studyBefore: s, blocks: [], tasks: [] };
    else { d = { i, no, date, week, phase, type: 'study', s: ++s, blocks: [], tasks: [] }; if (date.getDay() === 6 && lldN < P.LLD.length) d.lld = ++lldN; else d.mc = ++mcN; }
    d.blocks = d.type === 'kick' ? kickBlocks() : d.type === 'sun' ? sundayBlocks(d) : studyBlocks(d);
    days.push(d);
  }
  applyUpdates(days, updates);
  applyCustom(days, custom);
  days.forEach(d => {
    d.blocks.forEach(b => {
      const ts = b.tasks.filter(t => t.cat !== 'health'), mins = toMin(b.e) - toMin(b.s);
      b.tasks.forEach(t => { t.bk = b.k; t.min = b.kind === 'study' && t.cat !== 'health' ? mins / ts.length : 0; });
    });
    d.tasks = d.blocks.flatMap(b => b.tasks);
  });
  return days;
}

/** Add the user's own tasks to the end of their block. Built-in tasks are never changed. */
function applyCustom(days: Day[], custom: Record<string, CustomTask>) {
  const byDate = new Map(days.map(d => [iso(d.date), d]));
  Object.entries(custom).sort((a, b) => a[1].at - b[1].at).forEach(([id, c]) => {
    const b = byDate.get(c.date)?.blocks.find(x => x.k === c.block);
    if (!b) return;
    const cat = b.tasks.find(t => t.cat !== 'review' && t.cat !== 'update' && !t.own)?.cat || (b.kind === 'health' ? 'health' : 'review');
    b.tasks.push(T(`u-${id}`, c.text, cat, { own: id, ...(c.url ? { url: c.url } : {}) }));
  });
}

function applyUpdates(days: Day[], updates: UpdateItem[]) {
  if (!updates.length) return;
  const all = days.flatMap(d => d.blocks.flatMap(b => b.tasks));
  for (const u of updates) {
    if ((u.kind === 'outdated' || u.kind === 'changed') && u.target) {
      const hit = u.target.startsWith('url:') ? all.filter(t => t.url === u.target!.slice(4)) : all.filter(t => t.id === u.target);
      hit.forEach(t => { t.outdated = u; if (u.replacementUrl) t.url = u.replacementUrl; });
    }
    if (u.kind === 'new' && u.priority !== 'fyi') {
      // Must-reads land in the catch-up block of the scheduled day (default: first Sunday on/after the update date).
      const when = u.scheduleOn ? parseISO(u.scheduleOn) : parseISO(u.date);
      const day = days.find(d => d.date >= when && (u.scheduleOn ? true : d.type === 'sun')) || days[days.length - 1];
      const block = day.blocks.find(b => b.k === 'catchup') || day.blocks.find(b => b.k === 'rev') || day.blocks.find(b => b.tasks.length && b.kind === 'study');
      block?.tasks.push(T(`upd-${u.id}`, `${u.priority === 'must' ? 'Must-read' : 'Worth reading'}: ${u.title}`, 'update', { url: u.url, fromUpdate: u }));
    }
  }
}

// ---------- metrics ----------
export const study = (t: Task) => t.cat !== 'health';
export function dayStats(d: Day, done: Record<string, number>, status: StatusMap = {}) {
  const c = studyCounts(d.tasks.map(t => ({ id: t.id, min: t.min, study: study(t) })), done, status);
  return { ...c, pct: c.total ? c.n / c.total : 0 };
}
export function overall(days: Day[], done: Record<string, number>, ti: number, marks: StatusMap = {}) {
  let planAll = 0, doneAll = 0, duePlan = 0, dueDone = 0;
  days.forEach(d => { const st = dayStats(d, done, marks); planAll += st.planMin; doneAll += st.doneMin; if (d.i < ti) { duePlan += st.planMin; dueDone += st.doneMin; } });
  const behindMin = duePlan - dueDone;
  const status: ['ok' | 'behind' | 'late', string] = ti <= 0 || duePlan === 0 || behindMin <= 60 ? ['ok', 'On track'] : behindMin <= 480 ? ['behind', `${hrs(behindMin)} h behind`] : ['late', `${hrs(behindMin)} h behind`];
  return { planAll, doneAll, leftAll: planAll - doneAll, behindMin, status, daysLeft: Math.max(0, Math.min(TOTAL, days.length - Math.max(0, ti))) };
}
export function dayTitle(d: Day) {
  if (d.type === 'kick') return 'Prep day: set up and get moving';
  if (d.type === 'sun') return 'Mock, catch up, recharge';
  const t = d.tasks.find(x => x.topic);
  return t ? `${t.topic} + ${P.FE[Math.min(d.s!, 48) - 1][0].split(/[:,(]/)[0].trim()}` : 'Interview mode: timed practice';
}
