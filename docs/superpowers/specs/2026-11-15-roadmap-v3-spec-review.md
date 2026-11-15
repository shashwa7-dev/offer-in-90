# Review of the roadmap v3 spec (2026-11-15)

Independent review of `2026-11-15-roadmap-v3-ai-systems-design.md`. Verdict: **not ready yet**. The direction is right, but the text needs fixing before it is built. Every fix below is a spec-text change. Apply them all, recount every track to ≤ 78 slots, and show the owner the changes in plain words before writing the implementation plan.

## Must-fix
1. **Track identity is undefined.** Add a table: template key → TrackId → Cat → label.
   - dsa → dsa → `dsa`.
   - aib → recall → `ai`. Recall is generated daily, like `rev`, and sits outside the Steady rotation. Its source is the most recent AI-core slot before today. Decide whether `aib` stays a TrackId.
   - fe → AI core → `ai`.
   - mc → product → `proj`; LLD keeps `mc`.
   - sd → systems → `sd`.
   - jt → platform → a new `platform` Cat.
   - beh → career → `beh`/`fde`.
   - ai → frontend → `fe`.
   - Move the news task from the evening `ai` block (plan-build.ts:252) to recall.
2. **Career overflows by about 25–40 slots.** BEH 40 + FDE 30 + teardowns 6 already uses 76 of 78; v3 adds 6 product basics, 13 Saturday mock days and DECOMP. Fix:
   - product basics go into the flagship weekdays;
   - PRACTICAL (12) goes into platform;
   - deep dives move to weekdays;
   - items of 30 min or less share a slot;
   - recount to ≤ 78.
3. **Systems overflows and has no room for mocks.** Fix:
   - say 26 HLD problems everywhere (§2 says 23);
   - move the 8 AI system designs into AI core weeks 11–13, putting the RAG design right after the evals module (needed for the week-8 bar);
   - move languages and runtimes (V8, GC, JIT) to frontend;
   - merge the networking duplicated with HLD fundamentals;
   - the last 8 HLD designs become timed mocks;
   - name the track for the 3 software-design slots;
   - budget the DDIA chapters realistically (about 2 slots each, or name the sections to read).
4. **Product Saturdays overflow** (13 LLD + 5 AI drills + LLD mocks on 13 Saturdays). Fix:
   - mc Saturdays carry LLD 13 only;
   - AI-enabled drills become the career mock-day round on odd weeks 1–9;
   - LLD mocks become one round of each Phase 3 loop.
5. **DSA is under-specified.** Fix:
   - must-solves are each pattern's teach + unseen problem;
   - day A: card + teach problem; day B: unseen (hidden until start) + explain-back;
   - OA simulations are 60 min (2 problems): 8 in DSA Phase 3 and 8 as the coding round on mock Saturdays;
   - Google sets are 2 problems in 60 min;
   - define where Phase 3 starts.
6. **Steady breaks "DSA every study day"** (DSA rests 24 of 102 days, layout.ts:36–48, in the same pair as AI core). Fix:
   - on DSA rest days the 05:15 hour is a generated pattern revisit, not a buffer;
   - re-pair the rotation so DSA and AI core never rest on the same day.
7. **The flagship has no step list, and its dependencies run backwards.** Fix:
   - list the flagship steps (about 59 weekday slots);
   - step 1: pick the product, scaffold it with AI, deploy hello-world;
   - every AI feature gets `after:` its AI-core item;
   - platform day 1 needs no flagship (shell);
   - the first flagship-dependent platform item gets `after:` the scaffold.
8. **Frontend contradicts itself.** Fix:
   - 60 min, no news;
   - name the topics, reusing FE ids: rendering-path, accessibility, storage-workers, http-caching, rest-graphql-fetch, websockets-sse, web-security, auth, web-vitals, react-rendering, react-concurrent, react-rsc, nextjs-caching-rsc, list-virtualization-code-splitting, testing, build-tooling, component-api, state-management, forms-suspense, animation-performance, js-concurrency, plus V8/GC;
   - each frontend system design gets 2 slots;
   - add an acceptance exception for the 6 labelled rehearsal reps;
   - remove the "light revision" padding (about 30 slots).
9. **Score sections don't match the stored keys.** Fix:
   - sections are dsa, ai, sd, platform, product, fe, keeping the existing keys in sundays.ts;
   - one baseline task per section;
   - update the self-check text.
