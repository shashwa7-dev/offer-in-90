'use client';
/* Small ring that shows a block's state at a glance: dashed = not started, arc = in progress, check = done, grey = missed. */
export function BlockRing({ done, total, missed, color }: { done: number; total: number; missed?: boolean; color: string }) {
  const r = 6, c = 2 * Math.PI * r, pct = total ? done / total : 0;
  if (total && done === total) return (
    <svg viewBox="0 0 16 16" className="size-4 shrink-0" aria-hidden="true"><circle cx="8" cy="8" r="7" fill="var(--good)" /><path d="M5 8.2l2 2 4-4.2" fill="none" stroke="var(--card)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
  );
  const stroke = missed ? 'var(--missed-foreground)' : color;
  return (
    <svg viewBox="0 0 16 16" className="size-4 shrink-0" aria-hidden="true">
      <circle cx="8" cy="8" r={r} fill="none" stroke={stroke} strokeWidth="1.5" strokeDasharray={done ? undefined : '2.4 2.3'} opacity={done ? 0.25 : 0.9} />
      {done > 0 && <circle cx="8" cy="8" r={r} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} transform="rotate(-90 8 8)" />}
    </svg>
  );
}
