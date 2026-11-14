'use client';
/* Day and Block pickers shared by the New task dialog and the task peek: a chip that opens a Popover. */
import { useState, type ReactNode } from 'react';
import { CalendarDays, Check, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { isSkipped } from '@/lib/task-status';
import { pickable } from '@/lib/own-tasks';
import { fmtDate, iso, parseISO, toMin, type Day } from '@/lib/engine';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

export const chipBtn = 'inline-flex h-7 max-w-full min-w-0 items-center gap-1.5 rounded-[5px] border border-input bg-card px-2 text-[12px] text-foreground outline-none hover:bg-hover focus-visible:ring-2 focus-visible:ring-ring/40 [&_svg]:size-3.5 [&_svg]:shrink-0 [&_svg]:text-muted-foreground';
export const nowMin = () => { const n = new Date(); return n.getHours() * 60 + n.getMinutes(); };
export const dayLabel = (d: Day) => `Day ${d.no}`;

/** "Today", "Tomorrow" or "Thu 12 Nov". */
export function useDateLabel() {
  const { days, todayIdx } = useStore();
  return (date: string) => {
    const i = days.findIndex(d => iso(d.date) === date);
    return i >= 0 && i === todayIdx ? 'Today' : i >= 0 && i === todayIdx + 1 ? 'Tomorrow' : fmtDate(parseISO(date));
  };
}

export function DayPick({ value, onChange, className, chip = 'day' }: { value: string; onChange: (date: string) => void; className?: string; chip?: string }) {
  const { days } = useStore();
  const label = useDateLabel();
  const [open, setOpen] = useState(false);
  const sel = parseISO(value);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className={cn(chipBtn, className)} data-chip={chip} aria-label={`Day: ${label(value)}`}>
        <CalendarDays /><span className="truncate">{label(value)}</span>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto rounded-[12px] p-0">
        <Calendar mode="single" selected={sel} defaultMonth={sel} required
          disabled={days.length ? [{ before: days[0].date }, { after: days[days.length - 1].date }] : undefined}
          onSelect={d => { if (d) { onChange(iso(d)); setOpen(false); } }} />
      </PopoverContent>
    </Popover>
  );
}

export function BlockPick({ day, value, onChange, className }: { day: Day; value: string; onChange: (k: string) => void; className?: string }) {
  const { state, todayIdx } = useStore();
  const [open, setOpen] = useState(false);
  const list = pickable(day.blocks);
  const cur = day.blocks.find(b => b.k === value);
  const nm = nowMin(), today = day.i === todayIdx;
  const hint = (b: Day['blocks'][number]): ReactNode =>
    today && nm >= toMin(b.s) && nm < toMin(b.e) ? 'now'
      : b.tasks.length && b.tasks.every(t => state.done[t.id] || isSkipped(t.id, state.done, state.status)) && b.tasks.some(t => state.done[t.id]) ? 'done' : null;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className={cn(chipBtn, className)} data-chip="block" aria-label={`Block: ${cur ? `${cur.s} ${cur.title}` : 'none'}`}>
        <Clock /><span className="truncate">{cur ? <><span className="tabular-nums">{cur.s}</span> {cur.title}</> : 'Pick a block'}</span>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 rounded-[12px] p-0">
        <Command>
          <CommandInput placeholder="Find a block" />
          <CommandList>
            <CommandEmpty>No block matches.</CommandEmpty>
            {list.map(b => {
              const h = hint(b);
              return (
                <CommandItem key={b.k} value={`${b.s} ${b.title}`} onSelect={() => { onChange(b.k); setOpen(false); }} className="text-[13px]">
                  <span className="w-10 shrink-0 text-muted-foreground tabular-nums">{b.s}</span>
                  <span className="min-w-0 flex-1 truncate">{b.title}</span>
                  {h && <span className="shrink-0 text-[12px] text-faint">{h}</span>}
                  <Check className={cn('size-3.5', b.k === value ? 'opacity-100' : 'opacity-0')} />
                </CommandItem>
              );
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
