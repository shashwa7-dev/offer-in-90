'use client';
/* DSA page (roadmap v2 §2, Task 14): topics as headings, patterns under them, "All problems" at the top.
   A pattern shows its card, notes and problems; a topic shows its problems grouped by pattern; All groups by topic, then pattern.
   Filters (status, difficulty, tier, hot, labels, name) each show a count and are remembered per viewer.
   Optional-pool problems live only here, never in Today. */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Circle, CircleCheck, Contrast, Flame, Layers, List, Plus, Puzzle, Search, Star, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { PATTERNS, PROBLEMS, TOPICS } from '@/lib/content/dsa.js';
import { PATTERN_IDS, addOwnProblem, greenStatus, leetcodeSlug } from '@/lib/patterns';
import { DOT_LABEL, planDayMap, readinessDot, resolveDayMap, todayPattern, type Dot } from '@/lib/dsa-page';
import { DIFFS, EMPTY_DSA_FILTER, HOTS, STATUSES, TIERS, facetCounts, filterRows, groupProblems, isFilterEmpty, liveFilter, parseDsaFilter, type DsaFilter, type DsaView as ViewSel, type Facet, type FilterRow } from '@/lib/dsa-filter';
import { applyLabel, labelsOf, removeLabel } from '@/lib/labels';
import { statusOf, unseenHidden } from '@/lib/task-status';
import type { OwnProblem } from '@/lib/state-types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Chip, PageFrame, PageHeader, Surface } from './shell/page';
import { StatusControl, useTaskStatus } from './status-control';
import { LabelChip, LabelDot, LabelPicker, viewOf } from './label-picker';
import { NoteEditor } from './note-editor';
import { SolveFields } from './solve-fields';

type Diff = 'E' | 'M' | 'H';
interface Pattern { id: string; name: string; topic: string; link: string | null; signal: string; template: string; why: string; complexity: string; traps: string[]; notWhen: string }
interface Row { slug: string; name: string; d: Diff; pattern: string; tier: 'must' | 'optional'; role?: string; flags: string[]; url: string; own?: boolean }
type ViewRow = Row & FilterRow;
const PATS = PATTERNS as Pattern[];
const PLAN = PROBLEMS as Row[];
const TOPIC_LIST = TOPICS as string[];
const DIFF = { E: 'Easy', M: 'Medium', H: 'Hard' } as const;
const patName = (id: string) => PATS.find(p => p.id === id)?.name ?? id;
const FILTER_KEY = 'offer90.dsaFilter';

const field = 'h-8 w-full min-w-0 rounded-[6px] border border-input bg-transparent px-2 text-[13px] outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30';
const navRow = 'flex h-8 w-full items-center gap-2 rounded-[6px] px-2 text-left text-[13px] outline-none hover:bg-hover focus-visible:ring-2 focus-visible:ring-ring/40';

/** Readiness as a lucide icon: an empty circle, a half circle (unseen check passed), a check circle (green). */
export function ReadinessIcon({ dot, className }: { dot: Dot; className?: string }) {
  const Icon = dot === 'green' ? CircleCheck : dot === 'check' ? Contrast : Circle;
  return <span role="img" aria-label={DOT_LABEL[dot]} title={DOT_LABEL[dot]} data-readiness={dot} className={cn('inline-flex shrink-0', dot === 'none' ? 'text-faint' : 'text-foreground', className)}><Icon aria-hidden="true" className="size-3.5" /></span>;
}
export function HotIcon({ kind }: { kind: 'hot' | 'hard-hot' }) {
  const hot = kind === 'hot';
  const label = hot ? 'Frequent' : 'Hard but frequent';
  const Icon = hot ? Flame : Star;
  return <span role="img" aria-label={label} title={hot ? 'Frequent at Google, Meta, Amazon and Microsoft' : label} data-flag-icon={kind} className="inline-flex shrink-0 text-muted-foreground"><Icon aria-hidden="true" className="size-3.5" /></span>;
}

