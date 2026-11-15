# Roadmap v3: AI engineer, systems and product (content redesign)

Status: **revision 2** (2026-11-15). The owner approved the direction on 2026-11-15. This revision applies every
must-fix and should-fix from `2026-11-15-roadmap-v3-spec-review.md` and the owner's answers to its three risks. Every
track is recounted to exactly 78 slots. Supersedes the *content* parts of the v2 spec
(`2026-11-15-roadmap-v2-content-design.md`). Everything built for v2 Release 1 stays: state, sync, Steady/Grind
modes, the routine (editable wake-up, bedtime moves), labels, the DSA page, Sundays, scores, search, the engine and
the layout. What changes is what each block teaches, the track builders, the block titles and times, the
readiness/assessment text, and the tests.

## The principle

AI already writes UI and boilerplate. In 2026 the engineer's job is to **understand, design, judge and debug
systems**. So the plan never spends time typing basics (widgets, hand-built data structures, new languages). It
spends time on:

1. **How AI systems work**, from neurons to production: enough theory to reason, enough building to be credible.
2. **How software systems work**: distributed systems, data, infrastructure, reliability.
3. **Product engineering**: shipping a real AI product with AI tools, making the architecture calls, reviewing what
   the AI wrote, measuring and iterating.
4. **Interviews**: DSA by pattern (light), system design, LLD, behavioral and forward-deployed engineer (FDE) rounds.

Role priority: **AI engineer, then software engineer, then product engineer, on top of a strong frontend base.**
Frontend is the owner's core experience. It keeps a full evening hour of **senior-level** work: architecture,
performance, React internals, debugging, frontend system design and timed interview reps. No basics.

## Every learning slot has three parts (as in v1)

Every learning slot has 2–3 tasks, **Understand → Do → Explain**:
- **Understand**: one read or watch with one link (the best free source).
- **Do**: a small, concrete exercise. TypeScript only. Using an AI assistant is allowed and expected, but you must be
  able to explain every line it wrote.
- **Explain**: out loud or in notes, against a stated bar ("deep enough when you can…").

Timed reps, mocks and the generated blocks (recall, revision, review) are exempt: their own instructions are the
task.

## Start state

v1 went live on 2026-11-09 (`main`). v2 Release 1 has not been merged, so v1 state is the only state in the wild.
v3 ships in the same release as the v2 machinery, and like v2 it has **no migration**: v1 ticks don't carry over
(Start over once). Content ids are reused where an item carries over (table below), so that later releases can
carry ticks forward.

## Track identity

Template keys stay as they are, so the routine, the calendar file and owner tasks keyed by block keep working. What
each key teaches changes.

| Template key | Time (Grind) | TrackId | Cat | Label (block title) |
|---|---|---|---|---|
| `dsa` | 05:15–06:15 (was 05:15–06:45) | `dsa` | `dsa` | Deep work 1 · DSA pattern |
| `aib` | 06:15–07:15 (was 06:45–07:15) | **none (generated)** | `ai` | Recall + AI news |
| `fe` | 08:00–10:00 | `fe` | `ai` | Deep work 2 · AI engineering core |
| `mc` | 10:15–11:45 | `mc` | `proj`; Saturday LLD keeps `mc` | Deep work 3 · Product: the flagship (Sat: Low-level design) |
| `sd` | 13:00–14:30 | `sd` | `sd` | Deep work 4 · Systems and architecture |
| `rev` | 14:45–15:15 | none (generated) | `dsa` | DSA revision + recognition drill (as built) |
| `jt` | 15:15–16:00 | `jt` | **`platform` (new Cat)** | Platform, data and DevOps |
| `beh` | 16:00–17:00 | `beh` | `beh` / `fde` | Career and FDE (Sat: Mock day) |
| `ai` | 20:00–21:00 | `ai` | `fe` | Frontend (senior) |
| `review` | 21:00–21:30 | none | `review` | Daily review (as built) |

- **`aib` stops being a TrackId.** `TrackId` becomes `dsa | fe | mc | sd | jt | beh | ai` (7 tracks). Old mode
  cursors that carry an `aib` key are ignored.
- **Recall is generated every study day, like `rev`,** and is outside the Steady rotation. It has three tasks:
  1. **AI recall (30 min):** explain without notes the most recent AI-core slot placed on an earlier day, then check
     against its links.
     With no AI-core slot yet (day 1), the task is a warm-up: write what you already know about LLMs.
  2. **Systems recall (20 min):** the same for the Systems slot placed 3–7 study days earlier (the latest one in that
     window). With no Systems slot in the window, the AI recall takes the full 50 min.
  3. **AI news (10 min):** moved here from the evening `ai` block (`plan-build.ts:252`), same `newsId`.
- Study time per day is unchanged (10.75 h): DSA loses 30 min and recall gains them.

## Weekday (Grind times; wake-up shifts everything)

| Time | Block | What |
|---|---|---|
| 05:15–06:15 | DSA | One pattern or DSA fundamental every study day (below) |
| 06:15–07:15 | Recall + news | Generated (above) |
| 08:00–10:00 | AI engineering core | The main track |
| 10:15–11:45 | Product | Mon–Fri: the flagship. Sat: low-level design |
| 13:00–14:30 | Systems | Computers, networking, HLD, DDIA, case studies, deep dives, mocks |
| 14:45–15:15 | Revision | DSA re-solves (3/7/21 days) + recognition drill, as built. **No revision merge in v3** |
| 15:15–16:00 | Platform | Hands-on DevOps, data and cloud; hour-long items take 2 consecutive slots |
| 16:00–17:00 | Career | Behavioral, FDE, applications. Sat: mock day |
| 20:00–21:00 | Frontend | Senior frontend, 60 min. **No news here** |
| 21:00–21:30 | Daily review | As built |

Sundays, the prep day and the burnout guard stay as built. Saturday mock rounds that don't fit the Saturday slot
carry to that week's Sunday (as v2 does; the owner accepted the Sunday overflow).

## Steady rotation (fixes "DSA every study day")

Steady runs each of the 7 tracks on 78 of every 102 study days. The skip pattern (Bresenham, ≥ 4 days apart) is
kept; the pairing changes so **DSA and AI core never rest on the same day**, and the cross-track `after:` links fall
on earlier days:

