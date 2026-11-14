'use client';
/* Side sheet for a note opened outside Notes (today: notes on saved items in News › Saved, key `bm-<key>`).
   Task notes opened from Today go to the task peek; Notes shows every note in its own right pane. */
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useStore } from '@/lib/store';
import { domainOf } from '@/lib/interview-feed';
import { NoteEditor } from './note-editor';
import type { NoteTarget } from './ui-state';

export function NoteSheet({ target, onClose }: { target: NoteTarget | null; onClose: () => void }) {
  const { state } = useStore();
  const title = target?.kind === 'task' ? target.title : target ? state.pages[target.id]?.title || 'Untitled' : '';
  const body = target?.kind === 'task' ? state.tnotes[target.key]?.body : target ? state.pages[target.id]?.body : '';

  return (
    <Sheet open={!!target} onOpenChange={o => { if (!o) onClose(); }}>
      <SheetContent className="flex w-full flex-col gap-3 bg-card p-5 sm:max-w-xl" onOpenAutoFocus={e => { if (body?.trim()) e.preventDefault(); }}>
        <SheetHeader className="p-0">
          <SheetTitle className="pr-8 text-[18px] leading-snug font-semibold">{title}</SheetTitle>
          <SheetDescription className="sr-only">Notes, saved automatically</SheetDescription>
        </SheetHeader>
        {target?.kind === 'task' && target.url && (
          <a href={target.url} target="_blank" rel="noopener noreferrer" className="inline-flex w-fit items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground visited:text-faint">
            {domainOf(target.url)} <span aria-hidden="true">↗</span><span className="sr-only">(opens in a new tab)</span>
          </a>
        )}
        {target && <NoteEditor key={target.kind === 'task' ? `t:${target.key}` : `p:${target.id}`} target={target} compact className="flex-1" />}
      </SheetContent>
    </Sheet>
  );
}
