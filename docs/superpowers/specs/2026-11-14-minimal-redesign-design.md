# Offer in 90: minimal redesign

Date: 2026-11-14 · Status: draft for approval

## Intent

The owner uses this dashboard all day for 91 days. The current look (three fonts, 12 category colours, stacked cards, banners, coloured labels) is noisy and hard to follow. Goal: a very minimal, low-distraction UI with excellent UX, modelled on Plane (makeplane/plane), built only from shadcn components.

**Goals**
- One calm visual system across every page: black ink and greys, one font, dense rows, thin dividers.
- Find what to do now in under a second on Today.
- Every page answers one question: Today (what now), Progress (am I on track), Roadmap (where am I in 13 weeks), Notes (my writing), News (what to read), Setup (settings).

**Non-goals**
- No new data sources or collectors (interview posts stay as collected today, with no excerpts).
- No change to the plan content, the sync model (Gist + per-item merge) or the weekly engine.
- No custom-built UI primitives where a shadcn component exists.

**Anti-goals (failure even if it works)**
- Colour creeping back in (status colours, category colours, red warnings).
- Pages that make you scroll past summaries, banners or legends before the content.
- External links that look like they open inside the app.
- Built-in plan tasks becoming editable.

## Constraints

- Next.js 15 static export on GitHub Pages, Tailwind v4, shadcn/ui (already set up in `components.json`). Add missing shadcn components with the CLI: `sidebar`, `breadcrumb`, `collapsible`, `dialog`, `alert-dialog`, `popover`, `command`, `switch`, `sonner`, `dropdown-menu`, `toggle-group` (or `tabs`), `calendar`.
- Must keep everything already built in this branch (uncommitted): evening gym timetable, optional Day 0 prep day, Start over from today, time-based block/task status, the user's own tasks (`State.custom`) with add/edit/remove for own tasks only.
- State and sync stay backwards compatible; new state fields need defaults in `normalize()` and, if per-item, an entry in `sync-merge.ts` `MAPS`.
- Automated browser runs must stay muted (`--mute-audio`).
- Layout must work at phone width with a 16px gutter and no horizontal page scroll (charts may scroll inside their own container).

## Approaches considered

1. **Foundation + Today now, other pages restyled lightly, redesign each later.** Fast to see, but pages would be redesigned twice.
2. **Design every page first with mockups, build all at once.** *Chosen by the owner.* Most consistent; nothing ships until all pages are designed.
3. **Today page only.** Fastest, but the rest would clash with it.