| Phase | Tracks | Why |
|---|---|---|
| 0 | `dsa`, `beh` | |
| 1 | `fe` (AI core), `mc` (product) | Flagship AI steps depend on AI-core slots; with the same phase, an AI-core slot always lands on an earlier day than a product slot with a higher index |
| 2 | `sd`, `jt` | |
| 3 | `ai` (frontend) | |

**On a DSA rest day the 05:15 hour is not a buffer.** It is a generated **pattern revisit**: 2 problems you haven't
solved from the hardest patterns you have already covered (DP, graphs, backtracking, trees, heaps, intervals,
sliding window, binary search). It draws first from those patterns' former `var` problems (25), then from their
optional pool (`hot` first). It is timed (45 min) and logged as unseen. Steady has 24 of these days.

## Track contents (exactly 78 slots each)

Grind slot *n* (1-based) is week ⌈n/6⌉, weekday ((n−1) mod 6)+1 (Mon = 1 … Sat = 6). Week *w* holds slots 6w−5 … 6w.

### 1. DSA (`dsa`, 60 min)

**Rule: every study day covers one pattern or DSA fundamental, or a timed mixed set (patterns hidden by design).**
No hand-built data structures.

| Slots | What | Count |
|---|---|---|
| 1 | Foundations · Big-O as reasoning (`dsa:foundations-big-o`) | 1 |
| 2 | Foundations · Recursion, induction and counting: the call stack plus a discrete-math overview (logic, sets, combinatorics, basic probability) (`dsa:foundations-recursion`) | 1 |
| 3–56 | 27 patterns × 2 days. **Day A:** pattern card + the teach problem. **Day B:** the unseen problem (hidden until start) + the explain-back | 54 |
| 57–78 | **DSA Phase 3** (Grind week 10 Wed onwards) | 22 |

- **Must-solves are each pattern's teach + unseen problem (54).** The 45 former `var` problems leave the must tier.
  They feed Steady revisit days and the Phase 3 revisits (hardest patterns first). Everything else stays in the
  optional pool on the DSA page.
- **DSA Phase 3 (22 slots):** 8 Amazon OA simulations (60 min, 2 problems from one OA post); 4 Google sets (2 problems in
  60 min in a plain Google Doc, no autocomplete); 4 Meta speed sets (2 problems in 40 min, then optimize and explain);
  3 advanced-awareness slots, ids `adv:difference-array-line-sweep`, `adv:fenwick-segment-tree`, `adv:dp-on-trees-digit-dp` (difference array + line sweep; Fenwick tree + segment tree; DP on trees + digit DP: know
  when it applies, solve 1); 3 hard-pattern revisits (var problems). The Google and Meta sets draw from that company's
  tagged problems in the pool (company-wise lists).
- The interview-environment items (`env:*`) ride as a second task on the Monday of weeks 10–13, as built.
- The other 8 OA posts are the coding rounds of mock Saturdays (Career), so all 16 OA posts are used.

### 2. AI engineering core (`fe`, 2 h)

Follows Chip Huyen's *AI Engineering* and mlabonne's llm-course "LLM Engineer" path. Papers are pinned to their
module. Three short AI-engineer coding reps in TypeScript (BPE, sampling, cosine top-k) are interview reps.

