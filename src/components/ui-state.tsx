'use client';
import { createContext, useContext } from 'react';

export type View = 'today' | 'progress' | 'roadmap' | 'notes' | 'updates' | 'setup';
export type NoteTarget = { kind: 'task'; key: string; title: string; url?: string } | { kind: 'page'; id: string };

interface UI {
  view: View; go: (v: View) => void;
  viewIdx: number; setViewIdx: (i: number) => void; openDay: (i: number) => void;
  openNote: (t: NoteTarget) => void;
  toast: (msg: string) => void;
}
export const UICtx = createContext<UI | null>(null);
export const useUI = () => { const c = useContext(UICtx); if (!c) throw new Error('UI missing'); return c; };

export const catColor = (c: string) => `var(--c-${c})`;
