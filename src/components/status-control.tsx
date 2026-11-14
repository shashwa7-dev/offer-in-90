'use client';
/* Linear-style task status: icon button (click toggles Done <-> Not started), a menu with all four statuses, keys S and 1-4. */
import { useCallback, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { STATUS_LABEL, applyStatus, statusOf, type TaskStatus } from '@/lib/task-status';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuShortcut, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export const STATUS_ORDER: TaskStatus[] = ['todo', 'progress', 'done', 'skipped'];
const KEY_STATUS: Record<string, TaskStatus> = { 1: 'todo', 2: 'progress', 3: 'done', 4: 'skipped' };
// Light: about #b4b7ba; dark: the same mix toward the dark card.
const DASH = 'color-mix(in srgb, var(--faint) 65%, var(--card))';

/** 16px status glyph: dashed circle, half-filled, filled with a check, circle with a slash. Ink and greys only. */
export function StatusIcon({ status, size = 16, className }: { status: TaskStatus; size?: number; className?: string }) {
  const props = { viewBox: '0 0 16 16', width: size, height: size, className: cn('shrink-0', className), 'aria-hidden': true as const };
  if (status === 'done') return (
    <svg {...props}>
      <circle cx="8" cy="8" r="7" fill="var(--primary)" />
      <path d="M5 8.2l2 2 4-4.2" fill="none" stroke="var(--card)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  if (status === 'progress') return (
    <svg {...props}>
      <circle cx="8" cy="8" r="6.25" fill="none" stroke="var(--primary)" strokeWidth="1.5" />
      <path d="M8 4a4 4 0 0 0 0 8z" fill="var(--primary)" />
    </svg>
  );
  if (status === 'skipped') return (
    <svg {...props}>
      <circle cx="8" cy="8" r="6.25" fill="none" stroke="var(--faint)" strokeWidth="1.5" />
      <path d="M4 12L12 4" stroke="var(--faint)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
  return (
    <svg {...props}>
      <circle cx="8" cy="8" r="6.25" fill="none" stroke={DASH} strokeWidth="1.5" strokeDasharray="2.4 2.5" />
    </svg>
  );
}

/** Current status of a task and a setter that writes both maps through update(), so stamp() records both. */
export function useTaskStatus(taskId: string): [TaskStatus, (next: TaskStatus) => void] {
  const { state, update } = useStore();
  const status = statusOf(taskId, state.done, state.status);
  const set = useCallback((next: TaskStatus) => update(s => ({ ...s, ...applyStatus({ done: s.done, status: s.status }, taskId, next, Date.now()) })), [update, taskId]);
  return [status, set];
}

const typing = (el: EventTarget | null) => {
  const n = el as HTMLElement | null;
  return !!n && (n.tagName === 'INPUT' || n.tagName === 'TEXTAREA' || n.tagName === 'SELECT' || n.isContentEditable);
};

/** Status keys: S opens the menu, 1-4 set a status. Returns true when the key was used. */
export function statusKey(e: { key: string; target: EventTarget | null; metaKey: boolean; ctrlKey: boolean; altKey: boolean; repeat?: boolean; preventDefault: () => void }, set: (s: TaskStatus) => void, openMenu: () => void): boolean {
  if (e.metaKey || e.ctrlKey || e.altKey || typing(e.target)) return false;
  const next = KEY_STATUS[e.key];
  if (next) { e.preventDefault(); if (!e.repeat) set(next); return true; }
  if (e.key === 's' || e.key === 'S') { e.preventDefault(); openMenu(); return true; }
  return false;
}

/** Icon button plus a ▾ menu trigger (shown on hover/focus with a mouse, always on touch). The parent can own the menu's open state. */
export function StatusControl({ taskId, label, open: openProp, onOpenChange, showMenu = 'hover', className }: { taskId: string; label: string; open?: boolean; onOpenChange?: (v: boolean) => void; /** 'hover': ▾ shows on row hover/focus (always on touch). */ showMenu?: 'hover' | 'always'; className?: string }) {
  const [status, set] = useTaskStatus(taskId);
  const [openOwn, setOpenOwn] = useState(false);
  const open = openProp ?? openOwn;
  const setOpen = onOpenChange ?? setOpenOwn;
  return (
    <span className={cn('inline-flex shrink-0 items-center', className)} data-status={status}>
      <button type="button" data-status-icon onClick={() => set(status === 'done' ? 'todo' : 'done')}
        aria-label={`${label}: ${STATUS_LABEL[status]}`} aria-pressed={status === 'done'} title={`${STATUS_LABEL[status]} · click to ${status === 'done' ? 'reopen' : 'mark done'}`}
        className="relative inline-flex size-4 items-center justify-center rounded-full outline-none before:absolute before:-inset-2 before:content-[''] focus-visible:ring-2 focus-visible:ring-ring/50">
        <StatusIcon status={status} />
      </button>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger data-status-menu aria-label={`Change status of ${label}`} title="Change status (S)"
          className={cn('relative ml-0.5 inline-flex h-4 w-3.5 items-center justify-center rounded-[4px] text-faint outline-none hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 data-[state=open]:opacity-100',
            showMenu === 'hover' && '[@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-within:opacity-100 [@media(hover:hover)]:focus-visible:opacity-100')}>
          <ChevronDown className="size-3" />
        </DropdownMenuTrigger>
        <StatusMenuContent status={status} set={set} close={() => setOpen(false)} />
      </DropdownMenu>
    </span>
  );
}

function StatusMenuContent({ status, set, close }: { status: TaskStatus; set: (s: TaskStatus) => void; close: () => void }) {
  return (
    <DropdownMenuContent align="start" className="min-w-48 rounded-[12px] p-1"
      // A right-click opens the menu under the pointer; its button release must not pick the item beneath it.
      onPointerUpCapture={e => { if (e.button === 2) e.preventDefault(); }}
      onKeyDown={e => { const next = KEY_STATUS[e.key]; if (next && !e.metaKey && !e.ctrlKey && !e.altKey) { e.preventDefault(); set(next); close(); } }}>
      {STATUS_ORDER.map((s, i) => (
        <DropdownMenuItem key={s} onSelect={() => set(s)} role="menuitemradio" aria-checked={s === status} data-status-option={s} className="gap-2 text-[13px]">
          <StatusIcon status={s} />
          <span className="flex-1">{STATUS_LABEL[s]}</span>
          <Check className={cn('size-3.5 text-foreground', s !== status && 'invisible')} aria-hidden="true" />
          <DropdownMenuShortcut className="ml-1 tracking-normal tabular-nums">{i + 1}</DropdownMenuShortcut>
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  );
}
