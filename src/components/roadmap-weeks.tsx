'use client';
/* Roadmap › Weeks: phase bands with one row per week (Plane Cycles style). */
import { Fragment, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { patternNameOf, phaseSpans, shortText, type Day } from '@/lib/engine';
import { EMPTY_FILTER, matches } from '@/lib/task-filter';
import { cycleOf } from '@/lib/cycle';
import { dateRange } from '@/lib/cycle-input';
import { Band, Chip, Ring, Row } from './shell/page';
import { useCycleDays } from './today-rail';
import { useUI } from './ui-state';
import { LabelFilterBar, pruneLabels } from './today-filters';

const PHASE_TEXT: Record<number, string> = {
  1: 'How the internet works, JavaScript, browser, React basics, HLD fundamentals, frontend system design, first 60 DSA problems, machine-coding builds, LLD foundations on Saturdays. AI: neural nets, transformers, the Attention paper, building GPT from scratch. Career: resume, positioning, Amazon OA, LP story bank, a daily product & UX lesson.',
  2: 'React depth, backend, LLD problems, HLD + AI design problems, the flagship product (real-time collaborative docs with AI, launched to real users), rest of NeetCode 150, advanced DSA, AI-enabled coding drills. AI: GPT-3, RLHF, RAG, CoT, ReAct, MCP, evals. Forward-deployed track starts. Referrals and applications.',
  3: 'Interview mode: Meta speed sets, Google plain-doc sets, AI-enabled coding drills, Amazon OA simulations, flagship launch + case study, mock loops (frontend, HLD, LLD, AI, FDE). AI: scaling laws, LoRA, Constitutional AI, AI system design. Decomposition reps, take-home practice, daily applications.',
};

/** Main topics of a week: DSA patterns, frontend lessons, AI reads (from the week's track blocks). */
export function weekSummary(days: Day[], w: number): string[] {
  const ds = days.filter(x => x.week === w && x.type === 'study'); if (!ds.length) return ['Kickoff'];
  const inBlock = (k: string) => ds.flatMap(x => x.blocks.filter(b => b.k === k).flatMap(b => b.tasks.filter(t => !t.own && !t.superseded)));
  const pats = [...new Set(inBlock('dsa').flatMap(t => (t.pattern ? [patternNameOf(t.pattern)] : [])))];
  const fe = inBlock('fe').filter(t => t.id.startsWith('fe:') && !/^fe:(revise|bfe)-/.test(t.id)).map(t => shortText(t.text));
  const ai = inBlock('ai').filter(t => t.id.startsWith('ai:') && !t.id.startsWith('ai:review-') && !t.id.startsWith('ai:revisit-')).map(t => shortText(t.text));
  return [pats.length ? `DSA: ${pats.join(', ')}` : 'DSA: foundations, timed sets + OA', fe.length ? `Frontend: ${fe.slice(0, 2).join(', ')}…` : 'Frontend: revision', ai.length ? `AI: ${ai.slice(0, 2).join('; ')}…` : 'AI: explain-it-back revision'];
}

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
                const [head, ...rest] = weekSummary(days, w);
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
