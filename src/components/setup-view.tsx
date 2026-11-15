'use client';
/* Setup: one settings list. Your plan, Interviews, Sync and backup, Reminders, Start again. */
import { useMemo, useRef, useState, type ReactNode } from 'react';
import { CalendarDays, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useStore, type State } from '@/lib/store';
import { buildICS, WEEKDAY_BLOCKS, SUNDAY_BLOCKS } from '@/lib/schedule';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cursorsNow, fmtDate, iso, parseISO, totalDays } from '@/lib/engine';
import { DEFAULT_ROUTINE, ROUTINE_KEYS, placeDay, resolveRoutine, validateRoutine } from '@/lib/routine';
import { modeOn, switchMode, type Mode } from '@/lib/modes';
import { nextMonday, overflowMessage, parseRoutineForm, toDraft, type RoutineDraft } from '@/lib/setup-helpers';
import type { RoutineKey } from '@/lib/state-types';
import { companyCounts, flattenThreads } from '@/lib/interview-feed';
import { useUI } from './ui-state';
import { LabelsManager } from './labels-manager';
import { Band, Chip, PageFrame, PageHeader, Surface } from './shell/page';

function download(name: string, text: string, type: string) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; document.body.appendChild(a); a.click(); a.remove();
}

/** One settings line: label and one-line help on the left, the control on the right (stacked on phones). */
function Setting({ label, help, children, htmlFor }: { label: string; help: ReactNode; children?: ReactNode; htmlFor?: string }) {
  return (
    <div className="flex flex-col gap-2.5 border-t border-border px-4 py-3 first:border-t-0 sm:flex-row sm:items-center sm:gap-6">
      <div className="min-w-0 flex-1">
        {htmlFor ? <label htmlFor={htmlFor} className="text-[13px] font-medium text-foreground">{label}</label> : <div className="text-[13px] font-medium text-foreground">{label}</div>}
        <div className="mt-0.5 text-[13px] leading-snug text-muted-foreground">{help}</div>
      </div>
      {children != null && <div className="flex min-w-0 flex-wrap items-center gap-2 sm:shrink-0 sm:justify-end">{children}</div>}
    </div>
  );
}

const stoneBtn = 'border-stone-border bg-stone text-stone-foreground shadow-none hover:bg-stone hover:text-foreground dark:border-stone-border dark:bg-stone dark:hover:bg-stone';
const popup = 'rounded-[12px] bg-card';

function Timetable({ title, blocks }: { title: string; blocks: { s: string; e: string; title: string }[] }) {
  return (
    <div>
      <div className="flex h-9 items-center border-y border-border bg-band px-4 text-[13px] font-medium">{title}</div>
      {blocks.map((b, i) => (
        <div key={i} className="flex min-h-9 items-center gap-3 border-t border-border px-4 text-[13px] first:border-t-0">
          <span className="w-24 shrink-0 text-muted-foreground tabular-nums">{b.s}–{b.e}</span>
          <span className="min-w-0 flex-1">{b.title}</span>
        </div>
      ))}
    </div>
  );
}

const ROUTINE_ROW: Record<RoutineKey, string> = { breakfast: 'Breakfast', lunch: 'Lunch', extra: 'Fourth slot', dinner: 'Dinner' };

