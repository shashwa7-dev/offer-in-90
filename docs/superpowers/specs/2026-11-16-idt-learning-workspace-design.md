# IDT as a learning workspace: cycles, work items, estimates (design)

Status: draft for the owner's approval (2026-11-16), revision 2 (adds the backend, the Plane-style schema and the
owner's answers). Builds on roadmap v3 (branch `roadmap-v2`, PR #2, which will not be merged: this work ships as
one fresh PR and #2 is closed then). Content is unchanged; the shape it is delivered in changes.

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

- Not a Linear/Plane clone: no teams, assignees, members, permissions, intake/triage, workflow editors, custom
  states, sprint ceremonies, priorities (order is the priority), comments, attachments, webhooks.
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
3. **Template + overlay (chosen):** the roadmap is a versioned template of work items with stable ids; the
   user's data is a thin overlay keyed by roadmap and item id, plus own items in the same shape. Updates flow;
   progress stays; several roadmaps are just several templates. Picked by the owner's requirements (frequent
   updates, multi-roadmap, own items).

## Vocabulary (Plane → IDT)

| Plane | IDT | Notes |
|---|---|---|
| Workspace | **Roadmap** | One per template; v3 is the default ("Interview prep 2026"). |
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
- **Better Auth**: sign-in with Google or GitHub; database sessions in an HTTP-only, secure cookie (as Plane).
- No Redis, queues, workers, object storage or real-time server until a real need appears.
- Every read and write goes through server code that checks workspace membership and role (never UI-only).
- Instant UI with the server as the source of truth (optimistic updates). Offline-first is a later option.

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
| `cycle` | workspace_id, number, start_date, end_date | Mon–Sun weeks, created for the plan length |
| `work_item` | workspace_id, track_id, parent_id (sub-items), template_item_id (null for own items), sequence (DSA-12), title, url, url2, kind, estimate_min, state, done_at, planned_cycle, cycle_id (effective), carried_from_cycle, module_id, sort_order (float, as Plane), needs (template ids), meta (jsonb: pattern, slug, diff, role, hiddenUntilStart), note | **State lives on the item, shared, as in Plane.** |
| `work_item_assignee` | work_item_id, user_id | Exists now; assigning switched on later |
| `label`, `work_item_label` | as Plane | Owner labels |
| `view` | workspace_id, name, filters (jsonb) | Saved filters |
| `page` | workspace_id, title, body | Notes |
| `solve_log`, `score`, `bookmark` | today's maps, as rows | |

States: `backlog`, `todo`, `in_progress`, `done`, `cancelled`. A parent with sub-items is done when all its
sub-items are done (or set directly).

**Later, without redesign:** inviting members and assigning items (tables exist); a `mentor` role; if two people
ever follow the same roadmap together, a `work_item_progress (work_item_id, user_id, state, done_at, cycle_id)`
table, filled once by copying each item's state to its owner.

## Roadmap templates and updates

The roadmap stays in code as versioned template content (today's content modules + track builders, adapted to
`WorkItem` records with stable ids). Creating a workspace **materialises** the template into `track`, `module`,
`cycle` and `work_item` rows. A new template version is applied by a server function, per workspace, keyed by
`template_item_id`: new items are inserted in their planned cycles; title/link/estimate edits update rows whose
user has not edited that field; removed template items are soft-deleted if untouched, or kept and marked retired
if the user has progress on them. Ids and sequences are never reused. A one-time "What changed" note uses
`roadmap_version_seen`.

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
  meta?: { pattern?: string; slug?: string; diff?: 'E'|'M'|'H'; role?: string; hiddenUntilStart?: boolean; sundayCarry?: boolean };
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

### User data (now in the database tables above; this was the overlay shape)

```ts
type UserRoadmap = {
  roadmapId: string; seenVersion: number;
  start: string;                // a Monday
  mode: 'steady' | 'grind';     // history kept as today (switch dates)
  items: Record<string, ItemOverride>;   // by work-item or sub-item id
  own: Record<string, OwnItem>;          // the user's work items
};
type ItemOverride = { state?: State; doneAt?: number; cycle?: number; estimateMin?: number; order?: number; note?: string; labels?: string[] };
type OwnItem = Omit<WorkItem, 'slot'> & { trackId: string; cycle: number; createdAt: number };
type State = 'backlog' | 'todo' | 'in_progress' | 'done' | 'cancelled';
```

The database tables replace the localStorage/Gist state and its merge logic.

### Roadmap updates

Shipping a new template version needs no user migration: new items appear in their planned cycles; edited text,
links and estimates show on next load; a removed item is marked `retired` (kept under "Retired" if the user had
progress, hidden otherwise). Ids are never reused. A small "What changed in the roadmap" note appears once
(`seenVersion`).

### Import of existing local data (one-time, after first sign-in)

If the browser has v6 data (localStorage or a Gist), offer "Import my progress": `done[id]` → state Done (+ doneAt); `status` progress/skipped → In progress/Cancelled; `custom` tasks → own
items in the cycle of their date; `tnotes` → item notes; labels, notes, pages, solves, scores, bookmarks kept;
`routine`, `sundayMode` dropped; mode history kept.

## Screens

- **Sign in** (Google/GitHub), then **create workspace** (pick the roadmap, start Monday, mode).
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

- Vercel + Neon free tiers to start; no paid services required.
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
