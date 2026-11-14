'use client';
/* Markdown note body: Write/Read toggle, Tab indents, Enter continues lists, saves 300 ms after typing (and on close).
   `compact`: body only (task peek, note sheet). Otherwise a full document for the Notes page: breadcrumb, save status,
   title (editable for pages), ⋯ Delete page. Mount with `key` per note. */
import { useCallback, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useStore, type State } from '@/lib/store';
import { domainOf } from '@/lib/interview-feed';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Seg } from './shell/page';
import type { NoteTarget } from './ui-state';

export const ago = (ts: number) => { const m = Math.round((Date.now() - ts) / 6e4); return m < 1 ? 'just now' : m < 60 ? `${m} min ago` : m < 1440 ? `${Math.round(m / 60)} h ago` : `${Math.round(m / 1440)} d ago`; };

const bodyOf = (s: State, t: NoteTarget) => (t.kind === 'task' ? s.tnotes[t.key]?.body : s.pages[t.id]?.body) || '';
const titleOf = (s: State, t: NoteTarget) => (t.kind === 'task' ? t.title : s.pages[t.id]?.title || 'Untitled');

/** Writes a note body into state. Task notes with an empty body are removed.
 *  Never re-creates a note whose owner is gone: an own task (`u-<id>`) that was deleted, or a deleted page. */
const write = (s: State, t: NoteTarget, body: string): State => {
  if (t.kind === 'task') {
    if (t.key.startsWith('u-') && !s.custom[t.key.slice(2)]) return s;
    const tn = { ...s.tnotes };
    if (body.trim()) tn[t.key] = { title: t.title, ...(t.url ? { url: t.url } : {}), body, upd: Date.now() }; else delete tn[t.key];
    return { ...s, tnotes: tn };
  }
  const p = s.pages[t.id];
  if (!p) return s;
  return { ...s, pages: { ...s.pages, [t.id]: { ...p, body, upd: Date.now() } } };
};

const iconBtn = 'inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 [&_svg]:size-4';

