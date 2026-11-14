'use client';
/* Phone tab bar: Today, Progress, Notes, More (sheet with Roadmap, News, Setup). Hidden from md up. */
import { useState } from 'react';
import { MoreHorizontal, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { useUI, type View } from '@/components/ui-state';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { NAV, SETUP_NAV, newsUnread } from './app-sidebar';

const pick = (v: View) => [...NAV, SETUP_NAV].find(n => n.v === v)!;
const MAIN = (['today', 'progress', 'notes'] as View[]).map(pick);
const MORE = (['roadmap', 'news', 'setup'] as View[]).map(pick);

export function BottomBar() {
  const { view, go } = useUI();
  const { state, news, threads } = useStore();
  const [more, setMore] = useState(false);
  const unread = newsUnread(state, news, threads);
  const inMore = MORE.some(n => n.v === view);

  const tab = (key: string, label: string, Icon: LucideIcon, active: boolean, onClick: () => void, dot?: boolean) => (
    <button key={key} type="button" data-nav={key} onClick={onClick} aria-current={active ? 'page' : undefined}
      className={cn('relative flex h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium outline-none focus-visible:bg-hover', active ? 'text-foreground' : 'text-muted-foreground')}>
      <Icon className="size-5" strokeWidth={active ? 2 : 1.75} />
      {label}
      {dot && <span className="absolute top-2.5 left-[calc(50%+8px)] size-1.5 rounded-full bg-primary" aria-label="unread news" />}
    </button>
  );

  return (
    <>
      <nav data-shell="bottom-bar" aria-label="Pages" className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-card pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] md:hidden">
        {MAIN.map(n => tab(n.v, n.label, n.icon, view === n.v, () => go(n.v)))}
        {tab('more', 'More', MoreHorizontal, inMore || more, () => setMore(true), unread > 0)}
      </nav>
      <Sheet open={more} onOpenChange={setMore}>
        <SheetContent side="bottom" data-shell="more-sheet" className="rounded-t-[12px] pb-[max(12px,env(safe-area-inset-bottom))] md:hidden">
          <SheetHeader className="pb-0">
            <SheetTitle className="text-[15px]">More</SheetTitle>
            <SheetDescription className="sr-only">Other pages</SheetDescription>
          </SheetHeader>
          <ul className="px-2 pb-2">
            {MORE.map(n => (
              <li key={n.v}>
                <button type="button" data-nav={n.v} onClick={() => { setMore(false); go(n.v); }} aria-current={view === n.v ? 'page' : undefined}
                  className={cn('flex h-11 w-full items-center gap-3 rounded-md px-3 text-[14px] hover:bg-hover', view === n.v ? 'bg-hover font-medium text-foreground' : 'text-foreground')}>
                  <n.icon className="size-4 text-muted-foreground" />
                  {n.label}
                  {n.v === 'news' && unread > 0 && <span className="ml-auto text-[12px] text-muted-foreground tabular-nums">{unread}</span>}
                </button>
              </li>
            ))}
          </ul>
        </SheetContent>
      </Sheet>
    </>
  );
}
