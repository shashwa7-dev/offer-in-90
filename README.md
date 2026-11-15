# Offer in 90

A 90-day interview-prep dashboard for frontend and forward-deployed engineer roles. It has a daily checklist, per-task notes, a progress timeline, and a weekly engine that flags outdated material and adds new must-reads.

Built with Next.js (static export), Tailwind and shadcn/ui. Hosted on GitHub Pages.

## How it fits together

- **Curriculum:** the content files in `src/lib/content/` hold the resources, `src/lib/plan-data.js` re-exports them in the shape the engine reads, and `src/lib/engine.ts` turns them into days, then computes hours and progress. Item IDs are content-based (`fe:rendering-path`, `p-two-sum`) and never change.
- **Your data:** saved in the browser, and synced to a **private GitHub Gist** once you paste a gist-only token in Setup. The code in this repo holds no personal data.
- **Update engine:** `.github/workflows/refresh-engine.yml`
  - The weekly cron (`30 23 * * 6`, Sunday 05:00 IST) runs a `full` audit.
  - First, `scripts/check-links.mjs` checks every link (no AI).
  - Then Claude Code runs headless with `.github/prompts/refresh-engine.md` and writes `public/updates.json`.
  - `scripts/validate-updates.mjs` checks the result.
  - The workflow commits the feed and redeploys.
  - The dashboard marks outdated tasks and adds must-reads to your Sunday catch-up.

## Plan

Seven tracks of 78 slots each, plus a generated recall block. Times are the default weekday (wake-up at 05:00 shifts them all).

| Time | Track | What |
| --- | --- | --- |
| 05:15–06:15 | **DSA** (60 min) | Foundations, then 27 patterns × 2 days (teach problem, then an unseen one), then Phase 3: OA simulations, Google and Meta sets, revisits, advanced awareness |
| 06:15–07:15 | **Recall + AI news** (60 min, generated) | Explain the last AI-core slot from memory (30 min), a Systems slot from 3–7 days ago (20 min), then the News tab (10 min) |
| 08:00–10:00 | **AI engineering core** (2 h) | How LLMs work, using models, RAG, evals, agents, fine-tuning, inference, production AI, 8 AI designs and 3 timed mocks |
| 10:15–11:45 | **Product** (1.5 h) | Mon–Fri: one real AI product, built and launched (59 steps + 2 take-homes). Saturdays: low-level design |
| 13:00–14:30 | **Systems** (1.5 h) | Computers, networking, HLD fundamentals, DDIA, case studies, building blocks, 26 HLD designs and mocks |
| 15:15–16:00 | **Platform, data and DevOps** (45 min) | DevOps basics, then SQL, Postgres, Docker, Kubernetes, Terraform, AWS, observability, data engineering, practical coding reps |
| 16:00–17:00 | **Career and FDE** (1 h) | Behavioral, FDE stages, decomposition reps, teardowns, applications. Saturdays: mock day |
| 20:00–21:00 | **Frontend, senior** (60 min) | Browser, React internals, data, security, architecture, frontend system design. Saturdays: a timed interview rep |

The DSA revision block (14:45–15:15, re-solves and a recognition drill) and the daily review (21:00–21:30) are generated too. Sundays hold the weekly self-check, a read, and rest or revision.

## Content files (`src/lib/content/*.js`)

| File | Holds |
| --- | --- |
| `dsa.js` | 27 patterns in teaching order, the tiered and flagged problem set, foundations, advanced awareness, interview-environment tasks |
| `ai-core.js` | The AI engineering core (78 rows) and the AI news sources |
| `systems.js` | Systems and architecture (78 rows) |
| `platform.js` | Platform, data and DevOps (76 rows, 78 slots) |
| `product.js` | The flagship steps, the 2 take-homes and the 13 LLD sessions |
| `career.js` | Career and FDE (65 weekday rows), the Saturday mock days, company map |
| `frontend.js` | Frontend, senior (78 rows) |
| `sundays.js` | The fixed Sunday core, readiness checks, rest and revision modes |
| `reference.js` | Roadmap > Reference page, OA posts, "Explore later" |
| `v3-dropped.js` | The v2 ids v3 does not place, and why (read by the coverage test only) |

## Modes

Each track has exactly 78 slots in both modes. Switch in Setup; the change applies from today, so earlier days are not rewritten and ticks are kept.

- **Steady (default):** 17 weeks, 102 study days, 17 Sundays (119 days). Each track keeps its sequence order.
- **Grind:** 13 weeks, 78 study days, 13 Sundays (91 days). Grind weekday rules apply only here.

The prep day (day 0) is the Sunday before `start`, and `start` is always a Monday.

## Daily routine

Setup has a routine editor for the meal and gym slots: **breakfast, lunch, dinner** and a renamable **4th slot** (the gym by default). Each can be turned on or off, renamed, moved and resized; the day is laid out around them, Monday to Saturday.

- **Wake-up is editable** (default 05:00). It shifts the whole study day, bedtime included (17 h after wake-up). Slots you have never changed move with it; a slot you save keeps its time. Reset to defaults makes every slot follow wake-up again.
- **Bedtime moves instead of refusing.** If the study blocks no longer fit before wind-down, wind-down and bedtime move later, and Setup shows the new bedtime. Study blocks are never cut, shortened or dropped. A routine is refused only if it is invalid (overlapping slots, a slot before wake-up ends) or the day would run past 23:59.
- Sundays and the prep day keep their own times.

## Labels

Every task carries read-only **system labels** (pattern, tier, frequency, source, flagged, depth) and any **owner labels** you create in Setup. Owner labels can sit in single- or multi-choice groups; deleting a label removes it from every item. Filter Today by label, or press the search key and pick a label to apply it as the Today filter.

## DSA page

The DSA page lists the 27 patterns with their template, signal and problems. A pattern turns green after 2+ unseen problems solved within the time limit (Easy 15, Medium 25, Hard 40 minutes) and a blank-file re-solve 7+ days after the first solve. You can add your own LeetCode problems under a pattern; a problem already in the plan is stored and counted once. Search also finds patterns.

## Commands

```bash
npm run dev                          # local dev
npm test                             # unit tests (scripts/test-*.ts)
node scripts/smoke.mjs <shots dir>   # browser smoke against the dev server (muted)
node scripts/check-links.mjs         # link report in .engine/
node scripts/validate-updates.mjs    # validate the feed
# manual engine run (mode: full | links | ai)
gh workflow run refresh-engine.yml -f mode=full
```

The engine needs one repository secret: `CLAUDE_CODE_OAUTH_TOKEN`. Create it with `claude setup-token`.
