'use client';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ExternalLink, Trash2 } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import type { NoteTarget } from './ui-state';

export function NoteSheet({ target, onClose }: { target: NoteTarget | null; onClose: () => void }) {
  const { state, update } = useStore();
  const [mode, setMode] = useState<'write' | 'preview'>('write');
  const [body, setBody] = useState('');
  const [title, setTitle] = useState('');
  const [armed, setArmed] = useState(false);
  const ta = useRef<HTMLTextAreaElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!target) return;
    const b = target.kind === 'task' ? state.tnotes[target.key]?.body || '' : state.pages[target.id]?.body || '';
    setBody(b); setTitle(target.kind === 'task' ? target.title : state.pages[target.id]?.title || 'Untitled');
    setMode(b.trim() ? 'preview' : 'write'); setArmed(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  const save = (nextBody: string, nextTitle = title) => {
    if (!target) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => update(s => {
      if (target.kind === 'task') {
        const tn = { ...s.tnotes };
        if (nextBody.trim()) tn[target.key] = { title: target.title, url: target.url, body: nextBody, upd: Date.now() }; else delete tn[target.key];
        return { ...s, tnotes: tn };
      }
      return { ...s, pages: { ...s.pages, [target.id]: { title: nextTitle.trim() || 'Untitled', body: nextBody, upd: Date.now() } } };
    }), 300);
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const t = e.currentTarget;
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setMode('preview'); return; }
    if (e.key === 'Tab') { e.preventDefault(); t.setRangeText('  ', t.selectionStart, t.selectionEnd, 'end'); setBody(t.value); save(t.value); return; }
    if (e.key === 'Enter') { // continue lists like Notion
      const s = t.selectionStart, line = t.value.slice(t.value.lastIndexOf('\n', s - 1) + 1, s);
      const m = line.match(/^(\s*)(- \[[ x]\] |- |\* |(\d+)\. )/);
      if (!m) return;
      e.preventDefault();
      if (line.trim() === m[2].trim()) t.setRangeText('', s - line.length, s, 'end');
      else t.setRangeText('\n' + m[1] + (m[3] ? `${+m[3] + 1}. ` : m[2].replace('[x]', '[ ]')), s, t.selectionEnd, 'end');
      setBody(t.value); save(t.value);
    }
  };

  const toggleLine = (line: number) => {
    const lines = body.split('\n'); const i = line - 1;
    if (lines[i] === undefined) return;
    lines[i] = lines[i].replace(/\[( |x)\]/, (_, c) => (c === 'x' ? '[ ]' : '[x]'));
    const nb = lines.join('\n'); setBody(nb); save(nb);
  };

  const remove = () => {
    if (!target || target.kind !== 'page') return;
    if (!armed) { setArmed(true); setTimeout(() => setArmed(false), 3000); return; }
    update(s => { const p = { ...s.pages }; delete p[target.id]; return { ...s, pages: p }; });
    onClose();
  };

  return (
    <Sheet open={!!target} onOpenChange={o => { if (!o) { if (timer.current) { clearTimeout(timer.current); } save(body); onClose(); } }}>
      <SheetContent className="flex w-full flex-col gap-3 p-5 sm:max-w-xl" onOpenAutoFocus={e => { if (body.trim()) e.preventDefault(); }}>
        <SheetHeader className="p-0">
          {target?.kind === 'page' ? (
            <SheetTitle asChild>
              <input value={title} onChange={e => { setTitle(e.target.value); save(body, e.target.value); }} className="w-full border-b border-dashed bg-transparent pr-8 font-display text-xl font-bold outline-none" aria-label="Page title" />
            </SheetTitle>
          ) : <SheetTitle className="pr-8 font-display text-xl leading-snug">{title}</SheetTitle>}
          <SheetDescription className="sr-only">Notes, saved automatically</SheetDescription>
        </SheetHeader>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border p-0.5">
            {(['write', 'preview'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); if (m === 'write') setTimeout(() => ta.current?.focus(), 0); }} aria-pressed={mode === m} className="rounded-md px-3 py-1 text-sm capitalize aria-pressed:bg-foreground aria-pressed:text-background">{m}</button>
            ))}
          </div>
          {target?.kind === 'task' && target.url && <a href={target.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-mono text-xs text-primary">open resource <ExternalLink className="size-3" /></a>}
          <span className="flex-1" />
          {target?.kind === 'page' && <Button variant="ghost" size="sm" onClick={remove} className="text-bad"><Trash2 className="size-4" />{armed ? 'Click again to delete' : 'Delete page'}</Button>}
        </div>
        {mode === 'write' ? (
          <textarea ref={ta} value={body} onChange={e => { setBody(e.target.value); save(e.target.value); }} onKeyDown={onKey} spellCheck
            placeholder={'Start typing…\n\n# Heading   - bullet   - [ ] todo   **bold**   `code`\n```js\ncode block\n```'}
            className="min-h-0 flex-1 resize-none rounded-lg border bg-background p-3.5 font-mono text-[14px] leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-ring" />
        ) : (
          <div className="md min-h-0 flex-1 overflow-auto">
            {body.trim() ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                a: ({ ...p }) => <a {...p} target="_blank" rel="noopener noreferrer" />,
                li: ({ node, ...p }) => <li {...p} data-line={node?.position?.start.line} />,
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                input: ({ node, ...p }) => p.type === 'checkbox'
                  ? <input type="checkbox" checked={!!p.checked} onChange={e => { const l = (e.currentTarget.closest('li') as HTMLElement | null)?.dataset.line; if (l) toggleLine(+l); }} />
                  : <input {...p} />,
              }}>{body}</ReactMarkdown>
            ) : <p className="italic text-muted-foreground">Nothing here yet. Switch to Write.</p>}
          </div>
        )}
        <p className="flex flex-wrap justify-between gap-2 text-xs text-muted-foreground"><span>Saves automatically</span><span>Markdown · ⌘/Ctrl+Enter to preview</span></p>
      </SheetContent>
    </Sheet>
  );
}
