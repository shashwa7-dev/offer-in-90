'use client';
import { createContext, useContext } from 'react';

export type View = 'today' | 'progress' | 'roadmap' | 'notes' | 'news' | 'setup';
export type RoadmapTab = 'timeline' | 'weeks' | 'reference';
export type NoteTarget = { kind: 'task'; key: string; title: string; url?: string } | { kind: 'page'; id: string };

interface UI {
  view: View; go: (v: View) => void;
  viewIdx: number; setViewIdx: (i: number) => void; openDay: (i: number) => void;
  openNote: (t: NoteTarget) => void;
  /** Opens the New task dialog (Task 8), optionally preset to a day and block. */
  newTask: (preset?: { date?: string; block?: string }) => void;
  /** Opens the task peek for a task on a given day (Task 8). */
  openTask: (taskId: string, dayIdx: number) => void;
  /** Roadmap tab, kept across page switches so links can land on a tab. */
  roadmapTab: RoadmapTab; setRoadmapTab: (t: RoadmapTab) => void;
  /** Whether Roadmap › Reference › Changes is open. */
  openChanges: boolean; setOpenChanges: (v: boolean) => void;
  /** Thin wrapper over sonner's toast so callers stay unchanged. */
  toast: (msg: string) => void;
}
export const UICtx = createContext<UI | null>(null);
export const useUI = () => { const c = useContext(UICtx); if (!c) throw new Error('UI missing'); return c; };

export const catColor = (c: string) => `var(--c-${c})`;
