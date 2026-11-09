'use client';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { catName, fmtDate, parseISO } from '@/lib/engine';

const KIND = { new: 'New', outdated: 'Outdated', changed: 'Changed' } as const;
const PRIO = { must: 'Must-read', should: 'Worth reading', fyi: 'FYI' } as const;

export function UpdatesView() {
  const { state, update, updates, feedAt, days } = useStore();
  const items = [...updates].sort((a, b) => b.date.localeCompare(a.date));
  const unseen = items.filter(u => !state.seenUpdates[u.id]);
  const markAll = () => update(s => ({ ...s, seenUpdates: { ...s.seenUpdates, ...Object.fromEntries(unseen.map(u => [u.id, Date.now()])) } }));
  const toggleSeen = (id: string) => update(s => { const m = { ...s.seenUpdates }; if (m[id]) delete m[id]; else m[id] = Date.now(); return { ...s, seenUpdates: m }; });
  const whereScheduled = (id: string) => days.find(d => d.tasks.some(t => t.id === `upd-${id}`));

  return (
    <div className="pb-16">
      <div className="flex flex-wrap items-end justify-between gap-3 pt-6 pb-4">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">Weekly engine · Sunday 05:00 IST{feedAt ? ` · last run ${new Date(feedAt).toLocaleString()}` : ''}</p>
          <h1 className="mt-1.5 font-display text-3xl font-bold tracking-tight sm:text-4xl">Updates</h1>
          <p className="mt-1.5 max-w-2xl text-muted-foreground">Every week the engine checks every link, looks for interview-format changes and important AI releases, and flags outdated material. Must-reads are added to your Sunday catch-up automatically. Outdated tasks get a warning and a new link.</p>
        </div>
        {unseen.length > 0 && <Button variant="outline" onClick={markAll}>Mark all as read</Button>}
      </div>
      {!items.length && <Card className="p-5 text-muted-foreground">No updates yet. The first weekly run fills this in.</Card>}
      <div className="flex flex-col gap-2.5">
        {items.map(u => {
          const seen = !!state.seenUpdates[u.id], day = whereScheduled(u.id);
          return (
            <Card key={u.id} className={cn('gap-2 p-4', !seen && 'border-c-update/50')}>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <Badge variant="outline" className={cn(u.kind === 'new' ? 'border-primary text-primary' : 'border-warn text-warn')}>{KIND[u.kind]}</Badge>
                <Badge variant="secondary">{PRIO[u.priority]}</Badge>
                <span className="font-mono text-muted-foreground">{catName[u.area] || u.area} · {fmtDate(parseISO(u.date))}</span>
                {!seen && <span className="font-mono font-semibold text-c-update">unread</span>}
              </div>
              <h3 className="font-display text-lg font-bold leading-snug">{u.title}</h3>
              <p className="text-sm text-muted-foreground">{u.why}</p>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                {(u.replacementUrl || u.url) && <a href={u.replacementUrl || u.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-primary">Open <ExternalLink className="size-3.5" /></a>}
                {day && <span className="text-muted-foreground">Added to day {day.i + 1} ({fmtDate(day.date)})</span>}
                {u.sources?.length ? <span className="text-xs text-muted-foreground">Sources: {u.sources.map((s, i) => <a key={s} href={s} target="_blank" rel="noopener noreferrer" className="underline">{i + 1}</a>).reduce((a: React.ReactNode[], el, i) => (i ? [...a, ', ', el] : [el]), [])}</span> : null}
                <Button variant="ghost" size="sm" className="ml-auto" onClick={() => toggleSeen(u.id)}>{seen ? 'Mark unread' : 'Mark read'}</Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
