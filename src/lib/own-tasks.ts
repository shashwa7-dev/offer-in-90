// The user's own tasks: which block a new one lands in, and delete with undo. Pure: no runtime imports.

type BlockLike = { k: string; s: string; e: string; kind: 'study' | 'life' | 'health' };
const toMin = (hm: string) => { const [h, m] = hm.split(':').map(Number); return h * 60 + m; };

/** Blocks an own task can go in: study and health blocks, never meals or breaks. */
export const pickable = <B extends BlockLike>(blocks: B[]) => blocks.filter(b => b.kind === 'study' || b.kind === 'health');

/** Default block for a new task. With the clock (today): the block running now, else the next one, else the last study block.
 *  Without it (another day): the first study block. */
export function defaultBlock<B extends BlockLike>(blocks: B[], nowMin?: number): B | undefined {
  const list = pickable(blocks);
  const lastStudy = [...list].reverse().find(b => b.kind === 'study') ?? list[list.length - 1];
  if (nowMin == null) return list.find(b => b.kind === 'study') ?? list[0];
  return list.find(b => nowMin >= toMin(b.s) && nowMin < toMin(b.e)) ?? list.find(b => toMin(b.s) > nowMin) ?? lastStudy;
}

type OwnState = { custom: Record<string, unknown>; done: Record<string, number>; tnotes: Record<string, unknown>; status: Record<string, 'progress' | 'skipped'> };
export interface OwnSnapshot { id: string; c: unknown; d?: number; n?: unknown; st?: 'progress' | 'skipped' }

/** Everything that belongs to own task `id`: the task, its tick, its status and its note (key `u-<id>`). */
export const snapshotOwn = (s: OwnState, id: string): OwnSnapshot => ({ id, c: s.custom[id], d: s.done[`u-${id}`], n: s.tnotes[`u-${id}`], st: s.status[`u-${id}`] });

export function withoutOwn<S extends OwnState>(s: S, id: string): S {
  const c = { ...s.custom }, d = { ...s.done }, n = { ...s.tnotes }, st = { ...s.status };
  delete c[id]; delete d[`u-${id}`]; delete n[`u-${id}`]; delete st[`u-${id}`];
  return { ...s, custom: c, done: d, tnotes: n, status: st };
}

/** Put a deleted own task back exactly as it was, keeping anything else that changed since. */
export function restoreOwn<S extends OwnState>(s: S, snap: OwnSnapshot): S {
  if (snap.c === undefined) return s;
  const k = `u-${snap.id}`;
  const d = { ...s.done }, n = { ...s.tnotes }, st = { ...s.status };
  if (snap.d !== undefined) d[k] = snap.d;
  if (snap.n !== undefined) n[k] = snap.n;
  if (snap.st !== undefined) st[k] = snap.st;
  return { ...s, custom: { ...s.custom, [snap.id]: snap.c }, done: d, tnotes: n, status: st };
}
