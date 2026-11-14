# Minimal Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild every screen of Offer in 90 in one minimal, black-ink, Plane-style design system using shadcn components, per the approved spec.

**Architecture:** New pure logic (forecast, interview feed, timeline stages, day bands) lives in small `src/lib/*.ts` modules with type-only imports so Node can test them directly. A new app shell (shadcn Sidebar + phone bottom bar + shared page parts) replaces the top tab bar; each page component is then rebuilt on the shell and the shared parts. State gains `targets` (synced setting).

**Tech Stack:** Next.js 15 static export, React 19, Tailwind v4, shadcn/ui (new-york), lucide-react, sonner, Inter via `next/font/google`, Node 24 `--experimental-strip-types` for unit tests, Playwright (muted) for smoke checks.

**Spec:** `docs/superpowers/specs/2026-11-14-minimal-redesign-design.md`

## Global Constraints

- Colour: black ink and greys only. Canvas `#f2f2f3`, surface `#ffffff`, band `#f8f8f9`, hover `#f4f4f5`, border `#ebebed`, control border `#dcdde0`, text `#1d1d20` / `#3d3f41` / `#5c6063` / `#8b8f93`, accent = ink `#1d1d20`. Stone (only tint, for missed/risky): bg `#f3f1ef`, text `#8a8077`, border `#e2ddd8`. "Done" is black, never green. No red.
- Font: Inter only (tabular figures for numbers). Rows 13px, body 14px, titles 15–20px. No uppercase mono labels.
- Radii: surface 10px, controls 6px, chips 5px, pop-ups 12px. 1px borders.
- Only shadcn components for primitives; add missing ones with `npx shadcn@latest add <name>`.
- Built-in plan tasks are never editable or removable; only tasks in `State.custom` are.
- Every outside link: whole row is the link, `target="_blank" rel="noopener noreferrer"`, shows domain + ↗, turns grey once opened.
- Phone width: 16px gutter, no horizontal page scroll (charts/timeline scroll inside their own container).
- Dark mode supported with the same roles inverted (AA contrast).
- Automated browsers always launch with `--mute-audio`.
- State stays backwards compatible: new fields default in `normalize()`; existing sync tests keep passing.
- **This is a visual rebuild. Everything the app does today keeps working.** In particular, these must still work after their page task: ticking tasks; flags on problems; per-problem notes (`p-<slug>` key) and per-task notes; daily one-line log (`state.notes[dayIdx]`); missed-task list; own tasks add/edit/remove (own only); time-based now/missed/pick status; prep day toggle and Day 0 numbering; Start over from today; Erase everything; outdated/changed warnings on tasks (`t.outdated`) and replaced links; "open News" on tasks with `newsId`; Update must-reads added as tasks; bookmarks (save/unsave, Saved list with search, kind filter and notes on saved items `bm-<key>`); Gist connect (token input when not connected), Sync now, Disconnect, error text; Export/Import backup; Download reminders.ics (`buildICS(state.start, days.length)`); `#view` hash routing and `go()` scroll-to-top; clicking a day on Progress/Roadmap opens it on Today (`openDay`); Notes search, New page, page delete, markdown Write/Read with Tab and list continuation.
- Never run `npm run build` while `npm run dev` is running on the default dist dir (it breaks the dev server). Builds in tasks use `NEXT_DIST_DIR=.next-build npm run build` (see Task 0).
- Smoke checks run against the dev server: start it with `npm run dev -- -p 3000` in the background if `curl -s -o /dev/null -w '%{http_code}' localhost:3000` is not `200`.

## Review Focus

1. **Empty or partial data** (no `interview-threads.json`, no `pulse.json`, no news, zero targets with posts): each page shows a quiet empty line, never a crash. Pinned by the empty-feed tests in Task 3 and the smoke run in Task 13.
2. **Plan not started / finished** (`todayIdx < 0` or `>= days.length`): Today, Progress forecast and Roadmap "now" marker must not throw or show NaN. Pinned in Task 2 (forecast edge tests) and Task 13 (smoke with a future start date).
3. **Prep day on/off** shifts day numbers: Timeline weeks, forecast pace (ignores Day 0) and Today header must agree. Pinned in Task 2 and Task 4 tests.
4. **Phone width**: sidebar hidden, bottom bar visible, two-pane Notes falls back to list → document, timeline scrolls inside its box. Pinned in Task 13 (390px smoke screenshots + no horizontal scroll assertion).
5. **Own vs plan tasks** in the new peek and dialog: plan tasks expose no edit/delete; deleting an own task removes its tick and note and can be undone. Pinned in Task 8 smoke assertions.

---

