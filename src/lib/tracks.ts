/* Track sequences (roadmap v2 §1–§9, §14; v3 drops the aib track): the curriculum as 7 ordered tracks of 78 slots each, one track per study block.
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
const MWF = [1, 3, 5];

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
/** Numbered fillers: `${prefix}-1`, `${prefix}-2`, … per prefix. */
function fillers() {
  const n: Record<string, number> = {};
  return (prefix: string, text: string, cat: Cat) => filler(`${prefix}-${(n[prefix] = (n[prefix] ?? 0) + 1)}`, text, cat);
}

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

// ---------- dsa (§2, §3, §18, Task 14): foundations, 27 patterns, ADV_DSA, Phase 3 timed sets ----------
const AI_DRILL = 'AI-enabled coding drill (Meta-style, 60 min): read a small multi-file repo for 5 min, fix one bug without AI, add a feature using AI chat only (no autocomplete), then optimize for a 10× input. Narrate everything.';
const AI_DRILL_URL = 'https://www.hellointerview.com/blog/meta-ai-enabled-coding';
const PROBLEMS_PER_SLOT = 2;
// Patterns may run to slot 57 (week 10 Thu); the 3 patterns added in Task 14 took their slots from the Phase 3 timed sets.
const PATTERNS_END = 57;

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const problemItem = (p: Row): SlotItem => ({
  id: `p-${p.slug}`, text: p.name, url: p.url, cat: 'dsa', pattern: p.pattern, tier: p.tier, flags: [...p.flags], slug: p.slug, diff: p.d,
  ...(p.role ? { role: p.role } : {}), ...(p.role === 'unseen' ? { hiddenUntilStart: true } : {}),
});

function dsaTrack(c: TrackContent): Slot[] {
  const slots: SlotItem[][] = (c.FOUNDATIONS as Row[]).map((f) => [item(f, 'dsa')]);
  // Patterns: the must-solve problems in pattern order, 2 per morning block. The pattern card rides on the pattern's
  // first slot (before its first problem) and the explain-back on its last slot (after its last problem).
  const pats: Row[] = c.PATTERNS;
  const must: Row[] = pats.flatMap((pt) => c.PROBLEMS.filter((p: Row) => p.tier === 'must' && p.pattern === pt.id));
  const pat = (id: string) => pats.find((p) => p.id === id);
  for (let k = 0; k < must.length; k += PROBLEMS_PER_SLOT) {
    const items: SlotItem[] = [];
    must.slice(k, k + PROBLEMS_PER_SLOT).forEach((p, j) => {
      const n = k + j, pt = pat(p.pattern);
      if (must[n - 1]?.pattern !== p.pattern) items.push({ id: `dsa:card-${pt.id}`, cat: 'dsa', pattern: pt.id, ...(pt.link ? { url: pt.link } : {}),
        text: `Pattern card · ${pt.name}: learn the signal, template, why it works, complexity and traps; add your own notes.` });
      items.push(problemItem(p));
      if (must[n + 1]?.pattern !== p.pattern) items.push({ id: `dsa:explain-back-${pt.id}`, cat: 'dsa', pattern: pt.id,
        text: `${pt.name} · Explain-back: fill the card from memory, then compare` });
    });
    slots.push(items);
  }
  mustFit('dsa (patterns by slot 57)', slots.length - (PATTERNS_END + 1), PATTERNS_END + 1);
  // ADV_DSA at full length, one morning block each.
  for (const [text, url] of c.ADV_DSA as [string, string][]) {
    const adv = text.startsWith('Advanced DSA: ');
    slots.push([{ id: `adv:${slugify(adv ? text.slice('Advanced DSA: '.length) : text.split(':')[0])}`, cat: 'dsa', url,
      text: adv ? `${text} (learn it + solve 1 problem)` : text }]);
  }
  // Phase 3: timed sets rotating Meta speed / Google doc / Amazon OA / AI-enabled drill, from must-solve + hot problems
  // (medium and hard), spread across patterns. The day's patterns are hidden: no pattern field, no pattern in the text.
  const byPattern = pats.map((pt) => c.PROBLEMS.filter((p: Row) => p.pattern === pt.id && p.d !== 'E' && (p.tier === 'must' || p.flags.includes('hot'))));
  const pool: Row[] = [];
  for (let r = 0; byPattern.some((ps: Row[]) => ps[r]); r++) byPattern.forEach((ps: Row[]) => ps[r] && pool.push(ps[r]));
  const draw = queue(pool);
  const set = (key: string, head: string): SlotItem[] => [{ id: `dsa:timed-${key}`, cat: 'dsa', text: head },
    ...[0, 1, 2].map(() => { const p = draw.next(); return { id: `dsa:timed-${key}:${p.slug}`, text: p.name, url: p.url, cat: 'dsa' as Cat, slug: p.slug, diff: p.d }; })];
  for (let r = 0; slots.length < SLOTS; r++) {
    const kind = r % 4, n = Math.floor(r / 4) + 1;
    if (kind === 0) slots.push(set(`meta-${n}`, 'Meta speed set: first 2 problems in 40 minutes, then the third. Talk out loud; name each pattern before you code.'));
    else if (kind === 1) slots.push(set(`google-${n}`, 'Google set: 3 problems in 90 min, typed in a plain Google Doc (no autocomplete, no running code)'));
    else if (kind === 2) slots.push([{ id: `dsa:oa-${n}`, cat: 'dsa', url: c.OA_LINKS[(n - 1) % c.OA_LINKS.length], text: 'Amazon OA simulation: 2 problems from this post in 70 minutes' }]);
    else slots.push([{ id: `dsa:ai-drill-${n}`, cat: 'dsa', url: AI_DRILL_URL, text: AI_DRILL }]);
  }
  // Interview-environment practice rides along on the Monday of its week (weeks 10–13).
  for (const env of c.INTERVIEW_ENV as Row[]) slots[at(env.week, 1)].push(item(env, 'dsa'));
  return toSlots('dsa', slots);
}

