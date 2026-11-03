# אימונים — Workout Log PWA Design

Replaces Apple Notes workout notes. iPhone-only PWA that looks and feels native.

## Decisions (from grilling, 2026-10-26)

1. **Core flow:** live session + history. Open a routine, go through it live checking off sets; each finished workout lands on a timeline feed. Tap an exercise to see its history.
2. **Per set:** weight + reps, prefilled from last time; usually just tap ✓. Items are either reps-based or time-based (`15 דקות`, `30 שניות`).
3. **Language:** Hebrew UI, full RTL.
4. **Storage:** on device (IndexedDB) + Export/Import backup file. No account, no server.
5. **Set order:** always straight sets — all sets of one exercise, then the next.
6. **Routines:** paste a note → app parses it → user fixes the result; routines also editable in-app (add / reorder / delete exercises).
7. **Timer:** workout clock (elapsed time), plus a rest timer that stays out of sight (item 43, updated 2026-11-03).
8. **Hosting:** public GitHub repo, GitHub Pages, auto-deploy on push to `main`.
9. **Timeline entry:** routine, day + date, duration, sets done, plus a line of what improved (↑) and new bests (★). Tap → full workout. Other activities show name, day and duration only (item 40).
10. **Tabs:** ציר זמן (home, with "התחל אימון") · אימונים (routines; settings/backup inside) · תרגילים (exercise list with history).
11. **Name:** אימונים. Repo: `workout-log`.
12. **סיכום note (added 2026-10-26):** optional free-text note per workout. Tapping "סיום" opens a "סיכום האימון" sheet with a text box (may be left empty) and "שמירה"; the note can also be added/edited later from the workout's detail page. The timeline card shows its first line (truncated with …) under the changes line; the detail page shows the full text.

13. **One workout at a time (added 2026-10-27):** tapping התחל on a routine while a different workout is in progress shows an action sheet "יש אימון בתהליך" with "המשך את <routine>" (opens the workout in progress) and "ביטול". A new one starts only after the old one is finished or deleted.
14. **Prefill after a type change (added 2026-10-27):** if the last session of an exercise used a different target type (reps vs time) than the routine now has, prefill from the routine's target with no weight, not from that session.

15. **Design pass (added 2026-10-27):** Impeccable (Operate mode) + Apple HIG; HIG wins on conflicts. Native iOS structure with the icon's orange as tint (system orange `#FF9500` / dark `#FF9F0A`), ✓ stays iOS green, SF system font, light/dark follow the phone.
16. **Live workout UX (added 2026-10-27, updated 2026-11-03):** ticking the last set of an exercise auto-advances to the next right away (active workouts only, not on the last exercise); weight/reps have −/+ steppers (weight ±1 kg, reps ±1, time ±1 min or ±15 s) and the number can still be tapped to type; the previous session's sets are not shown, since they prefill the sets; a progress bar shows done sets / total sets (skipped exercises excluded).
17. **Timeline + exercises (added 2026-10-27):** week headers show "N אימונים · M סטים" (other activities count as workouts, item 40); exercise history pages show a small SVG line of the heaviest weight per session when there are ≥2 weighted sessions.

18. **Post-launch feedback (added 2026-10-28):** decided after the first real session. One branch for all items. Connecting Claude to GitHub is out for now.
19. **Starting weight (added 2026-10-28):** a routine exercise may have a starting weight. It prefills only while the exercise has no history; after that, the last session's weights prefill as before. It is shown in the routine row ("10 חזרות · 20 ק״ג").
20. **Sets per exercise (added 2026-10-28):** an exercise (or pair) may override its section's set count. The override is stored only when it differs from the section, and the row shows "· N סטים".
21. **Tips and exercise notes (added 2026-10-28, updated 2026-11-03):** two kinds of note.
    - A tip (דגשים) on the routine exercise is copied into the workout and always shown under the exercise name.
    - A note ("הערה") belongs to the exercise and carries over from workout to workout until you change or clear it. Each workout copies it from the latest finished workout that has the exercise, even one where it was skipped. (The sets still prefill from the last session with ticked sets.) Renaming an exercise in a workout's "עריכה" gives it the new name's note when that name has one, and otherwise keeps the note it had.
    - Notes written before this change were for the next time only and were not copied into later workouts. Updating the app (database version 8) and importing a backup made before it (backup version 1) copy each exercise's latest note forward into its later workouts, so it carries on from there. Backups now say version 2, and their notes are left as they are.
    - It is shown in a row of its own under the sets (✎, the note, ›; "<name>: …" for each exercise of a pair that has one), during the workout and when editing a finished one. With no note, the row reads "הוספת הערה". Tapping it opens "הערה לתרגיל", a sheet with a large text box (updated 2026-11-03).
