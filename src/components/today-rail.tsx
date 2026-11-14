'use client';
/* Today › right column: the viewed day, its week as a Plane-style cycle, tracks this cycle and everything in progress. */
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { cycleOf, type CycleDayInput, type CycleSummary, type CycleUnit } from '@/lib/cycle';
import { statusOf, type TaskStatus } from '@/lib/task-status';
import { type Day, dayStats, hrs, study, toMin } from '@/lib/engine';
import { Seg } from './shell/page';
import { StatusIcon } from './status-control';
import { dateRange } from './roadmap-weeks';
import { useUI } from './ui-state';

/** Engine days as cycle input (own tasks are already merged into d.tasks). `end` is the task's block end, so
    today's later blocks don't count as trailing; own tasks take the end of the block they were added to. */
export const toCycleDays = (days: Day[]): CycleDayInput[] =>
  days.map(d => {
    const endOf = new Map(d.blocks.map(b => [b.k, toMin(b.e)]));
    return { i: d.i, week: d.week, date: d.date, type: d.type, tasks: d.tasks.map(t => ({ id: t.id, cat: t.cat, min: t.min, study: study(t), own: t.own, end: endOf.get(t.bk) })) };
  });
export const useCycleDays = (days: Day[]) => useMemo(() => toCycleDays(days), [days]);

// Bar fills: done ink, in progress grey, skipped a stone hatch over the track, rest the track.
const FILL: Record<TaskStatus, string> = {
  done: 'var(--primary)', progress: 'var(--faint)', todo: 'var(--border)',
  skipped: 'repeating-linear-gradient(135deg, var(--stone-foreground) 0 1px, transparent 1px 3px), var(--border)',
};
const IDEAL = 'color-mix(in srgb, var(--faint) 65%, var(--card))'; // about #b4b7ba
const UNIT_KEY = 'offer90.cycleUnit';
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'}`;
const fmtH = (h: number) => `${Math.round(h * 10) / 10}`;

function useCycleUnit(): [CycleUnit, (u: CycleUnit) => void] {
  const [u, setU] = useState<CycleUnit>(() => { try { return localStorage.getItem(UNIT_KEY) === 'hours' ? 'hours' : 'tasks'; } catch { return 'tasks'; } });
  useEffect(() => { try { localStorage.setItem(UNIT_KEY, u); } catch { /* storage blocked: keep in memory */ } }, [u]);
  return [u, setU];
}

function useMinute() {
  const [nm, setNm] = useState(() => { const n = new Date(); return n.getHours() * 60 + n.getMinutes(); });
  useEffect(() => { const t = setInterval(() => { const n = new Date(); setNm(n.getHours() * 60 + n.getMinutes()); }, 30_000); return () => clearInterval(t); }, []);
  return nm;
}

/** "Trailing by 2 tasks" / "Ahead by 1.5 h" / "On track"; null when the cycle isn't running. */
export function trailingLine(t: number | null, unit: CycleUnit): { text: string; behind: boolean } | null {
  if (t == null) return null;
  if (Math.abs(t) < 0.5) return { text: 'On track', behind: false };
  const n = Math.abs(t);
  const amt = unit === 'hours' ? `${n.toFixed(1)} h` : plural(Math.round(n), 'task');
  return { text: `${t > 0 ? 'Trailing' : 'Ahead'} by ${amt}`, behind: t > 0 };
}

function Card({ id, title, detail, children }: { id: string; title: string; detail?: ReactNode; children: ReactNode }) {
  return (
    <section data-rail-card={id} className="border-t border-border px-4 py-3 first:border-t-0">
      <div className="mb-2.5 flex min-w-0 items-baseline gap-2">
        <h2 data-rail-title className="shrink-0 text-[12px] font-semibold text-foreground">{title}</h2>
        {detail != null && <span className="ml-auto min-w-0 truncate text-[12px] text-faint tabular-nums">{detail}</span>}
      </div>
      {children}
    </section>
  );
}

/** Horizontal stacked bar. */
function Stack({ parts, className }: { parts: [TaskStatus, number][]; className?: string }) {
  const sum = parts.reduce((a, [, n]) => a + n, 0);
  return (
    <div className={cn('flex h-2 w-full gap-px overflow-hidden rounded-full', className)} style={{ background: FILL.todo }} aria-hidden="true">
      {sum > 0 && parts.map(([k, n]) => n > 0 && <span key={k} style={{ width: `${(n / sum) * 100}%`, background: FILL[k] }} className="h-full first:rounded-l-full last:rounded-r-full" />)}
    </div>
  );
}

