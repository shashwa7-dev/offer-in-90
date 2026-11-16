# IDT as a learning workspace: cycles, work items, estimates (design)

Status: final; owner decisions O1 and O2 made (2026-11-16), revision 5. Confirm once at the start of the implementation session. Builds on roadmap v3
content (branch `roadmap-v2` of `offer-in-90`; PR #2 is not merged). Ships in a **new repo, `IDT`** (round 3).
Where an earlier section and a later "Decisions" round disagree, the later round wins; the audit below lists the
fixes made.

## Intent

IDT is a **focused interview-prep app**, not another Linear or Plane. It borrows Plane's familiar UI and its best
ideas (work items with sub-items, weekly cycles, estimates, states, modules, labels, views) so the plan feels
like a tool the owner already knows, while every feature stays about learning and tracking.

The owner's reasons, in their words: the daily timetable (wake-up, meals, gym, exact block times) is rigid and
fragile; nobody should have to track when they sleep. What matters is finishing the week's work. Users should be
able to add their own items. The roadmap is updated often, and those updates must reach users without
per-user work. Later there may be several roadmaps.

## Goals

1. **No clock.** Remove time-of-day: block times, the routine form (wake-up, breakfast, lunch, dinner, gym),
   bedtime moves, Sunday time blocks.
2. **Weekly cycles.** Each week (Mon–Sun) is a cycle holding its work items **in the recommended order**.
   Beginners follow the order; anyone may do items in any order. Missing a few days is fine: the cycle shows what
   is pending and can be caught up any day that week.
3. **Carry-over.** When a cycle ends, its unfinished items move to the next cycle automatically, marked as
   carried over. Repeated pile-ups are visible in the cycle chart (scope keeps growing, burn-down falls behind).
4. **Everything is a work item.** There are no special "habits": the daily DSA problem, recall and the daily log
   are ordinary work items with a cycle and an estimate, one set per day, and they pile up like anything else if
   missed (owner, 2026-11-16). **Sundays are normal days** with their own work items (the weekly self-check and
   reflection become an "End of cycle review" item; mock rounds are ordinary items). DSA lessons are ordinary
   cycle items too.
5. **Plane-style schema** for content and user data (below), with stable ids so the roadmap can be updated often
   and a user's progress stays attached.
6. **Scales to several roadmaps** (workspaces) later, without rework. Only one ships now.
7. **Own items** are first-class: same shape as roadmap items (title, estimate, cycle, state, labels, sub-items).

## Non-goals

- Not a Linear/Plane clone: no teams, intake/triage, workflow editors, custom states, sprint ceremonies,
  priorities (order is the priority), attachments, webhooks. Members, roles, invites and assignees exist in the
  schema but are switched off in this release.
- No collaboration features in this release: inviting members, assigning items, mentors and comments come later
  (the schema is ready for them).
- No content changes to the v3 roadmap (tracks, slots, rules stay as approved).
- Releases 2 (quizzes) and 3 (AI) remain later work.

## Anti-goals (a failure even if it works)

- The app feels like a project-management tool instead of a study plan (jargon, empty admin screens).
- A beginner loses the order and gets lost.
- A roadmap update wipes or scrambles someone's progress.
- Carry-over hides the pile-up instead of showing it.

## Approaches considered

1. **Reshape in place:** keep the engine, delete the clock, relabel days as cycles. Fast, but tasks stay flat
   (no stable work-item ids, sub-items, modules) and does not scale to several roadmaps.
2. **Stored work items:** copy the roadmap into each user's records at start; everything is user data. Most
   flexible, but roadmap updates no longer reach running plans and storage/sync is a rewrite.
3. **Template + per-workspace copy linked by id (chosen):** the roadmap is a versioned template of work items
   with stable ids; each workspace is seeded with its own rows that keep the template id, plus own items in the
   same shape. Updates flow;
   progress stays; several roadmaps are just several templates. Picked by the owner's requirements (frequent
   updates, multi-roadmap, own items).

## Vocabulary (Plane → IDT)

