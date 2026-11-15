/* Track sequences (roadmap v2 §1–§9, §14; v3 drops the aib track; v3 Product replaces the v2 mc track): the curriculum as 7 ordered tracks of 78 slots each, one track per study block.
 * The Grind weekday rules are baked into the order: Grind slot i falls on week floor(i / 6) + 1, weekday GRIND_DOW[i].
 * Steady (Task 6) runs the same sequences on whichever days a track runs.
 * Pure: content comes in as an argument and only type imports are used (extensionless runtime imports don't resolve
 * under node strip-types; see task-filter.ts). */
import type { Cat } from './engine';
import type { TrackId } from './state-types';

export type SlotItem = {
  id: string; text: string; url?: string; /** A free secondary link (v3 content rows). */ url2?: string; cat: Cat;
  pattern?: string; tier?: string; flags?: string[]; role?: string; depth?: boolean;
  hiddenUntilStart?: boolean; part?: [number, number];
  slug?: string; diff?: string; mins?: number; practice?: string; summary?: string;
  /** The take-home brief, on part 1 of each take-home. */
  brief?: string;
  /** Carried to that week's Sunday (a Saturday jt slot is capped at 75 min, Ruling R9); plan-build.ts places it. */
  sundayCarry?: boolean;
  /** A generated filler (revision tail or "Revisit" slot), not a content item. */
  filler?: true;
  /** The content item that must be on an earlier calendar day (it may sit in another track). */
  after?: string;
  /** Set by the layout (Ruling R12) on a past copy of a slot that was laid out again after a mode switch. */
  superseded?: true;
};
export type Slot = { items: SlotItem[] };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;
/** The content modules' exports, merged (src/lib/content/*.js). */
export type TrackContent = Record<string, Row>;

export const SLOTS = 78;
const WEEKS = 13;
/** Weekday (Mon = 1 … Sat = 6) of each Grind study slot. */
export const GRIND_DOW: number[] = Array.from({ length: SLOTS }, (_, i) => (i % 6) + 1);
const weekOf = (i: number) => Math.floor(i / 6) + 1;
const at = (week: number, dow: number) => (week - 1) * 6 + (dow - 1);

/** Content item → slot item: the shared fields only (content `part`, `day` etc. stay behind; `after` is kept so the
 * calendar layout can hold a slot back until its prerequisite is on an earlier day). */
function item(x: Row, cat: Cat, extra: Partial<SlotItem> = {}): SlotItem {
  const it: SlotItem = { id: x.id, text: x.text, cat };
  if (x.url) it.url = x.url;
  if (x.depth) it.depth = true;
  if (typeof x.mins === 'number') it.mins = x.mins;
  if (typeof x.after === 'string') it.after = x.after;
  return Object.assign(it, extra);
}
const filler = (id: string, text: string, cat: Cat, url?: string): SlotItem => ({ id, text, cat, ...(url ? { url } : {}), filler: true });

/** One v3 content row → its slots (the plan's "Content row format"). A rep / mock row (`kind`) is one task with its
 * `id`. A learning row is Understand (`id`, with `url`, `url2` and `after`), Do (`id:do`, when given) and Explain
 * (`id:explain`). A `parts: 2` row fills two slots: ids `id:part-k` (`:do` / `:explain` on each part), texts end
 * "(part k/2)". `cat` overrides the track's category; `covers` stays in the content (the coverage test reads it). */
