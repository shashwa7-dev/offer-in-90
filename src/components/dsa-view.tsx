'use client';
/* DSA page (roadmap v2 §2): patterns with a readiness dot, the selected pattern's card and notes, and its problem table.
   Optional-pool problems live only here, never in Today. */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { PATTERNS, PROBLEMS } from '@/lib/content/dsa.js';
import { PATTERN_IDS, addOwnProblem, greenStatus, leetcodeSlug } from '@/lib/patterns';
import { DOT_GLYPH, DOT_LABEL, planDayMap, readinessDot } from '@/lib/dsa-page';
import { applyLabel, labelsOf, removeLabel } from '@/lib/labels';
import type { OwnProblem } from '@/lib/state-types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Chip, PageFrame, PageHeader, Seg, Surface } from './shell/page';
import { StatusControl, useTaskStatus } from './status-control';
import { LabelChip, LabelPicker, viewOf } from './label-picker';
import { LabelFilterBar } from './today-filters';
import { NoteEditor } from './note-editor';
import { SolveFields } from './solve-fields';

type Diff = 'E' | 'M' | 'H';
interface Pattern { id: string; name: string; topic: string; link: string | null; signal: string; template: string; why: string; complexity: string; traps: string[]; notWhen: string }
interface Row { slug: string; name: string; d: Diff; pattern: string; tier: 'must' | 'optional'; role?: string; flags: string[]; url: string; own?: boolean }
const PATS = PATTERNS as Pattern[];
const PLAN = PROBLEMS as Row[];
const DIFF = { E: 'Easy', M: 'Medium', H: 'Hard' } as const;
const patName = (id: string) => PATS.find(p => p.id === id)?.name ?? id;
type GroupBy = 'pattern' | 'topic';

const field = 'h-8 w-full min-w-0 rounded-[6px] border border-input bg-transparent px-2 text-[13px] outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30';

