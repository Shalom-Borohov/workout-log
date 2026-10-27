# אימונים — Workout Log PWA Design

Replaces Apple Notes workout notes. iPhone-only PWA that looks and feels native.

## Decisions (from grilling, 2026-10-26)

1. **Core flow:** live session + history. Open a routine, go through it live checking off sets; each finished workout lands on a timeline feed. Tap an exercise to see its history.
2. **Per set:** weight + reps, prefilled from last time; usually just tap ✓. Items are either reps-based or time-based (`15 דקות`, `30 שניות`).
3. **Language:** Hebrew UI, full RTL.
4. **Storage:** on device (IndexedDB) + Export/Import backup file. No account, no server.
5. **Set order:** always straight sets — all sets of one exercise, then the next.
6. **Routines:** paste a note → app parses it → user fixes the result; routines also editable in-app (add / reorder / delete exercises).
7. **Timer:** workout clock only (elapsed time). No rest timer.
8. **Hosting:** public GitHub repo, GitHub Pages, auto-deploy on push to `main`.
9. **Timeline entry:** routine, day + date, duration, sets done, plus a line of what improved (↑) and new bests (★). Tap → full workout.
10. **Tabs:** ציר זמן (home, with "התחל אימון") · אימונים (routines; settings/backup inside) · תרגילים (exercise list with history).
11. **Name:** אימונים. Repo: `workout-log`.
12. **סיכום note (added 2026-10-26):** optional free-text note per workout. Tapping "סיום" opens a "סיכום האימון" sheet with a text box (may be left empty) and "שמירה"; the note can also be added/edited later from the workout's detail page. The timeline card shows its first line (truncated with …) under the changes line; the detail page shows the full text.

13. **One workout at a time (added 2026-10-27):** tapping התחל on a routine while a different workout is in progress shows an action sheet "יש אימון בתהליך" with "המשך את <routine>" (opens the workout in progress) and "ביטול". A new one starts only after the old one is finished or deleted.
14. **Prefill after a type change (added 2026-10-27):** if the last session of an exercise used a different target type (reps vs time) than the routine now has, prefill from the routine's target with no weight, not from that session.

15. **Design pass (added 2026-10-27):** Impeccable (Operate mode) + Apple HIG; HIG wins on conflicts. Native iOS structure with the icon's orange as tint (system orange `#FF9500` / dark `#FF9F0A`), ✓ stays iOS green, SF system font, light/dark follow the phone.
16. **Live workout UX (added 2026-10-27):** ticking the last set of an exercise auto-advances to the next after ~0.6 s (active workouts only, not on the last exercise); weight/reps have −/+ steppers (weight ±2.5 kg, reps ±1, time ±1 min or ±15 s) and the number can still be tapped to type; a "פעם קודמת" line shows the previous session's completed sets; a progress bar shows done sets / total sets (skipped exercises excluded).
17. **Timeline + exercises (added 2026-10-27):** week headers show "N אימונים · M סטים"; exercise history pages show a small SVG line of the heaviest weight per session when there are ≥2 weighted sessions.

## Assumptions (accepted by the user)

1. React + TypeScript + Vite; `vite-plugin-pwa` for offline + Home Screen install.
2. Ionic React forced to iOS mode for native look (large titles, swipe-back, tab bar, action sheets, transitions).
3. IndexedDB via Dexie; request persistent storage. Backup = JSON file via share sheet / Files.
4. Data model: routine → sections (name + set count) → items; an item is one exercise or a pair; target is reps or duration. Exercises are identified by name across routines.
5. Pairs (`A 12 -> B 10`): shown on one screen, alternating within each set, each exercise ticked separately.
6. Prefill: from the last time that exercise was done; first time → reps from routine, empty weight. Weight optional (bodyweight).
7. Units: kg, whatever number is typed.
8. Time items: ticked off with the duration prefilled (editable). No countdown.
9. Progress saved on every tap; closing the app or locking the phone → resume where you left off. Screen kept awake during a workout.
10. Mid-workout: skip an exercise, add/remove a set, discard the workout. Finishing early saves a partial workout.
11. Past workouts can be edited or deleted.
12. ↑ = best set went up in weight or reps vs last time. ★ = heaviest weight ever for that exercise.
13. Timeline grouped by week (השבוע, שבוע שעבר, then date ranges). Weeks start on Sunday.
14. Dark mode follows the iPhone setting.
15. Note parsing: line ending with `:` with "N סטים" starts a section; `name N` = reps; `N דקות`/`N שניות` = time; `->` makes a pair; ambiguous lines are fixed on the review screen.
16. Project at `~/Projects/workout-log`; tests in `test/` with Vitest + Testing Library; GitHub Action deploys to Pages.
17. User runs `gh auth login`; no commits/pushes without being asked.
18. Limits: no vibration (unsupported on iOS web); designed for iPhone only.
