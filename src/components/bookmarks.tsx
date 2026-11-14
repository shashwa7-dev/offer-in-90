'use client';
import { useState } from 'react';
import { FileText, Star, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useStore, type Bookmark } from '@/lib/store';
import { OutLink, Seg } from './shell/page';
import { useUI } from './ui-state';

/** Stable key: the same article saved from different days or places is one bookmark. */
export const bookmarkKey = (kind: Bookmark['kind'], url: string) => `${kind}:${url.replace(/^https?:\/\/(www\.)?/, '').replace(/[?#].*$/, '').replace(/\/$/, '')}`;

const iconBtn = 'inline-flex size-7 items-center justify-center rounded-[6px] text-faint outline-none transition-colors hover:bg-card hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50';

/** ☆ toggle: saves an outside link to News › Saved. */
export function BookmarkButton({ item, className }: { item: Omit<Bookmark, 'savedAt'>; className?: string }) {
  const { state, update } = useStore();
  const { toast } = useUI();
  const key = bookmarkKey(item.kind, item.url);
  const saved = !!state.bookmarks[key];
  const toggle = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    update(s => { const b = { ...s.bookmarks }; if (b[key]) delete b[key]; else b[key] = { ...item, savedAt: Date.now() }; return { ...s, bookmarks: b }; });
    toast(saved ? 'Removed from Saved' : 'Saved. Find it under News › Saved');
  };
  return (
    <button type="button" onClick={toggle} aria-pressed={saved} aria-label={saved ? 'Remove from Saved' : 'Save for later'} title={saved ? 'Remove from Saved' : 'Save for later'}
      className={cn(iconBtn, saved && 'text-foreground', className)}>
      <Star className={cn('size-3.5', saved && 'fill-current')} />
    </button>
  );
}

const KIND_LABEL = { news: 'Read', thread: 'Interview', update: 'Plan update' } as const;
const KINDS: { value: 'all' | Bookmark['kind']; label: string }[] = [
  { value: 'all', label: 'All' }, { value: 'thread', label: 'Interviews' }, { value: 'news', label: 'Reading' }, { value: 'update', label: 'Plan updates' },
];

/** News › Saved: every bookmark as an outside-link row, with search, a kind filter, a note per item (`bm-<key>`) and remove. */
export function SavedList() {
  const { state, update } = useStore();
  const { openNote } = useUI();
  const [q, setQ] = useState('');
  const [kind, setKind] = useState<'all' | Bookmark['kind']>('all');
  const total = Object.keys(state.bookmarks).length;
  const items = Object.entries(state.bookmarks)
    .filter(([, b]) => kind === 'all' || b.kind === kind)
    .filter(([k, b]) => !q || `${b.title} ${b.source} ${b.detail || ''} ${state.tnotes[`bm-${k}`]?.body || ''}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b[1].savedAt - a[1].savedAt);
  const remove = (k: string) => update(s => { const b = { ...s.bookmarks }; delete b[k]; return { ...s, bookmarks: b }; });
  const seenKey = (b: Bookmark) => (b.kind === 'thread' ? `t-${b.url}` : null);
  const markSeen = (b: Bookmark) => { const k = seenKey(b); if (k && !state.seenUpdates[k]) update(s => ({ ...s, seenUpdates: { ...s.seenUpdates, [k]: Date.now() } })); };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-2.5">
        <Input type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="Search saved items and their notes" className="h-8 min-w-[180px] flex-1 rounded-[6px] text-[13px]" />
        <Seg value={kind} onChange={setKind} options={KINDS} />
      </div>
      {!items.length ? (
        <p className="px-4 py-3 text-[13px] text-muted-foreground">{total ? 'Nothing matches.' : 'Nothing saved yet. Use ☆ on any interview post, read or plan update. Saved items stay here after they leave the feed.'}</p>
      ) : items.map(([k, b]) => {
        const note = state.tnotes[`bm-${k}`]?.body?.trim();
        const sk = seenKey(b);
        return (
          <div key={k} data-saved className="border-t border-border first:border-t-0">
            <OutLink href={b.url} title={b.title} read={!!(sk && state.seenUpdates[sk])} onOpen={() => markSeen(b)}
              meta={<>{KIND_LABEL[b.kind]} · {b.source}{b.detail ? ` · ${b.detail}` : ''} · saved {new Date(b.savedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</>}
              saved={<>
                <button type="button" onClick={() => openNote({ kind: 'task', key: `bm-${k}`, title: b.title, url: b.url })} aria-label={note ? 'Open note' : 'Add note'} title={note ? 'Open note' : 'Add note'} className={cn(iconBtn, note && 'text-foreground')}><FileText className="size-3.5" /></button>
                <button type="button" onClick={() => remove(k)} aria-label="Remove" title="Remove" className={iconBtn}><Trash2 className="size-3.5" /></button>
              </>} />
            {note && <p className="-mt-1 line-clamp-2 pb-2 pl-[52px] pr-4 text-[12px] text-muted-foreground">{note.replace(/[#*`>]/g, '')}</p>}
          </div>
        );
      })}
    </div>
  );
}
