# Product

<!-- impeccable:product-schema 1 -->

## Platform

ios

## Users

One person, the owner, training 3–4 times a week in a gym (warm-ups sometimes at home), phone in hand between sets. Their job: follow the planned routine, log weight × reps quickly, and see whether they are progressing.

## Product Purpose

Replace workout notes kept in Apple Notes with a routine runner and log. Success means logging a set is one tap in the usual case, and progress (↑ improved, ★ new best) is visible on the timeline without digging.

## Positioning

Personal, free and Hebrew-first. Routines are pasted straight from the owner's existing Notes text and parsed. No account; the data stays on the phone.

## Operating Context

Used mid-workout: one hand, sweaty fingers, quick glances between sets, screen kept awake. Also used at home to set up routines and review history. Installed as an iPhone Home Screen web app and works offline.

## Capabilities and Constraints

- PWA built with React and Ionic in iOS mode, hosted on GitHub Pages. No backend; data in IndexedDB on the device, with export/import of a JSON backup file.
- No vibration/haptics or background notifications (iOS web limits).
- Hebrew UI, full RTL. Terms: אימון (routine and workout), חלק (section), סט, חזרות, ציר זמן, תרגילים, סיכום, אזור בגוף (body area an exercise works; not "חלק גוף", which clashes with חלק).
- Straight sets; pairs (supersets) are logged together; each exercise targets reps or time; weights in kg.
- Exercises are identified by exact name across routines and workouts.

## Brand Commitments

- Name: אימונים.
- Icon: white dumbbell on an orange→red gradient (`public/favicon.svg`).
- Must look and feel like a native iPhone app.

## Evidence on Hand

- The owner's real routine note (full body: warm-up 2 sets, main 3 sets, finisher), used as the fixture in `test/unit/parseNote.test.ts`.
- Single-user tool: no testimonials, customers or metrics exist, and none should be invented.

## Product Principles

1. One tap at the gym: the usual action (✓ on a prefilled set) never needs typing.
2. Native, not novel: iOS conventions over custom ones.
   - Wherever iOS uses a swipe, offer it too: swipe actions on list rows, swiping between periods such as months, and swipe-down to close a sheet. A swipe is always a shortcut for a visible control, never the only way. The app's own sideways swipes never start within 20px of either screen edge, and on a page that can swipe back they also leave the 50px at the back edge where that gesture starts.
3. Progress at a glance.
4. The phone owns the data: nothing leaves the device unless the owner exports it.
5. Move on by itself: after the action that finishes something (the last set, a skip), go to the next thing at once. Undo is a swipe back, not a dialog or a toast.
6. Out of sight until it matters: secondary information sits behind one small sign, and the screen shows the current set.
7. Never lose what's running: leaving a page, switching apps, a reload or a locked phone doesn't drop progress or a running timer. It picks up where it left off.
8. Signals are reliable: when the app must tell the owner something, like the end of a rest, it works on any tab and over music, even at a small battery cost. It never relies on sound alone; something visible changes too.
9. Gestures are shortcuts: swipes speed up common actions, and every swipe action can also be reached with a tap (WCAG 2.5.1). Common actions sit on the card, and ⋯ is for rare ones.
10. Calm screens: grouping, colour and icons over more text. A list row is a title and one short line; names, values and free text (סיכום, notes) sit one tap away on the detail page. When a change adds text, first look for text to remove or move. Keep a text label where an icon alone would be ambiguous, and colour is never the only cue (WCAG 1.4.1).

## Accessibility & Inclusion

Touch targets of at least 44pt and readable numbers for use mid-set; follows the system light/dark setting.
