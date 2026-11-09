'use client';
import { useState } from 'react';
import { ExternalLink, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { catName, fmtDate, parseISO, type NewsItem } from '@/lib/engine';
import { InterviewPulse } from './interview-pulse';
import { BookmarkButton, SavedList } from './bookmarks';

const KIND = { new: 'New', outdated: 'Outdated', changed: 'Changed' } as const;
const PRIO = { must: 'Must-read', should: 'Worth reading', fyi: 'FYI' } as const;
const CAT = { ai: 'AI', dev: 'Dev', research: 'Research' } as const;
const CAT_COLOR = { ai: 'var(--c-ai)', dev: 'var(--c-fe)', research: 'var(--c-sd)' } as const;
const H3 = ({ children }: { children: React.ReactNode }) => <h3 className="mb-2 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">{children}</h3>;
const ago = (iso: string) => { const h = Math.round((Date.now() - Date.parse(iso)) / 36e5); return h < 1 ? 'just now' : h < 24 ? `${h} h ago` : `${Math.round(h / 24)} d ago`; };

export function NewsView() {
  const { state, update, updates, news, days } = useStore();
  const [filter, setFilter] = useState<'all' | NewsItem['category']>('all');
  const [showOlder, setShowOlder] = useState(false);
  const [tab, setTab] = useState<'feed' | 'saved'>('feed');
  const savedCount = Object.keys(state.bookmarks).length;
  const dates = news ? Object.keys(news.days).sort().reverse() : [];
  const latest = dates[0];
  const items = latest ? news!.days[latest].filter(n => filter === 'all' || n.category === filter) : [];
  const changes = updates.sort((a, b) => b.date.localeCompare(a.date));
  const toggleSeen = (key: string, v?: boolean) => update(s => { const m = { ...s.seenUpdates }; if (v ?? !m[key]) m[key] = Date.now(); else delete m[key]; return { ...s, seenUpdates: m }; });
  const whereScheduled = (id: string) => days.find(d => d.tasks.some(t => t.id === `upd-${id}`));

  const Row = ({ n }: { n: NewsItem }) => {
    const key = `n-${n.id}`, read = !!state.seenUpdates[key];
    return (
      <li className="grid grid-cols-[20px_minmax(0,1fr)] gap-3 px-4 py-3">
        <Checkbox checked={read} onCheckedChange={v => toggleSeen(key, !!v)} aria-label={`Mark "${n.title}" as read`} className="mt-1" />
        <div className="min-w-0">
          <a href={n.url} target="_blank" rel="noopener noreferrer" onClick={() => toggleSeen(key, true)} className={cn('font-medium leading-snug hover:underline', read && 'text-muted-foreground')}>
            {n.title}<ExternalLink className="ml-1 inline size-3 align-baseline opacity-60" />
          </a>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-muted-foreground">
            <span className="font-semibold" style={{ color: CAT_COLOR[n.category] }}>{CAT[n.category]}</span>
            <span>{n.source}{n.points ? ` · ${n.points} pts` : ''}</span>
            <span>{ago(n.publishedAt)}</span>
            {n.discussUrl && n.discussUrl !== n.url && <a href={n.discussUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-foreground"><MessageSquare className="size-3" />{n.comments} comments</a>}
            <BookmarkButton item={{ kind: 'news', title: n.title, url: n.url, source: n.source, detail: `${CAT[n.category]}${n.points ? ` · ${n.points} pts` : ''}` }} className="-my-1" />
          </div>
        </div>
      </li>
    );
  };

  return (
    <div className="pb-16">
      <div className="pt-6 pb-4">
        <p className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">Interview pulse every Sunday · tech news daily</p>
        <h1 className="mt-1.5 font-display text-3xl font-bold tracking-tight sm:text-4xl">News</h1>
        <p className="mt-1.5 max-w-2xl text-muted-foreground">On weekends: read the Interview pulse to see what candidates report about your target companies. On weekdays: skim the tech reads below and open only the 1–2 that matter.</p>
      </div>

      <div className="mb-5 inline-flex rounded-lg border bg-card p-0.5">
        {(['feed', 'saved'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} aria-pressed={tab === t} className="rounded-md px-3.5 py-1.5 text-sm font-medium text-muted-foreground aria-pressed:bg-foreground aria-pressed:text-background">{t === 'feed' ? 'Feed' : `Saved${savedCount ? ` (${savedCount})` : ''}`}</button>
        ))}
      </div>

      {tab === 'saved' ? <SavedList /> : (<>
      <InterviewPulse />

      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <H3>{latest ? `Tech reads · ${fmtDate(parseISO(latest))} · ${news!.days[latest].length}` : 'Tech reads'}</H3>
        <div className="flex gap-1">
          {(['all', 'ai', 'dev', 'research'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} aria-pressed={filter === f} className="rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground aria-pressed:bg-foreground aria-pressed:text-background">{f === 'all' ? 'All' : CAT[f]}</button>
          ))}
        </div>
      </div>
      {items.length ? <Card className="mb-6 gap-0 p-0"><ul className="divide-y">{items.map(n => <Row key={n.id} n={n} />)}</ul></Card>
        : <Card className="mb-6 p-4 text-sm text-muted-foreground">{latest ? 'Nothing in this category today.' : 'No news yet. The daily fetch fills this in.'}</Card>}

      <H3>Plan changes · {changes.length}</H3>
      {!changes.length && <Card className="mb-6 p-4 text-sm text-muted-foreground">No changes yet. When a link breaks or a resource goes out of date, the weekly engine fixes it here and in your tasks.</Card>}
      <div className="mb-6 flex flex-col gap-2.5">
        {changes.map(u => {
          const seen = !!state.seenUpdates[u.id], day = whereScheduled(u.id);
          return (
            <Card key={u.id} className={cn('gap-2 p-4', !seen && u.priority !== 'fyi' && 'border-c-update/50')}>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <Badge variant="outline" className={cn(u.kind === 'new' ? 'border-primary text-primary' : 'border-warn text-warn')}>{KIND[u.kind]}</Badge>
                <Badge variant="secondary">{PRIO[u.priority]}</Badge>
                <span className="font-mono text-muted-foreground">{catName[u.area] || u.area} · {fmtDate(parseISO(u.date))}</span>
              </div>
              <h3 className="font-display text-lg font-bold leading-snug">{u.title}</h3>
              <p className="text-sm text-muted-foreground">{u.why}</p>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                {(u.replacementUrl || u.url) && <a href={u.replacementUrl || u.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-primary">Open <ExternalLink className="size-3.5" /></a>}
                {day && <span className="text-muted-foreground">Added to day {day.i + 1} ({fmtDate(day.date)})</span>}
                {(u.replacementUrl || u.url) && <BookmarkButton item={{ kind: 'update', title: u.title, url: (u.replacementUrl || u.url)!, source: catName[u.area] || u.area, detail: PRIO[u.priority] }} />}
                <Button variant="ghost" size="sm" className="ml-auto" onClick={() => toggleSeen(u.id)}>{seen ? 'Mark unread' : 'Mark read'}</Button>
              </div>
            </Card>
          );
        })}
      </div>

      {dates.length > 1 && (
        <>
          <Button variant="outline" size="sm" onClick={() => setShowOlder(v => !v)} className="mb-3">{showOlder ? 'Hide earlier days' : `Earlier days (${dates.length - 1})`}</Button>
          {showOlder && dates.slice(1).map(d => (
            <div key={d} className="mb-4"><H3>{fmtDate(parseISO(d))}</H3><Card className="gap-0 p-0"><ul className="divide-y">{news!.days[d].map(n => <Row key={n.id} n={n} />)}</ul></Card></div>
          ))}
        </>
            )}
      </>)}
    </div>
  );
}
