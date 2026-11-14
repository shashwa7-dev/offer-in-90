# Today: statuses, filters, cycles, search

Date: 2026-11-14 · Status: approved by the owner (mockup `home-v2`) · Builds on `2026-11-14-minimal-redesign-design.md`

## Intent
Make Today feel like Linear/Plane: every task has a status, the list filters like Linear, each plan week is a "cycle" with its own progress, and one search box finds anything. Today uses the full width like the other pages.

**Non-goals:** no change to the plan content, the Gist sync model, or the other pages' layouts (beyond the sidebar search and cycles list). **Anti-goals:** colour creeping back; losing any existing behaviour (ticks, flags, notes, own tasks, missed list, time-based now/missed/pick).

## Approaches
1. **Status as a separate synced map next to `done` (chosen).** `done` stays the source of truth for Done, so old data, sync and every existing count keep working; a new per-item map holds only In progress / Skipped.
2. Replace `done` with one status map: cleaner, but needs a data migration and touches every count and the sync merge. Rejected (risk to existing data).
3. Derive In progress from the clock (the current block): no manual control, duplicates the "now" edge. Rejected by the owner's direction (Linear/Plane are manual).

## Design (decided)
**Statuses.** ○ Not started, ◐ In progress, ● Done, ⊘ Skipped.
- Data: new `State.status: Record<taskId, 'progress' | 'skipped'>`, per-item synced (add to `MAPS`). Done = `done[id]` as today. Setting Done writes `done[id]` and removes `status[id]`; setting In progress/Skipped writes `status[id]` and removes `done[id]`; Not started removes both.
- Click the status icon = toggle Done ↔ Not started (ticking stays one click). A small ▾ beside the icon (on hover, always on touch), right-click, or the key **S** on a focused row opens the status menu; **1–4** set a status on the focused row and in the task peek.
- Skipped: excluded from missed counts, from the day's plan minutes (so it doesn't count toward hours or "behind"), and from ring totals. Rings stay done ÷ total.
- In progress shows as the half-filled icon and an "In progress" chip.

**Filter bar (Linear style)** under the Today header:
- Status pills with counts: All · Not started · In progress · Done · Skipped (single-select).
- "+ Filter" → chips for Track (DSA, Frontend & CS, System design, Machine coding, AI, Career), Block, Yours/Plan, Difficulty (E/M/H); each chip removable (✕), multi-value.
- "Display" menu: group by Time of day (default) · Status · Track.
- Filters hide non-matching tasks; blocks with no matching tasks are hidden while a filter is active; life blocks hide while any filter is active. Filter/display state is per-browser (`localStorage`, guarded), not synced.

**Full width + right column** (≥ lg): list left, 300px column right inside the same white sheet. Below lg the column moves under the list. Cards:
1. **Today:** stacked bar done / in progress / not started / skipped with counts; Hours done "x of y h"; Next block.
2. **Cycle (the plan week):** title "Week N cycle", date range and days left; ring %; Done / In progress / Not started counts; mini burn-up of the cycle's study hours vs plan (dotted forecast from today using the cycle's pace); one small stacked status bar per day (today outlined). Clicking a day bar opens that day.
3. **Tracks this cycle:** per track done (ink) + in progress (grey) bar and "d/t".
4. **In progress:** every in-progress task across the plan, newest first, with its day; click opens the task peek.

**Cycles in the sidebar:** section "Cycles" with previous, current and next week, each with a status icon (●/◐/○) and %. Clicking opens Roadmap › Weeks with that week expanded.

**Header:** crumbs "Week N › Day N of 91 › date" (prep day: "Day 0 · prep"), then ‹ Today ›, Display, and a black "+ New task".

**One search (⌘K).** "Search everything ⌘K" box at the top of the sidebar (and a search icon on phones in the More sheet + Today header). shadcn CommandDialog with groups: Tasks (every task in all days, incl. own; shows day and track), Notes (pages and task notes by title/body), Interviews (posts), Reads (news items), Actions (New task, Go to today, Go to Day N when the query is a number, open each page). Enter: task → open its day and its peek; note → Notes with it selected; post/read → open the link in a new tab (and mark read); action → run it.

## Left to the builder
Exact keyboard focus handling for rows, icon art, empty states ("No tasks match these filters."), and the cycle burn-up's precise geometry, within the existing design system (ink/grey, stone only for missed/risky, Inter, shared parts).
