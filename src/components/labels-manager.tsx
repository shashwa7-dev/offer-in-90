'use client';
/* Setup › Labels: create, rename, recolour (8 swatches) and delete owner labels and groups.
   System labels (Pattern, Tier, Frequency, Source, Flagged, Depth) are read-only and listed as a note. */
import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { createGroup, createLabel, deleteLabel, recolorLabel, renameLabel } from '@/lib/labels';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { DEFAULT_SWATCH, LabelDot, SWATCHES } from './label-picker';
import type { OwnerLabel } from '@/lib/state-types';

const field = 'h-8 min-w-0 rounded-md border border-input bg-card px-2.5 text-[13px] outline-none placeholder:text-faint focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30';
const iconBtn = 'inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 [&_svg]:size-3.5';
const ERR = { duplicate: 'A label or group with that name already exists.', empty: 'Give it a name.' } as const;

export function LabelsManager() {
  const { state, update } = useStore();
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState<OwnerLabel | null>(null);
  const [labelName, setLabelName] = useState('');
  const [labelGroup, setLabelGroup] = useState('');
  const [groupName, setGroupName] = useState('');
  const [single, setSingle] = useState(true);

  const all = Object.values(state.labels);
  const groups = all.filter(l => l.kind === 'group').sort((a, b) => a.name.localeCompare(b.name));
  const labelsIn = (g: string | undefined) => all.filter(l => l.kind === 'label' && (g ? l.group === g : !l.group || !state.labels[l.group])).sort((a, b) => a.name.localeCompare(b.name));
  const used = (id: string) => Object.values(state.itemLabels).filter(ids => ids.includes(id)).length;

  // Rename and create validate against the current labels; the pure helpers return an error instead of a map.
  const rename = (l: OwnerLabel, name: string): boolean => {
    if (name.trim() === l.name) return true;
    const r = renameLabel(state.labels, l.id, name);
    if ('error' in r) { setError(ERR[r.error]); return false; }
    setError(''); update(s => { const x = renameLabel(s.labels, l.id, name); return 'labels' in x ? { ...s, labels: x.labels } : s; });
    return true;
  };
  // Ids are random, so create once here and have the updater only insert that entry (updaters must be pure).
  const add = (r: ReturnType<typeof createLabel>, clear: () => void) => {
    if ('error' in r) { setError(ERR[r.error]); return; }
    setError(''); clear(); update(s => ({ ...s, labels: { ...s.labels, [r.id]: r.labels[r.id] } }));
  };
  const addLabel = () => add(createLabel(state.labels, { name: labelName, color: DEFAULT_SWATCH, group: labelGroup && state.labels[labelGroup] ? labelGroup : undefined }), () => setLabelName(''));
  const addGroup = () => add(createGroup(state.labels, { name: groupName, single }), () => setGroupName(''));
  const remove = (id: string) => { update(s => { const r = deleteLabel({ labels: s.labels, itemLabels: s.itemLabels }, id); return { ...s, labels: r.labels, itemLabels: r.itemLabels }; }); setConfirm(null); };

  const row = (l: OwnerLabel) => (
    <div key={l.id} data-label-row={l.name} className="flex min-h-9 items-center gap-2 border-t border-border px-4 py-1 first:border-t-0">
      {l.kind === 'label' ? (
        <Popover>
          <PopoverTrigger className={cn(iconBtn)} aria-label={`Colour of ${l.name}`} title="Change colour"><LabelDot color={l.color} /></PopoverTrigger>
          <PopoverContent align="start" className="flex w-auto gap-1.5 rounded-[12px] p-2">
            {SWATCHES.map(c => (
              <button key={c} type="button" aria-label={`Colour ${c}`} aria-pressed={l.color === c} onClick={() => update(s => ({ ...s, labels: recolorLabel(s.labels, l.id, c) }))}
                className={cn('size-6 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/60', l.color === c && 'ring-2 ring-foreground ring-offset-2 ring-offset-card')} style={{ background: c }} />
            ))}
          </PopoverContent>
        </Popover>
      ) : <span className="w-7" />}
      <NameInput key={l.name} value={l.name} label={`Name of ${l.name}`} onCommit={v => rename(l, v)} bold={l.kind === 'group'} />
      {l.kind === 'group' && <span className="shrink-0 text-[12px] text-muted-foreground">{l.single ? 'Pick one' : 'Pick any'}</span>}
      {l.kind === 'label' && used(l.id) > 0 && <span className="shrink-0 text-[12px] text-faint tabular-nums">{used(l.id)}</span>}
      <button type="button" className={iconBtn} aria-label={`Delete ${l.name}`} title="Delete" onClick={() => setConfirm(l)}><Trash2 /></button>
    </div>
  );

  return (
    <div data-labels-manager>
      <p className="px-4 py-3 text-[13px] leading-snug text-muted-foreground">Make your own labels and put any number of them on a task, a problem or a quiz item. Built-in labels (Pattern, Tier, Frequency, Source, Flagged, Depth) are always there and can be filtered on, but not changed.</p>
      {groups.map(g => (
        <div key={g.id} className="border-t border-border">
          {row(g)}
          <div className="pl-6">{labelsIn(g.id).map(row)}{!labelsIn(g.id).length && <p className="border-t border-border px-4 py-2 text-[13px] text-faint">No labels in this group.</p>}</div>
        </div>
      ))}
      {labelsIn(undefined).length > 0 && (
        <div className="border-t border-border">{labelsIn(undefined).map(row)}</div>
      )}
      {!all.length && <p className="border-t border-border px-4 py-3 text-[13px] text-faint">No labels yet.</p>}

      <form className="flex flex-wrap items-center gap-2 border-t border-border px-4 py-3" onSubmit={e => { e.preventDefault(); addGroup(); }}>
        <input value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="New group name" aria-label="New group name" data-new-group className={cn(field, 'w-44')} />
        <label className="flex items-center gap-2 text-[13px] text-muted-foreground"><Switch checked={single} onCheckedChange={setSingle} aria-label="Single choice" />Pick one</label>
        <Button type="submit" variant="outline" size="sm"><Plus />Add group</Button>
      </form>
      <form className="flex flex-wrap items-center gap-2 border-t border-border px-4 py-3" onSubmit={e => { e.preventDefault(); addLabel(); }}>
        <input value={labelName} onChange={e => setLabelName(e.target.value)} placeholder="New label name" aria-label="New label name" data-new-label className={cn(field, 'w-44')} />
        <select value={labelGroup} onChange={e => setLabelGroup(e.target.value)} aria-label="Group" className={cn(field, 'w-36')}>
          <option value="">No group</option>
          {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
        <Button type="submit" variant="outline" size="sm"><Plus />Add label</Button>
      </form>
      {error && <p role="alert" data-label-error className="border-t border-border px-4 py-2.5 text-[13px] text-foreground">{error}</p>}

      <AlertDialog open={!!confirm} onOpenChange={o => { if (!o) setConfirm(null); }}>
        <AlertDialogContent className="rounded-[12px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {confirm?.kind === 'group' ? 'group' : 'label'} “{confirm?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>{confirm?.kind === 'group' ? 'The group and all its labels are removed from every item.' : 'It is removed from every item that has it.'} This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction data-confirm-delete onClick={() => confirm && remove(confirm.id)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/** Edits on blur or Enter; an invalid name snaps back (the error shows below). */
function NameInput({ value, label, onCommit, bold }: { value: string; label: string; onCommit: (v: string) => boolean; bold?: boolean }) {
  const [v, setV] = useState(value);
  const commit = () => { if (!onCommit(v)) setV(value); };
  return <input value={v} onChange={e => setV(e.target.value)} onBlur={commit} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } if (e.key === 'Escape') setV(value); }}
    aria-label={label} className={cn('h-7 min-w-0 flex-1 rounded-[5px] border border-transparent bg-transparent px-1.5 text-[13px] text-foreground outline-none hover:border-input focus-visible:border-ring', bold && 'font-medium')} />;
}
