// Run: node --experimental-strip-types scripts/test-timeline.ts
import assert from 'node:assert/strict';
import { bandOf, stageBars, STAGES, TRACKS, weekSummary } from '../src/lib/timeline.ts';
import type { TimelineDay } from '../src/lib/timeline.ts';

// bandOf
assert.equal(bandOf('00:00'), 'morning');
assert.equal(bandOf('11:59'), 'morning');
assert.equal(bandOf('12:00'), 'afternoon');
assert.equal(bandOf('16:59'), 'afternoon');
assert.equal(bandOf('17:00'), 'evening');
assert.equal(bandOf('23:30'), 'evening');

assert.deepEqual(TRACKS.map((t) => [t.key, t.name]), [['dsa', 'DSA'], ['ai', 'AI engineering'], ['sd', 'Systems'], ['mc', 'Product'], ['platform', 'Platform'], ['career', 'Career'], ['fe', 'Frontend']]);
assert.equal(STAGES.length, 13);
assert.deepEqual([...new Set(STAGES.map((s) => s.track))], TRACKS.map((t) => t.key), 'one or two stages per track, in track order');

const T = (id: string, cat: string, own?: string, pattern?: string) => ({ id, cat, ...(own ? { own } : {}), ...(pattern ? { pattern } : {}) });
const days: TimelineDay[] = [
  { week: 1, type: 'prep', tasks: [T('p-ignored', 'dsa', undefined, 'hash-map')] }, // prep: no s
  { week: 1, s: 1, type: 'study', tasks: [T('dsa:foundations-big-o', 'dsa'), T('fe:rendering-path', 'fe'), T('d:2026-11-16:news', 'ai'), T('d:2026-11-16:recall-ai', 'ai'), T('ai:math-intuition', 'ai'), T('sd:numbers-card', 'sd'), T('pf:shell', 'platform')] },
  { week: 1, s: 2, type: 'study', tasks: [T('p-two-sum', 'dsa', undefined, 'hash-map'), T('sd:os', 'sd'), T('mine', 'dsa', 'u1', 'hash-map'), T('rs:two-sum:3', 'dsa'), T('d:2026-11-17:drill', 'dsa'), T('d:2026-11-17:recall-sd', 'sd')] },
  { week: 1, type: 'sun', tasks: [T('p-sunday', 'dsa', undefined, 'hash-map')] }, // Sunday: no s
  { week: 2, s: 8, type: 'study', tasks: [T('dsa:card-two-pointers', 'dsa', undefined, 'two-pointers'), T('proj:setup', 'proj'), T('lld:oop-solid', 'mc'), T('beh:resume', 'beh'), T('beh:ai-drill-1', 'beh')] },
  { week: 3, s: 18, type: 'study', tasks: [T('p-last-tree', 'dsa', undefined, 'tree-dfs'), T('sd:hld-bitly', 'sd'), T('jt:hiw-stripe-idempotency', 'sd'), T('fe:sql', 'platform'), T('sd:fe-radio', 'fe')] },
  { week: 7, s: 40, type: 'study', tasks: [T('p-climbing-stairs', 'dsa', undefined, 'dp'), T('dsa:explain-back-dp', 'dsa', undefined, 'dp'), T('sd:ai-rag-search', 'ai'), T('mc:take-home-issue-triage-1', 'proj')] },
  { week: 10, s: 61, type: 'study', tasks: [T('dsa:oa-2', 'dsa'), T('dsa:google-1:3sum', 'dsa'), T('adv:fenwick-segment-tree', 'dsa'), T('env:google-doc', 'dsa'), T('sdm:hld-whatsapp', 'sd'),
    T('fde:stage1-intro', 'fde'), T('jt:decomp-fraud', 'fde'), T('beh:loop-1-round-2', 'beh'), T('beh:peer-w6-decomposition', 'fde'), T('sdm:ai-rag', 'ai'), T('mc:autocomplete', 'fe'), T('fe:rep-mixed-set-1', 'fe'), T('sd:fe-news-feed:deep-dive', 'fe'), T('rv:coin-change:2027-01-20', 'dsa')] },
  { week: 11, s: 62, type: 'study', tasks: [{ ...T('p-two-sum', 'dsa', undefined, 'hash-map'), superseded: true as const }] }, // history only
];
const done = { 'p-two-sum': 1, 'p-last-tree': 1, 'd:2026-11-16:news': 1, mine: 1, 'p-sunday': 1, 'p-ignored': 1, 'sd:os': 0 };
const bars = stageBars(days, done);
const get = (label: string) => bars.find((b) => b.label === label);

const arr = get('Foundations + 27 patterns')!;
assert.equal(arr.track, 'dsa');
assert.equal(arr.fromWeek, 1);
assert.equal(arr.toWeek, 7);
assert.equal(arr.total, 6); // foundations, two-sum, card-two-pointers, last-tree, climbing-stairs, explain-back-dp (not own, re-solve, drill, superseded)
assert.equal(arr.done, 2);

