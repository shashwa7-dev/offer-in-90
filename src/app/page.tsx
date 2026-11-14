'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast as sonnerToast } from 'sonner';
import { StoreProvider, useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { UICtx, type NoteTarget, type View } from '@/components/ui-state';
import { TodayView } from '@/components/today-view';
import { ProgressView } from '@/components/progress-view';
import { RoadmapView } from '@/components/roadmap-view';
import { NotesView } from '@/components/notes-view';
import { NewsView } from '@/components/updates-view';
import { SetupView } from '@/components/setup-view';
import { NoteSheet } from '@/components/note-sheet';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';
import { AppSidebar } from '@/components/shell/app-sidebar';
import { BottomBar } from '@/components/shell/bottom-bar';

const VIEWS: View[] = ['today', 'progress', 'roadmap', 'notes', 'news', 'setup'];

/** True when a key press should go to a text field rather than a page shortcut. */
const typing = (el: EventTarget | null) => {
  const t = el as HTMLElement | null;
  return !!t && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName));
};

function App() {
  const { ready, todayIdx, days } = useStore();
  const [view, setView] = useState<View>('today');
  const [viewIdx, setViewIdx] = useState(0);
  const [note, setNote] = useState<NoteTarget | null>(null);

  useEffect(() => { if (ready) setViewIdx(Math.max(0, Math.min(days.length - 1, todayIdx))); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);
  useEffect(() => { const h = location.hash.slice(1) as View; if (VIEWS.includes(h)) setView(h); }, []);
  const go = useCallback((v: View) => { setView(v); history.replaceState(null, '', v === 'today' ? location.pathname : `#${v}`); window.scrollTo(0, 0); }, []);
  const toast = useCallback((m: string) => { sonnerToast(m); }, []);
  const openDay = useCallback((i: number) => { setViewIdx(i); go('today'); }, [go]);
  // New task dialog and task peek arrive in Task 8; until then these do nothing.
  const newTask = useCallback((preset?: { date?: string; block?: string }) => { void preset; }, []);
  const openTask = useCallback((taskId: string, dayIdx: number) => { void taskId; void dayIdx; }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'c' || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey || e.repeat || typing(e.target)) return;
      e.preventDefault(); newTask();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [newTask]);

  const ui = useMemo(() => ({ view, go, viewIdx, setViewIdx, openDay, openNote: setNote, newTask, openTask, toast }), [view, go, viewIdx, openDay, newTask, openTask, toast]);

  if (!ready) return <div className="p-8 text-muted-foreground">Loading your plan…</div>;
  return (
    <UICtx.Provider value={ui}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="min-w-0 bg-background pb-[calc(56px+env(safe-area-inset-bottom))] md:pb-0">
          <div className={cn('mx-auto w-full pt-[env(safe-area-inset-top)] pl-[max(16px,env(safe-area-inset-left))] pr-[max(16px,env(safe-area-inset-right))] md:px-6', view === 'today' || view === 'notes' ? 'max-w-3xl' : 'max-w-6xl')}>
            {view === 'today' && <TodayView />}
            {view === 'progress' && <ProgressView />}
            {view === 'roadmap' && <RoadmapView />}
            {view === 'notes' && <NotesView />}
            {view === 'news' && <NewsView />}
            {view === 'setup' && <SetupView />}
          </div>
        </SidebarInset>
        <BottomBar />
      </SidebarProvider>
      <NoteSheet target={note} onClose={() => setNote(null)} />
      <Toaster position="bottom-center" mobileOffset={{ bottom: 'calc(68px + env(safe-area-inset-bottom))' }} />
    </UICtx.Provider>
  );
}

export default function Page() {
  return <StoreProvider><App /></StoreProvider>;
}
