# Roadmap v3: AI engineer, systems and product (content redesign)

Status: draft for the owner's approval (2026-11-15). Supersedes the *content* parts of the v2 spec
(`2026-11-15-roadmap-v2-content-design.md`). Everything already built for v2 stays: state, sync,
Steady/Grind modes, the routine (editable wake-up, bedtime moves), labels, the DSA page, Sundays,
scores, search, the engine and the layout. Only what each block teaches changes.

## The principle

AI already writes UI and boilerplate. In 2026 the engineer's job is to **understand, design, judge
and debug systems**. So the plan never spends time typing basics (widgets, hand-built data
structures, new languages). It spends time on:

1. **How AI systems work**, from neurons to production: enough theory to reason, enough building to
   be credible.
2. **How software systems work**: distributed systems, data, infrastructure, reliability.
3. **Product engineering**: shipping a real AI product with AI tools, making the architecture calls,
   reviewing what the AI wrote, measuring and iterating.
4. **Interviews**: DSA by pattern (light), system design, behavioral and forward-deployed engineer
   (FDE) rounds.

Role priority: AI engineer, then software engineer, then product engineer. Frontend is a light part
of product engineering: real-world topics only.

## Every block has three parts (as in v1)

Each study slot is **Understand → Do → Explain**, never a single line:
- **Understand**: one read/watch with one link (the best free source).
- **Do**: a small concrete exercise. TypeScript only; using an AI assistant is allowed and expected,
  but you must be able to explain every line it wrote.
- **Explain**: out loud or in notes, against a stated bar ("deep enough when you can…").

## Weekday (Grind times; Steady keeps the rotation; wake-up shifts everything)

