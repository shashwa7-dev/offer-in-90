# Handoff: IDT (start here in a new session)

Written 2026-11-16. Supersedes `HANDOFF-roadmap-v3.md` for all new work.

## One-paragraph summary

"Offer in 90" is the owner's interview-prep planner (Next.js static export on GitHub Pages, Gist sync), now
renamed **IDT**. Its content (roadmap v3: 7 tracks × 78 slots) is done and lives on branch `roadmap-v2`
(PR #2, **will not be merged**). The owner decided to rebuild IDT as a **focused learning workspace**: weekly
**cycles** of **work items** with **estimates** and **sub-items**, automatic **carry-over**, no clock or
routine, on a **real backend** (Next.js on Vercel + Neon Postgres + Drizzle + Better Auth + Trigger.dev), in a
**new private turborepo named `IDT`**, borrowing Plane's model and UI ideas (never its code: AGPL).

## Read these, in order

1. **The design (binding):** `docs/superpowers/specs/2026-11-16-idt-learning-workspace-design.md`.
   - Rounds 1–3 of decisions.
   - The database tables, the roadmap seed and versioning.
   - The phases and the env-var table.
2. **The content it builds on:** `docs/superpowers/specs/2026-11-15-roadmap-v3-ai-systems-design.md` (roadmap v3).
3. **Owner rules:**
   - "Owner rules" in `HANDOFF-roadmap-v3.md`;
   - memory: `offer-in-90-learning-focus`, `feedback-small-changes-fast`.

## Where things are

- **Repo:** `/Users/shashwa7/Desktop/personal/offer-in-90`, branch `roadmap-v2`, everything pushed (head
  `f6ee16d` or later).
  - PR #2 (https://github.com/shashwa7-dev/offer-in-90/pull/2) is open and not to be merged.
  - Close it with a link once the new repo exists.
- **Live site:** the old version still runs on GitHub Pages from `main` (v1). It keeps running until the owner
  imports their data into the new app.
- **Roadmap v3 code to move** into `packages/roadmap`, with its tests:
  - `src/lib/content/*.js`, `src/lib/tracks.ts`, `src/lib/patterns.ts`;
  - the DSA problem data and the coverage test (`scripts/test-v3-coverage.ts`, `scripts/fixtures/v2-ids.json`);
  - `scripts/test-tracks.ts` and `scripts/test-content.ts`.
- **Plane (reference only; AGPL, don't copy code):** shallow-clone `https://github.com/makeplane/plane.git` into a
  scratch dir. Useful paths:
  - `apps/api/plane/db/models/` (workspace, project, issue, cycle, module, estimate, state, notification, user);
  - `apps/api/plane/seeds/data/*.json` + `apps/api/plane/bgtasks/workspace_seed_task.py` (the seed pattern);
  - `apps/api/plane/utils/analytics_plot.py` (`burndown_plot`) and `utils/cycle_transfer_issues.py`;
  - `utils/timezone_converter.py`;
  - `apps/api/plane/celery.py` (scheduled jobs);
  - `apps/admin` (god-mode admin app);
  - `packages/constants/src/swr.ts` and `apps/web/hooks/use-online-status.ts` (the offline behaviour).
- **Trigger.dev reference setup:** `/Users/shashwa7/Desktop/work-shopos/shopos-backend-ts/apps/pro-backend-triggers`.
  - `trigger.config.ts`: retries with backoff; `dirs: ["./src/trigger"]`.
  - `src/trigger/init.ts`: a global `onFailure` hook.
  - `src/trigger/credits-reaper.ts`: a scheduled task that calls an app route with a Bearer service token.
  - Pinned version `@trigger.dev/sdk` 4.5.6.

## Decided (don't re-ask)

**Product**
- A focused prep app with a Plane-like UI, not a Linear clone.
- **Desktop web first.**
- Weekly cycles (Mon–Sun) with items in the recommended order, but any order is allowed.
- Unfinished items carry over automatically. Carry-over runs lazily on the first visit after a cycle ends, snapshotting the cycle's stats first (as Plane).
- **Everything is a work item with an estimate,** including:
  - the daily DSA problem (one per day; piles up if missed);
  - recall;
  - the daily log;
  - Sunday's own items;
  - an "End of cycle review".
- No routine, meals, gym, block times, bedtime or calendar file.

**Data**
- The state lives on the work item, shared, as in Plane.
- These tables exist but are switched off for now:
  - `workspace_member` with roles (admin/member/guest; mentor later);
  - `workspace_invite`;
  - `work_item_assignee`.
- If two people ever follow the same roadmap, add `work_item_progress` then.

**Roadmap content**
- Authored in TypeScript.
- Built into versioned JSON snapshots (one folder per version, Plane-seed style, with stable string ids).
- Validated with zod.
- Stored in `roadmap_version`.
- Seeded into a workspace on creation.
- Updated by diffing snapshots by id. Rollback happens from the admin app.

**Stack**
- Next.js on Vercel.
- Neon Postgres with Drizzle.
- Better Auth: **Google only**, database sessions.
- **Sign-up allowlist:** `shashwa7.dev@gmail.com`.
- **No Redis.**
- **Trigger.dev free plan** for jobs (weekly news refresh, daily reminder email), set up like shopos. Vercel Cron is the fallback.
- **GitHub Actions: CI only**, never the news engine.
- News, pulse and interviews are stored in the database.
- **Bring your own AI key from day 1:**
  - keys encrypted with AES-256-GCM in `user_ai_key`, never sent back to the browser;
  - the news engine uses the owner's server key;
  - AI agents (Explainer, Coach, Interviewer) and quizzes come in later releases.
- **Offline:** as Plane: show the last loaded data with an "Offline" banner, block edits, refetch on reconnect.
- **Time zones:** `user.timezone` (IANA, auto-detected); today and cycle bounds computed in that zone.

**Repo**
- New private turborepo `IDT` under the owner's GitHub account:
  - `apps/web`, `apps/admin`, `apps/jobs`;
  - `packages/db`, `packages/roadmap`, `packages/ui`, `packages/config`.
- Docker Compose with Postgres for local development and tests.
- The README must let a stranger run it locally; the repo goes public later.

**Phases**
1. Sign-in, workspace seed, Today, Cycle, carry-over (with automatic overtime cycles, O1), Progress, AI-key settings.
   - **No import of old data (O2):** IDT starts fresh.
2. The admin app (releases, rollback) and the news engine on the database via Trigger.dev.
3. Notifications and the reminder email, export and delete account.

Later: AI agents, quizzes, members and invites, mentors. The plan must include a feature-parity checklist assigning every current feature to a phase.

## Next steps, in order

1. The owner confirms the design once. It's final:
   - An audit (2026-11-16) fixed its contradictions and added 12 rules (design § "Audit").
   - O1 (overtime cycles) and O2 (no import) are decided.
2. (Optional) a quick independent review of the design.
3. `superpowers:writing-plans` for **Phase 1** (including the feature-parity checklist).
4. Create the `IDT` repo locally, scaffold the turborepo, push to a private GitHub repo. Confirm with the owner before creating a remote repo.
5. Build Phase 1 subagent-driven (`superpowers:subagent-driven-development`), with per-task reviews and one final whole-branch review.
6. Ask the owner for env values only when a step needs them (the table is in the design).
7. After Phase 1 works, close PR #2 with a link to the new repo, and agree the old site's retirement with the owner.

## Owner working rules

- Plain English.
- **Early-stage beta, no active users:** pick the clearly better design even if it means rebuilding existing parts
  or breaking old data. Don't spend time on backward compatibility with the old app.
- Discuss genuinely new product ideas before building them. Obvious improvements don't need asking.
- Never cut or shorten roadmap content.
- Small changes get quick checks (tsc, unit tests, a preview look), not the 10-minute smoke.
- Tests are silent; Playwright runs with `--mute-audio`.
- Ask before pushing to shared branches, merging, or creating remote repos.
- Commits end with the attribution line given in the session's system reminder.
- The owner dictates by voice: map odd words to sound-alikes (e.g. "plain" = Plane, "streets" = states).
