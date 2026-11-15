'use client';
/* "Solved without seeing it before" + Minutes for a problem's solve log (DSA green rule, spec §2). Used by the task peek and the DSA table. */
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { patchSolve } from '@/lib/dsa-page';

export function SolveFields({ solveKey, enabled, className }: { solveKey: string; /** The problem is ticked; before that there is nothing to log. */ enabled: boolean; className?: string }) {
  const { state, update } = useStore();
  const log = state.solves[solveKey];
  const [mins, setMins] = useState(log?.minutes != null ? String(log.minutes) : '');
  useEffect(() => { setMins(log?.minutes != null ? String(log.minutes) : ''); }, [log?.minutes]);
  const setUnseen = (unseen: boolean) => { const now = Date.now(); update(s => ({ ...s, solves: patchSolve(s.solves, solveKey, { unseen }, now) })); };
  const saveMins = () => {
    const v = mins.trim();
    const n = v === '' ? null : Number(v);
    if (n !== null && !(n >= 0 && Number.isFinite(n))) { setMins(log?.minutes != null ? String(log.minutes) : ''); return; }
    if ((n ?? undefined) === log?.minutes) return;
    const now = Date.now();
    update(s => ({ ...s, solves: patchSolve(s.solves, solveKey, { minutes: n }, now) }));
  };
  return (
    <div className={cn('flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px]', !enabled && 'opacity-60', className)} data-solve-fields>
      <label className="inline-flex items-center gap-2">
        <input type="checkbox" data-solve-unseen disabled={!enabled} checked={!!log?.unseen} onChange={e => setUnseen(e.target.checked)} className="size-4 accent-primary" />
        Solved without seeing it before
      </label>
      <label className="inline-flex items-center gap-2">
        Minutes
        <input type="number" min={0} inputMode="numeric" data-solve-minutes disabled={!enabled} value={mins} onChange={e => setMins(e.target.value)} onBlur={saveMins}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
          className="h-7 w-16 rounded-[5px] border border-input bg-transparent px-2 text-[13px] tabular-nums outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30" />
      </label>
      {!enabled && <span className="text-faint">Tick the problem first.</span>}
    </div>
  );
}
