# Today: Statuses, Filters, Cycles, Search — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every task a Linear/Plane-style status, add a Linear-style filter bar and full-width cycle column to Today, a Cycles list in the sidebar, and one ⌘K search for everything.

**Architecture:** Cycle analytics follow Plane's model (state groups, progress = done ÷ (total − skipped), burn-down of pending vs ideal, trailing count, tasks/hours unit) with a schedule-based ideal line. Pure, Node-tested logic modules (`task-status`, `task-filter`, `cycle`, `search`) with type-only imports; UI built on the existing shell parts (`src/components/shell/page.tsx`). Status is a new synced per-item map next to `done`, so old data and sync keep working.

**Tech Stack:** Next.js 15 static export, React 19, Tailwind v4, shadcn (Command/CommandDialog, Popover, DropdownMenu), Node 24 `--experimental-strip-types` tests, Playwright smoke (`--mute-audio`).

**Spec:** `docs/superpowers/specs/2026-11-14-today-statuses-cycles-design.md` (builds on `docs/superpowers/specs/2026-11-14-minimal-redesign-design.md`)

## Global Constraints

- All constraints of `docs/superpowers/plans/2026-11-14-minimal-redesign.md` § Global Constraints still apply (ink/grey palette, stone only for missed/risky, Inter, radii, shared parts, preserve-behaviour list, `NEXT_DIST_DIR=.next-build` builds, smoke against the dev server with `--mute-audio`, `text-faint` only for non-essential metadata).
- Statuses and labels exactly: "Not started" (○), "In progress" (◐), "Done" (●), "Skipped" (⊘).
- Done stays stored in `state.done`; `state.status` holds only `'progress' | 'skipped'`. Clicking the status icon toggles Done ↔ Not started.
- Skipped tasks never count as missed, toward plan minutes/hours, toward "behind", or toward ring totals.
- Filter/display state lives in `localStorage` (guarded), key `offer90.todayFilter`; it is not synced.
- Empty filter result copy: "No tasks match these filters."
- Track mapping: dsa→DSA; fe→Frontend & CS; sd→System design; mc, proj→Machine coding; ai→AI; beh, ux, fde→Career; review, health, update→no track.
- A cycle = plan week (`Day.week`).

## Review Focus

1. **Old saved data without `status`** loads, syncs and counts exactly as before. Pinned in Task 1 (normalize + sync test).
2. **A task both ticked and later set In progress / Skipped** never appears as two statuses. Pinned in Task 1 (`applyStatus` transition tests).
3. **Skipping every task of a day** gives 0 planned minutes without NaN in rings, summary %, forecast or cycle %. Pinned in Task 1 (dayStats test via `studyCounts`) and Task 5 (cycle test).
4. **Filters that match nothing** show the empty copy, not a blank sheet; clearing filters restores the time-of-day layout and the current block. Pinned in Task 3 tests and Task 4 smoke.
5. **⌘K with no data files** (no news/threads) still searches tasks and notes; "Go to Day N" rejects out-of-range numbers. Pinned in Task 7 tests.

---

### Task 1: Status model, state and counts

**Files:**
- Create: `src/lib/task-status.ts`, `scripts/test-task-status.ts`
- Modify: `src/lib/store.tsx` (State.status, fresh, normalize), `src/lib/sync-merge.ts` (MAPS), `src/lib/engine.ts` (dayStats, overall), `scripts/test-sync-merge.ts`
- Modify callers of `dayStats`/`overall` to pass `state.status`: `src/components/today-view.tsx`, `src/components/progress-view.tsx`, `src/components/roadmap-weeks.tsx`, `src/components/shell/app-sidebar.tsx` (and any other `grep -rn "dayStats\|overall(" src` hit)