/** The "My routine" form. Remounted (by key) whenever the saved routine changes, so the fields always match it. */
function RoutineForm() {
  const { state, update } = useStore();
  const { toast } = useUI();
  const draftsOf = (stored: typeof state.routine): Record<RoutineKey, RoutineDraft> => {
    const r = resolveRoutine(stored);
    return { breakfast: toDraft(r.breakfast), lunch: toDraft(r.lunch), extra: toDraft(r.extra), dinner: toDraft(r.dinner) };
  };
  const [form, setForm] = useState(() => draftsOf(state.routine));
  const [error, setError] = useState('');
  const edit = (k: RoutineKey, patch: Partial<RoutineDraft>) => { setError(''); setForm(f => ({ ...f, [k]: { ...f[k], ...patch } })); };

  const save = () => {
    const slots = parseRoutineForm(form);
    const v = validateRoutine(slots);
    if (!v.ok) { setError(v.error); return; }
    const p = placeDay(WEEKDAY_BLOCKS, slots);
    if (!p.ok) { setError(overflowMessage(p.block.title, p.overMin)); return; }
    // Only slots that differ from the defaults are stored; the rest are removed so sync records the deletion.
    const next: Partial<Record<RoutineKey, (typeof slots)[RoutineKey]>> = {};
    for (const k of ROUTINE_KEYS) if (JSON.stringify(slots[k]) !== JSON.stringify(DEFAULT_ROUTINE[k])) next[k] = slots[k];
    if (JSON.stringify(next) === JSON.stringify(state.routine)) { setError(''); toast('No changes'); return; }
    update(s => ({ ...s, routine: next }));
    toast('Routine saved. Download the calendar again.');
  };
  const reset = () => { update(s => ({ ...s, routine: {} })); setForm(draftsOf({})); setError(''); toast('Routine reset to defaults. Download the calendar again.'); };

  return (
    <div data-routine>
      {ROUTINE_KEYS.map(k => {
        const x = form[k];
        return (
          <div key={k} className="flex flex-wrap items-center gap-2 border-t border-border px-4 py-2.5 first:border-t-0">
            <span className="w-20 shrink-0 text-[13px] text-muted-foreground">{ROUTINE_ROW[k]}</span>
            <Switch aria-label={`${ROUTINE_ROW[k]} on`} checked={x.on} onCheckedChange={v => edit(k, { on: v })} />
            <Input aria-label={`${ROUTINE_ROW[k]} name`} value={x.title} onChange={e => edit(k, { title: e.target.value })} className="h-8 min-w-40 flex-1 text-[13px]" />
            <Input type="time" aria-label={`${ROUTINE_ROW[k]} start`} value={x.s} onChange={e => edit(k, { s: e.target.value })} className="h-8 w-28 text-[13px] tabular-nums" />
            <Input inputMode="numeric" aria-label={`${ROUTINE_ROW[k]} minutes`} value={x.min} onChange={e => edit(k, { min: e.target.value })} className="h-8 w-16 text-[13px] tabular-nums" />
            <span className="text-[13px] text-muted-foreground">min</span>
          </div>
        );
      })}
      <div className="flex flex-wrap items-center gap-2 border-t border-border px-4 py-3">
        <Button variant="outline" size="sm" onClick={save}>Save</Button>
        <Button variant="ghost" size="sm" onClick={reset}>Reset to defaults</Button>
        {error && <p data-routine-error role="alert" className="min-w-0 basis-full text-[13px] text-foreground">{error}</p>}
      </div>
      <p className="border-t border-border px-4 py-2.5 text-[13px] leading-snug text-muted-foreground">The routine applies Mon–Sat. A calendar file you have already downloaded must be downloaded again after any change.</p>
    </div>
  );
}

