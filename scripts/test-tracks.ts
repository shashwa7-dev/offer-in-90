// Run: node --experimental-strip-types scripts/test-tracks.ts
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as dsa from '../src/lib/content/dsa.js';
import * as career from '../src/lib/content/career.js';
import * as aiCore from '../src/lib/content/ai-core.js';
import * as product from '../src/lib/content/product.js';
import * as systems from '../src/lib/content/systems.js';
import * as platform from '../src/lib/content/platform.js';
import * as reference from '../src/lib/content/reference.js';
import * as frontend from '../src/lib/content/frontend.js';
import { buildTracks, expandRow, GRIND_DOW, SLOTS } from '../src/lib/tracks.ts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;
const content: Any = { ...dsa, ...career, ...aiCore, ...product, ...systems, ...platform, ...reference, ...frontend };
// The v2 ids, frozen from e9600f2 (scripts/gen-v2-ids.mjs); test-v3-coverage.ts checks every one is placed or dropped.
const V2: Record<string, string[]> = JSON.parse(readFileSync(new URL('./fixtures/v2-ids.json', import.meta.url), 'utf8'));
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
// Product (v3) flagship rows, laid out in the mc track.
const FLAG_ROWS: Any[] = ((product as Any).FLAGSHIP ?? []) as Any[];
// Frontend (v3 §7) likewise, in the ai track (cat fe).
const FR: Any[] = ((frontend as Any).FRONTEND ?? []) as Any[];
const FR_COVERS = new Set<string>(FR.flatMap((r) => r.covers ?? []));
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
// Career (v3 §6): 65 weekday rows and the 13 Saturday mock days (each a Saturday row plus the rows carried to Sunday).
const CR: Any[] = ((career as Any).CAREER ?? []) as Any[];
const MD: Any[] = ((career as Any).MOCK_DAY ?? []) as Any[];
const MD_ROWS: Any[] = MD.flatMap((d) => [d.row, ...(d.carry ?? [])]);
const CR_COVERS = new Set<string>([...CR, ...MD_ROWS].flatMap((r) => r.covers ?? []));
const expected: string[] = [
  ...(dsa.PROBLEMS as Any[]).filter((p) => p.tier === 'must').map((p) => `p-${p.slug}`),
  // v2 FE (the v2 fe.js), the sd:fe-* items, the FE mocks and the kept mc builds are laid out through FRONTEND (primary ids;
  // `covers` ids are not laid out anywhere).
  ...FR.map((r) => r.id),
  // v2 UX is not laid out (dropped by owner choice, see v3-dropped.js). BEH, FDE, DECOMP and TEARDOWNS are laid
  // out through CAREER (primary ids; `covers` ids are not laid out anywhere).
  ...CR.map((r) => r.id), ...MD_ROWS.map((r) => r.id),
  ...CORE.map((r) => r.id),
  // Product (v3 §5): the flagship rows, the take-home parts and LLD. The v2 builds, timed passes and screenshot builds
  // are not laid out (a few live on in Frontend; the rest are in v3-dropped.js).
  ...FLAG_ROWS.map((r) => r.id), ...(product.TAKE_HOMES as Any[]).flatMap((x) => x.parts), ...(product.LLD as Any[]),
  // v2 SD / SD_MOCKS / HOW_IT_WORKS are laid out through SYSTEMS (the sd:fe-* items through FRONTEND).
  ...SYS.map((r) => r.id),
  // v2 PRACTICAL, CODE_REVIEWS and the SRE read are laid out through PLATFORM. MEMOS and OSS_FIXES are dropped (spec).
  ...PF.flatMap((r) => (r.parts === 2 ? [`${r.id}#1`, `${r.id}#2`] : [r.id])), ...(dsa.INTERVIEW_ENV as Any[]),
].map((x: Any) => (typeof x === 'string' ? x : x.id));
// Items that take 2 slots appear once per part, keyed by id + part.
const seen = all.filter((x) => !x.filler).map((x) => (x.part ? `${x.id.replace(/:part-\d$/, '')}#${x.part[0]}` : x.id));
for (const id of expected) assert.equal(seen.filter((s) => s === id).length, 1, `${id} appears exactly once`);
for (const id of CORE_COVERS) assert.equal(seen.filter((s) => s === id).length, 0, `${id} (absorbed by AI core) is not laid out`);
for (const id of SYS_COVERS) assert.equal(seen.filter((s) => s === id).length, 0, `${id} (absorbed by Systems) is not laid out`);
for (const id of PF_COVERS) assert.equal(seen.filter((s) => s === id).length, 0, `${id} (absorbed by Platform) is not laid out`);
for (const id of CR_COVERS) assert.equal(seen.filter((s) => s === id).length, 0, `${id} (absorbed by Career) is not laid out`);
for (const id of FR_COVERS) assert.equal(seen.filter((s) => s === id).length, 0, `${id} (absorbed by Frontend) is not laid out`);
assert.equal(all.filter((x) => /^adv:[a-z-]+$/.test(x.id)).length, 3, 'ADV_DSA x3');
const pfParts = PF.filter((r) => r.parts === 2).flatMap((r) => [1, 2].flatMap((k) => [`${r.id}:part-${k}:do#${k}`, `${r.id}:part-${k}:explain#${k}`]));
const known = new Set([...expected, ...pfParts, ...[...CORE, ...SYS, ...FLAG_ROWS, ...CR, ...FR, ...PF.filter((r) => r.parts !== 2)].filter((r) => !r.kind).flatMap((r) => [`${r.id}:do`, `${r.id}:explain`]), ...(dsa.FOUNDATIONS as Any[]).flatMap((f) => [f.id, `${f.id}:do`, `${f.id}:explain`]), ...(dsa.ADV_DSA as Any[]).flatMap((f) => [f.id, `${f.id}:do`, `${f.id}:explain`])]);
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
  } else if (kind === 'google') { assert.equal(probs.length, 2); assert.match(head.text, /60 min/); assert.match(head.text, /Google Doc/); assert.equal(head.mins, 60);
  } else if (kind === 'meta') { assert.equal(probs.length, 2); assert.match(head.text, /40 min/); assert.equal(head.mins, 40);
  } else { assert.equal(probs.length, 2, `${o} 2 problems`); assert.match(head.text, /^Revisit \(45 min\): 2 problems from the hardest patterns/); assert.equal(head.mins, 45); for (const p of probs) { const q = P.find((r) => r.slug === p.slug); assert.equal(q.role, 'var'); assert.ok(HARD.includes(q.pattern), `${p.slug} from a hard pattern`); } }
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
for (const [n, env] of (dsa.INTERVIEW_ENV as Any[]).entries()) {
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
  for (const id of AIB_HERE) assert.ok(V2['ai.AIB'].includes(id), `${id} is a v2 AIB id`);
  const mustCover = [...V2['ai.AI_EVENING'].filter((id) => !id.startsWith('ai:depth-ddia-')), ...V2['ai.AI_REVIEW'], ...AIB_HERE];
  for (const id of mustCover) assert.equal(counts.get(id), 1, `${id} once in AI core (primary or covers)`);
  for (const [id, k] of counts) assert.equal(k, 1, `${id} named once in AI core`);
  assert.equal(counts.get('ai:review-rag') && CORE[28].covers.includes('ai:review-rag'), true, 'slot 29 covers ai:review-rag');
  assert.ok(CORE[55].covers.includes('ai:constitutional-ai'), 'slot 56 covers ai:constitutional-ai');
  // Copy rules.
  for (const r of CORE) {
    assert.ok(!('after' in r), `${r.id} has no after`);
    const text = [r.understand, r.do, r.explain, r.text].filter(Boolean).join(' ');
    assert.ok(!/python|pandas|notebook/i.test(text), `${r.id} no Python/pandas/notebook`);
    assert.ok(!/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(text), `${r.id} no emoji`);
  }
  for (const n of [10, 11]) assert.match(CORE[n - 1].understand, /read the code, no retyping/, `Karpathy GPT slot ${n}`);
  // Slot 37 (the RAG design) has its own system-design source, not slot 27's contextual-retrieval post.
  assert.ok(![CORE[26].url, CORE[26].url2].includes(CORE[36].url), 'slot 37 primary link differs from slot 27');
  assert.match(CORE[36].url, /rag-solution-design/);
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
  // No frontend or AI design in this track (sd:fe-* are in Frontend; sd:ai-* are in the AI core).
  assert.ok(!T.sd.some((s: Any) => s.items.some((x: Any) => /^sdm?:(fe|ai)-/.test(x.id))), 'no sd:fe-* or sd:ai-* in Systems');
  // covers, as the brief names them
  const COVERS: Record<string, string[]> = {
    'sd:internet': ['fe:os-networking'], 'sd:fundamentals': ['sd:capacity-estimation'], 'sd:communication': ['fe:api-design'],
    'sd:ddia-2a': ['ai:depth-ddia-data-models'], 'sd:ddia-3a': ['ai:depth-ddia-storage-indexes', 'sd:storage'],
    'sd:ddia-5a': ['ai:depth-ddia-replication', 'sd:replication-sharding'], 'sd:ddia-7a': ['ai:depth-ddia-transactions', 'sd:transactions'],
    'sd:ddia-9a': ['sd:reliability'], 'sd:hld-robinhood': ['sdm:hld-robinhood'], 'sd:hld-instagram': ['sdm:hld-instagram'], 'sd:hld-google-docs': ['sdm:hld-google-docs'],
  };
  for (const r of SYS) assert.deepEqual([...(r.covers ?? [])].sort(), [...(COVERS[r.id] ?? [])].sort(), `${r.id} covers`);
  // Every Understand pins a concrete source, and each case study's Explain names the company (no unclear "them").
  assert.ok(!SYS.some((r) => /\bsearch the\b/i.test(r.understand ?? '')), 'no "search the …" Understand');
  for (const r of SYS.filter((x) => x.id.startsWith('jt:hiw-'))) assert.ok(!/\b(them|they|their)\b/.test(r.explain), `${r.id} explain names the company`);
}

