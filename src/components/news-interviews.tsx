'use client';
/* News › Interviews: one LeetCode-Discuss-style feed of interview posts across companies,
   filtered by My targets / All companies / a picked set, role and sort, with the weekly brief on top. */
import { useMemo, useState } from 'react';
import { Check, ChevronDown, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { fmtDate, parseISO } from '@/lib/engine';
import { companyCounts, filterPosts, flattenThreads, sortPosts, type Post, type RoleFilter, type SortKey } from '@/lib/interview-feed';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Chip, OutLink, Seg } from './shell/page';
import { BookmarkButton } from './bookmarks';

/** "just now", "5 h ago", "6 d ago". */
export const ago = (iso: string, now = Date.now()) => {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return '';
  const h = Math.round((now - t) / 36e5);
  return h < 1 ? 'just now' : h < 24 ? `${h} h ago` : `${Math.round(h / 24)} d ago`;
};
/** 2239 → "2.2k". */
export const compact = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '')}k` : String(n));

const roleLabels = (roles: string[]) => {
  const out: string[] = [];
  if (roles.includes('frontend') || roles.includes('fullstack')) out.push('Frontend');
  if (roles.includes('fde')) out.push('FDE');
  return out;
};

type Scope = 'targets' | 'all' | 'custom';
const SCOPES: { value: Scope; label: string }[] = [{ value: 'targets', label: 'My targets' }, { value: 'all', label: 'All companies' }];
const ROLES: { value: RoleFilter; label: string }[] = [{ value: 'all', label: 'All roles' }, { value: 'frontend', label: 'Frontend' }, { value: 'fde', label: 'FDE' }];
const SORTS: { value: SortKey; label: string }[] = [{ value: 'top', label: 'Top' }, { value: 'newest', label: 'Newest' }];

const ctl = 'inline-flex h-8 items-center gap-1.5 rounded-[6px] border border-input bg-card px-2.5 text-[13px] font-medium text-foreground outline-none hover:bg-hover focus-visible:ring-2 focus-visible:ring-ring/50';

export function NewsInterviews() {
  const { state, update, threads, pulse } = useStore();
  const [scope, setScope] = useState<Scope>('targets');
  const [custom, setCustom] = useState<string[]>([]);
  const [role, setRole] = useState<RoleFilter>('all');
  const [sort, setSort] = useState<SortKey>('top');
  const [pickOpen, setPickOpen] = useState(false);

  const posts = useMemo(() => flattenThreads(threads), [threads]);
  const targets = state.targets;
  const selected = scope === 'targets' ? targets : scope === 'all' ? null : custom;
  const shown = sortPosts(filterPosts(posts, { companies: selected, role }), sort);
  const counts = useMemo(() => {
    const c = companyCounts(posts, targets);
    const missing = targets.filter(t => !c.some(x => x.company === t)).map(company => ({ company, count: 0, target: true }));
    return [...c.filter(x => x.target), ...missing, ...c.filter(x => !x.target)];
  }, [posts, targets]);

  const week = pulse[0];
  const one = selected?.length === 1 ? selected[0] : null;
  const summary = one ? week?.companies.find(c => c.company === one) : undefined;

  const toggleCompany = (company: string) => {
    const base = scope === 'custom' ? custom : [];
    const next = base.includes(company) ? base.filter(c => c !== company) : [...base, company];
    setCustom(next);
    setScope(next.length ? 'custom' : 'targets');
  };
  const togglePin = (company: string) => update(s => ({ ...s, targets: s.targets.includes(company) ? s.targets.filter(t => t !== company) : [...s.targets, company] }));
  const clearCustom = () => { setCustom([]); setScope('targets'); };
  const markRead = (p: Post) => { const k = `t-${p.url}`; if (!state.seenUpdates[k]) update(s => ({ ...s, seenUpdates: { ...s.seenUpdates, [k]: Date.now() } })); };

  return (
    <div>
      <div data-filters className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-2.5">
        <Seg value={scope} onChange={v => { setScope(v); setCustom([]); }} options={SCOPES} />
        <div className="flex items-center">
          <Popover open={pickOpen} onOpenChange={setPickOpen}>
            <PopoverTrigger data-companies className={cn(ctl, scope === 'custom' && 'rounded-r-none border-r-0')} aria-label="Pick companies">
              <span className="max-w-[140px] truncate">{scope === 'custom' ? (custom.length === 1 ? custom[0] : `${custom.length} companies`) : 'Companies'}</span>
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </PopoverTrigger>
            <PopoverContent align="start" className="w-[min(320px,calc(100vw-32px))] rounded-[12px] p-0">
              <Command>
                <CommandInput placeholder="Find a company" />
                <CommandList className="max-h-[min(360px,50vh)]">
                  <CommandEmpty>No company matches.</CommandEmpty>
                  {[{ heading: 'Your targets', rows: counts.filter(c => c.target) }, { heading: 'Other companies', rows: counts.filter(c => !c.target) }].map(g => !!g.rows.length && (
                    <CommandGroup key={g.heading} heading={g.heading}>
                      {g.rows.map(c => {
                        const on = scope === 'custom' && custom.includes(c.company);
                        return (
                          <CommandItem key={c.company} value={c.company} onSelect={() => toggleCompany(c.company)} className="gap-2 text-[13px]">
                            <span aria-hidden="true" className={cn('grid size-4 shrink-0 place-items-center rounded-[4px] border', on ? 'border-primary bg-primary text-primary-foreground' : 'border-input')}>
                              {on && <Check className="size-3 text-current" />}
                            </span>
                            <span className="min-w-0 flex-1 truncate">{c.company}</span>
                            <span className="shrink-0 text-[12px] text-faint tabular-nums">{c.count}</span>
                            <button type="button" onClick={e => { e.stopPropagation(); e.preventDefault(); togglePin(c.company); }}
                              className="shrink-0 rounded-[5px] px-1.5 py-0.5 text-[12px] text-muted-foreground hover:bg-card hover:text-foreground">
                              {c.target ? 'Unpin' : 'Pin as a target'}
                            </button>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  ))}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {scope === 'custom' && (
            <button type="button" onClick={clearCustom} aria-label="Clear picked companies" className={cn(ctl, 'rounded-l-none px-2 text-muted-foreground')}><X className="size-3.5" /></button>
          )}
        </div>
        <Seg value={role} onChange={setRole} options={ROLES} />
        <div className="sm:ml-auto"><Seg value={sort} onChange={setSort} options={SORTS} /></div>
      </div>

      {week && (
        <Collapsible className="border-b border-border">
          <CollapsibleTrigger className="group/brief flex min-h-10 w-full items-center gap-2 px-4 py-2 text-left text-[13px] outline-none hover:bg-hover focus-visible:bg-hover">
            <ChevronRight className="size-3.5 shrink-0 text-muted-foreground transition-transform group-data-[state=open]/brief:rotate-90" />
            <span className="shrink-0 font-medium">This week</span>
            <span className="min-w-0 flex-1 truncate text-muted-foreground group-data-[state=open]/brief:whitespace-normal">{week.headline}</span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="space-y-3 bg-band px-4 pt-1 pb-4 pl-[38px] text-[13px] leading-relaxed text-muted-foreground">
              <p className="text-[12px] text-faint">Week of {fmtDate(parseISO(week.weekOf))} · {week.companies.length} companies</p>
              {week.companies.some(c => c.changes.length) && (
                <div>
                  <p className="font-medium text-foreground">Changes</p>
                  <ul className="mt-1 list-disc space-y-0.5 pl-4">
                    {week.companies.flatMap(c => c.changes.map((ch, i) => <li key={`${c.company}-${i}`}><span className="text-foreground">{c.company}:</span> {ch}</li>))}
                  </ul>
                </div>
              )}
              {week.companies.some(c => c.prep) && (
                <div>
                  <p className="font-medium text-foreground">What to change in your prep</p>
                  <ul className="mt-1 space-y-0.5">
                    {week.companies.filter(c => c.prep).map(c => <li key={c.company}><span className="text-foreground">{c.company}:</span> {c.prep}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {summary && (
        <div data-company-summary className="space-y-2 border-b border-border px-4 py-3 text-[13px] leading-relaxed text-muted-foreground">
          <p className="text-[12px] text-faint">#{summary.company} this week · {summary.reports} report{summary.reports === 1 ? '' : 's'} · {summary.confidence} confidence</p>
          {summary.loop && <p className="text-foreground">{summary.loop}</p>}
          {!!summary.changes.length && <ul className="list-disc space-y-0.5 pl-4">{summary.changes.map((c, i) => <li key={i}>{c}</li>)}</ul>}
          {summary.prep && <p><span className="font-medium text-foreground">Prep:</span> {summary.prep}</p>}
        </div>
      )}

      {!shown.length ? <p className="px-4 py-3 text-[13px] text-muted-foreground">No posts for these filters.</p> : shown.map(p => (
        <OutLink key={`${p.company}-${p.url}`} data-post data-company={p.company} href={p.url} title={p.title.trim()} read={!!state.seenUpdates[`t-${p.url}`]} onOpen={() => markRead(p)}
          tags={<>
            <Chip className="h-[18px] px-1 text-[11px] text-foreground">#{p.company}</Chip>
            {roleLabels(p.roles).map(r => <Chip key={r} data-role-chip className="h-[18px] px-1 text-[11px]">{r}</Chip>)}
          </>}
          meta={<>{ago(p.createdAt)} · ↑ {compact(p.upvotes)} · {compact(p.comments)} comments · {compact(p.views)} views</>}
          saved={<BookmarkButton item={{ kind: 'thread', title: p.title.trim(), url: p.url, source: `${p.company} · ${p.source}`, detail: `${p.upvotes} upvotes · ${p.comments} comments` }} />} />
      ))}
    </div>
  );
}
