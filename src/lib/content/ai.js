/* eslint-disable */
// AI content (roadmap v2 §7, §8, §13): the evening hour (AI_EVENING) and the 06:45 30-min AI-build track (AIB).
// Old AI_UNITS days keep `unit` and `day` (their 0-based day index in the old 61-day AI_UNITS run) so Task 5 can sequence them
// and plan-data.js can rebuild the old shape for engine.ts. New items have no `day`; depth reads carry `after` (the item they follow).
// Item shape: { id, text, url?, mins?, depth?, slots? } plus extra keys. IDs are content-based (<prefix>:<slug>) and must never change.

export const AIB_MOVED = [
  { id: 'aib:python-for-js', text: 'Stage 2 · Python for JS devs (the go-to FDE language): dicts, comprehensions, classes, files, JSON, CSV', url: 'https://docs.python.org/3/tutorial/', slots: 2 },
  { id: 'aib:pandas', text: 'Stage 2 · Python for data: pandas (load, filter, group, join)', url: 'https://pandas.pydata.org/docs/user_guide/10min.html', slots: 2 },
  { id: 'aib:aws', text: 'Stage 6 · AWS essentials: IAM, EC2, S3, Lambda, VPC basics', url: 'https://roadmap.sh/aws', slots: 2 },
  { id: 'aib:terraform', text: 'Stage 6 · Terraform: deploy a small app as infrastructure as code', url: 'https://developer.hashicorp.com/terraform/tutorials/aws-get-started', slots: 2 },
  { id: 'aib:containers', text: 'Stage 6 · Containers: Dockerize your flagship project; Kubernetes pods, deployments, services', url: 'https://kubernetes.io/docs/tutorials/kubernetes-basics/', slots: 2 },
  { id: 'aib:devops', text: 'Stage 6 · DevOps: CI/CD, environments, secrets, rollbacks. Add a deploy pipeline to your flagship project.', url: 'https://roadmap.sh/devops', slots: 2 },
];

