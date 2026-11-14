'use client';
import { useState } from 'react';
import { ArrowBigUp, ExternalLink, MessageSquare, Eye } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { fmtDate, parseISO, type PulseCompany } from '@/lib/engine';
import { BookmarkButton } from './bookmarks';
import type { ThreadPost, ThreadsFeed } from '@/lib/interview-feed';

export type { ThreadsFeed } from '@/lib/interview-feed';
export type Thread = ThreadPost;
export type CompanyThreads = ThreadsFeed['companies'][string];

const GROUPS = ['All', 'Big tech', 'AI & FDE', 'India product'] as const;
const ROLE_LABEL: Record<string, string> = { frontend: 'Frontend', fde: 'FDE', fullstack: 'Full-stack', swe: 'SWE' };
const CONF = { high: 'text-good border-good', medium: 'text-warn border-warn', low: 'text-muted-foreground' } as const;
const ago = (iso: string) => { const d = Math.round((Date.now() - Date.parse(iso)) / 864e5); return d < 1 ? 'today' : `${d}d ago`; };

/** Weekly Interview pulse: AI summary per company (when available) + top threads ranked by upvotes, comments and views. */
export function InterviewPulse() {
  const { pulse, threads } = useStore();
  const [group, setGroup] = useState<(typeof GROUPS)[number]>('All');
  const [role, setRole] = useState<'all' | 'frontend' | 'fde'>('all');
  const [open, setOpen] = useState<string | null>(null);
  const week = pulse[0];
  const summaries = new Map<string, PulseCompany>((week?.companies || []).map(c => [c.company, c]));
  const list = threads ? Object.entries(threads.companies)
    .filter(([, c]) => group === 'All' || c.group === group)
    .filter(([, c]) => role === 'all' || c.roles.includes(role))
    .sort((a, b) => b[1].engagement - a[1].engagement) : [];

  return (
    <section className="mb-8">
      <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight">Interview pulse</h2>
          <p className="text-sm text-muted-foreground">
            {threads ? `What candidates posted in the last ${threads.window.days} days · ${Object.keys(threads.companies).length} companies · ranked by upvotes, comments and views · updated ${fmtDate(new Date(threads.collectedAt))}` : 'Updated every Sunday morning. Read it on the weekend.'}
          </p>
        </div>
      </div>
      {week && <Card className="mb-3 gap-1 border-primary/30 bg-accent p-4"><div className="font-mono text-[11px] font-semibold uppercase tracking-wider text-accent-foreground">This week · {fmtDate(parseISO(week.weekOf))}</div><p className="text-[15px] leading-relaxed">{week.headline}</p></Card>}

      <div className="mb-3 flex flex-wrap gap-1">
        {GROUPS.map(g => <button key={g} onClick={() => setGroup(g)} aria-pressed={group === g} className="rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground aria-pressed:bg-foreground aria-pressed:text-background">{g}</button>)}
        <span className="mx-1 w-px bg-border" />
        {(['all', 'frontend', 'fde'] as const).map(r => <button key={r} onClick={() => setRole(r)} aria-pressed={role === r} className="rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground aria-pressed:bg-foreground aria-pressed:text-background">{r === 'all' ? 'All roles' : ROLE_LABEL[r]}</button>)}
      </div>

      {!threads && <Card className="p-4 text-sm text-muted-foreground">No threads yet. The first collection runs on Sunday.</Card>}
      {threads && !list.length && <Card className="p-4 text-sm text-muted-foreground">No threads for this filter in the last {threads.window.days} days.</Card>}
      <div className="flex flex-col gap-2">
        {list.map(([name, c]) => {
          const s = summaries.get(name), isOpen = open === name || (open === null && list[0][0] === name);
          return (
            <Card key={name} className="gap-0 overflow-hidden p-0">
              <button onClick={() => setOpen(isOpen ? '' : name)} aria-expanded={isOpen} className="flex w-full flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-left">
                <span className="font-display text-lg font-bold">{name}</span>
                <span className="font-mono text-xs text-muted-foreground">{c.group} · {c.threads} thread{c.threads > 1 ? 's' : ''}</span>
                {c.roles.map(r => <Badge key={r} variant="secondary" className="text-[11px]">{ROLE_LABEL[r] || r}</Badge>)}
                {s && <Badge variant="outline" className={cn('text-[11px]', CONF[s.confidence])}>{s.confidence} confidence</Badge>}
                <span className="ml-auto inline-flex items-center gap-2.5 font-mono text-xs text-muted-foreground"><span className="inline-flex items-center gap-0.5"><ArrowBigUp className="size-3.5" />{c.top.reduce((a, t) => a + t.upvotes, 0)}</span><span className="inline-flex items-center gap-1"><MessageSquare className="size-3" />{c.top.reduce((a, t) => a + t.comments, 0)}</span></span>
              </button>
              {isOpen && (
                <div className="flex flex-col gap-3 border-t px-4 py-3">
                  {s && (
                    <div className="flex flex-col gap-2 text-[14.5px]">
                      <p><b>Loop people report:</b> {s.loop}</p>
                      {s.changes.length > 0 && <div><b>Changes:</b><ul className="mt-0.5 list-disc pl-5">{s.changes.map(x => <li key={x}>{x}</li>)}</ul></div>}
                      {s.questions.length > 0 && <div><b>Questions mentioned:</b><ul className="mt-0.5 list-disc pl-5">{s.questions.map(x => <li key={x}>{x}</li>)}</ul></div>}
                      <p className="rounded-lg bg-accent p-2.5"><b>For your prep:</b> {s.prep}</p>
                    </div>
                  )}
                  <ul className="divide-y rounded-lg border">
                    {c.top.map(t => (
                      <li key={t.url} className="px-3 py-2.5">
                        <a href={t.url} target="_blank" rel="noopener noreferrer" className="font-medium leading-snug hover:underline">{t.title}<ExternalLink className="ml-1 inline size-3 opacity-60" /></a>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 font-mono text-xs text-muted-foreground">
                          <span>{t.source}</span>
                          <span className="inline-flex items-center gap-0.5"><ArrowBigUp className="size-3.5" />{t.upvotes}</span>
                          <span className="inline-flex items-center gap-1"><MessageSquare className="size-3" />{t.comments}</span>
                          {t.views > 0 && <span className="inline-flex items-center gap-1"><Eye className="size-3" />{t.views}</span>}
                          <span>{ago(t.createdAt)}</span>
                          {t.roles.map(r => <span key={r} className="text-primary">{ROLE_LABEL[r] || r}</span>)}
                          <BookmarkButton item={{ kind: 'thread', title: t.title, url: t.url, source: `${name} · ${t.source}`, detail: `${t.upvotes} upvotes · ${t.comments} comments` }} className="-my-1 ml-auto" />
                        </div>
                      </li>
                    ))}
                  </ul>
                  {!s && <p className="text-xs text-muted-foreground">The AI summary for this company appears once the weekly engine has its token. These are real candidate posts: one person&apos;s experience each.</p>}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </section>
  );
}
