'use client';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { P, TOTAL, catName, dayStats, fmtDate, hrs, overall, parseISO, study } from '@/lib/engine';
import { catColor, useUI } from './ui-state';

const DAY_NAMES = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'];

export function ProgressView() {
  const { state, days, todayIdx: ti } = useStore();
  const { openDay } = useUI();
  const done = state.done, o = overall(days, done, ti);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const solved = P.DSA.filter((p: any) => done['p-' + p.slug]).length;
  const daysDone = Math.max(0, Math.min(TOTAL, ti));
  const goodDays = days.filter(d => d.i < ti && dayStats(d, done).pct >= 0.8).length;
  let streak = 0; for (let i = Math.min(ti, TOTAL) - 1; i >= 0; i--) { if (dayStats(days[i], done).pct >= 0.8) streak++; else break; }
  if (ti >= 0 && ti < TOTAL && dayStats(days[ti], done).pct >= 0.8) streak++;

  // chart geometry
  const W = 920, H = 190, L = 30, B = 26, TOP = 12, slot = (W - L) / TOTAL, bw = Math.max(3, slot - 2.5), maxH = 12;
  const y = (h: number) => TOP + (H - TOP - B) * (1 - Math.min(h, maxH) / maxH);

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
    if (missed) insights.push(['late', `${missed} day${missed > 1 ? 's' : ''} under 50% (red marks on the timeline).`]);
  }
  const tone = { ok: 'bg-good', behind: 'bg-warn', late: 'bg-bad' };

  return (
    <div className="pb-16">
      <div className="pt-6 pb-4">
        <p className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">{fmtDate(parseISO(state.start))} → {fmtDate(days[TOTAL - 1].date)}</p>
        <h1 className="mt-1.5 font-display text-3xl font-bold tracking-tight sm:text-4xl">Where you stand</h1>
      </div>
      <div className="mb-4 grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-2.5">
        <Tile k="Days" v={`${daysDone}`} sub={`done · ${o.daysLeft} left`} note={`${goodDays} days at 80%+ · streak ${streak}`} />
        <Tile k="Hours studied" v={`${hrs(o.doneAll)}`} sub="h" note={`of ${hrs(o.planAll)} h planned`} />
        <Tile k="Hours left" v={`${hrs(o.leftAll)}`} sub="h" note={o.daysLeft ? `≈ ${hrs(o.leftAll / o.daysLeft)} h per remaining day` : ''} />
        <Tile k="Problems solved" v={`${solved}`} sub={`/ ${P.DSA.length}`} note={`${Object.keys(state.flags).length} flagged to re-solve`} />
        <Tile k="Status" v={o.status[1]} note="vs plan up to yesterday" tone={o.status[0]} />
      </div>
      <Card className="mb-4 gap-3 p-4">
        <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">Timeline · hours per day</h3>
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full min-w-[640px]" role="img" aria-label="Hours planned and done for each of the 91 days">
            {[0, 4, 8, 12].map(h => <g key={h}><line x1={L} x2={W} y1={y(h)} y2={y(h)} stroke="var(--border)" /><text x={L - 6} y={y(h) + 3} textAnchor="end" className="fill-muted-foreground font-mono text-[10px]">{h}h</text></g>)}
            {days.map(d => {
              const st = dayStats(d, done), x = L + d.i * slot + 1, ph = st.planMin / 60, dh = st.doneMin / 60, missed = d.i < ti && st.pct < 0.5;
              return (
                <g key={d.i} onClick={() => openDay(d.i)} className="group cursor-pointer">
                  <title>{`Day ${d.i + 1} · ${fmtDate(d.date)} · ${hrs(st.doneMin)} of ${hrs(st.planMin)} h`}</title>
                  <rect x={x} y={y(ph)} width={bw} height={y(0) - y(ph)} rx={1.5} className="fill-muted group-hover:fill-border" />
                  {dh > 0 && <rect x={x} y={y(dh)} width={bw} height={y(0) - y(dh)} rx={1.5} className="fill-primary" />}
                  {missed && <rect x={x} y={y(0) + 3} width={bw} height={3} rx={1} className="fill-bad" />}
                  {d.i % 7 === 0 && <text x={x} y={H - 6} className="fill-muted-foreground font-mono text-[10px]">W{d.week}</text>}
                </g>
              );
            })}
            {ti >= 0 && ti < TOTAL && <g><line x1={L + ti * slot + slot / 2} x2={L + ti * slot + slot / 2} y1={TOP - 6} y2={y(0)} stroke="var(--foreground)" strokeDasharray="3 3" strokeWidth={1.5} /><text x={L + ti * slot + slot / 2 + 4} y={TOP + 2} className="fill-foreground font-mono text-[10px]">today</text></g>}
          </svg>
        </div>
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span><i className="mr-1.5 inline-block size-2.5 rounded-sm bg-primary align-middle" />Hours done</span>
          <span><i className="mr-1.5 inline-block size-2.5 rounded-sm border bg-muted align-middle" />Hours planned</span>
          <span><i className="mr-1.5 inline-block size-2.5 rounded-sm bg-bad align-middle" />Day under 50%</span>
          <span>Click a bar to open that day</span>
        </div>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 [&>*]:min-w-0">
        <Card className="gap-3 p-4">
          <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">Where you&apos;re slipping</h3>
          <ul className="flex flex-col gap-2 text-sm">{insights.map(([c, t], i) => <li key={i} className="flex gap-2.5"><span className={cn('mt-1.5 size-2 shrink-0 rounded-full', tone[c])} />{t}</li>)}</ul>
        </Card>
        <Card className="gap-3 p-4">
          <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tracks · done vs due so far</h3>
          <div className="flex flex-col gap-3">
            {byCat.map(x => (
              <div key={x.c} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 text-sm sm:grid-cols-[150px_minmax(0,1fr)_100px]">
                <span>{catName[x.c]}</span>
                <div className="col-span-2 h-2 overflow-hidden rounded-full bg-muted sm:col-span-1 sm:row-start-1 sm:col-start-2"><div className="h-full rounded-full" style={{ width: `${x.due ? x.pct * 100 : 0}%`, background: catColor(x.c) }} /></div>
                <span className="row-start-1 col-start-2 text-right font-mono text-xs text-muted-foreground tnum sm:col-start-3" title={`${x.allDone} of ${x.all} in the whole plan`}>{x.done} of {x.due} due</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Tile({ k, v, sub, note, tone }: { k: string; v: string; sub?: string; note?: string; tone?: 'ok' | 'behind' | 'late' }) {
  return (
    <Card className="gap-1 p-3.5">
      <div className="font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{k}</div>
      <div className={cn('font-display text-2xl font-bold tnum', tone === 'ok' && 'text-good', tone === 'behind' && 'text-warn', tone === 'late' && 'text-bad')}>{v} {sub && <small className="font-sans text-[13px] font-medium text-muted-foreground">{sub}</small>}</div>
      {note && <div className="text-xs text-muted-foreground">{note}</div>}
    </Card>
  );
}
