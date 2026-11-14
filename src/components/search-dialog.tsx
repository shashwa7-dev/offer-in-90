'use client';
/* ⌘K: one palette over every plan task, notes, interview posts, daily reads and the page shortcuts.
   Results come from src/lib/search.ts (cmdk filtering is off); the index is rebuilt only when store data changes. */
import { useMemo, useState } from 'react';
import { CalendarCheck2, CornerDownLeft, FileText, Newspaper, Plus, Search, SquareCheck, StickyNote, type LucideIcon } from 'lucide-react';
import { cn, modKey } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { buildIndex, search, type Hit } from '@/lib/search';
import { flattenThreads } from '@/lib/interview-feed';
import { trackOfCat } from '@/lib/task-filter';
import { TRACKS } from '@/lib/timeline';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Command as CommandPrimitive } from 'cmdk';
import { NAV, SETUP_NAV } from './shell/app-sidebar';
import { useUI, type View } from './ui-state';

const trackName = (cat: string) => { const k = trackOfCat(cat); return k ? TRACKS.find(t => t.key === k)?.name : undefined; };

interface Action { id: string; label: string; icon: LucideIcon; run: () => void }

export function SearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { state, days, threads, news, update } = useStore();
  const { go, openDay, openTask, newTask, setNotesSelect } = useUI();
  const [q, setQ] = useState('');

  // Built only while the palette is open, so typing in Notes (pages/tnotes changes) never re-indexes ~1.8k tasks.
  const ix = useMemo(() => open ? buildIndex({
    days: days.map(d => ({ i: d.i, no: d.no, date: d.date, tasks: d.tasks.map(t => ({ id: t.id, text: t.text, cat: t.cat, own: t.own, track: trackName(t.cat) })) })),
    pages: state.pages,
    tnotes: state.tnotes,
    posts: flattenThreads(threads),
    reads: news ? Object.keys(news.days).sort().reverse().flatMap(k => news.days[k]) : [],
  }) : null, [open, days, state.pages, state.tnotes, threads, news]);

  const groups = useMemo(() => (ix ? search(ix, q) : []), [ix, q]);

  const close = (then?: () => void) => { onOpenChange(false); setQ(''); if (then) setTimeout(then, 0); };
  const markRead = (k: string) => { if (!state.seenUpdates[k]) update(s => ({ ...s, seenUpdates: { ...s.seenUpdates, [k]: Date.now() } })); };
  const readKey = (h: Hit) => (h.kind === 'post' ? `t-${h.url}` : h.kind === 'read' ? `n-${h.id}` : '');

  const pick = (h: Hit) => {
    if (h.kind === 'task') close(() => { openDay(h.dayIdx); openTask(h.id, h.dayIdx); });
    else if (h.kind === 'day') close(() => openDay(h.dayIdx));
    else if (h.kind === 'note') {
      const tn = state.tnotes[h.key];
      close(() => { setNotesSelect(h.noteKind === 'page' ? { kind: 'page', id: h.key } : { kind: 'task', key: h.key, title: tn?.title ?? h.title, url: tn?.url }); go('notes'); });
    } else {
      window.open(h.url, '_blank', 'noopener');
      markRead(readKey(h)); close();
    }
  };

  const page = (v: View) => { const n = [...NAV, SETUP_NAV].find(x => x.v === v)!; return { id: `go-${v}`, label: n.label, icon: n.icon, run: () => go(v) }; };
  const actions: Action[] = [
    { id: 'new-task', label: 'New task', icon: Plus, run: () => newTask() },
    { id: 'go-today-day', label: 'Go to today', icon: CalendarCheck2, run: () => go('today') },
    ...(['today', 'progress', 'roadmap', 'notes', 'news', 'setup'] as View[]).map(page),
  ];
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const shownActions = words.length ? actions.filter(a => words.every(w => a.label.toLowerCase().includes(w))) : actions;

  const ICON: Record<Hit['kind'], LucideIcon> = { task: SquareCheck, note: StickyNote, post: Newspaper, read: FileText, day: CalendarCheck2 };
  const item = (h: Hit, key: string) => {
    const Icon = ICON[h.kind];
    const out = h.kind === 'post' || h.kind === 'read';
    const read = out && !!state.seenUpdates[readKey(h)];
    const body = (
      <>
        <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
        <span className="min-w-0 flex-1">
          <span className={cn('block truncate text-[13px] font-medium', read ? 'text-muted-foreground' : 'text-foreground')}>{h.title || 'Untitled'}</span>
          {h.meta && <span className="block truncate text-[12px] text-muted-foreground tabular-nums">{h.meta}</span>}
        </span>
        {out && <><span aria-hidden="true" className="shrink-0 text-[13px] text-faint">↗</span><span className="sr-only">(opens in a new tab)</span></>}
      </>
    );
    return (
      <CommandItem key={key} value={key} onSelect={() => pick(h)} data-search-hit={h.kind} data-read={read || undefined} className="gap-3 rounded-md px-2 py-2 data-[selected=true]:bg-hover">
        {out ? (
          // Mouse: the whole row is a real link (new tab); Enter goes through onSelect → window.open.
          <a href={h.url} target="_blank" rel="noopener noreferrer" tabIndex={-1} className="flex min-w-0 flex-1 items-center gap-3 outline-none"
            onClick={e => { e.stopPropagation(); markRead(readKey(h)); close(); }}>{body}</a>
        ) : body}
      </CommandItem>
    );
  };

  return (
    <Dialog open={open} onOpenChange={o => { onOpenChange(o); if (!o) setQ(''); }}>
      <DialogContent showCloseButton={false} overlayClassName="bg-black/20" data-search-dialog
        className="top-[12vh] translate-y-0 gap-0 overflow-hidden rounded-[12px] border-border bg-card p-0 shadow-[0_12px_40px_rgba(0,0,0,0.14)] sm:max-w-[600px] data-[state=closed]:zoom-out-100 data-[state=open]:zoom-in-100">
        <DialogTitle className="sr-only">Search</DialogTitle>
        <DialogDescription className="sr-only">Search tasks, notes, interview posts and daily reads, or run a shortcut.</DialogDescription>
        <Command shouldFilter={false} loop className="rounded-[12px] bg-card">
          <div className="flex h-12 items-center gap-2 border-b border-border px-4">
            <Search className="size-4 shrink-0 text-faint" aria-hidden="true" />
            <CommandPrimitive.Input value={q} onValueChange={setQ} placeholder="Search tasks, notes, interviews, reads…" aria-label="Search everything" data-search-input
              className="h-12 min-w-0 flex-1 bg-transparent text-[14px] text-foreground outline-none placeholder:text-faint" />
            <kbd className="hidden rounded-[4px] border border-border px-1 text-[11px] text-faint sm:block">Esc</kbd>
          </div>
          <CommandList className="max-h-[min(60vh,440px)] p-1.5">
            <CommandEmpty className="py-8 text-center text-[13px] text-muted-foreground">Nothing matches “{q.trim()}”.</CommandEmpty>
            {groups.map(g => (
              <CommandGroup key={g.group} heading={g.group} data-search-group={g.group} className="[&_[cmdk-group-heading]]:text-[12px]">
                {g.hits.map((h, n) => item(h, `${g.group}:${n}:${h.kind === 'task' ? `${h.id}@${h.dayIdx}` : h.kind === 'note' ? h.key : h.kind === 'day' ? h.dayIdx : h.url}`))}
              </CommandGroup>
            ))}
            {shownActions.length > 0 && (
              <CommandGroup heading="Actions" data-search-group="Actions" className="[&_[cmdk-group-heading]]:text-[12px]">
                {shownActions.map(a => (
                  <CommandItem key={a.id} value={`action:${a.id}`} onSelect={() => close(a.run)} data-search-action={a.id} className="gap-3 rounded-md px-2 py-2 text-[13px] data-[selected=true]:bg-hover">
                    <a.icon className="size-4 text-muted-foreground" aria-hidden="true" />
                    <span className="flex-1 truncate">{a.label}</span>
                    {a.id === 'new-task' && <kbd className="text-[11px] text-faint">C</kbd>}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
          <div className="hidden items-center gap-3 border-t border-border bg-band px-4 py-2 text-[12px] text-faint sm:flex">
            <span className="inline-flex items-center gap-1"><CornerDownLeft className="size-3" aria-hidden="true" />open</span>
            <span>↑↓ move</span>
            <span className="ml-auto">{modKey()}K anywhere · / outside Notes</span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
