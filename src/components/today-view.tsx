'use client';
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronRight as Chev, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { TOTAL, dayStats, dayTitle, fmtDate, hrs, overall, parseISO, phaseName, study, toMin } from '@/lib/engine';
import { TaskRow } from './task-row';
import { catColor, useUI } from './ui-state';

export function TodayView() {
  const { state, days, todayIdx, update, updates } = useStore();
  const { viewIdx, setViewIdx, go } = useUI();
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [showCatch, setShowCatch] = useState(false);
  const [nm, setNm] = useState(() => { const n = new Date(); return n.getHours() * 60 + n.getMinutes(); });
  useEffect(() => { const t = setInterval(() => { const n = new Date(); setNm(n.getHours() * 60 + n.getMinutes()); }, 30_000); return () => clearInterval(t); }, []);

  const d = days[viewIdx];
  if (!d) return null;
  const isToday = viewIdx === todayIdx;
  const st = dayStats(d, state.done), o = overall(days, state.done, todayIdx);
  const cur = isToday ? d.blocks.find(b => nm >= toMin(b.s) && nm < toMin(b.e)) : undefined;
  const next = isToday ? d.blocks.find(b => toMin(b.s) > nm) : undefined;
  const leftToday = d.tasks.filter(t => study(t) && !state.done[t.id]).reduce((a, t) => a + t.min, 0);
  const overdue = days.filter(x => x.i < todayIdx).flatMap(x => x.tasks.filter(t => study(t) && !state.done[t.id] && !t.log).map(t => ({ t, day: x })));
  const unseen = updates.filter(u => !state.seenUpdates[u.id] && u.priority !== 'fyi').length;
  const firstOpen = isToday ? (cur?.tasks.length ? cur.k : next?.k) : d.blocks.find(b => b.tasks.some(t => !state.done[t.id]))?.k;
  const clamp = (i: number) => Math.max(0, Math.min(TOTAL - 1, i));

  return (
    <div className="pb-16">
      <div className="flex flex-wrap items-end justify-between gap-4 pt-6 pb-4">
        <div className="min-w-0">
          <p className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">Day {d.i + 1} of {TOTAL} · {fmtDate(d.date)}{isToday ? ' · today' : ''} · {phaseName(d.phase)}</p>
          <h1 className="mt-1.5 text-balance font-display text-3xl font-bold tracking-tight sm:text-4xl">{dayTitle(d)}</h1>
        </div>
        <div className="flex gap-1.5">
          <Button variant="outline" size="icon" onClick={() => setViewIdx(clamp(viewIdx - 1))} aria-label="Previous day"><ChevronLeft /></Button>
          <Button variant="outline" onClick={() => setViewIdx(clamp(todayIdx))}>Today</Button>
          <Button variant="outline" size="icon" onClick={() => setViewIdx(clamp(viewIdx + 1))} aria-label="Next day"><ChevronRight /></Button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-4 [&>div]:bg-card [&>div]:p-3.5">
        <Stat k={isToday ? 'Today' : 'This day'} v={`${hrs(st.doneMin)}`} sub={`/ ${hrs(st.planMin)} h`} />
        <Stat k={isToday ? 'Left today' : 'Left this day'} v={`${hrs(leftToday)}`} sub={`h · ${st.total - st.n} tasks`} />
        <Stat k="Plan" v={`${o.daysLeft}`} sub={`days · ${hrs(o.leftAll)} h left`} />
        <Stat k="Status" v={o.status[1]} tone={o.status[0]} />
      </div>

      {unseen > 0 && (
        <button onClick={() => go('updates')} className="mb-4 flex w-full items-center gap-2 rounded-xl border border-c-update/40 bg-card px-4 py-2.5 text-left text-sm">
          <Sparkles className="size-4 text-c-update" /><span><b>{unseen} new update{unseen > 1 ? 's' : ''}</b> from the weekly engine: outdated resources and new must-reads.</span><span className="ml-auto font-medium text-primary">Review</span>
        </button>
      )}

      {overdue.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-warn/40 bg-card px-4 py-2.5 text-sm">
            <span><b>{overdue.length} missed task{overdue.length > 1 ? 's' : ''}</b> ({hrs(overdue.reduce((a, x) => a + x.t.min, 0))} h). Clear them in Sunday&apos;s catch-up block.</span>
            <Button variant="outline" size="sm" onClick={() => setShowCatch(v => !v)}>{showCatch ? 'Hide' : 'Show'}</Button>
          </div>
          {showCatch && <ul className="mt-2 rounded-xl border bg-card px-4">{overdue.slice(0, 50).map(({ t, day }) => <TaskRow key={t.id} t={t} extra={`day ${day.i + 1}`} />)}</ul>}
        </div>
      )}

      {todayIdx < 0 && viewIdx === 0 && (
        <NowCard clock={`T−${-todayIdx}`} what={`Your plan starts ${fmtDate(parseISO(state.start))}.`} next="Import the calendar reminders and sleep by 22:00." />
      )}
      {isToday && (
        <NowCard clock={new Date().toTimeString().slice(0, 5)} what={cur ? cur.title : nm < toMin(d.blocks[0].s) ? 'Not started yet' : 'Done for today. Sleep well.'} next={next ? `Next at ${next.s}: ${next.title}` : 'Tomorrow at 05:00'} left={cur ? `${toMin(cur.e) - nm} min left in this block` : ''} />
      )}

      <div className="flex flex-col gap-1.5">
        {d.blocks.map(b => {
          if (!b.tasks.length) return <div key={b.k} className="flex gap-3.5 px-3.5 py-1 text-sm text-muted-foreground"><span className="w-[92px] shrink-0 font-mono text-xs leading-5 tnum">{b.s}–{b.e}</span><span>{b.title}</span></div>;
          const key = `${d.i}-${b.k}`, isOpen = open[key] ?? b.k === firstOpen, n = b.tasks.filter(t => state.done[t.id]).length;
          const cat = b.tasks.find(t => t.cat !== 'review' && t.cat !== 'update')?.cat || 'review', isCur = cur?.k === b.k;
          return (
            <div key={b.k} className={cn('rounded-xl border bg-card', isCur && 'border-primary ring-3 ring-accent')}>
              <button onClick={() => setOpen(s => ({ ...s, [key]: !isOpen }))} aria-expanded={isOpen} className="grid w-full grid-cols-[84px_minmax(0,1fr)_auto_16px] items-center gap-3 px-3.5 py-3 text-left">
                <span className="font-mono text-[13px] font-semibold tnum">{b.s}<span className="block text-xs font-normal text-muted-foreground">{b.e}</span></span>
                <span className="min-w-0 font-semibold"><span className="mr-2 inline-block size-2 rounded-full align-middle" style={{ background: catColor(cat) }} />{b.title}</span>
                <span className={cn('font-mono text-xs text-muted-foreground tnum', n === b.tasks.length && 'text-good')}>{n}/{b.tasks.length}</span>
                <Chev className={cn('size-4 text-muted-foreground transition-transform motion-reduce:transition-none', isOpen && 'rotate-90')} />
              </button>
              {isOpen && (
                <div className="px-3.5 pb-3">
                  <ul>{b.tasks.map(t => <TaskRow key={t.id} t={t} />)}</ul>
                  {b.tasks.some(t => t.log) && (
                    <Textarea value={state.notes[d.i] || ''} onChange={e => { const v = e.target.value; update(s => ({ ...s, notes: { ...s.notes, [d.i]: v } })); }} placeholder={d.type === 'sun' ? 'This week: what worked, what to fix?' : 'One line: how did today go?'} className="mt-2 bg-background" />
                  )}
                  {b.k === 'dsa' && d.type === 'study' && (d.s ?? 0) <= 60 && <p className="mt-1.5 text-xs text-muted-foreground">45 min max per problem. Stuck? Read the solution, understand it, flag it, write what you missed in its note.</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ k, v, sub, tone }: { k: string; v: string; sub?: string; tone?: 'ok' | 'behind' | 'late' }) {
  return (
    <div className="min-w-0">
      <div className="font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{k}</div>
      <div className={cn('mt-0.5 truncate font-display text-xl font-bold tnum', tone === 'ok' && 'text-good', tone === 'behind' && 'text-warn', tone === 'late' && 'text-bad')}>{v} {sub && <small className="font-sans text-[13px] font-medium text-muted-foreground">{sub}</small>}</div>
    </div>
  );
}

function NowCard({ clock, what, next, left }: { clock: string; what: string; next: string; left?: string }) {
  return (
    <div className="mb-4 grid gap-1.5 rounded-2xl bg-foreground px-4.5 py-4 text-background sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:gap-4">
      <div className="font-mono text-2xl font-semibold tnum">{clock}</div>
      <div><div className="font-display text-lg font-bold leading-tight">{what}</div><div className="text-sm opacity-70">{next}</div></div>
      {left && <div className="font-mono text-xs opacity-80">{left}</div>}
    </div>
  );
}
