'use client';
/* The user's own tasks: quick add at the end of a block, and inline edit. Built-in tasks never come through here. */
import { useEffect, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useStore, type State } from '@/lib/store';
import { restoreOwn, snapshotOwn, withoutOwn } from '@/lib/own-tasks';
import { iso, type Day } from '@/lib/engine';

/** "Read the React docs https://react.dev" → text + link. A link on its own becomes the text too. */
export function parseTask(raw: string) {
  const url = raw.match(/https?:\/\/\S+/)?.[0];
  const text = (url ? raw.replace(url, '') : raw).replace(/\s+/g, ' ').trim() || url || '';
  return { text, url };
}

/** One-line input: Enter saves, Esc cancels, an empty value cancels.
 *  keepOpen: after Enter, clear the input and stay focused so several tasks can be added in a row. */
export function TaskInput({ initial = '', placeholder, onSave, onCancel, onDone, keepOpen, className }: { initial?: string; placeholder: string; onSave: (v: string) => void; onCancel: () => void; onDone?: () => void; keepOpen?: boolean; className?: string }) {
  const [v, setV] = useState(initial);
  const ref = useRef<HTMLInputElement>(null), finished = useRef(false);
  useEffect(() => { ref.current?.focus(); }, []);
  const save = (fromEnter: boolean) => {
    if (finished.current) return;
    const t = v.trim();
    if (t && fromEnter && keepOpen) { onSave(t); setV(''); return; }
    finished.current = true;
    if (t) { onSave(t); onDone?.(); } else onCancel();
  };
  return (
    <div className={cn('flex min-w-0 items-center gap-2', className)}>
      <input ref={ref} value={v} onChange={e => setV(e.target.value)} placeholder={placeholder} aria-label={placeholder}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); save(true); } if (e.key === 'Escape') { e.preventDefault(); finished.current = true; onCancel(); } }}
        onBlur={() => save(false)}
        className="h-8 min-w-0 flex-1 rounded-md border border-input bg-card px-2.5 text-[13px] text-foreground outline-none placeholder:text-faint focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30" />
      <span className="hidden shrink-0 text-[12px] text-faint sm:block">Enter to save · Esc to cancel</span>
    </div>
  );
}

/** Delete an own task (with its tick and note) and offer Undo. */
export function deleteOwn(update: (fn: (s: State) => State) => void, state: State, id: string) {
  const snap = snapshotOwn(state, id);
  update(s => withoutOwn(s, id));
  toast('Task deleted', { action: { label: 'Undo', onClick: () => update(s => restoreOwn(s, snap)) } });
}

export function QuickAdd({ day, block }: { day: Day; block: string }) {
  const { update } = useStore();
  const [on, setOn] = useState(false);
  if (!on) return (
    <button type="button" onClick={() => setOn(true)} className="flex h-9 w-full items-center gap-2 border-t border-border pr-4 pl-11 text-left text-[13px] text-muted-foreground outline-none hover:bg-hover hover:text-foreground focus-visible:bg-hover">
      <Plus className="size-3.5" />Add task
    </button>
  );
  return (
    <TaskInput keepOpen className="border-t border-border py-1.5 pr-4 pl-11" placeholder="Task name, paste a link to attach it" onCancel={() => setOn(false)}
      onSave={raw => {
        const { text, url } = parseTask(raw), id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        update(s => ({ ...s, custom: { ...s.custom, [id]: { date: iso(day.date), block, text, ...(url ? { url } : {}), at: Date.now() } } }));
      }} onDone={() => setOn(false)} />
  );
}
