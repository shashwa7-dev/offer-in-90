'use client';
/* Running total of study hours vs the plan. Inline SVG: solid ink = done, dashed grey = plan,
   dotted ink = forecast (whole plan only), stone area = shortfall between plan and forecast. */
import type { Forecast } from '@/lib/forecast';
import { fmtDate, type Day } from '@/lib/engine';

export type ChartRange = 'month' | 'plan';

const W = 920, H = 240, L = 50, R = 76, TOP = 16, B = 30;
const shortDate = (d: Date) => d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
const round = (h: number) => (h >= 10 ? Math.round(h) : Math.round(h * 10) / 10);

/** The 28 days starting on the Monday on or before (today − 14), kept inside the plan. */
export function monthWindow(days: Day[], todayIdx: number): [number, number] {
  const len = days.length;
  if (!len) return [0, -1];
  const ref = Math.max(0, Math.min(len - 1, todayIdx)) - 14;
  const dow = (((days[0].date.getDay() + ref) % 7) + 7) % 7; // 0 = Sunday
  const start = Math.max(0, Math.min(ref - ((dow + 6) % 7), len - 28));
  return [start, Math.min(len - 1, start + 27)];
}

function niceTicks(lo: number, hi: number, n = 4) {
  const span = Math.max(1, hi - lo), raw = span / n, mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map(m => m * mag).find(s => s >= raw) ?? 10 * mag;
  const a = Math.floor(lo / step) * step, b = Math.ceil(hi / step) * step;
  const out: number[] = [];
  for (let v = a; v <= b + step / 2; v += step) out.push(Math.round(v * 100) / 100);
  return out;
}