const totals = Object.fromEntries(bars.map((b) => [b.label, b.total]));
assert.deepEqual(totals, {
  'Foundations + 27 patterns': 6, 'Phase 3: timed sets, OA, advanced': 4,
  'LLMs, RAG, evals, agents, serving': 1, 'AI designs, teach-backs, mocks': 2,
  'Fundamentals, DDIA, case studies': 3, 'HLD designs + mocks': 2,
  'Flagship + take-homes': 2, 'LLD Saturdays': 1,
  'Platform, data and DevOps': 2,
  'Career and FDE': 3, 'Mock day': 3,
  'Senior frontend + timed reps': 3, 'Frontend system design': 2,
});
// fe:sql belongs to Platform (cat platform), not Frontend; a take-home part counts once, in the flagship stage.
assert.equal(get('Platform, data and DevOps')!.fromWeek, 1);
assert.equal(get('LLD Saturdays')!.total, 1);
for (const t of days.flatMap((d) => d.tasks)) assert.ok(STAGES.filter((st) => st.match(t)).length <= 1, `${t.id} in at most one stage`);

// never counts news, own, prep, Sunday, re-solves, drills or superseded copies
const all = bars.reduce((n, b) => n + b.total, 0);
assert.equal(bars.filter((b) => b.track === 'ai').reduce((n, b) => n + b.total, 0), 3); // not the news or recall tasks

// skipped tasks never count (done wins over skipped)
{
  const sk = stageBars(days, done, { 'dsa:card-two-pointers': 'skipped', 'p-two-sum': 'skipped', 'pf:shell': 'skipped', 'fe:sql': 'skipped' });
  const a2 = sk.find((b) => b.label === 'Foundations + 27 patterns')!;
  assert.equal(a2.total, 5); // card dropped; done two-sum stays counted
  assert.equal(a2.done, 2);
  assert.equal(sk.find((b) => b.label === 'Platform, data and DevOps'), undefined); // all skipped -> no bar
}

// bars follow STAGES order
const order = bars.map((b) => STAGES.findIndex((s) => s.label === b.label));
assert.deepEqual(order, [...order].sort((a, b) => a - b));
assert.ok(all > 0);

// Roadmap › Weeks summary: by category, not block key (block fe holds AI core, cat ai; block ai holds Frontend, cat fe)
{
  const t = (id: string, cat: string, text: string, extra = {}) => ({ id, cat, text, ...extra });
  const wk = [
    { week: 2, type: 'study', blocks: [
      { k: 'dsa', tasks: [t('p-two-sum', 'dsa', 'Two Sum', { pattern: 'hash-map' }), t('rv:3sum:2026-12-05', 'dsa', 'Pattern revisit', { pattern: 'two-pointers' })] },
      { k: 'aib', tasks: [t('d:2026-11-23:recall-ai', 'ai', 'AI recall (30 min): explain'), t('d:2026-11-23:news', 'ai', "Skim today's News")] },
      { k: 'fe', tasks: [t('ai:rag', 'ai', 'RAG basics: retrieve then generate'), t('ai:rag:do', 'ai', 'Build a tiny RAG'), t('ai:rag:explain', 'ai', 'Explain RAG')] },
      { k: 'ai', tasks: [t('fe:rendering-path', 'fe', 'The rendering path: parse, style'), t('fe:rendering-path:explain', 'fe', 'Explain the path'), t('own-1', 'fe', 'Mine', { own: 'own-1' })] },
      { k: 'sd', tasks: [t('sd:ai-chat', 'ai', 'AI design · A chat assistant (RAG)')] },
    ] },
    { week: 2, type: 'study', blocks: [{ k: 'ai', tasks: [t('fe:react', 'fe', 'React internals, fiber'), t('fe:old', 'fe', 'Moved', { superseded: true })] }] },
  ];
  const name = (p: string) => p.toUpperCase();
  const short = (x: string) => x.replace(/^[A-Za-z &]+ · /, '').split(/[:,(.]/)[0].trim();
  assert.deepEqual(weekSummary(wk, 2, name, short), ['DSA: HASH-MAP, TWO-POINTERS', 'Frontend: The rendering path, React internals…', 'AI: RAG basics; A chat assistant…']);
  assert.deepEqual(weekSummary(wk, 3, name, short), ['Kickoff']);
  const bare = [{ week: 4, type: 'study', blocks: [{ k: 'fe', tasks: [t('d:x:recall-ai', 'ai', 'AI recall')] }] }];
  assert.deepEqual(weekSummary(bare, 4, name, short), ['DSA: foundations, timed sets + OA', 'Frontend: revision', 'AI: explain-it-back revision']);
}

console.log('timeline ok');
