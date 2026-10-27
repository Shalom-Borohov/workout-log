# אימונים Workout Log Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Per the user's CLAUDE.md: no commits, no worktrees; follow the `tdd` skill per task.

**Goal:** An iPhone PWA (Hebrew, RTL, native iOS look) for running workout routines live and reviewing them on a timeline.

**Architecture:** Pure domain functions (`src/domain/`) hold all logic (note parsing, prefill, progress, grouping, formatting). Dexie stores two tables (`routines`, `workouts`) behind a thin repo + `useLiveQuery` hooks (`src/data/`). Ionic React pages (`src/pages/`) render state and call repo functions; every edit is written to IndexedDB immediately.

**Tech Stack:** React 19, TypeScript 6, Vite 8, Ionic React 9 (iOS mode) + react-router 6 (hash router), Dexie 4 + dexie-react-hooks, vite-plugin-pwa 2, Vitest 5 + jsdom + Testing Library + fake-indexeddb.

**Spec:** `docs/superpowers/specs/2026-10-26-workout-log-design.md`

## Global Constraints

- All UI copy in Hebrew; `<html lang="he" dir="rtl">`; Ionic `mode: 'ios'`.
- App name `אימונים`; Vite `base: '/workout-log/'`; `IonReactHashRouter`.
- Tests only under `test/` (`test/unit/**`, `test/ui/**`); test helpers under `test/helpers/`.
- No `as` casts (except `as const`), no `unknown` workarounds, no `?? ''`/`?? 0` fallbacks; type guards for parsed JSON.
- No explanatory comments. Blank line before `return` (unless it is the only statement). Files ≤ ~250 lines.
- Weights in kg (`number | null`); durations stored in seconds.
- Run Vitest per touched file while iterating: `npx vitest run <file>`; full suite once at the end.
- Subagents edit only the files their task owns; they don't run the full build.

## Review Focus

1. App closed / phone locked mid-workout → reopening shows every ticked set and resumes at the first unfinished exercise (Task 5: `resumes at first unfinished item`).
2. Messy note text: blank lines, trailing spaces, `→` instead of `->`, a line with no number, exercises before any header, a header without "סטים" (Task 1 tests).
3. First-ever workout / never-done exercise → prefill from routine target, weight `null`, no ↑/★ (Task 2: `prefills from target when no history`, `no changes on first session`).
4. Skipped or partial exercise → not used as "last time" and not counted as done sets (Task 2: `ignores sessions with no done sets`, `summary counts done sets only`).
5. Importing an invalid backup → Hebrew error shown, existing data untouched (Task 4: `invalid backup leaves data intact`).

---

## Shared interfaces (written by Task 0, read-only for Tasks 1–5)

`src/domain/types.ts`:
```ts
export type Target = { kind: 'reps'; reps: number } | { kind: 'duration'; seconds: number };
export interface RoutineExercise { name: string; target: Target }
export interface RoutineItem { id: string; exercises: RoutineExercise[] }          // 1 = single, 2 = pair
export interface RoutineSection { id: string; name: string; sets: number; items: RoutineItem[] }
export interface Routine { id: string; name: string; sections: RoutineSection[]; updatedAt: number }
export interface SetLog { weight: number | null; amount: number; done: boolean }    // amount = reps or seconds
export interface WorkoutExercise { name: string; target: Target; sets: SetLog[]; skipped: boolean }
export interface WorkoutItem { id: string; exercises: WorkoutExercise[] }
export interface WorkoutSection { name: string; items: WorkoutItem[] }
export interface Workout { id: string; routineId: string; routineName: string; startedAt: number; finishedAt: number | null; summary: string; sections: WorkoutSection[] }   // summary '' = none
```

`src/data/repo.ts`: `saveRoutine(r: Routine): Promise<void>`, `deleteRoutine(id: string): Promise<void>`, `saveWorkout(w: Workout): Promise<void>`, `deleteWorkout(id: string): Promise<void>`, `finishedWorkouts(): Promise<Workout[]>` (newest first), `activeWorkout(): Promise<Workout | undefined>`, `beginWorkout(routine: Routine): Promise<Workout>` (uses Task 2 `startWorkout`).