### Task 0: Branch, commit current work, test runner

**Files:**
- Modify: `package.json` (scripts)
- Create: `scripts/run-tests.mjs`

**Interfaces:**
- Produces: `npm test` runs every `scripts/test-*.ts` with `node --experimental-strip-types`, exits non-zero on any failure.

- [ ] **Step 1:** `git checkout -b redesign/minimal`
- [ ] **Step 2:** Commit the existing uncommitted work as-is (evening gym timetable, prep day, start over, time-based status, own tasks, spec):
```bash
git add -A && git commit -m "feat: evening gym, prep day, start over, time-based status, own tasks; redesign spec"
```
- [ ] **Step 2b:** Fix the 5 existing `prefer-const` errors in `scripts/test-sync-merge.ts` and the unused `eslint-disable` in `src/lib/schedule.js` so `npm run lint` exits 0. Add `distDir: process.env.NEXT_DIST_DIR || '.next'` to `next.config.ts` and add `.next-build/` to `.gitignore`.
- [ ] **Step 3:** Create `scripts/run-tests.mjs` that globs `scripts/test-*.ts`, runs each with `node --experimental-strip-types --no-warnings`, prints the file name, and exits 1 if any child exits non-zero. Add `"test": "node scripts/run-tests.mjs"` to `package.json`.
- [ ] **Step 4:** Run `npm test`. Expected: `sync-merge: all 9 scenarios pass`, exit 0.
- [ ] **Step 5:** Add `playwright` as a devDependency (`npm i -D playwright`), run `npx playwright install chromium`. Verify `npm run lint` exits 0 and `NEXT_DIST_DIR=.next-build npm run build` succeeds. Commit: `chore: test runner, lint clean, separate build dir, playwright`.

---

### Task 1: Design tokens, Inter, shadcn components

**Files:**
- Modify: `src/app/globals.css`, `src/app/layout.tsx`
- Create (via shadcn CLI): `src/components/ui/{sidebar,breadcrumb,collapsible,dialog,alert-dialog,popover,command,switch,sonner,dropdown-menu,toggle-group,calendar}.tsx` and any hooks they add (`src/hooks/use-mobile.ts`).

**Interfaces:**
- Produces: CSS variables `--background` (canvas), `--card` (surface), `--band`, `--hover`, `--border`, `--input` (control border), `--foreground`, `--muted-foreground` (`#5c6063`), `--faint` (`#8b8f93`), `--primary` (ink), `--stone`, `--stone-foreground`, `--stone-border`, each with a Tailwind colour (`bg-band`, `bg-hover`, `text-faint`, `bg-stone`, `text-stone-foreground`, `border-stone-border`). `--radius: 0.625rem`. Font variable `--font-sans` = Inter.
- Temporarily maps every old `--c-*`, `--good`, `--warn`, `--bad`, `--missed*` variable to a grey/ink/stone so unconverted components keep compiling; Task 13 deletes them.

- [ ] **Step 1:** `npx shadcn@latest add -y sidebar breadcrumb collapsible dialog alert-dialog popover command switch sonner dropdown-menu toggle-group calendar` (no `--overwrite`: existing `button`, `checkbox`, `sheet`, `tabs`, `input`, `separator`, `tooltip` stay as they are). New npm deps it pulls in (cmdk, react-day-picker, date-fns, sonner, next-themes) are expected. `sonner`'s `useTheme` works without a ThemeProvider (falls back to system).
- [ ] **Step 2:** Replace the `:root` and dark blocks in `globals.css` with the Global Constraints palette (dark: canvas `#111113`, surface `#18181b`, band `#1d1d20`, border `#2a2a2e`, text `#ececee`/`#c4c4c8`/`#9a9aa0`/`#74747a`, ink `#ececee`, stone bg `#26231f`, text `#aaa29b`, border `#3d3834`). Keep the existing `prefers-color-scheme` mechanism.
- [ ] **Step 3:** In `layout.tsx` load only `Inter` (`variable: '--font-sans'`, weights 400/500/600) and drop Bricolage, IBM Plex and JetBrains. Update `themeColor` to `#f2f2f3` / `#111113`. Add `font-feature-settings: "tnum"` via a `.tnum` utility kept from before.
- [ ] **Step 4:** Verify: `npx tsc --noEmit -p . && npm run lint && NEXT_DIST_DIR=.next-build npm run build`. Expected: all succeed.
- [ ] **Step 5:** Commit: `feat(design): ink palette, Inter, shadcn primitives`.

---

### Task 2: Forecast logic

**Files:**
- Create: `src/lib/forecast.ts`, `scripts/test-forecast.ts`