**Interfaces:**
- Produces (`src/lib/task-status.ts`, no runtime imports):
```ts
export type TaskStatus = 'todo' | 'progress' | 'done' | 'skipped';
export type StatusMap = Record<string, 'progress' | 'skipped'>;
export const STATUS_LABEL: Record<TaskStatus, string>; // todo 'Not started', progress 'In progress', done 'Done', skipped 'Skipped'
export function statusOf(id: string, done: Record<string, number>, status: StatusMap): TaskStatus; // done wins
export function applyStatus(s: { done: Record<string, number>; status: StatusMap }, id: string, next: TaskStatus, now: number): { done: Record<string, number>; status: StatusMap }; // new objects
export function studyCounts(tasks: { id: string; min: number; study: boolean }[], done: Record<string, number>, status: StatusMap): { n: number; total: number; doneMin: number; planMin: number; byStatus: Record<TaskStatus, number> }; // skipped excluded from total/planMin/n
```
- `State.status: StatusMap` (default `{}`), in `MAPS`.
- `dayStats(d: Day, done: Record<string, number>, status: StatusMap = {})` and `overall(days, done, ti, status: StatusMap = {})` exclude skipped via `studyCounts`; return shape unchanged plus `byStatus`.
- Missed/overdue computations (today-view overdue list, missed counts, blockStatus 'missed') treat skipped as not missed.

- [ ] **Step 1: Write failing tests** `scripts/test-task-status.ts`: `statusOf` returns 'done' when `done[id]` set even if `status[id]==='progress'`; `applyStatus(…,'progress')` removes `done[id]` and sets `status[id]`; `applyStatus(…,'done')` sets `done[id]=now` and deletes `status[id]`; `applyStatus(…,'todo')` deletes both; input objects not mutated; `studyCounts` with one skipped of three 60-min study tasks → `total 2`, `planMin 120`; all skipped → `total 0`, `planMin 0`; `byStatus` counts each status. Add sync-merge scenario 11: an old state without `status` merged with one that has `status:{a:'progress'}` keeps it; normalize of `{}`-less state yields `status: {}`.
- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3:** Implement module, state field, MAPS entry, engine params, caller updates.
- [ ] **Step 4:** `npm test`, `npx tsc --noEmit -p .`, `npm run lint`, `node scripts/smoke.mjs <shots>` → pass (behaviour unchanged with empty status).
- [ ] **Step 5:** Commit `feat(status): task status model`.

---

### Task 2: Status icon, menu and keys

**Files:**
- Create: `src/components/status-control.tsx`
- Modify: `src/components/task-row.tsx`, `src/components/task-peek.tsx`, `src/components/today-view.tsx`, `scripts/smoke.mjs`

**Interfaces:**
- Consumes: `statusOf`, `applyStatus`, `STATUS_LABEL` (Task 1).
- Produces: `<StatusIcon status={TaskStatus} size?={number} />` (○ dashed circle, ◐ half-filled, ● ink check, ⊘ circle with slash, all ink/grey) and `<StatusControl taskId={string} label={string} />`: icon button (click toggles done↔todo, aria-label `${label}: ${STATUS_LABEL[s]}`), ▾ trigger (visible on hover/focus, always on touch) opening a DropdownMenu with the four statuses and hints 1–4; right-click on the row opens the same menu.
- Keys: on a focused task row, `S` opens the menu, `1`–`4` set Not started/In progress/Done/Skipped; same keys inside the task peek. Ignored while typing in inputs.
- Row shows an "In progress" or "Skipped" Chip; skipped text is faint (not struck through); done stays struck through.

- [ ] **Step 1:** Extend smoke: clicking a task's icon marks it done (`done[id]` set); menu → In progress sets `status[id]='progress'` and shows the chip; key `4` on a focused row sets skipped and the block's missed count drops; peek shows the same status control.
- [ ] **Step 2:** Run smoke → FAIL.
- [ ] **Step 3:** Implement; replace the checkbox in TaskRow with `StatusControl` (keep `aria` name equal to task text for existing smoke selectors, update selectors where needed).
- [ ] **Step 4:** tsc, lint, test, smoke → pass; look at 1100 and 390 screenshots.
- [ ] **Step 5:** Commit `feat(status): status icon, menu and keys`.

---

### Task 3: Filter logic

**Files:**
- Create: `src/lib/task-filter.ts`, `scripts/test-task-filter.ts`

