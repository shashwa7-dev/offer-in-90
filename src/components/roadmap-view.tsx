'use client';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { P, TOTAL, aiUnitOf, dayStats, fmtDate, parseISO, phaseName } from '@/lib/engine';
import { useUI } from './ui-state';

const PHASES: [number, string, string][] = [
  [1, 'Weeks 1–4', 'How the internet works, JavaScript, browser, React basics, HLD fundamentals, frontend system design, first 60 DSA problems, machine-coding builds, LLD foundations on Saturdays. AI: neural nets, transformers, the Attention paper, building GPT from scratch. Career: resume, positioning, Amazon OA, LP story bank, a daily product & UX lesson.'],
  [2, 'Weeks 5–9', 'React depth, backend, LLD problems, HLD + AI design problems, the flagship product (real-time collaborative docs with AI, launched to real users), rest of NeetCode 150, advanced DSA, AI-enabled coding drills. AI: GPT-3, RLHF, RAG, CoT, ReAct, MCP, evals. Forward-deployed track starts. Referrals and applications.'],
  [3, 'Weeks 10–13', 'Interview mode: Meta speed sets, Google plain-doc sets, AI-enabled coding drills, Amazon OA simulations, flagship launch + case study, mock loops (frontend, HLD, LLD, AI, FDE). AI: scaling laws, LoRA, Constitutional AI, AI system design. Decomposition reps, take-home practice, daily applications.'],
];
const H3 = ({ children }: { children: React.ReactNode }) => <h3 className="mb-3 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">{children}</h3>;

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto"><table className="w-full border-collapse text-[13.5px]">
      <thead><tr>{head.map(h => <th key={h} className="border-b px-2 py-1.5 text-left font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>)}</tr></thead>
      <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} className={cn('border-b px-2 py-1.5 align-top', j === 0 && 'font-semibold')}>{c}</td>)}</tr>)}</tbody>
    </table></div>
  );
}

export function RoadmapView() {
  const { state, days, todayIdx: ti } = useStore();
  const { openDay } = useUI();
  const weekSummary = (w: number) => {
    const ds = days.filter(x => x.week === w && x.type === 'study'); if (!ds.length) return 'Kickoff';
    const topics = [...new Set(ds.flatMap(x => x.tasks.filter(t => t.topic).map(t => t.topic!)))];
    const fe = ds.filter(x => x.s! <= 48).map(x => P.FE[x.s! - 1][0].split(/[:,(]/)[0].trim());
    const ai = [...new Set(ds.map(x => aiUnitOf(x.s!)).filter(Boolean))];
    return [topics.length ? `DSA: ${topics.join(', ')}` : 'DSA: timed sets + OA', fe.length ? `Frontend: ${fe.slice(0, 2).join(', ')}…` : 'Frontend: revision', ai.length ? `AI: ${ai.join('; ')}` : 'AI: explain-it-back revision'].join(' · ');
  };
  return (
    <div className="pb-16">
      <div className="pt-6 pb-4">
        <p className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">{fmtDate(parseISO(state.start))} → {fmtDate(days[TOTAL - 1].date)}</p>
        <h1 className="mt-1.5 font-display text-3xl font-bold tracking-tight sm:text-4xl">13 weeks, one page</h1>
        <p className="mt-1.5 text-muted-foreground">Click a day to open it. Dashed squares are Sundays.</p>
      </div>
      {PHASES.map(([p, range, desc]) => (
        <section key={p} className="mb-6">
          <div className="flex flex-wrap items-baseline gap-3"><h2 className="font-display text-xl font-bold">Phase {p} · {phaseName(p)}</h2><span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{range}</span></div>
          <p className="mt-1 mb-3 max-w-3xl text-sm text-muted-foreground">{desc}</p>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-2.5">
            {[...new Set(days.filter(x => x.phase === p).map(x => x.week))].map(w => (
              <Card key={w} className="gap-2 p-3.5">
                <h4 className="font-display font-bold">Week {w}</h4>
                <p className="text-[13px] text-muted-foreground">{weekSummary(w)}</p>
                <div className="grid grid-cols-7 gap-1">
                  {days.filter(x => x.week === w).map(x => {
                    const st = dayStats(x, state.done), lvl = st.n === 0 ? 0 : st.pct < 0.5 ? 1 : st.pct < 1 ? 2 : 3;
                    return (
                      <button key={x.i} onClick={() => openDay(x.i)} title={`Day ${x.i + 1} · ${fmtDate(x.date)} · ${st.n}/${st.total}`}
                        className={cn('grid aspect-square place-items-center rounded-md border font-mono text-[11px] font-semibold', x.type === 'sun' && 'border-dashed', x.i === ti && 'outline-2 outline-offset-1 outline-foreground', x.i < ti && st.pct < 0.8 && 'border-bad',
                          lvl === 0 && 'bg-muted text-muted-foreground', lvl === 1 && 'bg-primary/25', lvl === 2 && 'bg-primary/55', lvl === 3 && 'bg-primary text-primary-foreground')}>{x.date.getDate()}</button>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>
        </section>
      ))}
      <div className="grid gap-4 md:grid-cols-2 [&>*]:min-w-0">
        <Card className="gap-0 p-4 md:col-span-2"><H3>What each company tests → where the plan covers it</H3><Table head={['Company / round', 'What candidates report', 'In the plan']} rows={P.COMPANY_MAP} /><p className="mt-2 text-[13px] text-muted-foreground">Formats change and differ by team. Confirm each loop with your recruiter.</p></Card>
        <Card className="gap-0 p-4"><H3>Focus rules</H3><ul className="list-disc space-y-1.5 pl-5 text-sm">{P.FOCUS_RULES.map((r: string) => <li key={r}>{r}</li>)}</ul></Card>
        <Card className="gap-0 p-4"><H3>Month 4 · optional, after day 91</H3><ul className="list-disc space-y-1.5 pl-5 text-sm">{P.EXTENSION.map((r: string[]) => <li key={r[0]}><b>{r[0]}:</b> {r[1]}</li>)}</ul></Card>
        <Card className="gap-0 p-4 md:col-span-2"><H3>Forward-deployed engineer roadmap (roadmap.sh) → where it is in this plan</H3><Table head={['Stage', 'Covers', 'In the plan']} rows={P.FDE_STAGES} /></Card>
        <Card className="gap-0 p-4 md:col-span-2"><H3>Whimsical board → where it is in this plan</H3><Table head={['Board section', 'In the plan']} rows={P.BOARD_MAP} /></Card>
        <Card className="gap-0 p-4"><H3>HLD interview framework (from the board)</H3><Table head={['Step', 'Time', 'What to do']} rows={P.HLD_FRAMEWORK} /></Card>
        <Card className="gap-0 p-4"><H3>Rules (from the board)</H3><ul className="list-disc space-y-1.5 pl-5 text-sm">{P.RULES.map((r: string[]) => <li key={r[0]}><b>{r[0]}.</b> {r[1]}</li>)}</ul></Card>
      </div>
    </div>
  );
}