export function expandRow(row: Row, cat: Cat): SlotItem[][] {
  const c: Cat = row.cat ?? cat;
  if (row.kind) {
    const it: SlotItem = { id: row.id, text: row.text, cat: c };
    if (row.url) it.url = row.url;
    if (row.url2) it.url2 = row.url2;
    if (typeof row.mins === 'number') it.mins = row.mins;
    if (typeof row.after === 'string') it.after = row.after;
    return [[it]];
  }
  const slot = (id: string, suffix: string, part?: [number, number]): SlotItem[] => {
    const extra = part ? { part } : {};
    const u: SlotItem = { id, text: `${row.understand}${suffix}`, cat: c, ...extra };
    if (row.url) u.url = row.url;
    if (row.url2) u.url2 = row.url2;
    if (typeof row.after === 'string' && (!part || part[0] === 1)) u.after = row.after;
    return [
      u,
      ...(row.do ? [{ id: `${id}:do`, text: `${row.do}${suffix}`, cat: c, ...extra }] : []),
      { id: `${id}:explain`, text: `${row.explain}${suffix}`, cat: c, ...extra },
    ];
  };
  if (row.parts === 2) return [1, 2].map((k) => slot(`${row.id}:part-${k}`, ` (part ${k}/2)`, [k, 2]));
  return [slot(row.id, '')];
}

/** A list consumed front to back. */
function queue<T>(xs: T[]) {
  let k = 0;
  return { next: (): T | undefined => xs[k++], peek: (): T | undefined => xs[k], get left() { return xs.length - k; } };
}
/** Stop if content did not fit: nothing may be cut (global constraints). */
function mustFit(track: string, left: number, limit = SLOTS) {
  if (left > 0) throw new Error(`BLOCKED: track ${track} has ${left} item(s) that do not fit in ${limit} slots`);
}
function toSlots(track: string, slots: SlotItem[][]): Slot[] {
  mustFit(track, slots.length - SLOTS);
  if (slots.length < SLOTS || slots.some((s) => !s || !s.length)) throw new Error(`track ${track}: empty slot`);
  return slots.map((items) => ({ items }));
}

// ---------- dsa (v3 §1): 2 foundations, 27 patterns x 2 days, 22 Phase 3 slots ----------
/** The hardest patterns first (the same order the Steady revisit days use). */
const HARD_PATTERNS = ['dp', 'graph-traversal', 'topo-sort', 'union-find', 'shortest-path-mst', 'backtracking', 'tree-dfs', 'tree-bfs', 'top-k', 'two-heaps', 'k-way-merge', 'intervals', 'sliding-window', 'binary-search'];
/** Phase 3 (slots 57–78), in order. */
const PHASE3 = ['oa-1', 'google-1', 'adv-1', 'meta-1', 'oa-2', 'revisit-1', 'google-2', 'oa-3', 'meta-2', 'adv-2', 'oa-4', 'google-3', 'revisit-2', 'oa-5', 'meta-3', 'oa-6', 'adv-3', 'google-4', 'oa-7', 'meta-4', 'revisit-3', 'oa-8'];

const problemItem = (p: Row): SlotItem => ({
  id: `p-${p.slug}`, text: p.name, url: p.url, cat: 'dsa', pattern: p.pattern, tier: p.tier, flags: [...p.flags], slug: p.slug, diff: p.d,
  ...(p.role ? { role: p.role } : {}), ...(p.role === 'unseen' ? { hiddenUntilStart: true } : {}),
});

