'use client';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { P, catName, dayStats, fmtDate, hrs, overall, parseISO, study } from '@/lib/engine';
import { forecast } from '@/lib/forecast';
import { Band, Chip, PageHeader, Row, Seg, Surface, SummaryRow } from './shell/page';
import { ProgressChart, type ChartRange } from './progress-chart';
import { useUI } from './ui-state';

const DAY_NAMES = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'];

export function ProgressView() {
  const { state, days, todayIdx: ti } = useStore();
  const { openDay } = useUI();
  const [range, setRange] = useState<ChartRange>('month');
  const done = state.done, o = overall(days, done, ti);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const solved = P.DSA.filter((p: any) => done['p-' + p.slug]).length;
  const daysDone = Math.max(0, Math.min(days.length, ti));
  const goodDays = days.filter(d => d.i < ti && dayStats(d, done).pct >= 0.8).length;
  let streak = 0; for (let i = Math.min(ti, days.length) - 1; i >= 0; i--) { if (dayStats(days[i], done).pct >= 0.8) streak++; else break; }
  if (ti >= 0 && ti < days.length && dayStats(days[ti], done).pct >= 0.8) streak++;

  const cats = ['dsa', 'sd', 'fe', 'mc', 'proj', 'ai', 'ux', 'fde', 'beh'];
  const byCat = cats.map(c => {
    let due = 0, dn = 0, all = 0, allDone = 0;
    days.forEach(d => d.tasks.filter(t => t.cat === c).forEach(t => { all++; if (done[t.id]) allDone++; if (d.i < ti) { due++; if (done[t.id]) dn++; } }));
    return { c, due, done: dn, all, allDone, pct: due ? dn / due : 1 };
  }).filter(x => x.all > 0).sort((a, b) => a.pct - b.pct);

  const past = days.filter(d => d.i < ti);
  const blockAgg: Record<string, { n: number; d: number; title: string; s: string }> = {}, dowAgg: Record<number, { n: number; p: number }> = {};
  past.forEach(d => {
    d.blocks.forEach(b => b.tasks.filter(study).forEach(t => { const a = (blockAgg[b.k] ||= { n: 0, d: 0, title: b.title, s: b.s }); a.n++; if (done[t.id]) a.d++; }));
    const a = (dowAgg[d.date.getDay()] ||= { n: 0, p: 0 }); a.n++; a.p += dayStats(d, done).pct;
  });
  const worstBlock = Object.values(blockAgg).filter(a => a.n >= 3).sort((a, b) => a.d / a.n - b.d / b.n)[0];
  const dows = Object.entries(dowAgg).map(([k, v]) => ({ k: +k, pct: v.p / v.n })).sort((a, b) => a.pct - b.pct);
  const insights: ['ok' | 'behind' | 'late', string][] = [];
  if (!past.length) insights.push(['ok', 'Nothing to judge yet. Insights appear after your first full day.']);
  else {
    const w = byCat[0];
    insights.push(w && w.pct < 0.9 ? ['late', `${catName[w.c]} is your weakest track: ${w.done} of ${w.due} tasks done so far.`] : ['ok', 'Every track is at 90% or better. Keep going.']);
    if (worstBlock && worstBlock.d / worstBlock.n < 0.8) insights.push(['behind', `You skip the ${worstBlock.s} block (${worstBlock.title}) most: ${Math.round((worstBlock.d / worstBlock.n) * 100)}% done.`]);
    if (dows.length > 1 && dows[0].pct < 0.8) insights.push(['behind', `${DAY_NAMES[dows[0].k]} are your weakest day (${Math.round(dows[0].pct * 100)}% average).`]);
    if (o.behindMin > 60) insights.push(['late', `${hrs(o.behindMin)} h behind. Sunday catch-up has 2 h; add 30 min to evenings until you are even.`]);
    const missed = past.filter(d => dayStats(d, done).pct < 0.5).length;
    if (missed) insights.push(['late', `${missed} day${missed > 1 ? 's' : ''} under 50% (marked in stone under the chart).`]);
  }
  const stats = days.map(d => dayStats(d, done));
  const fc = forecast(days.map((d, i) => ({ no: d.no, planMin: stats[i].planMin, doneMin: stats[i].doneMin })), ti);
  const missedDays = new Set(days.filter(d => d.i < ti && stats[d.i].pct < 0.5).map(d => d.i));
  const end = days[days.length - 1].date;
  const one = (h: number) => Math.round(h * 10) / 10;
  const flagged = Object.keys(state.flags).length;
  const items = [
    { k: 'Days', v: `${daysDone} done · ${o.daysLeft} left` },
    { k: 'Hours', v: <span title={o.daysLeft ? `${hrs(o.leftAll)} h left, about ${hrs(o.leftAll / o.daysLeft)} h per remaining day` : undefined}>{hrs(o.doneAll)} of {hrs(o.planAll)} h</span> },
    { k: 'Problems', v: <span title={`${flagged} flagged to re-solve`}>{solved} of {P.DSA.length}{flagged ? ` · ${flagged} flagged` : ''}</span> },
    { k: 'Status', v: o.status[1] },
    { k: 'Streak', v: <span title={`${goodDays} day${goodDays === 1 ? '' : 's'} at 80% or more`}>{streak} day{streak === 1 ? '' : 's'}</span> },
  ];
  const pctTxt = fc.pct === null ? '' : `${Math.round(fc.pct * 100)}%`;

  return (
    <div className="pb-16">
      <PageHeader crumbs={['Progress', `${fmtDate(parseISO(state.start))} → ${fmtDate(end)}`]} keepLast />
      <Surface>
        <SummaryRow ring={{ pct: o.planAll ? o.doneAll / o.planAll : 0, label: 'of plan hours' }} items={items} />
        <div className="border-t border-border">
          <Band id="running-total" title="Running total vs plan"
            right={<Seg value={range} onChange={setRange} options={[{ value: 'month', label: 'This month' }, { value: 'plan', label: 'Whole plan' }]} />}>
            <div className="border-t border-border px-4 pt-3 pb-2">
              <ProgressChart data={fc} days={days} todayIdx={ti} range={range} missed={missedDays} onOpenDay={openDay} />
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-muted-foreground">
                <Key line="solid">Done</Key>
                <Key line="dashed">Plan</Key>
                {range === 'plan' && fc.paceH !== null && <><Key line="dotted">At this pace</Key><Key line="area">Shortfall</Key></>}
                <span className="text-faint">Click a day to open it</span>
              </div>
            </div>
            {fc.paceH !== null && fc.pct !== null && fc.projectedH !== null && (
              <div className="border-t border-border px-4 py-3" data-pace>
                <p className="text-[14px] text-foreground">
                  {fc.pct >= 0.95
                    ? `At this pace you finish ${pctTxt} of the plan. Keep it up.`
                    : `At this pace you finish ${pctTxt} of the plan, about ${Math.round(fc.projectedH)} of ${Math.round(fc.planH)} h. To finish on time you need ${one(fc.neededH)} h a day from today.`}
                </p>
                <div className="mt-3 flex flex-wrap gap-x-8 gap-y-3">
                  <Value k="Your pace" v={`${one(fc.paceH)} h a day`} />
                  <Value k={`At this pace by ${fmtDate(end)}`} v={`${Math.round(fc.projectedH)} h`} />
                  <Value k="Needed from today" v={`${one(fc.neededH)} h a day`} />
                </div>
              </div>
            )}
          </Band>
          <Band id="slipping" title="Where you're slipping" count={past.length ? insights.length : undefined}>
            <div className="border-t border-border">
              {insights.map(([, t], i) => <Row key={i} className="py-2.5 leading-snug">{t}</Row>)}
            </div>
          </Band>
          <Band id="tracks" title="Tracks" count={byCat.length}>
            <div className="border-t border-border">
              {byCat.map(x => (
                <Row key={x.c}>
                  <span className="w-32 shrink-0 truncate sm:w-44">{catName[x.c]}</span>
                  <div className="h-1.5 min-w-8 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${x.due ? x.pct * 100 : 0}%` }} />
                  </div>
                  <span className="flex w-16 shrink-0 justify-end" title={`${x.allDone} of ${x.all} in the whole plan`}><Chip>{x.done} of {x.due}</Chip></span>
                </Row>
              ))}
            </div>
          </Band>
        </div>
      </Surface>
    </div>
  );
}

function Value({ k, v }: { k: string; v: string }) {
  return (
    <div className="leading-tight">
      <div className="text-[12px] text-muted-foreground">{k}</div>
      <div className="text-[14px] font-medium tabular-nums">{v}</div>
    </div>
  );
}

function Key({ line, children }: { line: 'solid' | 'dashed' | 'dotted' | 'area'; children: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <svg width="16" height="8" aria-hidden="true" className="shrink-0">
        {line === 'area'
          ? <rect x="0" y="0" width="16" height="8" rx="2" fill="var(--stone)" stroke="var(--stone-border)" />
          : <line x1="1" x2="15" y1="4" y2="4" stroke={line === 'dashed' ? 'var(--faint)' : 'var(--foreground)'} strokeWidth={line === 'dotted' ? 1.75 : 1.5}
              strokeDasharray={line === 'dashed' ? '4 3' : line === 'dotted' ? '1.5 3' : undefined} strokeLinecap={line === 'dotted' ? 'round' : undefined} />}
      </svg>
      {children}
    </span>
  );
}
