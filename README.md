# Offer in 90

A 90-day interview-prep dashboard for frontend and forward-deployed engineer roles. It has a daily checklist, per-task notes, a progress timeline, and a weekly engine that flags outdated material and adds new must-reads.

Built with Next.js (static export), Tailwind and shadcn/ui. Hosted on GitHub Pages.

## How it fits together

- **Curriculum:** `src/lib/plan-data.js` (all resources) and `src/lib/engine.ts` (turns it into 91 days, then computes hours and progress).
- **Your data:** saved in the browser, and synced to a **private GitHub Gist** once you paste a gist-only token in Setup. The code in this repo holds no personal data.
- **Update engine:** `.github/workflows/refresh-engine.yml`
  - The weekly cron (`30 23 * * 6`, Sunday 05:00 IST) runs a `full` audit.
  - First, `scripts/check-links.mjs` checks every link (no AI).
  - Then Claude Code runs headless with `.github/prompts/refresh-engine.md` and writes `public/updates.json`.
  - `scripts/validate-updates.mjs` checks the result.
  - The workflow commits the feed and redeploys.
  - The dashboard marks outdated tasks and adds must-reads to your Sunday catch-up.

## Commands

```bash
npm run dev                          # local dev
node scripts/check-links.mjs         # link report in .engine/
node scripts/validate-updates.mjs    # validate the feed
# manual engine run (mode: full | links | ai)
gh workflow run refresh-engine.yml -f mode=full
```

The engine needs one repository secret: `CLAUDE_CODE_OAUTH_TOKEN`. Create it with `claude setup-token`.
