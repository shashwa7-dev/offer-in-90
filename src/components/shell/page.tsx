'use client';
/* Shared building blocks for every page: sheet, header, collapsible band, row, chip, ring, segmented toggle, summary row, outside link. */
import { Fragment, useState, type HTMLAttributes, type KeyboardEvent, type ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { domainOf } from '@/lib/interview-feed';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

/** White sheet on the grey canvas. */
export function Surface({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('overflow-hidden rounded-[10px] border border-border bg-card', className)}>{children}</div>;
}

type Crumb = string | { label: string; onClick: () => void };

/** Page title line: sidebar toggle (desktop), breadcrumb, optional count, actions on the right. */
export function PageHeader({ crumbs, count, actions, keepLast }: { crumbs: Crumb[]; count?: string; actions?: ReactNode; /** Keep the last crumb whole; earlier crumbs truncate first. */ keepLast?: boolean }) {
  return (
    <header className="flex min-h-12 items-center gap-2 py-2">
      <SidebarTrigger className="-ml-1.5 hidden text-muted-foreground md:inline-flex" />
      <Breadcrumb className="min-w-0">
        <BreadcrumbList className="flex-nowrap text-[14px] sm:gap-1.5">
          {crumbs.map((c, i) => {
            const last = i === crumbs.length - 1;
            const label = typeof c === 'string' ? c : c.label;
            return (
              <Fragment key={i}>
                {i > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem className={cn(last !== !!keepLast ? 'min-w-0' : 'shrink-0')}>
                  {typeof c !== 'string'
                    ? <button type="button" onClick={c.onClick} className="rounded-[5px] text-muted-foreground transition-colors hover:text-foreground">{label}</button>
                    : last ? <BreadcrumbPage className="truncate font-medium">{label}</BreadcrumbPage>
                    : <span className="truncate text-muted-foreground">{label}</span>}
                </BreadcrumbItem>
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
      {count && <span className="shrink-0 text-[13px] text-faint tabular-nums">{count}</span>}
      {actions && <div className="ml-auto flex shrink-0 items-center gap-1.5">{actions}</div>}
    </header>
  );
}

/** Collapsible grey band with a title, a short count and an optional right-hand slot. */
export function Band({ title, count, right, defaultOpen = true, open: openProp, onOpenChange, id, children }: { title: string; count?: ReactNode; right?: ReactNode; defaultOpen?: boolean; /** Controlled open state (optional). */ open?: boolean; onOpenChange?: (v: boolean) => void; /** Sets data-band, for scrolling to and tests. */ id?: string; children: ReactNode }) {
  const [own, setOwn] = useState(defaultOpen);
  const open = openProp ?? own;
  const setOpen = (v: boolean) => { setOwn(v); onOpenChange?.(v); };
  return (
    <Collapsible open={open} onOpenChange={setOpen} data-band={id} className="scroll-mt-4 border-b border-border last:border-b-0">
      <div className="flex h-9 items-center gap-2 bg-band px-4">
        <CollapsibleTrigger className="-ml-1 flex min-w-0 flex-1 items-center gap-1.5 rounded-[5px] py-1 pl-1 text-left text-[13px] font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
          <ChevronRight className={cn('size-3.5 shrink-0 text-muted-foreground transition-transform', open && 'rotate-90')} />
          <span className="truncate">{title}</span>
          {count != null && count !== '' && <span className="shrink-0 font-normal text-faint tabular-nums">{count}</span>}
        </CollapsibleTrigger>
        {right && <div className="flex shrink-0 items-center gap-1.5">{right}</div>}
      </div>
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
  );
}

/** 40px list row with a hairline; `now` gets an ink left edge, `stone` the muted tint. */
export function Row({ children, className, onClick, tone, ...rest }: { children: ReactNode; className?: string; onClick?: () => void; tone?: 'now' | 'stone' } & Omit<HTMLAttributes<HTMLDivElement>, 'onClick' | 'className' | 'children'>) {
  const onKey = onClick ? (e: KeyboardEvent<HTMLDivElement>) => { if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onClick(); } } : undefined;
  return (
    <div
      {...rest}
      onClick={onClick}
      onKeyDown={onKey}
      tabIndex={onClick ? 0 : undefined}
      data-tone={tone}
      className={cn(
        'flex min-h-10 items-center gap-3 border-t border-border px-4 text-[13px] text-foreground first:border-t-0',
        onClick && 'cursor-pointer outline-none hover:bg-hover focus-visible:bg-hover',
        tone === 'now' && 'shadow-[inset_2px_0_0_var(--primary)]',
        tone === 'stone' && 'bg-stone text-stone-foreground hover:bg-stone',
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Small bordered tag. */
export function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn('inline-flex h-5 shrink-0 items-center gap-1 whitespace-nowrap rounded-[5px] border border-border bg-card px-1.5 text-[12px] text-muted-foreground tabular-nums', className)}>{children}</span>;
}

/** Status ring: dashed = nothing done, arc = partly done, filled check = all done. */
export function Ring({ done, total, tone, size = 16 }: { done: number; total: number; tone?: 'stone'; size?: number }) {
  const ink = tone === 'stone' ? 'var(--stone-foreground)' : 'var(--primary)';
  const r = 6, c = 2 * Math.PI * r, pct = total ? Math.min(1, done / total) : 0;
  const label = total ? `${done} of ${total} done` : 'nothing to do';
  if (total && done >= total) return (
    <svg viewBox="0 0 16 16" width={size} height={size} className="shrink-0" role="img" aria-label={label}>
      <circle cx="8" cy="8" r="7" fill={ink} />
      <path d="M5 8.2l2 2 4-4.2" fill="none" stroke="var(--card)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} className="shrink-0" role="img" aria-label={label}>
      {done > 0
        ? <>
            <circle cx="8" cy="8" r={r} fill="none" stroke={ink} strokeWidth="1.5" opacity="0.2" />
            <circle cx="8" cy="8" r={r} fill="none" stroke={ink} strokeWidth="1.5" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} transform="rotate(-90 8 8)" />
          </>
        : <circle cx="8" cy="8" r={r} fill="none" stroke={tone === 'stone' ? ink : 'var(--faint)'} strokeWidth="1.5" strokeDasharray="2.4 2.3" />}
    </svg>
  );
}

/** Segmented control (single choice) built on ToggleGroup. */
export function Seg<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: string; count?: ReactNode }[]; onChange: (v: T) => void }) {
  return (
    <ToggleGroup type="single" value={value} onValueChange={v => { if (v) onChange(v as T); }} className="h-8 gap-0.5 rounded-md bg-hover p-0.5">
      {options.map(o => (
        <ToggleGroupItem
          key={o.value}
          value={o.value}
          className="h-7 min-w-0 gap-1.5 rounded-[5px]! px-2.5 text-[13px] font-medium text-muted-foreground hover:bg-transparent hover:text-foreground data-[state=on]:bg-card data-[state=on]:text-foreground data-[state=on]:shadow-[0_0_0_1px_var(--border)]"
        >
          {o.label}
          {o.count != null && <span className="text-faint tabular-nums">{o.count}</span>}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

/** Plane-cycle style summary: a percentage ring, then label/value pairs. */
export function SummaryRow({ ring, items }: { ring: { pct: number; label: string }; items: { k: string; v: ReactNode }[] }) {
  const pct = Math.max(0, Math.min(1, Number.isFinite(ring.pct) ? ring.pct : 0));
  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-3 px-4 py-3">
      <div className="flex items-center gap-2.5">
        <Ring done={Math.round(pct * 100)} total={100} size={32} />
        <div className="leading-tight">
          <div className="text-[15px] font-semibold tabular-nums">{Math.round(pct * 100)}%</div>
          <div className="text-[12px] text-muted-foreground">{ring.label}</div>
        </div>
      </div>
      {items.map(it => (
        <div key={it.k} className="leading-tight">
          <div className="text-[12px] text-muted-foreground">{it.k}</div>
          <div className="text-[14px] font-medium tabular-nums">{it.v}</div>
        </div>
      ))}
    </div>
  );
}

/** Outside link row: the whole row opens in a new tab, shows site initial, domain and ↗, greys out once opened. */
export function OutLink({ href, title, meta, read, onOpen, saved }: { href: string; title: string; meta: ReactNode; read: boolean; onOpen: () => void; saved?: ReactNode }) {
  const domain = domainOf(href);
  return (
    <div className="group/out flex min-h-12 items-center border-t border-border first:border-t-0 hover:bg-hover">
      <a href={href} target="_blank" rel="noopener noreferrer" onClick={onOpen} data-read={read || undefined} className="flex min-w-0 flex-1 items-center gap-3 py-2 pl-4 pr-2 outline-none focus-visible:bg-hover">
        <span aria-hidden="true" className="grid size-6 shrink-0 place-items-center rounded-[5px] border border-border bg-band text-[11px] font-semibold uppercase text-muted-foreground">{domain.charAt(0)}</span>
        <span className="min-w-0 flex-1">
          <span className={cn('block truncate text-[13px] font-medium', read ? 'text-muted-foreground' : 'text-foreground')}>{title}</span>
          <span className="block truncate text-[12px] text-faint">{domain} · {meta}</span>
        </span>
        <span aria-hidden="true" className="shrink-0 text-[13px] text-faint group-hover/out:text-foreground">↗</span>
        <span className="sr-only">(opens in a new tab)</span>
      </a>
      {saved && <div className="shrink-0 pr-3">{saved}</div>}
    </div>
  );
}
