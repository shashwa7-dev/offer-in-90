// Run: node --experimental-strip-types scripts/test-tracks.ts
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as dsa from '../src/lib/content/dsa.js';
import * as fe from '../src/lib/content/fe.js';
import * as ux from '../src/lib/content/ux.js';
import * as career from '../src/lib/content/career.js';
import * as ai from '../src/lib/content/ai.js';
import * as aiCore from '../src/lib/content/ai-core.js';
import * as mc from '../src/lib/content/mc.js';
import * as sd from '../src/lib/content/sd.js';
import * as judgment from '../src/lib/content/judgment.js';
import * as systems from '../src/lib/content/systems.js';
import * as platform from '../src/lib/content/platform.js';
import * as reference from '../src/lib/content/reference.js';
import { buildTracks, expandRow, GRIND_DOW, SLOTS } from '../src/lib/tracks.ts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;
const content: Any = { ...dsa, ...fe, ...ux, ...career, ...ai, ...aiCore, ...mc, ...sd, ...systems, ...platform, ...judgment, ...reference };
// AI core (v3) absorbs v2 ids: each row's primary id is laid out in the AI core track; its `covers` ids are not laid out anywhere.
const CORE: Any[] = aiCore.AI_CORE as Any[];
const CORE_PLACED = new Set<string>(CORE.map((r) => r.id));
const CORE_COVERS = new Set<string>(CORE.flatMap((r) => r.covers ?? []));
// Systems (v3) likewise: primary ids laid out in the sd track; `covers` ids are not laid out anywhere.
const SYS: Any[] = (systems.SYSTEMS ?? []) as Any[];
const SYS_COVERS = new Set<string>(SYS.flatMap((r) => r.covers ?? []));
// Platform (v3) likewise, in the jt track. A `parts: 2` row is laid out as `${id}#1` and `${id}#2` (see `seen` below).
const PF: Any[] = ((platform as Any).PLATFORM ?? []) as Any[];
const PF_PLACED = new Set<string>(PF.map((r) => r.id));
const PF_COVERS = new Set<string>(PF.flatMap((r) => r.covers ?? []));
const T: Any = buildTracks(content);
const TRACKS = ['dsa', 'fe', 'mc', 'sd', 'jt', 'beh', 'ai'];
const idx = (w: number, d: number) => (w - 1) * 6 + (d - 1);
const ids = (track: string, i: number): string[] => T[track][i].items.map((x: Any) => x.id);
const slotOf = (track: string, id: string) => T[track].findIndex((s: Any) => s.items.some((x: Any) => x.id === id));
const CATS = ['dsa', 'fe', 'mc', 'proj', 'sd', 'ux', 'beh', 'fde', 'ai', 'platform', 'review', 'health', 'update'];

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
const SKIP_FDE = new Set([...(judgment.DECOMP as Any[]).filter((x) => x.from).map((x) => x.from), 'fde:practical-coding-log', 'fde:reengineering-round', ...CORE_PLACED, ...CORE_COVERS, ...PF_PLACED, ...PF_COVERS]);
const expected: string[] = [
  ...(dsa.PROBLEMS as Any[]).filter((p) => p.tier === 'must').map((p) => `p-${p.slug}`),
  // v2 FE (fe.js) is not laid out until Task 8 moves it into Frontend.
  ...(ux.UX as Any[]), ...(career.BEH as Any[]),
  ...(career.FDE as Any[]).filter((x) => !SKIP_FDE.has(x.id)), ...(career.TEARDOWNS as Any[]),
  ...(ai.AI_EVENING as Any[]).filter((x) => !CORE_PLACED.has(x.id) && !CORE_COVERS.has(x.id) && !SYS_COVERS.has(x.id)),
  ...CORE.map((r) => r.id),
  ...(mc.MC as Any[]), ...(mc.MC_SCREENSHOT as Any[]), ...(mc.TAKE_HOMES as Any[]).flatMap((x) => x.parts),
  ...(mc.PROJECT as Any[]), ...(mc.PROJECT_DEPTH_READS as Any[]), ...(mc.LLD as Any[]),
  // v2 SD / SD_MOCKS / HOW_IT_WORKS are laid out through SYSTEMS (the sd:fe-* items wait for Task 8).
  ...SYS.map((r) => r.id),
  // v2 PRACTICAL, CODE_REVIEWS and the SRE read are laid out through PLATFORM. MEMOS and OSS_FIXES are dropped (spec);
  // DECOMP waits for Career (Task 7).
  ...PF.flatMap((r) => (r.parts === 2 ? [`${r.id}#1`, `${r.id}#2`] : [r.id])), ...(judgment.INTERVIEW_ENV as Any[]),
].map((x: Any) => (typeof x === 'string' ? x : x.id));
// Items that take 2 slots appear once per part, keyed by id + part.
const seen = all.filter((x) => !x.filler).map((x) => (x.part ? `${x.id.replace(/:part-\d$/, '')}#${x.part[0]}` : x.id));
for (const id of expected) assert.equal(seen.filter((s) => s === id).length, 1, `${id} appears exactly once`);
for (const id of CORE_COVERS) assert.equal(seen.filter((s) => s === id).length, 0, `${id} (absorbed by AI core) is not laid out`);
for (const id of SYS_COVERS) assert.equal(seen.filter((s) => s === id).length, 0, `${id} (absorbed by Systems) is not laid out`);
for (const id of PF_COVERS) assert.equal(seen.filter((s) => s === id).length, 0, `${id} (absorbed by Platform) is not laid out`);
for (const id of (mc.MC_TIMED as string[])) assert.equal(allIds.filter((x) => x === `${id}:timed`).length, 1, `${id} timed pass once`);
assert.equal(all.filter((x) => /^adv:[a-z-]+$/.test(x.id)).length, 3, 'ADV_DSA x3');
const pfParts = PF.filter((r) => r.parts === 2).flatMap((r) => [1, 2].flatMap((k) => [`${r.id}:part-${k}:do#${k}`, `${r.id}:part-${k}:explain#${k}`]));
const known = new Set([...expected, ...pfParts, ...[...CORE, ...SYS, ...PF.filter((r) => r.parts !== 2)].filter((r) => !r.kind).flatMap((r) => [`${r.id}:do`, `${r.id}:explain`]), ...(dsa.FOUNDATIONS as Any[]).flatMap((f) => [f.id, `${f.id}:do`, `${f.id}:explain`]), ...(dsa.ADV_DSA as Any[]).flatMap((f) => [f.id, `${f.id}:do`, `${f.id}:explain`]), ...(mc.MC_TIMED as string[]).map((id) => `${id}:timed`)]);
const extras = all.filter((x) => !x.filler && !known.has(x.part ? `${x.id.replace(/:part-\d$/, '')}#${x.part[0]}` : x.id));
// Non-content items the builder adds on purpose: pattern cards, explain-backs, foundations, ADV_DSA, Phase 3 sets, FE revision, SD mocks.
for (const x of extras) assert.match(x.id, /^(dsa:(card|explain-back|oa|google|meta|revisit)-|fe:revise-|fe:bfe-|sdm:)/, `unexpected item ${x.id}`);