**Interfaces:**
- Consumes: `TaskStatus`, `statusOf` (Task 1); `TrackKey` (`src/lib/timeline.ts`).
- Produces:
```ts
export type GroupBy = 'time' | 'status' | 'track';
export interface TaskFilter { status: 'all' | TaskStatus; tracks: TrackKey[]; blocks: string[]; owner: 'all' | 'own' | 'plan'; diff: ('E' | 'M' | 'H')[] }
export const EMPTY_FILTER: TaskFilter; // status 'all', [] , [], 'all', []
export function trackOfCat(cat: string): TrackKey | null; // per Global Constraints mapping
export function isActive(f: TaskFilter): boolean;
export function matches(t: { id: string; cat: string; own?: string; diff?: 'E' | 'M' | 'H' }, blockKey: string, f: TaskFilter, done: Record<string, number>, status: StatusMap): boolean; // empty arrays = no constraint; diff filter excludes tasks without diff
export function statusCounts(tasks: { id: string }[], done, status): Record<'all' | TaskStatus, number>;
export function parseFilter(raw: unknown): { filter: TaskFilter; groupBy: GroupBy }; // tolerant of junk → EMPTY_FILTER/'time'
```
- [ ] **Step 1: Write failing tests**: each mapping in `trackOfCat` incl. `proj`→'mc', `ux`→'career', `review`→null; status filter; tracks OR within, AND across dimensions; owner own/plan; diff excludes no-diff tasks; `isActive(EMPTY_FILTER)===false`; `parseFilter('garbage')` and `parseFilter({status:'nope'})` return defaults; `statusCounts` sums to `all`.
- [ ] **Step 2:** `npm test` → FAIL. **Step 3:** implement. **Step 4:** `npm test`, lint → pass. **Step 5:** Commit `feat(today): filter logic`.

---

### Task 4: Today filter bar, Display, full width

**Files:**
- Create: `src/components/today-filters.tsx`
- Modify: `src/components/today-view.tsx`, `src/app/page.tsx` (main width for Today), `scripts/smoke.mjs`

**Interfaces:**
- Consumes: Task 3 module, `TRACKS`, `bandOf`, shared parts, `Seg`.
- Produces: `<TodayFilters value={{filter, groupBy}} onChange counts={statusCounts} blocks={{k, title}[]} />` — status pills with counts (`All`, `Not started`, `In progress`, `Done`, `Skipped`), "+ Filter" Popover+Command (Track, Block, Yours / plan, Difficulty → sub-list of values), one removable chip per active dimension ("Track is DSA, System design ✕"), "Display" DropdownMenu (Group by: Time of day / Status / Track). State persisted to `localStorage['offer90.todayFilter']` via `parseFilter`.
- Today header crumbs become `Week N › Day N of 91 › date` (prep: `Week 1 › Day 0 · prep › date`); actions ‹ Today › Display "+ New task" (black, label visible ≥ sm, icon on phones).
- Today page uses the full main width (remove the narrow max-width for Today in page.tsx); list in a left column, right column slot (empty placeholder until Task 6) at ≥ lg (`grid-cols-[minmax(0,1fr)_300px]`), stacked below on smaller screens.
- Grouping: time (existing bands), status (bands Not started / In progress / Done / Skipped listing tasks with their block title as a chip), track (bands per TRACKS name + "Other"). While a filter is active, blocks without matching tasks and life blocks are hidden; "Missed earlier" band also filters. Empty → "No tasks match these filters."

- [ ] **Step 1:** Extend smoke: pill "In progress" shows only in-progress tasks; adding Track=DSA via "+ Filter" shows a chip and hides non-DSA blocks; Display→Status renders a "Done" band; reload keeps the filter; a filter matching nothing shows the empty copy; clearing returns `data-now` row; 1100px page has the list and right column side by side; 390px no horizontal scroll.
- [ ] **Step 2:** Run → FAIL. **Step 3:** implement. **Step 4:** tsc, lint, test, smoke → pass; look at screenshots. **Step 5:** Commit `feat(today): filter bar, display, full width`.

---

### Task 5: Cycle logic (Plane model)

**Files:**
- Create: `src/lib/cycle.ts`, `scripts/test-cycle.ts`

