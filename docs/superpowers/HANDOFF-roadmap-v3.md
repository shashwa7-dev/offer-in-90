# Handoff: Roadmap v3 (read this first in a new session)

Written 2026-11-15 at the end of the Release 1 build session. Supersedes `HANDOFF-roadmap-v2.md`.

## Where things are

- **Branch:** `roadmap-v2` (cut from `main`). Not pushed. Head at handoff: the commit that adds this file.
- **Built and reviewed on the branch (Release 1 machinery, keep it):** state v6 + sync; labels; Steady/Grind
  calendars with mode switching (superseded copies); weekday/Sunday timetables; routine slots with an
  **editable wake-up time** (untouched slots move with it; bedtime is derived and moves later instead of
  refusing; never past 23:59); engine over tracks/layout (`src/lib/plan-build.ts`); Setup; labels UI;
  DSA page (27 patterns, topic/pattern navigation, filters, lucide icons, no emoji); Sundays (rest/revision,
  scores, burnout guard); search; link checker; new logo (flame-haired face); the final whole-branch
  review's 10 fixes. Tests, tsc and build pass; last full smoke: 599 ok, 0 fail.
- **Ledger with every ruling (R1–R15) and deferred minors:**
  `.superpowers/sdd/2026-11-16-roadmap-v2-release-1/progress.md` (git-ignored; also briefs and reports there).

## What happens next (in order)

1. **Finish the parked Task 15 cleanup.** It's in `git stash list` as
   "WIP Task 15 fix round 2 …". The three fixes it was doing (all from the last review):
   - a saved routine slot can silently become wake-relative again when it coincidentally equals the
     shifted default (`setup-view.tsx` `routineDiff`) — always store touched/previously-saved rows absolute;
   - `today-view.tsx` pre-start line "sleep by 22:00" and Setup's "Daily timetable" sheet ignore the
     routine — show the resolved times;
   - README "Daily routine": editable wake-up, bedtime moves.
   Either `git stash pop` and finish/verify it, or drop it and redo the three fixes. It was unfinished.
2. **Roadmap v3 content redesign** (approved by the owner 2026-11-15):
   `docs/superpowers/specs/2026-11-15-roadmap-v3-ai-systems-design.md`.
   - **The independent spec review is done:** `docs/superpowers/specs/2026-11-15-roadmap-v3-spec-review.md`
     (verdict: not ready yet; 13 must-fix items, all spec-text changes; three tracks overflow 78 slots).
     Apply every must-fix and the should-fixes, recount each track to ≤ 78, and ask the owner the three
     "Risks to raise" (DSA depth for Google/Meta, frontend-specialist loops, advanced DSA 8→3). Show the
     owner the spec changes in plain words. A short re-review of the revised spec, then:
   - write the implementation plan (superpowers:writing-plans), then build it subagent-driven
     (superpowers:subagent-driven-development) with per-task reviews and one final whole-branch review.
   - The v3 change is content + track builders + block titles/times + readiness/assessment text + tests.
     The engine, layout, modes, routine, labels, DSA page, Sundays and sync stay.
3. **PR:** ask the owner before pushing; merging to `main` deploys to GitHub Pages. Include in the PR
   body the release notes: v1 ticks don't carry over (Start over once), reload old tabs before syncing.

## Owner rules (don't re-ask)

- Priorities: **AI engineer > software engineer > product engineer**; frontend = real-world topics only.
- **AI writes UI and boilerplate.** Time goes to understanding, designing, judging and debugging systems.
  No new languages (no Python/pandas), no widget builds, no hand-built data structures.
- **The roadmap is never cut or shortened.** Daily times may bend; only wake-up is editable.
- DSA light but **every study day covers one pattern or DSA fundamental**.
- Every block is Understand → Do → Explain (2–3 tasks), like the original v1 roadmap.
- Stay close to the original Whimsical-based v1 where it was good (see the spec's "Kept from the original roadmap").
- Goal: after 90/120 days **no fundamental area is blank** (spec's coverage map).
- Discuss before editing on new ideas; the owner dictates by voice (map odd words to sound-alikes).
- Tests and smoke are silent (`--mute-audio`). Commits end with the attribution line from the session.

## Open items for the owner (raise once, briefly)

- Sunday overflow from 75-min mock Saturdays stays (accepted).
- The 6 Phase-3 frontend machine-coding rehearsal reps (AI off) are in the v3 spec as interview
  practice; the owner hasn't objected.

## Practical notes

- A preview dev server may still be running on port 3100 from a scratch worktree
  (`git worktree list`); remove it with `git worktree remove --force <path>` and stop the process.
- Two `next dev` servers in one folder share `.next` and corrupt it; build/smoke into a separate dist
  dir or a separate port + worktree. `next dev` adds lines to `tsconfig.json`; revert them.
- `npm run build` can fail once on a Google Fonts fetch; retry once.