| Plane | IDT | Notes |
|---|---|---|
| (template) | **Roadmap** | The versioned content template; v3 is the default ("Interview prep 2026"). |
| Workspace | **Workspace** | A person's plan built from one roadmap (seeded from it, then theirs). |
| Project | **Track** | DSA, AI engineering, Systems, Product, Platform, Career, Frontend. Each has a short key: DSA, AI, SYS, PRD, PLT, CAR, FE. |
| Work item | **Work item** (UI may say "task") | Has an id like `DSA-12`. |
| Sub-work item | **Sub-item** | A lesson's Understand / Do / Explain; a timed set's problems. |
| Cycle | **Cycle** | A week, Mon–Sun, "Cycle 3 · Nov 30 – Dec 6". |
| Module | **Module** | A topic group in a track: "Sliding window", "RAG", "DDIA ch. 5". |
| Estimate | **Estimate** | Time (15m, 30m, 45m, 1h, 1.5h, 2h). |
| State | **State** | Backlog, Todo, In progress, Done, Cancelled (Cancelled = today's "skipped"). |
| Relation "blocked by" | **Needs** | Today's `after:`. |
| Labels, Views, Pages | Labels, Views (saved filters), Notes | As today. |

## Stack (owner, 2026-11-16)

A real backend replaces Gist sync and GitHub Pages, keeping Plane's practices but none of its heavy machinery:

- **Next.js** (one app: pages + server code), hosted on **Vercel**.
- **Neon Postgres**, schema and migrations in **Drizzle**.
- **Better Auth**: sign-in with Google (only, for now); database sessions in an HTTP-only, secure cookie (as Plane).
- No Redis, queues, workers, object storage or real-time server until a real need appears.
- Every read and write goes through server code that checks workspace membership and role (never UI-only).
- Instant UI with the server as the source of truth (optimistic updates). Offline behaviour: round 2, item 10.

## Database (Plane's relationships, trimmed)

Every table has `id` (uuid), `created_at`, `updated_at`, `created_by`, `updated_by`, `deleted_at` (soft delete).

| Table | Columns (beyond the common ones) | Notes |
|---|---|---|
| `user`, `session`, `account`, `verification` | as Better Auth defines them | |
| `workspace` | name, slug (unique), owner_id, roadmap_id, roadmap_version_seen, start (a Monday), mode (steady/grind) | One per roadmap a person follows |
| `workspace_member` | workspace_id, user_id, role (`admin`/`member`/`guest`; `mentor` later), is_active | Unique (workspace_id, user_id). The creator is `admin`. |
| `workspace_invite` | workspace_id, email, role, token (random, single use), invited_by, accepted_at, expires_at | Table exists now; inviting is switched on later |
| `mode_change` | workspace_id, on_date, mode | Mode history (today's `modes`) |
| `track` | workspace_id, template_track_id, key (DSA…), name, sort_order, next_sequence | Plane's project |
| `module` | workspace_id, track_id, template_module_id, name, sort_order | |
| `cycle` | workspace_id, number, start_date, end_date, is_overtime, progress_snapshot (jsonb), closed_at | Mon–Sun weeks, created for the plan length (+ overtime, audit 7) |
| `work_item` | workspace_id, track_id, parent_id (sub-items), template_item_id (null for own items), sequence (DSA-12), title, url, url2, kind, estimate_min, state, done_at, planned_cycle, cycle_id (effective), carried_from_cycle, module_id, sort_order (float, as Plane), needs (template ids), meta (jsonb: pattern, slug, diff, role, hiddenUntilStart), note, edited_fields (text[]), daily_date (for daily items), retired | **State lives on the item, shared, as in Plane.** |
| `work_item_assignee` | work_item_id, user_id | Exists now; assigning switched on later |
| `label`, `work_item_label` | as Plane | Owner labels |
| `view` | workspace_id, name, filters (jsonb) | Saved filters |
| `page` | workspace_id, title, body | Notes |
| `solve_log`, `score`, `bookmark` | today's maps, as rows | |
| `instance_admin` | user_id | Owner-only admin app access (round 2, item 9) |
| `roadmap_version` | roadmap_id, version, snapshot (jsonb), notes, released_at | Seeding, updates, rollback |
| `user_ai_key` | user_id, provider, ciphertext, iv, key_version, last4 | Bring your own key (round 3) |
| `news_day`, `news_item`, `pulse_week`, `interview_thread`, `engine_run` | global, not per workspace | News engine (round 2, item 2) |
| `notification`, `notification_preference` | as round 2, item 5 | Phase 3 |

Users also get `timezone` (IANA) on the `user` row (round 2, item 3).

States: `backlog`, `todo`, `in_progress`, `done`, `cancelled`. A parent with sub-items is done when all its
sub-items are done (or set directly).

**Later, without redesign:** inviting members and assigning items (tables exist); a `mentor` role; if two people
ever follow the same roadmap together, a `work_item_progress (work_item_id, user_id, state, done_at, cycle_id)`
table, filled once by copying each item's state to its owner.

## Roadmap templates, seeding and versions

Modelled on Plane's workspace seed (`apps/api/plane/seeds/data/*.json` + `bgtasks/workspace_seed_task.py`: one
JSON file per entity, local ids, a seed job that creates rows and maps seed ids to new ids), with two additions
Plane does not have: **stable string ids** and **versions**.

- **Authoring** stays in TypeScript (today's content modules and track builders, with their tests).
- **A build step** writes one folder per release: `roadmaps/<roadmap-id>/v<N>/` with `roadmap.json` (id, version,
  title, release notes, modes), `tracks.json`, `modules.json`, `work_items.json` (with sub-items and `needs`),
  `daily.json`, `labels.json`, `views.json`, `pages.json`. Committed to git: every version is kept and diffable.
- **Validation** (zod) before a version is accepted: unique ids; no id reused from an earlier version with a
  different meaning; every `needs` points at a real item; 78 slots per track; retired items never deleted.
- **`roadmap_version` table:** roadmap_id, version, snapshot (jsonb), notes, released_at. Released versions are
  loaded into it by a deploy-time script.
- **Seeding** a new workspace (as Plane's seed task): create tracks, modules, cycles (from start date and mode, not
  from a file), work items and sub-items, labels, views, pages; store each row's `template_*_id`.
- **Updating** a workspace from vN to vN+1: diff the two snapshots by id; insert new items into their planned
  cycles; update title/links/estimate where the user has not edited that field; soft-delete untouched removed
  items, keep and mark retired those with progress; record the version; show "What changed" once. Both
  snapshots stay stored, so an update can be inspected or rolled back.
- Several roadmaps later = several folders; a future in-app editor (owner or mentor) writes the same JSON.

## Data model (template shape, in code)

### Roadmap template (content, shipped with the app)

```ts
type Roadmap = {
  id: string;            // 'interview-2026'
  version: number;       // bumped on every content change
  title: string;
  tracks: Track[];       // order = display order
  modes: { steady: { cycles: 17 }; grind: { cycles: 13 } };
  daily: DailyItem[];    // per-day work items: one DSA problem, recall, daily log (generated for every day of a cycle)
};
type Track = { id: string; key: string; name: string; modules: Module[]; items: WorkItem[] };
type Module = { id: string; name: string };
type WorkItem = {
  id: string;            // stable forever (reuses today's content ids, e.g. 'ai:rag-paper')
  seq: number;           // per-track number for the visible id (DSA-12); never reused
  title: string; url?: string; url2?: string;
  estimateMin: number;
  moduleId?: string;
  slot: number;          // 1..78: position in its track's sequence (today's slot)
  sub?: SubItem[];       // Understand / Do / Explain, or a set's problems
  needs?: string[];      // ids that must be done or scheduled earlier
  kind?: 'lesson' | 'problem' | 'rep' | 'mock' | 'set';
  meta?: { pattern?: string; slug?: string; diff?: 'E'|'M'|'H'; role?: string; hiddenUntilStart?: boolean };
  retired?: true;        // kept for history, never scheduled again
};
type SubItem = { id: string; title: string; url?: string; estimateMin?: number };
type DailyItem = { id: string; title: string; estimateMin: number; generator: 'dsa-problem' | 'recall' | 'log' }; // materialised as ordinary work items, one per day, ids '<id>:<date>'
```

The track builders in `tracks.ts` and the content modules stay; a thin adapter turns today's slot rows into
`WorkItem`s (a learning slot → one work item with 2–3 sub-items).

### Cycle planning (pure, derived)

- **Planned cycle** of a work item = the cycle its slot falls in under the user's mode (Grind: 6 slots a week;
  Steady: the existing 78-in-102 rotation, now counted per week). Within a cycle, items are ordered by
  track order then slot (the recommended order).
- **Effective cycle** = the user's override if set; else the planned cycle if that cycle has not ended; else, if
  the item is not Done or Cancelled, **the current cycle** (carried over, with `carriedFrom` = first cycle).
- **Needs** never block doing an item; they only keep the planned order sensible and show "needs DSA-11".
- Mode switch: re-plans **future** cycles only; done items stay done; nothing is lost.

### User data

Lives in the database tables above (the earlier "overlay" type sketch is superseded): each workspace has its own
`work_item` rows seeded from the template, holding state, cycle, estimate, order and note.

### Import of existing local data (dropped: see O2, no import)

The new app runs on another domain, so it cannot read the old site's browser storage. Import comes from an
"Export my data" JSON file added to the old site, or from the owner's Gist with its token (see the audit, item
O2, for what actually maps). Mapping: `done[id]` → state Done (+ doneAt); `status` progress/skipped → In progress/Cancelled; `custom` tasks → own
items in the cycle of their date; `tnotes` → item notes; labels, notes, pages, solves, scores, bookmarks kept;
`routine`, `sundayMode` dropped; mode history kept.

