'use client';
/* Side sheet for Notes pages (and for notes opened from Notes or Saved, until Notes gets its own pane).
   Task notes opened from Today go to the task peek instead. */
import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import { domainOf } from '@/lib/interview-feed';
import { NoteEditor } from './note-editor';
import type { NoteTarget } from './ui-state';

export function NoteSheet({ target, onClose }: { target: NoteTarget | null; onClose: () => void }) {
  const { state, update } = useStore();
  const [armed, setArmed] = useState(false);
  useEffect(() => { setArmed(false); }, [target]);
  const page = target?.kind === 'page' ? state.pages[target.id] : undefined;

  const setTitle = (v: string) => {
    if (target?.kind !== 'page') return;
    update(s => { const p = s.pages[target.id]; return p ? { ...s, pages: { ...s.pages, [target.id]: { ...p, title: v, upd: Date.now() } } } : s; });
  };
  const remove = () => {
    if (target?.kind !== 'page') return;
    if (!armed) { setArmed(true); setTimeout(() => setArmed(false), 3000); return; }
    update(s => { const p = { ...s.pages }; delete p[target.id]; return { ...s, pages: p }; });
    onClose();
  };

  return (
    <Sheet open={!!target} onOpenChange={o => { if (!o) onClose(); }}>
      <SheetContent className="flex w-full flex-col gap-3 bg-card p-5 sm:max-w-xl"
        onOpenAutoFocus={e => { const b = target?.kind === 'task' ? state.tnotes[target.key]?.body : page?.body; if (b?.trim()) e.preventDefault(); }}>
        <SheetHeader className="p-0">
          {target?.kind === 'page' ? (
            <SheetTitle asChild>
              <input value={page?.title ?? ''} onChange={e => setTitle(e.target.value)} onBlur={e => { if (!e.target.value.trim()) setTitle('Untitled'); }}
                className="w-full bg-transparent pr-8 text-[20px] font-semibold outline-none" aria-label="Page title" />
            </SheetTitle>
          ) : <SheetTitle className="pr-8 text-[18px] leading-snug font-semibold">{target?.title}</SheetTitle>}
          <SheetDescription className="sr-only">Notes, saved automatically</SheetDescription>
        </SheetHeader>
        {(target?.kind === 'task' && target.url) || target?.kind === 'page' ? (
          <div className="flex flex-wrap items-center gap-2">
            {target.kind === 'task' && target.url && (
              <a href={target.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground visited:text-faint">
                {domainOf(target.url)} <span aria-hidden="true">↗</span><span className="sr-only">(opens in a new tab)</span>
              </a>
            )}
            <span className="flex-1" />
            {target.kind === 'page' && <Button variant="ghost" size="sm" onClick={remove}><Trash2 className="size-4" />{armed ? 'Click again to delete' : 'Delete page'}</Button>}
          </div>
        ) : null}
        {target && <NoteEditor key={target.kind === 'task' ? `t:${target.key}` : `p:${target.id}`} target={target} compact className="flex-1" />}
      </SheetContent>
    </Sheet>
  );
}