| Slots (weeks) | Module | Slots and content (v2 ids reused) | Count |
|---|---|---|---|
| 1–16 (W1–W3 Thu) | **How neural nets and LLMs work** | 1 math intuition: vectors, dot products, matrices, probability, gradients (3Blue1Brown); 2 classical ML overview: supervised/unsupervised, train/test, overfitting, precision/recall/F1; 3 neural nets + gradient descent (`ai:3b1b-neural-network`, `ai:3b1b-gradient-descent`); 4 backprop (`ai:3b1b-backprop`, `ai:3b1b-backprop-calculus`); 5 tokenization and embeddings (`ai:3b1b-transformers`) + **rep: BPE in TS**; 6 attention and MLPs (`ai:3b1b-attention`, `ai:3b1b-mlp-facts`); 7 the Illustrated Transformer + paper intro (`ai:attention-illustrated`); 8 paper §3 (`ai:attention-paper-attention`, `ai:attention-paper-embeddings`); 9 Annotated Transformer code (`ai:attention-annotated-code`) + explain-back (`ai:review-transformers`); 10 Karpathy GPT parts 1–2, watch + read the code, no retyping (`ai:karpathy-gpt-bigram`, `ai:karpathy-gpt-self-attention`); 11 part 3 (`ai:karpathy-gpt-training`); 12 pretraining + GPT-3 in-context learning (`ai:karpathy-llm-pretraining`, `ai:gpt3-in-context`); 13 GPT-3 approach and limits, benchmark contamination (`ai:gpt3-approach`, `ai:gpt3-limitations`); 14 scaling laws (`ai:scaling-laws`, `ai:chinchilla`, `ai:scaling-write-up`, `ai:review-scaling-laws`); 15 post-training + InstructGPT (`ai:karpathy-llm-post-training`, `ai:instructgpt-pipeline`, `ai:instructgpt-methods`); 16 RLHF results, RL and reasoning (`ai:instructgpt-results`, `ai:karpathy-llm-rl-reasoning`, `ai:review-rlhf`) | 16 |
| 17–24 (W3 Fri–W4) | **Using models well** | 17 Chip ch. 1: use-case evaluation, the AI stack, AI vs ML engineering; 18 LLM API fundamentals + sampling (temperature, top-p, top-k), perplexity and cross-entropy (`aib:llm-api-fundamentals`) + **rep: sampling in TS**; 19 streaming + structured output (`aib:stream-tokens-react`, `aib:structured-output-zod`); 20 prompting and context engineering (`aib:prompting-rewrite`, `fde:context-engineering`, `ai:lost-in-the-middle`); 21 tool calling (`aib:tool-call-loop`); 22 MCP + MCP security (`aib:mcp-server`); 23 model selection: open vs proprietary, benchmarks, Elo/comparative evaluation (Chip ch. 4) (`fde:model-providers`); 24 cost and latency math, prompt caching (`ai:prompt-caching-cost`) | 8 |
| 25–30 (W5) | **Retrieval and RAG** | 25 embeddings + cosine (`aib:embeddings-neighbours`) + **rep: cosine top-k in TS**; 26 vector indexes, HNSW, pgvector (`aib:pgvector`, `aib:retrieval-hnsw-recall`); 27 chunking, hybrid search, reranking (`aib:retrieval-chunking-hybrid`, `ai:contextual-retrieval`); 28 RAG paper + RAG over your notes with citations (`ai:rag-paper`, `aib:rag-build-notes`); 29 RAG evaluation and when RAG fails (Chip ch. 6) (`ai:review-rag`); 30 advanced RAG: query rewriting, HyDE, text-to-SQL, GraphRAG | 6 |
| 31–36 (W6) | **Evaluation** | 31 eval methodology (Chip ch. 3–4) (`ai:evals-hamel`); 32 eval sets from real failures (`aib:evals-test-cases`); 33 LLM-as-judge and its biases (`aib:evals-llm-judge`); 34 eval gates in CI + traces (`fde:eval-pipelines`, `aib:llm-observability`); 35 a year of building with LLMs, tactical (`ai:depth-applied-llms-tactical`, `ai:review-evals`); 36 evals for agents and RAG, failure taxonomies | 6 |
| 37–42 (W7) | **Agents** (opens with the RAG design) | 37 **AI design: RAG over company docs** (`sd:ai-rag-search`, `ai:design-rag-scale`); 38 workflows vs agents + ReAct (`ai:building-effective-agents`, `ai:react-paper`, `ai:review-agents`); 39 a small agent with 2 tools (`aib:react-build-agent`); 40 agents in production (`aib:agents-sdk-build`, `aib:agents-long-running`); 41 memory, multi-agent, A2A, voice and computer-use agents (`fde:agents-memory`); 42 sandboxing, permissions, debugging agents (`fde:debugging-agents`) | 6 |
| 43–48 (W8) | **Fine-tuning and data** | 43 prompt vs RAG vs fine-tune (`ai:prompt-rag-finetune`, `ai:review-finetune-vs-rag`, `ai:depth-eugene-yan-llm-patterns`); 44 LoRA/QLoRA, memory math, model merging (Chip ch. 7) (`ai:lora`); 45 SFT vs DPO vs RLHF; 46 a real fine-tune via a hosted API, part 1: data; 47 part 2: evaluate it against the base model and RAG with your eval set; 48 dataset engineering: curation, dedup, synthetic data, distillation (Chip ch. 8) | 6 |
| 49–54 (W9) | **Inference and serving** | 49 prefill vs decode, TTFT/TPOT, the KV cache (Chip ch. 9); 50 batching, quantization, speculative decoding (`fde:inference-optimization`); 51 GPU and memory-bandwidth basics, parallelism; 52 self-hosting on a Mac with Ollama or llama.cpp (vLLM needs a Linux GPU: concepts only); 53 in-browser and edge models (`aib:transformers-js`), self-host vs API with latency and cost budgets; 54 **AI design: LLM inference/serving platform** | 6 |
| 55–60 (W10) | **Production AI architecture** | 55 LLM gateway: routing, fallbacks, caching (`aib:llm-gateway`); 56 guardrails, guard models, red teaming (`ai:constitutional-ai`); 57 OWASP LLM Top 10 + attack your own app (`ai:owasp-llm`, `aib:prompt-injection-attack`, `ai:review-prompt-injection`); 58 prompt/model versioning, feedback loops, drift (`fde:mlops`); 59 governance and privacy (`fde:governance-privacy`, `ai:depth-applied-llms-ops-strategy`); 60 AI feature rollout: eval gates, flags, fallbacks (`ai:design-ai-rollout`) | 6 |
| 61–78 (W11–W13) | **Frontier, AI system design, interview mode** | 61 reasoning models + CoT (`ai:cot-paper`, `ai:extended-thinking`); 62 multimodal (`aib:multimodal-upload`); 63–68 **AI designs**: ChatGPT-style product (`sd:ai-chatgpt`, `ai:design-ai-chat`), eval platform (`sd:ai-eval-framework`), coding-agent platform (`sd:ai-coding-agent`), semantic search + recommendations, agent memory service, multi-tenant AI SaaS; 69 prompt optimization (DSPy) + reading a current model card; 70 build a feature with an AI assistant and review every line (`aib:ai-assisted-feature`); 71 write a post about what you built (`ai:ai-build-post`); 72–75 teach-backs (modules 1–2, 3–4, 5–6, 7–8); 76–78 timed AI-design mocks, 45 min: ChatGPT-style (`sdm:ai-chatgpt`), eval platform (`sdm:ai-eval-framework`), RAG over docs (new `sdm:ai-rag`) | 18 |

Total 78. All 8 AI system designs live here: RAG at 37 (right after evals, before the week-8 bar), serving at 54,
the other six at 63–68.

### 3. Systems and architecture (`sd`, 1.5 h)