function dsaTrack(c: TrackContent): Slot[] {
  const slots: SlotItem[][] = [];
  for (const f of c.FOUNDATIONS as Row[]) slots.push(...expandRow(f, 'dsa'));
  // Patterns, 2 days each. Day A: the pattern card + the teach problem. Day B: the unseen problem + the explain-back.
  const P: Row[] = c.PROBLEMS;
  for (const pt of c.PATTERNS as Row[]) {
    const teach = P.find((p) => p.pattern === pt.id && p.role === 'teach'), unseen = P.find((p) => p.pattern === pt.id && p.role === 'unseen');
    if (!teach || !unseen) throw new Error(`dsa: pattern ${pt.id} needs a teach and an unseen problem`);
    slots.push([{ id: `dsa:card-${pt.id}`, cat: 'dsa', pattern: pt.id, ...(pt.link ? { url: pt.link } : {}),
      text: `Pattern card · ${pt.name}: learn the signal, template, why it works, complexity and traps; add your own notes.` }, problemItem(teach)]);
    slots.push([problemItem(unseen), { id: `dsa:explain-back-${pt.id}`, cat: 'dsa', pattern: pt.id,
      text: `${pt.name} · Explain-back: fill the card from memory, then compare` }]);
  }
  mustFit('dsa (patterns end at slot 56)', slots.length - 56, 56);
  // Phase 3: patterns are hidden by design (no `pattern` field, no pattern name in the text).
  // A problem whose title names a pattern would give the pattern away, so those stay out of Phase 3.
  const patNames: string[] = (c.PATTERNS as Row[]).map((pt) => pt.name.toLowerCase());
  const leaks = (p: Row) => patNames.some((n) => p.name.toLowerCase().includes(n));
  const used = new Set<string>(P.filter((p) => p.tier === 'must').map((p) => p.slug));
  // Revisits: var problems from the hardest patterns, one pattern each, 2 per revisit.
  const vars = HARD_PATTERNS.map((id) => P.find((p) => p.pattern === id && p.role === 'var' && !p.flags.length && !leaks(p))).filter(Boolean).slice(0, 6) as Row[];
  vars.forEach((p) => used.add(p.slug));
  const revisit = queue(vars);
  // Google / Meta sets: company-tagged problems (medium and hard) not placed yet, spread across the patterns. Only 16 such
  // problems exist, so once they run out the sets take untagged medium and hard problems (var first), same spread.
  const spread = (ok: (p: Row) => boolean) => {
    const by = (c.PATTERNS as Row[]).map((pt) => P.filter((p) => p.pattern === pt.id && p.d !== 'E' && !used.has(p.slug) && !leaks(p) && ok(p)));
    const out: Row[] = [];
    for (let r = 0; by.some((ps: Row[]) => ps[r]); r++) by.forEach((ps: Row[]) => ps[r] && out.push(ps[r]));
    return out;
  };
  const tagged = spread((p) => p.flags.length > 0);
  const pool: Row[] = [...tagged, ...spread((p) => p.flags.length === 0 && p.role === 'var'), ...spread((p) => p.flags.length === 0 && p.role !== 'var')];
  const draw = queue(pool);
  const set = (id: string, head: string, next: () => Row | undefined): SlotItem[] => [{ id: `dsa:${id}`, cat: 'dsa', text: head },
    ...[0, 1].map(() => { const p = next(); if (!p) throw new Error(`BLOCKED: dsa ${id} has no problem left`); return { id: `dsa:${id}:${p.slug}`, text: p.name, url: p.url, cat: 'dsa' as Cat, slug: p.slug, diff: p.d }; })];
  const adv = queue(c.ADV_DSA as Row[]);
  const oa: string[] = c.OA_LINKS;
  for (const key of PHASE3) {
    const [kind, k] = key.split('-'), n = Number(k);
    if (kind === 'oa') slots.push([{ id: `dsa:oa-${n}`, cat: 'dsa', url: oa[n - 1], mins: 60,
      text: 'Amazon OA simulation (60 minutes): solve 2 problems from this post, timed. Then read the best solution to each and log your minutes.' }]);
    else if (kind === 'google') slots.push(set(`google-${n}`, 'Google set (60 min): 2 problems typed in a plain Google Doc. No autocomplete, no running code. Check each by hand.', draw.next));
    else if (kind === 'meta') slots.push(set(`meta-${n}`, 'Meta speed set (40 min): 2 problems, talking out loud. Then optimize each and explain the trade-off.', draw.next));
    else if (kind === 'revisit') slots.push(set(`revisit-${n}`, 'Revisit (60 min): 2 problems you have met before, solved again from a blank file. Talk out loud.', revisit.next));
    else slots.push(expandRow(adv.next(), 'dsa')[0]);
  }
  // Interview-environment practice rides along on the Monday of its week (weeks 10–13).
  for (const env of c.INTERVIEW_ENV as Row[]) slots[at(env.week, 1)].push(item(env, 'dsa'));
  return toSlots('dsa', slots);
}