export function ProgressChart({ data, days, todayIdx, range, missed, onOpenDay }: {
  data: Forecast; days: Day[]; todayIdx: number; range: ChartRange;
  /** Day indexes under 50%, marked in stone under the axis. */ missed: Set<number>;
  onOpenDay: (i: number) => void;
}) {
  const len = days.length;
  const [a, b] = range === 'month' ? monthWindow(days, todayIdx) : [0, len - 1];
  if (b < a) return null;
  const n = b - a + 1, slot = (W - L - R) / n;
  const x = (i: number) => L + (i - a + 0.5) * slot;
  const { cumPlan, cumDone, paceH, projectedH, planH } = data;
  const doneEnd = cumDone.length - 1; // last index with a done value
  const showForecast = range === 'plan' && paceH !== null && projectedH !== null && todayIdx >= 0 && todayIdx < len;
  const fStart = Math.min(Math.max(0, todayIdx), len - 1);
  const fFrom = doneEnd >= 0 ? cumDone[doneEnd] : 0;
  const fAt = (i: number) => (showForecast ? fFrom + ((projectedH! - fFrom) * (i - fStart)) / Math.max(1, b - fStart) : 0);

  // y domain: the window's running totals (base before the window up to the highest value shown)
  const vals: number[] = [];
  for (let i = a; i <= b; i++) { vals.push(cumPlan[i]); if (i <= doneEnd) vals.push(cumDone[i]); }
  if (a > 0) { vals.push(cumPlan[a - 1]); if (a - 1 <= doneEnd) vals.push(cumDone[a - 1]); }
  if (showForecast) vals.push(projectedH!);
  const ticks = niceTicks(range === 'plan' ? 0 : Math.min(...vals), Math.max(...vals, 1));
  const lo = ticks[0], hi = ticks[ticks.length - 1];
  const y = (h: number) => TOP + (H - TOP - B) * (1 - (h - lo) / Math.max(1e-9, hi - lo));
  const pts = (is: number[], f: (i: number) => number) => is.map(i => `${x(i).toFixed(1)},${y(f(i)).toFixed(1)}`).join(' ');
  const idx = (from: number, to: number) => { const o: number[] = []; for (let i = from; i <= to; i++) o.push(i); return o; };

  const planIs = idx(a, b), doneIs = idx(a, Math.min(b, doneEnd));
  const fIs = showForecast ? idx(fStart, b) : [];
  const shortfall = fIs.length > 1
    ? `${pts(fIs, i => cumPlan[i])} ${pts([...fIs].reverse(), i => Math.min(fAt(i), cumPlan[i]))}`
    : '';

  // end labels: never closer than 12px; the lower one moves down
  let yPlan = y(cumPlan[b]), yProj = showForecast ? y(projectedH!) : 0;
  if (showForecast && Math.abs(yPlan - yProj) < 12) { if (yProj >= yPlan) yProj = yPlan + 12; else yPlan = yProj + 12; }
  const today = todayIdx >= a && todayIdx <= b ? todayIdx : -1;
  const labelAt = (i: number) => (range === 'plan' ? days[i].no % 7 === 1 : days[i].date.getDay() === 1);

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" className="block h-auto min-w-[560px]" role="img"
        aria-label={`Running total of study hours vs plan, ${range === 'month' ? 'these four weeks' : 'whole plan'}`}>
        {planIs.map(i => (
          <rect key={i} data-day={i} x={x(i) - slot / 2} y={TOP - 6} width={slot} height={H - TOP - B + 14} fill="transparent"
            className="cursor-pointer hover:fill-hover" onClick={() => onOpenDay(i)}>
            <title>{`${days[i].no === 0 ? 'Day 0 · prep' : `Day ${days[i].no}`} · ${fmtDate(days[i].date)} · ${round(cumPlan[i] - (i ? cumPlan[i - 1] : 0))} h planned${i <= doneEnd ? `, ${round(cumDone[i] - (i ? cumDone[i - 1] : 0))} h done` : ''}`}</title>
          </rect>
        ))}
        <g pointerEvents="none">
        {ticks.map(t => (
          <g key={t}>
            <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="var(--border)" />
            <text x={L - 8} y={y(t) + 4} textAnchor="end" className="fill-faint text-[11px] tabular-nums">{t}h</text>
          </g>
        ))}
        {planIs.filter(labelAt).map(i => (
          <text key={i} x={x(i)} y={H - 8} textAnchor="middle" className="fill-faint text-[11px]">
            {range === 'plan' ? `W${days[i].week}` : shortDate(days[i].date)}
          </text>
        ))}
        {shortfall && <polygon points={shortfall} fill="var(--stone)" stroke="none" data-shortfall />}
        <polyline points={pts(planIs, i => cumPlan[i])} fill="none" stroke="var(--faint)" strokeWidth={1.5} strokeDasharray="5 4" data-plan />
        {doneIs.length > 0 && <polyline points={pts(doneIs, i => cumDone[i])} fill="none" stroke="var(--foreground)" strokeWidth={2} strokeLinejoin="round" data-done />}
        {fIs.length > 1 && <polyline points={pts([fIs[0], b], fAt)} fill="none" stroke="var(--foreground)" strokeWidth={1.75} strokeDasharray="1.5 4" strokeLinecap="round" data-forecast />}
        {today >= 0 && (
          <g>
            <line x1={x(today)} x2={x(today)} y1={TOP - 6} y2={H - B} stroke="var(--foreground)" strokeWidth={1} opacity={0.35} />
            <text x={x(today) + 4} y={TOP + 2} className="fill-muted-foreground text-[11px]">Today</text>
          </g>
        )}
        {planIs.filter(i => missed.has(i)).map(i => (
          <rect key={i} x={x(i) - Math.max(1.5, slot / 2 - 1)} y={H - B + 4} width={Math.max(3, slot - 2)} height={3} rx={1} fill="var(--stone-foreground)" opacity={0.6} />
        ))}
        <text x={W - R + 6} y={yPlan + 4} className="fill-muted-foreground text-[11px] tabular-nums">Plan {Math.round(range === 'plan' ? planH : cumPlan[b])} h</text>
        {showForecast && <text x={W - R + 6} y={yProj + 4} className="fill-foreground text-[11px] font-medium tabular-nums">{Math.round(projectedH!)} h</text>}
        </g>
      </svg>
    </div>
  );
}