// ---------- ai: Frontend, senior (v3 §7; track key `ai`, cat `fe`) ----------
{
  assert.equal(FR.length, 78, 'FRONTEND has 78 rows');
  assert.equal(T.ai.length, 78);
  assert.deepEqual(T.ai.map((s: Any) => s.items[0].id), FR.map((r) => r.id), 'ai track = FRONTEND, one row per slot');
  for (const x of T.ai.flatMap((s: Any) => s.items)) assert.equal(x.cat, 'fe', `${x.id} cat fe`);
  const at = (id: string) => FR.findIndex((r) => r.id === id);
  const week = (i: number) => Math.floor(i / 6) + 1;
  const isSat = (i: number) => i % 6 === 5;
  // Saturdays: the 13 timed interview reps, 45–60 min, one task each.
  const REPS = FR.filter((r) => r.id.startsWith('fe:rep-'));
  assert.equal(REPS.length, 13, '13 timed reps');
  FR.forEach((r, i) => {
    if (!isSat(i)) { assert.ok(!r.id.startsWith('fe:rep-'), `${r.id} (slot ${i + 1}) is a weekday row`); return; }
    assert.ok(r.id.startsWith('fe:rep-'), `Saturday slot ${i + 1} is a timed rep (${r.id})`);
    assert.equal(r.kind, 'rep');
    assert.ok(r.mins >= 45 && r.mins <= 60, `${r.id} 45–60 min`);
    assert.equal(T.ai[i].items.length, 1, `${r.id} one task`);
    assert.match(r.text, /^Timed rep \((45|60) min\)/, `${r.id} text`);
  });
  const repCovers = REPS.flatMap((r) => r.covers ?? []).sort();
  assert.deepEqual(repCovers, ['fe:execution-context', 'fe:closures', 'fe:this-bind', 'fe:prototypes', 'fe:event-loop', 'fe:promises', 'fe:async-await',
    'fe:array-polyfills', 'fe:debounce-throttle', 'fe:es6-proxy', 'fe:dom-events', 'mc:event-emitter', 'mc:promise-pool', 'mc:use-fetch'].sort(), 'rep covers');
  assert.equal(REPS.filter((r) => /BFE\.dev/.test(r.text) && /mixed/i.test(r.text)).length, 2, '2 mixed timed sets (BFE.dev)');
  // The 6 machine-coding rehearsal reps: weekdays of weeks 11–13, 45 min, AI off.
  const REHEARSALS = ['mc:autocomplete', 'mc:data-table', 'mc:infinite-scroll', 'mc:file-explorer', 'mc:modal', 'mc:nested-comments'];
  for (const id of REHEARSALS) {
    const i = at(id), r = FR[i];
    assert.ok(i >= 0, `${id} placed`);
    assert.ok(week(i) >= 11 && week(i) <= 13 && !isSat(i), `${id} on a weekday of weeks 11–13 (slot ${i + 1})`);
    assert.equal(r.kind, 'rep');
    assert.equal(r.mins, 45);
    assert.ok(r.text.startsWith('Interview rehearsal (45 min, AI off):'), `${id} text`);
    assert.equal(T.ai[i].items.length, 1);
  }
  assert.equal(FR.filter((r) => /^Interview rehearsal/.test(r.text ?? '')).length, 6, 'exactly 6 rehearsals');
  // Weeks 1–3 weekdays: rendering and the browser, React internals and concurrency.
  const RENDERING = ['fe:rendering-path', 'fe:animation-performance', 'fe:web-vitals', 'fe:types-memory', 'fe:js-concurrency'];
  const REACT = ['fe:react-rendering', 'mc:mini-react', 'fe:react-hooks', 'fe:react-compiler', 'fe:react-concurrent', 'fe:forms-suspense', 'fe:react-rsc'];
  for (const id of [...RENDERING, ...REACT]) { const i = at(id); assert.ok(i >= 0 && week(i) <= 3 && !isSat(i), `${id} on a weekday of weeks 1–3 (slot ${i + 1})`); }
  assert.deepEqual(RENDERING.map(at), [...RENDERING.map(at)].sort((a, b) => a - b), 'rendering first, in order');
  assert.ok(Math.max(...RENDERING.map(at)) < Math.min(...REACT.map(at)), 'rendering before React');
  // Week 4 weekdays start with the 4 FE SD concept slots.
  assert.deepEqual(FR.slice(18, 22).map((r) => r.id), ['sd:fe-radio', 'sd:fe-rendering', 'sd:fe-network-data', 'sd:fe-performance'], 'week 4 opens with the concepts');
  // 12 designs × 2 consecutive weekday slots, after the concepts.
  const DESIGNS = ['news-feed', 'autocomplete', 'chat-app', 'video-player', 'ecommerce', 'photo-gallery', 'collab-editor', 'spreadsheet', 'calendar',
    'travel-booking', 'whiteboard', 'analytics-dashboard'];
  for (const d of DESIGNS) {
    const i = at(`sd:fe-${d}`), j = at(`sd:fe-${d}:deep-dive`);
    assert.ok(i > 21, `sd:fe-${d} after the concept slots`);
    assert.equal(j, i + 1, `sd:fe-${d} deep dive on the next slot`);
    assert.ok(!isSat(i) && !isSat(j), `sd:fe-${d} on weekdays`);
    assert.match(FR[i].do, /45 min/, `sd:fe-${d} slot 1 is a 45-min design`);
    assert.match(FR[i].explain, /compare/i, `sd:fe-${d} slot 1 compares`);
    assert.match(FR[j].understand, /^Deep dive/, `sd:fe-${d} slot 2 is a deep dive`);
  }
  assert.equal(FR.filter((r) => r.id.startsWith('sd:fe-')).length, 4 + 1 + 24, '4 concepts, micro-frontends, 24 design slots');
  // The 8 FE mocks are covers of their design's first slot.
  const MOCKS: Record<string, string> = { 'sdm:fe-news-feed': 'news-feed', 'sdm:fe-chat-app': 'chat-app', 'sdm:fe-autocomplete': 'autocomplete',
    'sdm:fe-ecommerce': 'ecommerce', 'sdm:fe-google-sheets': 'spreadsheet', 'sdm:fe-video-player': 'video-player', 'sdm:fe-calendar': 'calendar',
    'sdm:fe-photo-gallery': 'photo-gallery' };
  assert.deepEqual(Object.keys(MOCKS).sort(), V2['sd.SD_MOCKS'].filter((id) => id.startsWith('sdm:fe-')).sort());
  for (const [m, d] of Object.entries(MOCKS)) assert.ok((FR[at(`sd:fe-${d}`)].covers ?? []).includes(m), `sd:fe-${d} covers ${m}`);
  // Coverage: every FE id the spec maps to Frontend, the 18 sd:fe-* items and the 9 kept mc builds, once each (primary or covers).
  const NOT_HERE = ['fe:node-runtime', 'fe:sql', 'fe:nosql', 'fe:redis', 'fe:queues', 'fe:docker-ci', 'fe:api-design', 'fe:os-networking'];
  const counts = new Map<string, number>();
  for (const r of FR) for (const id of [r.id, ...(r.covers ?? [])]) counts.set(id, (counts.get(id) ?? 0) + 1);
  const MUST = [...V2['fe.FE'].filter((id) => !NOT_HERE.includes(id)),
    ...V2['sd.SD'].filter((id) => id.startsWith('sd:fe-')), ...Object.keys(MOCKS),
    'mc:mini-react', 'mc:vdom-diff', 'mc:redux-store', 'mc:event-emitter', 'mc:promise-pool', 'mc:use-fetch', ...REHEARSALS];
  assert.equal(MUST.length, 41 + 18 + 8 + 12);
  for (const id of MUST) assert.equal(counts.get(id), 1, `${id} once in Frontend`);
  for (const id of NOT_HERE) assert.equal(counts.get(id) ?? 0, 0, `${id} is not in Frontend`);
  assert.deepEqual([...counts].filter(([, n]) => n > 1), [], 'no id twice in Frontend');
  // Folded items, as the spec names them.
  assert.ok(FR[at('sd:fe-whiteboard')].covers.includes('fe:canvas-svg'), 'canvas-svg folds into the whiteboard');
  assert.ok(FR[at('fe:web-security')].covers.includes('sd:fe-security-a11y'), 'FE SD security folds into web security');
  assert.ok(FR[at('sd:fe-micro-frontends')].covers.includes('fe:web-components'));
  assert.ok(FR[at('fe:state-management')].covers.includes('mc:redux-store'));
  assert.ok(FR[at('mc:mini-react')].covers.includes('mc:vdom-diff'));
  // Learning rows: Understand (one https link) + Do + Explain ("Deep enough when you can").
  FR.forEach((r, i) => {
    const s = T.ai[i].items;
    assert.match(r.url, /^https:\/\//, `${r.id} url`);
    if (r.url2) { assert.match(r.url2, /^https:\/\//, `${r.id} url2`); assert.notEqual(r.url2, r.url, `${r.id} url2 differs`); }
    assert.ok(!('after' in r), `${r.id} has no after`);
    if (!r.kind) {
      assert.deepEqual(s.map((x: Any) => x.id), [r.id, `${r.id}:do`, `${r.id}:explain`], `slot ${i + 1} has 3 tasks`);
      assert.match(r.explain, /Deep enough when you can/, `${r.id} explain`);
    }
    const text = [r.understand, r.do, r.explain, r.text].filter(Boolean).join(' ');
    assert.ok(!/basics/i.test(text), `${r.id} no "basics"`);
    assert.ok(!/python|pandas|notebook/i.test(text), `${r.id} no Python/pandas/notebook`);
    assert.ok(!/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(text), `${r.id} no emoji`);
  });
  // Browser security rows carry their own prefix (not Platform's name).
  assert.ok(!FR.some((r) => /^Platform and security/.test(r.understand ?? '')), 'no "Platform and security" prefix');
  // No news task (that is the recall block's), no v2 AI evening or review item.
  const fr = T.ai.flatMap((s: Any) => s.items);
  assert.ok(!fr.some((x: Any) => /^ai:/.test(x.id) || x.filler), 'no ai:* item or filler in Frontend');
  for (const n of (aiCore.AI_NEWS as Any[])) assert.equal(slotOf('ai', n.id), -1, `${n.id} not in Frontend`);
}

// ---------- mc: Product, the flagship (v3 §5) ----------
{
  const TH: Any[] = product.TAKE_HOMES as Any[], LLDS: Any[] = product.LLD as Any[];
  assert.equal(FLAG_ROWS.length, 59, '59 flagship steps');
  assert.equal(LLDS.length, 13);
  assert.equal(new Set(FLAG_ROWS.map((r) => r.id)).size, 59, 'flagship ids unique');
  // Walk the 78 slots: Saturdays are LLD, weeks 7 and 10 Mon–Wed the take-homes, the other 59 weekday slots the flagship.
  const lld = [...LLDS], flag = [...FLAG_ROWS];
  const stepAt = new Map<number, number>(); // 1-based step → Grind index
  for (let i = 0; i < 78; i++) {
    const w = Math.floor(i / 6) + 1, d = GRIND_DOW[i], s = T.mc[i];
    const th = TH.find((t) => t.week === w);
    if (d === 6) {
      const x = lld.shift();
      assert.deepEqual(s.items.map((y: Any) => [y.id, y.cat]), [[x.id, 'mc']], `mc[${i}] Saturday LLD ${x.id}`);
      assert.equal(s.items[0].text, x.text);
    } else if (th && d <= 3) {
      const p = th.parts[d - 1];
      assert.deepEqual(s.items.map((y: Any) => [y.id, y.cat]), [[p.id, 'proj']], `mc[${i}] take-home ${p.id}`);
      assert.equal(s.items[0].text, p.text);
      if (d === 1) assert.equal(s.items[0].brief, th.text, `${p.id} carries the brief`);
      else assert.equal(s.items[0].brief, undefined);
    } else {
      const r = flag.shift();
      stepAt.set(FLAG_ROWS.length - flag.length, i);
      assert.deepEqual(s.items, expandRow(r, 'proj')[0], `mc[${i}] flagship ${r.id}`);
      assert.ok(s.items.every((y: Any) => y.cat === 'proj'));
    }
  }
  assert.equal(lld.length + flag.length, 0, 'every row placed');
  assert.deepEqual(TH.map((t) => t.week), [7, 10]);
  assert.deepEqual([36, 37, 38, 54, 55, 56].map((i) => ids('mc', i)[0]), TH.flatMap((t) => t.parts.map((p: Any) => p.id)));
  // Learning rows: Understand with one https link, Do (the engineer's part), Explain; TypeScript only, no widget builds.
  for (const r of FLAG_ROWS) {
    assert.match(r.id, /^proj:[a-z0-9-]+$/, `${r.id} id`);
    assert.ok(!r.kind && r.understand && r.do && r.explain, `${r.id} is a learning row`);
    assert.match(r.url, /^https:\/\//, `${r.id} url`);
    if (r.url2) assert.match(r.url2, /^https:\/\//, `${r.id} url2`);
    assert.match(r.explain, /Deep enough when you can/, `${r.id} explain`);
    for (const t of [r.understand, r.do, r.explain]) assert.doesNotMatch(t, /python|pandas/i, `${r.id} no Python`);
  }
  for (const x of [...TH, ...TH.flatMap((t) => t.parts), ...LLDS]) assert.doesNotMatch(x.text, /python|pandas/i, `${x.id} no Python`);
  // Step 1: pick the product; the default is the v2 AI workspace.
  const s1 = FLAG_ROWS[0];
  assert.equal(s1.id, 'proj:pick-scaffold');
  const s1Text = `${s1.understand} ${s1.do}`;
  assert.match(s1Text, /AI workspace/);
  assert.match(s1Text, /real-time collaboration/);
  assert.match(s1Text, /Ask your workspace/);
  assert.match(s1Text, /pick another product/i);
  // Reused v2 ids and the multi-part step ids, at the spec table's steps.
  const STEP_IDS: Record<number, string> = {
    1: 'proj:pick-scaffold', 2: 'proj:brief-wireframes', 4: 'proj:design-doc', 6: 'proj:setup', 7: 'proj:auth', 8: 'proj:auth-rls',
    9: 'proj:editor', 11: 'proj:realtime', 12: 'proj:realtime-presence', 13: 'proj:local-first-software', 14: 'proj:offline',
    15: 'proj:offline-tests', 16: 'proj:search-performance', 17: 'proj:perf-pass', 18: 'proj:a11y', 22: 'proj:ai-ingestion',
    23: 'proj:ai-reindex', 25: 'proj:ai-ask-workspace', 26: 'proj:ai-ask-permissions', 28: 'proj:evals', 31: 'proj:ai-agent-actions',
    32: 'proj:ai-agent-permissions', 33: 'proj:observability-security', 34: 'proj:rate-limits', 35: 'proj:integrations',
    36: 'proj:webhooks-out', 41: 'proj:load-failure', 42: 'proj:failure-test', 46: 'proj:launch', 48: 'proj:launch-fix',
    55: 'proj:case-study', 56: 'proj:demo-video',
  };
  for (const [n, id] of Object.entries(STEP_IDS)) assert.equal(FLAG_ROWS[Number(n) - 1].id, id, `step ${n} is ${id}`);
  // Every v2 PROJECT step and the local-first read keep their id.
  for (const id of [...V2['mc.PROJECT'], ...V2['mc.PROJECT_DEPTH_READS']]) assert.ok(FLAG_ROWS.some((x) => x.id === id), `${id} reused`);
  // Step 19: the first AI feature absorbs aib:ai-sdk-react.
  const s19 = FLAG_ROWS[18];
  assert.deepEqual(s19.covers, ['aib:ai-sdk-react']);
  // The 6 product basics (◆).
  assert.deepEqual(FLAG_ROWS.map((r, k) => (r.basics === true ? k + 1 : 0)).filter(Boolean), [2, 3, 10, 20, 37, 49], 'basics at steps 2, 3, 10, 20, 37, 49');
  // The spec table's `after` links (17 steps, 16 distinct AI-core slots; steps 39 and 40 both wait for AI 24): product step → AI-core slot, as the first item id of that AI-core slot, at a lower Grind index.
  const AFTER: Record<number, number> = { 19: 19, 21: 21, 22: 25, 23: 26, 24: 27, 25: 28, 28: 32, 29: 33, 30: 34, 31: 39, 32: 40, 38: 47, 39: 24, 40: 24, 43: 57, 44: 55, 53: 62 };
  const AFTER_IDS: Record<number, string> = { 19: 'aib:stream-tokens-react', 21: 'aib:tool-call-loop', 24: 'ai:prompt-caching-cost', 25: 'aib:embeddings-neighbours',
    26: 'aib:pgvector', 27: 'aib:retrieval-chunking-hybrid', 28: 'ai:rag-paper', 32: 'aib:evals-test-cases', 33: 'aib:evals-llm-judge', 34: 'fde:eval-pipelines',
    39: 'aib:react-build-agent', 40: 'aib:agents-sdk-build', 47: 'ai:fine-tune-evaluate', 55: 'aib:llm-gateway', 57: 'ai:owasp-llm', 62: 'aib:multimodal-upload' };
  const withAfter = FLAG_ROWS.map((r, k) => [k + 1, r] as const).filter(([, r]) => r.after !== undefined);
  assert.deepEqual(withAfter.map(([n]) => n), Object.keys(AFTER).map(Number), 'after on exactly the spec steps');
  for (const [n, r] of withAfter) {
    const ai = AFTER[n];
    assert.equal(T.fe[ai - 1].items[0].id, AFTER_IDS[ai], `AI-core slot ${ai} starts with ${AFTER_IDS[ai]}`);
    assert.equal(r.after, AFTER_IDS[ai], `step ${n} after AI ${ai}`);
    assert.ok(ai - 1 < stepAt.get(n)!, `step ${n} (index ${stepAt.get(n)}) after AI ${ai} (index ${ai - 1})`);
    assert.equal(T.mc[stepAt.get(n)!].items[0].after, r.after, `step ${n}: after on the first item`);
    assert.ok(T.mc[stepAt.get(n)!].items.slice(1).every((y: Any) => y.after === undefined));
  }
  // No v2 widget build, timed pass or screenshot build in the plan (Frontend keeps mini React and the 6 rehearsal reps).
  const KEPT = ['mc:mini-react', 'mc:autocomplete', 'mc:data-table', 'mc:infinite-scroll', 'mc:file-explorer', 'mc:modal', 'mc:nested-comments'];
  for (const t of TRACKS) for (const x of T[t].flatMap((s: Any) => s.items)) {
    if (t === 'ai' && KEPT.some((k) => x.id === k || x.id.startsWith(`${k}:`))) continue;
    assert.ok(!V2['mc.MC'].includes(x.id) && !x.id.endsWith(':timed') && !x.id.startsWith('mc:screenshot-') && !x.id.startsWith('mc:revisit'), `${x.id} is not a v2 build`);
  }
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
  // Slots 19–78: the depth topics in the spec's order. A multi-slot topic never splits; each practical sits at or near
  // 23 + 5k, just before or after a topic its target falls inside (the result is fixed here).
  const DEPTH = ['fe:sql', 'fe:use-the-index-luke-1', 'fe:use-the-index-luke-2', 'pf:explain-analyze', 'fde:sql-analysis',
    'jt:practical-rate-limiter', 'pf:postgres-in-practice', 'fe:nosql', 'fe:redis', 'jt:practical-retry-backoff',
    'fe:queues', 'pf:background-job', 'fe:node-runtime', 'jt:practical-ttl-cache-swr', 'aib:containers',
    'pf:docker-compose', 'pf:k8s-deployments', 'pf:k8s-services', 'pf:k8s-scaling', 'jt:practical-debounced-fetcher',
    'aib:terraform', 'pf:terraform-state-modules', 'aib:devops', 'pf:canary', 'pf:blue-green',
    'jt:practical-merge-csvs', 'fe:docker-ci', 'pf:otel-metrics', 'jt:practical-parse-log', 'pf:slos',
    'jt:depth-sre-troubleshooting', 'aib:aws', 'pf:aws-vpc-compute', 'pf:aws-storage-lambda', 'jt:practical-streaming-backpressure',
    'pf:finops', 'fde:data-pipelines', 'fde:data-warehouses', 'fde:data-audit-modeling', 'jt:practical-rag-pipeline',
    'pf:customer-apis-webhooks', 'fde:integration-engineering', 'pf:privacy-residency', 'jt:code-review-1', 'jt:practical-cli-tool',
    'jt:code-review-2', 'jt:code-review-3', 'jt:code-review-4', 'jt:practical-lru-cache',
    'fde:reengineering-round:part-1', 'fde:reengineering-round:part-2', 'fde:learning-round:part-1', 'fde:learning-round:part-2', 'pf:dr-drill',
    'jt:practical-promise-pool', 'pf:nginx', 'pf:network-debugging', 'pf:grpc', 'pf:multi-tenancy', 'jt:practical-webhook-idempotency'];
  assert.equal(DEPTH.length, 60);
  assert.deepEqual(T.jt.slice(18).map((s: Any) => s.items[0].id), DEPTH, 'slots 19–78');
  // Every multi-slot topic sits on consecutive slots, in the spec's topic order.
  const GROUPS: [string, string[]][] = [
    ['sql', ['fe:sql', 'fe:use-the-index-luke-1', 'fe:use-the-index-luke-2', 'pf:explain-analyze', 'fde:sql-analysis']],
    ['queues', ['fe:queues', 'pf:background-job']], ['docker', ['aib:containers', 'pf:docker-compose']],
    ['kubernetes', ['pf:k8s-deployments', 'pf:k8s-services', 'pf:k8s-scaling']], ['terraform', ['aib:terraform', 'pf:terraform-state-modules']],
    ['cicd', ['aib:devops', 'pf:canary', 'pf:blue-green']], ['otel', ['fe:docker-ci', 'pf:otel-metrics']], ['slo', ['pf:slos', 'jt:depth-sre-troubleshooting']],
    ['aws', ['aib:aws', 'pf:aws-vpc-compute', 'pf:aws-storage-lambda']], ['data', ['fde:data-pipelines', 'fde:data-warehouses', 'fde:data-audit-modeling']],
    ['integration', ['pf:customer-apis-webhooks', 'fde:integration-engineering', 'pf:privacy-residency']],
  ];
  for (const [g, gIds] of GROUPS) {
    assert.deepEqual(PF.filter((r) => r.group === g).map((r) => r.id), gIds, `group ${g} rows`);
    const at = gIds.map((id) => slotOf('jt', id));
    at.forEach((n, j) => assert.equal(n, at[0] + j, `group ${g}: ${gIds[j]} on the next slot`));
  }
  assert.deepEqual(PF.filter((r) => r.group).map((r) => r.group).filter((g, j, xs) => g !== xs[j - 1]), GROUPS.map(([g]) => g), 'groups in spec order, each one run');
  // The 12 practical coding reps: v2 ids, one 45-min TypeScript task each, no Python.
  const prac = T.jt.map((s: Any, i: number) => [i + 1, s] as [number, Any]).filter(([, s]) => s.items[0].id.startsWith('jt:practical-'));
  assert.deepEqual(prac.map(([n]) => n), [24, 28, 32, 38, 44, 47, 53, 58, 63, 67, 73, 78], 'practical slots');
  prac.forEach(([n], k) => assert.ok(Math.abs(n - (23 + 5 * k)) <= 2, `practical ${k + 1} at slot ${n}, within 2 of ${23 + 5 * k}`));
  assert.deepEqual(prac.map(([, s]) => s.items[0].id).sort(), [...V2['judgment.PRACTICAL']].sort(), 'the 12 v2 practical ids');
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
  // The 4 code-review reps keep their v2 ids.
  for (const id of V2['judgment.CODE_REVIEWS']) {
    const i = slotOf('jt', id), r = PF.find((x) => x.id === id);
    assert.ok(i >= 0, `${id} placed`);
    assert.equal(r.kind, 'rep');
  }
  // Auth and secrets (week 3) before Kubernetes and Terraform (from week 5).
  const firstInfra = Math.min(...T.jt.map((s: Any, i: number) => (s.items.some((x: Any) => /^(aib:containers|aib:terraform|pf:k8s-|pf:terraform-)/.test(x.id)) ? i : 99)));
  for (const id of ['pf:oauth-oidc', 'pf:secrets']) assert.ok(slotOf('jt', id) < firstInfra, `${id} before containers/terraform`);
  assert.ok(firstInfra >= 24, 'containers and terraform from week 5');
  // Sourcing rule: the primer's "Scaling AWS to millions of users" on the AWS slot.
  assert.equal(T.jt[slotOf('jt', 'aib:aws')].items[0].url2, 'https://github.com/donnemartin/system-design-primer/blob/master/solutions/system_design/scaling_aws/README.md');
  // SRE ch. 12 lives here, with its v2 url.
  assert.equal(T.jt[slotOf('jt', 'jt:depth-sre-troubleshooting')].items[0].url, 'https://sre.google/sre-book/effective-troubleshooting/');
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
    'fde:practical-coding-log', ...V2['judgment.PRACTICAL'], ...V2['judgment.CODE_REVIEWS']];
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

// ---------- beh: Career and FDE (v3 §6) ----------
{
  const RUBRIC = 'https://www.techinterviewhandbook.org/coding-interview-rubrics/';
  const OA: string[] = reference.OA_LINKS as string[];
  const isSat = (i: number) => GRIND_DOW[i] === 6;
  const weekOf = (i: number) => Math.floor(i / 6) + 1;
  // 65 weekday rows, laid out in order on the weekdays; one task per rep, Understand/Do/Explain per learning row.
  assert.equal(CR.length, 65, '65 weekday rows');
  assert.equal(MD.length, 13, '13 mock days');
  const weekdays = T.beh.map((s: Any, i: number) => ({ s, i })).filter(({ i }: Any) => !isSat(i));
  assert.deepEqual(weekdays.map(({ s }: Any) => s.items[0].id), CR.map((r) => r.id), 'weekdays follow CAREER');
  const slotOfRow = (id: string) => T.beh.findIndex((s: Any) => s.items[0].id === id);
  const rowOf = (id: string) => CR.find((r) => r.id === id || (r.covers ?? []).includes(id));
  const at = (id: string) => slotOfRow(rowOf(id).id);
  // Saturdays: the Saturday row (60 min) plus the rows carried to Sunday (45 min), exactly as the spec's table.
  const SAT: Record<number, [string, string[]]> = {
    1: ['beh:ai-drill-1', []], 2: ['beh:oa-round-1', []], 3: ['beh:ai-drill-2', []], 4: ['beh:oa-round-2', ['beh:peer-w4-behavioral']],
    5: ['beh:ai-drill-3', ['beh:mock-w5-sd']], 6: ['beh:oa-round-3', ['beh:peer-w6-decomposition']], 7: ['beh:ai-drill-4', ['beh:mock-w7-ai']],
    8: ['beh:oa-round-4', ['beh:peer-w8-sd']], 9: ['beh:ai-drill-5', ['beh:mock-w9-ai']],
    10: ['beh:loop-1-round-1', ['beh:loop-1-round-2', 'beh:loop-1-round-3']], 11: ['beh:loop-2-round-1', ['beh:loop-2-round-2', 'beh:loop-2-round-3']],
    12: ['beh:loop-3-round-1', ['beh:loop-3-round-2', 'beh:loop-3-round-3']], 13: ['beh:loop-4-round-1', ['beh:loop-4-round-2', 'beh:loop-4-round-3']],
  };
  for (let w = 1; w <= 13; w++) {
    const items = T.beh[idx(w, 6)].items, [main, carry] = SAT[w];
    assert.deepEqual(items.filter((x: Any) => !x.sundayCarry).map((x: Any) => x.id), [main], `week ${w} Saturday`);
    assert.deepEqual(items.filter((x: Any) => x.sundayCarry).map((x: Any) => x.id), carry, `week ${w} carried to Sunday`);
    for (const x of items) assert.equal(x.mins, x.sundayCarry ? 45 : 60, `${x.id} minutes`);
    assert.equal(MD[w - 1].week, w, `MOCK_DAY[${w - 1}] is week ${w}`);
    for (const r of [MD[w - 1].row, ...(MD[w - 1].carry ?? [])]) assert.ok(r.kind === 'rep' || r.kind === 'mock', `${r.id} is one task`);
  }
  // The real tracks carry only these rows.
  const carried = TRACKS.flatMap((t) => T[t].flatMap((s: Any) => s.items.filter((x: Any) => x.sundayCarry).map((x: Any) => x.id)));
  assert.deepEqual(carried, Object.values(SAT).flatMap(([, c]) => c), 'only Career carries to Sunday');
  // Coding rounds: 8 distinct OA posts, OA_LINKS[8..15], disjoint from DSA's OA_LINKS[0..7]; the rubric as url2.
  const coding = [1, 2, 3, 4].map((n) => `beh:oa-round-${n}`).concat([1, 2, 3, 4].map((n) => `beh:loop-${n}-round-1`));
  const codingUrls = coding.map((id) => T.beh[slotOf('beh', id)].items.find((x: Any) => x.id === id).url);
  assert.deepEqual(codingUrls, OA.slice(8, 16), 'coding rounds use OA_LINKS[8..15]');
  assert.equal(new Set(codingUrls).size, 8, '8 distinct OA posts');
  const dsaOa = T.dsa.flatMap((s: Any) => s.items).filter((x: Any) => /^dsa:oa-\d+$/.test(x.id)).map((x: Any) => x.url);
  assert.deepEqual([...dsaOa].sort(), OA.slice(0, 8).sort(), 'DSA uses OA_LINKS[0..7]');
  assert.ok(codingUrls.every((u) => !dsaOa.includes(u)), 'disjoint from DSA');
  // The coding rubric is the second link of the coding rounds only: OA rounds, AI drills and loop round 1 (not LLD or design rounds 2–3).
  const item = (id: string) => T.beh[slotOf('beh', id)].items.find((x: Any) => x.id === id);
  for (const id of [...coding, ...[1, 2, 3, 4].map((n) => `beh:loop-${n}-round-1`), ...[1, 2, 3, 4, 5].map((n) => `beh:ai-drill-${n}`)]) {
    assert.equal(item(id).url2, RUBRIC, `${id} cites the coding rubric`);
  }
  for (const id of [1, 2, 3, 4].flatMap((n) => [2, 3].map((k) => `beh:loop-${n}-round-${k}`))) assert.notEqual(item(id).url2, RUBRIC, `${id}: no coding rubric`);
  // covers on the Saturday rows
  const mdRow = (id: string) => MD_ROWS.find((r) => r.id === id);
  assert.deepEqual(mdRow('beh:ai-drill-1').covers, ['aib:ai-assisted-coding-round'], 'drill 1 covers the v2 AI-assisted round');
  ['sdm:lld-json-parser', 'sdm:lld-2048', 'sdm:lld-minesweeper', 'sdm:lld-chess'].forEach((lld, n) => assert.deepEqual(mdRow(`beh:loop-${n + 1}-round-2`).covers, [lld], `loop ${n + 1} LLD`));
  assert.match(T.beh[idx(10, 6)].items[0].text, /paid mock/i, 'week 10: the paid-mock note');
  // Carry on the calendar is in test-engine.ts.
  // Every BEH, DECOMP, TEARDOWNS id and the 11 FDE ids the spec keeps: once, as a primary id or in `covers`.
  const FDE_KEPT = ['fde:stage1-intro', 'fde:stage1-glossary', 'fde:discovery', 'fde:scoping', 'fde:business-acumen', 'fde:stakeholders',
    'fde:communication', 'fde:take-home-1', 'fde:take-home-2', 'fde:take-home-3', 'fde:mock-fde-loop'];
  const named = [...CR, ...MD_ROWS].flatMap((r) => [r.id, ...(r.covers ?? [])]);
  assert.equal(new Set(named).size, named.length, 'no id named twice in Career');
  const DECOMP: Any[] = (career as Any).DECOMP;
  assert.equal(DECOMP?.length, 12, 'DECOMP lives in career.js');
  for (const id of [...(career.BEH as Any[]), ...DECOMP, ...(career.TEARDOWNS as Any[])].map((x) => x.id).concat(FDE_KEPT)) {
    assert.equal(named.filter((x) => x === id).length, 1, `${id} once in Career`);
  }
  // The 5 shared slots (items of 30 min or less), one row each with the second id in `covers`.
  const SHARED: [string, string][] = [['beh:linkedin-github', 'beh:positioning'], ['beh:referrals', 'beh:referral-template'],
    ['beh:questions-to-ask', 'beh:practice-why-company'], ['beh:resume-update', 'beh:referrals-2'], ['fde:stage1-intro', 'fde:stage1-glossary']];
  for (const [a, b] of SHARED) assert.deepEqual(CR.find((r) => r.id === a)?.covers, [b], `${a} shares its slot with ${b}`);
  assert.ok(CR.some((r) => r.id === 'beh:company-loops'), 'company-loop research row');
  assert.equal(CR.filter((r) => r.covers?.length).length, 5 + DECOMP.filter((x) => x.from).length, 'only the shared slots and the DECOMP reps cover ids');
  // No FDE id that the AI core or Platform places.
  for (const id of named.filter((x) => x.startsWith('fde:'))) {
    assert.ok(!CORE_PLACED.has(id) && !CORE_COVERS.has(id) && !PF_PLACED.has(id) && !PF_COVERS.has(id), `${id} not also in AI core or Platform`);
  }
  // Pins: Amazon OA prep in week 1; deep dives on the Fridays of weeks 2–4; negotiation on Mon–Tue of week 12 (indices 66, 67).
  for (const id of ['beh:amazon-oa', 'beh:amazon-work-sim', 'beh:amazon-work-style']) assert.equal(weekOf(at(id)), 1, `${id} in week 1`);
  assert.deepEqual([1, 2, 3].map((n) => at(`beh:deep-dive-${n}`)), [idx(2, 5), idx(3, 5), idx(4, 5)], 'deep dives on Fridays, weeks 2–4');
  assert.deepEqual([at('beh:negotiation-1'), at('beh:negotiation-2')], [66, 67], 'negotiation week 12 Mon–Tue');
  // Applications not before week 8.
  for (const id of ['beh:target-list', 'beh:company-loops', 'beh:referrals', 'beh:referral-template', 'beh:resume-update', 'beh:referrals-2']) {
    assert.ok(at(id) >= idx(8, 1), `${id} from week 8`);
  }
  // The rest of BEH keeps its v2 order.
  const PINNED = new Set(['beh:amazon-oa', 'beh:amazon-work-sim', 'beh:amazon-work-style', 'beh:deep-dive-1', 'beh:deep-dive-2', 'beh:deep-dive-3',
    'beh:negotiation-1', 'beh:negotiation-2', 'beh:target-list', 'beh:referrals', 'beh:referral-template', 'beh:resume-update', 'beh:referrals-2']);
  const flow = (career.BEH as Any[]).map((x) => x.id).filter((id) => !PINNED.has(id) && !CR_COVERS.has(id));
  assert.deepEqual([...flow].sort((a, b) => at(a) - at(b) || 0), flow, 'BEH in v2 order');
  // After BEH: teardowns one every 5 weekday slots; DECOMP and FDE in their v2 order; the FDE take-home on 3 weekdays in a row.
  const ord = (id: string) => weekdays.findIndex(({ s }: Any) => s.items[0].id === rowOf(id).id);
  const lastBeh = Math.max(...flow.map(ord));
  const tds = (career.TEARDOWNS as Any[]).map((x) => ord(x.id));
  tds.forEach((o, k) => { assert.ok(o > lastBeh, 'teardowns after BEH'); if (k) assert.equal(o - tds[k - 1], 5, 'one teardown every 5 slots'); });
  const inOrder = (ids: string[], what: string) => assert.deepEqual([...ids].sort((a, b) => ord(a) - ord(b)), ids, what);
  inOrder(DECOMP.map((x) => x.id), 'DECOMP in order');
  inOrder(FDE_KEPT.filter((id) => id !== 'fde:stage1-glossary'), 'FDE in order');
  for (const id of [...DECOMP.map((x) => x.id), ...FDE_KEPT]) assert.ok(ord(id) > lastBeh, `${id} after BEH`);
  assert.deepEqual([2, 3].map((n) => ord(`fde:take-home-${n}`) - ord(`fde:take-home-${n - 1}`)), [1, 1], 'take-home on consecutive weekdays');
  // Row shape and copy rules; categories.
  for (const r of [...CR, ...MD_ROWS]) {
    if (r.url) assert.match(r.url, /^https:\/\//, `${r.id} url`);
    if (r.url2) { assert.match(r.url2, /^https:\/\//, `${r.id} url2`); assert.notEqual(r.url2, r.url, `${r.id} url2 differs`); }
    if (r.kind) {
      assert.ok(['rep', 'mock'].includes(r.kind) && typeof r.mins === 'number' && r.text, `${r.id} rep`);
    } else {
      assert.ok(r.understand && r.explain, `${r.id} Understand, Explain`);
      assert.match(r.url, /^https:\/\//, `${r.id} Understand has a link`);
      assert.match(r.explain, /Deep enough when you can/, `${r.id} explain`);
    }
    const text = [r.understand, r.do, r.explain, r.text].filter(Boolean).join(' ');
    assert.ok(!/python|pandas|notebook/i.test(text), `${r.id} no Python/pandas/notebook`);
    assert.ok(!/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(text), `${r.id} no emoji`);
  }
  // Every weekday row (BEH, FDE, DECOMP, teardowns) is a learning row: Understand, Do, Explain.
  for (const r of CR) assert.ok(!r.kind && r.do, `${r.id} is a learning row with Understand, Do and Explain`);
  for (const id of DECOMP.map((x) => x.id)) assert.equal(T.beh[slotOfRow(id)].items.length, 3, `${id} has 3 tasks`);
  for (const x of T.beh.flatMap((s: Any) => s.items)) {
    const fde = x.id.startsWith('fde:') || /^jt:(decomp|client-sim)-/.test(x.id) || /^beh:(peer-w6-decomposition)$/.test(x.id);
    assert.equal(x.cat, fde ? 'fde' : 'beh', `${x.id} cat`);
    assert.ok(!x.filler, `${x.id} is content`);
  }
  // The question bank and "questions to ask" as url2 on the matching items.
  assert.equal(CR.find((r) => r.id === 'beh:questions-to-ask').url, 'https://www.techinterviewhandbook.org/final-questions/');
  for (const id of ['beh:failures', 'beh:conflicts', 'beh:peer-w4-behavioral']) {
    const r = rowOf(id) ?? mdRow(id);
    assert.ok([r.url, r.url2].includes('https://www.techinterviewhandbook.org/behavioral-interview-questions/'), `${id} cites the question bank`);
  }
}
// No v2 UX lesson in any track (dropped by owner choice).
assert.ok(!all.some((x) => x.id.startsWith('ux:')), 'no ux:* items');

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