// ---------- fe (§9): FE topics, the depth reads after their `after`, then revision pairs ----------
function feTrack(c: TrackContent): Slot[] {
  const fe = (x: Row) => item(x, 'fe', { ...(x.practice ? { practice: x.practice } : {}), ...(x.summary ? { summary: x.summary } : {}) });
  const slots: SlotItem[][] = [];
  for (const x of c.FE as Row[]) {
    slots.push([fe(x)]);
    for (const d of (c.FE_DEPTH_READS as Row[]).filter((d) => d.after === x.id)) slots.push([fe(d)]);
  }
  const FE: Row[] = c.FE;
  for (let k = 0; slots.length < SLOTS; k++) {
    const a = FE[(k * 2) % FE.length], b = FE[(k * 2 + 1) % FE.length], s = (x: Row) => x.id.replace(/^fe:/, '');
    slots.push([
      filler(`fe:revise-${s(a)}-${s(b)}`, `Revise and explain out loud (3 min each): ${a.text}; ${b.text}`, 'fe', a.url),
      filler(`fe:bfe-${k + 1}`, 'Solve 2 JS / React questions + a 10-question output quiz', 'fe', 'https://bigfrontend.dev/problem'),
    ]);
  }
  return toSlots('fe', slots);
}

// ---------- mc (§5): builds Mon/Wed/Fri, flagship Tue/Thu from week 2, LLD Sat, take-homes, timed second passes ----------
function mcTrack(c: TrackContent): Slot[] {
  const MC: Row[] = c.MC;
  const byId = (id: string) => MC.find((x) => x.id === id);
  // A pair is one 90-min block (45 + 45) at its first member's MC position.
  const blocks = queue(MC.filter((x) => !x.pair || x.pair[0] === x.id).map((x) => (x.pair ? x.pair.map(byId) : [x])));
  const screenshots = queue(c.MC_SCREENSHOT as Row[]);
  const flagship: Row[] = [];
  // 18 steps + the local-first read = 19 items in 18 Tue/Thu slots of weeks 2–11, so the case study lands on week 12 Tue (Ruling R10).
  for (const p of c.PROJECT as Row[]) flagship.push(p, ...(c.PROJECT_DEPTH_READS as Row[]).filter((d) => d.after === p.id));
  const proj = queue(flagship);
  const lld = queue(c.LLD as Row[]);
  const timed: string[] = c.MC_TIMED;
  const timedPairs = queue(Array.from({ length: Math.ceil(timed.length / 2) }, (_, k) => timed.slice(k * 2, k * 2 + 2)));
  const takeHome = (w: number) => (c.TAKE_HOMES as Row[]).find((t) => t.week === w);
  const placed = new Set<string>();
  const build = () => { const b = blocks.next()!; b.forEach((x: Row) => placed.add(x.id)); return b.map((x: Row) => item(x, 'mc')); };
  const fill = fillers();
  let lateMwf = 0;
  const slots: SlotItem[][] = [];
  for (let i = 0; i < SLOTS; i++) {
    const w = weekOf(i), d = GRIND_DOW[i], th = takeHome(w);
    if (th && d <= 3) {
      const p = th.parts[d - 1];
      slots.push([item(p, 'mc', d === 1 ? { brief: th.text } : {})]);
    } else if (d === 6) {
      slots.push(lld.left ? [item(lld.next(), 'mc')] : [fill('mc:revisit-lld', 'Revisit: redo one LLD design from scratch, then compare', 'mc')]);
    } else if (!MWF.includes(d)) {
      // Tue/Thu: the flagship from week 2 (week 1 has no flagship yet, so it builds).
      if (w === 1 && blocks.left) slots.push(build());
      else if (w > 1 && proj.left) slots.push([item(proj.next(), 'proj')]);
      else slots.push([fill('proj:revisit', 'Revisit: one flagship improvement from your launch feedback (fix, test, update the case study)', 'proj')]);
    } else if (d === 5 && [4, 6, 8].includes(w) && screenshots.left) {
      slots.push([item(screenshots.next(), 'mc')]);
    } else if (w >= 9) {
      // From week 9: timed second passes, 2 per block, alternating with the remaining builds (each pass after its build).
      const pair = timedPairs.peek(), ready = pair && pair.every((id) => placed.has(id));
      if (ready && (lateMwf++ % 2 === 0 || !blocks.left)) {
        slots.push(timedPairs.next()!.map((id) => ({ id: `${id}:timed`, cat: 'mc' as Cat, text: `Timed second pass (30–45 min, from scratch, talking out loud): ${byId(id).text}` })));
      } else if (blocks.left) slots.push(build());
      else slots.push([fill('mc:revisit', 'Revisit: timed rebuild (45 min) of the earlier build you found hardest', 'mc')]);
    } else if (blocks.left) slots.push(build());
    else slots.push([fill('mc:revisit', 'Revisit: timed rebuild (45 min) of the earlier build you found hardest', 'mc')]);
  }
  mustFit('mc', blocks.left + screenshots.left + proj.left + lld.left + timedPairs.left);
  return toSlots('mc', slots);
}

