'use client';
/* Plane-style create modal for the user's own tasks. Saves to State.custom; the note goes to tnotes['u-<id>']. */
import { useEffect, useRef, useState } from 'react';
import { Link2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import { defaultBlock } from '@/lib/own-tasks';
import { domainOf } from '@/lib/interview-feed';
import { iso, type Day } from '@/lib/engine';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { parseTask } from './own-task';
import { BlockPick, DayPick, chipBtn, nowMin, useDateLabel } from './task-pickers';
import { useUI } from './ui-state';

export type NewTaskPreset = { date?: string; block?: string };

const blockFor = (day: Day | undefined, todayIdx: number) => day ? defaultBlock(day.blocks, day.i === todayIdx ? nowMin() : undefined)?.k : undefined;

export function NewTaskDialog({ preset, onClose }: { preset: NewTaskPreset | null; onClose: () => void }) {
  const { days, todayIdx, update } = useStore();
  const { toast } = useUI();
  const label = useDateLabel();
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [link, setLink] = useState('');
  const [date, setDate] = useState('');
  const [block, setBlock] = useState('');
  const [more, setMore] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  // Fresh form each time it opens: today (or the closest plan day) and the block running now.
  useEffect(() => {
    if (!preset || !days.length) return;
    const fallback = days[Math.max(0, Math.min(days.length - 1, todayIdx))];
    const d = (preset.date && days.find(x => iso(x.date) === preset.date)) || fallback;
    setDate(iso(d.date));
    setBlock(preset.block && d.blocks.some(b => b.k === preset.block) ? preset.block : blockFor(d, todayIdx) || '');
    setTitle(''); setNote(''); setLink('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset]);

  const day = days.find(x => iso(x.date) === date);
  const pickDate = (v: string) => {
    setDate(v);
    const nd = days.find(x => iso(x.date) === v);
    if (nd && !nd.blocks.some(b => b.k === block && b.kind !== 'life')) setBlock(blockFor(nd, todayIdx) || '');
  };
  const parsed = parseTask(title);
  const canAdd = !!parsed.text && !!day && !!block;

  const submit = () => {
    if (!canAdd || !day) return;
    const fromNote = parseTask(note);
    const onlyLink = !!fromNote.url && fromNote.text === fromNote.url; // the note is just a link: it becomes the task's link
    let url = link.trim() || parsed.url || fromNote.url;
    if (url && !/^https?:\/\//i.test(url)) url = `https://${url}`;
    const body = onlyLink ? '' : note.trim() ? note : '';
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6), now = Date.now();
    update(s => ({
      ...s,
      custom: { ...s.custom, [id]: { date, block, text: parsed.text, ...(url ? { url } : {}), at: now } },
      ...(body ? { tnotes: { ...s.tnotes, [`u-${id}`]: { title: parsed.text, body, upd: now, ...(url ? { url } : {}) } } } : {}),
    }));
    const b = day.blocks.find(x => x.k === block);
    toast(`Added to ${label(date)}${b ? ` · ${b.s} ${b.title}` : ''}`);
    if (more) { setTitle(''); setNote(''); setLink(''); titleRef.current?.focus(); } else onClose();
  };

  return (
    <Dialog open={!!preset} onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent showCloseButton={false} overlayClassName="bg-black/20"
        onOpenAutoFocus={e => { e.preventDefault(); titleRef.current?.focus(); }}
        className="top-[12vh] translate-y-0 gap-0 rounded-[12px] border-border bg-card p-0 shadow-[0_12px_40px_rgba(0,0,0,0.14)] sm:max-w-[600px] data-[state=closed]:zoom-out-100 data-[state=open]:zoom-in-100">
        <form onSubmit={e => { e.preventDefault(); submit(); }} className="flex min-w-0 flex-col">
          <div className="flex flex-col gap-1 px-5 pt-4">
            <DialogTitle className="text-[13px] font-medium text-muted-foreground">New task</DialogTitle>
            <DialogDescription className="sr-only">Add your own task to a day and block of the plan.</DialogDescription>
            <input ref={titleRef} value={title} onChange={e => setTitle(e.target.value)} placeholder="Task name" aria-label="Task name"
              className="mt-1 h-9 w-full min-w-0 bg-transparent text-[18px] font-semibold text-foreground outline-none placeholder:text-faint" />
            <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note or paste a link" aria-label="Note"
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); submit(); } }}
              rows={3} className="min-h-16 w-full min-w-0 resize-none bg-transparent py-1 text-[14px] text-foreground outline-none placeholder:text-faint" />
          </div>
          <div className="flex flex-wrap items-center gap-1.5 px-5 pt-1 pb-4">
            <DayPick value={date} onChange={pickDate} />
            {day && <BlockPick day={day} value={block} onChange={setBlock} className="max-w-[260px]" />}
            <LinkChip value={link} onChange={setLink} />
          </div>
          <div className="flex flex-wrap items-center gap-3 border-t border-border px-5 py-3">
            <label className="flex cursor-pointer items-center gap-2 text-[13px] text-muted-foreground">
              <Switch checked={more} onCheckedChange={setMore} aria-label="Create more" />Create more
            </label>
            <div className="ml-auto flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>Cancel</Button>
              <Button type="submit" size="sm" disabled={!canAdd}>Add task</Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function LinkChip({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className={chipBtn} data-chip="link" aria-label={value ? `Link: ${value}` : 'Add a link'}>
        <Link2 /><span className="max-w-40 truncate">{value ? domainOf(/^https?:\/\//i.test(value) ? value : `https://${value}`) : 'Link'}</span>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 rounded-[12px] p-2">
        <input autoFocus value={value} onChange={e => onChange(e.target.value)} placeholder="https://…" aria-label="Link"
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); setOpen(false); } }}
          className="h-8 w-full rounded-md border border-input bg-card px-2.5 text-[13px] outline-none placeholder:text-faint focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30" />
      </PopoverContent>
    </Popover>
  );
}
