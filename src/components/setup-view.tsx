'use client';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useStore, type State } from '@/lib/store';
import { buildICS, WEEKDAY_BLOCKS, SUNDAY_BLOCKS } from '@/lib/schedule';
import { iso } from '@/lib/engine';
import { useUI } from './ui-state';

function download(name: string, text: string, type: string) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; document.body.appendChild(a); a.click(); a.remove();
}

export function SetupView() {
  const { state, days, update, replace, sync, syncConfigured, connectSync, disconnectSync, syncNow } = useStore();
  const { toast } = useUI();
  const [start, setStart] = useState(state.start);
  const [token, setToken] = useState('');
  const [armed, setArmed] = useState(false);
  const [restartArmed, setRestartArmed] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const H2 = ({ children }: { children: React.ReactNode }) => <h2 className="font-display text-lg font-bold">{children}</h2>;
  const P = ({ children }: { children: React.ReactNode }) => <p className="text-sm text-muted-foreground">{children}</p>;

  return (
    <div className="pb-16">
      <div className="pt-6 pb-4">
        <p className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">One-time setup</p>
        <h1 className="mt-1.5 font-display text-3xl font-bold tracking-tight sm:text-4xl">Set it once, then just show up</h1>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(290px,1fr))] gap-3.5">
        <Card className="gap-3 p-4">
          <H2>Sync across devices</H2>
          <P>Your ticks and notes are stored in a private GitHub Gist, so your phone and laptop stay in sync. Create a fine-grained token with only <b>Gists: read and write</b> access, paste it here once on each device. It stays in that browser.</P>
          {syncConfigured ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className={sync.state === 'error' ? 'text-sm text-bad' : 'text-sm text-good'}>{sync.state === 'syncing' ? 'Syncing…' : sync.state === 'error' ? sync.msg : `Synced${sync.at ? ` at ${new Date(sync.at).toLocaleTimeString()}` : ''}`}</span>
              <Button variant="outline" size="sm" onClick={syncNow}>Sync now</Button>
              <Button variant="ghost" size="sm" onClick={disconnectSync}>Disconnect this device</Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <a className="text-sm text-primary underline" href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener noreferrer">Create a token on GitHub (Account permissions → Gists → Read and write)</a>
              <div className="flex gap-2"><Input type="password" value={token} onChange={e => setToken(e.target.value)} placeholder="github_pat_…" autoComplete="off" /><Button disabled={!token.trim() || sync.state === 'syncing'} onClick={async () => { await connectSync(token.trim()); setToken(''); }}>Connect</Button></div>
              {sync.state === 'error' && <span className="text-sm text-bad">{sync.msg}</span>}
            </div>
          )}
        </Card>
        <Card className="gap-3 p-4">
          <H2>Start date</H2>
          <P>The first day of your plan. Sundays become review days automatically. Your ticks and notes stay.</P>
          <div className="flex gap-2"><Input type="date" value={start} onChange={e => setStart(e.target.value)} className="w-auto" /><Button onClick={() => { update(s => ({ ...s, start })); toast('Start date saved. Download the calendar again.'); }}>Save</Button></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={state.kickoff} onChange={e => update(s => ({ ...s, kickoff: e.target.checked }))} className="accent-primary" />Start with Day 0, a half prep day from 15:30. Off: Day 1 starts on this date.</label>
        </Card>
        <Card className="gap-3 p-4">
          <H2>Calendar reminders</H2>
          <P>Every block as a repeating event with an alert 2 minutes before, for 13 weeks. Import into Google Calendar for phone alerts.</P>
          <div><Button onClick={() => download('reminders.ics', buildICS(state.start, days.length), 'text/calendar')}>Download reminders.ics</Button></div>
        </Card>
        <Card className="gap-3 p-4">
          <H2>Backup</H2>
          <P>Export everything as a file, or import a backup (including the one from the old local version).</P>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => download(`offer90-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(state), 'application/json')}>Export backup</Button>
            <Button variant="outline" onClick={() => file.current?.click()}>Import backup</Button>
            <input ref={file} type="file" accept="application/json" hidden onChange={async e => {
              const f = e.target.files?.[0]; if (!f) return;
              try { const s = JSON.parse(await f.text()) as State; if (!s.start) throw new Error(); replace(s); toast('Backup imported'); } catch { toast('That file is not a valid backup'); }
              e.target.value = '';
            }} />
          </div>
        </Card>
        <Card className="col-span-full gap-3 p-4">
          <H2>Daily timetable</H2>
          <P>Sleep 22:00–05:00. Gym at 18:00, Mon–Sat. Mon–Sat has about 10.75 h of study blocks. Sunday is a 3.5 h morning, then rest.</P>
          <div className="overflow-x-auto"><table className="w-full border-collapse text-[13.5px]"><tbody>
            {Array.from({ length: Math.max(WEEKDAY_BLOCKS.length, SUNDAY_BLOCKS.length) }, (_, i) => { const a = WEEKDAY_BLOCKS[i], b = SUNDAY_BLOCKS[i]; return (
              <tr key={i} className="border-b"><td className="whitespace-nowrap px-2 py-1.5 font-mono tnum">{a ? `${a.s}–${a.e}` : ''}</td><td className="px-2 py-1.5">{a?.title}</td><td className="whitespace-nowrap px-2 py-1.5 font-mono tnum">{b ? `${b.s}–${b.e}` : ''}</td><td className="px-2 py-1.5">{b?.title}</td></tr>
            ); })}
          </tbody></table></div>
        </Card>
        <Card className="gap-3 p-4">
          <H2>Start over from today</H2>
          <P>Makes today the first day (Day 0 if the prep day is on, otherwise Day 1) and clears every tick, flag and daily log, here and in the Gist. Your notes pages and bookmarks stay.</P>
          <div><Button variant="outline" onClick={() => {
            if (!restartArmed) { setRestartArmed(true); setTimeout(() => setRestartArmed(false), 4000); return; }
            const today = iso(new Date());
            update(s => ({ ...s, start: today, done: {}, flags: {}, notes: {} }));
            setStart(today); setRestartArmed(false); toast(`${state.kickoff ? 'Day 0' : 'Day 1'} is today. Download the calendar again.`);
          }}>{restartArmed ? 'Click again to restart from today' : 'Start over from today'}</Button></div>
        </Card>
        <Card className="gap-3 p-4">
          <H2>Reset</H2>
          <P>Erases every tick, flag and note on this device and in the Gist.</P>
          <div><Button variant="outline" className="text-bad" onClick={() => { if (!armed) { setArmed(true); setTimeout(() => setArmed(false), 4000); return; } replace({ start: state.start, kickoff: state.kickoff }); setArmed(false); toast('Everything cleared'); }}>{armed ? 'Click again to erase everything' : 'Reset everything'}</Button></div>
        </Card>
      </div>
    </div>
  );
}
