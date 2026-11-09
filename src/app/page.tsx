'use client';
import { useCallback, useEffect, useState } from 'react';
import { StoreProvider, useStore } from '@/lib/store';
import { TOTAL } from '@/lib/engine';
import { cn } from '@/lib/utils';
import { UICtx, type NoteTarget, type View } from '@/components/ui-state';
import { TodayView } from '@/components/today-view';
import { ProgressView } from '@/components/progress-view';
import { RoadmapView } from '@/components/roadmap-view';
import { NotesView } from '@/components/notes-view';
import { UpdatesView } from '@/components/updates-view';
import { SetupView } from '@/components/setup-view';
import { NoteSheet } from '@/components/note-sheet';

const TABS: [View, string][] = [['today', 'Today'], ['progress', 'Progress'], ['roadmap', 'Roadmap'], ['notes', 'Notes'], ['updates', 'Updates'], ['setup', 'Setup']];

function App() {
  const { ready, todayIdx, updates, state, sync, syncConfigured } = useStore();
  const [view, setView] = useState<View>('today');
  const [viewIdx, setViewIdx] = useState(0);
  const [note, setNote] = useState<NoteTarget | null>(null);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => { if (ready) setViewIdx(Math.max(0, Math.min(TOTAL - 1, todayIdx))); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);
  useEffect(() => { const h = location.hash.slice(1) as View; if (TABS.some(t => t[0] === h)) setView(h); }, []);
  const go = useCallback((v: View) => { setView(v); history.replaceState(null, '', v === 'today' ? location.pathname : `#${v}`); window.scrollTo(0, 0); }, []);
  const toast = useCallback((m: string) => { setToastMsg(m); setTimeout(() => setToastMsg(''), 2400); }, []);
  const openDay = useCallback((i: number) => { setViewIdx(i); go('today'); }, [go]);
  const unseen = updates.filter(u => !state.seenUpdates[u.id] && u.priority !== 'fyi').length;

  if (!ready) return <div className="p-8 text-muted-foreground">Loading your plan…</div>;
  return (
    <UICtx.Provider value={{ view, go, viewIdx, setViewIdx, openDay, openNote: setNote, toast }}>
      <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 py-2.5 pl-[max(16px,env(safe-area-inset-left))] pr-[max(16px,env(safe-area-inset-right))]">
          <div className="flex items-baseline gap-2 font-display text-lg font-bold tracking-tight">Offer in 90
            <small className="font-mono text-xs font-medium text-muted-foreground">{todayIdx < 0 ? `starts in ${-todayIdx}d` : todayIdx >= TOTAL ? 'complete' : `day ${todayIdx + 1}/${TOTAL}`}</small>
            {syncConfigured && <span title={sync.state === 'error' ? sync.msg : 'Synced to your Gist'} className={cn('size-2 self-center rounded-full', sync.state === 'error' ? 'bg-bad' : sync.state === 'syncing' ? 'bg-warn' : 'bg-good')} />}
          </div>
          <nav className="-mx-1 flex max-w-full gap-0.5 overflow-x-auto sm:ml-auto" role="tablist">
            {TABS.map(([v, label]) => (
              <button key={v} role="tab" aria-selected={view === v} onClick={() => go(v)} className="relative shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground aria-selected:bg-foreground aria-selected:text-background">
                {label}{v === 'updates' && unseen > 0 && <span className="ml-1.5 rounded-full bg-c-update px-1.5 font-mono text-[10px] text-white">{unseen}</span>}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main className={cn('mx-auto pl-[max(16px,env(safe-area-inset-left))] pr-[max(16px,env(safe-area-inset-right))]', view === 'today' || view === 'notes' ? 'max-w-3xl' : 'max-w-6xl')}>
        {view === 'today' && <TodayView />}
        {view === 'progress' && <ProgressView />}
        {view === 'roadmap' && <RoadmapView />}
        {view === 'notes' && <NotesView />}
        {view === 'updates' && <UpdatesView />}
        {view === 'setup' && <SetupView />}
      </main>
      <NoteSheet target={note} onClose={() => setNote(null)} />
      {toastMsg && <div role="status" className="fixed bottom-[max(18px,env(safe-area-inset-bottom))] left-1/2 z-50 -translate-x-1/2 rounded-lg bg-foreground px-4 py-2.5 text-sm text-background">{toastMsg}</div>}
    </UICtx.Provider>
  );
}

export default function Page() {
  return <StoreProvider><App /></StoreProvider>;
}
