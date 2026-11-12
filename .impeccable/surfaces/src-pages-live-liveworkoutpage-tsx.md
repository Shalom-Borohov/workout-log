---
version: 1
slug: "src-pages-live-liveworkoutpage-tsx"
primary_target: "src/pages/live/LiveWorkoutPage.tsx"
related_targets: ["src/pages/timeline/TimelinePage.tsx","src/pages/timeline/WorkoutDetailPage.tsx","src/pages/daily/DailyPage.tsx","src/pages/routines/RoutinesPage.tsx","src/pages/exercises/ExercisesPage.tsx","src/pages/exercises/ExerciseHistoryPage.tsx","src/theme.css"]
---

# Whole-app redesign: "Type tiles"

Scope: every screen of אימונים, starting from the live workout screen. Visitor mode: Operate. Platform: ios (Home Screen web app).

## Audience, job, constraints

- The owner, mid-workout: one hand, quick glances, phone at arm's length. Job on the live screen: read weight × reps, tap ✓, move on.
- Behaviour does not change. Every flow, gesture, tap path, limit and piece of copy in `docs/specs/2026-10-26-workout-log-design.md` stays as it is. Only the look and the screen arrangements change.
- iPhone behaviour stays: swipe back, sheets, action sheets, the tab bar, 44pt tap areas, reduce-motion.
- Decided by the owner on 2026-11-11: own look instead of Apple's stock look; all screens redone and released together; always dark, with no light mode and no appearance setting.

## Direction contract

THESIS: The numbers are the interface. Weight and reps sit at poster size on one flat colour tile, on a screen with no chrome. It refuses both the stock iOS grouped list the app had and the category default of dark cards holding a set table.

OWN-WORLD: A pure black ground, always. Heebo 200 for every numeral and all type from 30px up, Heebo 400 for small text. One accent, the owner's chosen accent colour, used as flat fills with a 24px radius and black text on it. Quiet fills are #1C1C1E. No borders, dividers, shadows, gradients or bar backgrounds anywhere.

STORY: Between sets the owner glances at the phone, reads the load and the reps without bringing it closer, taps ✓, and sees the next exercise's name already peeking in.

FIRST VIEWPORT: A plain-text nav row over a 4px accent progress line. The exercise name flush right on up to three lines at 46px. The done set as one text row. Then the tile, about 290px high: "20" and "8" side by side at 132px with a small × between, a label under each, − and + under each numeral, and a 72px ✓ circle in the bottom end corner, which is the primary action. The upcoming set as a grey text row, three text actions, and the next exercise's name at 46px, cropped by the screen edge, above a plain-text footer.

FORM: Metro typographic tiles, a catalog challenger (`digital-design-canon-metro-typographic-tiles`) the owner chose over the assigned grounded direction and re-confirmed in a second round. Tiles have rounded corners, a named translation for the owner's taste. The world lends type, palette, density and one signature move; navigation and controls stay iOS-standard. Signature interaction: swiping between exercises, where the peeking name glides in from the travel edge and becomes the title (type leads; no motion under reduce-motion). seed:8a37cc1d616a077c

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Locked compositions

Each sketch is the composition the build matches for that screen's first viewport. All are 390x844, dark mode.

- Live workout: `.impeccable/mocks/decision/tt-chosen.html`
- ציר זמן, "Week tiles": `.impeccable/mocks/decision/tl-week-tiles.html`
- יומי, "Routines at the thumb": `.impeccable/mocks/decision/dl-thumb-tiles.html`
- אימונים, "Contents": `.impeccable/mocks/decision/rt-contents.html`
- תרגילים, "Area tiles": `.impeccable/mocks/decision/ex-area-tiles.html`
- Live workout with a pair, "Two tiles": `.impeccable/mocks/decision/pr-two-tiles.html`
- Workout detail, "Section blocks": `.impeccable/mocks/decision/wd-section-blocks.html`
- Exercise history, "Number column": `.impeccable/mocks/decision/eh-number-column.html`
- Activity page (issue #84, spec item 93), "Field rows": `.impeccable/mocks/decision/ac-field-rows.html`. Picked over "Note is the page" and "Count tile" on 2026-11-12 (seed:896f3f185262e2b6). The פעילויות tile in תרגילים carries a boxing glove (`ai-glove.html`), picked over a stopwatch and a running shoe.

A preview the owner saw, not a choice: `state-timed.html` (a timed exercise with no weight, on the single tile). The `light-*.html` and `lm-*.html` files are a light-mode exploration the owner dropped; they are a record, not a brief.

Sketch noise that is not part of the choice: tab bar icons and body-area icons are stand-ins (the app's own icons stay), the sketches use teal #00ABA9 where the build uses the app's accent tokens, and sample data other than "אימון גוף מלא" is made up.

## Unresolved

- Screens with no round of their own inherit the world: routine editor, note import, Settings, every sheet and alert, empty states, the update bar, the backup reminder, the recovery screen. The owner chose not to run rounds for these.
- Live-screen states with no sketch: edit mode of a finished workout, the rest row, the "חזרה לתרגיל הנוכחי" pill, a skipped exercise, the background photo, a pair where one exercise is timed.
- Light mode: dropped for now. If it returns, it needs its own round; a token swap of the dark design was tried and rejected.
- The build plan, with the owner's decisions and numbered assumptions: `~/.claude/plans/shiny-giggling-candle.md`.