// ---------- sd (§6): SD in order, then the SD_MOCKS rotation ----------
function sdTrack(c: TrackContent): Slot[] {
  const slots: SlotItem[][] = (c.SD as Row[]).map((x) => [item(x, 'sd')]);
  const M: Row[] = c.SD_MOCKS;
  for (let k = 0; slots.length < SLOTS; k++) {
    const m = M[k % M.length], round = Math.floor(k / M.length);
    const text = `Mock, 45 min, timed, out loud: ${m.text}. Then self-review against the HLD framework: what did you skip?`;
    slots.push([round ? filler(`${m.id}:${round + 1}`, text, 'sd') : { id: m.id, text, cat: 'sd' }]);
  }
  return toSlots('sd', slots);
}

// ---------- jt (§4): the judgment thread, Mon–Sat ----------
const PEER_URL = 'https://www.tryexponent.com/practice';
const PEER_ROUNDS: [string, Cat][] = [['coding', 'dsa'], ['frontend system design', 'sd'], ['behavioral', 'beh'], ['decomposition', 'fde']];
// Full mock loops (Phase 3): 3 rounds of 45 min each. Round 1 runs in the Saturday slot; rounds 2–3 carry to Sunday (R9).
const LOOPS: { name: string; peer: boolean; rounds: string[] }[] = [
  { name: 'forward-deployed', peer: true, rounds: ['decomposition', 'practical coding', 'system design'] },
  { name: 'frontend SDE-2', peer: false, rounds: ['DSA coding', 'frontend coding', 'frontend system design'] },
  { name: 'product engineer', peer: true, rounds: ['coding (DSA)', 'machine coding', 'product/system design'] },
  { name: "your top target company's loop, from the company map", peer: false, rounds: ['coding', 'system design', 'behavioral'] },
];
const SAT_CAP = 75; // the v2 Saturday slot (min); interim text until Task 5 replaces these items

