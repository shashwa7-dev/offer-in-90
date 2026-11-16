// v2 → v3 coverage (roadmap v3 spec, "v2 content → v3"). Run: node --experimental-strip-types scripts/test-v3-coverage.ts
// Every v2 id (scripts/fixtures/v2-ids.json, frozen from e9600f2 by scripts/gen-v2-ids.mjs) is placed exactly once: as a
// primary id in a track, in one row's `covers`, or in DROPPED (owner choice or duplicate). Nothing is cut silently.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CONTENT } from '../src/lib/plan-data.js';
import { DROPPED } from '../src/lib/content/v3-dropped.js';
import { buildTracks } from '../src/lib/tracks.ts';
import { STAGES } from '../src/lib/timeline.ts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;
const C: Any = CONTENT;
const T: Any = buildTracks(C);
const TRACKS = ['dsa', 'fe', 'mc', 'sd', 'jt', 'beh', 'ai'];
const V2: Record<string, string[]> = JSON.parse(readFileSync(new URL('./fixtures/v2-ids.json', import.meta.url), 'utf8'));
const v2Ids = new Set(Object.values(V2).flat());
assert.ok(v2Ids.size > 500, `fixture has ${v2Ids.size} v2 ids`);

// ---------- primary ids: what the tracks lay out ----------
const items: Any[] = TRACKS.flatMap((t) => T[t].flatMap((s: Any) => s.items));
const primary = new Set<string>(items.map((x) => x.id.replace(/:part-\d$/, '')));
// A DSA pattern is placed as its two pattern days (the slots carry `pattern`).
for (const x of items) if (x.pattern) primary.add(x.pattern);
// A take-home brief is placed through its 3 parts (part 1 carries the brief).
for (const th of C.TAKE_HOMES as Any[]) primary.add(th.id);
// The news sources stay in AI_NEWS, the list behind the recall block's news task (spec: "AI_NEWS → the recall block's news task").
for (const n of C.AI_NEWS as Any[]) primary.add(n.id);

// ---------- covers: every v3 track row, at any depth (MOCK_DAY rows and carries too) ----------
const ROWS = ['FOUNDATIONS', 'ADV_DSA', 'INTERVIEW_ENV', 'AI_CORE', 'FLAGSHIP', 'TAKE_HOMES', 'LLD', 'SYSTEMS', 'PLATFORM', 'CAREER', 'MOCK_DAY', 'FRONTEND'];
const covers = new Map<string, string[]>();
const walk = (x: Any) => {
  if (Array.isArray(x)) return x.forEach(walk);
  if (!x || typeof x !== 'object') return;
  if (typeof x.id === 'string' && Array.isArray(x.covers)) for (const c of x.covers) covers.set(c, [...(covers.get(c) ?? []), x.id]);
  for (const v of Object.values(x)) if (v && typeof v === 'object') walk(v);
};
for (const k of ROWS) { assert.ok(Array.isArray(C[k]), `${k} exported`); walk(C[k]); }

// ---------- DROPPED ----------
const dropped = new Map<string, string>();
for (const d of DROPPED as Any[]) {
  assert.ok(!dropped.has(d.id), `${d.id} dropped twice`);
  dropped.set(d.id, d.reason);
  assert.ok(d.reason === 'owner choice' || d.reason === 'duplicate', `${d.id}: reason "${d.reason}"`);
  assert.ok(v2Ids.has(d.id), `${d.id} (dropped) is a v2 id`);
}

// ---------- every v2 id exactly once ----------
const missing: string[] = [];
for (const id of v2Ids) {
  const where = [primary.has(id) && 'primary', ...(covers.get(id) ?? []).map((r) => `covers of ${r}`), dropped.has(id) && 'DROPPED'].filter(Boolean);
  if (!where.length) missing.push(id);
  else assert.equal(where.length, 1, `${id} is placed more than once: ${where.join(', ')}`);
}
assert.deepEqual(missing, [], 'v2 ids neither placed, covered nor dropped');
for (const id of covers.keys()) assert.ok(v2Ids.has(id), `covers ${id} is a v2 id`);

