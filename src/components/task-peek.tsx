'use client';
/* Plane-style side peek for one task: status, title, properties, note. Only the user's own tasks can be edited or deleted. */
import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, CalendarDays, Clock, Flag, Gauge, Link2, Maximize2, Minimize2, MoreHorizontal, Newspaper, Trash2, User, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { defaultBlock } from '@/lib/own-tasks';
import { domainOf } from '@/lib/interview-feed';
import { fmtDate, iso, type Day, type Task } from '@/lib/engine';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Chip } from './shell/page';
import { NoteEditor } from './note-editor';
import { noteKey } from './task-row';
import { StatusControl, statusKey, useTaskStatus } from './status-control';
import { deleteOwn } from './own-task';
import { BlockPick, DayPick, dayLabel } from './task-pickers';
import { newsTabFor, useUI } from './ui-state';

export type PeekTarget = { taskId: string; dayIdx: number };
const DIFF = { E: 'Easy', M: 'Medium', H: 'Hard' } as const;
const iconBtn = 'inline-flex size-7 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 [&_svg]:size-4';
const fieldInput = 'h-7 w-full min-w-0 rounded-[5px] border border-transparent bg-transparent px-2 text-[13px] text-foreground outline-none placeholder:text-faint hover:border-input focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30';

/** The task and its day/block. Looks on the given day first; own tasks may have moved to another day. */
function locate(days: Day[], t: PeekTarget) {
  const order = days[t.dayIdx] ? [days[t.dayIdx], ...days] : days;
  for (const d of order) for (const b of d.blocks) { const task = b.tasks.find(x => x.id === t.taskId); if (task) return { d, b, task }; }
  return null;
}

export function TaskPeek({ target, onClose }: { target: PeekTarget | null; onClose: () => void }) {
  const { days } = useStore();
  const [wide, setWide] = useState(false);
  const hit = target ? locate(days, target) : null;
  // Keep showing the last task while the sheet slides closed, so an empty panel never slides out.
  const last = useRef(hit);
  useEffect(() => { if (hit) last.current = hit; });
  const shown = hit ?? last.current;
  // The task went away (deleted elsewhere, plan restarted): close.
  useEffect(() => { if (target && !hit) onClose(); }, [target, hit, onClose]);
  return (
    <Sheet open={!!hit} onOpenChange={o => { if (!o) onClose(); }}>
      <SheetContent side="right" showCloseButton={false} overlayClassName="bg-black/10"
        onOpenAutoFocus={e => e.preventDefault()}
        className={cn('w-full gap-0 bg-card p-0 sm:inset-y-2 sm:right-2 sm:h-auto sm:rounded-[12px] sm:border sm:border-border sm:shadow-[0_8px_32px_rgba(0,0,0,0.12)]',
          wide ? 'sm:w-[calc(100vw-1rem)] sm:max-w-none' : 'sm:max-w-[54vw] sm:min-w-[480px]')}
        data-peek>
        {shown && <PeekBody key={shown.task.id} d={shown.d} b={shown.b} t={shown.task} wide={wide} setWide={setWide} onClose={onClose} />}
      </SheetContent>
    </Sheet>
  );
}