**Interfaces:**
- Consumes: `statusOf`, `StatusMap`, `TaskStatus` (Task 1); `trackOfCat` (Task 3); `TRACKS` (timeline). Day shape only (type import).
- Model (mirrors Plane's cycle analytics): Not started ≈ unstarted, In progress ≈ started, Done ≈ completed, Skipped ≈ cancelled (excluded from totals). Progress = done ÷ (total − skipped). Pending on a date = cycle tasks neither done nor skipped by the end of that date, using completion times: `done[id]` (timestamp) and `meta['status/<id>']` (timestamp of the last status change, for skipped). Ideal = **scheduled** remaining: total − tasks scheduled on cycle days up to and including that date (not Plane's straight diagonal). Trailing = pending(today) − ideal(today) (positive = trailing, negative = ahead). Unit toggle: `'tasks'` counts tasks, `'hours'` sums task `min`/60.
- Produces:
```ts
export type CycleUnit = 'tasks' | 'hours';
export interface CycleDayInput { i: number; week: number; date: Date; type: string; tasks: { id: string; cat: string; min: number; study: boolean; own?: string }[] }
export interface CycleSummary {
  week: number; from: Date; to: Date; daysLeft: number;            // daysLeft counts today; 0 after the cycle
  byStatus: Record<TaskStatus, number>; total: number; pct: number; // total excludes skipped; pct 0 when total 0
  days: { i: number; date: Date; isToday: boolean; byStatus: Record<TaskStatus, number> }[];
  burndown: Record<CycleUnit, { pending: (number | null)[]; ideal: number[]; total: number }>; // per cycle day; pending null for days after today
  trailing: Record<CycleUnit, number | null>;                     // null when today is outside the cycle
  tracks: { track: TrackKey; name: string; done: number; progress: number; total: number }[];
}
export function cycleOf(days: CycleDayInput[], week: number, done: Record<string, number>, status: StatusMap, meta: Record<string, number>, todayIdx: number, now: number): CycleSummary | null; // null if no days in week; only study tasks counted
export function cycleList(days: CycleDayInput[], todayIdx: number, done, status, meta, now): { week: number; pct: number; state: 'current' | 'upcoming' | 'past' }[]; // previous, current, next (first two / last two at the ends)
```
- [ ] **Step 1: Write failing tests** `scripts/test-cycle.ts` with a 7-day synthetic week (study tasks of 60 min, varied days): byStatus and pct; all-skipped week → total 0, pct 0, no NaN in burndown/trailing for both units; pending on day k counts a task done (by timestamp) after day k as still pending; a task ticked later for an earlier day is not pending on days after its tick time; skipped (meta time) leaves pending from that day; ideal follows the schedule (a day with no tasks keeps ideal flat); trailing = pending(today) − ideal(today), negative when ahead; hours unit sums minutes/60; `daysLeft` = 4 when today is the cycle's 4th day; pending is null after today; `tracks` omits empty tracks and maps proj→Machine coding; `cycleList` at plan start returns current + next, at the end previous + current; unknown week → null.
- [ ] **Step 2:** `npm test` → FAIL. **Step 3:** implement. **Step 4:** pass. **Step 5:** Commit `feat(cycle): Plane-style cycle summary`.

---

### Task 6: Right column and sidebar Cycles

**Files:**
- Create: `src/components/today-rail.tsx`
- Modify: `src/components/today-view.tsx`, `src/components/shell/app-sidebar.tsx`, `src/components/roadmap-weeks.tsx` (accept an "expand week N" request), `src/components/ui-state.tsx` + `src/app/page.tsx` (a `focusWeek` value + setter), `scripts/smoke.mjs`