`src/data/hooks.ts` (`useLiveQuery`, `undefined` while loading): `useRoutines(): Routine[] | undefined` (by name), `useRoutine(id)`, `useWorkout(id)`, `useFinishedWorkouts(): Workout[] | undefined`, `useActiveWorkout(): Workout | null | undefined` (`null` = none).

`test/helpers/renderWithApp.tsx`: `renderAt(path: string)` renders the full `App` routes inside `IonReactMemoryRouter` at `path`; `resetDb()` clears both tables. `test/setup.ts` loads `fake-indexeddb/auto`, jest-dom, `matchMedia` mock, `setupIonicReact({ mode: 'ios' })`.

Routes (in `src/App.tsx` / `src/Tabs.tsx`, owned by Task 0):

| Path | Page (file) | Task |
|---|---|---|
| `/tabs/timeline` | `pages/timeline/TimelinePage.tsx` | 3 |
| `/tabs/timeline/:id` | `pages/timeline/WorkoutDetailPage.tsx` | 3 |
| `/tabs/exercises` | `pages/exercises/ExercisesPage.tsx` | 3 |
| `/tabs/exercises/:name` | `pages/exercises/ExerciseHistoryPage.tsx` | 3 |
| `/tabs/routines` | `pages/routines/RoutinesPage.tsx` | 4 |
| `/tabs/routines/import` | `pages/routines/ImportNotePage.tsx` | 4 |
| `/tabs/routines/settings` | `pages/routines/SettingsPage.tsx` | 4 |
| `/tabs/routines/:id` | `pages/routines/RoutineEditPage.tsx` | 4 |
| `/workout/:id` (no tab bar) | `pages/live/LiveWorkoutPage.tsx` | 5 |

Task 0 creates each page as a stub (`<IonPage>` with the title) so the app builds; the owning task replaces it.

---

### Task 0: Scaffold, data layer, app shell (main agent, before dispatch)

**Files:** `index.html`, `vite.config.ts`, `package.json`, `tsconfig*.json`, `src/main.tsx`, `src/App.tsx`, `src/Tabs.tsx`, `src/theme.css`, `src/domain/types.ts`, `src/data/db.ts`, `src/data/repo.ts`, `src/data/hooks.ts`, page stubs, `public/` icons, `.github/workflows/deploy.yml`, `test/setup.ts`, `test/helpers/renderWithApp.tsx`, `test/unit/repo.test.ts`, `test/ui/app.test.tsx`.

- [ ] Write `test/ui/app.test.tsx`: `renderAt('/')` shows tab labels `ציר זמן`, `אימונים`, `תרגילים`. Run → FAIL.
- [ ] Write `test/unit/repo.test.ts`: `finishedWorkouts` returns finished only, newest first; `activeWorkout` returns the one with `finishedAt === null`. Run → FAIL.
- [ ] Implement shell, Dexie schema (`routines: 'id, name'`, `workouts: 'id, startedAt'`), repo, hooks, stubs, PWA config (manifest `lang: 'he'`, `dir: 'rtl'`, `display: 'standalone'`, iOS meta tags, icons 180/192/512), dark palette `dark.system.css`, `navigator.storage.persist()` on start. `beginWorkout` may temporarily throw until Task 2 lands.
- [ ] Run both tests → PASS; `npm run build` → succeeds.

### Task 1: Note parser (subagent A)

**Files:** Create `src/domain/parseNote.ts`; Test `test/unit/parseNote.test.ts`.

**Interfaces:** Produces `parseNote(text: string, newId: () => string): { name: string; sections: RoutineSection[] }`.

Rules: first non-empty line that is not a header and has no trailing amount → routine name (else `'אימון חדש'`). A line ending with `:` is a section header; `(\d+)\s*סטים?` gives `sets` (default 1) and is removed from the name together with the colon; empty name → `'עיקרי'`. Other lines: split on `->` or `→` into a pair; each part `<name> <N>` → reps, `<name> <N> דקות|דקה|דק׳` → `seconds = N*60`, `<name> <N> שניות|שנייה|שנ׳` → seconds. Part with no number → `{ kind: 'reps', reps: 0 }`. Exercises before any header go into section `'עיקרי'` with `sets: 1`. Sections with no items are dropped. Trim every name.

