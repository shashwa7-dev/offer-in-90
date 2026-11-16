# Roadmap v2 · Release 3 (AI with your own key, hot reads) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Load the `claude-api` skill before writing any Anthropic code.

**Prerequisite:** R1 and R2 are merged.

**Goal:**
- **AI help on the user's own key:**
  - "Ask AI" on any task, pattern card, quiz item or Notes page;
  - 4 providers;
  - 3 personas;
  - save answers to notes, and bookmark them.
- **A strict Content-Security-Policy.**
- **Hot reads:** the weekly engine also picks 1–2 trending reads for Sunday, within the existing per-run budget, with a weekly lock.

**Architecture:**
- **Browser side:**
  - a small provider-adapter layer (`src/lib/ai/`), with one interface for every provider;
  - keys stay in browser storage, never in `State`;
  - persona prompts come verbatim from the spec appendix.
- **Engine side** follows the existing pattern: a no-AI collector (`collect-reads.mjs`), then a new section in the Claude Code prompt, then a validator, then a commit, all inside `refresh-engine.yml`.

**Tech Stack:** As R1, plus:
- `@anthropic-ai/sdk`;
- `openai` (used for OpenAI and for OpenRouter's documented OpenAI-compatible endpoint);
- `@google/genai`.

Pin versions that were released at least 2 weeks ago.

**Spec:** §15 (BYOK, keys, CSP, engine stays on the owner's secret), §17 (hot reads, budget order, weekly lock), Appendix (personas).

## Global Constraints

- **In-app AI only uses the user's own key.**
  - The app ships with no key and never calls an AI with one of ours.
  - With no key saved, every AI action shows "Add your API key in Setup to use AI help" and nothing else changes (§15).
- **Key storage:**
  - Keys live in `localStorage` (or `sessionStorage` when "Remember on this device" is off), under `offer90.keys`.
  - **Never** in `State`, the Gist, logs, error messages, the repo or the build.
  - After saving, only the last 4 characters are shown (§15).
- **Anthropic defaults** (from the `claude-api` skill, verify against it):
  - model `claude-opus-5-5`, effort `medium` via `output_config.effort`, thinking left at its adaptive default (omit `thinking`);
  - streaming;
  - check `stop_reason` before reading content, and handle `refusal` with a plain message;
  - server-side fallbacks `fallbacks: "default"` under beta `server-side-fallback-2026-07-01`, and tell the user they're on;
  - `cache_control` on the stable system prompt;
  - typed SDK errors;
  - no `temperature`, `top_p` or `budget_tokens`.
  - Cheaper picks: `claude-sonnet-5-5`, `claude-haiku-5-5`.
- **Other providers:**
  - use each one's official SDK and current model IDs, checked against the provider's docs at build time;
  - the browser-use option of each SDK is confirmed in its docs before wiring.
- **Persona prompts** are copied verbatim from the spec appendix: a shared base plus 1 of 3.
- **Saved and bookmarked answers** keep the persona, the item ID and the date. Unsaved conversations aren't stored (§15).
- **The weekly engine** keeps `CLAUDE_CODE_OAUTH_TOKEN`. The per-run cap is the owner's `ENGINE_BUDGET_USD` (0.50). The job order is links → plan updates → interview pulse → hot reads (§17).
- **Tests are silent.** Never call a real AI API in tests; use pure request builders and stream parsers fed with fixtures.

## Review Focus

1. **A 401/403 from a provider.** Show "That key was rejected by <provider>. Check it in Setup." Never echo the key, and never show the raw error body.
2. **The user closes the sheet mid-stream.** Abort the request with `AbortController`, save nothing, and leave no dangling promise errors in the console.
3. **The CSP blocks Next's inline scripts.** The built `out/index.html` must still hydrate (the smoke test catches console CSP errors), and `connect-src` must still exclude every other origin.
4. **Hot reads hand back a summary site, an X post or a stale item.** The validator rejects:
   - non-primary domains, using a denylist (medium.com reposts, x.com, twitter.com, linkedin.com, bytebytego.com, and aggregator sites);
   - `publishedAt` older than 30 days at `weekOf`;
   - fewer than 2 `trendSignals`.
5. **A manual engine run twice in a week.** The second `full`/`ai` run skips the AI step unless `force` is set. A `links` run is never locked.

---

### Task 1: Keys and context (pure)

**Files:**
- Create: `src/lib/ai/keys.ts` (an injectable `Storage` for tests).
- Create: `src/lib/ai/context.ts`.
- Create: `src/lib/ai/personas.ts`.
- Test: `scripts/test-ai-core.ts`.

**Interfaces:**
- `type Provider = 'anthropic' | 'openai' | 'gemini' | 'openrouter'`.
- `saveKey(store: { local: Storage; session: Storage }, p: Provider, key: string, remember: boolean): void`.
- `getKey(store, p): string | null`.
- `removeKey(store, p)`.
- `maskKey(key) → '••••' + last 4`.
- `PERSONAS: { id: 'explainer' | 'coach' | 'interviewer'; name: string; prompt: string }[]`.
- `SHARED_BASE: string` (verbatim from the spec appendix).
- `buildSystem(personaId): string`, which is `SHARED_BASE + '\n\n' + persona.prompt`.
- `buildContext(input: { ownerIntro: string; mode: 'steady' | 'grind'; dayNo: number; item: { text: string; track?: string; topic?: string; url?: string; card?: object; quiz?: object }; notes?: string }): string`.
  - It returns a plain-text block. Notes are included only when the "include my notes" toggle is passed.
- [ ] **Step 1: Failing tests:**
  - `saveKey(..., remember: false)` writes only to session;
  - `maskKey('sk-ant-abcd1234')` is `'••••1234'`;
  - `buildSystem('coach')` starts with the shared base and contains "Don't give the solution first";
  - `buildContext` without notes contains no "Notes:" line;
  - the persona prompts equal the spec appendix text. The test reads the spec file and compares the fenced blocks.
- [ ] **Step 2: Implement, then run** `npm test`. Expected: PASS. **Step 3: Commit** `feat(ai): keys, personas, context`.

### Task 2: Provider adapters

**Files:**
- Create: `src/lib/ai/providers/{anthropic,openai,gemini,openrouter}.ts`.
- Create: `src/lib/ai/stream.ts`.
- Test: `scripts/test-ai-providers.ts`.

**Interfaces:**
- **The common interface:** `interface Adapter { id: Provider; models: { id: string; label: string; default?: boolean }[]; stream(args: { key: string; model: string; system: string; messages: { role: 'user' | 'assistant'; content: string }[]; signal: AbortSignal }): AsyncIterable<{ text?: string; done?: { stop: string; usage?: object }; error?: AiError }> }`.
- **`AiError`** = `{ kind: 'auth' | 'rate' | 'refusal' | 'network' | 'other'; message: string /*plain, never the key*/ }`.
- **The Anthropic adapter:**
  - uses `@anthropic-ai/sdk` with its documented browser option, and `client.beta.messages.stream` with the betas, `fallbacks: "default"`, `output_config: { effort: 'medium' }`, `system: [{ type: 'text', text, cache_control: { type: 'ephemeral' } }]`, and `max_tokens: 16000`;
  - maps `stop_reason` and the typed errors to `AiError`.
- **Pure builders** (exported for tests): `anthropicParams(args)`, `openaiParams(args)`, `geminiParams(args)`, and `mapError(provider, err)`.
- [ ] **Step 1: Failing tests on the pure builders:**
  - the Anthropic params include the model, the system with `cache_control`, `fallbacks: 'default'` and `effort: 'medium'`, and no `temperature`;
  - `mapError` turns a 401-shaped error into `{ kind: 'auth' }` with a message that doesn't contain the key string;
  - a stop of `refusal` maps to `kind: 'refusal'`.
- [ ] **Step 2: Implement.** Read the `claude-api` skill's TypeScript README for exact SDK names. Don't guess.
- [ ] **Step 3: Run** `npm test && npm run build`. Expected: PASS. **Step 4: Commit** `feat(ai): provider adapters`.

### Task 3: Ask AI UI, Setup section, save and bookmark

**Files:**
- Create: `src/components/ask-ai-sheet.tsx`:
  - persona picker;
  - an "Include my notes" toggle (on);
  - input, a streamed answer rendered as markdown, and Stop;
  - Save to note: appends to `tnotes[itemId]` with a header `— <Persona>, <date>`;
  - Bookmark: a new `Bookmark` kind `'ai'` with `{ persona, itemId, title, detail: answer, savedAt }`;
  - Labels, via the R1 picker on the bookmark ID.
- Modify:
  - `task-peek.tsx`, `dsa-view.tsx` (pattern card), `quiz-sheet.tsx` and `notes-view.tsx`: an "Ask AI" button;
  - `setup-view.tsx`: an "AI help" section with a provider list, a key field per provider (masked after saving), "Remember on this device", "Remove key", a model picker, and the fallback notice;
  - `store.tsx`: `Bookmark.kind` gains `'ai'`, and the bookmarks list shows it.
- [ ] **Step 1: Implement.**
- [ ] **Step 2: Manual check** with a real key typed in by the owner (never committed):
  - stream an Explainer answer on a pattern card;
  - Stop mid-stream, and nothing is saved;
  - Save, and it appears in the note;
  - Bookmark, and it appears in Bookmarks;
  - remove the key, and the "Add your API key" line shows.
- [ ] **Step 3: Commit** `feat(ai): ask-ai sheet, setup keys, save and bookmark`.

### Task 4: Content-Security-Policy

**Files:**
- Create: `scripts/csp.mjs`. A post-build step: for each `out/**/*.html`, compute `sha256` of every inline `<script>` and inject `<meta http-equiv="Content-Security-Policy" content="…">` as the first child of `<head>`.
- Modify: `package.json` `build` (`next build --turbopack && node scripts/csp.mjs`) and `deploy.yml` (it already runs `npm run build`).
- Test: `scripts/test-csp.ts` (on a fixture HTML string, via an exported `cspFor(html, origins): string`).

**The policy:**
- `default-src 'self'`
- `script-src 'self' <hashes>`
- `style-src 'self' 'unsafe-inline'`
- `img-src 'self' data: https:`
- `connect-src 'self' https://api.github.com https://api.anthropic.com https://api.openai.com https://generativelanguage.googleapis.com https://openrouter.ai`
- `frame-ancestors` can't be set in a meta tag, so leave it out.
- **Fallback:** if hydration still fails after hashing, switch `script-src` to `'self' 'unsafe-inline'`. Keep `connect-src` strict, and note it in the commit.

- [ ] **Step 1: Failing test:** the generated policy contains exactly the hashes of the fixture's 2 inline scripts, and a `connect-src` with only the listed origins.
- [ ] **Step 2: Implement, then run** `npm run build`, serve `out/`, and run the smoke test. Expected: no CSP console errors, and the Gist sync still works.
- [ ] **Step 3: Commit** `feat(security): csp meta with script hashes`.

### Task 5: Hot reads in the weekly engine

**Files:**
- Create: `scripts/collect-reads.mjs`. No AI. It writes `.engine/read-candidates.json` with `{ title, url, source, publishedAt, signals: { points?, comments?, upvotes?, score? }, discussUrl? }[]`. Its sources:
  - Hugging Face `/api/daily_papers`;
  - HN Algolia (last 7 days, `points>100`);
  - Reddit through the official API when `REDDIT_CLIENT_ID` and `REDDIT_CLIENT_SECRET` are set (reusing `collect-interviews.mjs`'s token code; subs `MachineLearning`, `LocalLLaMA`, `ExperiencedDevs`, `programming`);
  - Lobsters;
  - engineering-blog RSS/Atom feeds (the list in §17, as a `FEEDS` constant);
  - Bluesky public search, only if an unauthenticated probe returns 200, otherwise skipped with a log line.
- Create: `scripts/validate-reads.mjs`. It exports `checkReads(feed, today)`, and fails on:
  - missing fields;
  - a non-https URL;
  - a denylisted domain (Review Focus 4);
  - `publishedAt` more than 30 days before `weekOf`;
  - fewer than 2 `trendSignals`;
  - more than 2 items per `weekOf`;
  - more than 26 weeks kept.
- Modify:
  - `.github/prompts/refresh-engine.md`:
    - add the job order (links → plan updates → pulse → hot reads), and the hot-reads section with the rules from §17;
    - output to `public/reads.json`, in the §17 shape;
    - set `lastFullRunAt` in `updates.json` on `full` and `ai` runs;
    - allow editing `public/reads.json`.
  - `.github/workflows/refresh-engine.yml`:
    - run `collect-reads.mjs` in `full` mode;
    - a `force` input (workflow_dispatch) and `client_payload.force`;
    - a lock step: if the mode is `full` or `ai`, not forced, and `lastFullRunAt` is in the current IST week, skip the AI step;
    - allow `Bash(node scripts/validate-reads.mjs)`;
    - validate and commit `public/reads.json`;
    - add `reads.json` to the "unexpected files" allow-list.
  - `scripts/validate-updates.mjs`: accept the optional `lastFullRunAt`.
  - `deploy.yml`: run `validate-reads.mjs`.
  - `store.tsx`: fetch `reads.json`.
  - `engine.ts`: on Sunday, add an optional `hot:<id>` task, "🔥 Hot this week: <title>" (health cat).
  - `roadmap-reference.tsx`: an "Earlier hot reads" group under Explore later.
- Test: `scripts/test-reads.ts`, one case per `checkReads` rule, plus a valid feed passing.
- [ ] **Step 1: Failing tests, implement, then run** `npm test`. Expected: PASS.
- [ ] **Step 2: Dry run:** `node scripts/collect-reads.mjs` locally. It prints counts per source and makes no AI calls. Then `gh workflow run refresh-engine.yml -f mode=full` **only after asking the owner** (it spends from their budget). Check the run summary's usage table and that the job order held.
- [ ] **Step 3: Commit** `feat(engine): hot reads with budget order and weekly lock`. Then push and open the PR "Roadmap v2 · Release 3", ending with the attribution line. Ask the owner before merging.
