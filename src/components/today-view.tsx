'use client';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { CalendarCheck, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { TRACKS, bandOf } from '@/lib/timeline';
import { STATUS_LABEL, isSkipped, statusOf } from '@/lib/task-status';
import { isActive, matches, statusCounts, trackOfCat, type GroupBy } from '@/lib/task-filter';
import { TOTAL, type Block, type Day, type Task, dayStats, dayTitle, fmtDate, hrs, overall, parseISO, study, toMin } from '@/lib/engine';
import { Band, Chip, PageHeader, Ring, Row, Surface, SummaryRow } from './shell/page';
import { TaskRow } from './task-row';
import { QuickAdd } from './own-task';
import { useUI } from './ui-state';
import { STATUS_ORDER, StatusIcon } from './status-control';
import { DisplayMenu, TodayFilters, useTodayFilter } from './today-filters';

type Status = 'now' | 'done' | 'missed' | 'past' | 'upcoming';
const BANDS = [['morning', 'Morning'], ['afternoon', 'Afternoon'], ['evening', 'Evening']] as const;

export function TodayView() {
  const { state, days, todayIdx, update, updates } = useStore();
  const { viewIdx, setViewIdx, go, newTask, setRoadmapTab, setOpenChanges } = useUI();
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [missedOpen, setMissedOpen] = useState(false);
  const [fv, setFv] = useTodayFilter();
  const setGroupBy = useCallback((g: GroupBy) => setFv({ ...fv, groupBy: g }), [fv, setFv]);
  const [nm, setNm] = useState(() => { const n = new Date(); return n.getHours() * 60 + n.getMinutes(); });
  useEffect(() => { const t = setInterval(() => { const n = new Date(); setNm(n.getHours() * 60 + n.getMinutes()); }, 30_000); return () => clearInterval(t); }, []);

  const d = days[viewIdx];
  if (!d) return null;
  const isToday = viewIdx === todayIdx;
  const st = dayStats(d, state.done, state.status), o = overall(days, state.done, todayIdx, state.status);
  const cur = isToday ? d.blocks.find(b => nm >= toMin(b.s) && nm < toMin(b.e)) : undefined;
  const next = isToday ? d.blocks.find(b => toMin(b.s) > nm) : undefined;
  const resolved = (t: { id: string }) => !!state.done[t.id] || isSkipped(t.id, state.done, state.status);
  const overdue = days.filter(x => x.i < todayIdx).flatMap(x => x.blocks.flatMap(b => b.tasks.filter(t => study(t) && !resolved(t) && !t.log).map(t => ({ t, day: x, bk: b.k }))));
  const unseen = updates.filter(u => !state.seenUpdates[u.id] && u.priority !== 'fyi').length;
  const firstOpen = isToday ? (cur?.tasks.length ? cur.k : next?.k) : d.blocks.find(b => b.tasks.some(t => !resolved(t)))?.k;
  const clamp = (i: number) => Math.max(0, Math.min(days.length - 1, i));
  // Time-based status for each block: the day is in the past, today (compare with the clock), or still ahead.
  const when = viewIdx < todayIdx ? 'past' : viewIdx > todayIdx ? 'future' : 'today';
  const blockStatus = (b: Block): Status => {
    if (when === 'today' && nm >= toMin(b.s) && nm < toMin(b.e)) return 'now';
    if (b.tasks.length && b.tasks.every(resolved)) return b.tasks.some(t => state.done[t.id]) ? 'done' : 'past'; // done or skipped: nothing missed
    const ended = when === 'past' || (when === 'today' && nm >= toMin(b.e));
    return ended ? (b.tasks.length ? 'missed' : 'past') : 'upcoming';
  };
  const pick = cur?.tasks.find(t => !resolved(t));
  const missedHere = d.blocks.filter(b => blockStatus(b) === 'missed').reduce((a, b) => a + b.tasks.filter(t => !resolved(t)).length, 0);

  // Filter bar: counts follow every filter except status; blocks offered are this day's blocks with tasks.
  const { filter, groupBy } = fv;
  const active = isActive(filter);
  const hit = (t: Task, bk: string) => matches(t, bk, filter, state.done, state.status);
  const dayTasks = d.blocks.flatMap(b => b.tasks.map(t => ({ t, b })));
  const counts = statusCounts(dayTasks.filter(x => matches(x.t, x.b.k, { ...filter, status: 'all' }, state.done, state.status)).map(x => x.t), state.done, state.status);
  const blockOpts = d.blocks.filter(b => b.tasks.length).map(b => ({ k: b.k, title: `${b.s} ${b.title}` }));
  const shownOverdue = active ? overdue.filter(x => hit(x.t, x.bk)) : overdue;
  const shownTasks = dayTasks.filter(x => hit(x.t, x.b.k));
  const empty = active && !shownTasks.length && !shownOverdue.length;
  const rowStatus = (t: Task, b: Block) => blockStatus(b) === 'missed' && !resolved(t) ? 'missed' as const : t.id === pick?.id ? 'pick' as const : undefined;
  const groups: { key: string; title: string; icon?: ReactNode; rows: typeof dayTasks }[] = groupBy === 'status'
    ? STATUS_ORDER.map(k => ({ key: `status-${k}`, title: STATUS_LABEL[k], icon: <StatusIcon status={k} size={14} />, rows: shownTasks.filter(x => statusOf(x.t.id, state.done, state.status) === k) }))
    : groupBy === 'track'
      ? [...TRACKS.map(tr => ({ key: `track-${tr.key}`, title: tr.name, rows: shownTasks.filter(x => trackOfCat(x.t.cat) === tr.key) })), { key: 'track-other', title: 'Other', rows: shownTasks.filter(x => !trackOfCat(x.t.cat)) }]
      : [];

  const showMissed = () => {
    setMissedOpen(true);
    requestAnimationFrame(() => document.querySelector('[data-band="missed-earlier"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };
  const items = [
    { k: 'Done', v: `${hrs(st.doneMin)} of ${hrs(st.planMin)} h` },
    ...(isToday ? [{ k: 'Missed', v: `${missedHere} task${missedHere === 1 ? '' : 's'}` }] : []),
    { k: 'Plan', v: o.status[1] },
  ];

  return (
    <div className="pb-16">
      <PageHeader
        crumbs={[{ label: `Week ${d.week}`, phoneHidden: true }, d.no === 0 ? 'Day 0 · prep' : `Day ${d.no} of ${TOTAL}`, fmtDate(d.date)]}
        keepLast
        actions={<>
          <Button variant="outline" size="icon-sm" onClick={() => setViewIdx(clamp(viewIdx - 1))} aria-label="Previous day"><ChevronLeft /></Button>
          <Button variant="outline" size="sm" onClick={() => setViewIdx(clamp(todayIdx))} disabled={isToday} className="hidden sm:inline-flex">Today</Button>
          {!isToday && <Button variant="outline" size="icon-sm" onClick={() => setViewIdx(clamp(todayIdx))} aria-label="Go to today" title="Go to today" data-today-phone className="sm:hidden"><CalendarCheck /></Button>}
          <Button variant="outline" size="icon-sm" onClick={() => setViewIdx(clamp(viewIdx + 1))} aria-label="Next day"><ChevronRight /></Button>
          <DisplayMenu groupBy={groupBy} onChange={setGroupBy} />
          <Button size="sm" onClick={() => newTask()} aria-label="New task" title="New task (C)" className="max-sm:w-8 max-sm:px-0"><Plus /><span className="hidden sm:inline">New task</span></Button>
        </>}
      />

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start lg:gap-6">
      <div data-today-list className="min-w-0">
      <Surface>
        <SummaryRow ring={{ pct: st.planMin ? st.doneMin / st.planMin : 0, label: dayTitle(d) }} items={items} />
        {(unseen > 0 || overdue.length > 0) && (
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 border-t border-border px-4 py-2.5 text-[13px] text-muted-foreground" data-notice>
            {unseen > 0 && <button type="button" onClick={() => { setRoadmapTab('reference'); setOpenChanges(true); go('roadmap'); }} className="rounded-[5px] font-medium text-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50">{unseen} plan update{unseen > 1 ? 's' : ''}</button>}
            {unseen > 0 && overdue.length > 0 && <span aria-hidden="true">·</span>}
            {overdue.length > 0 && <button type="button" onClick={showMissed} className="rounded-[5px] font-medium text-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50">{overdue.length} missed earlier</button>}
            {overdue.length > 0 && <span>· {hrs(overdue.reduce((a, x) => a + x.t.min, 0))} h. Clear them in Sunday&apos;s catch-up block.</span>}
          </div>
        )}
        {todayIdx < 0 && viewIdx === 0 && (
          <div className="border-t border-border px-4 py-2.5 text-[13px] text-muted-foreground">
            Your plan starts {fmtDate(parseISO(state.start))}, in {-todayIdx} day{todayIdx === -1 ? '' : 's'}. Import the calendar reminders and sleep by 22:00.
          </div>
        )}
        <TodayFilters value={fv} onChange={setFv} counts={counts} blocks={blockOpts} />
        <div className="border-t border-border">
          {empty && <p className="px-4 py-6 text-center text-[13px] text-muted-foreground">No tasks match these filters.</p>}
          {shownOverdue.length > 0 && (
            <Band id="missed-earlier" title="Missed earlier" count={shownOverdue.length} open={missedOpen} onOpenChange={setMissedOpen}>
              {shownOverdue.slice(0, 50).map(({ t, day }) => <TaskRow key={t.id} t={t} dayIdx={day.i} extra={`day ${day.no}`} status="missed" />)}
              {shownOverdue.length > 50 && <div className="border-t border-border py-2 pr-4 pl-11 text-[12px] text-faint">{shownOverdue.length - 50} more not shown</div>}
            </Band>
          )}
          {groups.map(g => !!g.rows.length && (
            <Band key={g.key} id={g.key} title={g.title} icon={g.icon} count={g.rows.length}>
              {g.rows.map(({ t, b }) => <TaskRow key={t.id} t={t} dayIdx={d.i} chip={`${b.s} ${b.title}`} status={rowStatus(t, b)} />)}
            </Band>
          ))}
          {groupBy === 'time' && BANDS.map(([key, label]) => {
            // While filtering, only blocks with matching tasks remain (life blocks drop out).
            const blocks = d.blocks.filter(b => bandOf(b.s) === key && (!active || b.tasks.some(t => hit(t, b.k))));
            if (!blocks.length) return null;
            const ss = blocks.map(blockStatus);
            const nMissed = ss.filter(s => s === 'missed').length, hasNow = ss.includes('now');
            const count = [hasNow && '1 now', nMissed && `${nMissed} missed`].filter(Boolean).join(' · ');
            return (
              <Band key={key} id={key} title={label} count={count}>
                {blocks.map((b, j) => (
                  <BlockView key={b.k} d={d} b={b} bs={ss[j]} nm={nm} pickId={pick?.id}
                    shown={active ? b.tasks.filter(t => hit(t, b.k)) : undefined}
                    isOpen={open[`${d.i}-${b.k}`] ?? (active || b.k === firstOpen)}
                    toggle={v => setOpen(s => ({ ...s, [`${d.i}-${b.k}`]: v }))}
                    log={state.notes[d.i] || ''}
                    setLog={v => update(s => ({ ...s, notes: { ...s.notes, [d.i]: v } }))} />
                ))}
              </Band>
            );
          })}
        </div>
      </Surface>
      </div>
      {/* Right column: filled in by the day rail (Task 6); stacks below the list on smaller screens. */}
      <aside data-rail className="min-w-0" />
      </div>
    </div>
  );
}

function BlockView({ d, b, bs, nm, pickId, shown, isOpen, toggle, log, setLog }: { d: Day; b: Block; bs: Status; nm: number; pickId?: string; /** Tasks left by an active filter (all tasks when unset). */ shown?: Task[]; isOpen: boolean; toggle: (v: boolean) => void; log: string; setLog: (v: string) => void }) {
  const { state } = useStore();
  const now = bs === 'now', missed = bs === 'missed';
  // Life blocks (meals, breaks) are thin grey lines.
  if (!b.tasks.length) return (
    <div data-block={b.k} data-now={now || undefined}
      className={cn('flex h-7 items-center gap-3 border-t border-border px-4 text-[12px] text-muted-foreground first:border-t-0', now && 'text-foreground shadow-[inset_2px_0_0_var(--primary)]')}>
      <span className="w-4 shrink-0" aria-hidden="true" />
      <span className="w-10 shrink-0 tabular-nums">{b.s}</span>
      <span className="min-w-0 truncate">{b.title}</span>
      {now && <span className="ml-auto shrink-0 tabular-nums">◷ {toMin(b.e) - nm} min left</span>}
    </div>
  );
  const counted = b.tasks.filter(t => !isSkipped(t.id, state.done, state.status));
  const n = counted.filter(t => state.done[t.id]).length;
  const allSkipped = !counted.length;
  return (
    <>
      <Row onClick={() => toggle(!isOpen)} tone={now ? 'now' : missed ? 'stone' : undefined} aria-expanded={isOpen} className="py-1.5"
        data-block={b.k} data-now={now || undefined} data-missed={missed || undefined}>
        <Ring done={n} total={counted.length} tone={missed ? 'stone' : undefined} />
        <span className={cn('w-10 shrink-0 tabular-nums', missed ? 'text-stone-foreground' : 'text-muted-foreground')}>{b.s}</span>
        <span className={cn('line-clamp-2 min-w-0 flex-1 font-medium leading-[18px] sm:line-clamp-1', (bs === 'done' || allSkipped) && 'text-muted-foreground')}>{b.title}</span>
        {now && <Chip>◷ {toMin(b.e) - nm} min left</Chip>}
        <Chip className={cn(missed && 'border-stone-border bg-stone text-stone-foreground')}>{n}/{counted.length}</Chip>
        <ChevronRight className={cn('hidden size-3.5 shrink-0 text-faint sm:block transition-transform motion-reduce:transition-none', isOpen && 'rotate-90')} aria-hidden="true" />
      </Row>
      {isOpen && <>
        {(shown ?? b.tasks).map(t => <TaskRow key={t.id} t={t} dayIdx={d.i} status={missed && !isSkipped(t.id, state.done, state.status) && !state.done[t.id] ? 'missed' : t.id === pickId ? 'pick' : undefined} />)}
        {!shown && b.k === 'dsa' && d.type === 'study' && (d.s ?? 0) <= 60 && (
          <p className="border-t border-border py-2 pr-4 pl-11 text-[12px] text-muted-foreground">45 min max per problem. Stuck? Read the solution, understand it, flag it, write what you missed in its note.</p>
        )}
        {(shown ?? b.tasks).some(t => t.log) && (
          <div className="border-t border-border py-2.5 pr-4 pl-11">
            <Textarea value={log} onChange={e => setLog(e.target.value)} placeholder={d.type === 'sun' ? 'This week: what worked, what to fix?' : 'One line: how did today go?'} aria-label="Daily log" className="min-h-16 bg-card text-[13px]" />
          </div>
        )}
        {!shown && <QuickAdd day={d} block={b.k} />}
      </>}
    </>
  );
}
