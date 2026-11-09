'use client';
import { FileText, ExternalLink, Flag, AlertTriangle, Newspaper } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import type { Task } from '@/lib/engine';
import { useUI } from './ui-state';

export const noteKey = (t: Task) => (t.slug ? `p-${t.slug}` : t.id);
const DIFF = { E: ['Easy', 'text-good'], M: ['Medium', 'text-warn'], H: ['Hard', 'text-bad'] } as const;

export function TaskRow({ t, extra }: { t: Task; extra?: string }) {
  const { state, update } = useStore();
  const { openNote, go } = useUI();
  const done = !!state.done[t.id];
  const flagged = !!(t.slug && state.flags[t.slug]);
  const hasNote = !!state.tnotes[noteKey(t)]?.body?.trim();
  const toggle = (v: boolean) => update(s => { const d = { ...s.done }; if (v) d[t.id] = Date.now(); else delete d[t.id]; return { ...s, done: d }; });
  const flag = () => update(s => { const f = { ...s.flags }; if (f[t.slug!]) delete f[t.slug!]; else f[t.slug!] = 1; return { ...s, flags: f }; });

  return (
    <li className="grid grid-cols-[20px_minmax(0,1fr)] gap-3 border-t py-2.5 first:border-t-0 sm:grid-cols-[20px_minmax(0,1fr)_auto]">
      <Checkbox id={`t-${t.id}`} checked={done} onCheckedChange={v => toggle(!!v)} className="mt-0.5" aria-label={t.text} />
      <label htmlFor={`t-${t.id}`} className={cn('min-w-0 cursor-pointer break-words text-[15px] leading-snug', done && 'text-muted-foreground line-through decoration-border')}>
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
      </span>
    </li>
  );
}
