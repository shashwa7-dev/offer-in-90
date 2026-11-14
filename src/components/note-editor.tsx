'use client';
/* Markdown note body: Write/Read toggle, Tab indents, Enter continues lists, saves 300 ms after typing (and on close).
   Used by the task peek and the note sheet; Notes uses it in its right pane. Mount with `key` per note. */
import { useCallback, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import { useStore, type State } from '@/lib/store';
import { Seg } from './shell/page';
import type { NoteTarget } from './ui-state';

export const ago = (ts: number) => { const m = Math.round((Date.now() - ts) / 6e4); return m < 1 ? 'just now' : m < 60 ? `${m} min ago` : m < 1440 ? `${Math.round(m / 60)} h ago` : `${Math.round(m / 1440)} d ago`; };

const bodyOf = (s: State, t: NoteTarget) => (t.kind === 'task' ? s.tnotes[t.key]?.body : s.pages[t.id]?.body) || '';
const titleOf = (s: State, t: NoteTarget) => (t.kind === 'task' ? t.title : s.pages[t.id]?.title || 'Untitled');

/** Writes a note body into state. Task notes with an empty body are removed. */
const write = (s: State, t: NoteTarget, body: string): State => {
  if (t.kind === 'task') {
    const tn = { ...s.tnotes };
    if (body.trim()) tn[t.key] = { title: t.title, ...(t.url ? { url: t.url } : {}), body, upd: Date.now() }; else delete tn[t.key];
    return { ...s, tnotes: tn };
  }
  const p = s.pages[t.id];
  return { ...s, pages: { ...s.pages, [t.id]: { title: p?.title || 'Untitled', body, upd: Date.now() } } };
};

export function NoteEditor({ target, compact, className }: { target: NoteTarget; /** Hide the breadcrumb (the host shows its own title). */ compact?: boolean; className?: string }) {
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

  const upd = target.kind === 'task' ? state.tnotes[target.key]?.upd : state.pages[target.id]?.upd;
  const status = pending.current !== null ? 'Saving…' : upd && body.trim() ? `Saved · ${ago(upd)}` : 'Saves automatically';

  return (
    <div className={cn('flex min-h-0 flex-col gap-2', className)} data-note-editor>
      {!compact && (
        <p className="truncate text-[13px] text-muted-foreground">{target.kind === 'task' ? 'Task notes' : 'Pages'} <span aria-hidden="true">›</span> <span className="text-foreground">{titleOf(state, target)}</span></p>
      )}
      <div className="flex items-center gap-2">
        <Seg value={mode} onChange={m => { setMode(m); if (m === 'write') setTimeout(() => ta.current?.focus(), 0); }}
          options={[{ value: 'write', label: 'Write' }, { value: 'read', label: 'Read' }]} />
        <span className="ml-auto text-[12px] text-faint tabular-nums">{status}</span>
      </div>
      {mode === 'write' ? (
        <textarea ref={ta} value={body} onChange={e => { setBody(e.target.value); save(e.target.value); }} onKeyDown={onKey} spellCheck aria-label="Note"
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
    </div>
  );
}