| Time | Block (template key) | Track | What |
|---|---|---|---|
| 05:15–06:15 | dsa | DSA by pattern (1 h) | **Every study day has one pattern or DSA fundamental, never skipped**: the card, 1–2 problems, explain-back. 27 patterns × 2 must-solves (~54). After the patterns: one revisit or timed set per day. Optional pool stays on the DSA page only |
| 06:15–07:15 | aib | Recall + news (1 h) | 40 min spaced recall from memory (yesterday's AI topic + one systems topic from 3–7 days ago: explain without notes, then check) + 20 min AI news |
| 08:00–10:00 | fe | **AI engineering core** | The main track (below) |
| 10:15–11:45 | mc | **Product: the flagship** | Mon–Fri: build and run the flagship AI product with AI coding tools. Sat: low-level design |
| 13:00–14:30 | sd | **Systems and architecture** | HLD fundamentals, *Designing Data-Intensive Applications*, classic + AI system designs, mocks |
| 14:45–15:15 | rev | Revision | DSA re-solves (3/7/21 days) + recognition drill |
| 15:15–16:00 | jt | **Platform, data and DevOps** | Hands-on: SQL, caching, queues, Docker, Kubernetes, IaC, CI/CD, observability, security, cloud, FDE integration |
| 16:00–17:00 | beh | Career and FDE | Behavioral (STAR, Leadership Principles), client simulations, decomposition, product sense, applications |
| 20:00–21:00 | ai | **Frontend (real-world)** | One real-world frontend topic or frontend system design |
| 21:00–21:30 | review | Daily review | As today |

Sundays, readiness checks, the burnout guard and the prep day stay as built.

## Track contents (78 slots each)

### 1. AI engineering core (2 h, 78 slots) — follows Chip Huyen's *AI Engineering* and mlabonne's llm-course "Engineer" path
| Weeks | Module | Covers |
|---|---|---|
| 1–2 | How neural nets and LLMs work | Neurons, gradient descent, backprop (3Blue1Brown); tokenization and embeddings; attention and the transformer (Illustrated Transformer, the paper, Annotated Transformer); Karpathy's GPT from scratch (watch + read the code, no retyping); pretraining vs post-training; sampling (temperature, top-p); scaling laws |
| 3 | Using models well | LLM APIs and cost/latency math; structured output; prompting and context engineering; tool calling; MCP |
| 4–5 | Retrieval and RAG | Embeddings and vector indexes (HNSW), chunking, hybrid search, reranking, RAG evaluation, when RAG fails |
| 5–6 | Evaluation | Eval methodology, building eval sets from real failures, LLM-as-judge and its biases, eval gates in CI, traces |
| 6–7 | Agents | Workflows vs agents, ReAct, planning, memory, multi-agent, sandboxing and permissions, agent evals, A2A |
| 8 | Fine-tuning and data | When to fine-tune vs RAG vs prompt; LoRA/QLoRA, SFT vs DPO/RLHF; one real fine-tune via a hosted API; synthetic data and data quality |
| 9 | Inference and serving | KV cache, batching, quantization, speculative decoding; vLLM/Ollama; self-host vs API; latency and cost budgets |
| 10 | Production AI architecture | Gateways, routing, caching, guardrails, prompt/model versioning, feedback loops, observability, security (OWASP LLM Top 10) |
| 11–13 | Frontier + interview mode | Reasoning models, multimodal, key papers (GPT-3, InstructGPT, RAG, CoT, ReAct, LoRA, Constitutional AI); AI system design mocks; teach-backs |

### 2. Systems and architecture (1.5 h, 78 slots)
- HLD fundamentals: networking (DNS, HTTP, TLS), load balancing, caching, CDNs, databases, indexing, replication, partitioning, consistency, queues and streams, rate limiting, idempotency.
- *Designing Data-Intensive Applications*: 8 chapters (data models, storage, encoding, replication, partitioning, transactions, distributed-systems trouble, consistency and consensus), each with an explain-back.
- "How real systems work": 10 engineering-blog case studies (Stripe idempotency, Discord messages, Figma multiplayer, Uber, Netflix…).
- Delivery framework, then 23 classic HLD problems, core-first, each "draw it yourself, then compare".
- **8 AI system designs**: ChatGPT-style product, RAG over company docs, eval platform, coding-agent platform, LLM inference/serving platform, semantic search + recommendations, agent memory service, multi-tenant AI SaaS.
- Phase 3: timed mocks.

### 3. Platform, data and DevOps (45 min, 78 slots; hour-long items take 2 slots)
Every item is hands-on against your flagship, so it's real.
**Weeks 1–3 are the DevOps basics every product engineer needs** (in this order): the terminal and
shell you actually use (processes, ports, env vars, logs, ssh), git workflows (branches, rebase,
PR reviews, revert a bad deploy), environments and config (dev/staging/prod, `.env`, secrets),
deploying a web app (Vercel or Fly/Render), domains, DNS and HTTPS, a managed Postgres with backups
and migrations, feature flags, reading logs and setting an alert, uptime monitoring, and what it
costs. Then the depth:
SQL in depth (indexes, query plans, transactions, isolation), Postgres in practice, Redis, queues (SQS/Kafka concepts), Docker, Kubernetes (deployments, services, scaling), Terraform, CI/CD and safe rollouts, observability (logs, metrics, traces with OpenTelemetry), SLOs and incident response, auth (OAuth 2.0/OIDC, SSO), secrets, AWS core (IAM, VPC, compute, storage), cost, and FDE integration work (customer APIs, webhooks, ETL, data privacy/residency).

### 4. Product: the flagship (1.5 h)
One real AI product, built with AI coding tools, launched to real users. The work you do is the
engineer's part: architecture decisions written as short ADRs, reviewing every AI-written change,
data model, RAG/agents/evals in the product, performance, observability, launch, analytics and user
feedback, iteration. Two take-homes (weeks 7 and 10). Saturdays: low-level design (OOP, SOLID,
patterns, concurrency, 13 sessions + LLD mocks in Phase 3).
**No widget builds.** (Accordion, tabs, carousel and the like are dropped.)

### 5. Career and FDE (1 h)
Amazon Leadership Principles + STAR story bank (from the Whimsical board), deep dives on your
projects, FDE client simulations and decomposition reps, product-sense teardowns (6 companies),
negotiation (week 12), applications from week 8.

### 6. Frontend, real-world only (evening, ~45 min after news)
About 30 topics that come up in real product work and senior frontend interviews: rendering
strategies (SSR, streaming, RSC), performance and Core Web Vitals, caching (HTTP + client), state
architecture, real-time (WebSockets/SSE), offline and local-first, accessibility in practice,
frontend security (XSS, CSP, auth tokens), testing strategy, observability in the browser, and 12
frontend system designs. Then light revision. No JavaScript basics.

### 7. DSA (lighter, pattern-centric)
Keep the 27-pattern design and the DSA page, in a 1-hour morning block. **Rule: every study day
covers one pattern or DSA fundamental** (day 1: Big-O and recursion refresher; then a pattern every
1–2 days; after the patterns, one revisit, timed set or advanced-awareness slot per day). Must-solves
drop to 2 per pattern (~54). No hand-built data structures. The rest of NeetCode 150 stays in the
optional pool on the DSA page.

## Kept from the original roadmap (gap check against v1 and its Whimsical board)
Comparing this plan with the original v1 roadmap (`main`) and its BOARD_MAP, these must stay or come back:
- **Amazon OA**: the 16 OA posts as timed 70-min simulations in Phase 3 DSA, plus the work-simulation and work-style formats in the career block (week 1).
- **AI-enabled coding round** (Meta-style: use the AI tool, verify, narrate): 5 drills, Saturdays in odd weeks 1–9, in the flagship block.
- **Google plain-doc sets** (no autocomplete) and **Meta speed sets** in Phase 3 DSA.
- **Weekly mocks**: Saturday career block = mock day (coding → system design → behavioral → AI design, rotating); peer mocks (Exponent, free) every 2 weeks from week 4; Phase 3 = full mock loops on Saturdays. One paid mock before the first big-tech onsite.
- **All 26 HLD designs from the board** (v2 had 23: add the 3 missing), the "concepts to master + common mistakes" card and the delivery framework.
- **Advanced DSA awareness**: 3 recognition-only slots in Phase 3 (difference array + line sweep; Fenwick + segment tree; DP on trees + digit DP): know when it applies, solve 1.
- **Success rules**: think out loud, 45-min time-box, flag and re-solve.
- **Product engineering basics** (v1's product & UX lessons, compressed): metrics and analytics instrumentation, A/B tests, feature flags, user research in 30 min, writing a one-page product brief — 6 slots in the career block.
- **Frontend machine-coding interviews**: no widget learning, but 6 timed rehearsal reps in Phase 3 (autocomplete, data table, infinite feed, file tree, modal + focus trap, nested comments), 45 min each with AI off, because Google/Meta frontend loops still ask them.
- **FDE roadmap (roadmap.sh, 8 stages)**: all covered across tracks except its Python stage (dropped by owner choice).

## Fundamentals coverage map (no blank areas)

Goal: after 13/17 weeks the owner has at least a working overview of every fundamental area (not
mastery everywhere), and depth where interviews and the AI-engineer job demand it. Checked against
teachyourselfcs.com's 9 core CS subjects, MIT's *Missing Semester* (practical tools), Chip Huyen's
*AI Engineering* and mlabonne's llm-course.

| Area | Where it's covered | Depth by the end |
|---|---|---|
| Programming and software design | Flagship (ADRs, code review of AI output), LLD Saturdays (OOP, SOLID, patterns), + 3 slots: architecture styles (monolith/modular/microservices, layering), testing strategy (pyramid, contract, e2e, evals as tests), refactoring and code smells | Solid |
| Computer architecture | Systems weeks 1–2, "How computers work": CPU, memory hierarchy and caches, why latency numbers matter (numbers card) | Overview |
| Algorithms and data structures | DSA every day (27 patterns), complexity reasoning | Interview-ready |
| Math for CS and ML | AI core week 1: vectors, dot products, matrices, probability and gradients (intuition, 3Blue1Brown); classical ML overview (supervised/unsupervised, train/test split, overfitting, precision/recall/F1); stats for A/B tests in product basics | Overview, enough for AI work |
| Operating systems and concurrency | Systems weeks 1–2: processes vs threads, scheduling, memory and virtual memory, file systems and I/O, concurrency (locks, races, async vs threads, the event loop); LLD concurrency (thread pool) | Overview + interview level |
| Networking | Systems weeks 1–2: TCP/IP, UDP, DNS, HTTP/1.1–2–3, TLS, WebSockets; Platform DNS/HTTPS hands-on | Solid |
| Databases | DDIA chapters, SQL in depth (indexes, plans, transactions, isolation), Postgres + Redis hands-on, NoSQL trade-offs | Solid |
| Languages and runtimes | Systems week 2: how code runs (compilers vs interpreters vs JIT, the JS engine and V8, garbage collection, type systems in one slot) | Overview |
| Distributed systems | DDIA (replication, partitioning, consistency, consensus), 26 HLD designs, case studies | Solid |
| Security | Platform: hashing vs encryption, TLS, OAuth/OIDC/JWT, secrets, OWASP Web Top 10; AI core: OWASP LLM Top 10, prompt injection | Overview + practical |
| Practical tools (*Missing Semester*) | Platform weeks 1–3: shell, git, environments, debugging with logs | Practical |
| DevOps and cloud | Platform: deploy, DNS, Postgres ops, feature flags, monitoring, Docker, Kubernetes, Terraform, CI/CD, OpenTelemetry, SLOs, AWS core, cost | Practical |
| Data engineering | Platform: ETL vs ELT, batch vs streaming, warehouse vs lake, data quality (2 slots) + AI dataset engineering | Overview |
| AI: how models work | AI core weeks 1–2 (neural nets → transformers → LLM training) | Solid overview |
| AI: building with models | AI core weeks 3–10 (APIs, RAG, evals, agents, fine-tuning, serving, production architecture) | Job-ready |
| Product engineering | Flagship end to end, product basics (metrics, A/B, flags, research, briefs), teardowns | Practical |
| Frontend (real-world) | Evening track + frontend system design | Interview-ready, no basics |
| Interviews | DSA, system design, LLD, behavioral/Leadership Principles, FDE rounds, mocks every Saturday, Amazon OA | Interview-ready |

## Assessments (rewritten for v3)
- **Prep-day baseline** (0–100, self-scored): AI engineering, systems, platform/DevOps, DSA, product.
- **Weekly self-check** every Sunday on the same five sections; Progress shows the trend.
- **Readiness checks** (weeks 4, 8, 10, 12, 13), concrete bars, e.g.:
  - week 4: explain from memory how a transformer produces the next token, and why RAG retrieves the wrong chunk; deploy your product with a domain, HTTPS and a database backup;
  - week 8: design RAG over company docs in 45 min with evals and permissions; 20 of 27 patterns passed their unseen check; your product has traces and one alert;
  - week 10: an agent with tool permissions and an eval suite in your product; one fine-tune vs RAG decision written up with numbers;
  - week 12: two full mock loops passed (coding, system design, AI design, behavioral);
  - week 13: you can teach each fundamentals-map area in 3 minutes without notes.
- **Daily recall** (morning) keeps everything above warm. Release 2 adds the daily quiz and weekly test.

## Removed (so the plan has no noise)
- All Python and pandas tasks; take-homes are TypeScript.
- Hand-built data structures in week 1.
- All basic UI widget builds and the 36 UX lessons (product sense lives in the career block).
- The daily memo/OSS judgment thread (decisions become ADRs in the flagship; how-it-works reads move to Systems).

## What stays exactly as built
Steady/Grind, Monday start, routine and wake-up, labels, the DSA page, Sundays (rest/revision, reads,
scores, burnout guard), search, sync, the calendar file.

## Acceptance
- Every study block has 2–3 tasks (Understand, Do, Explain).
- Every study day's DSA block names one pattern or DSA fundamental.
- Platform weeks 1–3 cover the product-engineer DevOps basics listed above.
- Every item in "Kept from the original roadmap" appears in the plan.
- No task mentions Python, pandas or building a basic widget.
- Each track has exactly 78 slots; nothing in a track's content is shortened.
- The AI core covers all 9 modules above; Systems covers the 8 DDIA chapters and 8 AI designs;
  Platform covers each listed area at least once with a hands-on step.

## Sources
- Chip Huyen, *AI Engineering*, table of contents: https://github.com/chiphuyen/aie-book/blob/main/ToC.md
- mlabonne/llm-course (LLM Engineer path): https://github.com/mlabonne/llm-course
- 2026 FDE postings (skills): https://www.masaischool.com/blog/forward-deployed-engineer-skills/
- The original v1 roadmap and its Whimsical board map (`main:src/lib/plan-data.js`, BOARD_MAP).
