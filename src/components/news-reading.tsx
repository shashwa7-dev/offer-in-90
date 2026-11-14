'use client';
/* News › Reading: the daily tech links, one band per day (latest open, earlier days folded), filtered by category. */
import { useState } from 'react';
import { Check, MessageSquare } from 'lucide-react';
import { domainOf } from '@/lib/interview-feed';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { fmtDate, parseISO, type NewsItem } from '@/lib/engine';
import { Band, OutLink, Seg } from './shell/page';
import { BookmarkButton } from './bookmarks';
import { ago } from './news-interviews';

const CAT = { ai: 'AI', dev: 'Dev', research: 'Research' } as const;
type Cat = 'all' | NewsItem['category'];
const CATS: { value: Cat; label: string }[] = [{ value: 'all', label: 'All' }, { value: 'ai', label: 'AI' }, { value: 'dev', label: 'Dev' }, { value: 'research', label: 'Research' }];

export function NewsReading() {
  const { state, update, news } = useStore();
  const [cat, setCat] = useState<Cat>('all');
  const dates = news ? Object.keys(news.days).sort().reverse() : [];
  const markRead = (n: NewsItem) => { const k = `n-${n.id}`; if (!state.seenUpdates[k]) update(s => ({ ...s, seenUpdates: { ...s.seenUpdates, [k]: Date.now() } })); };

  const setRead = (ns: NewsItem[], read: boolean) => update(s => {
    const seen = { ...s.seenUpdates };
    for (const n of ns) { const k = `n-${n.id}`; if (read) { if (!seen[k]) seen[k] = Date.now(); } else delete seen[k]; }
    return { ...s, seenUpdates: seen };
  });
  const bandAction = (items: NewsItem[]) => {
    const unread = items.filter(n => !state.seenUpdates[`n-${n.id}`]);
    return unread.length ? <button type="button" data-mark-all onClick={() => setRead(unread, true)} className="rounded-[5px] px-1.5 py-0.5 text-[12px] text-muted-foreground outline-none hover:bg-card hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50">Mark all read</button> : undefined;
  };

  const rows = (items: NewsItem[]) => {
    const list = items.filter(n => cat === 'all' || n.category === cat);
    if (!list.length) return <p className="px-4 py-3 text-[13px] text-muted-foreground">Nothing in this category.</p>;
    return list.map(n => (
      <OutLink key={n.id} href={n.url} title={n.title} read={!!state.seenUpdates[`n-${n.id}`]} onOpen={() => markRead(n)}
        meta={<>{CAT[n.category]}{n.points ? ` · ${n.points} pts` : ''}{n.comments ? ` · ${n.comments} comments` : ''} · {ago(n.publishedAt)}</>}
        saved={<>
          {n.discussUrl && n.discussUrl !== n.url && (
            <a href={n.discussUrl} target="_blank" rel="noopener noreferrer" data-discuss title={`${n.comments} comments on ${domainOf(n.discussUrl)}`}
              className="inline-flex size-7 items-center justify-center rounded-[6px] text-[12px] whitespace-nowrap text-muted-foreground hover:bg-card hover:text-foreground sm:w-auto sm:px-1.5">
              <MessageSquare aria-hidden="true" className="size-3.5 sm:hidden" /><span className="sr-only sm:not-sr-only">comments ↗</span><span className="sr-only"> (opens in a new tab)</span>
            </a>
          )}
          <button type="button" data-read-toggle onClick={() => setRead([n], !state.seenUpdates[`n-${n.id}`])}
            aria-label={state.seenUpdates[`n-${n.id}`] ? `Mark unread: ${n.title}` : `Mark read: ${n.title}`} aria-pressed={!!state.seenUpdates[`n-${n.id}`]}
            title={state.seenUpdates[`n-${n.id}`] ? 'Mark unread' : 'Mark read'}
            className={cn('inline-flex size-7 items-center justify-center rounded-[6px] outline-none hover:bg-card focus-visible:ring-2 focus-visible:ring-ring/50', state.seenUpdates[`n-${n.id}`] ? 'text-foreground' : 'text-faint hover:text-foreground')}>
            <Check aria-hidden="true" className="size-3.5" />
          </button>
          <BookmarkButton item={{ kind: 'news', title: n.title, url: n.url, source: n.source, detail: `${CAT[n.category]}${n.points ? ` · ${n.points} pts` : ''}` }} />
        </>} />
    ));
  };

  return (
    <div data-reading>
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-2.5">
        <Seg value={cat} onChange={setCat} options={CATS} />
      </div>
      {!dates.length ? <p className="px-4 py-3 text-[13px] text-muted-foreground">No reads yet. The daily fetch fills this in.</p> : (
        <>
          {(() => {
            const d = dates[0], items = news!.days[d];
            const unread = items.filter(n => !state.seenUpdates[`n-${n.id}`]).length;
            return <Band title={fmtDate(parseISO(d))} count={unread ? `${unread} unread` : `${items.length}`} right={bandAction(items)}>{rows(items)}</Band>;
          })()}
          {dates.slice(1).map(d => (
            <Band key={d} title={fmtDate(parseISO(d))} count={news!.days[d].length} defaultOpen={false} right={bandAction(news!.days[d])}>{rows(news!.days[d])}</Band>
          ))}
        </>
      )}
    </div>
  );
}