function PeekBody({ d, b, t, wide, setWide, onClose }: { d: Day; b: Day['blocks'][number]; t: Task; wide: boolean; setWide: (v: boolean) => void; onClose: () => void }) {
  const { state, days, update } = useStore();
  const { go, openDay } = useUI();
  const own = t.own ? state.custom[t.own] : undefined;
  const [st, setStatus] = useTaskStatus(t.id);
  const [menu, setMenu] = useState(false);
  const done = st === 'done', dim = done || st === 'skipped';
  // S / 1-4 work anywhere in the peek except while typing (the status menu handles its own keys).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || document.querySelector('[role="menu"], [role="alertdialog"]')) return;
      statusKey(e, setStatus, () => setMenu(true));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setStatus]);
  const flagged = !!(t.slug && state.flags[t.slug]);
  const title = t.text.replace(/^Re-solve without looking: /, '');
  const [name, setName] = useState(t.text);
  const [link, setLink] = useState(t.url || '');
  useEffect(() => { setName(t.text); }, [t.text]);
  useEffect(() => { setLink(t.url || ''); }, [t.url]);

  const flag = () => update(s => { const f = { ...s.flags }; if (f[t.slug!]) delete f[t.slug!]; else f[t.slug!] = 1; return { ...s, flags: f }; });
  const edit = (fn: (c: NonNullable<typeof own>) => NonNullable<typeof own>) => update(s => { const c = s.custom[t.own!]; return c ? { ...s, custom: { ...s.custom, [t.own!]: fn(c) } } : s; });
  const saveName = () => { const v = name.replace(/\s+/g, ' ').trim(); if (!v) { setName(t.text); return; } if (v !== t.text) edit(c => ({ ...c, text: v })); };
  const saveLink = () => {
    let v = link.trim();
    if (v && !/^https?:\/\//i.test(v)) v = `https://${v}`;
    if (v === (t.url || '')) { setLink(v); return; }
    setLink(v);
    edit(c => { const n = { ...c }; if (v) n.url = v; else delete n.url; return n; });
  };
  const moveTo = (date: string) => {
    const nd = days.find(x => iso(x.date) === date);
    if (!nd) return;
    const keep = nd.blocks.some(x => x.k === b.k && (x.kind === 'study' || x.kind === 'health'));
    edit(c => ({ ...c, date, block: keep ? b.k : defaultBlock(nd.blocks)?.k ?? c.block }));
  };
  const remove = () => { onClose(); deleteOwn(update, state, t.own!); };
  const enterBlur = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } };

  const prop = (icon: React.ReactNode, label: string, value: React.ReactNode) => (
    <div className="grid grid-cols-[112px_minmax(0,1fr)] items-center gap-2 py-0.5 text-[13px]">
      <span className="flex items-center gap-2 text-muted-foreground [&_svg]:size-3.5">{icon}{label}</span>
      <div className="flex min-h-7 min-w-0 items-center">{value}</div>
    </div>
  );
  const readonly = (v: React.ReactNode) => <span className="min-w-0 truncate px-2 text-foreground">{v}</span>;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-12 shrink-0 items-center gap-1 border-b border-border pr-2 pl-4">
        <p className="min-w-0 flex-1 truncate text-[13px] text-muted-foreground" data-peek-crumb>
          {dayLabel(d)} <span aria-hidden="true">›</span> <span className="text-foreground">{b.title}</span>
        </p>
        <button type="button" onClick={() => setWide(!wide)} className={cn(iconBtn, 'hidden sm:inline-flex')} aria-label={wide ? 'Back to side peek' : 'Full width'} title={wide ? 'Back to side peek' : 'Full width'}>
          {wide ? <Minimize2 /> : <Maximize2 />}
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger className={iconBtn} aria-label="More actions"><MoreHorizontal /></DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-40 rounded-[12px]">
            <DropdownMenuItem onSelect={() => { onClose(); openDay(d.i); }}><CalendarDays />Open this day</DropdownMenuItem>
            {t.newsId && <DropdownMenuItem onSelect={() => { onClose(); go('news', { newsTab: newsTabFor(t.newsId) }); }}><Newspaper />Open News</DropdownMenuItem>}
            {t.own && <DropdownMenuItem onSelect={remove}><Trash2 />Delete</DropdownMenuItem>}
          </DropdownMenuContent>
        </DropdownMenu>
        <button type="button" onClick={onClose} className={iconBtn} aria-label="Close"><X /></button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        <div className={cn('mx-auto flex flex-col gap-4', wide && 'max-w-3xl')}>
          <div className="flex items-start gap-3">
            <StatusControl taskId={t.id} label={title} open={menu} onOpenChange={setMenu} showMenu="always" className="mt-1.5" />
            {t.own ? (
              <SheetTitle asChild>
                <input value={name} onChange={e => setName(e.target.value)} onBlur={saveName} onKeyDown={e => { enterBlur(e); if (e.key === 'Escape') { setName(t.text); } }}
                  aria-label="Task title" className={cn('-mx-1 min-w-0 flex-1 rounded-[5px] border border-transparent bg-transparent px-1 text-[18px] leading-7 font-semibold text-foreground outline-none hover:border-input focus-visible:border-ring', dim && 'text-muted-foreground')} />
              </SheetTitle>
            ) : (
              <SheetTitle className={cn('min-w-0 flex-1 text-[18px] leading-7 font-semibold break-words', dim && 'text-muted-foreground')}>{t.text}</SheetTitle>
            )}
          </div>
          <SheetDescription className="sr-only">Task details and note</SheetDescription>
          {!t.own && <p className="-mt-2 text-[13px] text-muted-foreground">Part of the plan. You can tick it, flag it and write notes, but not edit or remove it.</p>}
          {t.outdated && (
            <p className="flex items-start gap-1.5 rounded-md border border-stone-border bg-stone px-3 py-2 text-[13px] text-stone-foreground"><AlertTriangle className="mt-0.5 size-3.5 shrink-0" />{t.outdated.kind === 'outdated' ? 'Outdated' : 'Changed'}: {t.outdated.why}{t.outdated.replacementUrl ? ' Link updated.' : ''}</p>
          )}

          <div className="flex flex-col">
            {prop(<CalendarDays />, 'Day', own ? <DayPick value={own.date} onChange={moveTo} className="border-transparent text-[13px]" /> : readonly(`${dayLabel(d)} · ${fmtDate(d.date)}`))}
            {prop(<Clock />, 'Block', own ? <BlockPick day={d} value={b.k} onChange={k => edit(c => ({ ...c, block: k }))} className="border-transparent text-[13px]" /> : readonly(<><span className="tabular-nums">{b.s}</span> {b.title}</>))}
            {prop(<Link2 />, 'Link', own ? (
              <input value={link} onChange={e => setLink(e.target.value)} onBlur={saveLink} onKeyDown={enterBlur} placeholder="Paste a link" aria-label="Link" className={fieldInput} />
            ) : t.url ? (
              <a href={t.url} target="_blank" rel="noopener noreferrer" className="flex min-w-0 items-center gap-1 rounded-[5px] px-2 py-1 text-foreground hover:bg-hover visited:text-muted-foreground">
                <span className="truncate">{domainOf(t.url)}</span><span aria-hidden="true">↗</span><span className="sr-only">(opens in a new tab)</span>
              </a>
            ) : readonly(<span className="text-faint">None</span>))}
            {own?.url && link === own.url && (
              <div className="grid grid-cols-[112px_minmax(0,1fr)] gap-2 text-[13px]"><span />
                <a href={own.url} target="_blank" rel="noopener noreferrer" className="flex min-w-0 items-center gap-1 rounded-[5px] px-2 py-1 text-muted-foreground hover:bg-hover hover:text-foreground visited:text-faint">
                  <span className="truncate">Open {domainOf(own.url)}</span><span aria-hidden="true">↗</span><span className="sr-only">(opens in a new tab)</span>
                </a>
              </div>
            )}
            {t.diff && prop(<Gauge />, 'Difficulty', <Chip className="ml-2">{DIFF[t.diff]}</Chip>)}
            {t.slug && prop(<Flag />, 'Flag', (
              <button type="button" onClick={flag} aria-pressed={flagged} title="Flag to re-solve on Sunday"
                className={cn('inline-flex h-7 items-center gap-1.5 rounded-[5px] px-2 text-[13px] outline-none hover:bg-hover focus-visible:ring-2 focus-visible:ring-ring/40', flagged ? 'text-foreground' : 'text-muted-foreground')}>
                <Flag className={cn('size-3.5', flagged && 'fill-current')} />{flagged ? 'Flagged to re-solve' : 'Not flagged'}
              </button>
            ))}
            {own && prop(<User />, 'Added', readonly(`Added by You · ${new Date(own.at).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`))}
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="mb-2 text-[13px] font-medium text-foreground">Note</h3>
            <NoteEditor key={noteKey(t)} target={{ kind: 'task', key: noteKey(t), title, url: t.url }} compact />
          </div>
        </div>
      </div>
    </div>
  );
}