**Interfaces:**
- Produces:
```ts
export interface DayHours { no: number; planMin: number; doneMin: number }
export interface Forecast {
  doneH: number; planH: number;
  paceH: number | null;       // avg h/day over last ≤7 elapsed days with no ≥ 1; null if none elapsed
  projectedH: number | null;  // doneH + paceH × remaining days (no ≥ 1, index ≥ todayIdx)
  pct: number | null;         // projectedH / planH, 0..1+
  neededH: number;            // (planH − doneH) / remaining days; 0 when none remain
  cumPlan: number[]; cumDone: number[]; // cumulative hours per index; cumDone only up to min(todayIdx, len−1)
}
export function forecast(days: DayHours[], todayIdx: number): Forecast
```

- [ ] **Step 1: Write failing tests** in `scripts/test-forecast.ts` (import from `../src/lib/forecast.ts`, use `node:assert/strict`):
  - `basic`: 10 days `{no: i+1, planMin: 600}`, doneMin `[120, 240, 0, 0…]`, `todayIdx = 3` → `paceH === 2`, `projectedH === 20` (6 + 2×7), `neededH ≈ 13.43` (94/7, assert within 0.01), `pct === 0.2`, `doneH === 6`, `planH === 100`.
  - `notStarted`: same days, `todayIdx = -2` → `paceH === null`, `projectedH === null`, `neededH === 10`.
  - `finished`: `todayIdx = 10` → `neededH === 0`, no throw, `paceH` = avg of last 7.
  - `prepDayIgnoredInPace`: day 0 `{no: 0, planMin: 240, doneMin: 240}` then days as `basic` shifted by one, `todayIdx = 4` → `paceH === 2`, `doneH === 10`.
  - `windowIsSeven`: 20 days, first 10 done 600 each, next 7 done 0, `todayIdx = 17` → `paceH === 0`.
- [ ] **Step 2:** `npm test` → FAIL (module missing).
- [ ] **Step 3:** Implement `forecast` in `src/lib/forecast.ts` (no runtime imports).
- [ ] **Step 4:** `npm test` → all pass.
- [ ] **Step 5:** Commit: `feat(progress): forecast logic`.

---

### Task 3: Interview feed logic and targets

**Files:**
- Create: `src/lib/interview-feed.ts`, `scripts/test-interview-feed.ts`
- Modify: `src/components/interview-pulse.tsx` (move the `ThreadsFeed` type out; re-export from the new module)

**Interfaces:**
- Produces:
```ts
export interface ThreadPost { title: string; url: string; source: string; createdAt: string; upvotes: number; comments: number; views: number; roles: string[] }
export interface ThreadsFeed { collectedAt: string; window: { days: number }; sources?: unknown; companies: Record<string, { group: string; threads: number; engagement: number; roles: string[]; top: ThreadPost[] }> }
export interface Post extends ThreadPost { company: string; group: string }
export type RoleFilter = 'all' | 'frontend' | 'fde';
export type SortKey = 'top' | 'newest';
export const DEFAULT_TARGETS: string[]; // ['Google','Meta','Microsoft','Amazon','Databricks','OpenAI','Anthropic','Palantir']
export function flattenThreads(feed: ThreadsFeed | null): Post[];
export function filterPosts(posts: Post[], opts: { companies: string[] | null; role: RoleFilter }): Post[]; // companies null = all
export function sortPosts(posts: Post[], key: SortKey): Post[];   // new array
export function companyCounts(posts: Post[], targets: string[]): { company: string; count: number; target: boolean }[];
export function domainOf(url: string): string;                    // 'https://www.leetcode.com/x' → 'leetcode.com'
```

- [ ] **Step 1: Write failing tests** with a 3-company fixture:
  - `flatten`: `flattenThreads(null)` → `[]`; fixture → every post carries `company` and `group`.
  - `roleFrontendIncludesFullstack`: role `'frontend'` keeps posts with `frontend` or `fullstack`, drops untagged and `fde`.
  - `roleAllKeepsUntagged`: role `'all'` keeps everything.
  - `companiesFilter`: `{companies: ['Amazon']}` keeps only Amazon; `{companies: []}` → `[]`; `null` → all.
  - `topSort`: ties on upvotes break by comments, then views; `newest` sorts by `createdAt` desc.
  - `counts`: targets come first (then by count desc, then name); `target` flag set.
  - `domain`: `domainOf('https://www.leetcode.com/discuss/1')` → `'leetcode.com'`; invalid URL → the input string.
- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3:** Implement in `src/lib/interview-feed.ts` (no runtime imports). Point `interview-pulse.tsx` and `store.tsx` at the new `ThreadsFeed` type.
- [ ] **Step 4:** `npm test` → pass; `npx tsc --noEmit -p .` → clean.
- [ ] **Step 5:** Commit: `feat(news): interview feed filtering and sorting`.

---

### Task 4: Timeline stages and day bands

**Files:**
- Create: `src/lib/timeline.ts`, `scripts/test-timeline.ts`

**Interfaces:**
- Consumes: shapes only (no runtime import of `engine.ts`): `TimelineDay = { week: number; s?: number; type: string; tasks: { id: string; cat: string; own?: string }[] }` and `done: Record<string, number>`. Tasks with `own` set (the user's own tasks) are ignored.
- Produces:
```ts
export type TrackKey = 'dsa' | 'fe' | 'sd' | 'mc' | 'ai' | 'career';
export const TRACKS: { key: TrackKey; name: string }[]; // DSA, Frontend & CS, System design, Machine coding, AI, Career
export interface Stage { track: TrackKey; label: string; match: (t: { id: string; cat: string }, s: number) => boolean }
export const STAGES: Stage[];
export interface StageBar { track: TrackKey; label: string; fromWeek: number; toWeek: number; done: number; total: number }
export function stageBars(days: TimelineDay[], done: Record<string, number>): StageBar[]; // only stages with ≥1 task; Sundays/prep (no s) ignored
export type Band = 'morning' | 'afternoon' | 'evening';
export function bandOf(start: string): Band; // 'HH:MM' <12:00 morning, <17:00 afternoon, else evening
```
- Stage table (s = study-day index; news tasks `*-news` never match):

| track | label | match |
|---|---|---|
| dsa | Arrays → Trees | cat `dsa`, s ≤ 24 |
| dsa | Graphs, DP, greedy | cat `dsa`, 25 ≤ s ≤ 60 |
| dsa | Timed sets + OA | cat `dsa`, s > 60 |
| fe | JS, browser, React, web | id starts `fe-` |
| fe | Revision + quizzes | cat `fe`, s > 48 |
| sd | HLD fundamentals | id matches `^sd-\d+`, s ≤ 14 |
| sd | Design problems | id matches `^sd-\d+`, s > 14 |
| sd | Mocks | cat `sd`, id contains `-sdm` |
| mc | Builds + LLD Saturdays | id starts `mc-` or `lld-` |
| mc | Flagship product | cat `proj` |
| mc | Timed rebuilds | id contains `-mct` |
| ai | Nets → GPT from scratch | id starts `ai-`, s ≤ 17 |
| ai | Papers, RAG, agents, evals | id starts `ai-`, 18 ≤ s ≤ 61 |
| ai | Review + AI design | id starts `ai-`, s > 61 |
| career | Resume, LP stories, UX | cat in `beh`,`ux`, s ≤ 35 |
| career | Forward-deployed + applications | cat in `fde`,`beh`, s > 35 |

- [ ] **Step 1: Write failing tests:** `bandOf('11:59')==='morning'`, `bandOf('12:00')==='afternoon'`, `bandOf('16:59')==='afternoon'`, `bandOf('17:00')==='evening'`; a fixture of 3 weeks of synthetic days (s 1–18 across weeks 1–3, one Sunday without s) → DSA "Arrays → Trees" bar spans `fromWeek 1, toWeek 3`, `total` = matching task count, `done` counts ids in `done`; a `*-news` task never counted; a prep-day entry (no s) ignored; a task with `own` set is never counted.
- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3:** Implement `src/lib/timeline.ts`.
- [ ] **Step 4:** `npm test` → pass.
- [ ] **Step 5:** Commit: `feat(roadmap): timeline stages and day bands`.

---

### Task 5: State — target companies and interview visit

**Files:**
- Modify: `src/lib/store.tsx`, `src/lib/sync-merge.ts`, `scripts/test-sync-merge.ts`

**Interfaces:**
- Consumes: `DEFAULT_TARGETS` (Task 3).
- Produces: `State.targets: string[]` (default `DEFAULT_TARGETS`), added to `SCALARS` in `sync-merge.ts` (last writer wins). Interview visit stored as `seenUpdates['interviews-visit'] = <ms>`.

- [ ] **Step 1: Write failing test** in `scripts/test-sync-merge.ts`: scenario 10 — phone edits `targets` to `['Amazon']` after laptop set `['Google']` → merge keeps `['Amazon']`; a state with no `targets` merged with one that has it keeps the defined one.
- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3:** Add `targets` to `State`, `fresh()`, `normalize()` (`s.targets ?? DEFAULT_TARGETS`), and `SCALARS`.
- [ ] **Step 4:** `npm test` → pass (10 scenarios); `npx tsc --noEmit -p .` clean.
- [ ] **Step 5:** Commit: `feat(state): synced target companies`.

---

### Task 6: App shell and shared page parts

**Files:**
- Create: `src/components/shell/app-sidebar.tsx`, `src/components/shell/bottom-bar.tsx`, `src/components/shell/page.tsx`
- Modify: `src/app/page.tsx`, `src/components/ui-state.tsx`
- Create: `scripts/smoke.mjs`

**Interfaces:**
- Consumes: `useStore()` (`days`, `todayIdx`, `sync`, `syncConfigured`, `state`, `news`), `overall()` from `engine.ts`.
- Produces (in `shell/page.tsx`), used by every page task:
```tsx
export function Surface(props: { children: ReactNode; className?: string }): JSX.Element            // white sheet, radius 10
export function PageHeader(props: { crumbs: (string | { label: string; onClick: () => void })[]; count?: string; actions?: ReactNode }): JSX.Element
export function Band(props: { title: string; count?: ReactNode; right?: ReactNode; defaultOpen?: boolean; children: ReactNode }): JSX.Element // shadcn Collapsible
export function Row(props: { children: ReactNode; className?: string; onClick?: () => void; tone?: 'now' | 'stone' }): JSX.Element // 40px, hairline
export function Chip(props: { children: ReactNode; className?: string }): JSX.Element
export function Ring(props: { done: number; total: number; tone?: 'stone'; size?: number }): JSX.Element // dashed/arc/check; replaces status-icon.tsx
export function Seg<T extends string>(props: { value: T; options: { value: T; label: string; count?: ReactNode }[]; onChange: (v: T) => void }): JSX.Element // shadcn ToggleGroup styled as segmented
export function SummaryRow(props: { ring: { pct: number; label: string }; items: { k: string; v: ReactNode }[] }): JSX.Element
export function OutLink(props: { href: string; title: string; meta: ReactNode; read: boolean; onOpen: () => void; saved?: ReactNode }): JSX.Element // whole-row link, domain + ↗
```
- `UI` context gains `newTask: (preset?: { date?: string; block?: string }) => void` and `openTask: (taskId: string, dayIdx: number) => void` (implemented in Task 8; no-op until then). `toast` is replaced by `sonner`'s `toast` (keep `useUI().toast(msg)` as a thin wrapper so callers don't change).
- Sidebar: mark "90", "Offer in 90", status line `Day N of 91 · on track | X h behind | prep day | starts in Nd | complete`; nav Today, Progress, Roadmap, Notes, News (badge = unread count from `newsUnread()` below), button "New task" (`newTask()`); footer Setup + sync line (`Synced HH:MM` / `Syncing…` / error text). Collapsible to icons (`collapsible="icon"`), ⌘B.
- Bottom bar (`md:hidden`): Today, Progress, Notes, More (Sheet with Roadmap, News, Setup).
- `newsUnread(state, news, threads): number` exported from `shell/app-sidebar.tsx`: unread links in the latest news day (no `seenUpdates['n-'+id]`) + interview posts with `Date.parse(createdAt)` > `seenUpdates['interviews-visit'] ?? 0` (never visited → every post counts).
- Navigation keeps the existing `go(view)` (hash update + scroll to top) and the hash-on-load behaviour.
- Keyboard: `c` with no modifier keys, and focus not in an input, textarea, select or contentEditable → `newTask()`.

