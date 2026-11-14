'use client';
/* Roadmap › Reference: plan changes first, then the reference tables, each folded with a count. */
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { P, catName, fmtDate, parseISO, type UpdateItem } from '@/lib/engine';
import { domainOf } from '@/lib/interview-feed';
import { Band, Chip, Row } from './shell/page';
import { BookmarkButton } from './bookmarks';
import { useUI } from './ui-state';

const KIND = { new: 'New', outdated: 'Outdated', changed: 'Changed' } as const;
const PRIO = { must: 'Must-read', should: 'Worth reading', fyi: 'FYI' } as const;

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className={cn("w-full border-collapse text-[13px] leading-snug", head.length > 2 && "min-w-[560px]")}>
        <thead><tr>{head.map(h => <th key={h} className="border-b border-border px-4 py-2 text-left text-[12px] font-medium text-muted-foreground">{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i} className="border-b border-border last:border-b-0">{r.map((c, j) => <td key={j} className={cn('px-4 py-2 align-top', j === 0 ? 'font-medium text-foreground' : 'text-muted-foreground')}>{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

const List = ({ items }: { items: ReactNode[] }) => <>{items.map((x, i) => <Row key={i} className="py-2.5 leading-snug">{x}</Row>)}</>;
const Note = ({ children }: { children: ReactNode }) => <p className="border-t border-border px-4 py-2.5 text-[12px] text-faint">{children}</p>;

function Ref({ id, title, n, children }: { id: string; title: string; n: number; children: ReactNode }) {
  return <Band id={id} title={title} defaultOpen={false} right={<Chip>{n}</Chip>}><div className="border-t border-border">{children}</div></Band>;
}

function ChangeRow({ u }: { u: UpdateItem }) {
  const { state, update, days } = useStore();
  const seen = !!state.seenUpdates[u.id];
  const setSeen = (v: boolean) => update(s => { const m = { ...s.seenUpdates }; if (v) m[u.id] = Date.now(); else delete m[u.id]; return { ...s, seenUpdates: m }; });
  const day = days.find(d => d.tasks.some(t => t.id === `upd-${u.id}`));
  const href = u.replacementUrl || u.url;
  const area = catName[u.area] || u.area;
  const body = (
    <>
      <span className="flex flex-wrap items-center gap-1.5">
        <Chip>{KIND[u.kind]}</Chip>
        <Chip>{PRIO[u.priority]}</Chip>
        <span className="text-[12px] text-faint">{area} · {fmtDate(parseISO(u.date))}</span>
      </span>
      <span className={cn('mt-1.5 block text-[14px] font-medium leading-snug', seen ? 'text-muted-foreground' : 'text-foreground')}>{u.title}</span>
      <span className="mt-0.5 block text-[13px] leading-snug text-muted-foreground">{u.why}</span>
      <span className="mt-1.5 flex flex-wrap gap-x-3 text-[12px] text-faint">
        {href && <span className="group-hover/out:text-foreground">{domainOf(href)} ↗</span>}
        {day && <span>Added to day {day.no} ({fmtDate(day.date)})</span>}
      </span>
    </>
  );
  return (
    <div data-update={u.id} data-seen={seen || undefined} className={cn('group/out flex items-start border-t border-border first:border-t-0', href && 'hover:bg-hover')}>
      {href
        ? <a href={href} target="_blank" rel="noopener noreferrer" onClick={() => setSeen(true)} className="block min-w-0 flex-1 py-3 pr-2 pl-4 outline-none focus-visible:bg-hover">
            {body}<span className="sr-only">(opens in a new tab)</span>
          </a>
        : <div className="min-w-0 flex-1 py-3 pr-2 pl-4">{body}</div>}
      <div className="flex shrink-0 flex-col items-end gap-1 py-2 pr-3">
        {href && <BookmarkButton item={{ kind: 'update', title: u.title, url: href, source: area, detail: PRIO[u.priority] }} className="font-sans" />}
        <Button variant="ghost" size="xs" className="text-muted-foreground" onClick={() => setSeen(!seen)}>{seen ? 'Mark unread' : 'Mark read'}</Button>
      </div>
    </div>
  );
}

export function RoadmapReference() {
  const { state, updates } = useStore();
  const { openChanges, setOpenChanges } = useUI();
  const changes = [...updates].sort((a, b) => b.date.localeCompare(a.date));
  const unseen = changes.filter(u => !state.seenUpdates[u.id] && u.priority !== 'fyi').length;
  return (
    <>
      <Band id="changes" title="Changes" count={changes.length || undefined} open={openChanges} onOpenChange={setOpenChanges}
        right={unseen > 0 ? <Chip className="text-foreground">{unseen} unread</Chip> : undefined}>
        <div className="border-t border-border">
          {changes.length
            ? changes.map(u => <ChangeRow key={u.id} u={u} />)
            : <p className="px-4 py-3 text-[13px] text-muted-foreground">No changes yet. When a link breaks or a resource goes out of date, the weekly engine fixes it here and in your tasks.</p>}
        </div>
      </Band>
      <Ref id="company-loops" title="Company loops" n={P.COMPANY_MAP.length}>
        <Table head={['Company / round', 'What candidates report', 'In the plan']} rows={P.COMPANY_MAP} />
        <Note>Formats change and differ by team. Confirm each loop with your recruiter.</Note>
      </Ref>
      <Ref id="focus-rules" title="Focus rules" n={P.FOCUS_RULES.length}>
        <List items={P.FOCUS_RULES} />
      </Ref>
      <Ref id="board-rules" title="Board rules" n={P.RULES.length}>
        <List items={P.RULES.map((r: string[]) => <span key={r[0]}><span className="font-medium">{r[0]}.</span> <span className="text-muted-foreground">{r[1]}</span></span>)} />
      </Ref>
      <Ref id="hld-framework" title="HLD interview framework" n={P.HLD_FRAMEWORK.length}>
        <Table head={['Step', 'Time', 'What to do']} rows={P.HLD_FRAMEWORK} />
      </Ref>
      <Ref id="fde-roadmap" title="Forward-deployed roadmap (roadmap.sh)" n={P.FDE_STAGES.length}>
        <Table head={['Stage', 'Covers', 'In the plan']} rows={P.FDE_STAGES} />
      </Ref>
      <Ref id="whimsical-board" title="Whimsical board → where it is in the plan" n={P.BOARD_MAP.length}>
        <Table head={['Board section', 'In the plan']} rows={P.BOARD_MAP} />
      </Ref>
      <Ref id="month-4" title="Month 4 · optional, after day 91" n={P.EXTENSION.length}>
        <List items={P.EXTENSION.map((r: string[]) => <span key={r[0]}><span className="font-medium">{r[0]}:</span> <span className="text-muted-foreground">{r[1]}</span></span>)} />
      </Ref>
    </>
  );
}
