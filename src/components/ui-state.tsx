'use client';
import { createContext, useContext } from 'react';

export type View = 'today' | 'progress' | 'roadmap' | 'notes' | 'news' | 'setup';
export type RoadmapTab = 'timeline' | 'weeks' | 'reference';
export type NewsTab = 'interviews' | 'reading' | 'saved';
/** Which News tab a task's "Open News" lands on: daily reads → Reading, the weekly pulse → Interviews. */
export const newsTabFor = (newsId?: string): NewsTab => (newsId === 'reads' ? 'reading' : 'interviews');
export type NoteTarget = { kind: 'task'; key: string; title: string; url?: string } | { kind: 'page'; id: string };

interface UI {
  view: View;
  /** Switch page; for News, `newsTab` picks the tab it opens on (default Interviews). */
  go: (v: View, opts?: { newsTab?: NewsTab }) => void;
  /** The tab News opens on, set by the last go('news'). */
  newsTab: NewsTab;
  viewIdx: number; setViewIdx: (i: number) => void; openDay: (i: number) => void;
  openNote: (t: NoteTarget) => void;
  /** Opens the New task dialog (Task 8), optionally preset to a day and block. */
  newTask: (preset?: { date?: string; block?: string }) => void;
  /** Opens the task peek for a task on a given day (Task 8). */
  openTask: (taskId: string, dayIdx: number) => void;
  /** Roadmap tab, kept across page switches so links can land on a tab. */
  roadmapTab: RoadmapTab; setRoadmapTab: (t: RoadmapTab) => void;
  /** A week Roadmap › Weeks should open, expand and scroll to once (set by the sidebar Cycles); null when none. */
  focusWeek: number | null; setFocusWeek: (w: number | null) => void;
  /** Whether Roadmap › Reference › Changes is open. */
  openChanges: boolean; setOpenChanges: (v: boolean) => void;
  /** Thin wrapper over sonner's toast so callers stay unchanged. */
  toast: (msg: string) => void;
}
export const UICtx = createContext<UI | null>(null);
export const useUI = () => { const c = useContext(UICtx); if (!c) throw new Error('UI missing'); return c; };
