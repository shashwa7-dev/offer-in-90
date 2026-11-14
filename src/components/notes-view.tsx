'use client';
/* Notes: two panes on desktop (list left, document right); on phones the list, then the document full width.
   Pages and task notes (including notes on saved items, `bm-<key>`) all open in the document pane. */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { useIsMobile } from '@/hooks/use-mobile';
import { Band, PageFrame, PageHeader, Row, Surface } from './shell/page';
import { NoteEditor, ago, titleOf } from './note-editor';
import { useUI, type NoteTarget } from './ui-state';

/** One-line preview: markdown marks and links stripped, and a first heading that only repeats the title dropped. */
const strip = (b: string, title = '') => b
  .replace(/^\s*#{1,6}\s+(.*)\n?/, (m, h: string) => (h.trim().toLowerCase() === title.trim().toLowerCase() ? '' : m))
  .replace(/^\s*\|?[\s:|-]*-{3,}[\s:|-]*$/gm, '')
  .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
  .replace(/^\s*(#{1,6}|>|[-*+]( \[[ x]\])?|\d+\.)\s+/gm, '')
  .replace(/[*_`~|#>]/g, '')
  .replace(/\s+/g, ' ').trim();

const keyOf = (t: NoteTarget) => (t.kind === 'page' ? `p:${t.id}` : `t:${t.key}`);

const typing = (el: EventTarget | null) => {
  const t = el as HTMLElement | null;
  return !!t && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName));
};

export function NotesView() {
  const { state, update } = useStore();
  const phone = useIsMobile();
  const [q, setQ] = useState('');
  const [sel, setSel] = useState<NoteTarget | null>(null);
  const [open, setOpen] = useState(false); // phones: the document is showing
  const [fresh, setFresh] = useState<string | null>(null); // a page just created, to focus its title
  const search = useRef<HTMLInputElement>(null);
  const { notesSelect, setNotesSelect } = useUI();

  // A note picked in ⌘K search: select it once (clearing any list filter), then drop the request.
  useEffect(() => {
    if (!notesSelect) return;
    setQ(''); setSel(notesSelect); setOpen(true); setFresh(null); setNotesSelect(null);
  }, [notesSelect, setNotesSelect]);

  const match = (title: string, body: string) => !q || `${title} ${body}`.toLowerCase().includes(q.toLowerCase());
  const allPages = useMemo(() => Object.entries(state.pages).sort((a, b) => b[1].upd - a[1].upd), [state.pages]);
  const pages = allPages.filter(([, p]) => match(p.title, p.body));
  const tn = Object.entries(state.tnotes).filter(([, n]) => n.body.trim() && match(n.title, n.body)).sort((a, b) => b[1].upd - a[1].upd);

  // The selected note; a deleted page falls back to the most recently updated one.
  // A task note keeps its target even when its body is cleared (the entry is removed then).
  const active: NoteTarget | null = sel && (sel.kind === 'task' || state.pages[sel.id]) ? sel : allPages[0] ? { kind: 'page', id: allPages[0][0] } : null;
  const activeKey = active ? keyOf(active) : '';

  const pick = (t: NoteTarget) => { setSel(t); setOpen(true); setFresh(null); };
  const newPage = () => {
    const id = 'pg' + Date.now();
    setQ(''); // the new page must be visible in the list
    update(s => ({ ...s, pages: { ...s.pages, [id]: { title: 'Untitled', body: '', upd: Date.now() } } }));
    setSel({ kind: 'page', id }); setOpen(true); setFresh(id);
  };
  const back = () => setOpen(false);

  // "/" focuses search when not typing somewhere else.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey || typing(e.target)) return;
      if (document.querySelector('[role="dialog"], [role="alertdialog"], [role="menu"]')) return;
      e.preventDefault();
      setOpen(false);
      setTimeout(() => { search.current?.focus(); search.current?.select(); }, 0);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const showDoc = phone ? open && !!active : !!active;
  const showList = !phone || !open;

  const row = (t: NoteTarget, title: string, body: string, upd: number) => {
    const on = !phone && keyOf(t) === activeKey;
    return (
      <Row key={keyOf(t)} onClick={() => pick(t)} tone={on ? 'now' : undefined} aria-current={on || undefined} data-note-row
        className={cn('items-start gap-0 py-2', on && 'bg-hover')}>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="min-w-0 flex-1 truncate font-medium">{title || 'Untitled'}</span>
            <span className="shrink-0 text-[12px] text-faint tabular-nums">{ago(upd)}</span>
          </div>
          <p className="truncate text-[12px] text-muted-foreground">{strip(body, title).slice(0, 160) || 'Empty'}</p>
        </div>
      </Row>
    );
  };

  const list = (
    <div className="flex min-h-0 flex-col md:border-r md:border-border" data-notes-list>
      <div className="shrink-0 border-b border-border p-2">
        <label className="relative block">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-faint" aria-hidden="true" />
          <input ref={search} type="search" value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => { if (e.key === 'Escape') e.currentTarget.blur(); }}
            placeholder="Search notes" aria-label="Search notes" data-notes-search
            className="h-8 w-full min-w-0 rounded-md border border-input bg-card pr-8 pl-8 text-[13px] text-foreground outline-none placeholder:text-faint focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30" />
          <kbd className="pointer-events-none absolute top-1/2 right-2 hidden -translate-y-1/2 rounded-[4px] border border-border px-1 text-[11px] text-faint md:block">/</kbd>
        </label>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <Band title="Pages" count={`· ${pages.length}`}
          right={<button type="button" onClick={newPage} className="inline-flex h-6 items-center gap-1 rounded-[5px] px-1.5 text-[12px] text-muted-foreground outline-none hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40"><Plus className="size-3.5" />New page</button>}>
          {pages.map(([id, p]) => row({ kind: 'page', id }, p.title, p.body, p.upd))}
          {!pages.length && <p className="px-4 py-3 text-[13px] text-muted-foreground">{q ? 'No pages match.' : 'No pages yet.'}</p>}
        </Band>
        <Band title="Task notes" count={`· ${tn.length}`}>
          {tn.map(([k, n]) => row({ kind: 'task', key: k, title: n.title, url: n.url }, n.title, n.body, n.upd))}
          {!tn.length && (
            <p className="px-4 py-3 text-[13px] text-muted-foreground">
              {q ? 'No task notes match.' : 'Open a task and write in its note. Problem notes follow the problem, so revision days show the same note.'}
            </p>
          )}
        </Band>
      </div>
    </div>
  );

  return (
    <PageFrame header={showList || !active
      ? <PageHeader crumbs={['Notes']} count={`${allPages.length + Object.values(state.tnotes).filter(n => n.body.trim()).length}`} />
      : <PageHeader crumbs={[{ label: 'Notes', onClick: back }, titleOf(state, active)]} />}>
      {/* Two panes fill the window below the header: 100svh − 48px header − 12px gap − 24px bottom padding.
          Phones (document open): also less the 44px header and the 56px bottom bar plus safe areas. */}
      <Surface className={cn('md:grid md:h-[calc(100svh-84px)] md:min-h-[480px] md:grid-cols-[280px_minmax(0,1fr)]', !showList && 'min-h-[calc(100svh-136px-env(safe-area-inset-top)-env(safe-area-inset-bottom))]')}>
        {showList && list}
        {showDoc && active && (
          <NoteEditor key={keyOf(active)} target={active} className="h-full"
            onBack={phone ? back : undefined}
            onDeleted={() => { setSel(null); setOpen(false); }}
            focusTitle={active.kind === 'page' && fresh === active.id} />
        )}
        {!phone && !active && <p className="p-6 text-[13px] text-muted-foreground">Create a page to start writing.</p>}
      </Surface>
    </PageFrame>
  );
}
