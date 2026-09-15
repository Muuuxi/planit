# Planit

A desktop React + TypeScript + Vite planner. All data is local; there is no backend, real speech capture, or AI API.

## Shared hierarchy and Bright White

Projects now use Area → Course / Project → Work Type, with tasks shown as content under each work type. All three levels collapse and retain expansion while moving between views in the current session. Academic includes AIPI 590, GAMEDSGN 552, Serious Games and I&E 748. Existing custom projects and legacy academic work are preserved. Event editing and mock voice confirmation expose the same area, project and work-type relationships used by Calendar and Projects.

Bright White is an additional theme under Settings → Appearance; the other five themes remain. Project and event colors use one stronger, opaque palette across all views. Completed cards stay opaque, with strikethrough instead of fading. See [DESIGN_TOKENS.md](DESIGN_TOKENS.md) for the exact palette, surface tokens and migration behavior.

## Appearance and demo account

- Fresh sessions start at the Planit welcome screen. Explore Demo enters immediately. Google and Microsoft create simulated local sessions; email sign-in only checks browser form validity. Passwords are neither saved nor transmitted. Log out is available from the avatar menu and Settings → Account; it retains local planner data and the selected theme.
- Settings is organized into Appearance, Calendar and Account. Sage, Mist Blue, Warm Sand, Lavender and Clean Light share identical layout and typography. Their previews select a persisted app theme affecting surfaces, controls, focus states, capacity and voice/replanning panels.
- Events have one `color` and a `useProjectColor` flag. `src/appearance.tsx` resolves inherited colors from the shared project collection; views do not store separate color copies. The same resolved color appears in calendar blocks, summaries, deadlines, confirmation and detail panels.
- Projects supports create/edit/rename and default color selection. Inherited items follow project color changes; explicit overrides do not. New events can be created inside a project. The default inheritance preference affects new events, not existing overrides.
- Calendar Settings includes Show weekends. Completion quiets event colors; overlaps show a small warning marker while preserving project identity. Protected time retains its striped treatment.
- Existing locally saved planner items and calendar preferences are migrated in place. New persistence keys store projects and the simulated session independently.

## Run

Run these commands from the `planit` project folder.

```powershell
npm install
npm run dev -- --host 127.0.0.1
```

Open the URL printed by Vite, normally http://127.0.0.1:5173/. Do not double-click index.html. Keep the terminal running.

## Functional demo

- The compact left rail exposes Calendar, Projects and Settings with icon tooltips; legacy overview data remains in the model, but This Week and Work / Life are no longer in main navigation.
- Desktop layout: 68px primary icon rail → 280px secondary left context sidebar → calendar, with no right sidebar. The context sidebar starts collapsed to a 44px chevron handle and expands independently without discarding drafts or settings tabs. Calendar context is ordered week summary, Week Balance (planned effort hours / capacity and percentage), priorities, deadlines, then compact daily capacity. Over-capacity days receive restrained warning indicators. Projects context provides project jump links; Settings provides vertical Appearance, Calendar and Account categories. Editing and voice actions open their existing forms in the secondary sidebar.
- Quick Add lives at the top of Calendar context with Add event and an accented Speak a change action. When collapsed, the + button opens a small keyboard-accessible popover without expanding the sidebar; Escape or an outside click closes it. Choosing an action opens the existing editor or mock voice flow. The calendar header contains only date navigation, Today and Week/Day.
- A muted red current-time line appears only on today's visible timeline, using the selected timezone. It refreshes every 30 seconds, on focus, and on schedule changes. The label prioritizes an active timed event (including overnight events), then the nearest event starting later today, then `Done today`. Remaining time uses absolute instants, including across DST. Completed events still reserve their scheduled time; deadline-only markers are excluded. Overlapping active events show the earliest-ending event. Preview-only proposals do not change the committed-schedule countdown. Outside the visible hours or when browsing another date/week, the line is hidden.

- Settings in the secondary left sidebar immediately update visible start/end hours, midnight or 1 AM next-day endings, full 24-hour view, time format and timezone. Preferences persist in localStorage.
- Eastern, Pacific, China Standard Time and UTC are searchable by their readable names or IANA IDs. Events retain UTC instants; changing the display zone converts times and day columns, including DST. Event editing uses the event's selected timezone.
- Calendar, This Week, Projects and Work / Life share one planner collection. Completion, event editing, adding and deletion stay synchronized and persist across reloads.
- Weekly/day navigation uses actual dated events. Demo data seeds the previous, current and next weeks on first use. Other weeks begin empty.
- Capacity uses scheduled effort hours: high energy ×1.25, medium ×1, low ×0.8. Work overlapping 11 PM–5 AM reduces the following morning's daily capacity by 1.5h. Personal/recovery blocks do not consume productive capacity. Completion does not erase time already reserved.
- Speak a change simulates a transcript in the displayed week, defaulting extraction to Eastern Time. The confirmation cards support editing every field, removing commitments and retrying extraction. Date, start/end, optional deadline, timezone, project/category, priority, flexibility, energy and notes are editable. An end date supports overnight events. Invalid ranges and nonexistent DST times are rejected.
- Confirm & Replan creates a proposal without changing stored items. Preview shows dashed proposals and previous positions; Apply Changes commits the confirmed details. Keep Current Plan discards the proposal. Editing is disabled on preview cards until the proposal is applied or dismissed.
- The mock replanner bases preparation/recovery dates on the confirmed interview and looks for free slots; it retains fixed commitments and reports when helper blocks cannot be placed. It is a deterministic demo, not an AI scheduling engine.

## Implementation boundaries

- `src/planner.ts`: shared item/draft models, UTC conversion, demo seeding and derived capacity.
- `src/useLocalPlanner.ts`: local state and persistence with versioned keys.
- `src/voiceDemoData.ts`: simulated transcript and mock extraction, independent from UI.
- `src/mockReplan.ts`: mock recommendations and proposal generation.
- `src/components/CommitmentFields.tsx`: shared fields for event editing and voice confirmation.
- `src/appearance.tsx` and `src/themes.css`: theme definitions, palette and shared project color resolution.
- `src/demoSession.ts`: simulated local session, separate from planner state.
- `src/storageMigration.ts`: migrates legacy branding keys to `planit-*` on the same browser origin, retaining events, settings, project colors and demo sessions. Old product-name literals are intentional only in this compatibility module and its migration tests. User-authored titles and notes are not rewritten.

The old V3 plan was session-only; this version initializes a dated local dataset on first use. Storage is scoped to the current browser origin. No account or cloud synchronization is present.

## Verify

```powershell
npm run build
npm run test:e2e
```

Tests use installed Microsoft Edge through Playwright and cover settings/theme persistence, demo login/logout, project inheritance and event overrides, existing-data migration, date/time conversion, navigation, shared completion, CRUD, overnight capacity, and confirmation → preview → apply/cancel. Screenshots are written under `test-results/`.
