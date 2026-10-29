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

18. **Post-launch feedback (added 2026-10-28):** decided after the first real session. One branch for all items. Connecting Claude to GitHub is out for now.
19. **Starting weight (added 2026-10-28):** a routine exercise may have a starting weight. It prefills only while the exercise has no history; after that, the last session's weights prefill as before. It is shown in the routine row ("10 חזרות · 20 ק״ג").
20. **Sets per exercise (added 2026-10-28):** an exercise (or pair) may override its section's set count. The override is stored only when it differs from the section, and the row shows "· N סטים".
21. **Tips and next-time notes (added 2026-10-28):** two kinds of note.
    - A tip (דגשים) on the routine exercise is copied into the workout and always shown under the exercise name.
    - A "הערה לפעם הבאה", written from the exercise menu, is shown in the next session of that exercise under its "פעם קודמת" line (the same session the sets come from).
22. **Duplicate routine (added 2026-10-28):** a "שכפול" swipe action creates "<name> (עותק)" with fresh ids and opens it in the editor.
23. **Past workouts (added 2026-10-28):**
    - "+" on the timeline opens "הוספת אימון קודם". You choose the routine, date, start time (in the past) and duration.
    - The duration is at most 3 hours (the time limit in item 27), and the workout must end by now. Otherwise saving is disabled and a message explains why.
    - The workout is created finished, with sets prefilled from sessions before that date, and opens in edit mode.
24. **Start button (added 2026-10-28):** "התחל אימון", and the "אימון בתהליך" banner during a workout, are pinned at the bottom of the timeline, above the tab bar.
25. **Weight fill-down (added 2026-10-28):** entering a weight on set N also sets it on later unticked sets of that exercise whose weight is empty or still equals set N's previous weight. Weight only.
26. **Auto-advance (added 2026-10-28):** after the last set of an exercise, the workout moves to the next exercise that is neither skipped nor done. If there is none, it stays.
27. **Limits (added 2026-10-28):** weight ≤ 500 kg, reps ≤ 100 (whole), time ≤ 3 h. Typed values are clamped on commit, and "+" is disabled at the max. This applies in the workout and in the routine editor.
28. **Gestures and motion in a workout (added 2026-10-28):**
    - A horizontal swipe on the exercise moves between exercises; skipped ones stay reachable. In RTL, dragging rightward goes to the next exercise.
    - A swipe that starts within 50 px of the swipe-back edge is left to iOS swipe-back, which stays enabled.
    - Swiping up on the footer opens the exercise list.
    - Changing exercise slides the new card in from the direction of travel. There is no motion under reduce-motion.
29. **Summary mid-workout (added 2026-10-28):** "הוספה לסיכום" in the exercise menu edits the workout's summary without finishing.
30. **Overview editing (added 2026-10-28):**
    - In the exercise list, "עריכה" lets you add, remove, reorder and edit exercises of the running workout.
    - "עדכון <routine>" writes the exercises, targets, tips and set counts back to the routine.
    - "שמירה כאימון חדש" saves them as a new routine.
    - Starting weights are kept from the routine, and the workout stays attached to its original routine.
31. **Background photo (added 2026-10-28):** a photo chosen in Settings is shown, dimmed, behind the live-workout screen. It is stored on the phone and not in the backup file.
32. **History export (added 2026-10-28):** "ייצוא היסטוריה" in Settings shares finished workouts as readable text (`.txt`), newest first, in the format of the old notes.
33. **Feedback (added 2026-10-28):** "דיווח על באג / הצעה" in Settings opens a prefilled GitHub issue (labels bug/enhancement) with the device and build date and no workout data. The repo is public, so the issue is too.
34. **Navigation (added 2026-10-28):**
    - The live workout opens under the tab it was started from (`/tabs/timeline/workout/:id` or `/tabs/routines/workout/:id`), with the tab bar hidden, so swiping back reveals the page underneath. Ionic only animates a back step between pages of the same tab (updated 2026-10-29). Old `/workout/:id` and `/tabs/workout/:id` links redirect to the timeline version.
    - Taps are ignored while a page transition is still animating, as in UIKit, but never for more than 1 s per transition (updated 2026-10-29).
    - Swipe-back is iOS's own edge swipe. Ionic's swipe is off because both fired together on a Hebrew iPhone. After iOS's swipe the page switches instantly, with no second slide. Back buttons still slide (updated 2026-10-29).
35. **Version (added 2026-10-29):** the bottom of Settings shows when the running build was made ("גרסה YYYY-MM-DD HH:MM"), so a test can confirm the phone has the latest deploy.

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
