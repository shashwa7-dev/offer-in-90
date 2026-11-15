// Run: node --experimental-strip-types scripts/test-tracks.ts
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as dsa from '../src/lib/content/dsa.js';
import * as fe from '../src/lib/content/fe.js';
import * as ux from '../src/lib/content/ux.js';
import * as career from '../src/lib/content/career.js';
import * as ai from '../src/lib/content/ai.js';
import * as mc from '../src/lib/content/mc.js';
import * as sd from '../src/lib/content/sd.js';
import * as judgment from '../src/lib/content/judgment.js';
import * as reference from '../src/lib/content/reference.js';
import { buildTracks, GRIND_DOW } from '../src/lib/tracks.ts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;
const content: Any = { ...dsa, ...fe, ...ux, ...career, ...ai, ...mc, ...sd, ...judgment, ...reference };
const T: Any = buildTracks(content);
const TRACKS = ['dsa', 'aib', 'fe', 'mc', 'sd', 'jt', 'beh', 'ai'];
const idx = (w: number, d: number) => (w - 1) * 6 + (d - 1);
const ids = (track: string, i: number): string[] => T[track][i].items.map((x: Any) => x.id);
const slotOf = (track: string, id: string) => T[track].findIndex((s: Any) => s.items.some((x: Any) => x.id === id));
const has = (track: string, i: number, re: RegExp) => ids(track, i).some((id) => re.test(id));
const CATS = ['dsa', 'fe', 'mc', 'proj', 'sd', 'ux', 'beh', 'fde', 'ai', 'review', 'health', 'update'];