// ---------- fe (v3 §2): the AI engineering core, one content row per slot ----------
function aiCoreTrack(c: TrackContent): Slot[] {
  return toSlots('fe', (c.AI_CORE as Row[]).flatMap((r) => expandRow(r, 'ai')));
}
/** A v3 track's ids: each row's primary id plus the v2 ids it absorbs (`covers`). */
const rowIds = (rows: Row[] | undefined): Set<string> => new Set<string>((rows ?? []).flatMap((r: Row) => [r.id, ...(r.covers ?? [])]));
/** Interim (until Tasks 7 and 8 replace the v2 beh and ai tracks): ids the AI core lays out or absorbs are skipped by
 * those v2 tracks, so nothing is laid out twice. */
const aiCoreIds = (c: TrackContent) => rowIds(c.AI_CORE);
/** Interim (until Tasks 5 and 8 replace the v2 jt and ai tracks): the same for the ids Systems lays out or absorbs
 * (the how-it-works case studies and the 4 DDIA reads). */
const systemsIds = (c: TrackContent) => rowIds(c.SYSTEMS);

// ---------- mc (v3 §5): Product, the flagship ----------
/** Walk the 78 slots: Saturdays are the 13 LLD sessions, Mon–Wed of weeks 7 and 10 the take-home parts (part 1 carries the
 * brief), and every other weekday slot the next flagship step. The v2 builds, timed passes and screenshot builds are gone. */
function productTrack(c: TrackContent): Slot[] {
  const flagship = queue(c.FLAGSHIP as Row[]), lld = queue(c.LLD as Row[]);
  const takeHome = (w: number) => (c.TAKE_HOMES as Row[]).find((t) => t.week === w);
  const slots: SlotItem[][] = [];
  for (let i = 0; i < SLOTS; i++) {
    const w = weekOf(i), d = GRIND_DOW[i], th = takeHome(w);
    if (d === 6) {
      const x = lld.next();
      if (!x) throw new Error('track mc: LLD ran out before the last Saturday');
      slots.push([item(x, 'mc')]);
    } else if (th && d <= 3) {
      slots.push([item(th.parts[d - 1], 'proj', d === 1 ? { brief: th.text } : {})]);
    } else {
      const r = flagship.next();
      if (!r) throw new Error('track mc: flagship ran out before the last weekday');
      slots.push(...expandRow(r, 'proj'));
    }
  }
  mustFit('mc', flagship.left + lld.left);
  return toSlots('mc', slots);
}

// ---------- sd (v3 §3): Systems, one content row per slot ----------
function sdTrack(c: TrackContent): Slot[] {
  return toSlots('sd', (c.SYSTEMS as Row[]).flatMap((r) => expandRow(r, 'sd')));
}

// ---------- jt (v3 §4): Platform, data and DevOps ----------
/** The 0-based slot index each practical coding rep aims for: slots 23, 28, …, 78 (23 + 5k). */
const practicalTarget = (k: number) => 22 + 5 * k;
/** The depth rows in order, with the 12 practical reps (`jt:practical-*`) at or near 23 + 5k. A topic never splits: the
 * rows sharing a `group` (and the two slots of a `parts: 2` row) stay on consecutive slots. When a practical's target falls
 * inside a topic, the practical goes just before or just after it, whichever is closer (before on a tie). */
