'use client';
/* Today filter bar (Linear style): status pills with counts, "+ Filter" chips, and the Display menu (group by). */
import { useCallback, useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import { Check, ChevronLeft, ChevronRight, ListFilter, Plus, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EMPTY_FILTER, parseFilter, type GroupBy, type TaskFilter } from '@/lib/task-filter';
import type { OwnerLabel } from '@/lib/state-types';
import { STATUS_LABEL, type TaskStatus } from '@/lib/task-status';
import { TRACKS } from '@/lib/timeline';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { StatusIcon } from './status-control';
import { LabelDot, labelOptions, viewOf } from './label-picker';

export interface TodayFilterValue { filter: TaskFilter; groupBy: GroupBy }
type Counts = Record<'all' | TaskStatus, number>;
type Dim = 'tracks' | 'blocks' | 'labels' | 'diff';

const KEY = 'offer90.todayFilter';
export const GROUP_LABEL: Record<GroupBy, string> = { time: 'Time of day', status: 'Status', track: 'Track' };
const DIMS: { k: Dim; label: string }[] = [{ k: 'tracks', label: 'Track' }, { k: 'blocks', label: 'Block' }, { k: 'labels', label: 'Label' }, { k: 'diff', label: 'Difficulty' }];
const DIFF_LABEL = { E: 'Easy', M: 'Medium', H: 'Hard' } as const;
const PILLS: ('all' | TaskStatus)[] = ['all', 'todo', 'progress', 'done', 'skipped'];

/** Filter and grouping for Today, kept per browser in localStorage (guarded; never synced).
    Label ids that no longer exist (deleted here or on another device) are dropped from what callers see. */
export function useTodayFilter(): [TodayFilterValue, (v: TodayFilterValue) => void] {
  const { state } = useStore();
  const [v, setV] = useState<TodayFilterValue>(() => {
    try { return parseFilter(JSON.parse(localStorage.getItem(KEY) || 'null')); } catch { return { filter: { ...EMPTY_FILTER }, groupBy: 'time' }; }
  });
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch { /* storage blocked: keep in memory */ } }, [v]);
  const live = useMemo(() => pruneLabels(v, state.labels), [v, state.labels]);
  return [live, setV];
}

/** Drop label ids that no longer exist; returns the same object when nothing changed. */
export function pruneLabels(v: TodayFilterValue, labels: Record<string, { kind: string }>): TodayFilterValue {
  const keep = v.filter.labels.filter(id => id.startsWith('sys:') || labels[id]?.kind === 'label');
  return keep.length === v.filter.labels.length ? v : { ...v, filter: { ...v.filter, labels: keep } };
}

function valuesOf(dim: Dim, blocks: { k: string; title: string }[], labels: ReturnType<typeof labelOptions> = []): { v: string; label: string; color?: string; group?: string }[] {
  if (dim === 'labels') return labels.map(l => ({ v: l.id, label: l.name, color: l.color, group: l.group }));
  if (dim === 'tracks') return TRACKS.map(t => ({ v: t.key, label: t.name }));
  if (dim === 'blocks') return blocks.map(b => ({ v: b.k, label: b.title }));
  return (['E', 'M', 'H'] as const).map(d => ({ v: d, label: DIFF_LABEL[d] }));
}
const selected = (f: TaskFilter, dim: Dim): string[] => f[dim];

function toggle(f: TaskFilter, dim: Dim, v: string): TaskFilter {
  const cur: string[] = f[dim];
  return { ...f, [dim]: cur.includes(v) ? cur.filter(x => x !== v) : [...cur, v] };
}