// ---------- shape ----------
assert.deepEqual(Object.keys(T).sort(), [...TRACKS].sort());
for (const t of TRACKS) {
  assert.equal(T[t].length, 78, `${t} has 78 slots`);
  T[t].forEach((s: Any, i: number) => {
    assert.ok(Array.isArray(s.items) && s.items.length > 0, `${t}[${i}] has items`);
    for (const x of s.items) {
      assert.ok(typeof x.id === 'string' && x.id && typeof x.text === 'string' && x.text.trim(), `${t}[${i}] id/text`);
      assert.ok(CATS.includes(x.cat), `${t}[${i}] ${x.id} cat ${x.cat}`);
      if (x.url !== undefined) assert.ok(typeof x.url === 'string' && /^https:\/\//.test(x.url), `${x.id} url`);
    }
  });
}
const all: Any[] = TRACKS.flatMap((t) => T[t].flatMap((s: Any) => s.items));
const allIds = all.map((x) => x.id);
const dupes = allIds.filter((id, i) => allIds.indexOf(id) !== i);
assert.deepEqual(dupes, [], 'no ID twice within or across tracks');
assert.deepEqual(buildTracks(content), T, 'deterministic');

// ---------- weekdays ----------
assert.equal(GRIND_DOW.length, 78);
assert.equal(GRIND_DOW[0], 1);
assert.equal(GRIND_DOW[5], 6);
assert.equal(GRIND_DOW[6], 1);
GRIND_DOW.forEach((d: number, i: number) => assert.equal(d, (i % 6) + 1));

// ---------- every content item exactly once (fillers excepted) ----------
const PRIMARY = (judgment.JT_DEPTH_READS as Any[]).slice(1); // [0] is the Stripe how-it-works item itself
const SKIP_FDE = new Set([...(judgment.DECOMP as Any[]).filter((x) => x.from).map((x) => x.from), 'fde:practical-coding-log', 'fde:reengineering-round']);
const expected: string[] = [
  ...(dsa.PROBLEMS as Any[]).filter((p) => p.tier === 'must').map((p) => `p-${p.slug}`),
  ...(dsa.FOUNDATIONS as Any[]),
  ...(fe.FE as Any[]), ...(fe.FE_DEPTH_READS as Any[]), ...(ux.UX as Any[]), ...(career.BEH as Any[]),
  ...(career.FDE as Any[]).filter((x) => !SKIP_FDE.has(x.id)), ...(career.TEARDOWNS as Any[]),
  ...(ai.AIB as Any[]).flatMap((x) => (x.slots === 2 ? [{ id: `${x.id}#1` }, { id: `${x.id}#2` }] : [x])),
  ...(ai.AI_EVENING as Any[]), ...(ai.AI_REVIEW as Any[]),
  ...(mc.MC as Any[]), ...(mc.MC_SCREENSHOT as Any[]), ...(mc.TAKE_HOMES as Any[]).flatMap((x) => x.parts),
  ...(mc.PROJECT as Any[]), ...(mc.PROJECT_DEPTH_READS as Any[]), ...(mc.LLD as Any[]),
  ...(sd.SD as Any[]),
  ...(judgment.HOW_IT_WORKS as Any[]), ...(judgment.MEMOS as Any[]), ...(judgment.PRACTICAL as Any[]), ...(judgment.DECOMP as Any[]),
  ...(judgment.OSS_FIXES as Any[]), ...(judgment.CODE_REVIEWS as Any[]), ...PRIMARY, ...(judgment.INTERVIEW_ENV as Any[]),
].map((x: Any) => (typeof x === 'string' ? x : x.id));
// AIB items that take 2 slots appear once per part, keyed by id + part.
const seen = all.filter((x) => !x.filler).map((x) => (x.part ? `${x.id.replace(/:part-\d$/, '')}#${x.part[0]}` : x.id));
for (const id of expected) assert.equal(seen.filter((s) => s === id).length, 1, `${id} appears exactly once`);
for (const id of (mc.MC_TIMED as string[])) assert.equal(allIds.filter((x) => x === `${id}:timed`).length, 1, `${id} timed pass once`);
assert.equal(all.filter((x) => x.id.startsWith('adv:')).length, 8, 'ADV_DSA x8');
const known = new Set([...expected, ...(mc.MC_TIMED as string[]).map((id) => `${id}:timed`)]);
const extras = all.filter((x) => !x.filler && !known.has(x.part ? `${x.id.replace(/:part-\d$/, '')}#${x.part[0]}` : x.id));
// Non-content items the builder adds on purpose: pattern cards, explain-backs, foundations, ADV_DSA, Phase 3 sets, FE revision, SD mocks, jt Saturdays.
for (const x of extras) assert.match(x.id, /^(dsa:(card|explain-back|timed|oa|ai-drill)-|adv:|fe:revise-|fe:bfe-|sdm:|jt:(ai-drill|mock|peer-mock|speed-pair|mock-loop)-)/, `unexpected item ${x.id}`);
// The SD_MOCKS rotation is used in order from its first item.
const sdm = T.sd.flatMap((s: Any) => s.items).filter((x: Any) => x.id.startsWith('sdm:')).map((x: Any) => x.id);
assert.deepEqual(sdm, (sd.SD_MOCKS as Any[]).slice(0, sdm.length).map((x) => x.id));

// ---------- dsa ----------
const PATS = (dsa.PATTERNS as Any[]).map((p) => p.id);
assert.deepEqual(T.dsa.slice(0, 5).map((s: Any) => s.items.map((x: Any) => x.id)), (dsa.FOUNDATIONS as Any[]).map((x) => [x.id]), 'foundations from content in slots 0–4');
assert.notEqual(T.dsa[0].items[0], (dsa.FOUNDATIONS as Any[])[0], 'slot items are copies');
assert.notEqual(all.find((x) => x.flags)?.flags, (dsa.PROBLEMS as Any[]).find((p) => all.find((x) => x.flags)?.slug === p.slug).flags, 'flags copied');
const dsaProblems = T.dsa.slice(0, 54).flatMap((s: Any) => s.items).filter((x: Any) => x.id.startsWith('p-')).map((x: Any) => x.id);
assert.deepEqual(dsaProblems, (dsa.PROBLEMS as Any[]).filter((p) => p.tier === 'must').map((p) => `p-${p.slug}`), '24 patterns in order, must-solve only');
const lastPatternSlot = Math.max(...T.dsa.map((s: Any, i: number) => (s.items.some((x: Any) => x.id.startsWith('p-') || x.id.startsWith('dsa:card-')) ? i : -1)));
assert.ok(lastPatternSlot <= 53, `patterns end by slot 53 (got ${lastPatternSlot})`);
for (const p of PATS) {
  const slots = T.dsa.map((s: Any, i: number) => (s.items.some((x: Any) => x.id.startsWith('p-') && x.pattern === p) ? i : -1)).filter((i: number) => i >= 0);
  assert.ok(has('dsa', slots[0], new RegExp(`^dsa:card-${p}$`)), `${p} card on first slot`);
  assert.ok(has('dsa', slots[slots.length - 1], new RegExp(`^dsa:explain-back-${p}$`)), `${p} explain-back on last slot`);
  const eb = T.dsa[slots[slots.length - 1]].items.find((x: Any) => x.id === `dsa:explain-back-${p}`);
  assert.match(eb.text, /Explain-back: fill the card from memory, then compare/);
  const items = T.dsa[slots[0]].items.map((x: Any) => x.id);
  assert.ok(items.indexOf(`dsa:card-${p}`) < items.findIndex((id: string) => (dsa.PROBLEMS as Any[]).some((q) => `p-${q.slug}` === id && q.pattern === p)), `${p} card before its first problem`);
}
for (const x of all.filter((x) => x.role === 'unseen')) assert.equal(x.hiddenUntilStart, true, `${x.id} hiddenUntilStart`);
assert.ok(all.filter((x) => x.hiddenUntilStart).every((x) => x.role === 'unseen'), 'only unseen checks hidden');
for (let i = 54; i < 62; i++) assert.ok(has('dsa', i, /^adv:/), `dsa[${i}] ADV_DSA`);
const KINDS = ['meta', 'google', 'oa', 'ai-drill'];
for (let i = 62; i < 78; i++) {
  const k = KINDS[(i - 62) % 4], head = T.dsa[i].items[0];
  if (k === 'meta') assert.match(head.text, /^Meta speed set/);
  if (k === 'google') assert.match(head.text, /^Google set/);
  if (k === 'oa') assert.match(head.text, /^Amazon OA simulation/);
  if (k === 'ai-drill') assert.match(head.text, /^AI-enabled coding drill/);
  for (const x of T.dsa[i].items.filter((x: Any) => x.slug)) {
    const p = (dsa.PROBLEMS as Any[]).find((q) => q.slug === x.slug);
    assert.ok(p.tier === 'must' || p.flags.includes('hot'), `${x.id} from must-solve + hot`);
    assert.equal(x.pattern, undefined, `${x.id} pattern hidden`);
    assert.ok(!x.text.includes(p.pattern), `${x.id} text hides the pattern`);
  }
}
for (const [n, env] of (judgment.INTERVIEW_ENV as Any[]).entries()) {
  const i = slotOf('dsa', env.id);
  assert.equal(Math.floor(i / 6) + 1, 10 + n, `${env.id} in week ${10 + n}`);
  assert.equal(Math.floor(i / 6) + 1, env.week);
}
for (const t of TRACKS.filter((t) => t !== 'dsa')) assert.ok(!T[t].some((s: Any) => s.items.some((x: Any) => x.id.startsWith('env:'))), `env only in dsa (${t})`);

// ---------- aib ----------
assert.deepEqual(T.aib.slice(0, 4).map((s: Any) => [s.items[0].id, s.items[0].part]), [
  ['aib:python-for-js:part-1', [1, 2]], ['aib:python-for-js:part-2', [2, 2]], ['aib:pandas:part-1', [1, 2]], ['aib:pandas:part-2', [2, 2]],
]);
const aibFirst = (id: string) => T.aib.findIndex((s: Any) => s.items.some((x: Any) => x.id === id || x.id === `${id}:part-1`));
const aibLast = (id: string) => T.aib.findLastIndex((s: Any) => s.items.some((x: Any) => x.id === id || x.id.startsWith(`${id}:part-`)));
let cursor = 0;
for (const x of ai.AIB as Any[]) {
  const n = x.slots === 2 ? 2 : 1;
  for (let k = 0; k < n; k++, cursor++) {
    const it = T.aib[cursor].items[0];
    assert.equal(T.aib[cursor].items.length, 1);
    assert.equal(it.id, n === 2 ? `${x.id}:part-${k + 1}` : x.id, `aib[${cursor}]`);
    if (n === 2) assert.deepEqual(it.part, [k + 1, 2]);
    assert.equal(it.cat, 'ai');
  }
  if (x.after) {
    const inAib = (ai.AIB as Any[]).some((y) => y.id === x.after);
    const before = inAib ? aibLast(x.after) : slotOf('ai', x.after);
    assert.ok(before >= 0 && before < aibFirst(x.id), `${x.id} after ${x.after} (${before} < ${aibFirst(x.id)})`);
  }
}
assert.equal(cursor, 54);
for (let i = 54; i < 78; i++) {
  assert.equal(T.aib[i].items[0].text, "Revisit: re-run your week's AI build with one improvement");
  assert.equal(T.aib[i].items[0].filler, true);
}

// ---------- fe ----------
const feIds = T.fe.map((s: Any) => s.items[0].id);
const sqlAt = feIds.indexOf('fe:sql');
assert.deepEqual(feIds.slice(sqlAt, sqlAt + 3), ['fe:sql', 'fe:use-the-index-luke-1', 'fe:use-the-index-luke-2'], 'FE depth reads right after fe:sql');
assert.deepEqual(feIds.slice(0, 51).filter((id: string) => !id.startsWith('fe:use-the-index')), (fe.FE as Any[]).map((x) => x.id), 'FE in order');
for (let i = 51; i < 78; i++) assert.ok(has('fe', i, /^fe:revise-/) && has('fe', i, /^fe:bfe-/), `fe[${i}] revision pair`);

// ---------- sd ----------
assert.deepEqual(T.sd.slice(0, 61).map((s: Any) => s.items[0].id), (sd.SD as Any[]).map((x) => x.id));
for (let i = 61; i < 78; i++) assert.ok(has('sd', i, /^sdm:/), `sd[${i}] mock`);

// ---------- ai ----------
// AI_EVENING items at their old `day`; depth reads (no day) in the first free slot after their `after`; AI_REVIEW
// rotation (in order, repeats are fillers) in every other slot.
const evening: Any[] = ai.AI_EVENING as Any[];
for (const x of evening.filter((x) => typeof x.day === 'number')) assert.equal(slotOf('ai', x.id), x.day, `${x.id} on day ${x.day}`);
for (const x of evening.filter((x) => typeof x.day !== 'number')) {
  const from = slotOf('ai', x.after), i = slotOf('ai', x.id);
  assert.ok(from >= 0 && i > from, `${x.id} after ${x.after}`);
  for (let j = from + 1; j < i; j++) assert.ok(!T.ai[j].items.some((y: Any) => y.id.startsWith('ai:review-')), `${x.id} takes the first free slot after ${x.after}`);
}
const reviews = (ai.AI_REVIEW as Any[]).map((x) => x.id);
const gaps = T.ai.map((s: Any, i: number) => i).filter((i: number) => !evening.some((x) => slotOf('ai', x.id) === i));
assert.equal(gaps.length, 78 - evening.length);
gaps.forEach((i: number, k: number) => {
  const x = T.ai[i].items[0], base = reviews[k % reviews.length];
  assert.equal(T.ai[i].items.length, 1);
  assert.ok(x.id === base || x.id === `${base}:${Math.floor(k / reviews.length) + 1}`, `ai[${i}] review ${x.id}`);
  assert.equal(!!x.filler, k >= reviews.length, `ai[${i}] filler flag`);
});

// ---------- mc ----------
const MCI: Any[] = mc.MC as Any[];
assert.deepEqual(ids('mc', 36), ['mc:take-home-issue-triage-1']);
assert.deepEqual(ids('mc', 37), ['mc:take-home-issue-triage-2']);
assert.deepEqual(ids('mc', 38), ['mc:take-home-issue-triage-3']);
assert.deepEqual([54, 55, 56].map((i) => ids('mc', i)), [1, 2, 3].map((n) => [`mc:take-home-funnel-explorer-${n}`]));
for (let w = 1; w <= 13; w++) assert.ok(T.mc[idx(w, 6)].items.every((x: Any) => x.id.startsWith('lld:')), `mc Sat wk${w} LLD`);
assert.deepEqual(T.mc.filter((_: Any, i: number) => GRIND_DOW[i] === 6).map((s: Any) => s.items[0].id), (mc.LLD as Any[]).map((x) => x.id));
// pairs: one block, at the first member's MC position
for (const x of MCI.filter((x) => x.pair)) assert.equal(slotOf('mc', x.pair[0]), slotOf('mc', x.pair[1]), `${x.pair} one block`);
const buildSlots = T.mc.map((s: Any, i: number) => ({ i, s })).filter(({ s }: Any) => s.items.some((x: Any) => MCI.some((m) => m.id === x.id)));
assert.deepEqual(buildSlots.flatMap(({ s }: Any) => s.items.map((x: Any) => x.id)),
  MCI.filter((x) => !x.pair || x.pair[0] === x.id).flatMap((x) => (x.pair ? x.pair : [x.id])), 'builds in MC order, pairs at first member');
for (const { i } of buildSlots) assert.ok([1, 3, 5].includes(GRIND_DOW[i]) || i < 6, `build at ${i} on Mon/Wed/Fri (or week 1)`);
for (const x of mc.MC_SCREENSHOT as Any[]) {
  const i = slotOf('mc', x.id), w = Math.floor(i / 6) + 1;
  assert.ok(w >= x.weeks[0] && w <= x.weeks[1] && [1, 3, 5].includes(GRIND_DOW[i]), `${x.id} Mon/Wed/Fri in weeks 4–8`);
}
// flagship: Tue/Thu from week 2, in order, the take-home Tuesday shifts it by one, local-first read in its own slot right after proj:editor
const FLAG = [...(mc.PROJECT as Any[]).map((x) => x.id)];
FLAG.splice(FLAG.indexOf('proj:editor') + 1, 0, 'proj:local-first-software');
const tt = T.mc.map((s: Any, i: number) => ({ i, s })).filter(({ i }: Any) => i >= 6 && [2, 4].includes(GRIND_DOW[i]) && ![37, 55].includes(i));
assert.deepEqual(tt.slice(0, FLAG.length).map(({ s }: Any) => s.items.map((x: Any) => x.id)), FLAG.map((id) => [id]));
assert.ok(T.mc.slice(0, 6).every((s: Any) => !s.items.some((x: Any) => x.id.startsWith('proj:'))), 'no flagship in week 1');
assert.equal(slotOf('mc', 'proj:local-first-software'), tt[FLAG.indexOf('proj:editor') + 1].i);
assert.equal(T.mc[slotOf('mc', 'proj:local-first-software')].items.length, 1);
// timed second passes: from week 9, Mon/Wed/Fri, 2 per slot, each after its build
const timedSlots = T.mc.map((s: Any, i: number) => ({ i, s })).filter(({ s }: Any) => s.items.some((x: Any) => x.id.endsWith(':timed')));
assert.deepEqual(timedSlots.flatMap(({ s }: Any) => s.items.map((x: Any) => x.id)), (mc.MC_TIMED as string[]).map((id) => `${id}:timed`));
for (const { i, s } of timedSlots) {
  assert.ok(i >= idx(9, 1) && [1, 3, 5].includes(GRIND_DOW[i]), `timed pass at ${i}`);
  assert.equal(s.items.length, 2);
  for (const x of s.items) assert.ok(slotOf('mc', x.id.replace(/:timed$/, '')) < i, `${x.id} after its build`);
}
for (const x of T.mc.flatMap((s: Any) => s.items)) {
  if (x.id.startsWith('proj:')) assert.equal(x.cat, 'proj');
  else assert.equal(x.cat, 'mc');
}

// ---------- jt ----------
assert.ok(has('jt', 6, /^jt:hiw-/), 'week 2 Mon how-it-works');
assert.ok(has('jt', 7, /^jt:memo-/), 'week 2 Tue memo');
const fridays = Array.from({ length: 13 }, (_, w) => idx(w + 1, 5));
assert.ok(!fridays.slice(0, 2).some((i) => has('jt', i, /^jt:(oss-fix|code-review)-/)), 'no OSS before week 3');
assert.equal(slotOf('jt', 'jt:oss-fix-1'), 16);
assert.ok(has('jt', 28, /^jt:code-review-/), 'week 5 Fri code review');
// R4: Fridays weeks 3–13 = 7 fixes + 4 reviews, reviews on Fridays #3, #6, #9, #11 (weeks 5, 8, 11, 13)
const friIds = fridays.slice(2).map((i) => ids('jt', i)[0]);
assert.deepEqual(friIds, ['jt:oss-fix-1', 'jt:oss-fix-2', 'jt:code-review-1', 'jt:oss-fix-3', 'jt:oss-fix-4', 'jt:code-review-2', 'jt:oss-fix-5', 'jt:oss-fix-6', 'jt:code-review-3', 'jt:oss-fix-7', 'jt:code-review-4']);
for (const x of judgment.CODE_REVIEWS as Any[]) assert.equal(Math.floor(slotOf('jt', x.id) / 6) + 1, x.week, `${x.id} week`);
// SRE read before the first OSS fix, and not a second Stripe slot
const sre = slotOf('jt', 'jt:depth-sre-troubleshooting');
assert.ok(sre >= 0 && sre < slotOf('jt', 'jt:oss-fix-1'), 'SRE read before oss-fix-1');
assert.equal(allIds.filter((id) => id === 'jt:hiw-stripe-idempotency').length, 1);
for (let w = 1; w <= 13; w++) {
  if (w <= 10) assert.equal(ids('jt', idx(w, 1))[0], (judgment.HOW_IT_WORKS as Any[])[w - 1].id, `Mon wk${w}`);
  assert.equal(ids('jt', idx(w, 2))[0], (judgment.MEMOS as Any[])[w - 1].id, `Tue wk${w}`);
  if (w <= 12) assert.equal(ids('jt', idx(w, 3))[0], (judgment.PRACTICAL as Any[])[w - 1].id, `Wed wk${w}`);
  if (w >= 2) assert.equal(ids('jt', idx(w, 4))[0], (judgment.DECOMP as Any[])[w - 2].id, `Thu wk${w}`);
  const sat = T.jt[idx(w, 6)].items;
  if (w % 2 === 1 && w <= 9) assert.ok(sat.every((x: Any) => x.id.startsWith('jt:ai-drill-')), `Sat wk${w} AI drill`);
  // R8: every Saturday (drill or mock) takes the revision time; R9: the slot holds ≤ 75 min, the rest carries to Sunday.
  const kept = sat.filter((x: Any) => !x.sundayCarry);
  assert.ok(kept.length && kept.every((x: Any) => x.takesRevision === true), `Sat wk${w} takesRevision`);
  assert.ok(sat.every((x: Any) => typeof x.mins === 'number' && x.mins > 0), `Sat wk${w} every item has mins`);
  const cap = kept.every((x: Any) => x.takesRevision) ? 75 : 45;
  assert.ok(kept.reduce((m: number, x: Any) => m + x.mins, 0) <= cap, `Sat wk${w} ≤ ${cap} min in the slot`);
  for (const x of sat.filter((x: Any) => x.sundayCarry)) assert.ok(!x.takesRevision, `${x.id} carried, not in the slot`);
  if (w >= 10) {
    const rounds = sat.filter((x: Any) => x.id.startsWith('jt:mock-loop-'));
    assert.equal(rounds.length, 3, `Sat wk${w} loop has 3 rounds`);
    assert.ok(rounds.every((x: Any) => x.mins === 45), 'no round shortened');
  }
  if ([6, 8].includes(w)) assert.ok(sat.find((x: Any) => x.id.startsWith('jt:speed-pair-')).sundayCarry, `wk${w} speed pair carried`);
  if (w >= 10) assert.ok(sat.some((x: Any) => x.id.startsWith('jt:mock-loop-')), `Sat wk${w} full mock loop`);
  const speed = sat.some((x: Any) => x.id.startsWith('jt:speed-pair-'));
  assert.equal(speed, [6, 8].includes(w), `speed pair wk${w}`);
}
const peers = [4, 6, 8, 10, 12].map((w) => T.jt[idx(w, 6)].items.find((x: Any) => /peer/i.test(x.text)));
assert.ok(peers.every(Boolean), 'peer mock in weeks 4, 6, 8, 10, 12');
assert.ok(![2].some((w) => T.jt[idx(w, 6)].items.some((x: Any) => /peer/i.test(x.text))), 'no peer mock in week 2');
['coding', 'frontend system design', 'behavioral', 'decomposition', 'coding'].forEach((r, n) => assert.match(peers[n].text, new RegExp(r, 'i'), `peer rotation ${n}`));

// ---------- beh ----------
assert.deepEqual([1, 2, 3].map((n) => slotOf('beh', `beh:deep-dive-${n}`)), [idx(2, 6), idx(3, 6), idx(4, 6)], 'deep dives Sat wk2–4');
for (const n of [1, 2, 3]) assert.equal(T.beh[slotOf('beh', `beh:deep-dive-${n}`)].items.length, 1, 'deep dive alone in its slot');
for (const n of [1, 2]) assert.equal(Math.floor(slotOf('beh', `beh:negotiation-${n}`) / 6) + 1, 12, `negotiation-${n} in week 12`);
const behOrder = T.beh.flatMap((s: Any) => s.items).filter((x: Any) => !x.filler && x.id.startsWith('beh:') && !x.id.startsWith('beh:teardown-') && !x.id.startsWith('beh:negotiation')).map((x: Any) => x.id);
assert.deepEqual(behOrder, (career.BEH as Any[]).map((x) => x.id).filter((id) => !id.startsWith('beh:negotiation')), 'BEH in order');
const uxOrder = T.beh.flatMap((s: Any) => s.items).filter((x: Any) => x.id.startsWith('ux:')).map((x: Any) => x.id);
assert.deepEqual(uxOrder, (ux.UX as Any[]).map((x) => x.id), 'UX in order');
T.beh.forEach((s: Any, i: number) => {
  const u = s.items.filter((x: Any) => x.id.startsWith('ux:'));
  assert.ok(u.length <= 1, `beh[${i}] at most one UX`);
  if (u.length) assert.ok(!s.items[0].id.startsWith('ux:') && s.items.indexOf(u[0]) === 1, `beh[${i}] UX is the second task`);
});
assert.equal(ids('beh', 0)[1], 'ux:laws-of-ux', 'UX from week 1');
for (const id of SKIP_FDE) assert.equal(slotOf('beh', id), -1, `${id} not in beh (lives in jt)`);
const fdeOrder = T.beh.flatMap((s: Any) => s.items).filter((x: Any) => !x.filler && x.id.startsWith('fde:')).map((x: Any) => x.id);
assert.deepEqual(fdeOrder, (career.FDE as Any[]).map((x) => x.id).filter((id) => !SKIP_FDE.has(id)), 'FDE in order');
const lastBeh = Math.max(...(career.BEH as Any[]).filter((x) => !x.id.startsWith('beh:negotiation')).map((x) => slotOf('beh', x.id)));
for (const x of [...(career.FDE as Any[]).filter((x) => !SKIP_FDE.has(x.id)), ...(career.TEARDOWNS as Any[])]) assert.ok(slotOf('beh', x.id) > lastBeh, `${x.id} after BEH runs out`);
for (const x of T.beh.flatMap((s: Any) => s.items)) assert.equal(x.cat, x.id.startsWith('ux:') ? 'ux' : x.id.startsWith('fde:') ? 'fde' : 'beh', `${x.id} cat`);

// ---------- purity ----------
const src = readFileSync(new URL('../src/lib/tracks.ts', import.meta.url), 'utf8');
const runtimeImports = [...src.matchAll(/^import\s+(?!type\b)[^;]*from\s+'([^']+)'/gm)].map((m) => m[1]);
assert.deepEqual(runtimeImports, [], 'tracks.ts has no runtime imports');

console.log('tracks: all tests passed');