// ---------- dsa ----------
const HARD = ['dp', 'graph-traversal', 'topo-sort', 'union-find', 'shortest-path-mst', 'backtracking', 'tree-dfs', 'tree-bfs', 'top-k', 'two-heaps', 'k-way-merge', 'intervals', 'sliding-window', 'binary-search'];
const PATS = (dsa.PATTERNS as Any[]).map((p) => p.id);
const FOUND = dsa.FOUNDATIONS as Any[];
assert.equal(FOUND.length, 2);
FOUND.forEach((f, i) => {
  assert.deepEqual(ids('dsa', i), [f.id, `${f.id}:do`, `${f.id}:explain`], `slot ${i + 1} is the ${f.id} learning row`);
  assert.match(T.dsa[i].items[2].text, /Deep enough when you can/);
  assert.ok(T.dsa[i].items[0].url, `${f.id} keeps a url`);
});
assert.equal(ids('dsa', 0)[0], 'dsa:foundations-big-o');
assert.equal(ids('dsa', 1)[0], 'dsa:foundations-recursion');
assert.equal(T.dsa[1].items[0].url, 'https://javascript.info/recursion');
assert.equal(T.dsa[0].items[0].url, 'https://www.bigocheatsheet.com/');
assert.match(T.dsa[1].items.map((x: Any) => x.text).join(' '), /discrete math/i);
for (const w of ['logic', 'sets', 'combinatorics', 'probability']) assert.match(T.dsa[1].items[0].text, new RegExp(w, 'i'), `recursion mentions ${w}`);
assert.ok(!allIds.some((id) => id.includes('foundations-build')), 'no foundations-build');
assert.notEqual(T.dsa[0].items[0], FOUND[0], 'slot items are copies');
assert.notEqual(all.find((x) => x.flags)?.flags, (dsa.PROBLEMS as Any[]).find((p) => all.find((x) => x.flags)?.slug === p.slug).flags, 'flags copied');
assert.equal(PATS.length, 27);
const P = dsa.PROBLEMS as Any[];
const mustAll = P.filter((p) => p.tier === 'must');
assert.equal(mustAll.length, 54, '54 must-solves');
assert.ok(mustAll.every((p) => p.role === 'teach' || p.role === 'unseen'), 'every must is teach or unseen');
const former = P.filter((p) => p.role === 'var');
assert.equal(former.length, 45, '45 var problems');
assert.ok(former.every((p) => p.tier === 'optional'), 'var problems are optional');
// patterns: 2 days each
PATS.forEach((id: string, k: number) => {
  const teach = P.find((p) => p.pattern === id && p.role === 'teach'), unseen = P.find((p) => p.pattern === id && p.role === 'unseen');
  assert.deepEqual(ids('dsa', 2 * k + 2).slice(0, 2), [`dsa:card-${id}`, `p-${teach.slug}`], `${id} day A`);
  assert.deepEqual(ids('dsa', 2 * k + 3).slice(0, 2), [`p-${unseen.slug}`, `dsa:explain-back-${id}`], `${id} day B`);
  assert.equal(T.dsa[2 * k + 3].items[0].hiddenUntilStart, true, `${id} unseen hidden`);
  assert.match(T.dsa[2 * k + 3].items[1].text, /Explain-back: fill the card from memory, then compare/);
});
for (const x of all.filter((x) => x.role === 'unseen')) assert.equal(x.hiddenUntilStart, true, `${x.id} hiddenUntilStart`);
assert.ok(all.filter((x) => x.hiddenUntilStart).every((x) => x.role === 'unseen'), 'only unseen checks hidden');
// Phase 3: slots 57–78
const ORDER = ['oa-1', 'google-1', 'adv-1', 'meta-1', 'oa-2', 'revisit-1', 'google-2', 'oa-3', 'meta-2', 'adv-2', 'oa-4', 'google-3', 'revisit-2', 'oa-5', 'meta-3', 'oa-6', 'adv-3', 'google-4', 'oa-7', 'meta-4', 'revisit-3', 'oa-8'];
const ADV = (dsa.ADV_DSA as Any[]).map((x) => x.id);
assert.deepEqual(ADV, ['adv:difference-array-line-sweep', 'adv:fenwick-segment-tree', 'adv:dp-on-trees-digit-dp']);
ORDER.forEach((o, j) => {
  const i = 56 + j, head = T.dsa[i].items[0], [kind, n] = o.split('-');
  if (kind === 'adv') { assert.equal(head.id, ADV[+n - 1], `dsa[${i}] ${o}`); assert.deepEqual(ids('dsa', i).slice(0, 3), [head.id, `${head.id}:do`, `${head.id}:explain`]); return; }
  assert.equal(head.id, `dsa:${o}`, `dsa[${i}] ${o}`);
  const probs = T.dsa[i].items.filter((x: Any) => x.slug);
  if (kind === 'oa') {
    assert.equal(T.dsa[i].items.filter((x: Any) => !x.id.startsWith('env:')).length, 1);
    assert.equal(head.url, (reference.OA_LINKS as string[])[+n - 1]);
    assert.match(head.text, /60 minutes/);
  } else if (kind === 'google') { assert.equal(probs.length, 2); assert.match(head.text, /60 min/); assert.match(head.text, /Google Doc/);
  } else if (kind === 'meta') { assert.equal(probs.length, 2); assert.match(head.text, /40 min/);
  } else { assert.equal(probs.length, 2, `${o} 2 problems`); for (const p of probs) { const q = P.find((r) => r.slug === p.slug); assert.equal(q.role, 'var'); assert.ok(HARD.includes(q.pattern), `${p.slug} from a hard pattern`); } }
  for (const p of probs) { const q = P.find((r) => r.slug === p.slug); assert.ok(q, p.id); assert.equal(p.id, `${head.id}:${p.slug}`); if (kind !== 'revisit') assert.notEqual(q.d, 'E', `${p.slug} medium or hard`); }
});
// Google and Meta sets draw the 16 tagged problems first; untagged medium/hard problems fill what is left.
const gm = T.dsa.slice(56).flatMap((s: Any) => s.items).filter((x: Any) => x.slug && /^dsa:(google|meta)-/.test(x.id)).map((x: Any) => P.find((q) => q.slug === x.slug).flags.length > 0);
assert.equal(gm.length, 16);
assert.deepEqual(gm, [...gm].sort((a, b) => Number(b) - Number(a)), 'tagged problems come before untagged ones');
assert.ok(gm.filter(Boolean).length >= 10, 'most of the sets are tagged problems');
const p3 = T.dsa.slice(56).flatMap((s: Any) => s.items);
assert.equal(p3.filter((x: Any) => /^dsa:oa-\d$/.test(x.id)).length, 8);
assert.equal(p3.filter((x: Any) => /^dsa:google-\d$/.test(x.id)).length, 4);
assert.equal(p3.filter((x: Any) => /^dsa:meta-\d$/.test(x.id)).length, 4);
assert.equal(p3.filter((x: Any) => /^dsa:revisit-\d$/.test(x.id)).length, 3);
assert.equal(p3.filter((x: Any) => /^adv:[a-z-]+$/.test(x.id)).length, 3);
assert.deepEqual(new Set(p3.filter((x: Any) => /^dsa:oa-\d$/.test(x.id)).map((x: Any) => x.url)), new Set((reference.OA_LINKS as string[]).slice(0, 8)));
const patNames = (dsa.PATTERNS as Any[]).map((p) => p.name.toLowerCase());
for (const x of p3.filter((x: Any) => !x.id.startsWith('env:'))) {
  assert.equal(x.pattern, undefined, `${x.id} no pattern field`);
  for (const n of patNames) assert.ok(!x.text.toLowerCase().includes(n), `${x.id} text hides "${n}"`);
}
const p3slugs = p3.filter((x: Any) => x.slug).map((x: Any) => x.slug);
assert.equal(p3slugs.length, 22);
assert.equal(new Set(p3slugs).size, 22, 'no problem twice in Phase 3');
assert.ok(p3slugs.every((s: string) => !mustAll.some((p) => p.slug === s)), 'Phase 3 problems are not must-solves');
for (const [n, env] of (judgment.INTERVIEW_ENV as Any[]).entries()) {
  const i = slotOf('dsa', env.id);
  assert.equal(Math.floor(i / 6) + 1, 10 + n, `${env.id} in week ${10 + n}`);
  assert.equal(Math.floor(i / 6) + 1, env.week);
}
for (const t of TRACKS.filter((t) => t !== 'dsa')) assert.ok(!T[t].some((s: Any) => s.items.some((x: Any) => x.id.startsWith('env:'))), `env only in dsa (${t})`);