// Evening AI hour: the paper, course and reading days of the old AI_UNITS at their old days, plus the §13 depth reads.
// The hands-on build steps (the `Build ·` units and the build steps inside "Paper · … + build" units) moved to AIB (§7).
// Depth items (§13 area 3: retrieval, evals, tool and agent loops, cost and latency, failure handling) end with an explain-back;
// an old-day item whose text gained one keeps its exact old text in `oldText` (provenance only; checked by test-content).
export const AI_EVENING = [
  { id: 'ai:3b1b-neural-network', text: 'Ch 1: What is a neural network?', url: 'https://www.youtube.com/watch?v=aircAruvnKk', unit: 'Neural network basics · 3Blue1Brown', day: 0 },
  { id: 'ai:3b1b-gradient-descent', text: 'Ch 2: Gradient descent, how networks learn', url: 'https://www.youtube.com/watch?v=IHZwWFHWa-w', unit: 'Neural network basics · 3Blue1Brown', day: 1 },
  { id: 'ai:3b1b-backprop', text: 'Ch 3: Backpropagation, intuitively', url: 'https://www.youtube.com/watch?v=Ilg3gGewQ5U', unit: 'Neural network basics · 3Blue1Brown', day: 2 },
  { id: 'ai:3b1b-backprop-calculus', text: 'Ch 4: Backpropagation calculus. Write a 5-line summary of all 4 chapters.', url: 'https://www.youtube.com/watch?v=tIeHLnjs5U8', unit: 'Neural network basics · 3Blue1Brown', day: 3 },
  { id: 'ai:3b1b-transformers', text: 'Ch 5: Transformers, the tech behind LLMs (tokens, embeddings)', url: 'https://www.youtube.com/watch?v=wjZofJX0v4M', unit: 'Transformers, visually · 3Blue1Brown', day: 4 },
  { id: 'ai:3b1b-attention', text: 'Ch 6: Attention in transformers', url: 'https://www.youtube.com/watch?v=eMlx5fFNoYc', unit: 'Transformers, visually · 3Blue1Brown', day: 5 },
  { id: 'ai:3b1b-mlp-facts', text: 'Ch 7: How LLMs might store facts (MLP layers)', url: 'https://www.youtube.com/watch?v=9-Jl0dxWQs8', unit: 'Transformers, visually · 3Blue1Brown', day: 6 },
  { id: 'ai:attention-illustrated', text: 'Read the Illustrated Transformer first, then the paper\'s abstract, intro and Figure 1', url: 'https://jalammar.github.io/illustrated-transformer/', unit: 'Paper · Attention Is All You Need (2017)', day: 7 },
  { id: 'ai:attention-paper-attention', text: 'Paper §3.1–3.2: encoder/decoder stacks, scaled dot-product + multi-head attention', url: 'https://arxiv.org/abs/1706.03762', unit: 'Paper · Attention Is All You Need (2017)', day: 8 },
  { id: 'ai:attention-paper-embeddings', text: 'Paper §3.3–3.5: feed-forward layers, embeddings, positional encoding', url: 'https://arxiv.org/abs/1706.03762', unit: 'Paper · Attention Is All You Need (2017)', day: 9 },
  { id: 'ai:attention-annotated-code', text: 'Skim the Annotated Transformer code; write a 1-page summary and explain it out loud in 3 min', url: 'https://nlp.seas.harvard.edu/annotated-transformer/', unit: 'Paper · Attention Is All You Need (2017)', day: 10 },
  { id: 'ai:karpathy-gpt-bigram', text: 'Part 1 (0:00–0:40): data, tokenization, bigram model. Code along.', url: 'https://www.youtube.com/watch?v=kCc8FmEb1nY', unit: 'Course · Karpathy: Let\'s build GPT from scratch', day: 11 },
  { id: 'ai:karpathy-gpt-self-attention', text: 'Part 2 (0:40–1:20): self-attention from scratch. Code along.', url: 'https://www.youtube.com/watch?v=kCc8FmEb1nY', unit: 'Course · Karpathy: Let\'s build GPT from scratch', day: 12 },
  { id: 'ai:karpathy-gpt-training', text: 'Part 3 (1:20–end): multi-head attention, blocks, training. Push your notebook.', url: 'https://www.youtube.com/watch?v=kCc8FmEb1nY', unit: 'Course · Karpathy: Let\'s build GPT from scratch', day: 13 },
  { id: 'ai:karpathy-llm-pretraining', text: 'Pretraining: data, tokens, the base model', url: 'https://www.youtube.com/watch?v=7xTGNNLPyMI', unit: 'Course · Karpathy: Deep dive into LLMs like ChatGPT', day: 14 },
  { id: 'ai:karpathy-llm-post-training', text: 'Post-training: SFT, hallucinations, tool use', url: 'https://www.youtube.com/watch?v=7xTGNNLPyMI', unit: 'Course · Karpathy: Deep dive into LLMs like ChatGPT', day: 15 },
  { id: 'ai:karpathy-llm-rl-reasoning', text: 'Reinforcement learning, reasoning models, what is coming. Summarize in AI notes.', url: 'https://www.youtube.com/watch?v=7xTGNNLPyMI', unit: 'Course · Karpathy: Deep dive into LLMs like ChatGPT', day: 16 },
  { id: 'ai:gpt3-in-context', text: 'Abstract, intro, Figure 1.1–1.3: what in-context learning means', url: 'https://arxiv.org/abs/2005.14165', unit: 'Paper · GPT-3: Language Models are Few-Shot Learners (2020)', day: 20 },
  { id: 'ai:gpt3-approach', text: '§2 Approach + skim §3 results tables', url: 'https://arxiv.org/abs/2005.14165', unit: 'Paper · GPT-3: Language Models are Few-Shot Learners (2020)', day: 21 },
  { id: 'ai:gpt3-limitations', text: '§5 Limitations + §6 Broader impacts. Write 5 bullets.', url: 'https://arxiv.org/abs/2005.14165', unit: 'Paper · GPT-3: Language Models are Few-Shot Learners (2020)', day: 22 },
  { id: 'ai:instructgpt-pipeline', text: 'Abstract, intro, Figure 2 (the 3-step RLHF pipeline)', url: 'https://arxiv.org/abs/2203.02155', unit: 'Paper · InstructGPT: training with human feedback (RLHF, 2022)', day: 23 },
  { id: 'ai:instructgpt-methods', text: '§3 Methods: SFT, reward model, PPO', url: 'https://arxiv.org/abs/2203.02155', unit: 'Paper · InstructGPT: training with human feedback (RLHF, 2022)', day: 24 },
  { id: 'ai:instructgpt-results', text: '§4 Results + §5 Discussion. Explain RLHF in 2 minutes out loud.', url: 'https://arxiv.org/abs/2203.02155', unit: 'Paper · InstructGPT: training with human feedback (RLHF, 2022)', day: 25 },
  { id: 'ai:rag-paper', text: 'Read the RAG paper: abstract, §2 methods, Figure 1', url: 'https://arxiv.org/abs/2005.11401', unit: 'Paper · RAG: Retrieval-Augmented Generation (2020) + build', day: 29 },
  { id: 'ai:contextual-retrieval', depth: true, text: 'Read Contextual Retrieval: why chunking and reranking matter. Explain back how bad chunking leads to a wrong answer.', oldText: 'Read Contextual Retrieval: why chunking and reranking matter', url: 'https://www.anthropic.com/news/contextual-retrieval', unit: 'Paper · RAG: Retrieval-Augmented Generation (2020) + build', day: 30 },
  { id: 'ai:cot-paper', text: 'Read the CoT paper: abstract, Figures 1–4', url: 'https://arxiv.org/abs/2201.11903', unit: 'Paper · Chain-of-Thought Prompting (2022) + reasoning models', day: 32 },
  { id: 'ai:extended-thinking', text: 'Extended thinking / reasoning models: when they help, what they cost', url: 'https://docs.anthropic.com/en/docs/build-with-claude/extended-thinking', unit: 'Paper · Chain-of-Thought Prompting (2022) + reasoning models', day: 33 },
  { id: 'ai:react-paper', text: 'Read ReAct: reasoning + acting loop, Figure 1', url: 'https://arxiv.org/abs/2210.03629', unit: 'Paper · ReAct (2022) + building agents', day: 34 },
  { id: 'ai:building-effective-agents', depth: true, text: 'Read Building Effective Agents: the 5 workflow patterns. Explain back when a fixed workflow beats an agent, and its cost.', oldText: 'Read Building Effective Agents: the 5 workflow patterns', url: 'https://www.anthropic.com/engineering/building-effective-agents', unit: 'Paper · ReAct (2022) + building agents', day: 35 },
  { id: 'ai:evals-hamel', depth: true, text: 'Read Hamel Husain on evals: why and how. Explain back how evals and traces would find why an AI feature sometimes gives wrong answers.', oldText: 'Read Hamel Husain on evals: why and how', url: 'https://hamel.dev/blog/posts/evals/', unit: 'Evals · testing LLM features', day: 39 },
  // §13 row 3 depth reads (URLs and applied-llms anchor ids checked 2026-11-15).
  { id: 'ai:depth-applied-llms-tactical', after: 'ai:evals-hamel', depth: true, text: 'What We\'ve Learned From A Year of Building with LLMs, part 1 (tactical): prompting, RAG, workflows, evals and monitoring. Explain back the 3 lessons that would change your RAG bot.', url: 'https://applied-llms.org/#tactical-nuts-bolts-of-working-with-llms' },
  { id: 'ai:depth-applied-llms-ops-strategy', after: 'ai:depth-applied-llms-tactical', depth: true, text: 'What We\'ve Learned From A Year of Building with LLMs, parts 2–3 (operational and strategic): data, working with models, product, team roles, when to build. Explain back how you would ship and watch an AI feature.', url: 'https://applied-llms.org/#operational-day-to-day-and-org-concerns' },
  { id: 'ai:depth-eugene-yan-llm-patterns', after: 'ai:depth-applied-llms-ops-strategy', depth: true, text: 'Eugene Yan, Patterns for Building LLM-based Systems & Products: evals, RAG, fine-tuning, caching, guardrails, defensive UX, user feedback. Explain back which pattern fixes an AI feature that sometimes gives wrong answers.', url: 'https://eugeneyan.com/writing/llm-patterns/' },
  { id: 'ai:scaling-laws', text: 'Scaling laws: abstract + Figure 1. What grows with compute?', url: 'https://arxiv.org/abs/2001.08361', unit: 'Papers · Scaling laws (2020) + Chinchilla (2022)', day: 42 },
  { id: 'ai:chinchilla', text: 'Chinchilla: compute-optimal training, Figure 1 + conclusions', url: 'https://arxiv.org/abs/2203.15556', unit: 'Papers · Scaling laws (2020) + Chinchilla (2022)', day: 43 },
  { id: 'ai:scaling-write-up', text: 'Write: why models keep getting better and what limits them (5 bullets)', unit: 'Papers · Scaling laws (2020) + Chinchilla (2022)', day: 44 },
  { id: 'ai:lora', text: 'LoRA: abstract, Figure 1, §4 method', url: 'https://arxiv.org/abs/2106.09685', unit: 'Paper · LoRA (2021) + when to fine-tune', day: 45 },
  { id: 'ai:prompt-rag-finetune', text: 'Prompting vs RAG vs fine-tuning: decision table with 3 examples', url: 'https://platform.openai.com/docs/guides/optimizing-llm-accuracy', unit: 'Paper · LoRA (2021) + when to fine-tune', day: 46 },
  { id: 'ai:constitutional-ai', text: 'Constitutional AI: abstract, Figure 1, the critique-revise loop', url: 'https://arxiv.org/abs/2212.08073', unit: 'Paper · Constitutional AI (2022) + AI security', day: 47 },
  { id: 'ai:owasp-llm', text: 'OWASP Top 10 for LLM apps: prompt injection, data leakage', url: 'https://owasp.org/www-project-top-10-for-large-language-model-applications/', unit: 'Paper · Constitutional AI (2022) + AI security', day: 48 },
  { id: 'ai:lost-in-the-middle', text: 'Lost in the Middle: how models use long context', url: 'https://arxiv.org/abs/2307.03172', unit: 'Paper · Lost in the Middle (2023) + cost and latency', day: 50 },
  { id: 'ai:prompt-caching-cost', depth: true, text: 'Prompt caching, model choice, cost estimate for 10k users. Explain back where the cost and latency go, with numbers.', oldText: 'Prompt caching, model choice, cost estimate for 10k users', url: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching', unit: 'Paper · Lost in the Middle (2023) + cost and latency', day: 51 },
  { id: 'ai:design-ai-chat', text: 'Design an AI chat product at scale: streaming, rate limits, queues, caching', unit: 'Design · System design for AI products', day: 55 },
  { id: 'ai:design-rag-scale', text: 'Design RAG at scale: ingestion pipeline, re-indexing, permissions, evals', unit: 'Design · System design for AI products', day: 56 },
  { id: 'ai:design-ai-rollout', text: 'Design an AI feature rollout: eval gates, feature flags, fallbacks', unit: 'Design · System design for AI products', day: 57 },
  { id: 'ai:ai-build-post', text: 'Write a short post about something you built with AI', url: 'https://www.linkedin.com/', unit: 'Working with AI coding tools', day: 60 },
  // §13 row 1: DDIA, one evening per chapter (the AI block, or the FE block once its topics run out). Book site checked 2026-11-15.
  { id: 'ai:depth-ddia-data-models', after: 'ai:ai-build-post', depth: true, text: 'Designing Data-Intensive Applications: data models and query languages (relational, document, graph). Explain back when you would pick a document store over Postgres, and what it costs.', url: 'https://dataintensive.net/' },
  { id: 'ai:depth-ddia-storage-indexes', after: 'ai:depth-ddia-data-models', depth: true, text: 'Designing Data-Intensive Applications: storage and retrieval (log-structured vs B-tree indexes, OLTP vs OLAP). Explain back why writes are faster in an LSM tree and reads in a B-tree.', url: 'https://dataintensive.net/' },
  { id: 'ai:depth-ddia-replication', after: 'ai:depth-ddia-storage-indexes', depth: true, text: 'Designing Data-Intensive Applications: replication (leader-follower, multi-leader, leaderless, replication lag). Explain back the stale-read bug a user sees after an update, and its fix.', url: 'https://dataintensive.net/' },
  { id: 'ai:depth-ddia-transactions', after: 'ai:depth-ddia-replication', depth: true, text: 'Designing Data-Intensive Applications: transactions (isolation levels, lost updates, write skew, serializability). Explain back the race condition in a double-booking and the cheapest fix.', url: 'https://dataintensive.net/' },
];

// 06:45 AI-build track (30-min slots). Hour-sized items (`slots: 2`) take 2 consecutive slots (§8); nothing is shortened.
// Python is first (week 1, §8). The 6 new hands-on days are slot-sized. URLs of the new items checked 2026-11-15.
// Ordered so each item comes after what it builds on; `after` names the prerequisite (an AIB item, or an AI_EVENING reading
// that falls on an earlier study day). `day` on a moved item is its old AI_UNITS evening day, not its AIB position.
export const AIB = [
  AIB_MOVED[0], // aib:python-for-js
  AIB_MOVED[1], // aib:pandas
  { id: 'aib:llm-api-fundamentals', title: 'LLM API fundamentals', depth: true, text: 'LLM API fundamentals: tokens and cost, temperature/top-p, context limits, stop reasons, rate limits, retries. Log tokens and cost for 10 calls. Explain back why a call stopped early or cost twice what you expected.', url: 'https://platform.claude.com/docs/en/build-with-claude/working-with-messages', slots: 1 },
  { id: 'aib:stream-tokens-react', text: 'Call an LLM API from TypeScript; then stream tokens into a React component', url: 'https://docs.anthropic.com/en/docs/build-with-claude/streaming', unit: 'Build · Talking to models from code', day: 17, slots: 2 },
  { id: 'aib:structured-output-zod', after: 'aib:stream-tokens-react', text: 'Structured output: JSON schema + Zod validation', url: 'https://zod.dev/', unit: 'Build · Talking to models from code', day: 18, slots: 2 },
  { id: 'aib:prompting-rewrite', text: 'Prompting properly: clear instructions, examples, XML structure. Rewrite 3 prompts.', url: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview', unit: 'Build · Talking to models from code', day: 19, slots: 2 },
  { id: 'aib:tool-call-loop', depth: true, text: 'Tool use / function calling: build the tool-call loop. Explain back what your loop does when a tool errors or the model calls the wrong tool.', oldText: 'Tool use / function calling: build the tool-call loop', url: 'https://docs.anthropic.com/en/docs/build-with-claude/tool-use/overview', unit: 'Build · Tools and embeddings', day: 26, slots: 2 },
  { id: 'aib:mcp-server', after: 'aib:tool-call-loop', text: 'Model Context Protocol: build a tiny MCP server with one tool', url: 'https://modelcontextprotocol.io/introduction', unit: 'Build · MCP + AI SDK', day: 37, slots: 2 },
  { id: 'aib:ai-sdk-react', text: 'Vercel AI SDK: useChat, streaming, tool calls in React', url: 'https://ai-sdk.dev/docs/introduction', unit: 'Build · MCP + AI SDK', day: 38, slots: 2 },
  { id: 'aib:embeddings-neighbours', text: 'Embeddings + cosine similarity: embed 50 sentences, find neighbours', url: 'https://platform.openai.com/docs/guides/embeddings', unit: 'Build · Tools and embeddings', day: 27, slots: 2 },
  { id: 'aib:pgvector', after: 'aib:embeddings-neighbours', text: 'Vector storage with Postgres + pgvector', url: 'https://github.com/pgvector/pgvector', unit: 'Build · Tools and embeddings', day: 28, slots: 2 },
  AIB_MOVED[2], // aib:aws
  AIB_MOVED[3], // aib:terraform
  AIB_MOVED[4], // aib:containers
  AIB_MOVED[5], // aib:devops
  { id: 'aib:multimodal-upload', text: 'Multimodal: let users upload a screenshot and ask about it', url: 'https://docs.anthropic.com/en/docs/build-with-claude/vision', unit: 'Build · Production AI features', day: 53, slots: 2 },
  { id: 'aib:rag-build-notes', after: 'ai:contextual-retrieval', depth: true, text: 'Build RAG over your own Notes with citations. Explain back how a wrong citation can happen and how you would find its cause.', oldText: 'Build RAG over your own Notes with citations', unit: 'Paper · RAG: Retrieval-Augmented Generation (2020) + build', day: 31, slots: 2 },
  { id: 'aib:retrieval-chunking-hybrid', title: 'Retrieval that works', after: 'aib:rag-build-notes', depth: true, text: 'Retrieval that works · day 1/2: chunking strategies, hybrid search (BM25 plus vectors), reranking. Try 2 chunk sizes and add BM25 to your RAG. Explain back when BM25 beats vectors and what reranking costs in latency.', url: 'https://www.pinecone.io/learn/chunking-strategies/', slots: 1 },
  { id: 'aib:retrieval-hnsw-recall', title: 'Retrieval that works', after: 'aib:retrieval-chunking-hybrid', depth: true, text: 'Retrieval that works · day 2/2: HNSW and vector-index trade-offs; measure recall@k on your own RAG before and after the day-1 changes. Explain back your recall@k numbers and the index trade-off behind them.', url: 'https://www.pinecone.io/learn/series/faiss/hnsw/', slots: 1 },
  { id: 'aib:transformers-js', text: 'AI in the browser: run a small model with transformers.js', url: 'https://huggingface.co/docs/transformers.js/index', unit: 'Build · Production AI features', day: 54, slots: 2 },
  { id: 'aib:react-build-agent', after: 'ai:building-effective-agents', depth: true, text: 'Build a small agent with 2 tools; log every step. Explain back, from the log, how your agent fails when one step goes wrong.', oldText: 'Build a small agent with 2 tools; log every step', unit: 'Paper · ReAct (2022) + building agents', day: 36, slots: 2 },
  { id: 'aib:agents-sdk-build', title: 'Agents in production', after: 'aib:react-build-agent', depth: true, text: 'Agents in production · day 1/2: build an agent with an agent SDK (Claude Agent SDK or OpenAI Agents SDK), with 2 tools and a trace of every step. Explain back how you would debug a run that went off course, from its trace.', url: 'https://code.claude.com/docs/en/agent-sdk/overview', slots: 1 },
  { id: 'aib:agents-long-running', title: 'Agents in production', after: 'aib:agents-sdk-build', depth: true, text: 'Agents in production · day 2/2: long-running jobs, context compaction, sandboxing, human approval before risky tool calls. Add one approval step to your agent. Explain back what compaction drops and what can go wrong after it.', url: 'https://www.anthropic.com/research/effective-harnesses-for-long-running-agents', slots: 1 },
  { id: 'aib:evals-test-cases', after: 'ai:evals-hamel', depth: true, text: 'Write 20 test cases for your RAG bot + a pass-rate script. Explain back what one failing case tells you and how you would fix it, with the pass rate before and after.', oldText: 'Write 20 test cases for your RAG bot + a pass-rate script', unit: 'Evals · testing LLM features', day: 40, slots: 2 },
  { id: 'aib:evals-llm-judge', after: 'aib:evals-test-cases', depth: true, text: 'LLM-as-judge: add a grader, check it against your own labels. Explain back where your grader disagrees with your labels and why.', oldText: 'LLM-as-judge: add a grader, check it against your own labels', unit: 'Evals · testing LLM features', day: 41, slots: 2 },
  { id: 'aib:llm-observability', after: 'aib:evals-llm-judge', depth: true, text: 'LLM observability: trace prompts, latency, user feedback. Explain back how a trace shows the cause of a wrong answer.', oldText: 'LLM observability: trace prompts, latency, user feedback', url: 'https://langfuse.com/docs', unit: 'Build · Production AI features', day: 52, slots: 2 },
  { id: 'aib:ai-assisted-feature', text: 'Build a feature with an AI assistant; review every line; note what it got wrong', url: 'https://docs.anthropic.com/en/docs/claude-code/overview', unit: 'Working with AI coding tools', day: 58, slots: 2 },
  { id: 'aib:prompt-injection-attack', after: 'ai:owasp-llm', depth: true, text: 'Attack your own app with 5 injections; fix 2. Explain back why your 2 fixes work and what still gets through.', oldText: 'Attack your own app with 5 injections; fix 2', unit: 'Paper · Constitutional AI (2022) + AI security', day: 49, slots: 2 },
  { id: 'aib:ai-assisted-coding-round', text: 'AI-assisted coding round practice: solve a machine-coding task with AI, narrating decisions', unit: 'Working with AI coding tools', day: 59, slots: 2 },
  { id: 'aib:llm-gateway', title: 'LLM gateway', after: 'ai:prompt-caching-cost', depth: true, text: 'LLM gateway: fallbacks and routing, prompt and semantic caching, timeouts, a cost budget. Put a gateway in front of your app with one fallback model. Explain back what your app does when the main model times out, and what that costs.', url: 'https://docs.litellm.ai/docs/proxy/reliability', slots: 1 },
];

// After the evening items run out: explain-it-back revision.
export const AI_REVIEW = [
  ['transformers', 'Transformers and attention'], ['rlhf', 'RLHF'], ['rag', 'RAG'], ['agents', 'Agents and tool use'],
  ['evals', 'Evals'], ['scaling-laws', 'Scaling laws'], ['finetune-vs-rag', 'Fine-tuning vs RAG'], ['prompt-injection', 'Prompt injection'],
].map(([slug, t]) => ({ id: `ai:review-${slug}`, text: `Explain it back, 3 min out loud, then write 3 flashcards: ${t}` }));

// AI news sources (moved from plan-data.js unchanged; not in the daily plan).
export const AI_NEWS = [
  { id: 'news:tldr-ai', text: 'TLDR AI', url: 'https://tldr.tech/ai' },
  { id: 'news:simon-willison', text: "Simon Willison's blog", url: 'https://simonwillison.net/' },
  { id: 'news:the-batch', text: 'The Batch', url: 'https://www.deeplearning.ai/the-batch/' },
  { id: 'news:hacker-news', text: 'Hacker News', url: 'https://news.ycombinator.com/' },
  { id: 'news:lmarena', text: 'LMArena leaderboard (how models compare)', url: 'https://lmarena.ai/leaderboard' },
  { id: 'news:artificial-analysis', text: 'Artificial Analysis (speed, price, quality)', url: 'https://artificialanalysis.ai/' },
  { id: 'news:latent-space', text: 'Latent Space', url: 'https://www.latent.space/' },
];
