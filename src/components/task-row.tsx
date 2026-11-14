'use client';
import { useState } from 'react';
import { FileText, ExternalLink, Flag, AlertTriangle, Newspaper, Pencil, Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import type { Task } from '@/lib/engine';
import { useUI } from './ui-state';
import { TaskInput, parseTask } from './own-task';

export const noteKey = (t: Task) => (t.slug ? `p-${t.slug}` : t.id);
const DIFF = { E: ['Easy', 'text-good'], M: ['Medium', 'text-warn'], H: ['Hard', 'text-bad'] } as const;

/** missed: its time has passed and it is not done. pick: the task to do right now. */
export type TaskStatus = 'missed' | 'pick';

export function TaskRow({ t, extra, status }: { t: Task; extra?: string; status?: TaskStatus }) {
  const { state, update } = useStore();
  const { openNote, go, toast } = useUI();
  const [editing, setEditing] = useState(false);
  const done = !!state.done[t.id];
  const flagged = !!(t.slug && state.flags[t.slug]);
  const hasNote = !!state.tnotes[noteKey(t)]?.body?.trim();
  const toggle = (v: boolean) => update(s => { const d = { ...s.done }; if (v) d[t.id] = Date.now(); else delete d[t.id]; return { ...s, done: d }; });
  // Only the user's own tasks (t.own) can be edited or removed.
  const save = (raw: string) => { const { text, url } = parseTask(raw); update(s => { const c = s.custom[t.own!]; if (!c) return s; const n = { ...c, text }; if (url) n.url = url; else delete n.url; return { ...s, custom: { ...s.custom, [t.own!]: n } }; }); setEditing(false); };
  const remove = () => {
    update(s => { const c = { ...s.custom }, d = { ...s.done }, tn = { ...s.tnotes }; delete c[t.own!]; delete d[t.id]; delete tn[t.id]; return { ...s, custom: c, done: d, tnotes: tn }; });
    toast('Task removed');
  };
  const flag = () => update(s => { const f = { ...s.flags }; if (f[t.slug!]) delete f[t.slug!]; else f[t.slug!] = 1; return { ...s, flags: f }; });

  return (
    <li className={cn('group grid grid-cols-[20px_minmax(0,1fr)] gap-3 border-t py-2.5 first:border-t-0 sm:grid-cols-[20px_minmax(0,1fr)_auto]',
      !done && status === 'missed' && '-mx-2 rounded-lg border-t-transparent bg-missed px-2 text-missed-foreground',
      !done && status === 'pick' && '-mx-2 rounded-lg border-t-transparent bg-accent px-2 ring-1 ring-primary/40')}>
      {editing ? <>
        <span />
        <TaskInput className="col-span-1 sm:col-span-2" initial={t.url ? `${t.text} ${t.url}` : t.text} placeholder="Task name, paste a link to attach it" onSave={save} onCancel={() => setEditing(false)} />
      </> : <>
      <Checkbox id={`t-${t.id}`} checked={done} onCheckedChange={v => toggle(!!v)} className="mt-0.5" aria-label={t.text} />
      <label htmlFor={`t-${t.id}`} className={cn('min-w-0 cursor-pointer break-words text-[15px] leading-snug', done && 'text-muted-foreground line-through decoration-border')}>
        {!done && status === 'pick' && <StatusPill kind="pick" />}
        {t.own && <StatusPill kind="own" />}
        {t.cat === 'update' && <Badge variant="outline" className="mr-2 border-c-update text-c-update">New</Badge>}
        {t.text}
        {extra && <span className="text-muted-foreground text-sm"> · {extra}</span>}
        {t.outdated && (
          <span className="mt-1 flex items-start gap-1.5 text-sm text-warn"><AlertTriangle className="mt-0.5 size-3.5 shrink-0" />{t.outdated.kind === 'outdated' ? 'Outdated' : 'Changed'}: {t.outdated.why}{t.outdated.replacementUrl ? ' Link updated.' : ''}</span>
        )}
      </label>
      <span className="col-start-2 flex flex-wrap items-center gap-1 sm:col-start-auto">
        {t.diff && <span className={cn('rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] font-semibold', DIFF[t.diff][1])} title={DIFF[t.diff][0]}>{t.diff}</span>}
        {t.slug && (
          <button onClick={flag} aria-pressed={flagged} title="Flag to re-solve on Sunday" className={cn('inline-flex items-center gap-1 rounded-md px-1.5 py-1 font-mono text-xs text-muted-foreground hover:bg-muted', flagged && 'text-bad')}>
            <Flag className="size-3.5" />{flagged ? 'flagged' : ''}
          </button>
        )}
        <button onClick={() => openNote({ kind: 'task', key: noteKey(t), title: t.text.replace(/^Re-solve without looking: /, ''), url: t.url })} title={hasNote ? 'Open note' : 'Add a note'} className={cn('inline-flex items-center gap-1 rounded-md px-1.5 py-1 font-mono text-xs text-muted-foreground hover:bg-muted', hasNote && 'text-primary')}>
          <FileText className="size-3.5" />{hasNote ? 'note' : ''}
        </button>
        {t.newsId && (
          <button onClick={() => go('news')} className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 font-mono text-xs text-primary hover:bg-accent"><Newspaper className="size-3.5" />open News</button>
        )}
        {t.url && (
          <a href={t.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 font-mono text-xs text-primary hover:bg-accent">open<ExternalLink className="size-3" /></a>
        )}
        {t.own && <>
          <button onClick={() => setEditing(true)} title="Edit your task" aria-label={`Edit ${t.text}`} className="inline-flex items-center rounded-md px-1.5 py-1 text-muted-foreground opacity-100 hover:bg-muted hover:text-foreground focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"><Pencil className="size-3.5" /></button>
          <button onClick={remove} title="Remove your task" aria-label={`Remove ${t.text}`} className="inline-flex items-center rounded-md px-1.5 py-1 text-muted-foreground opacity-100 hover:bg-muted hover:text-bad focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"><Trash2 className="size-3.5" /></button>
        </>}
      </span>
      </>}
    </li>
  );
}

const PILL = {
  now: ['Now', 'bg-primary text-primary-foreground'],
  pick: ['Up now', 'bg-primary text-primary-foreground'],
  missed: ['Missed', 'border border-missed-border bg-missed text-missed-foreground'],
  done: ['Done', 'bg-good/15 text-good'],
  upcoming: ['Later', 'border text-muted-foreground'],
  own: ['Yours', 'border border-primary/40 text-primary'],
} as const;
export type PillKind = keyof typeof PILL;
export function StatusPill({ kind, label }: { kind: PillKind; label?: string }) {
  return <span className={cn('mr-2 inline-flex items-center rounded-full px-2 py-px align-[1px] font-mono text-[10.5px] font-semibold uppercase tracking-wide', PILL[kind][1])}>{label ?? PILL[kind][0]}</span>;
}