// Spec table: the owner's drops and the 4 duplicate LLD mocks.
const DUP = ['sdm:lld-book-management', 'sdm:lld-google-authenticator', 'sdm:lld-android-unlock', 'sdm:lld-tetris'];
assert.deepEqual([...dropped].filter(([, r]) => r === 'duplicate').map(([id]) => id).sort(), [...DUP].sort());
for (const id of ['aib:python-for-js', 'aib:pandas', 'dsa:foundations-build-1', 'dsa:foundations-build-2', 'dsa:foundations-build-3', 'mc:screenshot-product-card'])
  assert.equal(dropped.get(id), 'owner choice', id);
for (const k of ['ux.UX', 'judgment.MEMOS', 'judgment.OSS_FIXES', 'judgment.OSS_REPOS', 'mc.MC_SCREENSHOT'])
  for (const id of V2[k]) assert.equal(dropped.get(id), 'owner choice', `${k}: ${id}`);
// The 12 kept v2 builds (spec: Frontend React internals, reps and the 6 rehearsal reps) are not dropped.
for (const s of ['mini-react', 'vdom-diff', 'redux-store', 'event-emitter', 'promise-pool', 'use-fetch', 'autocomplete', 'data-table', 'infinite-scroll', 'file-explorer', 'modal', 'nested-comments'])
  assert.ok(!dropped.has(`mc:${s}`), `mc:${s} is kept`);

// ---------- track rules ----------
const ids = items.map((x) => x.id);
assert.deepEqual(ids.filter((id, i) => ids.indexOf(id) !== i), [], 'no track item id twice within or across tracks');
for (const x of items) assert.ok(!/python|pandas/i.test(x.text), `${x.id}: no Python or pandas`);
// `after` points at an item on a strictly lower Grind slot index (Grind slot i of every track is on the same day).
const slotIndex = new Map<string, number>();
for (const t of TRACKS) T[t].forEach((s: Any, i: number) => s.items.forEach((x: Any) => slotIndex.set(x.id, i)));
let afters = 0;
for (const t of TRACKS) T[t].forEach((s: Any, i: number) => s.items.forEach((x: Any) => {
  if (!x.after) return;
  afters++;
  assert.ok(slotIndex.has(x.after), `${x.id} after ${x.after}: target exists`);
  assert.ok(slotIndex.get(x.after)! < i, `${x.id} (slot ${i + 1}) after ${x.after} (slot ${slotIndex.get(x.after)! + 1})`);
}));
assert.equal(afters, 18, 'the 17 flagship AI steps and Platform slot 6');

// Roadmap stages: every track item counts in exactly one stage, of its own track's stages.
const STAGE_TRACK: Record<string, string> = { dsa: 'dsa', fe: 'ai', sd: 'sd', mc: 'mc', jt: 'platform', beh: 'career', ai: 'fe' };
for (const t of TRACKS) for (const x of T[t].flatMap((s: Any) => s.items)) {
  const st = STAGES.filter((g) => g.match(x));
  assert.equal(st.length, 1, `${x.id} (${t}) matches ${st.length} stages`);
  assert.equal(st[0].track, STAGE_TRACK[t], `${x.id}: stage of track ${t}`);
}

// ---------- readiness: the spec's exact texts ----------
const spec = readFileSync(new URL('../docs/superpowers/specs/2026-11-15-roadmap-v3-ai-systems-design.md', import.meta.url), 'utf8');
const assess = spec.slice(spec.indexOf('## Assessments'), spec.indexOf('## Saturdays')).replace(/\s+/g, ' ');
const want = [...assess.matchAll(/\*\*Week (\d+):\*\* "([^"]+)"/g)].map((m) => ({ week: Number(m[1]), text: m[2] }));
assert.deepEqual(want.map((w) => w.week), [4, 8, 10, 12, 13], 'spec lists 5 readiness checks');
assert.deepEqual((C.READINESS as Any[]).map((r) => ({ week: r.week, text: r.text })), want);
for (const r of C.READINESS as Any[]) assert.equal(r.id, `sun:readiness-w${r.week}`);
// The week-8 review reads the week-8 check: RAG design, the Ask feature's eval gate, 20 of the 23 patterns taught so far.
assert.equal(C.WEEK8_REVIEW.week, 8);
for (const w of [/RAG/, /eval/, /20 of the 23 patterns/]) assert.match(C.WEEK8_REVIEW.text, w);
assert.ok(!/green/.test(C.WEEK8_REVIEW.text), 'no v2 "green" patterns');

console.log('test-v3-coverage: ok');