export function DsaView() {
  const { state, days, todayIdx } = useStore();
  // Until the owner picks something, the page opens on the pattern the plan teaches today (else the first pattern).
  const [picked, setPicked] = useState<ViewSel | null>(null);
  const defaultId = useMemo(() => todayPattern(days, todayIdx) ?? PATS[0].id, [days, todayIdx]);
  const view: ViewSel = picked ?? { kind: 'pattern', id: defaultId };
  const sel = view.kind === 'pattern' ? view.id : null;
  const [filter, setFilterState] = useState<DsaFilter>(EMPTY_DSA_FILTER);
  useEffect(() => { try { setFilterState(parseDsaFilter(localStorage.getItem(FILTER_KEY))); } catch { /* storage blocked: start empty */ } }, []);
  const setFilter = (f: DsaFilter) => {
    setFilterState(f);
    try { if (isFilterEmpty(f)) localStorage.removeItem(FILTER_KEY); else localStorage.setItem(FILTER_KEY, JSON.stringify(f)); } catch { /* not remembered */ }
  };
  const live = useMemo(() => liveFilter(filter, id => state.labels[id]?.kind === 'label'), [filter, state.labels]);
  const [adding, setAdding] = useState(false);
  const [focus, setFocus] = useState<string | null>(null);

  const planDay = useMemo(() => planDayMap(days), [days]);
  const resolveDays = useMemo(() => resolveDayMap(days), [days]);
  // Re-evaluated every minute so a solve dated "later today" or a 7-day gap is not frozen at first render.
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick(n => n + 1), 60_000); return () => clearInterval(t); }, []);
  const dots = useMemo(() => {
    const now = Date.now(); void tick;
    return new Map(PATS.map(p => [p.id, readinessDot(greenStatus(p.id, PLAN, state.own, state.solves, now))]));
  }, [state.own, state.solves, tick]);

  const rows: ViewRow[] = useMemo(() => {
    const all: Row[] = [...PLAN, ...Object.values(state.own).map((o): Row => ({ slug: o.slug, name: o.name, d: o.diff, pattern: o.pattern, tier: 'optional', flags: [], url: o.url, own: true }))];
    return all.map(r => {
      const id = `p-${r.slug}`, st = statusOf(id, state.done, state.status);
      return { ...r, done: st === 'done', hidden: unseenHidden(r.role === 'unseen', st),
        labels: labelsOf(state.itemLabels, { id, own: r.own ? r.slug : undefined, pattern: r.pattern, tier: r.tier, flags: r.flags as ('hot' | 'hard-hot')[] }) };
    });
  }, [state.own, state.done, state.status, state.itemLabels]);
  const inView = rows.filter(r => view.kind === 'all' || (view.kind === 'topic' ? PATS.find(p => p.id === r.pattern)?.topic === view.topic : r.pattern === view.id));
  const ownerLabels = Object.values(state.labels).filter(l => l.kind === 'label');
  const counts = facetCounts(inView, live, ownerLabels.map(l => l.id));
  const shown = filterRows(inView, live);
  const sections = groupProblems(shown, PATS, view);

  const focusRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (focus) focusRef.current?.scrollIntoView({ block: 'center' }); }, [focus, sel]);
  const openPattern = (id: string) => setPicked({ kind: 'pattern', id });
  const labelPlanProblem = (slug: string) => { const r = PLAN.find(p => p.slug === slug); if (!r) return; setAdding(false); setFilter(EMPTY_DSA_FILTER); openPattern(r.pattern); setFocus(slug); };
  const pat = sel ? PATS.find(p => p.id === sel)! : null;
  const heading = view.kind === 'all' ? 'All problems' : view.kind === 'topic' ? view.topic : pat!.name;

  return (
    <PageFrame header={<PageHeader crumbs={view.kind === 'pattern' ? ['DSA', pat!.topic, pat!.name] : view.kind === 'topic' ? ['DSA', view.topic] : ['DSA', 'All problems']} actions={
      <Button size="sm" onClick={() => setAdding(true)} data-add-problem><Plus />Add a problem</Button>
    } />}>
      <Surface>
        <div className="grid md:grid-cols-[260px_minmax(0,1fr)]">
          <nav aria-label="Topics and patterns" data-patterns className="max-h-72 overflow-y-auto border-b border-border p-2 md:max-h-none md:border-r md:border-b-0">
            <button type="button" data-nav-all aria-current={view.kind === 'all' ? 'true' : undefined} onClick={() => setPicked({ kind: 'all' })}
              className={cn(navRow, 'mb-1 font-medium', view.kind === 'all' && 'bg-hover')}>
              <List aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" /><span className="min-w-0 flex-1 truncate">All problems</span>
              <span className="text-[12px] font-normal text-faint tabular-nums">{rows.length}</span>
            </button>
            {TOPIC_LIST.map(t => {
              const ps = PATS.filter(p => p.topic === t);
              const on = view.kind === 'topic' && view.topic === t;
              return (
                <div key={t} className="mb-1" data-topic-group={t}>
                  <button type="button" data-topic={t} aria-current={on ? 'true' : undefined} onClick={() => setPicked({ kind: 'topic', topic: t })}
                    className={cn(navRow, 'mt-1 font-semibold [font-variant-caps:all-small-caps] tracking-wide text-foreground', on && 'bg-hover')}>
                    <Layers aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate">{t}</span>
                    <span className="text-[12px] font-normal [font-variant-caps:normal] tracking-normal text-faint tabular-nums">{ps.length} {ps.length === 1 ? 'pattern' : 'patterns'}</span>
                  </button>
                  {ps.map(p => {
                    const dot = dots.get(p.id)!;
                    return (
                      <button key={p.id} type="button" data-pattern={p.id} data-dot={dot} aria-current={p.id === sel ? 'true' : undefined} onClick={() => openPattern(p.id)}
                        className={cn(navRow, 'pl-6 font-normal', p.id === sel && 'bg-hover font-medium')}>
                        <Puzzle aria-hidden="true" className="size-3.5 shrink-0 text-faint" />
                        <span className="min-w-0 flex-1 truncate">{p.name}</span>
                        <ReadinessIcon dot={dot} />
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </nav>

          <div className="min-w-0" data-dsa-view={view.kind}>
            {pat ? <PatternCard p={pat} /> : (
              <div className="flex items-baseline gap-2 px-4 py-4" data-view-heading>
                <h2 className="text-[16px] font-semibold">{heading}</h2>
                <span className="text-[13px] text-muted-foreground tabular-nums">{inView.length} problems{view.kind === 'topic' ? ` · ${PATS.filter(p => p.topic === view.topic).length} patterns` : ''}</span>
              </div>
            )}
            <DsaFilterBar filter={live} counts={counts} labels={ownerLabels} onChange={setFilter} />
            <div data-problems>
              {sections.map(sec => (
                <section key={sec.topic} data-section-topic={sec.topic}>
                  {view.kind === 'all' && <h3 className="flex items-center gap-1.5 border-t border-border px-4 pt-3 pb-1 text-[12px] font-semibold [font-variant-caps:all-small-caps] tracking-wide text-foreground"><Layers aria-hidden="true" className="size-3.5 text-muted-foreground" />{sec.topic}</h3>}
                  {sec.groups.map(g => (
                    <div key={g.pattern} data-section-pattern={g.pattern}>
                      <h4 className="flex items-center gap-1.5 border-t border-border bg-hover px-4 py-1.5 text-[12px] font-medium text-muted-foreground">
                        <Puzzle aria-hidden="true" className="size-3.5 text-faint" />
                        {view.kind === 'pattern' ? patName(g.pattern) : <button type="button" onClick={() => openPattern(g.pattern)} className="rounded-[4px] outline-none hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring/40">{patName(g.pattern)}</button>}
                        <span className="font-normal text-faint tabular-nums">{g.rows.length}</span>
                      </h4>
                      {g.rows.map(r => <ProblemRow key={r.slug} r={r} day={planDay.get(r.slug)} resolves={resolveDays.get(r.slug) ?? []} labelIds={r.labels} highlighted={focus === r.slug} rowRef={focus === r.slug ? focusRef : undefined} />)}
                    </div>
                  ))}
                </section>
              ))}
              {!shown.length && <p data-no-match className="border-t border-border px-4 py-6 text-[13px] text-muted-foreground">No problems match these filters.</p>}
            </div>
          </div>
        </div>
      </Surface>
      <AddProblem open={adding} onOpenChange={setAdding} pattern={sel ?? PATS[0].id} onLabelPlan={labelPlanProblem} />
    </PageFrame>
  );
}

const FACET_TITLE: Record<Facet, string> = { status: 'Status', diff: 'Difficulty', tier: 'Tier', hot: 'Hot', labels: 'Labels' };
const OPTION_NAME: Record<string, string> = { todo: 'To do', done: 'Done', E: 'Easy', M: 'Medium', H: 'Hard', must: 'Must', optional: 'Optional', yours: 'Yours', hot: 'Frequent', 'hard-hot': 'Hard but frequent' };

function DsaFilterBar({ filter, counts, labels, onChange }: { filter: DsaFilter; counts: ReturnType<typeof facetCounts>; labels: { id: string; name: string; color?: string }[]; onChange: (f: DsaFilter) => void }) {
  const toggle = (facet: Facet, v: string) => {
    const cur = filter[facet] as string[];
    onChange({ ...filter, [facet]: cur.includes(v) ? cur.filter(x => x !== v) : [...cur, v] });
  };
  const facet = (k: Facet, opts: { v: string; name: string; color?: string; icon?: React.ReactNode }[]) => (
    <FacetPicker key={k} facet={k} title={FACET_TITLE[k]} selected={filter[k] as string[]} options={opts.map(o => ({ ...o, n: (counts[k] as Record<string, number>)[o.v] ?? 0 }))} onToggle={v => toggle(k, v)} />
  );
  return (
    <div data-dsa-filter className="flex flex-wrap items-center gap-1.5 border-t border-border px-4 py-2">
      <label className="relative flex h-7 min-w-0 flex-[1_1_160px] items-center sm:max-w-56">
        <Search aria-hidden="true" className="pointer-events-none absolute left-2 size-3.5 text-faint" />
        <input data-dsa-search value={filter.q} onChange={e => onChange({ ...filter, q: e.target.value })} placeholder="Search by name" aria-label="Search problems" title="Search by problem name"
          className="h-7 w-full min-w-0 rounded-[6px] border border-input bg-transparent pr-2 pl-7 text-[13px] outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30" />
      </label>
      {facet('status', STATUSES.map(v => ({ v, name: OPTION_NAME[v] })))}
      {facet('diff', DIFFS.map(v => ({ v, name: OPTION_NAME[v] })))}
      {facet('tier', TIERS.map(v => ({ v, name: OPTION_NAME[v] })))}
      {facet('hot', HOTS.map(v => ({ v, name: OPTION_NAME[v], icon: <HotIcon kind={v} /> })))}
      {labels.length > 0 && facet('labels', labels.map(l => ({ v: l.id, name: l.name, color: l.color })))}
      {!isFilterEmpty(filter) && (
        <button type="button" data-dsa-clear onClick={() => onChange(EMPTY_DSA_FILTER)}
          className="inline-flex h-7 items-center gap-1 rounded-[6px] px-2 text-[13px] text-muted-foreground outline-none hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40"><X aria-hidden="true" className="size-3.5" />Clear</button>
      )}
    </div>
  );
}

function FacetPicker({ facet, title, selected, options, onToggle }: { facet: Facet; title: string; selected: string[]; options: { v: string; name: string; n: number; color?: string; icon?: React.ReactNode }[]; onToggle: (v: string) => void }) {
  const names = options.filter(o => selected.includes(o.v)).map(o => o.name);
  return (
    <Popover>
      <PopoverTrigger data-dsa-facet={facet} aria-label={names.length ? `${title}: ${names.join(', ')}` : `Filter by ${title.toLowerCase()}`}
        className={cn('inline-flex h-7 max-w-56 items-center gap-1 rounded-[6px] border px-2 text-[13px] outline-none hover:bg-hover focus-visible:ring-2 focus-visible:ring-ring/40',
          names.length ? 'border-input bg-card text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground')}>
        <span className="truncate">{names.length ? `${title}: ${names.join(', ')}` : title}</span><ChevronDown aria-hidden="true" className="size-3.5 shrink-0" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 rounded-[12px] p-1">
        <div role="group" aria-label={title} className="max-h-[min(320px,50vh)] overflow-y-auto">
          {options.map(o => {
            const on = selected.includes(o.v);
            return (
              <button key={o.v} type="button" role="checkbox" aria-checked={on} data-dsa-option={`${facet}:${o.v}`} data-count={o.n} onClick={() => onToggle(o.v)}
                className="flex h-8 w-full items-center gap-2 rounded-[6px] px-2 text-left text-[13px] outline-none hover:bg-hover focus-visible:bg-hover">
                <span aria-hidden="true" className={cn('grid size-4 shrink-0 place-items-center rounded-[4px] border', on ? 'border-primary bg-primary text-primary-foreground' : 'border-input')}>{on && <Check className="size-3 text-current" />}</span>
                {o.icon}<LabelDot color={o.color} /><span className="min-w-0 flex-1 truncate">{o.name}</span>
                <span className="text-[12px] text-faint tabular-nums">{o.n}</span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function PatternCard({ p }: { p: Pattern }) {
  const items: [string, React.ReactNode][] = [
    ['Signal', p.signal], ['Template', p.template], ['Why it works', p.why], ['Complexity', p.complexity],
    ['Traps', <ul key="t" className="list-disc pl-4">{p.traps.map(x => <li key={x}>{x}</li>)}</ul>], ['Not this when', p.notWhen],
  ];
  return (
    <div className="px-4 py-4" data-card={p.id}>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="text-[16px] font-semibold">{p.name}</h2>
        {p.link ? <a href={p.link} target="_blank" rel="noopener noreferrer" className="shrink-0 text-[13px] text-muted-foreground hover:text-foreground hover:underline">Read the explainer ↗<span className="sr-only"> (opens in a new tab)</span></a> : <span className="text-[12px] text-faint">No free explainer; the card is the source</span>}
      </div>
      <dl className="grid gap-x-4 gap-y-2 text-[13px] sm:grid-cols-[120px_minmax(0,1fr)]">
        {items.map(([k, v]) => <div key={k} className="contents"><dt className="text-muted-foreground">{k}</dt><dd className="min-w-0 break-words">{v}</dd></div>)}
      </dl>
      <div className="mt-4" data-pattern-notes>
        <h3 className="mb-1.5 text-[13px] font-medium">My notes</h3>
        <NoteEditor key={p.id} target={{ kind: 'task', key: `pattern:${p.id}`, title: `${p.name} (pattern notes)` }} compact />
      </div>
    </div>
  );
}

function ProblemRow({ r, day, resolves, labelIds, highlighted, rowRef }: { r: Row; day: number | undefined; resolves: number[]; labelIds: string[]; highlighted: boolean; rowRef?: React.Ref<HTMLDivElement> }) {
  const { state, update } = useStore();
  const id = `p-${r.slug}`;
  const [st] = useTaskStatus(id);
  const hidden = unseenHidden(r.role === 'unseen', st); // an unseen check keeps its name back until Start (skipping keeps it hidden)
  const label = hidden ? 'Unseen problem' : r.name;
  const views = labelIds.filter(x => !x.startsWith('sys:')).map(x => viewOf(x, state.labels)).filter((v): v is NonNullable<ReturnType<typeof viewOf>> => !!v);
  const toggle = (labelId: string, on: boolean) => update(s => { const n = (on ? applyLabel : removeLabel)({ labels: s.labels, itemLabels: s.itemLabels }, id, labelId); return n.itemLabels === s.itemLabels ? s : { ...s, itemLabels: n.itemLabels }; });
  const remove = () => update(s => {
    const own = { ...s.own }, solves = { ...s.solves }, itemLabels = { ...s.itemLabels };
    delete own[r.slug]; delete solves[id]; delete itemLabels[id];
    return { ...s, own, solves, itemLabels };
  });
  return (
    <div ref={rowRef} data-problem={hidden ? undefined : r.slug} data-unseen-row={hidden ? '' : undefined} data-own={r.own ? '' : undefined} className={cn('group border-t border-border px-4 py-2 text-[13px]', highlighted && 'bg-hover shadow-[inset_2px_0_0_var(--ring)]')}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <StatusControl taskId={id} label={label} className="shrink-0" />
        <div className="min-w-0 flex-1 basis-40 break-words">
          {hidden ? <span data-unseen-hidden>Unseen problem</span>
            : <a href={r.url} target="_blank" rel="noopener noreferrer" className={cn('hover:underline', st === 'done' && 'text-muted-foreground line-through decoration-faint')}>{r.name}<span className="sr-only"> (opens in a new tab)</span></a>}
          <p data-plan-line className="flex flex-wrap items-center gap-x-1 text-[12px] text-muted-foreground tabular-nums">
            <span data-plan-day>{day != null ? `Day ${day}` : 'Pool'}</span>
            {day != null && st === 'done' && <span role="img" aria-label="done" title="Done" className="inline-flex"><Check aria-hidden="true" className="size-3" /></span>}
            {resolves.length > 0 && <span data-resolve-days>· re-solves Day {resolves.join(', ')}</span>}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {!hidden && <Chip>{DIFF[r.d]}</Chip>}
          {!hidden && r.flags.includes('hot') && <HotIcon kind="hot" />}
          {!hidden && r.flags.includes('hard-hot') && <HotIcon kind="hard-hot" />}
          <Chip data-tier={r.tier}>{r.own ? 'Yours' : r.tier === 'must' ? 'Must' : 'Optional'}</Chip>
          {views.map(v => <LabelChip key={v.id} v={v} />)}
          <LabelPicker selected={state.itemLabels[id] || []} onToggle={toggle} />
          {r.own && <button type="button" onClick={remove} aria-label={`Remove ${r.name}`} title="Remove your problem" className="inline-flex size-6 items-center justify-center rounded-[5px] text-muted-foreground hover:bg-hover hover:text-foreground"><Trash2 className="size-3.5" /></button>}
        </div>
      </div>
      {!hidden && st !== 'todo' && st !== 'skipped' && <SolveFields solveKey={id} enabled={st === 'done'} className="mt-1.5 pl-7" />}
    </div>
  );
}

function AddProblem({ open, onOpenChange, pattern, onLabelPlan }: { open: boolean; onOpenChange: (v: boolean) => void; pattern: string; onLabelPlan: (slug: string) => void }) {
  const { state, update } = useStore();
  const [url, setUrl] = useState(''), [name, setName] = useState(''), [diff, setDiff] = useState<Diff>('M'), [pat, setPat] = useState(pattern);
  const [err, setErr] = useState<'not-leetcode' | 'in-plan' | null>(null);
  useEffect(() => { if (open) { setUrl(''); setName(''); setDiff('M'); setPat(pattern); setErr(null); } }, [open, pattern]);
  // A problem the plan or its optional pool already has is stored once, by slug, so it counts once towards green.
  const known = leetcodeSlug(url) && PLAN.some(p => p.slug === leetcodeSlug(url)) ? leetcodeSlug(url)! : null;
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const at = Date.now();
    const input = { url, name, diff, pattern: pat };
    const res = addOwnProblem(state.own, PLAN, input, at);
    if ('error' in res) { setErr(res.error); return; }
    const entry = res.own[leetcodeSlug(url)!] as OwnProblem;
    update(s => ({ ...s, own: { ...s.own, [entry.slug]: entry } }));
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} overlayClassName="bg-black/20" className="gap-3 sm:max-w-md" data-add-dialog>
        <DialogTitle className="text-[14px] font-medium">Add a problem</DialogTitle>
        <DialogDescription className="sr-only">Add your own LeetCode problem to the pattern pool.</DialogDescription>
        <form onSubmit={submit} className="flex flex-col gap-3 text-[13px]">
          <label className="flex flex-col gap-1">LeetCode URL
            <input value={url} onChange={e => { setUrl(e.target.value); setErr(null); }} placeholder="https://leetcode.com/problems/two-sum/" aria-label="LeetCode URL" autoFocus className={field} />
          </label>
          <label className="flex flex-col gap-1">Name (optional)
            <input value={name} onChange={e => setName(e.target.value)} aria-label="Name" className={field} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">Pattern
              <select value={pat} onChange={e => setPat(e.target.value)} aria-label="Pattern" className={field}>{PATTERN_IDS.map(id => <option key={id} value={id}>{patName(id)}</option>)}</select>
            </label>
            <label className="flex flex-col gap-1">Difficulty
              <select value={diff} onChange={e => setDiff(e.target.value as Diff)} aria-label="Difficulty" className={field}>{(['E', 'M', 'H'] as const).map(d => <option key={d} value={d}>{DIFF[d]}</option>)}</select>
            </label>
          </div>
          {err === 'not-leetcode' && <p role="alert" className="text-muted-foreground">That is not a leetcode.com/problems/… link.</p>}
          {(err === 'in-plan' && known) && (
            <p role="alert" data-in-plan className="text-muted-foreground">That problem is already in the plan or its pool. It is stored once, so it counts once.{' '}
              <button type="button" onClick={() => onLabelPlan(known)} className="font-medium text-foreground underline-offset-4 hover:underline">Label the plan problem instead</button></p>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" size="sm" disabled={!url.trim()}>Add</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