function jtSaturday(w: number): SlotItem[] {
  const carry = (x: SlotItem): SlotItem => ({ ...x, sundayCarry: true });
  // Odd weeks 1–9: the 60-min AI drill.
  if (w % 2 === 1 && w <= 9) return [{ id: `jt:ai-drill-${(w + 1) / 2}`, cat: 'dsa', url: AI_DRILL_URL, text: AI_DRILL, mins: 60 }];
  if (w >= 10) {
    const n = w - 9, loop = LOOPS[n - 1];
    return loop.rounds.map((round, k) => {
      const it: SlotItem = { id: `jt:mock-loop-${n}-round-${k + 1}`, cat: 'dsa', url: PEER_URL, mins: 45,
        text: `Full mock loop ${n} of 4 (${loop.name}), round ${k + 1} of ${loop.rounds.length}: ${round}, 45 min, ${loop.peer ? 'with a peer on Pramp/Exponent' : 'with a peer or recorded solo'}, timed and out loud.` };
      return k === 0 ? it : carry(it);
    });
  }
  const items: SlotItem[] = [];
  if (w >= 4) {
    const n = (w - 4) / 2, [round, cat] = PEER_ROUNDS[n % PEER_ROUNDS.length];
    items.push({ id: `jt:peer-mock-${n + 1}`, cat, url: PEER_URL, mins: SAT_CAP,
      text: `Peer mock with a real person (Pramp or Exponent, 45 min): ${round} round. This is the week's timed mock; use the rest of the 75-min slot to write down the feedback and redo what you missed.` });
  } else {
    items.push({ id: `jt:mock-${w / 2}`, cat: 'dsa', mins: SAT_CAP,
      text: 'Weekly timed mock (75 min, out loud; uses the whole revision + judgment slot): 2 problems you haven\'t seen, from the optional pools of patterns you\'ve covered. Log each as unseen with your minutes.' });
  }
  // From week 5: the speed pair. The mock fills the 75-min slot, so it carries to Sunday (R9).
  if (w >= 5) items.push(carry({ id: `jt:speed-pair-${(w - 4) / 2}`, cat: 'dsa', mins: 35, text: 'Speed pair (35 min): re-solve 2 must-solve problems you\'ve already done, from a blank file, talking out loud.' }));
  return items;
}

function jtTrack(c: TrackContent): Slot[] {
  const hiw = queue(c.HOW_IT_WORKS as Row[]), memos = queue(c.MEMOS as Row[]), practical = queue(c.PRACTICAL as Row[]), decomp = queue(c.DECOMP as Row[]);
  const fixes = queue(c.OSS_FIXES as Row[]);
  const reviews: Row[] = c.CODE_REVIEWS; // each carries its Grind week (Ruling R4: weeks 5, 8, 11, 13)
  // SRE ch. 12 must come before the first OSS fix (week 3 Fri). Week 3 Mon–Thu are full and a 45-min read doesn't fit
  // beside a 45-min rep, and the week-3 Saturday is after that Friday, so it takes the free week-2 Friday.
  const sre: Row = (c.JT_DEPTH_READS as Row[]).find((x) => x.before === 'jt:oss-fix-1');
  const repo = (id: string) => (c.OSS_REPOS as Row[]).find((r) => r.id === id);
  const rep = fillers();
  const slots: SlotItem[][] = [];
  for (let i = 0; i < SLOTS; i++) {
    const w = weekOf(i), d = GRIND_DOW[i];
    if (d === 1) slots.push(hiw.left ? [item(hiw.next(), 'sd')] : [rep('jt:hiw-repeat', 'How it really works, repeat: pick the earlier write-up you understood least, redraw the system from memory, then compare and name 3 trade-offs.', 'sd')]);
    else if (d === 2) slots.push(memos.left ? [item(memos.next(), 'sd')] : [rep('jt:memo-repeat', 'Decision memo, repeat: rewrite your weakest memo with what you know now.', 'sd')]);
    else if (d === 3) slots.push(practical.left ? [item(practical.next(), 'mc')] : [rep('jt:practical-repeat', 'Practical coding, repeat (45 min timed): redo the practical you found hardest, in the other language.', 'mc')]);
    else if (d === 4) {
      if (w === 1) slots.push([filler('jt:oss-setup-excalidraw', 'Set up Excalidraw locally before the first open-source fix (week 3): clone, install, run the app and the tests, read CONTRIBUTING.md. Note what blocked you.', 'mc', `https://github.com/${repo('oss:excalidraw').repo}`)]);
      else slots.push(decomp.left ? [item(decomp.next(), 'fde')] : [rep('jt:decomp-repeat', 'Decomposition, repeat (45 min, out loud): redo one earlier prompt with a new constraint.', 'fde')]);
    } else if (d === 5) {
      const review = reviews.find((r) => r.week === w);
      if (w === 1) slots.push([filler('jt:oss-setup-posthog-calcom', 'Set up PostHog and Cal.com locally as far as 45 min allows (their fixes are in weeks 4 and 6): clone, follow each local-dev guide, note the blockers.', 'mc', `https://github.com/${repo('oss:posthog').repo}`)]);
      else if (w === 2) slots.push([item(sre, 'sd')]);
      else if (review) slots.push([item(review, 'mc')]);
      else slots.push(fixes.left ? [item(fixes.next(), 'mc')] : [rep('jt:oss-repeat', 'Code you didn\'t write: finish or follow up on your open PRs.', 'mc')]);
    } else slots.push(jtSaturday(w));
  }
  mustFit('jt', hiw.left + memos.left + practical.left + decomp.left + fixes.left);
  return toSlots('jt', slots);
}