function platformTrack(c: TrackContent): Slot[] {
  const rows: Row[] = c.PLATFORM;
  const isPractical = (r: Row) => r.id.startsWith('jt:practical-');
  const practicals = queue(rows.filter(isPractical));
  // Topics: a run of rows with the same `group`, or one row on its own.
  const topics: Row[][] = [];
  for (const r of rows.filter((x) => !isPractical(x))) {
    const last = topics.at(-1);
    if (r.group && last && last[0].group === r.group) last.push(r);
    else topics.push([r]);
  }
  const slots: SlotItem[][] = [];
  let k = 0;
  const putPractical = () => { slots.push(...expandRow(practicals.next(), 'platform')); k++; };
  const putTopic = (t: Row[]) => t.forEach((r) => slots.push(...expandRow(r, 'platform')));
  for (const t of topics) {
    while (practicals.left && practicalTarget(k) <= slots.length) putPractical();
    const i = slots.length, n = t.reduce((m, r) => m + (r.parts === 2 ? 2 : 1), 0), target = practicalTarget(k);
    if (practicals.left && target > i && target < i + n) {
      if (target - i <= i + n - target) { putPractical(); putTopic(t); } else { putTopic(t); putPractical(); }
    } else putTopic(t);
  }
  while (practicals.left) putPractical();
  return toSlots('jt', slots);
}
/** Interim (until Task 7 replaces the v2 beh track): the ids Platform lays out or absorbs. */
const platformIds = (c: TrackContent) => rowIds(c.PLATFORM);

// ---------- beh (§8): career block ----------
function behTrack(c: TrackContent): Slot[] {
  // Pinned: deep dives on the Saturdays of weeks 2–4, negotiation in week 12 (Mon, Tue). Everything else flows in order.
  const pins: Record<string, number> = {
    'beh:deep-dive-1': at(2, 6), 'beh:deep-dive-2': at(3, 6), 'beh:deep-dive-3': at(4, 6),
    'beh:negotiation-1': at(12, 1), 'beh:negotiation-2': at(12, 2),
  };
  // FDE items that moved to the v2 judgment thread (DECOMP `from`, Career from Task 7), the AI core or Platform are skipped here.
  const skip = new Set<string>([...(c.DECOMP as Row[]).filter((x) => x.from).map((x) => x.from), ...aiCoreIds(c), ...platformIds(c)]);
  const fde: Row[] = (c.FDE as Row[]).filter((x) => !skip.has(x.id));
  const teardowns = queue(c.TEARDOWNS as Row[]);
  const TEARDOWN_EVERY = Math.floor(fde.length / (teardowns.left || 1)) || 1;
  // After BEH runs out: FDE items with a product teardown after every few of them.
  const after: SlotItem[] = [];
  fde.forEach((x, k) => {
    after.push(item(x, 'fde'));
    if ((k + 1) % TEARDOWN_EVERY === 0 && teardowns.left) after.push(item(teardowns.next(), 'beh'));
  });
  while (teardowns.left) after.push(item(teardowns.next(), 'beh'));
  const flow = queue([...(c.BEH as Row[]).filter((x) => !(x.id in pins)).map((x) => item(x, 'beh')), ...after]);
  const slots: SlotItem[][] = Array.from({ length: SLOTS }, () => []);
  for (const x of c.BEH as Row[]) if (x.id in pins) slots[pins[x.id]] = [item(x, 'beh')];
  let n = 0;
  for (const s of slots) {
    if (s.length) continue;
    s.push(flow.left ? flow.next()! : filler(`fde:prompt-revisit-${++n}`, 'FDE prompt rep (45 min, out loud): redo one decomposition or client-simulation prompt from the judgment thread with a new constraint, then compare with your first attempt.', 'fde'));
  }
  mustFit('beh', flow.left);
  // Product & UX rides as the second task in each career slot from week 1, skipping the deep-dive Saturdays.
  const ux = queue(c.UX as Row[]);
  const deepDives = new Set(Object.entries(pins).filter(([id]) => id.startsWith('beh:deep-dive')).map(([, i]) => i));
  slots.forEach((s, i) => { if (!deepDives.has(i) && ux.left) s.push(item(ux.next(), 'ux')); });
  mustFit('beh (UX)', ux.left);
  return toSlots('beh', slots);
}