- [ ] Write tests: `parses the full-body sample` (the user's note from the spec conversation → name `אימון גוף מלא`; sections `חימום בבית`/2 sets/3 items, `עיקרי`/3 sets/9 items, `סיום`/1 set/2 items; `מדרגות` → `{kind:'duration', seconds: 900}`; `מתיחת כופפי ירך בכריעה` → 30 s; item 8 of `עיקרי` is a pair `משיכה לפנים` 12 + `הכנסת סנטר` 10), `accepts unicode arrow`, `tolerates blank lines and trailing spaces`, `line without number gets reps 0`, `exercises before a header go to עיקרי`, `drops empty sections`, `default name when first line is an exercise`. Run → FAIL.
- [ ] Implement. Run → PASS.

### Task 2: Progress, timeline grouping, formatting (subagent B)

**Files:** Create `src/domain/progress.ts`, `src/domain/timeline.ts`, `src/domain/format.ts`; Test `test/unit/progress.test.ts`, `test/unit/timeline.test.ts`, `test/unit/format.test.ts`.

**Interfaces (Produces):**
- `progress.ts`
  - `lastSets(history: Workout[], name: string, before: number): SetLog[] | null` — done sets of `name` from the most recent workout with `finishedAt !== null`, `startedAt < before`, ≥1 done set of that exercise.
  - `startWorkout(routine: Routine, history: Workout[], now: number, newId: () => string): Workout` — `section.sets` sets per exercise; set i prefill = `last[i] ?? last[last.length-1]` (weight, amount) else `{ weight: null, amount: targetAmount(target) }`; all `done: false`, `skipped: false`, `finishedAt: null`.
  - `targetAmount(t: Target): number`.
  - `bestSet(sets: SetLog[]): SetLog | null` — among done sets: highest weight (`null` lowest), then highest amount.
  - `type Change = { name: string; kind: 'up' | 'record'; set: SetLog }`; `workoutChanges(w: Workout, history: Workout[]): Change[]` — per exercise with a done set: `record` if best weight is non-null and greater than every earlier done weight and an earlier session exists; else `up` if best beats the previous session's best (higher weight, or equal weight and higher amount). First session → none.
  - `type ExerciseSession = { workoutId: string; startedAt: number; target: Target; sets: SetLog[] }`; `exerciseHistory(history: Workout[], name: string): ExerciseSession[]` — finished workouts, done sets only, newest first.
  - `exerciseNames(routines: Routine[], workouts: Workout[]): string[]` — unique, sorted with `localeCompare(.., 'he')`.
- `timeline.ts`
  - `summarize(w: Workout): { minutes: number; doneSets: number }` — `Math.round((finishedAt - startedAt) / 60000)`; counts done sets across all exercises.
  - `groupByWeek(workouts: Workout[], now: number): { title: string; workouts: Workout[] }[]` — local-time weeks starting Sunday 00:00; titles `השבוע`, `שבוע שעבר`, else `D.M–D.M` (Sunday–Saturday); groups and items newest first.
- `format.ts`
  - `formatDay(ts: number): string` → `יום ב׳ 26.10` (letters א׳ ב׳ ג׳ ד׳ ה׳ ו׳ ש׳).
  - `formatClock(ms: number): string` → `4:05`, `1:02:09`.
  - `formatAmount(amount: number, target: Target): string` → reps `15`; duration `15 דק׳` when divisible by 60, else `30 שנ׳`.
  - `formatSet(set: SetLog, target: Target): string` → `22 × 15`, or just `formatAmount` when weight is `null`.

- [ ] Write tests incl. `prefills from last session`, `prefills from target when no history`, `extra sets reuse the last logged set`, `ignores sessions with no done sets`, `no changes on first session`, `record beats up`, `equal weight more reps is up`, `summary counts done sets only`, `week starts on Sunday` (Saturday 23:00 and Sunday 00:30 land in different groups), formatting cases above. Run → FAIL.
- [ ] Implement. Run → PASS.

### Task 3: Timeline + Exercises tabs (subagent C, after Tasks 1–2)

**Files:** Replace stubs `src/pages/timeline/TimelinePage.tsx`, `src/pages/timeline/WorkoutDetailPage.tsx`, `src/pages/exercises/ExercisesPage.tsx`, `src/pages/exercises/ExerciseHistoryPage.tsx`; may add `src/pages/timeline/*.tsx` components. Test `test/ui/timeline.test.tsx`, `test/ui/exercises.test.tsx`.

**Consumes:** hooks, repo, `groupByWeek`, `summarize`, `workoutChanges`, `exerciseHistory`, `exerciseNames`, `bestSet`, `formatDay`, `formatClock`, `formatSet`.

Behaviour: large collapsing title `ציר זמן`. Active workout → banner `אימון בתהליך` + elapsed clock, tap → `/workout/:id`. Else button `התחל אימון`: 0 routines → push `/tabs/routines/import`; 1 → `beginWorkout` and push `/workout/:id`; >1 → action sheet of routine names. Week groups as list headers; card = routine name, `formatDay`, `N דק׳ · M סטים`, up to 3 changes (`↑ סקוואט 22 ק״ג`, `★ ...`). Empty state `עוד אין אימונים`. Card also shows the first line of `workout.summary` (single line, ellipsis) under the changes line, when non-empty. Detail page: a `סיכום` inset list with an auto-growing `IonTextarea` (placeholder `הוספת סיכום…`) that saves `summary` on `ionChange`; per section, each exercise with `formatSet` joined by ` · `, `דילגת` for skipped; buttons `עריכה` (push `/workout/:id`) and `מחיקת אימון` (IonAlert confirm, then `deleteWorkout`, go back). Exercises: `IonSearchbar` filter, row = name + last best set + date; history page lists sessions newest first, ★ on the session holding the heaviest weight.

- [ ] Tests: `shows workouts grouped by week with changes`, `card shows first line of summary`, `detail edits summary`, `empty state`, `start with one routine opens live workout`, `active workout shows resume banner`, `detail deletes workout`, `exercise list filters`, `exercise history newest first`. Run → FAIL. Implement. Run → PASS.

### Task 4: Routines tab, import, editor, backup (subagent D, after Tasks 1–2)

**Files:** Replace stubs `src/pages/routines/RoutinesPage.tsx`, `ImportNotePage.tsx`, `RoutineEditPage.tsx`, `SettingsPage.tsx`; may add `src/pages/routines/*.tsx`; Create `src/data/backup.ts`. Test `test/unit/backup.test.ts`, `test/ui/routines.test.tsx`.

**Consumes:** hooks, repo, `parseNote`, `formatAmount`. **Produces:** `type Backup = { version: 1; exportedAt: number; routines: Routine[]; workouts: Workout[] }`; `parseBackup(json: unknown): Backup` (throws `Error('קובץ הגיבוי לא תקין')`, full type guards); `exportBackup(now: number): Promise<Backup>`; `restoreBackup(b: Backup): Promise<void>` (one transaction: clear + bulkPut).

Behaviour: large title `אימונים`; toolbar `+` → action sheet `הדבקת פתק` / `אימון ריק` (creates routine `אימון חדש` with section `עיקרי`, 3 sets, opens editor); gear → settings. Rows: name + `N תרגילים`, tap → editor, `התחל` button → `beginWorkout` → `/workout/:id` (if an active workout exists, push to it instead). Swipe to delete with confirm. Import: `IonTextarea` autoGrow, live preview of `parseNote` (sections, sets, items with `formatAmount`; reps 0 shown as `?`), `שמירה` saves and replaces to `/tabs/routines/:id`. Editor: routine name; per section name, sets stepper (1–10), reorderable items (`IonReorderGroup`), tap item → modal editing names, target kind segment `חזרות`/`זמן`, amount, toggle `זוג`; add item / add section / delete section / delete routine. Saves on each change. Settings: `ייצוא גיבוי` (file `workouts-backup-YYYY-MM-DD.json`; `navigator.share({ files })` when `navigator.canShare` accepts it, else download link), `ייבוא גיבוי` (file input → `parseBackup` → confirm `הייבוא יחליף את כל הנתונים` → `restoreBackup`; on error show the message in a toast).

- [ ] Tests: `backup round-trips`, `invalid backup leaves data intact`, `import page saves parsed routine`, `editor renames and changes sets`, `start opens live workout`. Run → FAIL. Implement. Run → PASS.

### Task 5: Live workout (subagent E, after Tasks 1–2)

**Files:** Replace stub `src/pages/live/LiveWorkoutPage.tsx`; Create `src/pages/live/workoutEdits.ts`, `src/pages/live/useWakeLock.ts`, `src/pages/live/useNow.ts`, other `src/pages/live/*.tsx`. Test `test/unit/workoutEdits.test.ts`, `test/ui/live.test.tsx`.

**Consumes:** `useWorkout`, `saveWorkout`, `deleteWorkout`, `formatClock`, `formatAmount`.

**Produces (`workoutEdits.ts`, pure, return new `Workout`):** `type ItemRef = { section: number; item: number }`; `itemRefs(w): ItemRef[]`; `firstUnfinished(w): number` (index into `itemRefs`, first item with an undone set and not skipped, else last); `updateSet(w, ref, exercise: number, set: number, patch: Partial<SetLog>)`; `addSet(w, ref)` (copies last set, `done: false`, for every exercise in the item); `removeSet(w, ref)` (keeps ≥1); `toggleSkip(w, ref)`.

Behaviour: no tab bar. Header: `סיום` button, title = routine name, subtitle elapsed clock (`useNow(1000)`) while active. Body: one item at a time (straight sets) — section name, `תרגיל 3 מתוך 12`, per set row `סט N`, weight input (`inputmode="decimal"`, hidden for duration targets), amount input (minutes when target seconds divisible by 60, else seconds), round ✓ toggle. Pairs: rows grouped by set number, A then B. Ellipsis → action sheet `דלג על התרגיל`/`בטל דילוג`, `הוסף סט`, `הסר סט`. Footer: `הקודם` / list button (sheet modal of all items with ✓ / skipped state, tap to jump) / `הבא`. Starts at `firstUnfinished`. Every edit → `saveWorkout`. `סיום` (active) → sheet modal `סיכום האימון`: optional auto-growing textarea (placeholder `איך היה האימון?`), toolbar `ביטול` / `שמירה` (`שמירה` sets `summary` (trimmed) + `finishedAt`, navigates root to `/tabs/timeline/:id`), and a red `מחיקת האימון` button at the bottom (IonAlert confirm → `deleteWorkout`, navigate root to `/tabs/timeline`). Finished workout (edit mode): title `עריכת אימון`, `סיום` just goes back. `useWakeLock(active)` requests `navigator.wakeLock` and re-requests on `visibilitychange`.

- [ ] Tests: `firstUnfinished skips done and skipped`, `addSet copies last set`, `removeSet keeps one`, `ticking a set persists` (reload page → still ticked), `resumes at first unfinished item`, `finish saves summary and finishedAt and opens detail`, `finish with empty summary`. Run → FAIL. Implement. Run → PASS.

### Task 6: Integrate and verify (main agent)

- [ ] `npx vitest run --maxWorkers=25%` → all pass; `npm run build` → succeeds; `npm run lint` clean.
- [ ] Drive the app with `agent-browser` at iPhone viewport (390×844): paste the sample note, run a workout, finish, check timeline, exercises, backup export.
- [ ] `simplify`, then `code-review --fix`, re-run tests + build.
- [ ] Start with the `dev` skill and hand the URL to the user.

### Task 7: Publish (main agent, only when the user asks)

The global git identity is the user's **work** account; this repo must use their **private** GitHub account.

- [ ] Tell the user to log in: `! gh auth login --hostname github.com --git-protocol https --web` (HTTPS, so the work SSH key isn't used).
- [ ] Run `gh api user --jq '{login, id}'`, show the login, and wait for the user to confirm it's the private account.
- [ ] `git init`; repo-local `git config user.name` / `user.email` = `<id>+<login>@users.noreply.github.com`. Global config untouched.
- [ ] Commit only when asked; `gh repo create workout-log --public --source . --push`; enable Pages (GitHub Actions source); give the user the `https://<login>.github.io/workout-log/` URL.

---

## Design pass (2026-10-27)

Spec: design doc decisions 15–17. Guides: `PRODUCT.md`, `.claude/skills/impeccable/reference/{ios,operate,craft-floor,polish}.md` (Operate mode; Apple HIG wins). Baseline screenshots: scratchpad `design/before/*.png`.

Findings to fix: dark mode inverted (IonContent `color="light"` → grey page, black cells); ↑/★ unicode glyphs (use ionicons `arrowUp`/`star`); flat card hierarchy; oversized section headers; repeated weights in set lists; sparse live screen with small inputs; dense editor.

### Task D0 (main): theme + shared domain helpers
- `src/theme.css`: tint = iOS orange (`#ff9500` light / `#ff9f0a` dark, with shade/tint/contrast vars); iOS grouped backgrounds (light page `#f2f2f7`, cells `#fff`; dark page `#000`, cells `#1c1c1e`); remove `color="light"` from every IonContent/condensed toolbar; hidden scrollbars.
- `src/domain/format.ts`: `formatSets(sets: SetLog[], target: Target): string` — same weight on every set → `27.5 ק״ג × 15, 15, 13`; all weights null → amounts joined `, ` with the unit once (`10, 10` / `15 דק׳`); otherwise per-set `formatSet` joined ` · `. `formatWeekSummary(workouts: number, doneSets: number)` → `3 אימונים · 96 סטים` / `אימון אחד · …`.
- `src/domain/progress.ts`: export `previousSets(history, exercise: { name: string; target: Target }, before: number): SetLog[] | null` (today's private `lastSetsLike`); `weightTrend(sessions: ExerciseSession[]): { startedAt: number; weight: number }[]` (oldest → newest, heaviest weight per session, sessions with no weight skipped).
- `src/domain/workoutEdits.ts`: `workoutProgress(w): { done: number; total: number }` (skipped exercises excluded); `stepValue(value: number | null, delta: number): number` (null → max(delta, 0); never below 0); `stepSize(target: Target, field: 'weight' | 'amount'): number` (weight 2.5, reps 1, duration 60 when shown in minutes else 15).
- `src/components/ChangeBadge.tsx`: ↑ green `arrowUp` / ★ orange `star` + text, used by timeline cards and exercise history.

### Tasks D1–D4 (parallel subagents, after D0)
- **D1 live** (`src/pages/live/*`): current set (first undone, or tapped) shows large −/+ steppers for weight and amount (≥44pt), others compact rows; tap number to type; ✓ is a large green filled circle when done; "פעם קודמת" line under the exercise title via `previousSets` (hidden when null); progress bar under the header (`workoutProgress`); auto-advance 600 ms after a ✓ completes the item (active only, not on the last item, not on un-tick).
- **D2 timeline** (`src/pages/timeline/*`): card hierarchy (title semibold, meta secondary, changes as `ChangeBadge`s, summary line tertiary/italic-free), week header with `formatWeekSummary`, detail uses `formatSets` and lighter section headers; start button with a play icon.
- **D3 exercises** (`src/pages/exercises/*`): history top chart from `weightTrend` (inline SVG, tint stroke, ≥2 points), `formatSets` in rows, `ChangeBadge`-style star icon; list rows show the best set as trailing value.
- **D4 routines** (`src/pages/routines/*`): editor — labelled name field, section name as a header-style field, iOS-style stepper pair, clear add/delete affordances; import preview and routine rows aligned with the same vocabulary.

Each: TDD for behaviour, Impeccable craft floor before edits, no edits outside own folder (report needs). Main integrates, screenshots light/dark, runs `impeccable detect`, then simplify → code-review → dev.
