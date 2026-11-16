> **Superseded for new work by `docs/superpowers/HANDOFF-idt.md` (2026-11-16). Start there.**

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

## NEXT SESSION START HERE (2026-11-16, later)

The owner changed direction: **IDT becomes a learning workspace** (weekly cycles, work items with estimates and
sub-items, carry-over; no clock/routine) on a **real backend** (Next.js on Vercel + Neon Postgres + Drizzle +
Better Auth), with a Plane-style schema (workspaces, members/roles/invites ready but off, tracks, cycles, modules,
work items with shared state, versioned roadmap snapshots seeded like Plane's workspace seed).
- Design: `docs/superpowers/specs/2026-11-16-idt-learning-workspace-design.md` (draft, not yet approved).
- **Design is complete (rounds 1–3).** Next session: have the owner confirm it, then superpowers:writing-plans for
  **Phase 1** in a NEW turborepo named `IDT` (private GitHub repo, owner's account), then build. Ask the owner for
  the env values listed in the design's "Environment variables" table when they are needed.
- PR #2 will **not** be merged: the redesign ships as one fresh PR built on `roadmap-v2`; close #2 then.
- Plane clone for reference was in a scratch dir; re-clone shallow if needed (`git clone --depth 1
  https://github.com/makeplane/plane.git`). Relevant: `apps/api/plane/db/models/{workspace,project,issue,cycle,
  module,estimate,state}.py`, `apps/api/plane/seeds/data/*.json`, `apps/api/plane/bgtasks/workspace_seed_task.py`,
  `apps/api/plane/authentication/`.
- Owner working rules: small changes get quick checks (tsc + unit tests + preview), not the 10-min smoke.

## Status (2026-11-16)

**Everything below is DONE.** Release 1 + roadmap v3 + daily DSA + mode indicators + IDT rename are on `roadmap-v2`,
reviewed (per task, whole-branch, fix waves), and open as **PR #2** against `main`
(https://github.com/shashwa7-dev/offer-in-90/pull/2). Next: the owner reviews/merges PR #2 (merge deploys to
GitHub Pages). Only after that merge: Releases 2 (quizzes) and 3 (AI) — their plans predate v3 and need a short
refresh pass first. Execution ledger with every ruling: `.superpowers/sdd/2026-11-16-roadmap-v3-content/progress.md`.

## What happened (historical, in order)

1. **DONE 2026-11-15 (8f090a5; tests, tsc pass; smoke 601 ok, 0 fail).** ~~Finish the parked Task 15 cleanup.~~ It's in `git stash list` as
   "WIP Task 15 fix round 2 …". The three fixes it was doing (all from the last review):
   - a saved routine slot can silently become wake-relative again when it coincidentally equals the
     shifted default (`setup-view.tsx` `routineDiff`) — always store touched/previously-saved rows absolute;
   - `today-view.tsx` pre-start line "sleep by 22:00" and Setup's "Daily timetable" sheet ignore the
     routine — show the resolved times;
   - README "Daily routine": editable wake-up, bedtime moves.
   Either `git stash pop` and finish/verify it, or drop it and redo the three fixes. It was unfinished.
2. **Spec revision 2 written (f57adb1): all must-fixes and should-fixes applied, every track 78 slots. Waiting on the owner's OK of the plain-words summary, then the short re-review.** Roadmap v3 content redesign (approved by the owner 2026-11-15):
   `docs/superpowers/specs/2026-11-15-roadmap-v3-ai-systems-design.md`.
   - **The independent spec review is done:** `docs/superpowers/specs/2026-11-15-roadmap-v3-spec-review.md`
     (verdict: not ready yet; 13 must-fix items, all spec-text changes; three tracks overflow 78 slots).
     Apply every must-fix and the should-fixes and recount each track to ≤ 78. The owner already
     answered the three "Risks to raise" (2026-11-15): **(a)** DSA revisit days (Steady rest days and
     Phase 3 revisits) use the extra var problems of the hardest patterns (DP, graphs, backtracking,
     trees, heaps, intervals, sliding window, binary search); **(b)** frontend is the owner's core
     experience and must stay strong (owner correction, same day): not a "frontend-specialist only" plan,
     but the frontend track keeps its full 60-min evening and 78 slots of **senior-level** frontend — no
     basics, no padding. Fill the slots the review called padding with senior work: frontend
     architecture, performance and rendering deep dives, React internals and concurrent features,
     real-world debugging, frontend system design (2 slots each), and timed JS/React interview reps
     (output questions, tricky async, closures in practice). Mindset: strong frontend engineer **plus**
     a strong overall/product/AI engineer on top; **(c)** 3 advanced
     DSA awareness slots is fine. Show the
     owner the spec changes in plain words. A short re-review of the revised spec, then:
   - write the implementation plan (superpowers:writing-plans), then build it subagent-driven
     (superpowers:subagent-driven-development) with per-task reviews and one final whole-branch review.
   - The v3 change is content + track builders + block titles/times + readiness/assessment text + tests.
     The engine, layout, modes, routine, labels, DSA page, Sundays and sync stay.
3. **PR:** ask the owner before pushing; merging to `main` deploys to GitHub Pages. Include in the PR
   body the release notes: v1 ticks don't carry over (Start over once), reload old tabs before syncing.

## Owner rules (don't re-ask)

- **Scope (2026-11-15): finish Release 1 + the v3 roadmap, review, merge. Releases 2 (quizzes) and 3 (AI) start only after that merge.**
- Plan being executed: `docs/superpowers/plans/2026-11-16-roadmap-v3-content.md`; ledger `.superpowers/sdd/2026-11-16-roadmap-v3-content/progress.md`.

- Priorities: **AI engineer > software engineer > product engineer, on top of a strong frontend base** (frontend is the owner's core experience: keep it senior-level and strong, never basics, never dropped).
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