## Screens

- **Sign in** (Google), then **create workspace** (pick the roadmap, start Monday, mode).
- **Today** (focus): today's daily items (DSA problem, recall, log), then **Up next**: the next items of the
  current cycle in recommended order, enough to fill today's share of the cycle's remaining estimate.
  Carried-over items are marked. No clock times.
- **Cycle** (replaces the day view as the main list): "Cycle 3 · 12 of 48 done · 18 h left · 3 carried over",
  items grouped by track (or by state), in order, with estimate, state, module, id. Burn-down by estimate shows
  scope added by carry-over, so pile-ups are visible.
- **Tracks** (Plane's project view): a track's items by module or cycle, with progress.
- **Work item peek**: title, id, state, estimate, cycle (move to another cycle), module, needs, sub-items with
  their own ticks, links, note, labels.
- **Progress, Roadmap, Notes, DSA, News, Setup** stay; Setup loses the routine, timetable and Gist sync, keeps
  mode, start date, theme, labels, and gains **Account** (sign out) and **Members** (read-only list for now).
- **Own items**: "New work item" picks track, cycle, estimate, optional sub-items.

## What goes

Block times and the weekday/Sunday timetables (`schedule.js` blocks), the routine form and `routine.ts`,
bedtime moves, the calendar `.ics` export (no times to export), the "behind by N hours" clock maths (replaced by
estimate-based "N h left this cycle"), Gist sync and its merge code, GitHub Pages hosting and the static export.

## Constraints

- Free tiers to start: Vercel Hobby (personal, non-commercial; a public product later needs Pro), Neon free,
  Trigger.dev free, Resend free. No paid services required for the owner's own use.
- The roadmap v3 rules hold: 78 slots per track, order, Steady/Grind lengths, DSA every day (a daily work item that piles up if missed),
  coverage test, nothing cut.
- Plain English UI; no project-management jargon beyond the Plane names above.

## Decisions the builder makes (controller calls, marked)

- **Ids:** a work item's template id is the content row id; sub-items get `<id>#understand`, `<id>#do`,
  `<id>#explain` (and `<id>#<slug>` for set problems). Imported v6 ticks map to the matching sub-item.
- **Mode switch:** re-plans only items in cycles after the current one that are not done; anything already
  carried over stays carried over (a switch never hides a pile-up).
- **Recall** points at the most recent AI-core and Systems work items marked done.
- **Old app:** the GitHub Pages site keeps running unchanged until the owner moves to the new one.

## Left to the builder

Exact component layout; how "today's share" is computed (suggested: remaining cycle estimate ÷ remaining days in
the cycle); burn-down drawing details; id key choices if a better short key exists.

## Decisions, round 2 (owner, 2026-11-16), with what Plane does

1. **Quizzes and AI agents: later releases.** Keep room for them (the AI-key store ships in Phase 1, round 3), work items
   addressable by id for "Ask AI", notes linkable to work items. Personas stay as written in the v2 spec appendix
   (Explainer, Coach, Interviewer; bring your own key).
2. **News and the weekly refresh engine move into the database; no GitHub Actions.**
   Plane runs scheduled work with Celery beat (a schedule table of crontab jobs, e.g. email stacking every 5
   minutes, daily cleanups at fixed UTC times). Our simple equivalent (superseded in round 3 by **Trigger.dev**,
   with Vercel Cron as the fallback): a scheduler calls protected API routes (service token) on a schedule; the jobs write to tables `news_day`, `news_item`, `pulse_week`,
   `interview_thread`, `engine_run` (status, started/finished, error). The engine's LLM key is a server env var.
3. **Days and time zones (Plane's model):** `user.timezone` (IANA name, default UTC; auto-set from the browser on
   first sign-in, editable in Setup), as Plane's `user_timezone`. Dates are stored as dates; timestamps in UTC.
   "Today", a cycle's start (Mon 00:00) and end (Sun 23:59:59) are computed in the user's zone (Plane's
   `convert_to_utc` turns a date into local midnight in UTC). **Carry-over runs lazily** on the first request
   after a cycle ends (idempotent), no cron needed; it first saves the ending cycle's stats into
   `cycle.progress_snapshot` (jsonb), exactly as Plane's `transfer_cycle_issues` does, then moves unfinished items
   to the current cycle (Plane does this when the user clicks "Transfer"; we do it automatically).
4. **Progress by estimates (Plane's burn-down):** Plane's `burndown_plot` builds a day-by-day series over the
   cycle's date range from each completed item's `completed_at`, by item count or by estimate points, and
   compares it with an ideal line. Ours: the same per-cycle series by **estimate minutes** (and by count), plus
   the scope added by carry-over (from the snapshot), so pile-ups show; per-track and whole-plan progress by
   estimate; pace and forecast kept from today's code but fed by estimates instead of clock hours.
5. **Reminders, simplified from Plane's notifications:** Plane has `notification` (receiver, entity, title,
   read_at, snoozed_till, archived_at), `user_notification_preference`, and `email_notification_log` with a job
   that batches emails every 5 minutes. Ours: `notification` (same core columns) for an in-app inbox, and
   `notification_preference` (daily email on/off, time). A daily Trigger.dev task creates "Today: N items · cycle:
   N h left" reminders and sends them by email through **Resend** for users who opted in.
6. **Sign-up: owner only for now.** An allowlist (`ALLOWED_EMAILS` env var); the owner will share the address.
7. **Account basics:** delete my account (soft delete, then hard delete after 30 days, as Plane's daily
   `hard_delete` job); export my data (JSON; CSV later), as Plane's exporter.
8. **Testing and environments:** Docker Compose with Postgres for local development and tests; Neon for preview
   and production.
9. **Content releases from a separate admin app (turborepo, as Plane's `apps/admin` "god mode"):** Plane has an
   `instance_admin` table and a separate admin app for instance settings. We do the same: a turborepo with
   `apps/web` (the app), `apps/admin` (owner only: publish a roadmap version from the built JSON, see the diff,
   apply it to workspaces, roll back to an earlier version; run the news engine and see its runs; manage the
   allowlist), and shared packages `packages/db` (Drizzle schema + migrations), `packages/roadmap` (content,
   builders, validation, JSON build), `packages/ui`. Admin access: an `instance_admin` table (owner only).
10. **Offline: as Plane.** Plane keeps no full offline copy: data lives in memory stores fetched with SWR
    (revalidate on focus and reconnect), a small IndexedDB cache for a few user things, and an online-status
    hook that shows when you're offline. Ours: show the last loaded data, show an "Offline" banner, block edits
    while offline, refetch on reconnect.
11. **Phone:** not a focus; desktop web first (no breakage on small screens, no special phone layouts).

## Decisions, round 3 (owner, 2026-11-16)

- **Repo:** a new private turborepo named **`IDT`** (public later). Layout: `apps/web` (the app), `apps/admin`
  (owner-only: roadmap releases, rollback, news engine runs, allowlist), `apps/jobs` (Trigger.dev tasks),
  `packages/db` (Drizzle schema, migrations, seed), `packages/roadmap` (content, track builders, validation, JSON
  build: moved from this repo with its tests), `packages/ui`, `packages/config`. This repo (`offer-in-90`) becomes
  the archive; PR #2 is closed with a link to the new repo.
- **Sign-in:** Google only for now (Better Auth). Allowlist: `shashwa7.dev@gmail.com` (in env, not hard-coded).
- **Jobs: Trigger.dev free plan**, set up like shopos `apps/pro-backend-triggers` (`trigger.config.ts`, retries
  with backoff, a global `onFailure` hook): scheduled tasks (weekly news refresh, daily reminder email) call
  protected routes on `apps/web` with a shared service token (Bearer), as the shopos credits reaper does. Vercel
  Cron is the free fallback (same routes). No GitHub Actions for the news engine.
- **No Redis.** Postgres holds sessions; Trigger.dev is the queue; Next.js caches. Upstash Redis can be added later
  for rate limits without redesign.
- **Bring your own AI key from day 1:** Setup › AI keys (provider + key, tested once on save). Keys are encrypted
  at rest (AES-256-GCM, server secret `AI_KEYS_ENCRYPTION_KEY`), never returned to the browser (last 4 shown), used
  only by server code. Table `user_ai_key` (user_id, provider, ciphertext, iv, last4, created/updated). The news
  engine alone uses the owner's server key. Agents and quizzes ship later on top of this.
- **GitHub Actions: CI only** (lint, types, unit tests, build, migration check; e2e against Docker Postgres).
- **README for strangers:** clone → `docker compose up -d` → `pnpm install` → `cp .env.example .env` →
  `pnpm db:migrate` → `pnpm db:seed` → `pnpm dev`; every env var explained in `.env.example`; no secrets
  committed; a licence chosen before going public.
- **Plane is AGPL:** we copy ideas, names and table shapes only, never code.
- **Phases:** 1. sign-in, workspace seed, Today, Cycle, carry-over, Progress, BYOK settings, import of old data
  (via an "Export my data" file from the old site, or from the Gist with its token); 2. admin app (releases,
  rollback) and news engine on the DB via Trigger.dev; 3. notifications and reminder email, export and delete
  account. Later: AI agents, quizzes, members/invites, mentors. The plan includes a **feature-parity checklist**
  (DSA page and solve logs, own problems, Notes, labels/filters, search, News/Interviews/Pulse, bookmarks,
  scores/readiness, reference pages, theme, mode badge), each assigned to a phase. (Import of old data: dropped, O2.)
- **Daily DSA problem:** picked day by day from what is already covered (as today), materialised as that day's
  work item when the day first loads.

### Environment variables (expected; the owner provides values)

| Variable | For |
|---|---|
| `DATABASE_URL` | Neon (prod/preview) or Docker Postgres (local) |
| `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` | Better Auth sessions and callbacks |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google sign-in |
| `ALLOWED_EMAILS` | Sign-up allowlist (`shashwa7.dev@gmail.com`) |
| `ADMIN_EMAILS` | Seeds `instance_admin` for the admin app |
| `AI_KEYS_ENCRYPTION_KEY` | Encrypts users' AI keys (32-byte base64) |
| `SERVICE_TOKEN` | Trigger.dev tasks → app routes |
| `TRIGGER_PROJECT_ID`, `TRIGGER_SECRET_KEY` | Trigger.dev |
| `ENGINE_AI_PROVIDER`, `ENGINE_AI_API_KEY` | The news engine's own model key |
| `RESEND_API_KEY`, `EMAIL_FROM` | Reminder emails (phase 3) |
| `APP_URL`, `ADMIN_URL` | Links in emails; admin cross-links |

## Still open

- None blocking. The owner confirms the design as a whole at the start of the implementation session.

## Audit (2026-11-16): fixes and rules added

Contradictions fixed above: status line; members/assignees vs non-goals; Workspace vs Roadmap naming; GitHub
sign-in; stale overlay types; `sundayCarry`; import from browser storage; Vercel Cron vs Trigger.dev; AI-key
timing; free-tier note.

Rules added (controller calls, the builder follows them):

1. **Missed days still create their daily items.** Daily items (DSA problem, recall, log) are materialised on
   load **for every day from the last materialised day up to today** (not only today), so days the user did not
   open the app still pile up, as the owner wants.
2. **Estimates live on leaf items only.** A work item with sub-items has no estimate of its own; it shows the sum
   of its sub-items. Burn-down, "h left" and progress count leaves only (no double counting).
3. **Parent and sub-item states.** A parent is done when all its sub-items are done; marking a parent done marks
   its open sub-items done; reopening any sub-item reopens the parent. Cancelled items leave the scope and never
   carry over.
4. **Visible ids never collide.** Roadmap items take their sequence from the template (`seq`); own items get a
   separate counter starting at 1000 per track (DSA-1000, DSA-1001…), so a later roadmap version adding template
   items can never take an own item's number. Ids are never reused.
5. **Roadmap updates respect edits.** `work_item.edited_fields text[]` records which fields the user changed
   (title, url, estimate, cycle, order, deleted); updates skip those fields. A user-deleted item is never
   re-added by an update.
6. **Rollback** applies an older snapshot with the same diff rules (items the newer version added are kept and
   marked retired if they have progress, removed if untouched). Both directions are tested.
7. **Plan overrun.** If work remains after the last planned cycle, the app creates the next cycle automatically
   (an "overtime" cycle, marked as such) and keeps carrying over until everything is done or cancelled (see O1).
8. **Cycle end in the user's zone:** cycles are stored as dates; "ended" means the user's local Sunday has
   passed. Changing the time zone recomputes "today" only; past dates do not move.
9. **Admin app auth:** `apps/admin` uses the same Better Auth instance and database (its own domain, its own
   cookie) and requires a row in `instance_admin` on every request.
10. **Production migrations** run as a step of the Vercel build for `apps/web` (`drizzle-kit migrate`) against the
    branch database; CI checks that the schema and migrations match. Neon's Vercel integration gives each preview
    its own database branch.
11. **Backups:** Neon's point-in-time restore (free tier history window) plus the user's JSON export.
12. **Errors and logs:** Phase 1 uses Vercel logs and Trigger.dev run logs; Sentry is optional later (env
    `SENTRY_DSN`), wired like shopos's `onFailure` hook.

AI keys: the providers are the four from the Release 3 plan; each key is stored with a `key_version` so the
encryption key can be rotated.

## Owner decisions (audit, 2026-11-16)

- **O1. Plan overrun: overtime cycles.** When work remains after the last planned cycle, new "overtime" cycles are
  added automatically until everything is done or cancelled (audit rule 7).
- **O2. No import.** Nothing is in real use yet, so IDT starts fresh: no export button on the old site, no Gist
  import, no id mapping. Drop the import from Phase 1. (Supersedes the "Import of existing local data" section.)
- **Standing rule (owner):** the app is early-stage beta with no active users. Prefer the clearly better design
  even if it means rebuilding existing parts or breaking old data; no backward-compatibility work for the old app.

## Later release: workspace memory (owner idea, 2026-11-16)

A per-workspace "brain" that understands **how this person works and learns**: it observes and describes, it
does not act or recommend on its own. Modelled on shopos `brand-memory-service` (`brand_memory_schemas`: a
versioned schema of what a memory holds; `brand_memories`: the generated JSON per version, built by an agent in a
Trigger.dev task; `user_brand_memories`: the user's edited copy), kept small:

1. **Facts (no AI):** computed from the activity log and solve logs: when the person actually studies (days,
   times), real pace per track vs estimates, carry-over rate per track, what gets skipped or cancelled, DSA
   patterns that are slow, need hints or get flagged, streaks and slumps.
2. **Summary (AI, the user's own key):** at each cycle end a Trigger.dev task reads the facts, notes and solve logs
   and writes a short memory document against a versioned schema (`memory_schema`): strengths, weak spots, habits,
   how they seem to learn best, open questions. Stored in `workspace_memory` (workspace_id, schema_version, data
   jsonb, generated_at).
3. **Owned by the user:** a Memory page to read, correct or delete it (`workspace_memory_edit`, like
   `user_brand_memories`).
4. **Used later** as context for the AI agents (Explainer, Coach, Interviewer) and the end-of-cycle review.

**Phase 1 additions so memory has history to learn from (controller call, an obvious improvement):**
- `work_item_activity` (append-only, as Plane's issue activity): work_item_id, actor_id, verb (state, cycle,
  estimate, order, note, created, deleted), old_value, new_value, at. Written by the server on every change.
- `work_item.actual_min` (optional): "time spent", asked lightly when an item is marked done.
