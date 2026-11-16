/* Progress › Tracks: one row per plan track, in the app's track order, with what was due before today and the
 * whole plan. Pure: the track list, the category → track mapping and the skipped test come in as arguments
 * (extensionless runtime imports don't resolve under node strip-types; see task-filter.ts). */

export type TrackRow = {
  key: string; name: string;
  /** Tasks on days before today (skipped tasks left out), and how many of them are done. */
  due: number; done: number;
  /** Every task of the track in the plan, and how many are done (ticked ahead of time included). */
  all: number; allDone: number;
};

type DayLike = { i: number; tasks: { id: string; cat: string }[] };

export function trackRows(
  days: DayLike[], todayIdx: number, done: Record<string, number>,
  tracks: readonly { key: string; name: string }[], trackOf: (cat: string) => string | null, skipped: (id: string) => boolean,
): TrackRow[] {
  const rows = new Map(tracks.map((t) => [t.key, { key: t.key, name: t.name, due: 0, done: 0, all: 0, allDone: 0 }]));
  for (const d of days) {
    for (const t of d.tasks) {
      const key = trackOf(t.cat);
      const r = key ? rows.get(key) : undefined;
      if (!r || skipped(t.id)) continue;
      r.all++;
      if (done[t.id]) r.allDone++;
      if (d.i < todayIdx) { r.due++; if (done[t.id]) r.done++; }
    }
  }
  return [...rows.values()].filter((r) => r.all > 0);
}

/** Where a track stands today: tasks due and not done (behind), tasks done before their day (early), and the
 * share of the plan done vs the share that should be done by today (both 0–1). */
export function trackStatus(r: TrackRow): { behind: number; early: number; donePct: number; duePct: number; label: string } {
  const behind = r.due - r.done, early = r.allDone - r.done;
  const label = behind > 0 ? `${behind} behind` : r.due === 0 && early === 0 ? 'Nothing due yet' : early > 0 ? `On track · ${early} early` : 'On track';
  return { behind, early, donePct: r.all ? r.allDone / r.all : 0, duePct: r.all ? r.due / r.all : 0, label };
}

/** The track furthest behind among those with something due (null when nothing is due yet). */
export function weakestTrack(rows: TrackRow[]): TrackRow | null {
  return rows.filter((r) => r.due > 0).sort((a, b) => a.done / a.due - b.done / b.due)[0] ?? null;
}
