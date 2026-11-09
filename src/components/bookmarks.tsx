'use client';
import { useState } from 'react';
import { Bookmark as BookmarkIcon, BookmarkCheck, ExternalLink, FileText, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useStore, type Bookmark } from '@/lib/store';
import { useUI } from './ui-state';

/** Stable key: the same article saved from different days or places is one bookmark. */
export const bookmarkKey = (kind: Bookmark['kind'], url: string) => `${kind}:${url.replace(/^https?:\/\/(www\.)?/, '').replace(/[?#].*$/, '').replace(/\/$/, '')}`;

export function BookmarkButton({ item, className }: { item: Omit<Bookmark, 'savedAt'>; className?: string }) {
  const { state, update } = useStore();
  const { toast } = useUI();
  const key = bookmarkKey(item.kind, item.url);
  const saved = !!state.bookmarks[key];
  const toggle = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    update(s => { const b = { ...s.bookmarks }; if (b[key]) delete b[key]; else b[key] = { ...item, savedAt: Date.now() }; return { ...s, bookmarks: b }; });
    toast(saved ? 'Removed from Saved' : 'Saved. Find it under News → Saved');
  };
  return (
    <button onClick={toggle} aria-pressed={saved} title={saved ? 'Remove from Saved' : 'Save for later'}
      className={cn('inline-flex items-center gap-1 rounded-md px-1.5 py-1 font-mono text-xs text-muted-foreground hover:bg-muted', saved && 'text-primary', className)}>
      {saved ? <BookmarkCheck className="size-3.5" /> : <BookmarkIcon className="size-3.5" />}{saved ? 'saved' : 'save'}
    </button>
  );
}

const KIND_LABEL = { news: 'News', thread: 'Interview thread', update: 'Plan update' } as const;

export function SavedList() {
  const { state, update } = useStore();
  const { openNote } = useUI();
  const [q, setQ] = useState('');
  const [kind, setKind] = useState<'all' | Bookmark['kind']>('all');
  const items = Object.entries(state.bookmarks)
    .filter(([, b]) => kind === 'all' || b.kind === kind)
    .filter(([k, b]) => !q || `${b.title} ${b.source} ${b.detail || ''} ${state.tnotes[`bm-${k}`]?.body || ''}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b[1].savedAt - a[1].savedAt);
  const remove = (k: string) => update(s => { const b = { ...s.bookmarks }; delete b[k]; return { ...s, bookmarks: b }; });

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Input type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="Search saved items and their notes" className="min-w-[200px] flex-1 bg-card" />
        <div className="flex gap-1">
          {(['all', 'news', 'thread', 'update'] as const).map(k => (
            <button key={k} onClick={() => setKind(k)} aria-pressed={kind === k} className="rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground aria-pressed:bg-foreground aria-pressed:text-background">{k === 'all' ? 'All' : KIND_LABEL[k]}</button>
          ))}
        </div>
      </div>
      {!items.length ? (
        <Card className="p-4 text-sm text-muted-foreground">{Object.keys(state.bookmarks).length ? 'Nothing matches.' : 'Nothing saved yet. Use "save" on any news item, interview thread or plan update. Saved items stay here after they leave the feed.'}</Card>
      ) : (
        <Card className="gap-0 p-0">
          <ul className="divide-y">
            {items.map(([k, b]) => {
              const note = state.tnotes[`bm-${k}`]?.body?.trim();
              return (
                <li key={k} className="px-4 py-3">
                  <a href={b.url} target="_blank" rel="noopener noreferrer" className="font-medium leading-snug hover:underline">{b.title}<ExternalLink className="ml-1 inline size-3 opacity-60" /></a>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-muted-foreground">
                    <span className="text-primary">{KIND_LABEL[b.kind]}</span>
                    <span>{b.source}</span>
                    {b.detail && <span>{b.detail}</span>}
                    <span>saved {new Date(b.savedAt).toLocaleDateString()}</span>
                    <span className="ml-auto flex gap-1">
                      <button onClick={() => openNote({ kind: 'task', key: `bm-${k}`, title: b.title, url: b.url })} className={cn('inline-flex items-center gap-1 rounded-md px-1.5 py-1 hover:bg-muted', note && 'text-primary')}><FileText className="size-3.5" />{note ? 'note' : 'add note'}</button>
                      <button onClick={() => remove(k)} className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 hover:bg-muted hover:text-bad"><Trash2 className="size-3.5" />remove</button>
                    </span>
                  </div>
                  {note && <p className="mt-1.5 line-clamp-2 text-[13px] text-muted-foreground">{note.replace(/[#*`>]/g, '')}</p>}
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}
