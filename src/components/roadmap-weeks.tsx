'use client';
/* Roadmap › Weeks: phase bands with one row per week (Plane Cycles style). */
import { Fragment } from 'react';
import { useStore } from '@/lib/store';
import { P, aiUnitOf, study, type Day } from '@/lib/engine';
import { STAGES, TRACKS, type TrackKey } from '@/lib/timeline';
import { Band, Chip, Ring, Row } from './shell/page';
import { PHASE_SPANS } from './roadmap-timeline';
import { useUI } from './ui-state';

const PHASE_TEXT: Record<number, string> = {
  1: 'How the internet works, JavaScript, browser, React basics, HLD fundamentals, frontend system design, first 60 DSA problems, machine-coding builds, LLD foundations on Saturdays. AI: neural nets, transformers, the Attention paper, building GPT from scratch. Career: resume, positioning, Amazon OA, LP story bank, a daily product & UX lesson.',
  2: 'React depth, backend, LLD problems, HLD + AI design problems, the flagship product (real-time collaborative docs with AI, launched to real users), rest of NeetCode 150, advanced DSA, AI-enabled coding drills. AI: GPT-3, RLHF, RAG, CoT, ReAct, MCP, evals. Forward-deployed track starts. Referrals and applications.',
  3: 'Interview mode: Meta speed sets, Google plain-doc sets, AI-enabled coding drills, Amazon OA simulations, flagship launch + case study, mock loops (frontend, HLD, LLD, AI, FDE). AI: scaling laws, LoRA, Constitutional AI, AI system design. Decomposition reps, take-home practice, daily applications.',
};

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** "5–11 Nov", or "29 Nov – 5 Dec" across a month boundary. */
export const dateRange = (a: Date, b: Date) => a.getMonth() === b.getMonth()
  ? `${a.getDate()}–${b.getDate()} ${MON[b.getMonth()]}`
  : `${a.getDate()} ${MON[a.getMonth()]} – ${b.getDate()} ${MON[b.getMonth()]}`;

/** Main topics of a week: DSA topics, frontend lessons, AI units. */
export function weekSummary(days: Day[], w: number): string[] {
  const ds = days.filter(x => x.week === w && x.type === 'study'); if (!ds.length) return ['Kickoff'];
  const topics = [...new Set(ds.flatMap(x => x.tasks.filter(t => t.topic).map(t => t.topic!)))];
  const fe = ds.filter(x => x.s! <= 48).map(x => P.FE[x.s! - 1][0].split(/[:,(]/)[0].trim());
  const ai = [...new Set(ds.map(x => aiUnitOf(x.s!)).filter(Boolean))];
  return [topics.length ? `DSA: ${topics.join(', ')}` : 'DSA: timed sets + OA', fe.length ? `Frontend: ${fe.slice(0, 2).join(', ')}…` : 'Frontend: revision', ai.length ? `AI: ${ai.join('; ')}` : 'AI: explain-it-back revision'];
}

/** Done/total per track for one week's days, matched the same way as the Timeline stages. */
function trackCounts(ds: Day[], done: Record<string, number>) {
  const c = Object.fromEntries(TRACKS.map(t => [t.key, { d: 0, t: 0 }])) as Record<TrackKey, { d: number; t: number }>;
  for (const d of ds) {
    if (d.s == null) continue;
    for (const t of d.tasks) {
      if (t.own || t.id.endsWith('-news')) continue;
      const st = STAGES.find(x => x.match(t, d.s as number));
      if (!st) continue;
      c[st.track].t++;
      if (done[t.id]) c[st.track].d++;
    }
  }
  return c;
}

export function RoadmapWeeks() {
  const { state, days, todayIdx } = useStore();
  const { openDay } = useUI();
  const today = todayIdx >= 0 && todayIdx < days.length ? days[todayIdx] : undefined;

  return (
    <>
      {PHASE_SPANS.map(ph => {
        const weeks = Array.from({ length: ph.to - ph.from + 1 }, (_, k) => ph.from + k);
        return (
          <Band key={ph.p} id={`phase-${ph.p}`} title={`Phase ${ph.p} · ${ph.name}`} count={`W${ph.from}–${ph.to}`} defaultOpen={!today || today.phase === ph.p}>
            <div className="border-t border-border">
              <p className="px-4 py-2.5 text-[13px] leading-snug text-muted-foreground">{PHASE_TEXT[ph.p]}</p>
              {weeks.map(w => {
                const ds = days.filter(d => d.week === w);
                if (!ds.length) return null;
                const tasks = ds.flatMap(d => d.tasks.filter(study));
                const n = tasks.filter(t => state.done[t.id]).length, total = tasks.length;
                const share = total ? n / total : 0;
                const now = today?.week === w;
                const [head, ...rest] = weekSummary(days, w);
                const first = ds.find(d => d.type !== 'kick') ?? ds[0];
                const counts = now ? trackCounts(ds, state.done) : null;
                return (
                  <Fragment key={w}>
                    <Row tone={now ? 'now' : undefined} onClick={() => openDay(first.i)} data-week={w}
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
                    {counts && (
                      <div className="px-4 pb-2.5 pl-11 text-[12px] leading-snug text-muted-foreground tabular-nums shadow-[inset_2px_0_0_var(--primary)]" data-week-tracks>
                        {TRACKS.filter(t => counts[t.key].t > 0).map(t => `${t.name} ${counts[t.key].d}/${counts[t.key].t}`).join(' · ')}
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