22. **Duplicate routine (added 2026-10-28):** a "שכפול" swipe action creates "<name> (עותק)" with fresh ids and opens it in the editor.
23. **Past workouts (added 2026-10-28):**
    - "+" on the timeline, then "אימון קודם" (item 40), opens the past workout form. You choose the routine, date, start time (in the past, on a 24-hour wheel) and duration.
    - The duration is at most 3 hours (the time limit in item 27), and the workout must end by now. Otherwise saving is disabled and a message explains why.
    - The workout is created finished, with sets prefilled from sessions before that date, and opens in edit mode.
24. **Start button (added 2026-10-28):** "התחל אימון", and the "אימון בתהליך" banner during a workout, are pinned at the bottom of the timeline, above the tab bar.
25. **Weight fill-down (added 2026-10-28):** entering a weight on set N also sets it on later unticked sets of that exercise whose weight is empty or still equals set N's previous weight. Weight only.
26. **Auto-advance (added 2026-10-28):** after the last set of an exercise, the workout moves to the next exercise that is neither skipped nor done. If there is none, it stays.
27. **Limits (added 2026-10-28):** weight ≤ 500 kg, reps ≤ 100 (whole), time ≤ 3 h. Typed values are clamped on commit, and "+" is disabled at the max. This applies in the workout and in the routine editor.
28. **Gestures and motion in a workout (added 2026-10-28):**
    - A horizontal swipe on the exercise moves between exercises; skipped ones stay reachable. In RTL, dragging rightward goes to the next exercise. A swipe that starts on a set row swipes that row instead (item 44, updated 2026-11-03).
    - A swipe that starts within 50 px of the swipe-back edge is left to the app's swipe-back (updated 2026-10-29).
    - Swiping up on the footer opens the exercise list.
    - Changing exercise slides the new card in from the direction of travel. There is no motion under reduce-motion.