- [ ] **Step 1:** Write `scripts/smoke.mjs`: launches Playwright Chromium with `--mute-audio`, seeds `localStorage['offer90.v1']` from a fixture (start = 9 days ago, a few ticks), opens `http://localhost:3000`, for each nav item clicks it and asserts no `pageerror`/console error; at 390px asserts `document.documentElement.scrollWidth <= 390` and the bottom bar is visible while the sidebar is not; saves screenshots to the directory given as `argv[2]`. Exits 1 on any failure.
- [ ] **Step 2:** Run it against the current app (`npm run dev` in background): expect FAIL on the bottom-bar assertion.
- [ ] **Step 3:** Build `shell/*` and switch `page.tsx` to `SidebarProvider` + `AppSidebar` + `SidebarInset` (canvas background, page content inside) + `BottomBar` + `<Toaster />`. Remove the old header/tabs and the custom toast div.
- [ ] **Step 4:** `npx tsc --noEmit -p . && npm run lint && node scripts/smoke.mjs <scratch>` → pass.
- [ ] **Step 5:** Commit: `feat(shell): sidebar, phone bottom bar, shared page parts`.

---

### Task 7: Today page

**Files:**
- Modify: `src/components/today-view.tsx`, `src/components/task-row.tsx`, `src/components/own-task.tsx`
- Delete: `src/components/status-icon.tsx` (replaced by `Ring`)

