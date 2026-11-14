'use client';
/* Roadmap › Timeline: one row per track, each stage an outlined bar across 13 week columns (Plane Gantt style). */
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { STAGES, TRACKS, stageBars, type StageBar } from '@/lib/timeline';
import { useUI } from './ui-state';

export const WEEKS = 13;
export const PHASE_SPANS = [
  { p: 1, name: 'Foundations', from: 1, to: 4 },
  { p: 2, name: 'Depth', from: 5, to: 9 },
  { p: 3, name: 'Interview mode', from: 10, to: 13 },
] as const;

const LANE = 30; // px per bar lane inside a track row
const pct = (n: number) => `${(n / WEEKS) * 100}%`;

/** Stack bars of one track into lanes so overlapping stages never cover each other. */
function lanes(bars: StageBar[]) {
  const ends: number[] = [];
  return bars
    .slice()
    .sort((a, b) => a.fromWeek - b.fromWeek || a.toWeek - b.toWeek)
    .map(b => {
      let l = ends.findIndex(e => e < b.fromWeek);
      if (l < 0) { l = ends.length; ends.push(b.toWeek); } else ends[l] = b.toWeek;
      return { b, lane: l };
    });
}

export function RoadmapTimeline() {
  const { state, days, todayIdx } = useStore();
  const { openDay } = useUI();
  const bars = useMemo(() => stageBars(days, state.done), [days, state.done]);
  const today = todayIdx >= 0 && todayIdx < days.length ? days[todayIdx] : undefined;
  const nowWeek = today && today.week >= 1 && today.week <= WEEKS ? today.week : null;
  // Today line: inside the current week by weekday position (prep Day 0 sits at the start of week 1).
  const nowX = nowWeek && today ? (nowWeek - 1 + (Math.max(0, today.no - 1) % 7 + 0.5) / 7) / WEEKS : null;

  const openBar = (b: StageBar) => {
    const stage = STAGES.find(s => s.track === b.track && s.label === b.label);
    const inRange = days.filter(d => d.week >= b.fromWeek && d.week <= b.toWeek && d.s != null);
    const hit = stage && inRange.find(d => d.tasks.some(t => !t.own && !t.id.endsWith('-news') && !state.done[t.id] && stage.match(t, d.s as number)));
    const first = hit ?? inRange.find(d => d.week === b.fromWeek) ?? days.find(d => d.week === b.fromWeek);
    if (first) openDay(first.i);
  };

  return (
    <div className="overflow-x-auto" data-timeline>
      <div className="relative min-w-[640px]">
        {/* phase labels */}
        <div className="flex h-8 border-b border-border">
          <div className="w-32 shrink-0" />
          <div className="relative flex-1">
            {PHASE_SPANS.map(ph => (
              <div key={ph.p} className={cn('absolute inset-y-0 flex items-center truncate px-2 text-[12px] font-medium text-muted-foreground', ph.p > 1 && 'border-l border-border')}
                style={{ left: pct(ph.from - 1), width: pct(ph.to - ph.from + 1) }}>
                {ph.name} <span className="ml-1 font-normal text-faint tabular-nums">W{ph.from}–{ph.to}</span>
              </div>
            ))}
          </div>
        </div>
        {/* week numbers; the label after "now" sits right so the longer now label never covers it */}
        <div className="flex h-8 border-b border-border">
          <div className="flex w-32 shrink-0 items-center px-4 text-[12px] text-faint">Track</div>
          <div className="grid flex-1 grid-cols-13">
            {Array.from({ length: WEEKS }, (_, k) => k + 1).map(w => (
              <div key={w} className={cn('relative flex items-center border-l border-border px-1.5 text-[12px] whitespace-nowrap tabular-nums',
                w === nowWeek ? 'z-10 font-medium text-foreground' : 'text-faint',
                nowWeek && w === nowWeek + 1 && 'justify-end')}>
                {w === nowWeek ? <span className="bg-card pr-1">W{w} · now</span> : `W${w}`}
              </div>
            ))}
          </div>
        </div>
        {/* tracks */}
        {TRACKS.map(tr => {
          const placed = lanes(bars.filter(b => b.track === tr.key));
          const n = Math.max(1, ...placed.map(p => p.lane + 1));
          return (
            <div key={tr.key} className="flex border-b border-border last:border-b-0" data-track={tr.key}>
              <div className="flex w-32 shrink-0 items-start pt-[13px] pr-2 pl-4 text-[13px] text-foreground">
                <span className="truncate" data-track-name>{tr.name}</span>
              </div>
              <div className="relative flex-1" style={{ height: n * LANE + 12 }}>
                <div className="pointer-events-none absolute inset-0 grid grid-cols-13" aria-hidden="true">
                  {Array.from({ length: WEEKS }, (_, k) => <div key={k} className={cn('border-l border-border', k + 1 === nowWeek && 'bg-band')} />)}
                </div>
                {placed.map(({ b, lane }) => {
                  const share = b.total ? b.done / b.total : 0;
                  const label = `${b.label} · W${b.fromWeek}${b.toWeek > b.fromWeek ? `–${b.toWeek}` : ''} · ${b.done} of ${b.total} done`;
                  return (
                    <button key={b.label} type="button" data-bar onClick={() => openBar(b)} title={label} aria-label={`${tr.name}: ${label}. Open the first open day.`}
                      className="absolute flex h-6 items-center overflow-hidden rounded-[5px] border border-input bg-card text-left outline-none hover:border-foreground/40 focus-visible:ring-2 focus-visible:ring-ring/50"
                      style={{ left: `calc(${pct(b.fromWeek - 1)} + 3px)`, width: `calc(${pct(b.toWeek - b.fromWeek + 1)} - 6px)`, top: 6 + lane * LANE }}>
                      <span className="absolute inset-y-0 left-0 bg-foreground/[0.08]" style={{ width: `${share * 100}%` }} />
                      <span className="relative min-w-0 truncate px-2 text-[12px] text-foreground">{b.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
        {nowX !== null && (
          <div className="pointer-events-none absolute top-[66px] bottom-0 right-0 left-32" aria-hidden="true">
            <div className="absolute inset-y-0 w-[1.5px] -translate-x-1/2 bg-foreground" style={{ left: `${nowX * 100}%` }} data-today-line />
          </div>
        )}
      </div>
    </div>
  );
}
