# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

אימונים: a Hebrew (RTL) iPhone PWA for running workout routines live and logging them. No backend. Data lives in IndexedDB on the phone, and the user moves it with a JSON backup file. Live at https://shalom-borohov.github.io/workout-log/.

- `docs/specs/2026-10-26-workout-log-design.md` is the source of truth for behaviour. Read it before changing a flow. Record new product decisions there as numbered items marked "(added YYYY-MM-DD)".
- `PRODUCT.md` holds the product context: users, principles, Hebrew terms, and the iOS-native design commitments. Where Apple HIG and the Impeccable design guidance conflict, HIG wins.

## Commands

```bash
npm run dev                                    # Vite dev server (base path /workout-log/)
npm run build                                  # tsc -b (app, node and test configs) + vite build
npm run lint                                   # oxlint
npm test                                       # full Vitest suite
npx vitest run test/ui/live.test.tsx           # a single file
npx vitest run test/ui/live.test.tsx -t "skips" # a single test by name
```

CI on a PR runs lint, test and build, plus dependency review and Trivy. A push to `main` tests, builds and deploys to GitHub Pages.

## Architecture

Code is in three layers, and dependencies point downward only:

- `src/domain/`: pure functions and types. No React or Dexie.
  - `types.ts`: the data model.
  - `parseNote.ts`: pasted Apple Notes text → routine.
  - `progress.ts`: workout start/prefill, history, ↑/★ changes.
  - `workoutEdits.ts`: set and skip edits on a workout, plus navigation helpers.
  - `routineEdit.ts`: routine editor operations.
  - `timeline.ts`: week grouping.
  - `format.ts`: display formatting.
- `src/data/`:
  - `db.ts`: the Dexie database (`routines`, `workouts`, and `settings` for the background photo).
  - `migrate.ts`: `Legacy*` types and `upgrade*` functions, shared by the Dexie upgrade and backup import.
  - `repo.ts`: thin write and query functions.
  - `hooks.ts`: `useLiveQuery` hooks the pages read from.
  - `backup.ts`: backup export/import, with hand-written type guards for the JSON.
- `src/pages/<feature>/` (`live`, `routines`, `timeline`, `exercises`, `settings`): grouped by feature. Each folder holds that screen's components, hooks, CSS and copy, and features don't import from each other.
- Shared UI goes in `src/components/`, `src/hooks/`, `src/navigation/` and `src/copy/`. Move code there only once a second feature needs it.

Data model essentials:

- Routine → sections → items → exercises.
  - The set count lives on the section. An item may override it (`RoutineItem.sets`; `null` means use the section's).
  - An item with two exercises is a pair (superset). There is no discriminator field.
  - A target is `{kind:'reps'}` or `{kind:'duration', seconds}`. Weights are kg, `number | null`.
- A workout is a snapshot copied from the routine when it starts (`startWorkout`). It carries its own `SetLog`s, prefilled from the last session of the same exercise.
- Exercises are identified by exact name across routines and workouts. There is no exercise table, and history is derived.
- A workout is active while `finishedAt === null`. Only one can be active at a time (`beginWorkout`).

Routing:

- The app uses `IonReactHashRouter` because it is hosted on GitHub Pages.
- The root `IonRouterOutlet` holds `/tabs/*` (`Tabs.tsx`, with its own outlet and tab bar) and a redirect from the old `/workout/:id`.
- The live workout page sits under the tab it was opened from: `/tabs/timeline/workout/:id` or `/tabs/routines/workout/:id` (`workoutPath(tab, id)`). The tab bar is hidden on it.
  - Ionic React assigns a page to a tab only if its URL is under that tab's path. A page outside every tab makes going back count as a tab switch, which has no animation.
  - Keep it there. Ionic unmounts a nested outlet's pages while you're in a sibling root route, so a swipe-back would reveal a blank shell.
- The same live page edits a finished workout (edit mode, entered via the detail page's "עריכה").
- Swipe-back is Ionic's own gesture (right edge in RTL). `src/navigation/edgeSwipe.ts` blocks iOS's built-in edge swipe by calling `preventDefault()` on `touchstart` within 20 px of either edge, unless the touch starts on a control. A scroll that starts in that strip therefore does not scroll.
  - In a Home Screen app on a Hebrew iPhone, iOS's swipe also uses the right edge. When both ran, the app jumped and froze taps (ionic-framework#29733, #22299). With only iOS's swipe, it slid a snapshot and then flashed the old page.
- `src/navigation/tapGuard.ts` ignores taps while an Ionic page transition is still animating, for at most 1 s per transition, so a stuck animation can't freeze the app.
  - Without it, a tap during the end of a swipe-back reuses a page that Ionic then hides with `display: none`.

Live page state:

- `LiveWorkout` keeps the workout in local state plus a ref.
- Every edit runs a pure `workoutEdits` function, then `saveWorkout` fire-and-forget. The UI never waits on IndexedDB.

Schema changes:

- The data lives only on the phone, so schema changes must be additive.
- Add a new `this.version(n)` in `db.ts`, with an `.upgrade()` callback that fills defaults through `migrate.ts`.
- Make the guards in `backup.ts` accept the legacy shape, so old backup files still import.
- Cover both with a test that opens a database in the previous version (see `test/unit/migrate.test.ts`).

## Testing

- Vitest with jsdom and fake-indexeddb (`test/setup.ts`). Tests live only under `test/`:
  - `test/unit/`: domain and repo tests.
  - `test/ui/`: full-app tests.
- UI tests seed the database with `resetDb()` and `saveRoutine`/`saveWorkout`, then `renderAt('/path')`. That renders `AppRoutes` in a memory router, and `currentPath()` reads the location.
- Builders are in `test/helpers/workouts.ts`: `routine`, `routineExercise`, `workout`, `exercise`, `done`, `open`, `reps`, `oct`.
- Ionic inputs and segments need the custom-event helpers in `test/helpers/ionic.ts` (`ionChange`, `ionInput`, `ionField`, `actionSheetPresented`). Plain `fireEvent.change` won't reach them.
- Scope queries to the visible page (`visibleAll`, `ionElement`), because Ionic keeps hidden pages in the DOM.

## Conventions

- All UI copy is Hebrew and lives in constants, never inline in components. A screen's own text is in its feature folder (`src/pages/<feature>/copy.ts`, one `<FEATURE>_COPY` object). Text used by more than one feature is in `src/copy/` (`COMMON_COPY`, `FORMAT_COPY`, `APP_COPY`). Tests keep Hebrew literals, as an independent check. Use the terms in `PRODUCT.md` (אימון, חלק, סט, חזרות, סיכום, …).
- Name values that encode a decision (limits, defaults, durations, MIME types, keys) as consts in the module that owns them. Discriminated-union tags (`'reps'`, `'duration'`) and framework API values (`'cancel'`, `'root'`) stay inline; the types check them.
- Ionic is forced to iOS mode, and the look follows native iOS. Colour tokens are in `src/theme.css`: system orange tint, ✓ in iOS green, light/dark follow the phone.
- No `as` casts (`as const` is fine) and no `?? ''`/`?? 0` fallbacks to satisfy types. Narrow parsed JSON with type guards.
- Durations are stored in seconds. Minutes are a display unit only.
- Every PR that ships raises `version` in `package.json`: the minor number for features, the patch number for fixes. Settings shows it with the build time.
- Keep files under about 250 lines, split by responsibility.