export function SetupView() {
  const { state, days, update, replace, threads, sync, syncConfigured, connectSync, disconnectSync, syncNow } = useStore();
  const { toast } = useUI();
  const [token, setToken] = useState('');
  const [dateOpen, setDateOpen] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [q, setQ] = useState('');
  const file = useRef<HTMLInputElement>(null);

  const feedCompanies = useMemo(() => companyCounts(flattenThreads(threads), state.targets).filter(c => !c.target), [threads, state.targets]);
  const typed = q.trim();
  const typedNew = typed && ![...state.targets, ...feedCompanies.map(c => c.company)].some(c => c.toLowerCase() === typed.toLowerCase());
  const addTarget = (c: string) => { update(s => (s.targets.includes(c) ? s : { ...s, targets: [...s.targets, c] })); setQ(''); setAddOpen(false); };
  const removeTarget = (c: string) => update(s => ({ ...s, targets: s.targets.filter(t => t !== c) }));

  const start = parseISO(state.start);
  const mode = modeOn(state.modes, iso(new Date())).mode;
  const switchTo = (m: Mode) => {
    if (m === mode) return;
    const today = iso(new Date());
    update(s => ({ ...s, modes: switchMode(s.modes, today, m, cursorsNow(s, today), s.start) }));
    toast(`Switched to ${m === 'grind' ? 'Grind' : 'Steady'} from today. Done work stays done.`);
  };
  const wake = WEEKDAY_BLOCKS.find(b => b.k === 'wake')?.s ?? WEEKDAY_BLOCKS[0].s;
  const gym = WEEKDAY_BLOCKS.find(b => b.k === 'workout')?.s;
  const sleep = WEEKDAY_BLOCKS[WEEKDAY_BLOCKS.length - 1].e;
  const syncLine = sync.state === 'syncing' ? 'Syncing…' : sync.state === 'error' ? 'Not synced' : `Synced${sync.at ? ` at ${new Date(sync.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}`;

  return (
    <PageFrame header={<PageHeader crumbs={['Setup']} />}>
      <Surface>
        <Band id="plan" title="Your plan">
          <Setting label="Mode" help={<><span className="block">Steady: 17 weeks · about 8.5 h a day</span><span className="block">Grind: 13 weeks · about 10.75 h a day</span></>}>
            <ToggleGroup type="single" variant="outline" size="sm" value={mode} aria-label="Mode"
              onValueChange={v => { if (v === 'steady' || v === 'grind') switchTo(v); }}>
              <ToggleGroupItem value="steady" className="px-3 text-[13px]">Steady</ToggleGroupItem>
              <ToggleGroupItem value="grind" className="px-3 text-[13px]">Grind</ToggleGroupItem>
            </ToggleGroup>
          </Setting>
          <Setting label="Start date" help="A Monday: the first day of your plan. Sundays become review days. Your ticks and notes stay.">
            <Popover open={dateOpen} onOpenChange={setDateOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" data-start-date className="font-normal tabular-nums"><CalendarDays className="text-muted-foreground" />{fmtDate(start)}</Button>
              </PopoverTrigger>
              <PopoverContent align="end" className={`w-auto p-0 ${popup}`}>
                <Calendar mode="single" selected={start} defaultMonth={start} required disabled={d => d.getDay() !== 1}
                  onSelect={d => { if (!d) return; const v = iso(d); setDateOpen(false); if (v === state.start) return; update(s => ({ ...s, start: v })); toast('Start date saved. Download the calendar again.'); }} />
              </PopoverContent>
            </Popover>
          </Setting>
          <Setting label="Start with a prep day" htmlFor="prep-day" help="Day 0 is the Sunday before the start date, a half prep day from 15:30. Off: Day 1 starts on the start date.">
            <Switch id="prep-day" aria-label="Start with a prep day" checked={state.kickoff} onCheckedChange={v => update(s => ({ ...s, kickoff: v }))} />
          </Setting>
          <Setting label="Daily timetable" help={<span className="tabular-nums">Wake {wake}{gym ? ` · gym ${gym}` : ''} · sleep {sleep}</span>}>
            <Button variant="outline" size="sm" onClick={() => setSheet(true)} aria-label="View timetable">View</Button>
          </Setting>
        </Band>

        <Band id="routine" title="My routine">
          <RoutineForm key={JSON.stringify(state.routine)} />
        </Band>

        <Band id="interviews" title="Interviews" count={state.targets.length || undefined}>
          <Setting label="Target companies" help="News › Interviews shows these under My targets.">
            {state.targets.length === 0 && <span className="text-[13px] text-muted-foreground">None yet</span>}
            {state.targets.map(t => (
              <Chip key={t} className="h-6 pr-0.5 text-[13px] text-foreground">
                {t}
                <button type="button" aria-label={`Remove ${t}`} onClick={() => removeTarget(t)} className="inline-flex size-4.5 items-center justify-center rounded-[4px] text-muted-foreground outline-none hover:bg-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"><X className="size-3" /></button>
              </Chip>
            ))}
            <Popover open={addOpen} onOpenChange={v => { setAddOpen(v); if (!v) setQ(''); }}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 gap-1 px-1.5 text-[13px] text-muted-foreground" aria-label="Add target company"><Plus className="size-3.5" />Add</Button>
              </PopoverTrigger>
              <PopoverContent align="end" className={`w-64 p-0 ${popup}`}>
                <Command>
                  <CommandInput placeholder="Company…" value={q} onValueChange={setQ} />
                  <CommandList>
                    <CommandEmpty>{typed ? 'No match.' : 'No other companies in the feed.'}</CommandEmpty>
                    {typedNew && (
                      <CommandGroup>
                        <CommandItem value={`add-new ${typed}`} onSelect={() => addTarget(typed)}>Add “{typed}”</CommandItem>
                      </CommandGroup>
                    )}
                    {feedCompanies.length > 0 && (
                      <CommandGroup heading="In the feed">
                        {feedCompanies.map(c => (
                          <CommandItem key={c.company} value={c.company} onSelect={() => addTarget(c.company)}>
                            <span className="min-w-0 flex-1 truncate">{c.company}</span>
                            <span className="shrink-0 text-[12px] text-muted-foreground tabular-nums">{c.count}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </Setting>
        </Band>

        <Band id="labels" title="Labels" count={Object.values(state.labels).filter(l => l.kind === 'label').length || undefined}>
          <LabelsManager />
        </Band>

        <Band id="sync" title="Sync and backup">
          <Setting label="Sync across devices" help={<>Ticks and notes go to a private GitHub Gist so phone and laptop agree. The token needs only <span className="font-medium text-foreground">Gists: read and write</span> and stays in this browser.</>}>
            {syncConfigured ? (
              <>
                <span data-sync-status className="text-[13px] text-muted-foreground tabular-nums">{syncLine}</span>
                <Button variant="outline" size="sm" onClick={syncNow} disabled={sync.state === 'syncing'}>Sync now</Button>
                <Button variant="ghost" size="sm" onClick={disconnectSync}>Disconnect</Button>
              </>
            ) : null}
          </Setting>
          {syncConfigured && sync.state === 'error' && sync.msg && (
            <p className="border-t border-border px-4 py-2 text-[13px] text-muted-foreground">{sync.msg}</p>
          )}
          {!syncConfigured && (
            <div className="flex flex-col gap-2 border-t border-border px-4 py-3">
              <a className="w-fit text-[13px] text-foreground underline underline-offset-2 hover:text-muted-foreground" href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener noreferrer">
                Create a token on GitHub (Account permissions → Gists → Read and write) ↗<span className="sr-only"> (opens in a new tab)</span>
              </a>
              <form className="flex gap-2" onSubmit={async e => { e.preventDefault(); if (!token.trim()) return; await connectSync(token.trim()); setToken(''); }}>
                <Input type="password" value={token} onChange={e => setToken(e.target.value)} placeholder="github_pat_…" autoComplete="off" aria-label="GitHub token" className="h-8 max-w-sm text-[13px]" />
                <Button type="submit" variant="outline" size="sm" disabled={!token.trim() || sync.state === 'syncing'}>Connect</Button>
              </form>
              {sync.state === 'error' && sync.msg && <p className="text-[13px] text-muted-foreground">{sync.msg}</p>}
            </div>
          )}
          <Setting label="Backup" help="Export everything as a file, or import a backup (including one from the old local version).">
            <Button variant="outline" size="sm" onClick={() => download(`offer90-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(state), 'application/json')}>Export backup</Button>
            <Button variant="outline" size="sm" onClick={() => file.current?.click()}>Import backup</Button>
            <input ref={file} type="file" accept="application/json" hidden onChange={async e => {
              const f = e.target.files?.[0]; if (!f) return;
              try { const s = JSON.parse(await f.text()) as State; if (!s.start) throw new Error(); replace(s); toast('Backup imported'); } catch { toast('That file is not a valid backup'); }
              e.target.value = '';
            }} />
          </Setting>
        </Band>

        <Band id="reminders" title="Reminders">
          <Setting label="Calendar reminders" help="Every block as a repeating event with an alert 2 minutes before, for the whole plan. Import into Google Calendar for phone alerts.">
            <Button size="sm" onClick={() => download('reminders.ics', buildICS(state.start, totalDays(days), resolveRoutine(state.routine)), 'text/calendar')}>Download reminders.ics</Button>
          </Setting>
        </Band>

        <Band id="again" title="Start again">
          <Setting label="Start over from today" help="The next Monday (today, if it is Monday) becomes the start date and every tick, flag and daily log is cleared, here and in the Gist. Notes pages, bookmarks and your own tasks stay.">
            <AlertDialog>
              <AlertDialogTrigger asChild><Button variant="outline" size="sm" className={stoneBtn}>Start over…</Button></AlertDialogTrigger>
              <AlertDialogContent className={popup}>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-[16px]">Start over from today?</AlertDialogTitle>
                  <AlertDialogDescription>Makes the next Monday (today, if it is Monday) the start date, with the prep day the Sunday before if it is on, and clears every tick, flag and daily log, here and in the Gist. Your notes pages, bookmarks and your own tasks stay.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => {
                    const today = nextMonday(iso(new Date()));
                    update(s => ({ ...s, start: today, done: {}, flags: {}, notes: {} }));
                    toast('Start date moved to the next Monday. Download the calendar again.');
                  }}>Start over</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </Setting>
          <Setting label="Erase everything" help="Erases every tick, flag and note on this device and in the Gist.">
            <AlertDialog>
              <AlertDialogTrigger asChild><Button variant="outline" size="sm" className={stoneBtn}>Erase…</Button></AlertDialogTrigger>
              <AlertDialogContent className={popup}>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-[16px]">Erase everything?</AlertDialogTitle>
                  <AlertDialogDescription>Erases every tick, flag and note on this device and in the Gist.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => { replace({ start: state.start, kickoff: state.kickoff }); toast('Everything cleared'); }}>Erase</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </Setting>
        </Band>
      </Surface>

      <Sheet open={sheet} onOpenChange={setSheet}>
        <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto bg-card p-0 sm:max-w-md">
          <SheetHeader className="px-4 pt-4 pb-3">
            <SheetTitle className="text-[15px]">Daily timetable</SheetTitle>
            <SheetDescription className="text-[13px]">Sleep 22:00–05:00. Gym at 18:00, Mon–Sat. Mon–Sat has about 10.75 h of study blocks. Sunday is a 3.5 h morning, then rest.</SheetDescription>
          </SheetHeader>
          <Timetable title="Mon–Sat" blocks={WEEKDAY_BLOCKS} />
          <Timetable title="Sunday" blocks={SUNDAY_BLOCKS} />
        </SheetContent>
      </Sheet>
    </PageFrame>
  );
}