// ---------- fe: AI engineering core (v3 §2) ----------
{
  assert.equal(CORE.length, 78, 'AI_CORE has 78 rows');
  assert.equal(T.fe.length, 78);
  T.fe.forEach((s: Any, i: number) => assert.ok(s.items.every((x: Any) => x.cat === 'ai'), `fe[${i}] cat ai`));
  const PRIMARY_IDS: Record<number, string> = {
    1: 'ai:math-intuition', 2: 'ai:classical-ml', 17: 'ai:chip-use-cases', 29: 'ai:rag-evaluation', 30: 'ai:advanced-rag', 36: 'ai:evals-agents-rag',
    45: 'ai:sft-dpo-rlhf', 46: 'ai:fine-tune-data', 47: 'ai:fine-tune-evaluate', 48: 'ai:dataset-engineering', 49: 'ai:prefill-decode',
    51: 'ai:gpu-basics', 52: 'ai:self-host-mac', 54: 'ai:design-serving', 56: 'ai:guardrails', 66: 'ai:design-semantic-search',
    67: 'ai:design-agent-memory', 68: 'ai:design-multi-tenant', 69: 'ai:dspy-model-card',
    72: 'ai:teach-back-1', 73: 'ai:teach-back-2', 74: 'ai:teach-back-3', 75: 'ai:teach-back-4',
    76: 'sdm:ai-chatgpt', 77: 'sdm:ai-eval-framework', 78: 'sdm:ai-rag',
    // Task 6 depends on these.
    19: 'aib:stream-tokens-react', 21: 'aib:tool-call-loop', 24: 'ai:prompt-caching-cost', 25: 'aib:embeddings-neighbours', 26: 'aib:pgvector',
    27: 'aib:retrieval-chunking-hybrid', 28: 'ai:rag-paper', 32: 'aib:evals-test-cases', 33: 'aib:evals-llm-judge', 34: 'fde:eval-pipelines',
    39: 'aib:react-build-agent', 40: 'aib:agents-sdk-build', 55: 'aib:llm-gateway', 57: 'ai:owasp-llm', 62: 'aib:multimodal-upload',
    // First id named in the spec cell.
    3: 'ai:3b1b-neural-network', 4: 'ai:3b1b-backprop', 5: 'ai:3b1b-transformers', 6: 'ai:3b1b-attention', 7: 'ai:attention-illustrated',
    8: 'ai:attention-paper-attention', 9: 'ai:attention-annotated-code', 10: 'ai:karpathy-gpt-bigram', 11: 'ai:karpathy-gpt-training',
    12: 'ai:karpathy-llm-pretraining', 13: 'ai:gpt3-approach', 14: 'ai:scaling-laws', 15: 'ai:karpathy-llm-post-training', 16: 'ai:instructgpt-results',
    18: 'aib:llm-api-fundamentals', 20: 'aib:prompting-rewrite', 22: 'aib:mcp-server', 23: 'fde:model-providers', 31: 'ai:evals-hamel',
    35: 'ai:depth-applied-llms-tactical', 37: 'sd:ai-rag-search', 38: 'ai:building-effective-agents', 41: 'fde:agents-memory', 42: 'fde:debugging-agents',
    43: 'ai:prompt-rag-finetune', 44: 'ai:lora', 50: 'fde:inference-optimization', 53: 'aib:transformers-js', 58: 'fde:mlops',
    59: 'fde:governance-privacy', 60: 'ai:design-ai-rollout', 61: 'ai:cot-paper', 63: 'sd:ai-chatgpt', 64: 'sd:ai-eval-framework',
    65: 'sd:ai-coding-agent', 70: 'aib:ai-assisted-feature', 71: 'ai:ai-build-post',
  };
  assert.equal(Object.keys(PRIMARY_IDS).length, 78, 'every slot has its primary id listed');
  for (const [n, id] of Object.entries(PRIMARY_IDS)) assert.equal(T.fe[+n - 1].items[0].id, id, `fe slot ${n} is ${id}`);
  for (let i = 0; i < 75; i++) {
    const r = CORE[i], it = T.fe[i].items;
    assert.ok(!r.kind && r.understand && r.do && r.explain, `slot ${i + 1} is a learning row`);
    assert.deepEqual(it.map((x: Any) => x.id), [r.id, `${r.id}:do`, `${r.id}:explain`], `slot ${i + 1} has 3 tasks`);
    assert.match(it[2].text, /Deep enough when you can/, `slot ${i + 1} explain`);
    assert.ok(it[0].url && /^https:\/\//.test(it[0].url), `slot ${i + 1} Understand has a link`);
    if (r.url2) assert.match(r.url2, /^https:\/\//);
  }
  for (let i = 75; i < 78; i++) {
    const r = CORE[i];
    assert.equal(r.kind, 'mock', `slot ${i + 1} mock`);
    assert.equal(r.mins, 45, `slot ${i + 1} 45 min`);
    assert.equal(T.fe[i].items.length, 1);
    assert.equal(T.fe[i].items[0].mins, 45);
  }
  // The three AI-engineer coding reps, in TypeScript.
  for (const [n, word] of [[5, 'BPE'], [18, 'sampling'], [25, 'cosine']] as [number, string][]) {
    const t = T.fe[n - 1].items.map((x: Any) => x.text).join(' ');
    assert.ok(t.includes(word) && /TypeScript/.test(t) && /\brep\b/i.test(t), `slot ${n} has the ${word} rep in TypeScript`);
  }
  // Coverage: every v2 AI evening item (bar DDIA), every review and the 22 AIB items the spec places here, once each.
  const counts = new Map<string, number>();
  for (const r of CORE) for (const id of [r.id, ...(r.covers ?? [])]) counts.set(id, (counts.get(id) ?? 0) + 1);
  const AIB_HERE = ['aib:llm-api-fundamentals', 'aib:stream-tokens-react', 'aib:structured-output-zod', 'aib:prompting-rewrite', 'aib:tool-call-loop',
    'aib:mcp-server', 'aib:embeddings-neighbours', 'aib:pgvector', 'aib:retrieval-hnsw-recall', 'aib:retrieval-chunking-hybrid', 'aib:rag-build-notes',
    'aib:evals-test-cases', 'aib:evals-llm-judge', 'aib:llm-observability', 'aib:react-build-agent', 'aib:agents-sdk-build', 'aib:agents-long-running',
    'aib:transformers-js', 'aib:llm-gateway', 'aib:prompt-injection-attack', 'aib:multimodal-upload', 'aib:ai-assisted-feature'];
  assert.equal(AIB_HERE.length, 22);
  for (const id of AIB_HERE) assert.ok((ai.AIB as Any[]).some((x) => x.id === id), `${id} is a v2 AIB id`);
  const mustCover = [...(ai.AI_EVENING as Any[]).map((x) => x.id).filter((id) => !id.startsWith('ai:depth-ddia-')), ...(ai.AI_REVIEW as Any[]).map((x) => x.id), ...AIB_HERE];
  for (const id of mustCover) assert.equal(counts.get(id), 1, `${id} once in AI core (primary or covers)`);
  for (const [id, k] of counts) assert.equal(k, 1, `${id} named once in AI core`);
  assert.equal(counts.get('ai:review-rag') && CORE[28].covers.includes('ai:review-rag'), true, 'slot 29 covers ai:review-rag');
  assert.ok(CORE[55].covers.includes('ai:constitutional-ai'), 'slot 56 covers ai:constitutional-ai');
  // v2 urls reused: a slot whose primary id is a v2 item keeps that item's url.
  const v2 = new Map<string, Any>([...(ai.AI_EVENING as Any[]), ...(ai.AIB as Any[]), ...(career.FDE as Any[]), ...(sd.SD as Any[])].map((x) => [x.id, x]));
  for (const r of CORE) if (v2.get(r.id)?.url) assert.equal(r.url, v2.get(r.id).url, `${r.id} keeps its v2 url`);
  // Copy rules.
  for (const r of CORE) {
    assert.ok(!('after' in r), `${r.id} has no after`);
    const text = [r.understand, r.do, r.explain, r.text].filter(Boolean).join(' ');
    assert.ok(!/python|pandas|notebook/i.test(text), `${r.id} no Python/pandas/notebook`);
    assert.ok(!/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(text), `${r.id} no emoji`);
  }
  for (const n of [10, 11]) assert.match(CORE[n - 1].understand, /read the code, no retyping/, `Karpathy GPT slot ${n}`);
}

// ---------- sd (v3 Systems) ----------
{
  const HLD_LEARN = ['rate-limiter', 'dropbox', 'whatsapp', 'ticketmaster', 'fb-news-feed', 'youtube', 'web-crawler', 'distributed-cache', 'job-scheduler',
    'payment-system', 'top-k-leaderboard', 'yelp', 'live-comments', 'ad-click-aggregator', 'news-aggregator', 'local-delivery', 'leetcode'].map((s) => `sd:hld-${s}`);
  const DEPTH_1 = ['sd:ddia-2a', 'sd:ddia-2b', 'sd:idempotency-saga', 'sd:ddia-3a', 'sd:ddia-3b', 'jt:hiw-stripe-idempotency', 'sd:ddia-4a', 'sd:ddia-4b',
    'sd:block-search', 'sd:ddia-5a', 'sd:ddia-5b', 'jt:hiw-discord-message-storage', 'sd:ddia-6a', 'sd:ddia-6b', 'sd:observability-security', 'sd:ddia-7a',
    'sd:ddia-7b', 'sd:arch-styles', 'sd:testing-strategy', 'sd:block-geo', 'jt:hiw-figma-multiplayer', 'sd:block-probabilistic', 'sd:refactoring',
    'jt:hiw-slack-real-time', 'sd:block-realtime-fanout'];
  const MOCKS = ['sd:hld-tinder', 'sd:hld-instagram-post-search', 'sd:hld-price-tracker', 'sd:hld-online-auction', 'sd:hld-search-autocomplete',
    'sd:hld-robinhood', 'sd:hld-instagram', 'sd:hld-google-docs', 'sdm:hld-rate-limiter', 'sdm:hld-whatsapp', 'sdm:hld-ticketmaster'];
  const DEPTH_2 = ['sd:ddia-8a', 'sd:ddia-8b', 'sd:ddia-9a', 'sd:ddia-9b', 'jt:hiw-linear-sync-engine', 'jt:hiw-notion-data-model', 'jt:hiw-nextjs-caching',
    'jt:hiw-shopify-bfcm', 'jt:hiw-cloudflare-nov-2025', 'jt:hiw-github-copilot', 'sd:block-stream-processing', 'sd:block-blob-media', 'sd:block-ids-clocks-locks'];
  const ORDER = ['sd:numbers-card', 'sd:os', 'sd:concurrency', 'sd:internet', 'sd:fundamentals', 'sd:cap-pacelc', 'sd:communication', 'sd:caching',
    'sd:messaging', 'sd:delivery-framework', 'sd:concepts-to-master', 'sd:hld-bitly'];
  for (let k = 0; k < 17; k++) ORDER.push(HLD_LEARN[k], DEPTH_1[k]); // slots 13–46: HLD odd, depth even
  ORDER.push(...DEPTH_1.slice(17)); // slots 47–54: the depth items left
  for (let k = 0; k < 11; k++) ORDER.push(MOCKS[k], DEPTH_2[k]); // slots 55–76: mock odd, depth even
  ORDER.push(...DEPTH_2.slice(11));
  assert.equal(ORDER.length, 78);
  assert.equal(new Set(ORDER).size, 78);
  assert.equal(ORDER[12], 'sd:hld-rate-limiter');
  assert.equal(ORDER[13], 'sd:ddia-2a');
  assert.equal(ORDER[44], 'sd:hld-leetcode');
  assert.equal(ORDER[45], 'sd:ddia-7b');
  assert.equal(ORDER[53], 'sd:block-realtime-fanout');
  assert.equal(ORDER[54], 'sd:hld-tinder');
  assert.equal(ORDER[75], 'sd:block-stream-processing');
  assert.equal(SYS.length, 78, 'SYSTEMS has 78 rows');
  assert.deepEqual(SYS.map((r) => r.id), ORDER, 'SYSTEMS order');
  assert.deepEqual(T.sd.map((s: Any) => s.items[0].id), ORDER, 'sd track = SYSTEMS, one row per slot');
  for (const x of T.sd.flatMap((s: Any) => s.items)) assert.equal(x.cat, 'sd', `${x.id} cat sd`);
  // Learning rows: Understand + Do + Explain. Mocks: one 45-min task with a self-review against the framework.
  SYS.forEach((r, i) => {
    const s = T.sd[i].items;
    assert.match(r.url, /^https:\/\//, `${r.id} url`);
    if (r.url2) { assert.match(r.url2, /^https:\/\//, `${r.id} url2`); assert.notEqual(r.url2, r.url, `${r.id} url2 differs`); }
    assert.ok(!('after' in r), `${r.id} has no after`);
    if (r.kind) {
      assert.equal(r.kind, 'mock', `${r.id} kind`);
      assert.equal(r.mins, 45, `${r.id} 45 min`);
      assert.equal(s.length, 1);
      assert.match(r.text, /self-review/i, `${r.id} self-review`);
      assert.match(r.text, /delivery framework/i, `${r.id} against the framework`);
    } else {
      assert.deepEqual(s.map((x: Any) => x.id), [r.id, `${r.id}:do`, `${r.id}:explain`], `slot ${i + 1} has 3 tasks`);
      assert.match(r.explain, /Deep enough when you can/, `${r.id} explain`);
    }
    const text = [r.understand, r.do, r.explain, r.text].filter(Boolean).join(' ');
    assert.ok(!/python|pandas|notebook/i.test(text), `${r.id} no Python/pandas/notebook`);
    assert.ok(!/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(text), `${r.id} no emoji`);
  });
  assert.deepEqual(SYS.map((r, i) => (r.kind ? i + 1 : 0)).filter(Boolean), Array.from({ length: 11 }, (_, k) => 55 + 2 * k), 'mocks at slots 55–75 odd');
  // 26 distinct HLD designs (learn + mock); the second-pass sdm: mocks are extra.
  const hld = SYS.filter((r) => r.id.startsWith('sd:hld-'));
  assert.equal(new Set(hld.map((r) => r.id)).size, 26, '26 HLD designs');
  assert.equal(hld.filter((r) => !r.kind).length, 18, '18 learned');
  assert.equal(hld.filter((r) => r.kind).length, 8, '8 as mocks');
  for (const r of hld.filter((r) => !r.kind)) {
    assert.match(r.url, /^https:\/\/(www\.)?(hellointerview\.com|bytebytego\.com)\//, `${r.id} Understand is Hello Interview or ByteByteGo`);
    assert.ok(r.do.startsWith('Draw it yourself in Excalidraw, 45 min'), `${r.id} do`);
    assert.match(r.explain, /compare/i, `${r.id} compare`);
    assert.match(r.explain, /3 trade-offs/, `${r.id} 3 trade-offs`);
  }
  // DDIA chapters 2–9, 2 slots each, in book order.
  const ddia = SYS.filter((r) => r.id.startsWith('sd:ddia-')).map((r) => r.id);
  assert.deepEqual(ddia, [2, 3, 4, 5, 6, 7, 8, 9].flatMap((ch) => [`sd:ddia-${ch}a`, `sd:ddia-${ch}b`]));
  // Sourcing rule: the System Design Primer as the secondary link.
  const PRIMER = 'https://github.com/donnemartin/system-design-primer';
  assert.ok([SYS[0].url, SYS[0].url2].includes(`${PRIMER}#latency-numbers-every-programmer-should-know`), 'slot 1 has the primer latency table');
  const solved: Record<string, string> = { 'sd:hld-bitly': 'pastebin', 'sd:hld-web-crawler': 'web_crawler', 'sd:hld-distributed-cache': 'query_cache', 'sd:hld-fb-news-feed': 'twitter' };
  for (const [id, sol] of Object.entries(solved)) assert.equal(SYS.find((r) => r.id === id).url2, `${PRIMER}/blob/master/solutions/system_design/${sol}/README.md`, `${id} primer solution`);
  // No frontend or AI design in this track (sd:fe-* wait for Task 8; sd:ai-* are in the AI core).
  assert.ok(!T.sd.some((s: Any) => s.items.some((x: Any) => /^sdm?:(fe|ai)-/.test(x.id))), 'no sd:fe-* or sd:ai-* in Systems');
  // covers, as the brief names them
  const COVERS: Record<string, string[]> = {
    'sd:internet': ['fe:os-networking'], 'sd:fundamentals': ['sd:capacity-estimation'], 'sd:communication': ['fe:api-design'],
    'sd:ddia-2a': ['ai:depth-ddia-data-models'], 'sd:ddia-3a': ['ai:depth-ddia-storage-indexes', 'sd:storage'],
    'sd:ddia-5a': ['ai:depth-ddia-replication', 'sd:replication-sharding'], 'sd:ddia-7a': ['ai:depth-ddia-transactions', 'sd:transactions'],
    'sd:ddia-9a': ['sd:reliability'], 'sd:hld-robinhood': ['sdm:hld-robinhood'], 'sd:hld-instagram': ['sdm:hld-instagram'], 'sd:hld-google-docs': ['sdm:hld-google-docs'],
  };
  for (const r of SYS) assert.deepEqual([...(r.covers ?? [])].sort(), [...(COVERS[r.id] ?? [])].sort(), `${r.id} covers`);
  // v2 ids keep their url.
  const v2 = new Map<string, Any>([...(sd.SD as Any[]), ...(sd.SD_MOCKS as Any[]), ...(judgment.HOW_IT_WORKS as Any[])].map((x) => [x.id, x]));
  for (const r of SYS) if (v2.get(r.id)?.url) assert.equal(r.url, v2.get(r.id).url, `${r.id} keeps its v2 url`);
  assert.equal(SYS.find((r) => r.id === 'jt:hiw-stripe-idempotency').url, (judgment.JT_DEPTH_READS as Any[])[0].url);
}

// ---------- ai (v2 evening track, interim until Task 8) ----------
// AI core places or absorbs every AI_EVENING item but the 4 DDIA reads, and Systems absorbs those (ddia-2a/3a/5a/7a), so
// the v2 evening track is notes-revisit fillers.
{
  const left = (ai.AI_EVENING as Any[]).filter((x) => !CORE_PLACED.has(x.id) && !CORE_COVERS.has(x.id)).map((x) => x.id);
  assert.deepEqual(left, ['ai:depth-ddia-data-models', 'ai:depth-ddia-storage-indexes', 'ai:depth-ddia-replication', 'ai:depth-ddia-transactions']);
  for (const id of left) assert.ok(SYS_COVERS.has(id), `${id} covered by Systems`);
  for (let i = 0; i < 78; i++) {
    assert.equal(T.ai[i].items.length, 1);
    const x = T.ai[i].items[0];
    assert.ok(x.filler && x.id.startsWith('ai:revisit-notes-'), `ai[${i}] notes revisit`);
    assert.match(x.text, /^Revisit: re-read your notes from /);
  }
  for (const id of [...CORE_PLACED, ...CORE_COVERS, ...SYS_COVERS]) assert.equal(slotOf('ai', id), -1, `${id} not in the v2 evening track`);
}

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

// ---------- jt: Platform, data and DevOps (v3 §4) ----------
{
  assert.equal(PF.reduce((n: number, r: Any) => n + (r.parts === 2 ? 2 : 1), 0), 78, 'PLATFORM rows total 78 slots');
  assert.equal(T.jt.length, 78);
  for (const x of T.jt.flatMap((s: Any) => s.items)) assert.equal(x.cat, 'platform', `${x.id} cat platform`);
  // Slots 1–18: the DevOps basics, in the spec's order.
  const BASICS = ['pf:shell', 'pf:shell-tools', 'pf:git-workflows', 'pf:git-internals', 'pf:debugging', 'pf:environments', 'pf:deploy', 'pf:dns-https',
    'pf:postgres-backups', 'pf:ci-basics', 'pf:feature-flags', 'pf:logs-alert', 'pf:uptime-errors', 'pf:costs', 'pf:oauth-oidc', 'pf:sso-saml', 'pf:secrets', 'pf:hashing-owasp'];
  assert.deepEqual(T.jt.slice(0, 18).map((s: Any) => s.items[0].id), BASICS, 'slots 1–18');
  // Only slot 6 has an `after`: the first item of product slot 1 (Task 6 creates it).
  assert.equal(T.jt[5].items[0].after, 'proj:pick-scaffold');
  assert.deepEqual(T.jt.flatMap((s: Any, i: number) => s.items.filter((x: Any) => x.after).map((x: Any) => [i + 1, x.id, x.after])), [[6, 'pf:environments', 'proj:pick-scaffold']], 'only slot 6 has after');
  // Slots 19–78: the depth items in the spec's order, the 12 practicals at 23 + 5k. The re-engineering round would straddle
  // slot 68, so the 10th practical takes 67 and the pair 68–69; the next 23 + 5k slot (73) is a practical again.
  const DEPTH = ['fe:sql', 'fe:use-the-index-luke-1', 'fe:use-the-index-luke-2', 'pf:explain-analyze', 'jt:practical-rate-limiter',
    'fde:sql-analysis', 'pf:postgres-in-practice', 'fe:nosql', 'fe:redis', 'jt:practical-retry-backoff',
    'fe:queues', 'pf:background-job', 'fe:node-runtime', 'aib:containers', 'jt:practical-ttl-cache-swr',
    'pf:docker-compose', 'pf:k8s-deployments', 'pf:k8s-services', 'pf:k8s-scaling', 'jt:practical-debounced-fetcher',
    'aib:terraform', 'pf:terraform-state-modules', 'aib:devops', 'pf:canary', 'jt:practical-merge-csvs',
    'pf:blue-green', 'fe:docker-ci', 'pf:otel-metrics', 'pf:slos', 'jt:practical-parse-log',
    'jt:depth-sre-troubleshooting', 'aib:aws', 'pf:aws-vpc-compute', 'pf:aws-storage-lambda', 'jt:practical-streaming-backpressure',
    'pf:finops', 'fde:data-pipelines', 'fde:data-warehouses', 'fde:data-audit-modeling', 'jt:practical-rag-pipeline',
    'pf:customer-apis-webhooks', 'fde:integration-engineering', 'pf:privacy-residency', 'jt:code-review-1', 'jt:practical-cli-tool',
    'jt:code-review-2', 'jt:code-review-3', 'jt:code-review-4', 'jt:practical-lru-cache',
    'fde:reengineering-round:part-1', 'fde:reengineering-round:part-2', 'fde:learning-round:part-1', 'fde:learning-round:part-2', 'pf:dr-drill',
    'jt:practical-promise-pool', 'pf:nginx', 'pf:network-debugging', 'pf:grpc', 'pf:multi-tenancy', 'jt:practical-webhook-idempotency'];
  assert.equal(DEPTH.length, 60);
  assert.deepEqual(T.jt.slice(18).map((s: Any) => s.items[0].id), DEPTH, 'slots 19–78');
  // The 12 practical coding reps: v2 ids, one 45-min TypeScript task each, no Python.
  const prac = T.jt.map((s: Any, i: number) => [i + 1, s] as [number, Any]).filter(([, s]) => s.items[0].id.startsWith('jt:practical-'));
  assert.deepEqual(prac.map(([n]) => n), [23, 28, 33, 38, 43, 48, 53, 58, 63, 67, 73, 78], 'practicals at 23 + 5k (67 before the pair)');
  assert.deepEqual(prac.map(([, s]) => s.items[0].id).sort(), (judgment.PRACTICAL as Any[]).map((x) => x.id).sort(), 'the 12 v2 practical ids');
  assert.equal(T.jt.flatMap((s: Any) => s.items).filter((x: Any) => x.id.startsWith('jt:practical-')).length, 12, 'exactly 12 practicals');
  for (const [n, s] of prac) {
    const r = PF.find((x) => x.id === s.items[0].id);
    assert.equal(r.kind, 'rep', `${r.id} kind rep`);
    assert.equal(s.items.length, 1, `slot ${n} one task`);
    assert.equal(s.items[0].mins, 45, `${r.id} 45 min`);
    assert.match(s.items[0].text, /TypeScript/, `${r.id} TypeScript`);
    assert.match(s.items[0].text, /45 min/, `${r.id} timed`);
    assert.ok(!/python/i.test(s.items[0].text), `${r.id} no Python`);
  }
  assert.ok(PF.find((r) => r.id === 'jt:practical-parse-log').covers.includes('fde:practical-coding-log'), 'parse-log covers the FDE log rep');
  // Every 2-slot item sits on consecutive slots; the two FDE rounds are 2-slot items.
  const pairs = PF.filter((r) => r.parts === 2);
  assert.deepEqual(pairs.map((r) => r.id).sort(), ['fde:learning-round', 'fde:reengineering-round']);
  for (const r of pairs) assert.equal(slotOf('jt', `${r.id}:part-2`), slotOf('jt', `${r.id}:part-1`) + 1, `${r.id} on consecutive slots`);
  // The 4 code-review reps keep their v2 ids and urls.
  for (const v of judgment.CODE_REVIEWS as Any[]) {
    const i = slotOf('jt', v.id), r = PF.find((x) => x.id === v.id);
    assert.ok(i >= 0, `${v.id} placed`);
    assert.equal(r.kind, 'rep');
    assert.equal(T.jt[i].items[0].url, v.url, `${v.id} keeps its v2 url`);
  }
  // Auth and secrets (week 3) before Kubernetes and Terraform (from week 5).
  const firstInfra = Math.min(...T.jt.map((s: Any, i: number) => (s.items.some((x: Any) => /^(aib:containers|aib:terraform|pf:k8s-|pf:terraform-)/.test(x.id)) ? i : 99)));
  for (const id of ['pf:oauth-oidc', 'pf:secrets']) assert.ok(slotOf('jt', id) < firstInfra, `${id} before containers/terraform`);
  assert.ok(firstInfra >= 24, 'containers and terraform from week 5');
  // Sourcing rule: the primer's "Scaling AWS to millions of users" on the AWS slot.
  assert.equal(T.jt[slotOf('jt', 'aib:aws')].items[0].url2, 'https://github.com/donnemartin/system-design-primer/blob/master/solutions/system_design/scaling_aws/README.md');
  // SRE ch. 12 lives here, with its v2 url.
  assert.equal(T.jt[slotOf('jt', 'jt:depth-sre-troubleshooting')].items[0].url, (judgment.JT_DEPTH_READS as Any[])[1].url);
  // No memo, OSS, how-it-works, decomposition or v2 Saturday mock item in this track.
  for (const x of T.jt.flatMap((s: Any) => s.items)) {
    assert.ok(!/^jt:(memo|oss|hiw|decomp|client-sim|ai-drill|mock|peer-mock|speed-pair|mock-loop)-/.test(x.id), `${x.id} not in Platform`);
    assert.ok(!x.sundayCarry && !x.filler, `${x.id} is plain content`);
  }
  // covers, as the brief names them
  const COVERS: Record<string, string[]> = {
    'pf:shell': ['fde:linux-shell'], 'pf:git-workflows': ['fde:git-beyond-basics'], 'pf:sso-saml': ['fde:security'], 'jt:practical-parse-log': ['fde:practical-coding-log'],
  };
  for (const r of PF) assert.deepEqual([...(r.covers ?? [])].sort(), [...(COVERS[r.id] ?? [])].sort(), `${r.id} covers`);
  // Every v2 id the spec sends here is laid out once (primary id or covers).
  const V2_HERE = ['fde:linux-shell', 'fde:git-beyond-basics', 'fde:security', 'fe:sql', 'fe:use-the-index-luke-1', 'fe:use-the-index-luke-2', 'fde:sql-analysis',
    'fe:nosql', 'fe:redis', 'fe:queues', 'fe:node-runtime', 'aib:containers', 'aib:terraform', 'aib:devops', 'fe:docker-ci', 'jt:depth-sre-troubleshooting', 'aib:aws',
    'fde:data-pipelines', 'fde:data-warehouses', 'fde:data-audit-modeling', 'fde:integration-engineering', 'fde:reengineering-round', 'fde:learning-round',
    'fde:practical-coding-log', ...(judgment.PRACTICAL as Any[]).map((x) => x.id), ...(judgment.CODE_REVIEWS as Any[]).map((x) => x.id)];
  const named = PF.flatMap((r) => [r.id, ...(r.covers ?? [])]);
  for (const id of V2_HERE) assert.equal(named.filter((x) => x === id).length, 1, `${id} named once in Platform`);
  assert.equal(new Set(named).size, named.length, 'no id named twice in Platform');
  // Row shape and copy rules.
  PF.forEach((r) => {
    if (r.url) assert.match(r.url, /^https:\/\//, `${r.id} url`);
    if (r.url2) { assert.match(r.url2, /^https:\/\//, `${r.id} url2`); assert.notEqual(r.url2, r.url, `${r.id} url2 differs`); }
    if (r.kind) {
      assert.equal(r.kind, 'rep', `${r.id} kind`);
      assert.equal(r.mins, 45, `${r.id} 45 min`);
    } else {
      assert.ok(r.understand && r.do && r.explain, `${r.id} Understand, Do, Explain`);
      assert.match(r.url, /^https:\/\//, `${r.id} Understand has a link`);
      assert.match(r.explain, /Deep enough when you can/, `${r.id} explain`);
    }
    const text = [r.understand, r.do, r.explain, r.text].filter(Boolean).join(' ');
    assert.ok(!/python|pandas|notebook/i.test(text), `${r.id} no Python/pandas/notebook`);
    assert.ok(!/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(text), `${r.id} no emoji`);
  });
  // Learning slots: 3 tasks each; every Do from slot 6 on works on the flagship.
  T.jt.forEach((s: Any, i: number) => {
    if (s.items[0].id.startsWith('jt:') && !s.items[0].id.startsWith('jt:depth-')) return;
    assert.equal(s.items.length, 3, `jt slot ${i + 1} has 3 tasks`);
    // The two FDE rounds work on an unfamiliar repo or API on purpose.
    if (i >= 5 && !s.items[0].id.startsWith('fde:reengineering-round') && !s.items[0].id.startsWith('fde:learning-round')) assert.match(s.items[1].text, /flagship/i, `jt slot ${i + 1} Do is on the flagship`);
  });
  for (const id of ['pf:k8s-deployments', 'pf:k8s-services', 'pf:k8s-scaling']) assert.match(T.jt[slotOf('jt', id)].items.map((x: Any) => x.text).join(' '), /\bkind\b/, `${id} uses kind`);
  for (const id of ['aib:aws', 'pf:aws-vpc-compute', 'pf:aws-storage-lambda']) assert.match(T.jt[slotOf('jt', id)].items.map((x: Any) => x.text).join(' '), /free tier/i, `${id} on the free tier`);
  assert.match(T.jt[slotOf('jt', 'aib:aws')].items.map((x: Any) => x.text).join(' '), /budget alarm/i, 'AWS budget alarm');
  // The v2 beh builder skips every FDE id Platform now places.
  for (const id of named.filter((x) => x.startsWith('fde:'))) assert.equal(slotOf('beh', id), -1, `${id} not in beh`);
}

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
for (const id of SKIP_FDE) assert.equal(slotOf('beh', id), -1, `${id} not in beh (lives in Platform, the AI core or DECOMP)`);
const fdeOrder = T.beh.flatMap((s: Any) => s.items).filter((x: Any) => !x.filler && x.id.startsWith('fde:')).map((x: Any) => x.id);
assert.deepEqual(fdeOrder, (career.FDE as Any[]).map((x) => x.id).filter((id) => !SKIP_FDE.has(id)), 'FDE in order');
const lastBeh = Math.max(...(career.BEH as Any[]).filter((x) => !x.id.startsWith('beh:negotiation')).map((x) => slotOf('beh', x.id)));
for (const x of [...(career.FDE as Any[]).filter((x) => !SKIP_FDE.has(x.id)), ...(career.TEARDOWNS as Any[])]) assert.ok(slotOf('beh', x.id) > lastBeh, `${x.id} after BEH runs out`);
for (const x of T.beh.flatMap((s: Any) => s.items)) assert.equal(x.cat, x.id.startsWith('ux:') ? 'ux' : x.id.startsWith('fde:') ? 'fde' : 'beh', `${x.id} cat`);

// ---------- expandRow (the v3 content row format) ----------
{
  const learn = { id: 'ai:x', covers: ['ai:old'], understand: 'Read X', url: 'https://a.example/1', url2: 'https://a.example/2', do: 'In a TS file, do Y', explain: 'Out loud: Z. Deep enough when you can W', after: 'fe:y' };
  assert.deepEqual(expandRow(learn, 'ai'), [[
    { id: 'ai:x', text: 'Read X', cat: 'ai', url: 'https://a.example/1', url2: 'https://a.example/2', after: 'fe:y' },
    { id: 'ai:x:do', text: 'In a TS file, do Y', cat: 'ai' },
    { id: 'ai:x:explain', text: 'Out loud: Z. Deep enough when you can W', cat: 'ai' },
  ]]);
  // `do` omitted: 2 tasks; `cat` overrides the track's
  const two = expandRow({ id: 'beh:y', understand: 'Read', url: 'https://b.example/', explain: 'Deep enough when you can V', cat: 'fde' }, 'beh');
  assert.deepEqual(two, [[{ id: 'beh:y', text: 'Read', cat: 'fde', url: 'https://b.example/' }, { id: 'beh:y:explain', text: 'Deep enough when you can V', cat: 'fde' }]]);
  // a rep / mock: one task with its id, text, url and minutes
  assert.deepEqual(expandRow({ id: 'fe:rep-1', kind: 'rep', text: 'Timed rep (45 min): Q', url: 'https://c.example/', mins: 45, covers: ['fe:a'] }, 'fe'),
    [[{ id: 'fe:rep-1', text: 'Timed rep (45 min): Q', cat: 'fe', url: 'https://c.example/', mins: 45 }]]);
  // `parts: 2`: two slots, part-suffixed ids and texts
  const parts = expandRow({ id: 'pf:z', understand: 'Read', url: 'https://d.example/', do: 'Do', explain: 'Explain', parts: 2 }, 'platform');
  assert.equal(parts.length, 2);
  assert.deepEqual(parts.map((s) => s.map((x) => x.id)), [['pf:z:part-1', 'pf:z:part-1:do', 'pf:z:part-1:explain'], ['pf:z:part-2', 'pf:z:part-2:do', 'pf:z:part-2:explain']]);
  assert.deepEqual(parts[1].map((x) => x.text), ['Read (part 2/2)', 'Do (part 2/2)', 'Explain (part 2/2)']);
  assert.deepEqual(parts.map((s) => s.map((x) => x.part)), [[[1, 2], [1, 2], [1, 2]], [[2, 2], [2, 2], [2, 2]]]);
  assert.ok(parts.flat().every((x) => x.cat === 'platform'));
}

// ---------- purity ----------
const src = readFileSync(new URL('../src/lib/tracks.ts', import.meta.url), 'utf8');
const runtimeImports = [...src.matchAll(/^import\s+(?!type\b)[^;]*from\s+'([^']+)'/gm)].map((m) => m[1]);
assert.deepEqual(runtimeImports, [], 'tracks.ts has no runtime imports');

console.log('tracks: all tests passed');