10. **Nothing says what happens to the v2 content (the "never cut" rule).** Add a table "v2 export → v3 track, or dropped by owner choice" for:
    - AIB (30), AI_EVENING (50), AI_REVIEW, PRACTICAL, DECOMP, OSS, CODE_REVIEWS, MEMOS;
    - the FE backend items (sql, nosql, redis, queues, docker-ci, os-networking, node-runtime, api-design).

    Reuse the existing content ids.
11. **Saturday mechanics are unspecified.** Fix:
    - no revision merge in v3;
    - loop rounds 2–3 carry to Sunday;
    - SD mocks start in week 5, AI-design mocks in week 7;
    - list each Saturday's blocks for weeks 1, 2, 4 and 10.
12. **The week-8 RAG design bar comes before the RAG design is scheduled.** Fixed by item 3.
13. **The DSA acceptance clashes with timed sets.** Reword: "…or a timed mixed set (patterns hidden by design)".

## Should-fix
- **Coverage:**
  - Chip Huyen ch. 1 (use-case evaluation, the AI stack);
  - ch. 3–4 (perplexity and cross-entropy, Elo/comparative evaluation, model selection, benchmark contamination, open vs proprietary);
  - ch. 7 (memory math, model merging);
  - ch. 8 (curation, dedup, distillation);
  - ch. 9 (TTFT/TPOT, prefill vs decode, parallelism);
  - advanced RAG (HyDE, text-to-SQL, GraphRAG, DSPy);
  - edge and in-browser models (transformers.js);
  - red teaming and guard models;
  - API design (REST/gRPC/GraphQL, pagination, versioning);
  - debugging and profiling, rg/jq/regex, git internals, semver;
  - discrete math overview;
  - GPU and memory-bandwidth basics;
  - FDE stage 4 orchestration and stage 7 governance/MLOps;
  - company-wise lists in Phase 3.
- **AI core pacing.** Weeks 1–2 are overloaded (about 17 h of video alone); spread them to about 2.5 weeks and fill the thin weeks 11–13.
- **Papers.** Pin each paper to its module (InstructGPT with post-training, RAG with RAG, ReAct with agents, LoRA with fine-tuning).
- **Platform order.** Auth and secrets come before Kubernetes and Terraform. Add basic GitHub Actions CI in weeks 1–3, so the eval gates have a CI to run in.
- **Readiness bars.** Write exact texts, not "e.g."; add DSA and systems bars at week 4 and an AI bar at week 12.
- **Systems order.** Compress "how computers work" to week 1, or interleave it, so HLD isn't delayed to week 3.
- **AI coding reps.** Add 3 small AI-engineer coding reps in TypeScript (sampling, cosine top-k, BPE). These are interview reps.
- **Acceptance wording.** "Every learning slot" has 2–3 tasks.
- **Start state.** State it: v1 began 2026-11-09, and v2 said "no migration".

## Nice-to-have
- vLLM needs a Linux GPU: use Ollama or llama.cpp on a Mac. Free tiers and cost caps for AWS; kind for local Kubernetes.
- Voice and real-time agents, computer-use agents, MCP security.
- News 10 min, recall 50 min.
- Deduplicate feature flags and DNS/TLS.

## Risks to raise with the owner
- **DSA for Google/Meta is thin** at 54 must-solves. Use Steady revisit days and Phase 3 revisits for the var problems of the 8 heaviest patterns.
- **Frontend-specialist loops would be under-prepared.** Either state "not targeting frontend-specialist loops", or use the spare frontend slots for timed JS output quizzes.
- **Advanced DSA compressed from 8 slots (v1) to 3.** This needs the owner's sign-off.

## Slot budget (estimates)
| Track | Needed | Over / under |
|---|---|---|
| DSA | 74 + Google/Meta sets | about +4 |
| Recall | generated | undefined |
| AI core | front +3, back −8 | rebalance |
| Product | Saturdays 26 vs 13; weekdays unspecified | +13 |
| Systems | 80–96 | +3 to +19 |
| Platform | about 60 | −18 (fill with PRACTICAL + Missing Semester gaps) |
| Career | 103–119 | +25 to +41 |
| Frontend | about 48 | −30 padding |

Code references: tracks.ts (mustFit:62, feTrack cat:117, jtSaturday:204–230, beh pins:300), layout.ts:36–48, plan-build.ts:224–226 and :252, sundays.ts:3–5, schedule.js:6–27.
