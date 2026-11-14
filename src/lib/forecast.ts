// Pure forecast maths for the Progress page. No runtime imports.
export interface DayHours { no: number; planMin: number; doneMin: number }
export interface Forecast {
  doneH: number; planH: number;
  paceH: number | null;
  projectedH: number | null;
  pct: number | null;
  neededH: number;
  cumPlan: number[]; cumDone: number[];
}

export function forecast(days: DayHours[], todayIdx: number): Forecast {
  const len = days.length;
  const upTo = Math.min(todayIdx, len - 1); // last index counted as done-so-far
  const planH = days.reduce((s, d) => s + d.planMin, 0) / 60;

  let doneMin = 0;
  const cumDone: number[] = [];
  for (let i = 0; i <= upTo; i++) {
    doneMin += days[i].doneMin;
    cumDone.push(doneMin / 60);
  }
  const doneH = doneMin / 60;

  let planMin = 0;
  const cumPlan = days.map((d) => (planMin += d.planMin) / 60);

  const elapsed: DayHours[] = [];
  for (let i = 0; i < Math.min(todayIdx, len); i++) if (days[i].no >= 1) elapsed.push(days[i]);
  const window = elapsed.slice(-7);
  const paceH = window.length ? window.reduce((s, d) => s + d.doneMin, 0) / 60 / window.length : null;

  let remaining = 0;
  for (let i = Math.max(todayIdx, 0); i < len; i++) if (days[i].no >= 1) remaining++;

  const projectedH = paceH === null ? null : doneH + paceH * remaining;
  const pct = projectedH === null || planH === 0 ? null : projectedH / planH;
  const neededH = remaining ? Math.max(0, (planH - doneH) / remaining) : 0;
  return { doneH, planH, paceH, projectedH, pct, neededH, cumPlan, cumDone };
}