| Group | Slots | Content | Count |
|---|---|---|---|
| How computers work (week 1) | 1–3 | 1 CPU, memory hierarchy, caches, latency numbers (`sd:numbers-card`); 2 OS: processes vs threads, scheduling, virtual memory, file systems and I/O (`fe:os-networking`, OS half); 3 concurrency: locks, races, async vs threads, the event loop | 3 |
| Networking and APIs | 4, 7 | 4 TCP/IP, UDP, DNS, HTTP/1.1–2–3, TLS (`sd:internet`, `fe:os-networking` networking half; hands-on DNS/TLS is in Platform); 7 communication and API design: REST vs gRPC vs GraphQL, pagination, versioning, errors, idempotency keys (`sd:communication`, `fe:api-design`) | 2 |
| HLD fundamentals | 5, 6, 8–11 | 5 scalability, latency vs throughput, capacity estimation (`sd:fundamentals`, `sd:capacity-estimation`); 6 CAP, PACELC, SLOs (`sd:cap-pacelc`); 8 caching, CDN, load balancing (`sd:caching`); 9 messaging (`sd:messaging`); 10 delivery framework (`sd:delivery-framework`); 11 concepts to master + common mistakes (`sd:concepts-to-master`) | 6 |
| Later fundamentals | weeks 3–9 | idempotency, saga, CQRS (`sd:idempotency-saga`); observability + security basics (`sd:observability-security`) | 2 |
| *Designing Data-Intensive Applications* | weeks 3–13 | 8 chapters × 2 slots, each with an explain-back: ch. 2 data models (`ai:depth-ddia-data-models`); ch. 3 storage and indexes (`ai:depth-ddia-storage-indexes`, `sd:storage`); ch. 4 encoding and evolution; ch. 5 replication (`ai:depth-ddia-replication`, `sd:replication-sharding`); ch. 6 partitioning + consistent hashing; ch. 7 transactions (`ai:depth-ddia-transactions`, `sd:transactions`); ch. 8 the trouble with distributed systems; ch. 9 consistency and consensus, Raft (`sd:reliability`) | 16 |
| Software design (named here) | weeks 3–9 | architecture styles (monolith, modular, microservices, layering); testing strategy (pyramid, contract, e2e, evals as tests); refactoring and code smells | 3 |
| How real systems work | weeks 3–13 | the 10 case studies, one per slot (`jt:hiw-*`: Figma multiplayer, Linear sync, Stripe idempotency, Discord storage, Slack real-time, Notion data model, Next.js caching, Shopify BFCM, Cloudflare Nov 2025 outage, GitHub Copilot) | 10 |
| HLD building blocks (deep dives) | weeks 3–13 | search and inverted indexes; geospatial indexing (geohash, quadtree); probabilistic structures (Bloom filter, HyperLogLog, count-min); real-time fan-out (WebSockets, pub/sub); stream processing (exactly-once); blob storage and media pipelines; distributed IDs, clocks and locks | 7 |
| HLD designs (learn) | 12, then weeks 3–9 | **26 HLD designs** in total: the v2 23 plus the 3 the board had that v2 lacked (Robinhood, Instagram, Google Docs: `sdm:hld-robinhood`, `sdm:hld-instagram`, `sdm:hld-google-docs`). The first 18, core first (Bitly at slot 12): draw it yourself, then compare | 18 |
| HLD designs (timed mocks) | weeks 10–13 | the last 8 of the 26, as 45-min timed mocks with a self-review against the framework | 8 |
| Second-pass mocks | weeks 10–13 | rate limiter, WhatsApp, Ticketmaster (`sdm:hld-rate-limiter`, `sdm:hld-whatsapp`, `sdm:hld-ticketmaster`) | 3 |

Total 78. Order: weeks 1–2 are slots 1–12 as numbered, so HLD starts in week 2. Weeks 3–9 alternate one HLD design
with one depth item (DDIA, software design, a case study, a building block or a later fundamental). Weeks 10–13
alternate a mock with the remaining depth items. Languages and runtimes (V8, GC, JIT) move to Frontend.

### 4. Platform, data and DevOps (`jt`, 45 min)

Every item is hands-on against your flagship, except slots 1–5, which need no flagship. The first item that needs
the flagship (slot 6) has `after:` the flagship scaffold (product slot 1). Hour-long items take 2 consecutive slots.

| Weeks | Slots | Content | Count |
|---|---|---|---|
| 1–3 **DevOps basics** (in this order) | 1–18 | 1 terminal and shell: processes, ports, env vars, logs, ssh (`fde:linux-shell`); 2 shell power tools: rg, jq, regex, pipes (*Missing Semester*); 3 git workflows: branches, rebase, PR reviews, revert a bad deploy (`fde:git-beyond-basics`); 4 git internals, bisect, semver; 5 debugging and profiling: debugger, Node/Chrome profiler; 6 environments and config: dev/staging/prod, `.env` (`after:` scaffold); 7 deploy the web app (Vercel or Fly/Render), preview deploys; 8 domains, DNS and HTTPS; 9 managed Postgres: backups, a tested restore, migrations; 10 basic GitHub Actions CI (lint, test, build on every PR), so the eval gates have a CI to run in; 11 feature flags (the mechanics; the product use is in Product); 12 reading logs and setting an alert; 13 uptime monitoring and error tracking; 14 what it costs: free tiers, cost caps; 15 OAuth 2.0/OIDC hands-on; 16 enterprise auth: SSO, SAML (`fde:security`); 17 secrets management and key rotation; 18 hashing vs encryption, OWASP Web Top 10 | 18 |
| 4–13 **Depth** | 19–78 | SQL in depth: joins, transactions, isolation (`fe:sql`), indexes (`fe:use-the-index-luke-1`, `fe:use-the-index-luke-2`), query plans with EXPLAIN ANALYZE, CTEs and window functions (`fde:sql-analysis`) — 5; Postgres in practice: pooling, vacuum, row-level security — 1; NoSQL modeling (`fe:nosql`) — 1; Redis (`fe:redis`) — 1; queues and background jobs (`fe:queues`) + one background job in the flagship — 2; the Node runtime (`fe:node-runtime`) — 1; Docker (`aib:containers`, part 1) — 2; Kubernetes on kind: deployments, services, scaling (`aib:containers`, part 2) — 3; Terraform (`aib:terraform`) — 2; CI/CD and safe rollouts: canary, blue-green (`aib:devops`) — 3; observability with OpenTelemetry (`fe:docker-ci`; its Docker and CI parts are the Docker and CI/CD slots) — 2; SLOs and incident response (`jt:depth-sre-troubleshooting`) — 2; AWS core: IAM, VPC, compute, storage, Lambda, on the free tier with a budget alarm (`aib:aws`) — 3; FinOps: cost per request, rightsizing, tagging — 1; data engineering: ETL vs ELT, batch vs streaming, orchestration (Airflow/Dagster) (`fde:data-pipelines`), warehouses and star schemas (`fde:data-warehouses`), data audit and modeling (`fde:data-audit-modeling`) — 3; FDE integration: customer APIs and webhooks, legacy systems (`fde:integration-engineering`), data privacy and residency — 3; **the 12 practical coding reps** (`jt:practical-*`, 45 min timed, all in TypeScript; the Python ones are rewritten in TS) — 12; code-review reps on merged open-source PRs (`jt:code-review-1…4`) — 4; re-engineering round (`fde:reengineering-round`) — 2; learning round (`fde:learning-round`) — 2; a disaster-recovery drill: lose the primary, restore and fail over against an RTO/RPO — 1; nginx and reverse proxies — 1; network debugging: curl, dig, tcpdump — 1; gRPC and protobuf hands-on — 1; multi-tenancy and per-tenant rate limits — 1 | 60 |

