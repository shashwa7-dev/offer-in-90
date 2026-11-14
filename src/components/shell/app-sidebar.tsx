'use client';
/* Desktop sidebar: mark + status line, page nav with the News unread count, New task, Setup and the sync line. */
import { CalendarCheck2, ChartLine, Map as MapIcon, Newspaper, NotebookPen, Plus, Settings, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore, type State } from '@/lib/store';
import { overall, TOTAL, type Day, type NewsFeed } from '@/lib/engine';
import type { ThreadsFeed } from '@/lib/interview-feed';
import { useUI, type View } from '@/components/ui-state';
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader,
  SidebarMenu, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarRail,
} from '@/components/ui/sidebar';

export const NAV: { v: View; label: string; icon: LucideIcon }[] = [
  { v: 'today', label: 'Today', icon: CalendarCheck2 },
  { v: 'progress', label: 'Progress', icon: ChartLine },
  { v: 'roadmap', label: 'Roadmap', icon: MapIcon },
  { v: 'notes', label: 'Notes', icon: NotebookPen },
  { v: 'news', label: 'News', icon: Newspaper },
];
export const SETUP_NAV = { v: 'setup' as View, label: 'Setup', icon: Settings };

/** Unread links in the latest Reading day + interview posts newer than the last Interviews visit. */
export function newsUnread(state: Pick<State, 'seenUpdates'>, news: NewsFeed | null, threads: ThreadsFeed | null): number {
  const seen = state.seenUpdates || {};
  let n = 0;
  const latest = news ? Object.keys(news.days).sort().pop() : undefined;
  if (news && latest) n += news.days[latest].filter(it => !seen[`n-${it.id}`]).length;
  if (threads) {
    const since = seen['interviews-visit'] ?? 0;
    for (const c of Object.values(threads.companies || {})) for (const p of c.top || []) {
      const t = Date.parse(p.createdAt);
      if (!Number.isNaN(t) && t > since) n++;
    }
  }
  return n;
}

/** "Day N of 91 · on track", "prep day", "starts in Nd" or "complete". */
export function statusLine(days: Day[], todayIdx: number, done: Record<string, number>): string {
  if (todayIdx < 0) return `starts in ${-todayIdx}d`;
  if (todayIdx >= days.length) return 'complete';
  const d = days[todayIdx];
  if (d.no === 0) return 'prep day';
  const [k, label] = overall(days, done, todayIdx).status;
  return `Day ${d.no} of ${TOTAL} · ${k === 'ok' ? 'on track' : label}`;
}

const hhmm = (t: number) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

export function syncLine(sync: { state: string; msg?: string; at?: number }, configured: boolean): string {
  if (!configured) return 'Saved on this device';
  if (sync.state === 'syncing') return 'Syncing…';
  if (sync.state === 'error') return sync.msg || 'Sync failed';
  return sync.at ? `Synced ${hhmm(sync.at)}` : 'Synced';
}

export function AppSidebar() {
  const { state, days, todayIdx, news, threads, sync, syncConfigured } = useStore();
  const { view, go, newTask } = useUI();
  const unread = newsUnread(state, news, threads);
  const item = (n: { v: View; label: string; icon: LucideIcon }, badge?: number) => (
    <SidebarMenuItem key={n.v}>
      <SidebarMenuButton data-nav={n.v} isActive={view === n.v} tooltip={n.label} onClick={() => go(n.v)} aria-current={view === n.v ? 'page' : undefined}>
        <n.icon />
        <span>{n.label}</span>
      </SidebarMenuButton>
      {!!badge && <SidebarMenuBadge className="text-muted-foreground" aria-label={`${badge} unread`}>{badge}</SidebarMenuBadge>}
    </SidebarMenuItem>
  );

  return (
    <Sidebar collapsible="icon" className="border-border">
      <SidebarHeader className="px-3 pt-3 group-data-[collapsible=icon]:px-2">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-md bg-primary text-[13px] font-semibold text-primary-foreground tabular-nums">90</span>
          <div className="min-w-0 leading-tight group-data-[collapsible=icon]:hidden">
            <div className="truncate text-[14px] font-semibold">Offer in 90</div>
            <div className="truncate text-[12px] text-muted-foreground tabular-nums" data-shell="status">{statusLine(days, todayIdx, state.done)}</div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem className="mb-1">
                <SidebarMenuButton variant="outline" tooltip="New task (C)" onClick={() => newTask()} data-shell="new-task" className="bg-card">
                  <Plus />
                  <span>New task</span>
                  <kbd className="ml-auto text-[11px] text-faint group-data-[collapsible=icon]:hidden">C</kbd>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {NAV.map(n => item(n, n.v === 'news' ? unread : undefined))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="pb-3">
        <SidebarMenu>{item(SETUP_NAV)}</SidebarMenu>
        <div className={cn('truncate px-2 text-[12px] tabular-nums group-data-[collapsible=icon]:hidden', sync.state === 'error' ? 'text-muted-foreground' : 'text-faint')} data-shell="sync" title={sync.state === 'error' ? sync.msg : undefined}>
          {syncLine(sync, syncConfigured)}
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