export function DsaView() {
  const { state, days } = useStore();
  const [sel, setSel] = useState<string>(PATS[0].id);
  const [groupBy, setGroupBy] = useState<GroupBy>('pattern');
  const [filter, setFilter] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);
  const [focus, setFocus] = useState<string | null>(null);
  const live = filter.filter(id => id.startsWith('sys:') || state.labels[id]?.kind === 'label');

  const rows: Row[] = useMemo(() => [...PLAN, ...Object.values(state.own).map((o): Row => ({ slug: o.slug, name: o.name, d: o.diff, pattern: o.pattern, tier: 'optional', flags: [], url: o.url, own: true }))], [state.own]);
  const planDay = useMemo(() => planDayMap(days), [days]);
  const dots = useMemo(() => {
    const now = Date.now();
    return new Map(PATS.map(p => [p.id, readinessDot(greenStatus(p.id, PLAN, state.own, state.solves, now))]));
  }, [state.own, state.solves]);
  const pat = PATS.find(p => p.id === sel)!;
  const topics = [...new Set(PATS.map(p => p.topic))];

  const labelIds = (r: Row) => labelsOf(state.itemLabels, { id: `p-${r.slug}`, own: r.own ? r.slug : undefined, pattern: r.pattern, tier: r.tier, flags: r.flags as ('hot' | 'hard-hot')[] });
  const shown = rows.filter(r => (groupBy === 'pattern' ? r.pattern === sel : PATS.find(p => p.id === r.pattern)?.topic === pat.topic) && (!live.length || labelIds(r).some(id => live.includes(id))));
  const groups = groupBy === 'pattern' ? [{ id: pat.id, title: pat.name, rows: shown }]
    : PATS.filter(p => p.topic === pat.topic).map(p => ({ id: p.id, title: p.name, rows: shown.filter(r => r.pattern === p.id) })).filter(g => g.rows.length);

  const focusRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (focus) focusRef.current?.scrollIntoView({ block: 'center' }); }, [focus, sel]);
  const labelPlanProblem = (slug: string) => { const r = PLAN.find(p => p.slug === slug); if (!r) return; setAdding(false); setGroupBy('pattern'); setFilter([]); setSel(r.pattern); setFocus(slug); };

  return (
    <PageFrame header={<PageHeader crumbs={['DSA']} actions={<>
      <Seg<GroupBy> value={groupBy} onChange={setGroupBy} options={[{ value: 'pattern', label: 'Pattern' }, { value: 'topic', label: 'Topic' }]} />
      <Button size="sm" onClick={() => setAdding(true)} data-add-problem><Plus />Add a problem</Button>
    </>} />}>
      <Surface>
        <div className="grid md:grid-cols-[260px_minmax(0,1fr)]">
          <nav aria-label="Patterns" data-patterns className="max-h-72 overflow-y-auto border-b border-border p-2 md:max-h-none md:border-r md:border-b-0">
            {topics.map(t => (
              <div key={t} className="mb-2">
                <p className="px-2 pt-1 pb-1 text-[12px] text-faint">{t}</p>
                {PATS.filter(p => p.topic === t).map(p => {
                  const dot = dots.get(p.id)!;
                  return (
                    <button key={p.id} type="button" data-pattern={p.id} data-dot={dot} aria-current={p.id === sel} onClick={() => setSel(p.id)}
                      className={cn('flex h-8 w-full items-center gap-2 rounded-[6px] px-2 text-left text-[13px] outline-none hover:bg-hover focus-visible:ring-2 focus-visible:ring-ring/40', p.id === sel && 'bg-hover font-medium')}>
                      <span role="img" aria-label={DOT_LABEL[dot]} title={DOT_LABEL[dot]} className={cn('w-4 shrink-0 text-center', dot === 'none' ? 'text-faint' : 'text-foreground')}>{DOT_GLYPH[dot]}</span>
                      <span className="min-w-0 flex-1 truncate">{p.name}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          <div className="min-w-0">
            <PatternCard p={pat} />
            <LabelFilterBar labels={live} onChange={setFilter} />
            <div data-problems>
              {groups.map(g => (
                <section key={g.id}>
                  <h3 className="border-t border-border bg-hover px-4 py-1.5 text-[12px] font-medium text-muted-foreground">{g.title} <span className="font-normal text-faint tabular-nums">{g.rows.length}</span></h3>
                  {g.rows.map(r => <ProblemRow key={r.slug} r={r} day={planDay.get(r.slug)} labelIds={labelIds(r)} highlighted={focus === r.slug} rowRef={focus === r.slug ? focusRef : undefined} />)}
                </section>
              ))}
              {!shown.length && <p className="border-t border-border px-4 py-6 text-[13px] text-muted-foreground">No problems match this label.</p>}
            </div>
          </div>
        </div>
      </Surface>
      <AddProblem open={adding} onOpenChange={setAdding} pattern={sel} onLabelPlan={labelPlanProblem} />
    </PageFrame>
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

function ProblemRow({ r, day, labelIds, highlighted, rowRef }: { r: Row; day: number | undefined; labelIds: string[]; highlighted: boolean; rowRef?: React.Ref<HTMLDivElement> }) {
  const { state, update } = useStore();
  const id = `p-${r.slug}`;
  const [st] = useTaskStatus(id);
  const hidden = r.role === 'unseen' && st === 'todo'; // an unseen check keeps its name back until Start
  const label = hidden ? 'Unseen problem' : r.name;
  const views = labelIds.filter(x => !x.startsWith('sys:')).map(x => viewOf(x, state.labels)).filter((v): v is NonNullable<ReturnType<typeof viewOf>> => !!v);
  const toggle = (labelId: string, on: boolean) => update(s => { const n = (on ? applyLabel : removeLabel)({ labels: s.labels, itemLabels: s.itemLabels }, id, labelId); return n.itemLabels === s.itemLabels ? s : { ...s, itemLabels: n.itemLabels }; });
  const remove = () => update(s => { const own = { ...s.own }; delete own[r.slug]; return { ...s, own }; });
  return (
    <div ref={rowRef} data-problem={r.slug} data-own={r.own ? '' : undefined} className={cn('group border-t border-border px-4 py-2 text-[13px]', highlighted && 'bg-hover shadow-[inset_2px_0_0_var(--ring)]')}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <StatusControl taskId={id} label={label} className="shrink-0" />
        <div className="min-w-0 flex-1 basis-40 break-words">
          {hidden ? <span data-unseen-hidden>Unseen problem</span>
            : <a href={r.url} target="_blank" rel="noopener noreferrer" className={cn('hover:underline', st === 'done' && 'text-muted-foreground line-through decoration-faint')}>{r.name}<span className="sr-only"> (opens in a new tab)</span></a>}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {!hidden && <Chip>{DIFF[r.d]}</Chip>}
          {!hidden && r.flags.includes('hot') && <span title="Frequent at Google, Meta, Amazon and Microsoft" role="img" aria-label="Frequent">🔥</span>}
          {!hidden && r.flags.includes('hard-hot') && <span title="Hard but frequent" role="img" aria-label="Hard but frequent">⭐</span>}
          <Chip data-tier={r.tier}>{r.own ? 'Yours' : r.tier === 'must' ? 'Must' : 'Optional'}</Chip>
          <span data-plan-day className="w-14 text-muted-foreground tabular-nums">{day != null ? `Day ${day}` : 'Pool'}</span>
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
