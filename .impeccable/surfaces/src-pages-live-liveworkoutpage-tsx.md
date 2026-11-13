---
version: 1
slug: "src-pages-live-liveworkoutpage-tsx"
primary_target: "src/pages/live/LiveWorkoutPage.tsx"
related_targets: ["src/pages/timeline/TimelinePage.tsx","src/pages/timeline/WorkoutDetailPage.tsx","src/pages/daily/DailyPage.tsx","src/pages/routines/RoutinesPage.tsx","src/pages/exercises/ExercisesPage.tsx","src/pages/exercises/ExerciseHistoryPage.tsx","src/theme.css"]
---

# Whole-app redesign: "Road Signs"

Scope: every screen of אימונים, starting from the live workout screen. Visitor mode: Operate. Platform: ios (Home Screen web app). Replaces "Type tiles" (2.0.0), which the owner rejected after using it on the phone (issues #95, #93).

## Audience, job, constraints

- The owner, mid-workout on an iPhone SE: one hand, quick glances, phone at arm's length. Job on the live screen: read weight × reps, tap ✓, move on.
- Screens are designed at 375×647 first (the SE's Home Screen app under its status bar) and judged on the phone. Taller phones get more air.
- Behaviour does not change except where the spec says so (items 95 to 105): the rest countdown shows on the current set, a superset is one plate with a switch, and daily routine rows swipe to archive.
- iPhone behaviour stays: swipe back, sheets, action sheets, the tab bar, 44pt tap areas, reduce-motion.
- Fixed by the owner on 2026-11-12: the six-colour accent picker. The look stays dark and keeps Heebo because the chosen direction does, not because they were pinned.
- What the owner said was wrong with the old look: sizes off on the real screen, thin dim type, bare +/− glyphs beside the ✓, crowded screens, and the look itself.

## Direction contract

THESIS: Read in one glance from arm's length. Heavy Hebrew type on outlined plates over asphalt grey, with real buttons under the thumb. It refuses the dark card holding a set table, and it refuses the thin poster numerals and flat colour tiles the app had.

OWN-WORLD: Asphalt charcoal ground #14171A, plates #1F2428 with a 2px keyline and 14px corners, quiet keyline #3A4147 and white #F4F5F5 where it matters. Heebo 500, 700 and 900 only. One accent fill per plate for the thing that matters, the owner's accent with ink text and an inset ink keyline. Done is a green ✓ mark. 12px between plates, 16px gutters.

STORY: Between sets the owner glances down, reads the load and the reps, sees how much rest is left, taps the wide ✓ under the thumb, and the next exercise is already named at the bottom.

FIRST VIEWPORT: iOS nav row, then the section and position with a thin progress line, the exercise name at 36px heavy with its tip. The done set is a quiet outlined plate. The current set is the accent plate in the lower half: "סט 2 מתוך 3" and the rest pill, 70 and 8 at 64px heavy with units, an outlined 48px − and + under each, and a full-width ink ✓ bar at its foot. The waiting set is a quiet plate, then three text actions, then a white-keyline plate "הבא: לחיצת חזה" beside the "כל התרגילים" button.

FORM: Israeli highway signage, first on the grounded list and shown as the pick; the owner chose it over the assigned White City, the winning Gate Board challenger and the category standard. It lends type, palette, density and one signature move, the keyline plate; navigation and controls stay iOS-standard. seed:7d4f753da07f7ead

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Locked compositions

Each sketch is the composition the build matches for that screen's first viewport. All are 375x647, dark, in `.impeccable/mocks/decision/`.

- Live workout: `road-signs.html`
- ציר זמן: `road-signs-timeline.html`
- יומי, "Checklist first": `dl-checklist-first.html` (seed:1f91e2fc5c0dac32), over "Tiles two-up" and "Today plate"
- אימונים, "Parts table": `rt-parts-table.html` (seed:06274ab1be012090), over "Bottom-anchored" and "Sign rows"
- תרגילים, "Icon rail": `ex-icon-rail.html` (seed:f3cfec96580560b3), over "Grouped list" and "Area strip"
- Workout detail, "Two-line rows": `wd-two-line-rows.html` (seed:84ce33bd8899a52b), over "Table" and "Highlights first"
- Exercise history, "Bars": `eh-bars.html` (seed:5ba52f1041ab9662), over "Set chips" and "Number column"
- Live workout with a pair, "Switch": `pr-switch.html` (seed:6561707a3527e5e7), over "One plate, two rows" and "Side by side"

Sketch noise that is not part of the choice, where the build keeps today's behaviour (plan assumptions 1 to 8):

- "סיום" stays at the end of the nav row and ⋯ and ⏱ at its start; the sketch drew them swapped.
- − stays before + in reading order; the sketch drew + first.
- The progress line means sets done out of all sets; the sketch drew one segment per exercise.
- Done and waiting set rows keep a tappable ✓; the sketch drew a plain mark.
- ⏱ appears only once a rest exists.
- Hebrew strings are the app's own where a sketch worded them differently.
- Body-area icons stay in the accent, and tab bar and body-area icons are the app's own; the sketches drew stand-ins.
- Today on the week strip gets its own outer ring; no sketch shows today.
- Sample data other than "אימון גוף מלא" is made up, and the sketches use teal where the build uses the accent tokens.

## Unresolved

- Screens with no round of their own inherit the world: routine editor, note import, Settings, every sheet and alert, the day sheet, the daily archive, the activity page, empty states, the update bar and "מה חדש", the backup reminder, the recovery screen.
- Live-screen states with no sketch: a timed exercise, edit mode of a finished workout, a skipped exercise, the "חזרה לתרגיל הנוכחי" pill, the background photo, the ended rest.
- Light mode and Dynamic Type are out of scope.
- The build plan, with the owner's decisions and numbered assumptions: `~/.claude-personal/plans/crystalline-baking-marble.md`.