// ---------- beh (§8): career block ----------
function behTrack(c: TrackContent): Slot[] {
  // Pinned: deep dives on the Saturdays of weeks 2–4, negotiation in week 12 (Mon, Tue). Everything else flows in order.
  const pins: Record<string, number> = {
    'beh:deep-dive-1': at(2, 6), 'beh:deep-dive-2': at(3, 6), 'beh:deep-dive-3': at(4, 6),
    'beh:negotiation-1': at(12, 1), 'beh:negotiation-2': at(12, 2),
  };
  // FDE items that moved to the judgment thread (DECOMP `from`) or duplicate a jt rep are skipped here.
  const skip = new Set<string>([...(c.DECOMP as Row[]).filter((x) => x.from).map((x) => x.from), 'fde:practical-coding-log', 'fde:reengineering-round']);
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
function aiTrack(c: TrackContent): Slot[] {
  const slots: (SlotItem[] | undefined)[] = Array.from({ length: SLOTS }, () => undefined);
  const E: Row[] = c.AI_EVENING;
  for (const x of E.filter((x) => typeof x.day === 'number')) {
    if (slots[x.day]) throw new Error(`track ai: two items on day ${x.day}`);
    slots[x.day] = [item(x, 'ai')];
  }
  // Depth reads (no day) take the first free slot after the item they follow (`after`), in list order so chains hold.
  for (const x of E.filter((x) => typeof x.day !== 'number')) {
    const from = slots.findIndex((s) => s?.some((y) => y.id === x.after));
    const free = slots.findIndex((s, i) => i > from && !s);
    if (from < 0 || free < 0) mustFit('ai', 1);
    slots[free] = [item(x, 'ai')];
  }
  // The gaps (old v2 build days) and the tail: explain-it-back reviews, each only after the evening slot
  // that teaches its topic. Least-used covered review first (never the same one twice running); with none, a notes revisit.
  const at_ = (id: string) => slots.findIndex((s) => s?.some((y) => y.id === id));
  const reviews = (c.AI_REVIEW as Row[]).map((r) => {
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
      const prevId = [...slots.slice(0, i)].reverse().find(Boolean)![0].id, prev = E.find((x) => x.id === prevId);
      return [filler(`ai:revisit-notes-${++revisits}`, `Revisit: re-read your notes from ${prev.unit ?? prev.text}`, 'ai')];
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
    dsa: dsaTrack(content), fe: feTrack(content), mc: mcTrack(content),
    sd: sdTrack(content), jt: jtTrack(content), beh: behTrack(content), ai: aiTrack(content),
  };
}