**Interfaces:**
- Consumes: `cycleOf`, `cycleList` (Task 5), `statusOf`, `StatusIcon` (Task 2), `openTask`, `openDay`, shared parts.
- Produces: `<TodayRail day={Day} />` with four cards in one column (separated by hairlines, inside the same white sheet): **Today** (stacked bar done ink / in progress #8b8f93 / skipped stone-border / rest track bg, legend with counts, "Hours done x of y h", "Next HH:MM title" or "Done for today"), **Week N cycle** (date range, "N days left"; a split status bar like Plane's — done ink / in progress #8b8f93 / not started track bg — with "x / y tasks" where y excludes skipped and a "n skipped" note when any; "Trailing by N tasks" / "Ahead by N" / "On track" from `trailing`; a mini burn-down SVG of pending (ink line + light fill) vs scheduled ideal (dashed grey) with a "Tasks | Hours" Seg; 7 day stacked status bars with today outlined, click opens that day), **Tracks this cycle** (name, done+progress bar, "d/t"), **In progress** (all in-progress tasks across the plan, newest change first via `meta['status/<id>']` time, each "◐ text · day label", click → `openTask`; empty: "Nothing in progress."). Rail shows for the viewed day's week.
- Sidebar "Cycles" section under the nav: entries from `cycleList` with StatusIcon (done ●, current ◐, upcoming ○, past with pct), label "Week N · current/next" and "%". Click → `focusWeek=N`, `go('roadmap')` with Weeks tab; Roadmap Weeks opens that phase band and expands/scrolls to that week. Hidden when the sidebar is collapsed to icons.

- [ ] **Step 1:** Extend smoke: rail visible at 1100 with the four card titles; the cycle card shows "x / y tasks" and a Trailing/Ahead/On track line, and switching Tasks→Hours changes the y-axis label; marking a task In progress adds it to the In progress card; clicking a cycle day bar opens that day; sidebar shows "Week N · current" and clicking it lands on Roadmap Weeks with that week expanded; at 390 the rail renders below the list with no horizontal scroll.
- [ ] **Step 2:** Run → FAIL. **Step 3:** implement. **Step 4:** tsc, lint, test, smoke → pass; look at 1100/390 light + dark screenshots. **Step 5:** Commit `feat(today): cycle column and sidebar cycles`.

---

### Task 7: ⌘K search

**Files:**
- Create: `src/lib/search.ts`, `scripts/test-search.ts`, `src/components/search-dialog.tsx`
- Modify: `src/components/shell/app-sidebar.tsx` (search box), `src/components/shell/bottom-bar.tsx` (More sheet search entry), `src/components/today-view.tsx` (phone search icon in header), `src/components/ui-state.tsx` + `src/app/page.tsx` (`openSearch()`, `notesSelect` request for Notes), `src/components/notes-view.tsx` (honour `notesSelect`), `scripts/smoke.mjs`

**Interfaces:**
- Produces (`src/lib/search.ts`, no runtime imports):
```ts
export type Hit =
  | { kind: 'task'; id: string; dayIdx: number; title: string; meta: string }      // meta "Day N · Track"
  | { kind: 'note'; key: string; noteKind: 'page' | 'task'; title: string; meta: string }
  | { kind: 'post'; url: string; title: string; meta: string }                     // "#Company · domain"
  | { kind: 'read'; id: string; url: string; title: string; meta: string }
  | { kind: 'day'; dayIdx: number; title: string; meta: string };                  // "Go to Day N"
export interface SearchIndex { tasks: Hit[]; notes: Hit[]; posts: Hit[]; reads: Hit[]; dayCount: number; dayIdxOfNo: Record<number, number> }
export function buildIndex(input: { days: {...}[]; pages: Record<string, { title: string; body: string }>; tnotes: Record<string, { title: string; body: string }>; posts: {...}[]; reads: {...}[] }): SearchIndex;
export function search(ix: SearchIndex, q: string, limitPerGroup = 6): { group: 'Tasks' | 'Notes' | 'Interviews' | 'Reads' | 'Go to'; hits: Hit[] }[]; // case-insensitive, all words must match (AND), title matches rank above body; empty q → []; numeric q in 0..91 adds a 'day' hit, out of range adds none
```
- `<SearchDialog />` (shadcn CommandDialog, `shouldFilter={false}`, uses `search`): groups above plus Actions (New task, Go to today, Today, Progress, Roadmap, Notes, News, Setup — actions filtered by label). Enter on: task → `openDay(dayIdx)` then `openTask(id, dayIdx)`; note → `go('notes')` with `notesSelect`; post/read → `window.open(url,'_blank','noopener')` and mark read (`seenUpdates['t-'+url]` / `['n-'+id]`); day → `openDay`. Opened by ⌘K / Ctrl+K anywhere (also while typing), `/` when not typing outside Notes (Notes keeps `/` for its own search), the sidebar box "Search everything ⌘K", the More sheet entry and the phone header icon. The index is built with `useMemo` over store data, not per keystroke.

- [ ] **Step 1: Write failing tests** `scripts/test-search.ts`: multi-word AND; title match ranked above a body-only match; `search(ix,'')` → `[]`; `'30'` adds "Go to Day 30" when dayCount ≥ 30, `'120'` adds none; index built with `posts: []`, `reads: []` still returns task and note hits; own tasks are searchable; notes body search finds a page by a body word.
- [ ] **Step 2:** `npm test` → FAIL. **Step 3:** implement `search.ts`, then the dialog and wiring. **Step 4:** Extend smoke: ⌘K opens the dialog; typing a known task word and Enter opens its day with the peek; typing "30" shows "Go to Day 30"; typing a note word opens Notes with that note selected; Esc closes. Run tsc, lint, test, smoke → pass.
- [ ] **Step 5:** Commit `feat(search): command palette for everything`.

---

### Task 8: Consistent page frame (sticky header, width, spacing)

Owner request (2026-11-14): in the main (right) panel, the page header stays sticky on every page and overscroll never moves it; content width is the same on every tab and route; the gap from the header to the content is the same everywhere.

**Files:**
- Modify: `src/components/shell/page.tsx` (PageHeader, Surface, new `PageFrame`), `src/app/page.tsx` (main container), `src/app/globals.css` (overscroll), every page view (`today-view.tsx`, `progress-view.tsx`, `roadmap-view.tsx`, `notes-view.tsx`, `updates-view.tsx`, `setup-view.tsx`), `scripts/smoke.mjs`

**Interfaces:**
- Produces: `<PageFrame header={ReactNode}>{children}</PageFrame>` — one wrapper used by all six pages: renders the page header in a sticky bar (`sticky top-0 z-20`, background = canvas, bottom hairline) and the content below it with one fixed top gap.
- One content container for every route in `page.tsx`: same max width (`max-w-[1280px]`), centred, same side gutters (16px phones, 24px ≥ md), same bottom padding (clears the phone bottom bar). No per-view widths.
- Header→content gap: 12px on every page (the same token everywhere).
- `html, body` and the inset scroll container: `overscroll-behavior-y: none` so rubber-band/overscroll can't drag the sticky header.
- Notes two-pane and Today rail keep working inside the shared width.


**Logo (owner request, same task):** use `/Users/shashwa7/Downloads/Ninja Mascot 90 Sticker Logo.png` (1254×1254, transparent PNG, black sticker with white line art) as the app logo.
- Copy it into the repo as `public/logo.png`, plus resized copies with `sips`: `public/logo-64.png` (64px, sidebar), `src/app/icon.png` (192px, Next favicon convention; delete `src/app/favicon.ico`), `src/app/apple-icon.png` (180px). Use `${BASE}` prefix for any `<img>` in components (static export with basePath).
- Replace the "90" black square mark in the sidebar header (`app-sidebar.tsx`) with the logo image (24px, rounded-full, alt "Offer in 90"), also in the collapsed icon rail. Keep "Offer in 90" text and the status line beside it.
- The logo is a dark sticker; in dark mode it sits on a dark sidebar — add a 1px ring in `--border` around it so its edge stays visible.
- Smoke: the sidebar logo `<img>` loads (naturalWidth > 0) at 1100; `/icon.png` returns 200.

- [ ] **Step 1:** Extend smoke: for each of the six pages at 1100 and 390, scroll the window to the bottom and assert the header's `getBoundingClientRect().top` is 0 (±1) and it is visible; assert the content container's width is identical across all six pages at 1100 and at 1440; assert the vertical gap between the header's bottom and the first content element is the same (±1px) on every page; computed `overscroll-behavior-y` on `html` is `none`.
- [ ] **Step 2:** Run → FAIL. **Step 3:** implement `PageFrame`, move every page's header into it, unify the container. **Step 4:** tsc, lint, test, smoke → pass; look at all pages at 1100/1440/390. **Step 5:** Commit `feat(shell): consistent sticky page frame and logo`.