export function NoteEditor({ target, compact, className, onBack, onDeleted, focusTitle }: {
  target: NoteTarget;
  /** Body only (the host shows its own title). */ compact?: boolean;
  className?: string;
  /** Makes the "Notes" crumb a button (phones: back to the list). */ onBack?: () => void;
  /** Called after the page is deleted. */ onDeleted?: () => void;
  /** Focus and select the page title on mount (a new page). */ focusTitle?: boolean;
}) {
  const { state, update } = useStore();
  const [body, setBody] = useState(() => bodyOf(state, target));
  const [mode, setMode] = useState<'write' | 'read'>(() => (bodyOf(state, target).trim() ? 'read' : 'write'));
  const [, tick] = useState(0);
  const ta = useRef<HTMLTextAreaElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<string | null>(null);
  const targetRef = useRef(target);
  targetRef.current = target;

  const flush = useCallback(() => {
    if (timer.current) { clearTimeout(timer.current); timer.current = null; }
    if (pending.current === null) return;
    const b = pending.current; pending.current = null;
    update(s => write(s, targetRef.current, b));
  }, [update]);
  const save = (b: string) => { pending.current = b; if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(flush, 300); };
  // Save whatever is still waiting when the editor closes.
  useEffect(() => flush, [flush]);
  useEffect(() => { const t = setInterval(() => tick(n => n + 1), 30_000); return () => clearInterval(t); }, []);

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const t = e.currentTarget;
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setMode('read'); return; }
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

  const page = target.kind === 'page' ? state.pages[target.id] : undefined;
  const upd = target.kind === 'task' ? state.tnotes[target.key]?.upd : page?.upd;
  const status = pending.current !== null ? 'Saving…' : upd && (body.trim() || page) ? `Saved · ${ago(upd)}` : 'Saves automatically';

  const titleRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (focusTitle) { titleRef.current?.focus(); titleRef.current?.select(); } }, [focusTitle]);
  const setTitle = (v: string) => {
    if (target.kind !== 'page') return;
    const id = target.id;
    update(s => { const p = s.pages[id]; return p ? { ...s, pages: { ...s.pages, [id]: { ...p, title: v, upd: Date.now() } } } : s; });
  };
  const removePage = () => {
    if (target.kind !== 'page') return;
    const id = target.id;
    flush(); // keep the last keystrokes, so Undo brings back exactly what was there
    let snap: State['pages'][string] | undefined;
    update(s => { snap = s.pages[id]; if (!snap) return s; const p = { ...s.pages }; delete p[id]; return { ...s, pages: p }; });
    onDeleted?.();
    toast('Page deleted', { action: { label: 'Undo', onClick: () => update(s => (snap && !s.pages[id] ? { ...s, pages: { ...s.pages, [id]: snap } } : s)) } });
  };

  const seg = (
    <Seg value={mode} onChange={m => { setMode(m); if (m === 'write') setTimeout(() => ta.current?.focus(), 0); }}
      options={[{ value: 'write', label: 'Write' }, { value: 'read', label: 'Read' }]} />
  );
  const statusEl = <span className="ml-auto shrink-0 text-[12px] text-faint tabular-nums" data-note-status>{status}</span>;
  const editor = (
    <>
      {mode === 'write' ? (
        <textarea ref={ta} value={body} onChange={e => { setBody(e.target.value); save(e.target.value); }} onKeyDown={onKey} onBlur={flush} spellCheck aria-label="Note"
          placeholder={'Write a note…\n\n# Heading   - bullet   - [ ] todo   **bold**   `code`'}
          className="min-h-48 flex-1 resize-none rounded-md border border-input bg-card p-3 font-mono text-[13px] leading-relaxed text-foreground outline-none placeholder:text-faint focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30" />
      ) : (
        <div className="md min-h-48 flex-1 overflow-auto rounded-md border border-border p-3 text-[14px]">
          {body.trim() ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
              a: ({ ...p }) => <a {...p} target="_blank" rel="noopener noreferrer" />,
              li: ({ node, ...p }) => <li {...p} data-line={node?.position?.start.line} />,
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              input: ({ node, ...p }) => p.type === 'checkbox'
                ? <input type="checkbox" checked={!!p.checked} onChange={e => { const l = (e.currentTarget.closest('li') as HTMLElement | null)?.dataset.line; if (l) toggleLine(+l); }} />
                : <input {...p} />,
            }}>{body}</ReactMarkdown>
          ) : <p className="text-muted-foreground">Nothing here yet. Switch to Write.</p>}
        </div>
      )}
      <p className="text-[12px] text-faint">Markdown · Tab indents · ⌘/Ctrl+Enter to read</p>
    </>
  );

  if (compact) return (
    <div className={cn('flex min-h-0 flex-col gap-2', className)} data-note-editor>
      <div className="flex items-center gap-2">{seg}{statusEl}</div>
      {editor}
    </div>
  );

  const title = titleOf(state, target);
  return (
    <div className={cn('flex min-h-0 flex-col', className)} data-note-editor>
      <div className="flex h-12 shrink-0 items-center gap-2 border-b border-border pr-2 pl-4">
        <p className="flex min-w-0 flex-1 items-center gap-1.5 text-[13px] text-muted-foreground" data-note-crumb>
          {onBack
            ? <button type="button" onClick={onBack} className="shrink-0 rounded-[5px] outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40">Notes</button>
            : <span className="shrink-0">Notes</span>}
          <span aria-hidden="true">›</span>
          <span className="truncate text-foreground">{title}</span>
        </p>
        {statusEl}
        {target.kind === 'page' && (
          <DropdownMenu>
            <DropdownMenuTrigger className={iconBtn} aria-label="More actions"><MoreHorizontal /></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-40 rounded-[12px]">
              <DropdownMenuItem onSelect={removePage}><Trash2 />Delete page</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-4 md:px-6 md:py-5">
        {target.kind === 'page' ? (
          <input ref={titleRef} value={page?.title ?? ''} onChange={e => setTitle(e.target.value)} onBlur={e => { if (!e.target.value.trim()) setTitle('Untitled'); }}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); setMode('write'); setTimeout(() => ta.current?.focus(), 0); } }}
            placeholder="Untitled" aria-label="Page title"
            className="-mx-1 w-full min-w-0 rounded-[5px] border border-transparent bg-transparent px-1 text-[20px] leading-8 font-semibold text-foreground outline-none placeholder:text-faint hover:border-input focus-visible:border-ring" />
        ) : (
          <div className="flex min-w-0 flex-col gap-1">
            <h2 className="text-[18px] leading-7 font-semibold break-words text-foreground">{target.title}</h2>
            {target.url && (
              <a href={target.url} target="_blank" rel="noopener noreferrer" className="inline-flex w-fit items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground visited:text-faint">
                {domainOf(target.url)} <span aria-hidden="true">↗</span><span className="sr-only">(opens in a new tab)</span>
              </a>
            )}
          </div>
        )}
        <div className="flex items-center gap-2">{seg}</div>
        {editor}
      </div>
    </div>
  );
}
