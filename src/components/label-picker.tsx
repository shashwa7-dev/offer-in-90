'use client';
/* Labels in the UI: swatches, chips, the apply popover, and the label list a task shows.
   Owner labels live in State.labels / State.itemLabels; system labels are derived (labelsOf) and read-only. */
import { useState } from 'react';
import { Check, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore, type State } from '@/lib/store';
import { labelsOf, type TaskMeta } from '@/lib/labels';
import { PATTERN_IDS } from '@/lib/patterns';
import { patternNameOf, type Task } from '@/lib/engine';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Chip } from './shell/page';
import { useUI } from './ui-state';

/** The 8 fixed swatches an owner label can use. */
export const SWATCHES = ['#6b7280', '#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#0891b2', '#2563eb', '#9333ea'] as const;
export const DEFAULT_SWATCH = SWATCHES[0];

export interface LabelView { id: string; name: string; color?: string; system: boolean; group?: string }

const TIER_NAME: Record<string, string> = { must: 'Must-solve', optional: 'Optional' };
const FREQ_NAME: Record<string, string> = { hot: '🔥 Frequent', 'hard-hot': '⭐ Hard but frequent' };
const GROUP_NAME: Record<string, string> = { pattern: 'Pattern', tier: 'Tier', freq: 'Frequency', source: 'Source', flagged: 'Flagged', depth: 'Depth' };

/** Display name of a system label id, or null if it is not one. */
export function systemName(id: string): { name: string; group: string } | null {
  const [, g, v] = id.split(':');
  if (!id.startsWith('sys:')) return null;
  const group = GROUP_NAME[g] ?? g;
  if (g === 'pattern') return { name: patternNameOf(v), group };
  if (g === 'tier') return { name: TIER_NAME[v] ?? v, group };
  if (g === 'freq') return { name: FREQ_NAME[v] ?? v, group };
  if (g === 'source') return { name: v === 'yours' ? 'Yours' : 'Plan', group };
  if (g === 'flagged') return { name: 'Flagged', group };
  if (g === 'depth') return { name: 'Depth', group };
  return null;
}

/** Every label a filter can offer: system first (grouped), then owner labels. */
export function labelOptions(labels: State['labels']): LabelView[] {
  const sys: string[] = ['sys:source:yours', 'sys:source:plan', 'sys:tier:must', 'sys:tier:optional', 'sys:freq:hot', 'sys:freq:hard-hot', 'sys:flagged', 'sys:depth', ...PATTERN_IDS.map(p => `sys:pattern:${p}`)];
  const out: LabelView[] = sys.map(id => ({ id, name: systemName(id)!.name, system: true, group: systemName(id)!.group }));
  for (const l of Object.values(labels)) if (l.kind === 'label') out.push({ id: l.id, name: l.name, color: l.color, system: false, group: l.group ? labels[l.group]?.name : 'Labels' });
  return out;
}

/** An id's display data; null for a label that no longer exists (deleted on another device). */
export function viewOf(id: string, labels: State['labels']): LabelView | null {
  const s = systemName(id);
  if (s) return { id, name: s.name, system: true, group: s.group };
  const l = labels[id];
  return l && l.kind === 'label' ? { id, name: l.name, color: l.color, system: false } : null;
}

export function taskMeta(t: Task, state: State): TaskMeta {
  return { id: t.id, own: t.own, pattern: t.pattern, tier: t.tier as TaskMeta['tier'], flags: t.flags as TaskMeta['flags'], depth: t.depth, flagged: !!(t.slug && state.flags[t.slug]) };
}

/** The labels a task shows: system Source (Yours only) and Pattern first, then owner labels, then other system labels.
    Stale owner ids are dropped. An unseen problem keeps its Pattern hidden until it is started. */
export function taskLabelViews(t: Task, state: State, status: string): LabelView[] {
  const ids = labelsOf(state.itemLabels, taskMeta(t, state));
  const hidePattern = !!t.hiddenUntilStart && status === 'todo';
  const views = ids.filter(id => !(hidePattern && id.startsWith('sys:pattern:'))).map(id => viewOf(id, state.labels)).filter((v): v is LabelView => !!v);
  const rank = (v: LabelView) => v.id === 'sys:source:yours' ? 0 : v.id.startsWith('sys:pattern:') ? 1 : !v.system ? 2 : 3;
  return views.filter(v => v.id !== 'sys:source:plan').sort((a, b) => rank(a) - rank(b));
}

export function LabelDot({ color }: { color?: string }) {
  return color ? <span aria-hidden="true" className="size-2 shrink-0 rounded-full" style={{ background: color }} /> : null;
}

export function LabelChip({ v, className }: { v: LabelView; className?: string }) {
  return <Chip data-label-chip={v.id} className={cn('max-w-40', className)} title={v.system ? `${v.group}: ${v.name}` : v.name}><LabelDot color={v.color} /><span className="truncate">{v.name}</span></Chip>;
}

/** Owner labels with a checkbox each, grouped; a single-choice group acts as radio. Callers apply the change with applyLabel / removeLabel. */
export function LabelPicker({ selected, onToggle, className, label = 'Labels' }: { selected: string[]; onToggle: (labelId: string, on: boolean) => void; className?: string; label?: string }) {
  const { state } = useStore();
  const { go } = useUI();
  const [open, setOpen] = useState(false);
  const all = Object.values(state.labels);
  const groups = all.filter(l => l.kind === 'group').sort((a, b) => a.name.localeCompare(b.name));
  const sections = [
    ...groups.map(g => ({ g, items: all.filter(l => l.kind === 'label' && l.group === g.id) })),
    { g: null, items: all.filter(l => l.kind === 'label' && !(l.group && state.labels[l.group])) },
  ].filter(s => s.items.length);
  const n = selected.filter(id => state.labels[id]?.kind === 'label').length;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger data-label-picker aria-label={label}
        className={cn('inline-flex h-7 items-center gap-1.5 rounded-[5px] px-2 text-[13px] text-muted-foreground outline-none hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40', className)}>
        <Tag className="size-3.5" />{n ? `${n} applied` : 'Add label'}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 rounded-[12px] p-1">
        {!sections.length ? (
          <p className="px-2 py-2 text-[13px] text-muted-foreground">No labels yet. <button type="button" className="font-medium text-foreground underline-offset-4 hover:underline" onClick={() => { setOpen(false); go('setup'); }}>Create some in Setup</button>.</p>
        ) : (
          <div className="max-h-[min(320px,50vh)] overflow-y-auto" role="group" aria-label={label}>
            {sections.map(s => (
              <div key={s.g?.id ?? 'ungrouped'}>
                {s.g && <p className="px-2 pt-1.5 pb-1 text-[12px] text-faint">{s.g.name} · {s.g.single ? 'pick one' : 'pick any'}</p>}
                {s.items.map(l => {
                  const on = selected.includes(l.id), radio = !!s.g?.single;
                  return (
                    <button key={l.id} type="button" role={radio ? 'radio' : 'checkbox'} aria-checked={on} data-label-option={l.name}
                      onClick={() => onToggle(l.id, !on)}
                      className="flex h-8 w-full items-center gap-2 rounded-[6px] px-2 text-left text-[13px] outline-none hover:bg-hover focus-visible:bg-hover">
                      <span aria-hidden="true" className={cn('grid size-4 shrink-0 place-items-center border', radio ? 'rounded-full' : 'rounded-[4px]', on ? 'border-primary bg-primary text-primary-foreground' : 'border-input')}>{on && <Check className="size-3 text-current" />}</span>
                      <LabelDot color={l.color} /><span className="min-w-0 flex-1 truncate">{l.name}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

