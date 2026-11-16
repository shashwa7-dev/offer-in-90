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

/** The track furthest behind among those with something due (null when nothing is due yet). */
export function weakestTrack(rows: TrackRow[]): TrackRow | null {
  return rows.filter((r) => r.due > 0).sort((a, b) => a.done / a.due - b.done / b.due)[0] ?? null;
}