**Interfaces:**
- Consumes: `Surface, PageHeader, Band, Row, Chip, Ring, SummaryRow` (Task 6), `bandOf` (Task 4), `overall/dayStats` (engine), `useUI().newTask/openTask`.
- Produces: `TaskRow` props `{ t: Task; dayIdx: number; status?: 'missed' | 'pick'; extra?: string }`; clicking the task text calls `openTask(t.id, dayIdx)`; checkbox still toggles done. Row keeps: difficulty chip, flag button, note indicator, outdated/changed warning line, "open News" for `newsId`, ↗ for `url`, "New" marker for update tasks, edit/remove only for own tasks.

Layout per spec "Today": header crumbs `Day N of 91` / `Day 0 · prep` › `Sat 14 Nov`, actions `‹ Today ›` and a `+` (`newTask()`); SummaryRow (ring = today's study % , items Done `x of y h`, Missed `n tasks`, Plan status); one notice row only when unseen plan updates (`priority !== 'fyi'`) or missed-earlier tasks exist, with two separate links: `1 plan update` → `go('roadmap')` with Reference › Changes open (via the `roadmapTab`/`openChanges` UI values from Task 10; until Task 10 lands, just `go('roadmap')`), and `5 missed tasks` → opens and scrolls to the "Missed earlier" band; "Missed earlier · n" band (folded) with stone rows; Morning/Afternoon/Evening bands; block rows with Ring, time, title, chips (`◷ N min left` on current, `n/m`); current block black left edge and open; missed block stone; life blocks thin grey lines; task rows with "Yours" tag, pick highlight `bg-hover`; quick add at the end of each open block; daily log textarea inside the review block.

- [ ] **Step 1:** Extend `scripts/smoke.mjs` with Today assertions: clock fixed at 14:10 (`page.clock.install`), bands "Morning", "Afternoon", "Evening" visible; the 13:00 row has the `data-now` attribute; a 05:15 row has `data-missed`; quick add creates a "Yours" row; no element uses a colour outside the palette (assert computed `color` of `[data-missed]` is `rgb(138, 128, 119)`).
- [ ] **Step 2:** Run smoke → FAIL.
- [ ] **Step 3:** Rebuild `today-view.tsx`, restyle `task-row.tsx` and `own-task.tsx` on the shared parts; remove legend, stat tiles, black NowCard, coloured pills.
- [ ] **Step 4:** `npx tsc --noEmit -p . && npm run lint && npm test && node scripts/smoke.mjs <scratch>` → pass. Look at the 1100px and 390px screenshots.
- [ ] **Step 5:** Commit: `feat(today): minimal Today page`.

---

### Task 8: Task peek and New task dialog

**Files:**
- Create: `src/components/task-peek.tsx`, `src/components/new-task-dialog.tsx`, `src/components/note-editor.tsx` (extracted from `note-sheet.tsx`)
- Modify: `src/app/page.tsx` (mount both, wire `openTask`/`newTask`), `src/components/note-sheet.tsx` (pages only from now on)

**Interfaces:**
- Consumes: `UI.openTask(taskId, dayIdx)`, `UI.newTask(preset?)`, `parseTask` (own-task.tsx), `State.custom`, `State.tnotes`, `noteKey(t)` (task-row.tsx).
- Produces: `<NoteEditor target={NoteTarget} compact?: boolean />` (body editor with `Saved · {ago}`, Write/Read `Seg`, the existing Tab-indent and list-continuation keys, debounced save exactly as `note-sheet.tsx` does today; `compact` hides the breadcrumb) used by the peek now and by Notes in Task 11. `<TaskPeek />` (shadcn Sheet, right, `sm:max-w-[54vw]`, ⤢ toggles full width) and `<NewTaskDialog />` (shadcn Dialog). Delete of an own task removes `custom[id]`, `done['u-'+id]`, `tnotes['u-'+id]` and shows a sonner toast with **Undo** that restores all three.

Peek content per spec: breadcrumb `Day › block`, checkbox + title (editable input only when `t.own`), properties (Day, Block, Link, Difficulty/Flag for problems, "Added by You · time" for own), the line "Part of the plan. You can tick it, flag it and write notes, but not edit or remove it." for plan tasks, note editor (markdown textarea with Write/Read `Seg`), ⋯ menu with Delete only for own tasks. Dialog: title input, note/link textarea, chips Day (Popover + Calendar), Block (Popover + Command listing that day's blocks with "done"/"now"), Link; defaults today + current block (or next block when between blocks, else last block); "Create more" Switch; Cancel / Add task; Enter submits.

- [ ] **Step 1:** Extend smoke: press `c` → dialog visible; type title, choose block "18:00 Gym", Add → row appears in Evening band with "Yours"; open a plan task → no Delete in ⋯, title not editable, the "Part of the plan" line present; open the own task → Delete → row gone → click Undo → row back and still ticked if it was.
- [ ] **Step 2:** Run smoke → FAIL.
- [ ] **Step 3:** Implement both components and wiring.
- [ ] **Step 4:** tsc, lint, `npm test`, smoke → pass.
- [ ] **Step 5:** Commit: `feat(tasks): task peek and new task dialog`.

---

### Task 9: Progress page

**Files:**
- Modify: `src/components/progress-view.tsx`
- Create: `src/components/progress-chart.tsx`

**Interfaces:**
- Consumes: `forecast(days, todayIdx)` (Task 2) with `DayHours` built from `dayStats`; shared parts.
- Produces: `<ProgressChart data={Forecast} todayIdx range={'month' | 'plan'} />` (inline SVG, ink lines, dashed grey plan, dotted ink forecast in `plan` range only, stone shortfall area, today marker, end labels `Plan N h` and projected `N h` offset so they never overlap; `month` = the 4 weeks around today).

Page per spec: header `Progress › start → end`; SummaryRow (ring % of plan hours, Days, Hours, Problems, Status, Streak); Band "Running total vs plan" with `Seg` this month / whole plan; sentence + three values (pace, at this pace by end date, needed from today) — sentence copy: `At this pace you finish {pct}% of the plan, about {projected} of {plan} h. To finish on time you need {needed} h a day from today.`; when `pct ≥ 0.95`: `At this pace you finish {pct}% of the plan. Keep it up.`; hidden before the first full day. Bands "Where you're slipping" (plain rows) and "Tracks" (name, ink bar, `Chip` "n of m").

- [ ] **Step 1:** Extend smoke: Progress shows "Running total vs plan"; switching to "Whole plan" renders an element `[data-forecast]`; with a future start date the page renders without NaN (`!/NaN/.test(body text)`).
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** tsc, lint, test, smoke → pass.
- [ ] **Step 5:** Commit: `feat(progress): forecast chart and minimal layout`.

---

### Task 10: Roadmap page

**Files:**
- Modify: `src/components/roadmap-view.tsx`
- Create: `src/components/roadmap-timeline.tsx`, `src/components/roadmap-weeks.tsx`, `src/components/roadmap-reference.tsx`
- Modify: `src/components/ui-state.tsx` (add `roadmapTab: 'timeline' | 'weeks' | 'reference'` + setter, and `openChanges: boolean`)

**Interfaces:**
- Consumes: `stageBars`, `TRACKS` (Task 4); `updates`, `seenUpdates` (store); `openDay(i)`.
- Produces: tabs via `Seg` (Timeline default).

Per spec: Timeline = track rows × 13 week columns, phase labels (Foundations 1–4, Depth 5–9, Interview mode 10–13), current week label `W{n} · now` in ink, 1.5px today line, outlined bars with grey fill = `done/total`, click → `openDay(first day in that range with an open matching task)`; scrolls inside its own box below 640px. Weeks = phase Bands (current phase open), week rows (Ring, main topics, ink bar, chips `%` and date range), current week opens to per-track counts. Reference = folded Bands for the 7 existing tables + **Changes** (plan updates list; opening a row or "Mark read" sets `seenUpdates[u.id]`; Review from Today lands here with Changes open).

- [ ] **Step 1:** Extend smoke: Roadmap default tab Timeline shows 6 track names and an element with text matching `/W\d+ · now/`; Weeks tab shows "Week 1"; Reference → Changes lists the update from `public/updates.json` and opening it clears the Today notice.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** tsc, lint, test, smoke → pass.
- [ ] **Step 5:** Commit: `feat(roadmap): timeline, weeks and reference tabs`.

---

### Task 11: Notes page

**Files:**
- Modify: `src/components/notes-view.tsx`, `src/components/note-sheet.tsx`

**Interfaces:**
- Consumes: `State.pages`, `State.tnotes`, `<NoteEditor>` from Task 8 (add the page title input, breadcrumb and ⋯ Delete page for `kind: 'page'`).

Per spec: desktop two panes (list 280px left with Bands "Pages · n" + "+ New page" and "Task notes · n", rows title + grey preview; editor right); `/` focuses search; phone (< md) shows list, selecting shows the editor full-screen with a back crumb. `note-sheet.tsx` is removed if nothing else uses it.

- [ ] **Step 1:** Extend smoke: Notes shows "Pattern cheat sheet" in the list and its heading in the right pane at 1100px; at 390px clicking a row shows the editor and a "Notes" crumb that returns to the list; typing `/` focuses the search input.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** tsc, lint, test, smoke → pass.
- [ ] **Step 5:** Commit: `feat(notes): two-pane notes`.

---

### Task 12: News page

**Files:**
- Modify: `src/components/updates-view.tsx` (becomes the News page), `src/components/bookmarks.tsx`
- Create: `src/components/news-interviews.tsx`, `src/components/news-reading.tsx`
- Delete: `src/components/interview-pulse.tsx` (logic now in `interview-feed.ts`)

**Interfaces:**
- Consumes: `flattenThreads, filterPosts, sortPosts, companyCounts, domainOf` (Task 3), `State.targets`, `pulse`, `threads`, `news`, `OutLink`, `BookmarkButton`.
- Produces: tabs `Seg` Interviews · Reading · Saved (counts). Opening Interviews sets `seenUpdates['interviews-visit'] = Date.now()`. Saved keeps today's search, kind filter, notes on saved items and remove.

Per spec: Interviews filter line — My targets (default) · All companies · Companies ▾ (Popover + Command checklist with counts, targets first, "Pin as a target" toggles membership in `State.targets`) · role `Seg` All roles / Frontend / FDE · sort Top / Newest; one-line brief from `pulse[0].headline` opening a Collapsible with the full brief; single-company filter shows that company's `pulse` summary if present; post rows via `OutLink` with `#Company` and role chips, `domain · ago`, ↑ upvotes · comments · views, ☆. Reading: Bands per day (latest open, earlier folded), filter All/AI/Dev/Research, `OutLink` rows. Saved: existing list in the same row style. Empty states: "No posts for these filters." / "No reads yet. The daily fetch fills this in." Plan changes are no longer shown here.

- [ ] **Step 1:** Extend smoke: News opens on Interviews; "My targets" active; switching role to FDE shows only posts with an FDE chip or the empty line; Companies ▾ → tick Amazon only → every row shows `#Amazon`; Reading rows are `<a target="_blank">`; clicking one turns it grey (`data-read`); sidebar News badge decreases after visiting Interviews.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** tsc, lint, test, smoke → pass.
- [ ] **Step 5:** Commit: `feat(news): interviews feed, reading, saved`.

---

### Task 13: Setup page, cleanup, final verification

**Files:**
- Modify: `src/components/setup-view.tsx`, `src/app/globals.css`
- Delete: unused components and the temporary `--c-*`, `--good/warn/bad`, `--missed*` variables and `catColor`

**Interfaces:**
- Consumes: shared parts, `State.targets`, `buildICS`, `WEEKDAY_BLOCKS`/`SUNDAY_BLOCKS`.

Setup per spec: one settings list in Bands Your plan (Start date via Popover + Calendar, prep-day Switch, Daily timetable summary `Wake 05:00 · gym 18:00 · sleep 22:00` + View → Sheet with both tables), Interviews (target chips with ✕ + Add via Popover + Command over companies in the feed plus free text), Sync and backup (when not connected: the GitHub token link, password input and Connect, as today; when connected: status, Sync now, Disconnect; errors shown inline), Export/Import backup (same validation as today), Reminders (Download .ics = the page's only primary button), Start again (Start over… and Erase… in stone, each behind an `AlertDialog`; behaviour unchanged from today).

- [ ] **Step 1:** Extend smoke: Setup shows all five section titles; removing "Amazon" from targets then opening News → Interviews "My targets" has no `#Amazon` rows; "Start over…" opens an alert dialog and Cancel leaves ticks intact; a run with start date 5 days in the future renders every page without errors; a run at 390px passes the no-horizontal-scroll check on every page; `grep -rE "c-(dsa|fe|mc|sd|beh|ai|fde|proj|ux|review|update|health)|text-(good|warn|bad)|bg-(good|warn|bad)|font-display|font-mono|catColor" src --exclude-dir=ui` returns nothing; every feature in Global Constraints' preserve list is exercised once by hand (tick, flag, note, log, bookmark, export, import, .ics download, connect field visible).
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement Setup, delete leftovers.
- [ ] **Step 4:** `npx tsc --noEmit -p . && npm run lint && npm test && NEXT_DIST_DIR=.next-build npm run build && node scripts/smoke.mjs <scratch>` → all pass. Check light, dark and 390px screenshots by eye.
- [ ] **Step 5:** Commit: `feat(setup): settings list; remove old design tokens`.
