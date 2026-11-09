'use client';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useStore } from '@/lib/store';
import { useUI } from './ui-state';

const strip = (b: string) => b.replace(/[#*`>\[\]|-]/g, ' ').replace(/\s+/g, ' ').trim();
const ago = (ts: number) => { const m = Math.round((Date.now() - ts) / 6e4); return m < 1 ? 'just now' : m < 60 ? `${m} min ago` : m < 1440 ? `${Math.round(m / 60)} h ago` : `${Math.round(m / 1440)} d ago`; };

export function NotesView() {
  const { state, update } = useStore();
  const { openNote } = useUI();
  const [q, setQ] = useState('');
  const match = (title: string, body: string) => !q || `${title} ${body}`.toLowerCase().includes(q.toLowerCase());
  const pages = Object.entries(state.pages).filter(([, p]) => match(p.title, p.body)).sort((a, b) => b[1].upd - a[1].upd);
  const tn = Object.entries(state.tnotes).filter(([, n]) => n.body.trim() && match(n.title, n.body)).sort((a, b) => b[1].upd - a[1].upd);
  const newPage = () => { const id = 'pg' + Date.now(); update(s => ({ ...s, pages: { ...s.pages, [id]: { title: 'Untitled', body: '', upd: Date.now() } } })); openNote({ kind: 'page', id }); };

  return (
    <div className="pb-16">
      <div className="pt-6 pb-4">
        <p className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">Synced to your private Gist when connected</p>
        <h1 className="mt-1.5 font-display text-3xl font-bold tracking-tight sm:text-4xl">Notes</h1>
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        <Input type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="Search all notes" className="min-w-[200px] flex-1 bg-card" />
        <Button onClick={newPage}><Plus />New page</Button>
      </div>
      <h3 className="mb-2 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pages</h3>
      <div className="mb-6 grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-2.5">
        {pages.map(([id, p]) => (
          <button key={id} onClick={() => openNote({ kind: 'page', id })} className="flex min-w-0 flex-col gap-1 rounded-xl border bg-card p-3.5 text-left hover:border-muted-foreground">
            <b className="font-display">{p.title || 'Untitled'}</b>
            <span className="line-clamp-2 text-[13px] text-muted-foreground">{strip(p.body).slice(0, 120) || 'Empty'}</span>
          </button>
        ))}
        {!pages.length && <p className="text-muted-foreground">No pages match.</p>}
      </div>
      <h3 className="mb-2 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">Task notes · {tn.length}</h3>
      {tn.length ? (
        <Card className="gap-0 divide-y p-0">
          {tn.map(([k, n]) => (
            <button key={k} onClick={() => openNote({ kind: 'task', key: k, title: n.title, url: n.url })} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-0.5 px-4 py-2.5 text-left">
              <span className="truncate font-medium">{n.title}</span><span className="font-mono text-xs text-muted-foreground">{ago(n.upd)}</span>
              <span className="col-span-2 truncate text-[13px] text-muted-foreground">{strip(n.body).slice(0, 140)}</span>
            </button>
          ))}
        </Card>
      ) : <p className="text-muted-foreground">Click the note icon next to any task to write notes for it. Problem notes follow the problem, so revision days show the same note.</p>}
    </div>
  );
}