Total 78. Auth and secrets (week 3) come before Kubernetes and Terraform (from week 5).

### 5. Product: the flagship (`mc`, 1.5 h)

**One real AI product, built with AI coding tools and launched to real users.** The default is the v2 product, an
AI workspace (notes with real-time collaboration and "Ask your workspace"). Step 1 lets you pick another product.
The steps are written so they apply to either. AI writes the UI. Your work is the engineer's part: ADRs, reviewing
every AI-written change, the data model, the AI features, performance, observability, launch and iteration.

- **Mon–Fri: 59 flagship steps + 2 take-homes** (3 slots each, Mon–Wed of weeks 7 and 10; TypeScript;
  `mc:take-home-*`) = 65.
- **Saturdays: LLD, 13 sessions** (`lld:*`) = 13. LLD mocks are one round of each Phase 3 mock loop (Career).
- **The 6 product basics** (v1's product and UX lessons, compressed) are flagship steps, marked ◆ below.
- `after:` = the AI-core slot that must come first.

| Week | Steps |
|---|---|
| 1 | 1 pick the product, scaffold it with AI, deploy hello-world; 2 product brief ◆ (`proj:brief-wireframes`); 3 user research in 30 min ◆; 4 design doc 1: architecture, data model (`proj:design-doc`); 5 design doc 2: API, real-time approach, AI design, first ADRs |
| 2 | 6 review the AI scaffold: lint, tests, CI, preview deploys (`proj:setup`); 7 auth, workspaces, roles (`proj:auth`, part 1); 8 Postgres schema with row-level security (part 2); 9 the editor: document model, keyboard-first (`proj:editor`); 10 metrics and analytics instrumentation ◆ |
| 3 | 11 real-time collaboration 1: CRDT model (`proj:realtime`); 12 real-time 2: presence, reconnect; 13 the local-first read (`PROJECT_DEPTH_READS`); 14 offline-first 1 (`proj:offline`); 15 offline-first 2: conflict and reconnect tests |
| 4 | 16 search and ⌘K with virtualized results (`proj:search-performance`); 17 performance pass: Web Vitals, profiling; 18 accessibility pass (`proj:a11y`); 19 first AI feature: a streaming assistant with the AI SDK (`aib:ai-sdk-react`; after AI 19); 20 A/B tests and the stats behind them ◆ |
| 5 | 21 tools in the product (after AI 21); 22 ingestion 1: chunk and embed on save (`proj:ai-ingestion`; after AI 25); 23 ingestion 2: re-index on edit or model change (after AI 26); 24 hybrid search and reranking (after AI 27); 25 Ask your workspace 1: answers with citations (`proj:ai-ask-workspace`; after AI 28) |
| 6 | 26 Ask 2: permission-aware retrieval; 27 a second round of user research on the AI feature; 28 the product's eval set from real failures (`proj:evals`; after AI 32); 29 an LLM judge, checked against your labels (after AI 33); 30 eval gate in CI + traces (after AI 34) |
| 7 | (Mon–Wed take-home 1) 31 agent actions 1 (`proj:ai-agent-actions`; after AI 39); 32 agent actions 2: human confirmation, tool permissions (after AI 40) |
| 8 | 33 observability: tracing, cost and latency dashboard (`proj:observability-security`, part 1); 34 rate limits and abuse controls (part 2); 35 integrations 1: import (`proj:integrations`); 36 integrations 2: outgoing webhooks; 37 roll out the assistant behind a flag and read the result ◆ |
| 9 | 38 fine-tune vs RAG for one feature, with numbers (after AI 47); 39 model routing: a cheaper model for easy calls (after AI 24); 40 prompt and semantic caching (after AI 24); 41 load test (`proj:load-failure`, part 1); 42 failure test: kill the WebSocket server, fix what breaks |
| 10 | (Mon–Wed take-home 2) 43 guardrails and prompt-injection tests (after AI 57); 44 put the LLM gateway in the product (after AI 55) |
| 11 | 45 launch checklist; 46 launch: 5–10 real users (`proj:launch`); 47 interview your real users; 48 ship one fix from the feedback; 49 read the funnel and retention ◆ |
| 12 | 50 one data-driven iteration behind a flag; 51 revisit 3 ADRs with what you learned; 52 review AI-written code for smells, refactor one module; 53 a multimodal or in-browser AI feature (after AI 62); 54 eval regression and cost report, published |
| 13 | 55 case study 1: README, architecture diagram, trade-offs (`proj:case-study`); 56 case study 2: 3-minute demo video; 57 present the product as a deep-dive interview; 58 a final iteration from user feedback; 59 retro and the roadmap after the plan |

Total 59 + 6 + 13 = 78. **No widget builds.**

### 6. Career and FDE (`beh`, 1 h)

**Weekdays (65 slots):** the 40 `BEH` items, with the 3 past-work deep dives on weekdays (weeks 2–4), and negotiation
pinned to week 12 Mon–Tue; the 12 `DECOMP` decomposition and client-simulation reps; the 6 product teardowns; and the
FDE stages that stay here: stage 1 intro + glossary, discovery, scoping, business acumen, stakeholders,
communication, the 3-day FDE take-home and the mock FDE loop. **Items of 30 minutes or less share a slot** (5 pairs):
LinkedIn/GitHub + positioning; referrals + the referral template; questions to ask + "why this company";
resume update + referrals 2; FDE stage 1 intro + glossary. 40 + 12 + 6 + 11 FDE − 5 shared + 1 company-loop research
slot (map each top-5 target's loop from `COMPANY_MAP`) = 65. Applications start in week 8.

**Saturdays (13 slots): mock day.**

| Weeks | Saturday career slot (60 min) | Carried to Sunday (45 min) |
|---|---|---|
| 1, 3, 5, 7, 9 | AI-enabled coding drill (Meta-style: use the AI, verify, narrate), 5 drills, ids `beh:ai-drill-1…5` (drill 1 covers `aib:ai-assisted-coding-round`) | W5: system design mock (solo, timed); W7 and W9: AI-design mock (solo, timed) |
| 2, 4, 6, 8 | Coding round: an Amazon OA simulation, 2 problems in 60 min (4 OA posts) | W4: behavioral peer mock; W6: decomposition peer mock; W8: system design peer mock (Exponent, free) |
| 10–13 | Full mock loop *n*, round 1: coding (an OA post), 60 min | Rounds 2–3: **LLD** + one of AI design (loop 1, AI/product engineer), HLD (loop 2, big-tech SWE), frontend system design (loop 3, senior frontend), behavioral + decomposition (loop 4, FDE) |

So system design mocks start in week 5 and AI-design mocks in week 7; peer mocks run every 2 weeks from week 4; the
8 Saturday coding rounds use the other 8 OA posts. One paid mock before the first big-tech onsite (a note in week 10).

Total 65 + 13 = 78.

### 7. Frontend, senior (`ai`, 60 min, evening)

No basics and no padding. Every Saturday (13 slots) is a **timed JS/React interview rep**; the 6 machine-coding
rehearsal reps run on weekdays in weeks 11–13; the rest is learning slots and frontend system design.

| Group | Content (FE ids reused) | Count |
|---|---|---|
| Rendering and the browser | `fe:rendering-path`; `fe:animation-performance`; `fe:web-vitals` + DevTools profiling of long tasks and INP; V8, JIT and GC + memory leaks with heap snapshots (`fe:types-memory`; moved from Systems); `fe:js-concurrency` | 5 |
| React internals and concurrency | Fiber and reconciliation (`fe:react-rendering`); read and explain a mini React and a VDOM diff (`mc:mini-react`, `mc:vdom-diff`); hooks internals, stale closures, re-render rules (`fe:react-hooks`, `fe:react-memo`, `fe:custom-hooks`); the React Compiler and memoization; `fe:react-concurrent`; `fe:forms-suspense`; `fe:react-rsc` | 7 |
| Data and the network | `fe:nextjs-caching-rsc`; `fe:rest-graphql-fetch`; `fe:http-caching`; `fe:websockets-sse`; `fe:state-management` (+ `mc:redux-store`) | 5 |
| Platform and security | `fe:storage-workers`; `fe:web-security`; `fe:auth`; `fe:accessibility` | 4 |
| Architecture and tooling | `fe:component-api` (design systems); TypeScript at scale (`fe:typescript`); `fe:build-tooling`; `fe:list-virtualization-code-splitting`; monorepos and micro-frontends (`sd:fe-micro-frontends`, `fe:web-components`); CSS at scale and layout debugging (`fe:css-box-model`, `fe:css-layout`); `fe:testing` | 7 |
| Real-world debugging | browser observability: RUM, error tracking, source maps; hydration mismatches; race conditions and stale data in effects | 3 |
| Frontend system design | 4 concept slots: RADIO (`sd:fe-radio`), rendering (`sd:fe-rendering`), network and data (`sd:fe-network-data`), performance at scale (`sd:fe-performance`); then **12 designs × 2 slots** (`sd:fe-*`): slot 1 design it yourself in 45 min, then compare; slot 2 a deep dive on its hardest part (`sd:fe-security-a11y` folds into the accessibility and web-security slots, `fe:canvas-svg` into the whiteboard design) | 28 |
| Timed interview reps (Saturdays) | output quizzes: event loop and promises; closures, `this`, prototypes; coercion and ES6/Proxy; tricky async (async/await, generators); implement: Promise.all/allSettled/any/race; array polyfills + deep clone/equal; debounce/throttle/memoize/curry; event emitter (`mc:event-emitter`); promise pool (`mc:promise-pool`); DOM events and delegation; hooks (useDebounce, usePrevious, useFetch: `mc:use-fetch`); 2 mixed timed sets (BFE.dev) | 13 |
| Machine-coding rehearsal reps (weeks 11–13) | autocomplete, data table, infinite feed, file tree, modal + focus trap, nested comments (`mc:autocomplete`, `mc:data-table`, `mc:infinite-scroll`, `mc:file-explorer`, `mc:modal`, `mc:nested-comments`); 45 min each, AI off, labelled "interview rehearsal" | 6 |

Total 78. The 8 frontend mocks from v2's `SD_MOCKS` are the timed first slots of their matching designs, so they
are kept.

## v2 content → v3 (nothing is cut silently)

| v2 export | Where it goes in v3 |
|---|---|
| `AI_EVENING` (50) | AI core (46: every id is placed in the module table above); the 4 DDIA reads → Systems DDIA |
| `AIB` (30) | AI core (22); `aib:ai-sdk-react` → flagship step 19; `aib:ai-assisted-coding-round` → AI drill 1 (Career); `aib:aws`, `aib:terraform`, `aib:containers`, `aib:devops` → Platform; `aib:python-for-js`, `aib:pandas` → **dropped by owner choice** (no Python) |
| `AIB_MOVED` (6) | same items as above: the 4 cloud items → Platform; the 2 Python items dropped |
| `AI_REVIEW` (8) | AI core, as the Explain task of the slot that teaches each topic |
| `AI_NEWS` | the recall block's news task |
| `SD` (61) | Systems (39); the 18 `sd:fe-*` items → Frontend; the 4 `sd:ai-*` → AI core |
| `SD_MOCKS` (24) | HLD: Robinhood, Instagram and Google Docs become 3 of the 26 designs; rate limiter, WhatsApp and Ticketmaster are the second-pass mocks; FE (8) → the first slots of the Frontend designs; AI (2) → AI-core mocks 76–78; LLD (8): `sdm:lld-json-parser`, `sdm:lld-2048`, `sdm:lld-minesweeper`, `sdm:lld-chess` are the LLD rounds of loops 1–4; `sdm:lld-book-management`, `sdm:lld-google-authenticator`, `sdm:lld-android-unlock`, `sdm:lld-tetris` repeat LLD Saturday sessions and are **dropped as duplicates** (they stay listed on the seeded "LLD question bank" page) |
| `FE` (49) | Frontend (the ids listed above); `fe:node-runtime`, `fe:sql`, `fe:nosql`, `fe:redis`, `fe:queues`, `fe:docker-ci` → Platform; `fe:api-design`, `fe:os-networking` → Systems; `fe:execution-context`, `fe:closures`, `fe:this-bind`, `fe:prototypes`, `fe:event-loop`, `fe:promises`, `fe:async-await`, `fe:array-polyfills`, `fe:debounce-throttle`, `fe:es6-proxy`, `fe:dom-events` → the themes of the Saturday interview reps (practised, not taught) |
| `FE_DEPTH_READS` (2) | Platform SQL |
| `PRACTICAL` (12) | Platform (TypeScript only) |
| `DECOMP` (12) | Career |
| `HOW_IT_WORKS` (10) | Systems case studies |
| `JT_DEPTH_READS` (2) | Stripe (the same object as in `HOW_IT_WORKS`; placed once) → Systems case study; SRE ch. 12 → Platform |
| `CODE_REVIEWS` (4) | Platform |
| `OSS_FIXES` (7), `OSS_REPOS`, the OSS setup fillers | **dropped by owner choice** (the OSS thread is removed; code you didn't write is practised in the code-review, re-engineering and learning rounds) |
| `MEMOS` (13) | **dropped by owner choice** (decisions become ADRs in the flagship) |
| `INTERVIEW_ENV` (4) | DSA, as built |
| `FDE` (36) | Career (the stages listed there); stages 2, 4 and the security/integration items → Platform; stages 5 and 7 → AI core; the `from` items are the `DECOMP` reps; `fde:practical-coding-log` → the Platform practical reps; `fde:reengineering-round`, `fde:learning-round` → Platform |
| `BEH` (40), `TEARDOWNS` (6) | Career |
| `UX` (36) | compressed into the 6 product basics (flagship ◆) — **the 36 lessons are dropped by owner choice** |
| `MC` (34), `MC_TIMED`, `MC_SCREENSHOT` | widget builds **dropped by owner choice**; kept: `mc:mini-react`, `mc:vdom-diff`, `mc:redux-store` (Frontend React internals), `mc:event-emitter`, `mc:promise-pool`, `mc:use-fetch` (Frontend reps), and autocomplete, data table, infinite scroll, file explorer, modal, nested comments as the 6 rehearsal reps |
| `PROJECT` (18), `PROJECT_DEPTH_READS` (1), `TAKE_HOMES` (2), `LLD` (13) | Product |
| `FOUNDATIONS` (5) | Big-O and recursion → DSA; the 3 build-it-yourself items → **dropped by owner choice** |
| `ADV_DSA` (8) | 3 awareness slots (owner sign-off 2026-11-15); Union-Find is already a pattern; the DP roadmap folds into the DP explain-back |
| DSA `var` problems (45) | Steady revisit days and the Phase 3 revisits (the optional pool otherwise) |

**`after:` links.** v3 builders ignore every v2 `after` field (several now point at the same slot or a later
one, which would stall the layout). v3 sets `after` only where this spec asks for it: each flagship AI step's
`after: AI n` is the id of the **first item of AI-core slot n**, and Platform slot 6's `after` is the first item of
product slot 1. A test checks every `after` points at a strictly earlier Grind slot.

**Exact slot order.** Where this spec gives groups rather than a slot-by-slot sequence (Systems weeks 3–13, Platform
19–78, Career weekdays), the implementation plan fixes the order, subject to: Systems weeks 3–9 hold 17 designs and
25 depth items, weeks 10–13 hold 11 mocks and 13 depth items, DDIA chapters in book order; Platform's 2-slot items
are consecutive; Career pins stay where stated.

## Kept from the original roadmap (gap check against v1 and its Whimsical board)

- **Amazon OA**: all 16 OA posts, as 60-min simulations (8 in DSA Phase 3, 8 as Saturday coding rounds), plus the
  work-simulation and work-style formats in Career (week 1).
- **AI-enabled coding round** (Meta-style): 5 drills, Saturdays of odd weeks 1–9, in Career.
- **Google plain-doc sets** and **Meta speed sets** in DSA Phase 3.
- **Weekly mocks**: Saturday = mock day (above); peer mocks every 2 weeks from week 4; Phase 3 = 4 full mock loops.
  One paid mock before the first big-tech onsite.
- **All 26 HLD designs**, the "concepts to master + common mistakes" card and the delivery framework.
- **Advanced DSA awareness**: 3 slots in DSA Phase 3.
- **Success rules**: think out loud, 45-min time-box, flag and re-solve.
- **Product engineering basics**: 6 steps in the flagship.
- **Frontend machine-coding interviews**: 6 rehearsal reps, AI off.
- **FDE roadmap (roadmap.sh, 8 stages)**: all covered across tracks except its Python stage (dropped by owner
  choice).

## Fundamentals coverage map (no blank areas)

Goal: after 13/17 weeks the owner has at least a working overview of every fundamental area, and depth where
interviews and the AI-engineer job demand it. Checked against teachyourselfcs.com's 9 core subjects, MIT's *Missing
Semester*, Chip Huyen's *AI Engineering* and mlabonne's llm-course.

| Area | Where it's covered | Depth by the end |
|---|---|---|
| Programming and software design | Flagship (ADRs, reviewing AI output), LLD Saturdays, Systems' 3 software-design slots | Solid |
| Computer architecture | Systems slot 1; GPU and memory bandwidth in AI core 51 | Overview |
| Algorithms and data structures | DSA every day | Interview-ready |
| Math for CS and ML | AI core 1–2 (linear algebra, probability, gradients, classical ML); DSA 2 (discrete math overview); stats for A/B tests (flagship 20) | Overview, enough for AI work |
| Operating systems and concurrency | Systems 2–3; LLD concurrency (thread pool) | Overview + interview level |
| Networking | Systems 4 and 7; Platform DNS/HTTPS, nginx, curl/dig/tcpdump | Solid |
| Databases | DDIA, Platform SQL in depth, Postgres, Redis, NoSQL | Solid |
| Languages and runtimes | Frontend: V8, JIT, GC; Platform: the Node runtime | Overview |
| Distributed systems | DDIA, 26 HLD designs, building blocks, case studies | Solid |
| Security | Platform 15–18, AI core 56–57 (OWASP LLM, red teaming), Frontend web security and auth | Overview + practical |
| Practical tools (*Missing Semester*) | Platform 1–5: shell, rg/jq/regex, git and its internals, debugging and profiling | Practical |
| DevOps and cloud | Platform | Practical |
| Data engineering | Platform: pipelines, orchestration, warehouses, data audit; AI core 48 (dataset engineering) | Overview |
| AI: how models work | AI core 1–16 | Solid overview |
| AI: building with models | AI core 17–60 | Job-ready |
| AI system design | 8 AI designs + 3 timed mocks | Interview-ready |
| Product engineering | Flagship end to end, the 6 product basics, teardowns | Practical |
| Frontend | The senior evening track | Senior, interview-ready |
| Interviews | DSA, system design, LLD, behavioral, FDE, mock day every Saturday, Amazon OA | Interview-ready |

## Assessments (rewritten for v3)

- **Score sections** (Sundays): `dsa` DSA, `ai` AI engineering, `sd` Systems, `platform` Platform & DevOps, `product`
  Product, `fe` Frontend. The existing keys (`dsa`, `fe`, `sd`, `ai`) keep their meaning except `fe`, whose label
  changes from "Frontend & CS" to "Frontend"; `platform` and `product` are new. Old weekly scores stay readable.
- **Prep-day baseline**: one task per section (6 tasks, 0–100, self-scored).
- **Weekly self-check** text: "Score yourself 0–100 on each of the six sections: DSA, AI engineering, Systems,
  Platform & DevOps, Product, Frontend." Progress shows the trend.
- **Readiness checks** (exact texts):
  - **Week 4:** "Explain from memory in 3 minutes how a transformer turns a prompt into the next token (tokens,
    embeddings, attention, MLP, logits, sampling), and what your tool-calling loop does when a tool fails. DSA: 11
    patterns covered, each unseen problem solved in 45 minutes or flagged and re-solved. Systems: estimate QPS and
    storage for a URL shortener in 10 minutes and say where the cache, the replicas and the queue go. Platform: your
    product is deployed with a domain, HTTPS, CI on every PR, a database backup you have restored, and one alert."
  - **Week 8:** "Design RAG over company docs in 45 minutes out loud, with an eval plan and permission-aware
    retrieval. Your product's Ask feature has an eval set gating CI, traces and one alert. 20 of the 23 patterns
    taught so far passed their unseen check."
  - **Week 10:** "Your product has an agent action with tool permissions and an eval suite. One fine-tune vs RAG
    decision is written up with numbers. All 27 patterns are taught and at least 23 passed their unseen check; the
    rest are flagged."
  - **Week 12:** "Two full mock loops done and passed by your own rubric. AI: design RAG, an inference platform
    and a ChatGPT-style product in 45 minutes each without notes. Your product has real users."
  - **Week 13:** "You can teach each area of the fundamentals map in 3 minutes without notes. Your case study and
    demo video are published."
- **Daily recall** keeps everything warm. Release 2 adds the daily quiz and the weekly test.

## Saturdays, block by block (Grind)

| Block | Week 1 | Week 2 | Week 4 | Week 10 |
|---|---|---|---|---|
| DSA | slot 6: pattern 2, day B (unseen + explain-back) | slot 12: pattern 5, day B | slot 24: pattern 11, day B | slot 60: Phase 3 (timed set) |
| Recall + news | generated | generated | generated | generated |
| AI core | 6: attention and MLPs | 12: pretraining + GPT-3 | 24: cost and latency math | 60: AI feature rollout design |
| Product | LLD 1: OOP + SOLID | LLD 2: creational + structural patterns | LLD 4: concurrency + task scheduler | LLD 10 |
| Systems | 6: CAP, PACELC, SLOs | 12: HLD Bitly | 24: per the weeks 3–9 interleave | 60: per the Phase 3 interleave |
| Revision | as built | as built | as built | as built |
| Platform | 6: environments and config | 12: logs and an alert | 24: per the depth order | 60: per the depth order |
| Career | AI drill 1 | OA coding round 1 | OA coding round 2 (+ Sunday: behavioral peer mock) | Loop 1, round 1: coding (+ Sunday: LLD + AI design) |
| Frontend | timed rep 1 | timed rep 2 | timed rep 4 | timed rep 10 |

## Removed (so the plan has no noise)

- All Python and pandas tasks; the take-homes and practical reps are TypeScript.
- Hand-built data structures.
- All basic UI widget builds and the 36 UX lessons.
- The memo and open-source threads.
- The 75-minute Saturday revision merge.

## What stays exactly as built

Steady/Grind (with the new pairing), Monday start, routine and wake-up, labels, the DSA page, Sundays (rest/revision,
reads, scores, burnout guard), search, sync, the calendar file.

## Acceptance

- Every learning slot has 2–3 tasks (Understand, Do, Explain). Exceptions: timed reps, mocks, generated blocks, and
  the 6 machine-coding rehearsal reps (labelled "interview rehearsal").
- Every study day's DSA block names one pattern or DSA fundamental, **or is a timed mixed set (patterns hidden by
  design)**; in Steady, a DSA rest day is a generated pattern revisit.
- DSA and AI core never rest on the same Steady day.
- Platform slots 1–18 cover the DevOps basics, in order; auth and secrets come before Kubernetes and Terraform.
- Every flagship AI step has `after:` its AI-core item, and it lands on a later day in both modes.
- Every item in "Kept from the original roadmap" appears in the plan.
- Every v2 export is placed as in the table above, or listed there as dropped by owner choice.
- No task mentions Python or pandas or building a basic widget (the rehearsal reps excepted).
- Each of the 7 tracks has exactly 78 slots; nothing in a track's content is shortened.
- The AI core covers its 9 modules; Systems covers the 8 DDIA chapters and the 26 HLD designs; AI core holds the 8 AI
  designs; Platform covers each listed area with a hands-on step.

## Sources

- Chip Huyen, *AI Engineering*, table of contents: https://github.com/chiphuyen/aie-book/blob/main/ToC.md
- mlabonne/llm-course (LLM Engineer path): https://github.com/mlabonne/llm-course
- MIT, *The Missing Semester*: https://missing.csail.mit.edu/
- teachyourselfcs.com
- 2026 FDE postings (skills): https://www.masaischool.com/blog/forward-deployed-engineer-skills/
- The original v1 roadmap and its Whimsical board map (`main:src/lib/plan-data.js`, BOARD_MAP).