29. **Summary mid-workout (added 2026-10-28):** "הוספה לסיכום" in the exercise menu (⋯) edits the workout's summary without finishing. It is the only action left in the menu (item 44, updated 2026-11-03).
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
    - After a workout started from אימונים is finished or deleted, the אימונים tab shows its list again instead of the workout's old screen. "סיום" while editing a finished workout goes back, or to the workout's page when there is nothing to go back to, e.g. after a reload (updated 2026-11-03).
    - Taps are ignored while a page transition is still animating, as in UIKit, but never for more than 1 s per transition (updated 2026-10-29).
    - Swipe-back is the app's own gesture, so the real previous page follows the finger. iOS's built-in edge swipe is blocked for touches that start within 20 px of either edge, except on tap targets (buttons, rows, controls, an overlay's backdrop). Both ran together on a Hebrew iPhone, and iOS's alone flashed the old page. A vertical scroll that starts in that 20 px strip does not scroll (updated 2026-10-29).
35. **Version (added 2026-10-29):** the bottom of Settings shows the version and when it was built ("גרסה 1.2.0 · עודכן 29.10.2026 14:05"), so a test can confirm the phone has the latest deploy. Bug reports include both. The version goes up with every release. Tapping the version line opens "מה חדש" with every release (updated 2026-10-30).
36. **Routine order (added 2026-10-29):** each routine has a creation date, set when it is created, duplicated, imported or saved as new from a workout, and never changed by editing. Routines are listed newest first everywhere, and the row shows "נוצר 29.10" (with the year when it is not the current one). Routines from before this change take their last-edited date.
37. **Settings from the timeline (added 2026-10-29):** ⚙️ also sits on ציר זמן, before "+". Settings opens inside the tab it came from, and back returns there.
38. **Updates (added 2026-10-30):**
    - The app checks for a new version when it opens, when it comes back from the background, and every hour while open. It skips the check while offline.
    - A downloaded version waits. A "גרסה חדשה זמינה · עדכון" bar sits above the tab bar, never inside a workout. "עדכון" reloads into the new version. × hides the bar until the app comes back from the background. An ignored update applies the next time the app is fully closed and reopened.
    - After an update, "מה חדש" opens once with every release since the last one this phone saw: "חדש" and "תיקונים" for each. With no release seen before, it shows only the current one. It waits until you leave a workout. The last seen version is kept on the phone and is not in the backup.
39. **Picking an existing exercise (added 2026-10-30):**
    - "הוספת תרגיל", in a workout's "עריכה" and in the routine editor, opens a list with a search box.
    - "+ תרגיל חדש" comes first and works as before: it adds "תרגיל חדש" and opens the editor.
    - Then come the names from routines and finished workouts, without "תרגיל חדש". Exercises you've done come first, most recent first, with their last date. Exercises only in routines follow, A–Z. Search matches part of a name.
    - Picking one adds it to that section right away, without the editor. It brings the target and tip from the last finished workout that has it, otherwise from the most recently edited routine. Weight is not copied: in a workout it prefills from history, as for any exercise.
    - Exercises already in the workout or routine stay in the list. A pair's second exercise is still named in the editor.
40. **Other activities (added 2026-10-31):**
    - "+" on the timeline opens a sheet: "אימון קודם" (item 23) or "פעילות אחרת", for training outside the gym (Thai boxing, machine Pilates, a class).
    - An activity is logged once, after the fact: name, date, start time and duration, with the same time rules as item 23. Saving needs a name. There is no schedule or recurring class.
    - The name is free text. Names of earlier activities, most recent first, appear under it as quick picks, filtered by what is typed.
    - Saving closes the form and stays on the timeline.
    - Its card shows the name, day and "N דק׳" with no sets and no ↑/★. It counts as a workout in the week header and adds no sets.
    - Its detail page shows the overview, "סיכום" and delete. "עריכה" reopens the same form, filled in.
    - Activities never open the live workout and never appear in the exercises tab or in prefills. Backups and the history export include them.
41. **Activity location (added 2026-11-03):**
    - The activity form has an optional free-text "מיקום" under the name. Saving still needs only a name.
    - The location is remembered per activity name. When the name matches an earlier activity, tapped from the quick picks or typed in full, the location fills in from the newest one of that name that has a location. Activities left without one are skipped.
    - A location you typed stays when the name changes. "עריכה" opens with the saved location, and changing the name there keeps it.
    - The card, the detail overview and the history export show it after the minutes ("60 דק׳ · פארק הירקון"). Without a location they look as before.
    - Activities logged before this, on the phone or in a backup file, have no location.
42. **Daily routines (added 2026-11-02, moved to their own tab 2026-11-03):** short drills done every day (posture, mobility), not a gym workout.
    - A fourth tab, "יומי", sits second in the tab bar (ציר זמן · יומי · אימונים · תרגילים). "+" there creates an empty daily routine and opens it in the editor, under the tab. With none, the tab explains what it is for and points at "+".
    - "אימון יומי" is a switch in the routine editor and moves a routine between אימונים (gym routines only) and יומי. A daily routine is never started live: it is left out of "התחל אימון" and "אימון קודם". It needs no exercises.
    - Each daily routine has a card, newest first: its name, its drills ("גשר ישבן 15 · פלאנק 30 שנ׳") and a ✓ (the same check as a set row in a workout) that logs today; a second tap removes it at once. Tapping the rest of the card opens the editor.
    - Below the cards, a month calendar (Sunday first) shows the days done for one routine. With two or more, a scrollable segmented control above it picks which, starting with the newest. Tapping a past day logs or removes it; days after today are disabled, and today is ringed. ‹ › move between months, back without limit and forward up to the current month. There is no streak or count.
    - The timeline shows gym workouts only.
    - A log only records the routine and the day. Logs are not workouts: they never count in the week header, never get ↑/★, never prefill, and never appear in the exercises tab, which also leaves out a daily routine's exercises. The "הוספת תרגיל" picker still offers them, so a drill can be added to a gym routine. The history export leaves them out. Logs of a deleted or no longer daily routine are kept but not shown.
    - Backups include the logs; older backups import with none, and a restore replaces them.
43. **Rest timer (added 2026-11-03):**
    - Ticking a set in a running workout starts a rest, and ticking the next set restarts it. Un-ticking leaves it running. The tick that finishes the whole workout starts none and stops one that is running. Editing a finished workout never starts one.
    - It stays out of sight: a ⏱ next to ⋯ is the only sign. Tapping ⏱ shows the time left with −/+ for 5 s, or until tapped again.
    - −/+ change the rest by 15 s, including the running one; − is disabled at 15 s. The length is kept on the phone for every workout, starts at 60 s and is not in the backup. The timer itself has no off switch.
    - When the rest ends, a short sound plays and ⏱ turns green until the next tick. The sound is a short notification sound that plays over music from other apps instead of pausing it. It plays only while the app is open (iOS web apps can't vibrate or play in the background), and not when you come back to the app after the rest already ended. The rest is not saved: leaving the workout or reloading drops it.
    - A 🔊/🔇 button next to −/+ turns the sound off or on. The choice is kept on the phone like the length; ⏱ still turns green with the sound off.
44. **Exercise actions (added 2026-11-03):** "דלג" (or "בטל דילוג") and "הוספת סט" are buttons under the note row. Swiping a set row, as in the routines list, shows "שכפול", which adds an unticked copy right after it, and "מחיקה", which deletes it (a full swipe deletes). In a pair, both act on that exercise's set only. "מחיקה" is not offered on an exercise's only set and asks first when the set is ticked. ⋯ keeps only "הוספה לסיכום".
45. **Back to the current exercise (added 2026-11-03):** the current exercise is the first one that is neither skipped nor done (where the workout resumes). When you move off it, a "חזרה לתרגיל הנוכחי" pill above the footer takes you back. It is hidden once everything is done and when editing a finished workout.
46. **Feedback form (added 2026-11-03):** "דיווח על באג / הצעה" comes right after the backup section in Settings and opens on "הצעה". The version line stays at the bottom (item 35).
47. **Exercise header (added 2026-11-03):** the line above the exercise name shows the section and position together ("עיקרי · 3 מתוך 8"), then the name and its tips.

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
