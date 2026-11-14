'use client';
/* News page: Interviews (feed of interview posts) · Reading (daily tech links) · Saved (bookmarks).
   Plan changes live in Roadmap › Reference › Changes. */
import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/lib/store';
import { flattenThreads } from '@/lib/interview-feed';
import { PageHeader, Seg, Surface } from './shell/page';
import { NewsInterviews } from './news-interviews';
import { NewsReading } from './news-reading';
import { SavedList } from './bookmarks';
import { useUI, type NewsTab as Tab } from './ui-state';

export function NewsView() {
  const { state, update, news, threads } = useStore();
  const { newsTab } = useUI();
  const [tab, setTab] = useState<Tab>(newsTab);
  // The visit time before this visit, so the Interviews count stays put while the page is open.
  const [since] = useState<number | null>(() => state.seenUpdates['interviews-visit'] ?? null);
  const wrote = useRef(false);
  useEffect(() => {
    if (tab !== 'interviews' || wrote.current) return;
    wrote.current = true;
    update(s => ({ ...s, seenUpdates: { ...s.seenUpdates, 'interviews-visit': Date.now() } }));
  }, [tab, update]);

  const posts = flattenThreads(threads);
  const newPosts = since == null ? posts.length : posts.filter(p => { const t = Date.parse(p.createdAt); return !Number.isNaN(t) && t > since; }).length;
  const latest = news ? Object.keys(news.days).sort().pop() : undefined;
  const unreadReads = news && latest ? news.days[latest].filter(n => !state.seenUpdates[`n-${n.id}`]).length : 0;
  const saved = Object.keys(state.bookmarks).length;
  const opts: { value: Tab; label: string; count?: number }[] = [
    { value: 'interviews', label: 'Interviews', count: newPosts || undefined },
    { value: 'reading', label: 'Reading', count: unreadReads || undefined },
    { value: 'saved', label: 'Saved', count: saved || undefined },
  ];

  return (
    <div className="pb-16">
      <PageHeader crumbs={['News']} actions={<Seg value={tab} onChange={setTab} options={opts} />} />
      <Surface>
        {tab === 'interviews' && <NewsInterviews />}
        {tab === 'reading' && <NewsReading />}
        {tab === 'saved' && <SavedList />}
      </Surface>
    </div>
  );
}
