'use client';
import { useState } from 'react';
import { AlertTriangle, FileText, Flag, Newspaper, Pencil, Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { domainOf } from '@/lib/interview-feed';
import type { Task } from '@/lib/engine';
import { Chip } from './shell/page';
import { newsTabFor, useUI } from './ui-state';
import { TaskInput, deleteOwn, parseTask } from './own-task';

export const noteKey = (t: Task) => (t.slug ? `p-${t.slug}` : t.id);
const DIFF = { E: 'Easy', M: 'Medium', H: 'Hard' } as const;

/** missed: its time has passed and it is not done. pick: the task to do right now. */
export type TaskStatus = 'missed' | 'pick';

const tool = 'inline-flex h-6 items-center gap-1 rounded-[5px] px-1.5 text-[12px] text-muted-foreground outline-none hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50';

export function TaskRow({ t, dayIdx, extra, status }: { t: Task; dayIdx: number; extra?: string; status?: TaskStatus }) {
  const { state, update } = useStore();
  const { openTask, go } = useUI();
  const [editing, setEditing] = useState(false);
  const done = !!state.done[t.id];
  const flagged = !!(t.slug && state.flags[t.slug]);
  const hasNote = !!state.tnotes[noteKey(t)]?.body?.trim();
  const missed = !done && status === 'missed', pick = !done && status === 'pick';
  const toggle = (v: boolean) => update(s => { const d = { ...s.done }; if (v) d[t.id] = Date.now(); else delete d[t.id]; return { ...s, done: d }; });
  // Only the user's own tasks (t.own) can be edited or removed.
  const save = (raw: string) => { const { text, url } = parseTask(raw); update(s => { const c = s.custom[t.own!]; if (!c) return s; const n = { ...c, text }; if (url) n.url = url; else delete n.url; return { ...s, custom: { ...s.custom, [t.own!]: n } }; }); setEditing(false); };
  const remove = () => deleteOwn(update, state, t.own!);
  const flag = () => update(s => { const f = { ...s.flags }; if (f[t.slug!]) delete f[t.slug!]; else f[t.slug!] = 1; return { ...s, flags: f }; });
  const title = t.text.replace(/^Re-solve without looking: /, '');

  return (
    <div data-task={t.id} data-own={t.own ? '' : undefined}
      className={cn('group flex gap-3 border-t border-border py-2 pr-4 pl-11 text-[13px] text-foreground',
        missed && 'bg-stone text-stone-foreground',
        pick && 'bg-hover')}>
      {editing ? (
        <TaskInput className="flex-1" initial={t.url ? `${t.text} ${t.url}` : t.text} placeholder="Task name, paste a link to attach it" onSave={save} onCancel={() => setEditing(false)} />
      ) : <>
        <Checkbox id={`t-${t.id}`} checked={done} onCheckedChange={v => toggle(!!v)} className="mt-0.5" aria-label={t.text} />
        <div className="min-w-0 flex-1 sm:flex sm:items-start sm:gap-3">
          <div className="min-w-0 flex-1 leading-[18px]">
            <button type="button" data-title onClick={() => openTask(t.id, dayIdx)}
              className={cn('break-words rounded-[5px] text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/50', done && 'text-muted-foreground line-through decoration-faint')}>
              {t.text}
            </button>
            {t.own && <Chip className="ml-2 align-[1px]">Yours</Chip>}
            {t.cat === 'update' && <Chip className="ml-2 align-[1px] border-input text-foreground">New</Chip>}
            {extra && <span className={cn('text-faint', missed && 'text-stone-foreground')}> · {extra}</span>}
            {t.outdated && (
              <span className="mt-1 flex items-start gap-1.5 text-[12px] text-stone-foreground"><AlertTriangle className="mt-px size-3.5 shrink-0" />{t.outdated.kind === 'outdated' ? 'Outdated' : 'Changed'}: {t.outdated.why}{t.outdated.replacementUrl ? ' Link updated.' : ''}</span>
            )}
          </div>
          <div className="-ml-1.5 mt-1 flex flex-wrap items-center gap-0.5 sm:mt-0 sm:ml-0 sm:-mr-1.5 sm:justify-end">
            {t.diff && <Chip className="mr-1">{DIFF[t.diff]}</Chip>}
            {t.slug && (
              <button type="button" onClick={flag} aria-pressed={flagged} aria-label={`${flagged ? 'Unflag' : 'Flag'} ${title}`} title="Flag to re-solve on Sunday" className={cn(tool, flagged && 'text-foreground')}>
                <Flag className={cn('size-3.5', flagged && 'fill-current')} />{flagged ? 'Flagged' : ''}
              </button>
            )}
            <button type="button" onClick={() => openTask(t.id, dayIdx)} title={hasNote ? 'Open note' : 'Add a note'} aria-label={hasNote ? `Open note for ${title}` : `Add a note to ${title}`} className={cn(tool, hasNote && 'text-foreground')}>
              <FileText className="size-3.5" />{hasNote ? 'Note' : ''}
            </button>
            {t.newsId && (
              <button type="button" onClick={() => go('news', { newsTab: newsTabFor(t.newsId) })} className={tool}><Newspaper className="size-3.5" />Open News</button>
            )}
            {t.url && (
              <a href={t.url} target="_blank" rel="noopener noreferrer" className={cn(tool, 'max-w-44')}>
                <span className="truncate">{domainOf(t.url)}</span><span aria-hidden="true">↗</span><span className="sr-only">(opens in a new tab)</span>
              </a>
            )}
            {t.own && <>
              <button type="button" onClick={() => setEditing(true)} title="Edit your task" aria-label={`Edit ${t.text}`} className={cn(tool, 'sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100')}><Pencil className="size-3.5" /></button>
              <button type="button" onClick={remove} title="Remove your task" aria-label={`Remove ${t.text}`} className={cn(tool, 'sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100')}><Trash2 className="size-3.5" /></button>
            </>}
          </div>
        </div>
      </>}
    </div>
  );
}