/** The AI_EVENING item that finishes teaching each AI_REVIEW topic; the review only comes after it. */
const REVIEW_TAUGHT_BY: Record<string, string> = {
  'ai:review-transformers': 'ai:attention-annotated-code', 'ai:review-rlhf': 'ai:instructgpt-results',
  'ai:review-rag': 'ai:contextual-retrieval', 'ai:review-agents': 'ai:building-effective-agents',
  'ai:review-evals': 'ai:evals-hamel', 'ai:review-scaling-laws': 'ai:scaling-write-up',
  'ai:review-finetune-vs-rag': 'ai:prompt-rag-finetune', 'ai:review-prompt-injection': 'ai:owasp-llm',
};

// ---------- ai (§7): the evening hour at its old days, depth reads after their targets, review in the gaps ----------
// Interim until Task 8: items the AI core or Systems lays out or absorbs are skipped. A depth read whose `after` is not in this
// track takes the first free slot and drops that `after`.
function aiTrack(c: TrackContent): Slot[] {
  const core = new Set<string>([...aiCoreIds(c), ...systemsIds(c)]);
  const slots: (SlotItem[] | undefined)[] = Array.from({ length: SLOTS }, () => undefined);
  const E: Row[] = (c.AI_EVENING as Row[]).filter((x) => !core.has(x.id));
  for (const x of E.filter((x) => typeof x.day === 'number')) {
    if (slots[x.day]) throw new Error(`track ai: two items on day ${x.day}`);
    slots[x.day] = [item(x, 'ai')];
  }
  // Depth reads (no day) take the first free slot after the item they follow (`after`), in list order so chains hold.
  for (const x of E.filter((x) => typeof x.day !== 'number')) {
    const inTrack = E.some((y) => y.id === x.after), from = inTrack ? slots.findIndex((s) => s?.some((y) => y.id === x.after)) : -1;
    if (inTrack && from < 0) mustFit('ai', 1);
    const free = slots.findIndex((s, i) => i > from && !s);
    if (free < 0) mustFit('ai', 1);
    const it = item(x, 'ai');
    if (!inTrack) delete it.after; // its target moved to the AI core; holding this read back would stall the ai track
    slots[free] = [it];
  }
  // The gaps (old v2 build days) and the tail: explain-it-back reviews, each only after the evening slot
  // that teaches its topic. Least-used covered review first (never the same one twice running); with none, a notes revisit.
  const at_ = (id: string) => slots.findIndex((s) => s?.some((y) => y.id === id));
  const reviews = (c.AI_REVIEW as Row[]).filter((r) => !core.has(r.id)).map((r) => {
    const taught = REVIEW_TAUGHT_BY[r.id];
    if (!taught || at_(taught) < 0) throw new Error(`track ai: no teaching item for ${r.id}`);
    return { r, after: at_(taught), uses: 0 };
  });
  let last: Row = null, revisits = 0;
  const out = slots.map((s, i) => {
    if (s) return s;
    const pick = reviews.filter((x) => x.after < i && x.r !== last).sort((a, b) => a.uses - b.uses)[0];
    if (!pick) {
      last = null;
      const prevId = [...slots.slice(0, i)].reverse().find(Boolean)?.[0].id, prev = E.find((x) => x.id === prevId);
      return [filler(`ai:revisit-notes-${++revisits}`, `Revisit: re-read your notes from ${prev ? (prev.unit ?? prev.text) : 'the AI core track'}`, 'ai')];
    }
    last = pick.r;
    const n = ++pick.uses;
    return [n > 1 ? filler(`${pick.r.id}:${n}`, pick.r.text, 'ai') : item(pick.r, 'ai')];
  });
  return toSlots('ai', out);
}

/** The 7 track sequences, 78 slots each. `content` is the merged exports of src/lib/content/*.js. */
export function buildTracks(content: TrackContent): Record<TrackId, Slot[]> {
  if (WEEKS * 6 !== SLOTS) throw new Error('Grind has 13 weeks of 6 study days');
  return {
    dsa: dsaTrack(content), fe: aiCoreTrack(content), mc: productTrack(content),
    sd: sdTrack(content), jt: platformTrack(content), beh: behTrack(content), ai: aiTrack(content),
  };
}
