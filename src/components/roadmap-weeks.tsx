'use client';
/* Roadmap › Weeks: phase bands with one row per week (Plane Cycles style). */
import { Fragment, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { patternNameOf, phaseSpans, shortText } from '@/lib/engine';
import { EMPTY_FILTER, matches } from '@/lib/task-filter';
import { weekSummary } from '@/lib/timeline';
import { cycleOf } from '@/lib/cycle';
import { dateRange } from '@/lib/cycle-input';
import { Band, Chip, Ring, Row } from './shell/page';
import { useCycleDays } from './today-rail';
import { useUI } from './ui-state';
import { LabelFilterBar, pruneLabels } from './today-filters';

const PHASE_TEXT: Record<number, string> = {
  1: 'DSA foundations and patterns 1–11. AI: how neural nets and LLMs work, then using models well (APIs, prompting, tool calling, MCP). Systems: computers, networking, HLD fundamentals, the first designs and DDIA. Platform: DevOps basics, from the shell to auth and secrets. Product: pick and scaffold the flagship, design docs, real-time and offline, the first AI feature. Frontend: rendering, React internals, debugging, frontend system design concepts. Career: resume, Amazon OA, LP story bank, project deep dives.',
  2: 'DSA patterns 12–26. AI: RAG, evals, agents, fine-tuning, inference and serving. Systems: HLD designs alternating with DDIA, case studies and building blocks. Platform: SQL, Postgres, Docker, Kubernetes, Terraform, CI/CD, AWS. Product: Ask your workspace with evals, agent actions, take-home 1, observability, integrations. Frontend: 12 frontend system designs. Career: FDE stages, decomposition reps, teardowns, applications from week 8. Saturdays: AI-enabled coding drills, OA rounds, peer mocks.',
  3: 'Interview mode. DSA: the last pattern, then Amazon OA simulations, Google plain-doc sets, Meta speed sets, hard-pattern revisits. AI: production AI, the AI designs, teach-backs and timed mocks. Systems: timed HLD mocks and second passes. Product: take-home 2, launch to real users, iterate, case study and demo. Frontend: machine-coding rehearsal reps. Career: the FDE take-home, negotiation, 4 full mock loops.',
};

export function RoadmapWeeks() {
  const { state, days, todayIdx } = useStore();
  const { openDay, focusWeek, setFocusWeek } = useUI();
  const today = todayIdx >= 0 && todayIdx < days.length ? days[todayIdx] : undefined;
  const input = useCycleDays(days);
  const spans = phaseSpans(days);
  // Label filter (compact Today filter): weeks stay listed only when one of their tasks has any chosen label.
  const [lf, setLf] = useState<string[]>([]);
  const labelIds = pruneLabels({ filter: { ...EMPTY_FILTER, labels: lf }, groupBy: 'time' }, state.labels).filter.labels;
  const weekHit = (w: number) => !labelIds.length || days.some(d => d.week === w && d.blocks.some(b => b.tasks.some(t => !t.superseded && matches(t.slug && state.flags[t.slug] ? { ...t, flagged: true } : t, b.k, { ...EMPTY_FILTER, labels: labelIds }, state.done, state.status, state.itemLabels))));
  // Phase bands open by default on today's phase; a focus request (sidebar Cycles) opens its band and expands its week.
  const [openPh, setOpenPh] = useState<Record<number, boolean>>({});
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  useEffect(() => {
    if (focusWeek == null) return;
    const w = focusWeek, ph = phaseSpans(days).find(p => w >= p.from && w <= p.to);
    if (ph) setOpenPh(s => ({ ...s, [ph.p]: true }));
    setExpanded(s => ({ ...s, [w]: true }));
    setFocusWeek(null);
    // scroll once the band has opened and the row is laid out
    requestAnimationFrame(() => requestAnimationFrame(() => document.querySelector(`[data-week="${w}"]`)?.scrollIntoView({ block: 'center' })));
  }, [focusWeek, setFocusWeek, days]);

  return (
    <>
      <LabelFilterBar labels={labelIds} onChange={setLf} />
      {labelIds.length > 0 && !days.some(d => weekHit(d.week)) && <p className="px-4 py-3 text-[13px] text-muted-foreground" data-weeks-empty>No week has a task with these labels.</p>}
      {spans.map(ph => {
        const weeks = Array.from({ length: ph.to - ph.from + 1 }, (_, k) => ph.from + k);
        return (
          <Band key={ph.p} id={`phase-${ph.p}`} title={`Phase ${ph.p} · ${ph.name}`} count={`W${ph.from}–${ph.to}`} open={openPh[ph.p] ?? (!today || today.phase === ph.p)} onOpenChange={v => setOpenPh(s => ({ ...s, [ph.p]: v }))}>
            <div className="border-t border-border">
              <p className="px-4 py-2.5 text-[13px] leading-snug text-muted-foreground">{PHASE_TEXT[ph.p]}</p>
              {weeks.map(w => {
                const ds = days.filter(d => d.week === w);
                if (!ds.length || !weekHit(w)) return null;
                // Same numbers as the Today rail's cycle card: study tasks, skipped left out, cat-based tracks.
                const cyc = cycleOf(input, w, state.done, state.status, state.meta, todayIdx, Date.now());
                const n = cyc?.byStatus.done ?? 0, total = cyc?.total ?? 0, share = cyc?.pct ?? 0;
                const now = today?.week === w;
                const [head, ...rest] = weekSummary(days, w, patternNameOf, shortText);
                const first = ds.find(d => d.type !== 'kick') ?? ds[0];
                const open = now || !!expanded[w];
                const tracks = open ? cyc?.tracks ?? [] : null;
                return (
                  <Fragment key={w}>
                    <Row tone={now ? 'now' : undefined} onClick={() => openDay(first.i)} data-week={w} data-expanded={open || undefined}
                      className="flex-wrap gap-x-2 gap-y-0.5 py-2 sm:flex-nowrap sm:gap-x-3">
                      <Ring done={n} total={total} />
                      <span className="w-16 shrink-0 font-medium">Week {w}</span>
                      <span className="order-last w-full truncate pl-6 sm:order-none sm:w-auto sm:min-w-0 sm:flex-1 sm:pl-0" title={[head, ...rest].join(' · ')}>
                        <span className="text-foreground">{head}</span>
                        {rest.length > 0 && <span className="text-faint"> · {rest.join(' · ')}</span>}
                      </span>
                      <span className="ml-auto h-1 w-10 shrink-0 overflow-hidden rounded-full bg-muted sm:ml-0 sm:w-16" aria-hidden="true">
                        <span className="block h-full rounded-full bg-primary" style={{ width: `${share * 100}%` }} />
                      </span>
                      <Chip className="w-11 justify-center">{Math.round(share * 100)}%</Chip>
                      <Chip>{dateRange(ds[0].date, ds[ds.length - 1].date)}</Chip>
                    </Row>
                    {tracks && (
                      <div className={cn('px-4 pb-2.5 pl-11 text-[12px] leading-snug text-muted-foreground tabular-nums', now && 'shadow-[inset_2px_0_0_var(--primary)]')} data-week-tracks>
                        {tracks.map(t => `${t.name} ${t.done}/${t.total}`).join(' · ') || 'No track tasks this week.'}
                      </div>
                    )}
                  </Fragment>
                );
              })}
            </div>
          </Band>
        );
      })}
    </>
  );
}