const Swatch = ({ k }: { k: TaskStatus }) => <span aria-hidden="true" className="size-2 shrink-0 rounded-[2px]" style={{ background: FILL[k] }} />;

export function TodayRail({ day }: { day: Day }) {
  const { state, days, todayIdx } = useStore();
  const input = useCycleDays(days);
  const nm = useMinute(); // trailing compares with what is due by now, so it moves through the day
  const cyc = useMemo(() => cycleOf(input, day.week, state.done, state.status, state.meta, todayIdx, Date.now(), nm), [input, day.week, state.done, state.status, state.meta, todayIdx, nm]);
  return (
    // Lives inside Today's sheet. Between lg and xl it sits below the list at full width: two columns of cards there.
    // Cards align to the top of each row; the column hairline is a full-height 1px background so it doesn't stop at a short card.
    <div className="lg:max-xl:grid lg:max-xl:grid-cols-2 lg:max-xl:items-start lg:max-xl:[&>section:nth-child(2)]:border-t-0 lg:max-xl:bg-[linear-gradient(var(--border),var(--border))] lg:max-xl:bg-[length:1px_100%] lg:max-xl:bg-center lg:max-xl:bg-no-repeat">
      <TodayCard day={day} isToday={day.i === todayIdx} />
      {cyc && <CycleCard cyc={cyc} />}
      {cyc && <TracksCard cyc={cyc} />}
      <ProgressCard />
    </div>
  );
}

function TodayCard({ day, isToday }: { day: Day; isToday: boolean }) {
  const { state } = useStore();
  const nm = useMinute();
  const st = dayStats(day, state.done, state.status);
  const b = st.byStatus;
  const all = b.todo + b.progress + b.done + b.skipped;
  const open = (id: string) => { const s = statusOf(id, state.done, state.status); return s === 'todo' || s === 'progress'; };
  const allResolved = day.tasks.filter(study).every(t => !open(t.id));
  const next = isToday ? day.blocks.find(bk => toMin(bk.s) > nm && bk.tasks.some(t => study(t) && open(t.id))) : undefined;
  const title = isToday ? 'Today' : day.no === 0 ? 'Day 0' : `Day ${day.no}`;
  const legend: [TaskStatus, string][] = [['done', 'Done'], ['progress', 'In progress'], ['skipped', 'Skipped'], ['todo', 'Not started']];
  return (
    <Card id="today" title={title} detail={all ? `${b.done} of ${st.total} study tasks done` : undefined}>
      <Stack parts={[['done', b.done], ['progress', b.progress], ['skipped', b.skipped], ['todo', b.todo]]} />
      <div className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1 text-[12px] text-muted-foreground">
        {legend.map(([k, label]) => (
          <span key={k} className="flex min-w-0 items-center gap-1.5"><Swatch k={k} /><span className="truncate">{label}</span><span className="ml-auto tabular-nums text-foreground">{b[k]}</span></span>
        ))}
      </div>
      <div className="mt-3 space-y-1 text-[13px]">
        <div className="flex items-baseline gap-2"><span className="text-muted-foreground">Hours done</span><span className="ml-auto font-medium tabular-nums">{hrs(st.doneMin)} of {hrs(st.planMin)} h</span></div>
        {all > 0 && allResolved
          ? <div className="text-muted-foreground" data-rail-next>{isToday ? 'Done for today' : 'All done'}</div>
          : next && <div className="flex min-w-0 items-baseline gap-2" data-rail-next><span className="shrink-0 text-muted-foreground">Next</span><span className="shrink-0 tabular-nums">{next.s}</span><span className="min-w-0 truncate">{next.title}</span></div>}
      </div>
    </Card>
  );
}

