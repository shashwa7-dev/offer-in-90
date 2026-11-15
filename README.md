# Offer in 90

A 90-day interview-prep dashboard for frontend and forward-deployed engineer roles. It has a daily checklist, per-task notes, a progress timeline, and a weekly engine that flags outdated material and adds new must-reads.

Built with Next.js (static export), Tailwind and shadcn/ui. Hosted on GitHub Pages.

## How it fits together

- **Curriculum:** the content files in `src/lib/content/` hold the resources, `src/lib/plan-data.js` re-exports them in the shape the engine reads, and `src/lib/engine.ts` turns them into days, then computes hours and progress. Item IDs are content-based (`fe:closures`, `p-two-sum`) and never change.
- **Your data:** saved in the browser, and synced to a **private GitHub Gist** once you paste a gist-only token in Setup. The code in this repo holds no personal data.
- **Update engine:** `.github/workflows/refresh-engine.yml`
  - The weekly cron (`30 23 * * 6`, Sunday 05:00 IST) runs a `full` audit.
  - First, `scripts/check-links.mjs` checks every link (no AI).
  - Then Claude Code runs headless with `.github/prompts/refresh-engine.md` and writes `public/updates.json`.
  - `scripts/validate-updates.mjs` checks the result.
  - The workflow commits the feed and redeploys.
  - The dashboard marks outdated tasks and adds must-reads to your Sunday catch-up.

## Content files (`src/lib/content/*.js`)

| File | Holds |
| --- | --- |
| `dsa.js` | 24 patterns in teaching order, the tiered and flagged problem set, advanced topics |
| `fe.js` | Frontend and CS core, one topic per item |
| `mc.js` | Machine-coding builds, timed second passes, take-home simulations, the flagship project, LLD |
| `sd.js` | System design sequence and the mock rotation |
| `ai.js` | The evening AI hour and the 30-minute AI-build track |
| `judgment.js` | The judgment thread (how it works, decision memo, practical coding, decomposition, code you did not write), depth reads, interview-environment tasks |
| `ux.js` | Product and UX |
| `career.js` | Behavioral and resume, forward-deployed track, company map |
| `sundays.js` | The fixed Sunday core, readiness checks, rest and revision modes |
| `reference.js` | Roadmap > Reference page, OA posts, "Explore later" |

## Modes

Each track has exactly 78 slots in both modes. Switch in Setup; the change applies from today, so earlier days are not rewritten and ticks are kept.

- **Steady (default):** 17 weeks, 102 study days, 17 Sundays (119 days). Each track keeps its sequence order.
- **Grind:** 13 weeks, 78 study days, 13 Sundays (91 days). Grind weekday rules apply only here.

The prep day (day 0) is the Sunday before `start`, and `start` is always a Monday.

## Daily routine

Setup has a routine editor for the meal and gym slots: **breakfast, lunch, dinner** and a renamable **4th slot** (the gym by default). Each can be turned on or off, renamed, moved and resized; the day is laid out around them, Monday to Saturday.

## Labels

Every task carries read-only **system labels** (pattern, tier, frequency, source, flagged, depth) and any **owner labels** you create in Setup. Owner labels can sit in single- or multi-choice groups; deleting a label removes it from every item. Filter Today by label, or press the search key and pick a label to apply it as the Today filter.

## DSA page

The DSA page lists the 24 patterns with their template, signal and problems. A pattern turns green after 2+ unseen problems solved within the time limit (Easy 15, Medium 25, Hard 40 minutes) and a blank-file re-solve 7+ days after the first solve. You can add your own LeetCode problems under a pattern; a problem already in the plan is stored and counted once. Search also finds patterns.

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