/** Popover + Command: dimension list first, then that dimension's values with checkmarks. */
function FilterPicker({ filter, onChange, blocks, start, trigger, className, label, ...rest }: { filter: TaskFilter; onChange: (f: TaskFilter) => void; blocks: { k: string; title: string }[]; start: Dim | null; trigger: React.ReactNode; className: string; label: string } & Record<`data-${string}`, string | undefined>) {
  const { state } = useStore();
  const labelOpts = useMemo(() => labelOptions(state.labels), [state.labels]);
  const [open, setOpen] = useState(false);
  const [dim, setDim] = useState<Dim | null>(start);
  const [q, setQ] = useState('');
  const onOpenChange = (v: boolean) => { setOpen(v); if (v) { setDim(start); setQ(''); } };
  const pickDim = (d: Dim) => { setDim(d); setQ(''); };
  const back = () => { setDim(null); setQ(''); };
  const onKey = (e: KeyboardEvent) => { if (e.key === 'Backspace' && !q && dim && !start) { e.preventDefault(); back(); } };
  const sel = dim ? selected(filter, dim) : [];
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger className={className} aria-label={label} {...rest}>{trigger}</PopoverTrigger>
      <PopoverContent align="start" className="w-64 rounded-[12px] p-0">
        <Command onKeyDown={onKey}>
          <CommandInput value={q} onValueChange={setQ} placeholder={dim ? `${DIMS.find(x => x.k === dim)?.label}…` : 'Filter…'} />
          <CommandList className="max-h-[min(320px,50vh)]">
            <CommandEmpty>{dim === 'blocks' && !blocks.length ? 'No blocks with tasks.' : 'Nothing matches.'}</CommandEmpty>
            {!dim ? (
              <CommandGroup>
                {DIMS.map(d => (
                  <CommandItem key={d.k} value={d.label} onSelect={() => pickDim(d.k)} className="text-[13px]">
                    <span className="min-w-0 flex-1 truncate">{d.label}</span>
                    {selected(filter, d.k).length > 0 && <span className="text-faint tabular-nums">{selected(filter, d.k).length}</span>}
                    <ChevronRight className="text-faint" />
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : (
              (() => {
                const opts = valuesOf(dim, blocks, labelOpts);
                const names = [...new Set(opts.map(o => o.group))];
                return names.map((gname, gi) => (
                  <CommandGroup key={gname ?? 'x'} heading={dim === 'labels' ? gname : undefined}>
                    {gi === 0 && !start && <CommandItem value="‹ Back" onSelect={back} className="text-[13px] text-muted-foreground"><ChevronLeft />Back</CommandItem>}
                    {opts.filter(o => o.group === gname).map(o => {
                      const on = sel.includes(o.v);
                      return (
                        <CommandItem key={o.v} value={dim === 'labels' ? `${gname} ${o.label} ${o.v}` : o.label} onSelect={() => onChange(toggle(filter, dim, o.v))} className="gap-2 text-[13px]" data-checked={on || undefined}>
                          <span aria-hidden="true" className={cn('grid size-4 shrink-0 place-items-center rounded-[4px] border', on ? 'border-primary bg-primary text-primary-foreground' : 'border-input')}>
                            {on && <Check className="size-3 text-current" />}
                          </span>
                          <LabelDot color={o.color} />
                          <span className="min-w-0 flex-1 truncate tabular-nums">{o.label}</span>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                ));
              })()
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function chipText(f: TaskFilter, dim: Dim, blocks: { k: string; title: string }[], labels: Record<string, OwnerLabel>): string {
  const opts = valuesOf(dim, blocks);
  const names = f[dim].map(v => dim === 'labels' ? viewOf(v, labels)?.name ?? v : opts.find(l => l.v === v)?.label ?? v);
  return `${DIMS.find(d => d.k === dim)!.label} is ${names.join(', ')}`;
}
const clearDim = (f: TaskFilter, dim: Dim): TaskFilter => ({ ...f, [dim]: [] });

const pillBase = 'inline-flex h-7 shrink-0 items-center gap-1.5 rounded-[6px] border px-2.5 text-[13px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50';

/** The bar: status pills, active filter chips, "+ Filter", and the faint "Grouped by …" note. */
export function TodayFilters({ value, onChange, counts, blocks }: { value: TodayFilterValue; onChange: (v: TodayFilterValue) => void; counts: Counts; blocks: { k: string; title: string }[] }) {
  const { state } = useStore();
  const { filter, groupBy } = value;
  const setFilter = useCallback((f: TaskFilter) => onChange({ filter: f, groupBy }), [onChange, groupBy]);
  const active = DIMS.filter(d => selected(filter, d.k).length > 0);
  return (
    <div data-filter-bar className="@container flex flex-wrap items-center gap-x-2 gap-y-2 border-t border-border px-4 py-2.5">
      <div role="group" aria-label="Status" className="flex min-w-0 max-w-full items-center gap-1 overflow-x-auto [scrollbar-width:none]">
        {PILLS.map(k => {
          const on = filter.status === k;
          return (
            <button key={k} type="button" data-pill={k} aria-pressed={on} title={k === 'all' ? undefined : STATUS_LABEL[k]}
              onClick={() => setFilter({ ...filter, status: on || k === 'all' ? 'all' : k })}
              className={cn(pillBase, on ? 'border-input bg-card text-foreground shadow-[0_1px_0_var(--border)]' : 'border-transparent text-muted-foreground hover:bg-hover hover:text-foreground')}>
              {k !== 'all' && <StatusIcon status={k} size={14} />}
              {/* In a narrow list, inactive pills show icon and count only. */}
              <span className={cn(!on && k !== 'all' && '@max-md:sr-only')}>{k === 'all' ? 'All' : STATUS_LABEL[k]}</span>
              <span className="font-normal text-faint tabular-nums">{counts[k]}</span>
            </button>
          );
        })}
      </div>
      {active.map(d => (
        <span key={d.k} data-filter-chip={d.k} className="inline-flex h-7 max-w-full min-w-0 items-center rounded-[5px] border border-input bg-card text-[12px] text-foreground">
          <FilterPicker filter={filter} onChange={setFilter} blocks={blocks} start={d.k} label={`Change ${d.label} filter`}
            className="min-w-0 truncate rounded-l-[5px] py-1 pr-1 pl-2 text-left outline-none hover:bg-hover focus-visible:ring-2 focus-visible:ring-ring/40"
            trigger={chipText(filter, d.k, blocks, state.labels)} />
          <button type="button" onClick={() => setFilter(clearDim(filter, d.k))} aria-label={`Remove ${d.label} filter`}
            className="grid h-full w-6 shrink-0 place-items-center rounded-r-[5px] text-muted-foreground outline-none hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40">
            <X className="size-3.5" />
          </button>
        </span>
      ))}
      <FilterPicker filter={filter} onChange={setFilter} blocks={blocks} start={null} label="Add filter" data-filter-add=""
        className="inline-flex h-7 shrink-0 items-center gap-1 rounded-[6px] px-2 text-[13px] text-muted-foreground outline-none hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
        trigger={<><Plus className="size-3.5" />Filter</>} />
      <span className="ml-auto hidden shrink-0 text-[12px] text-faint sm:inline">Grouped by {GROUP_LABEL[groupBy].toLowerCase()}</span>
    </div>
  );
}

/** Compact label-only filter (Roadmap): one chip or "+ Label", same picker as Today. */
export function LabelFilterBar({ labels, onChange }: { labels: string[]; onChange: (ids: string[]) => void }) {
  const { state } = useStore();
  const filter = { ...EMPTY_FILTER, labels };
  const set = (f: TaskFilter) => onChange(f.labels);
  return (
    <div data-label-filter className="flex flex-wrap items-center gap-2 border-t border-border px-4 py-2">
      {labels.length > 0 && (
        <span data-filter-chip="labels" className="inline-flex h-7 max-w-full min-w-0 items-center rounded-[5px] border border-input bg-card text-[12px] text-foreground">
          <FilterPicker filter={filter} onChange={set} blocks={[]} start="labels" label="Change Label filter"
            className="min-w-0 truncate rounded-l-[5px] py-1 pr-1 pl-2 text-left outline-none hover:bg-hover focus-visible:ring-2 focus-visible:ring-ring/40"
            trigger={chipText(filter, 'labels', [], state.labels)} />
          <button type="button" onClick={() => onChange([])} aria-label="Remove Label filter"
            className="grid h-full w-6 shrink-0 place-items-center rounded-r-[5px] text-muted-foreground outline-none hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40"><X className="size-3.5" /></button>
        </span>
      )}
      {labels.length === 0 && (
        <FilterPicker filter={filter} onChange={set} blocks={[]} start="labels" label="Filter by label" data-filter-add=""
          className="inline-flex h-7 shrink-0 items-center gap-1 rounded-[6px] px-2 text-[13px] text-muted-foreground outline-none hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
          trigger={<><Plus className="size-3.5" />Label</>} />
      )}
    </div>
  );
}

/** Header "Display" menu: group the list by time of day, status or track. */
export function DisplayMenu({ groupBy, onChange }: { groupBy: GroupBy; onChange: (g: GroupBy) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" aria-label="Display" title="Display" className="max-sm:w-8 max-sm:px-0">
          <SlidersHorizontal /><span className="hidden sm:inline">Display</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 rounded-[12px]">
        <DropdownMenuLabel className="flex items-center gap-1.5 text-[12px] font-normal text-muted-foreground"><ListFilter className="size-3.5" />Group by</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={groupBy} onValueChange={v => onChange(v as GroupBy)}>
          {(Object.keys(GROUP_LABEL) as GroupBy[]).map(g => <DropdownMenuRadioItem key={g} value={g} className="text-[13px]">{GROUP_LABEL[g]}</DropdownMenuRadioItem>)}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