Earlier directions also considered and rejected by the owner: "paper" monochrome with no panels, and calm cards (today's layout cleaned up). Accent options blue and deep green were rejected in favour of black ink.

## Design system (decided)

- **Font:** Inter for everything (body, headings, numbers with tabular figures). Remove Bricolage Grotesque, IBM Plex Sans and JetBrains Mono. Sizes: 13px rows, 14px body, 15–20px titles. No uppercase mono labels.
- **Colour:** black ink and greys only.
  - Canvas `#f2f2f3`, surface white, bands `#f8f8f9`, hover `#f4f4f5`, borders `#ebebed` (subtle) / `#dcdde0` (controls).
  - Text: `#1d1d20` primary, `#3d3f41`, `#5c6063`, `#8b8f93` placeholder.
  - Accent = ink `#1d1d20`: primary buttons, ticked checkboxes, the "now" edge, progress fills, "done" rings (done is black, not green).
  - **Stone** is the only tint, for missed/risky: bg `#f3f1ef`, text `#8a8077`, border `#e2ddd8`.
  - Remove all category colours (`--c-*`), `good/warn/bad`, red badges.
  - Dark mode stays, same roles inverted (builder's call on exact values; keep contrast AA).
- **Shapes:** surface radius 10px, controls 6px, chips 5px. Thin 1px borders, no heavy shadows except pop-ups.
- **Building blocks:** one white surface per page on the grey canvas; breadcrumb header row; grey collapsible group bands with a count; 40px rows split by hairlines; properties as small outlined chips on the right; status rings (dashed = not started, arc = in progress, filled check = done, stone = missed); segmented control (white pill on grey track) for in-page tabs.

## App shell (decided)

- **Desktop:** shadcn `Sidebar`, collapsible to an icon rail (⌘B and a toggle in the page header). Contents: app mark "90" + "Offer in 90" + "Day N of 91 · on track / X h behind"; nav Today, Progress, Roadmap, Notes, News (unread count); "New task" action; Setup at the bottom; sync status line ("Synced 14:09").
- **Phone:** bottom tab bar with Today, Progress, Notes, More (More opens a sheet with Roadmap, News, Setup). Sidebar hidden.
- The top tab bar is removed.

## Pages

### Today (decided)
- Breadcrumb header: "Day 1 of 91 › Sat 14 Nov" (prep day: "Day 0 · prep"), with ‹ Today › buttons on the right.
- Summary row (Plane cycle style): ring with % of today's study hours done, the day's title, then label/value pairs: Done (2.8 of 11 h), Missed (n tasks), Plan (On track / X h behind). No stat boxes, no black "now" card, no legend.
- One notice line only when needed ("1 plan update · 5 missed tasks · Review"), quiet styling.
- Blocks grouped into collapsible bands by time of day: **Morning** (blocks starting before 12:00), **Afternoon** (12:00–16:59), **Evening** (17:00 on). Band shows a short count ("2 missed", "1 now").
- Block row: status ring, start time, title, chips on the right (e.g. "◷ 20 min left" on the current block, "1/2"). Current block: black left edge, open by default. Missed block: stone row. Life blocks (meals, breaks) are thin grey lines.
- Task rows under an open block: checkbox, text, "Yours" tag on own tasks, the task to pick up gets a soft grey highlight, done tasks struck through.
- "+ Add task" quick add at the end of each open block.
- Status logic stays as built (now / done / missed / past / upcoming by the clock).

### Progress (decided)
- Breadcrumb "Progress › start → end".
- Summary row: ring with % of plan hours done, then Days, Hours, Problems, Status, Streak.
- Band "Running total vs plan" with a toggle *this month · whole plan*. Chart: solid ink line = cumulative hours done; dashed grey line = cumulative plan; dotted ink line = **forecast**; stone area between plan and forecast = shortfall; "today" marker.
  - **Forecast:** pace = average study hours per day over the last 7 elapsed plan days (fewer if fewer have passed; hidden before the first full day). Projection from today to the last day = done so far + pace × remaining days. End labels: "Plan 904 h" and the projected total.
  - The forecast shows in the whole-plan view; this-month view shows done vs plan only.
  - Under the chart: one sentence ("At this pace you finish 7% of the plan, about 60 of 904 h. To finish on time you need 10.6 h a day from today.") and three values: your pace, at this pace by the end date, needed from today (= hours left ÷ days left).
- Band "Where you're slipping": the existing insights as plain rows (no coloured dots).
- Band "Tracks": rows with track name, thin ink bar, chip "9 of 24".

### Roadmap (decided)
In-page segmented tabs: **Timeline** (default) · **Weeks** · **Reference**.
- **Timeline** (Plane Gantt): rows per track (DSA, Frontend & CS, System design, Machine coding, AI, Career); each track's stages are outlined bars across 13 week columns; phase labels above; current week marked "W2 · now" and a thin today line; light grey fill inside a bar = share of that stage's tasks done; clicking a bar opens the first open day in it. Scrolls horizontally inside its container on phones.
- **Weeks** (Plane Cycles): phase bands (Foundations / Depth / Interview mode; later phases folded); one row per week with ring, main topics, thin bar, chips "%" and date range; the current week opens to per-track counts ("DSA 1/9 · Frontend 2/6 …"). No day squares anywhere.
- **Reference:** each reference table as a folded row with a count chip (company loops, focus rules, board rules, HLD framework, FDE roadmap, Whimsical board, Month 4) plus a new **Changes** row listing plan updates from the weekly engine.

### Notes (decided)
- Two panes on desktop: list on the left (bands Pages with "+ New page", and Task notes; rows with title + grey preview), selected document on the right.
- Document: breadcrumb "Notes › title", "Saved · 2 h ago", Write/Read segmented toggle, ⋯ menu (delete page). Markdown as today.
- Search box, opened with "/".
- Phone: list, then document full screen with a back breadcrumb.

### News (decided)
Segmented tabs: **Interviews** · **Reading** · **Saved**. Plan changes move out of News (Today notice + Roadmap › Reference › Changes).
- **Interviews** (LeetCode Discuss style): one feed of posts across companies.
  - Filter line: **My targets** (default) · All companies · **Companies ▾** (searchable checklist with counts, targets first, "Pin as a target") · role (Frontend / FDE) · sort (**Top this week** / Newest).
  - One-line weekly brief on top from `pulse.json` headline, opening to the full brief (headline, changes, what to change in your prep).
  - When exactly one company is filtered, its AI summary (from `pulse.json` if present) shows above its posts.
  - Post row: `#Company` tag, role tag, `domain · time ago`, title, ↑ upvotes · views · comments, ☆ save, ↗. No excerpt (not in the data).
- **Reading:** today's links grouped by day, filter All/AI/Dev/Research, earlier days folded.
- **Outside links everywhere:** the whole row is the link, opens a new tab, shows site initial + domain + ↗, turns grey once opened (uses existing `seenUpdates`), ☆ saves to bookmarks.
- **Saved:** the existing saved list in the same row style.

### Setup (decided)
One settings list (Plane settings style), label + one-line help on the left, control on the right, sections:
- **Your plan:** Start date (date picker), Start with a prep day (switch), Daily timetable (summary + View → side sheet with the table).
- **Interviews:** Target companies (removable chips + Add). **New state:** `targets: string[]`, defaulting to the companies in the plan's company map that also appear in the threads feed. Synced as a scalar-like setting (builder: add to sync with last-writer-wins semantics, e.g. in `SCALARS`).
- **Sync and backup:** Gist status, Sync now, Disconnect / Connect with token; Export / Import.
- **Reminders:** Download .ics (the page's one primary button).
- **Start again:** Start over… and Erase…, stone styling, each confirmed with an `AlertDialog`.

## Tasks and pop-ups (decided)

- **Quick add** (inline): as built today, restyled.
- **New task dialog** (Plane create modal, shadcn `Dialog` + `Popover`/`Command`): opened with **C** or "New task" in the sidebar. Title, optional note/link, chips Day (date picker), Block (that day's blocks with "done"/"now" hints), Link. Defaults: today + current block (or next block if between blocks). "Create more" switch, Cancel, Add task. Saves to `State.custom`; the note goes to the task note store (`tnotes`, key `u-<id>`).
- **Task peek** (Plane side peek, shadcn `Sheet` at ~50% width, ⤢ to full width): opens on clicking a task title; replaces the current note drawer for tasks. Own task: title, day, block, link editable; ⋯ → Delete with a Sonner **Undo** toast. Plan task: read-only properties with the line "Part of the plan. You can tick it, flag it and write notes, but not edit or remove it." Tick, flag and note work for both. Problem notes keep following the problem (`p-<slug>` key).
- **Confirmations:** only Start over and Erase use `AlertDialog`. All other feedback through Sonner toasts.
- All pop-ups: white, 12px radius, soft shadow, black primary button, Esc closes.

## Calls made after the builder check (owner can override)

1. **Default target companies:** a hardcoded starting list, since the plan's company map rows aren't plain names: Google, Meta, Microsoft, Amazon, Databricks, OpenAI, Anthropic, Palantir. Companies with no posts this week simply show nothing. Editable in Setup.
2. **Missed tasks and the daily log stay on Today.**
   - The daily one-line log textarea stays inside the evening "Daily review" block (`state.notes[dayIdx]`, unchanged).
   - Missed tasks from earlier days become a collapsible band at the top of Today, "Missed earlier · n", folded by default, with the same task rows. "Review" on the notice line opens that band.
3. **Plan updates and unread counts.**
   - "Review" on a plan-update notice opens Roadmap › Reference › Changes.
   - An update counts as seen when its row is opened there (or via "Mark read"), using `seenUpdates[u.id]` as today. The Today notice clears per update.
   - The sidebar News count = unread links in the latest Reading day + interview posts collected since the user last opened the Interviews tab (new field `meta`-style timestamp, e.g. `seenUpdates['interviews-visit']`).
4. **Interview sort and role filter.**
   - Sorts: **Top** (latest collection, ranked by the feed's engagement: upvotes, then comments, then views) and **Newest** (by post date). "Top this week" in mockups means "Top".
   - Role filter: **All roles** is the default. Frontend matches `frontend` and `fullstack`. FDE matches `fde`. Untagged posts show only under All roles.
5. **New task on phone and desktop:** a "+" icon button in the Today breadcrumb header (all sizes) opens the New task dialog, alongside C and the sidebar action. No floating button.
6. Smaller ones: the forecast ignores Day 0 (prep day hours count toward "done" but pace uses plan days 1–91); a task note opened from Notes shows in the Notes right pane, and from Today in the task peek.

## Left to the builder

- Exact dark-mode values, focus rings and hover states within the rules above.
- Stage definitions for the Timeline (a small static list of `{track, label, fromWeek, toWeek, categories}` derived from the curriculum; progress = done ÷ total of matching tasks in that range).
- Keyboard shortcut details beyond C, /, ⌘B and Esc.
- Empty states and loading states, in the same quiet style.
- Mockups for reference live in `.superpowers/brainstorm/` (git-ignored).