function CycleCard({ cyc }: { cyc: CycleSummary }) {
  const { days, todayIdx } = useStore();
  const { openDay } = useUI();
  const [unit, setUnit] = useCycleUnit();
  const b = cyc.byStatus;
  const past = cyc.daysLeft === 0;
  const future = cyc.days[0].i > todayIdx;
  const when = past ? 'ended' : future ? `starts ${WD[cyc.from.getDay()]} ${cyc.from.getDate()} ${MON[cyc.from.getMonth()]}` : `${plural(cyc.daysLeft, 'day')} left`;
  const trail = trailingLine(cyc.trailing[unit], unit);
  return (
    <Card id="cycle" title={`Week ${cyc.week} cycle`} detail={`${dateRange(cyc.from, cyc.to)} · ${when}`}>
      <Stack parts={[['done', b.done], ['progress', b.progress], ['todo', b.todo]]} />
      <div className="mt-2 flex items-baseline gap-2 text-[13px]">
        <span className="font-medium tabular-nums">{b.done} / {cyc.total} tasks</span>
        {b.skipped > 0 && <span className="text-[12px] text-faint tabular-nums">· {b.skipped} skipped</span>}
        <span className="ml-auto text-muted-foreground tabular-nums">{Math.round(cyc.pct * 100)}%</span>
      </div>
      {trail && <div className={cn('mt-0.5 text-[12px] tabular-nums', trail.behind ? 'text-stone-foreground' : 'text-muted-foreground')} data-trailing>{trail.text}</div>}

      <div className="mt-3 flex items-center gap-2">
        <span className="text-[12px] font-medium text-muted-foreground">Burn-down</span>
        <div className="ml-auto"><Seg value={unit} onChange={setUnit} options={[{ value: 'tasks', label: 'Tasks' }, { value: 'hours', label: 'Hours' }]} /></div>
      </div>
      <Burndown cyc={cyc} unit={unit} />

      <div className="mt-3 flex gap-1.5" role="group" aria-label="Days of this cycle">
        {cyc.days.map(d => {
          const s = d.byStatus, n = s.done + s.progress + s.skipped + s.todo;
          const no = days[d.i]?.no ?? d.i;
          return (
            <button key={d.i} type="button" onClick={() => openDay(d.i)} data-cycle-day={d.i} data-day-no={no} data-today={d.isToday || undefined}
              aria-label={`${WD[d.date.getDay()]} ${d.date.getDate()}: ${s.done} of ${n - s.skipped} done${d.isToday ? ', today' : ''}`}
              className="group/day flex min-w-0 flex-1 flex-col items-center gap-1 rounded-[5px] outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
              <span className={cn('flex h-9 w-full flex-col-reverse overflow-hidden rounded-[4px] group-hover/day:opacity-80', d.isToday && 'outline outline-1 outline-offset-1 outline-primary')} style={{ background: FILL.todo }}>
                {n > 0 && (['done', 'progress', 'skipped'] as const).map(k => s[k] > 0 && <span key={k} style={{ height: `${(s[k] / n) * 100}%`, background: FILL[k] }} className="w-full shrink-0" />)}
              </span>
              <span className={cn('text-[11px] tabular-nums', d.isToday ? 'font-semibold text-foreground' : 'text-muted-foreground')}>{WD[d.date.getDay()].charAt(0)}</span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

/** Mini burn-down: scheduled (dashed grey) vs pending (ink line, light fill), one point per day boundary. */
function Burndown({ cyc, unit }: { cyc: CycleSummary; unit: CycleUnit }) {
  const bd = cyc.burndown[unit];
  const n = bd.ideal.length;
  const W = 260, H = 80, top = 4, bottom = H - 6;
  const pend = bd.pending;
  const start = Math.max(bd.total, bd.ideal[0] ?? 0, pend[0] ?? 0);
  const max = start || 1;
  const x = (k: number) => (k / n) * W; // k = boundary 0..n
  const y = (v: number) => bottom - (v / max) * (bottom - top);
  const ideal = [start, ...bd.ideal].map((v, k) => `${x(k).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const last = pend.reduce<number>((a, v, k) => (v == null ? a : k), -1);
  const pts = last >= 0 ? [start, ...pend.slice(0, last + 1)].map((v, k) => [x(k), y(v as number)] as const) : [];
  const line = pts.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join(' ');
  const area = pts.length ? `M${pts[0][0]},${bottom} L${line.replace(/ /g, ' L')} L${pts[pts.length - 1][0].toFixed(1)},${bottom} Z` : '';
  const todayK = cyc.days.findIndex(d => d.isToday);
  const tickX = todayK >= 0 ? x(todayK + 0.5) : null;
  const fmt = (v: number) => (unit === 'hours' ? fmtH(v) : `${Math.round(v)}`);
  const pendNow = last >= 0 ? (pend[last] as number) : null;
  const style: CSSProperties = { overflow: 'visible' };
  return (
    <figure className="mt-2" data-burndown>
      <div className="mb-1 flex items-baseline gap-1 text-[11px] text-faint tabular-nums">
        <span>{fmt(max)}</span><span data-burndown-unit>{unit === 'hours' ? 'h' : 'tasks'}</span>
        <span className="ml-auto flex items-center gap-2">
          <span className="flex items-center gap-1"><svg width="12" height="2" aria-hidden="true"><line x1="0" y1="1" x2="12" y2="1" stroke="var(--primary)" strokeWidth="1.5" /></svg>Pending</span>
          <span className="flex items-center gap-1"><svg width="12" height="2" aria-hidden="true"><line x1="0" y1="1" x2="12" y2="1" stroke={IDEAL} strokeWidth="1.5" strokeDasharray="3 2" /></svg>Scheduled</span>
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-20 w-full" preserveAspectRatio="none" style={style} role="img"
        aria-label={`Burn-down: ${pendNow == null ? 'not started' : `${fmt(pendNow)} ${unit === 'hours' ? 'h' : 'tasks'} pending`} of ${fmt(bd.total)}`}>
        <line x1="0" y1={bottom} x2={W} y2={bottom} stroke="var(--border)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <polyline points={ideal} fill="none" stroke={IDEAL} strokeWidth="1.5" strokeDasharray="4 3" vectorEffect="non-scaling-stroke" />
        {area && <path d={area} fill="var(--primary)" opacity="0.07" />}
        {line && <polyline points={line} fill="none" stroke="var(--primary)" strokeWidth="1.75" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />}
        {tickX != null && <line x1={tickX} y1={bottom - 5} x2={tickX} y2={bottom + 3} stroke="var(--primary)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />}
      </svg>
      <figcaption className="sr-only">Pending work against the schedule for Week {cyc.week}.</figcaption>
    </figure>
  );
}

function TracksCard({ cyc }: { cyc: CycleSummary }) {
  return (
    <Card id="tracks" title="Tracks this cycle">
      {cyc.tracks.length ? (
        <ul className="space-y-2">
          {cyc.tracks.map(t => (
            <li key={t.track} className="flex items-center gap-2 text-[13px]" data-rail-track={t.track}>
              <span className="w-28 shrink-0 truncate">{t.name}</span>
              <span className="h-1 min-w-0 flex-1 overflow-hidden rounded-full" style={{ background: FILL.todo }} aria-hidden="true">
                <span className="block h-full rounded-full bg-primary" style={{ width: `${t.progress * 100}%` }} />
              </span>
              <span className="w-10 shrink-0 text-right text-[12px] text-muted-foreground tabular-nums">{t.done}/{t.total}</span>
            </li>
          ))}
        </ul>
      ) : <p className="text-[13px] text-muted-foreground">No track tasks this cycle.</p>}
    </Card>
  );
}

const MAX_PROGRESS = 6;

function ProgressCard() {
  const { state, days, todayIdx } = useStore();
  const { openDay, openTask } = useUI();
  const today = days[todayIdx];
  const rows = useMemo(() => days
    .flatMap(d => d.tasks.filter(t => statusOf(t.id, state.done, state.status) === 'progress').map(t => ({ t, d, at: state.meta[`status/${t.id}`] ?? 0 })))
    .sort((a, b) => b.at - a.at || a.d.i - b.d.i), [days, state.done, state.status, state.meta]);
  const label = (d: Day) => d.i === todayIdx ? 'today' : today && d.week === today.week ? WD[d.date.getDay()] : `Day ${d.no}`;
  return (
    <Card id="progress" title="In progress" detail={rows.length || undefined}>
      {rows.length ? (
        <ul className="-mx-2">
          {rows.slice(0, MAX_PROGRESS).map(({ t, d }) => (
            <li key={t.id}>
              <button type="button" data-progress-task={t.id} onClick={() => { openDay(d.i); openTask(t.id, d.i); }}
                className="flex h-8 w-full min-w-0 items-center gap-2 rounded-[6px] px-2 text-left text-[13px] outline-none hover:bg-hover focus-visible:bg-hover">
                <StatusIcon status="progress" size={14} />
                <span className="min-w-0 flex-1 truncate">{t.text}</span>
                <span className="shrink-0 text-[12px] text-faint tabular-nums">{label(d)}</span>
              </button>
            </li>
          ))}
          {rows.length > MAX_PROGRESS && <li className="px-2 pt-1 text-[12px] text-faint tabular-nums">+{rows.length - MAX_PROGRESS} more</li>}
        </ul>
      ) : <p className="text-[13px] text-muted-foreground">Nothing in progress.</p>}
    </Card>
  );
}
