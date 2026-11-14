# Handoff: Roadmap v2 (read this first in a new session)

Written 2026-11-15 at the end of the planning session. Nothing has been built yet.

## Where things are

- **Branch:** `roadmap-v2`, cut from `main`. Every planning commit is on it; it hasn't been pushed.
- **Spec (approved by the owner):** `docs/superpowers/specs/2026-11-15-roadmap-v2-content-design.md`
- **Plans, executed in order** (each starts after the previous one is merged):
  1. `docs/superpowers/plans/2026-11-16-roadmap-v2-release-1.md`: curriculum, modes, layout, DSA by pattern, labels. **Build this first.**
  2. `docs/superpowers/plans/2026-11-16-roadmap-v2-release-2-quizzes.md`: daily quiz, weekly test, question bank.
  3. `docs/superpowers/plans/2026-11-16-roadmap-v2-release-3-ai.md`: AI on the user's own key (4 providers, 3 personas), CSP, hot reads.
- **Owner's intent:** start the prep plan as soon as Release 1 is live.

## Decisions still open (ask the owner before acting)

1. **Execution method.** Subagent-driven (recommended: the R1 tasks depend tightly on each other's interfaces, and a bad layout silently puts the wrong tasks on the owner's days) or native.
2. **Rebrand.** The owner wants a new brand name and logo.
   - The logo reads **GETRR**. The owner said "GET RR Ketto", so **confirm the exact name**.
   - **Candidate files** in `~/Downloads`: `Black and White GETRR Runner Logo.png` (a hare with GETRR, the one the owner showed), `Chunky Black GETRR Graffiti Logo.svg` and `Chunky Black GETRR Graffiti Logo.png`. **Confirm which one.**
   - Once confirmed, add a task to R1 covering:
     - the app name in `layout.tsx` metadata, the sidebar brand and the README;
     - `src/app/icon.png`, `src/app/apple-icon.png` and `public/logo-64.png`, regenerated from the chosen file;
     - `design/logo.png`;
     - the `.ics` calendar name in `schedule.js`.
   - Keep the repo and URL names unless the owner says otherwise.
3. **Before merging any release PR:** merging to `main` deploys to GitHub Pages, so always ask the owner first.

## Settled. Don't reopen.

- **Weekly engine and daily news:** they stay on the owner's `CLAUDE_CODE_OAUTH_TOKEN`. The only engine change is hot reads (R3).
  - **Per-run cap:** `ENGINE_BUDGET_USD = 0.50`. The owner sets this repo variable themselves.
  - **In-app AI** only ever uses the user's own key.
- **Reddit:** the API secrets aren't set. That's the owner's choice to add later, and the code skips Reddit without them.
- **Content from public sources:** may be copied freely (personal use). Judge sources by quality, and keep a source link per item.

## Working rules the owner set

- **Discuss before editing:** when the owner raises a new idea or asks "can we…?", answer and agree first, then edit the spec or code.
- **No noise in the daily plan**, and nothing cut or compressed (see the spec's anti-goals).
- **Tests and smoke runs must be silent:** Chromium gets `--mute-audio`, and nothing plays sound.
- **Commits and PRs** end with the attribution lines from the session's system reminder.

## Suggested first message for the new session

> Read `docs/superpowers/HANDOFF-roadmap-v2.md`, then the spec and the Release 1 plan it points to. Confirm the rebrand name and logo file with me, and which execution method to use, then build Release 1 on the `roadmap-v2` branch.
