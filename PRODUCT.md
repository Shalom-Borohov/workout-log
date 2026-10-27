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
- Hebrew UI, full RTL. Terms: אימון (routine and workout), חלק (section), סט, חזרות, ציר זמן, תרגילים, סיכום.
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
3. Progress at a glance.
4. The phone owns the data: nothing leaves the device unless the owner exports it.

## Accessibility & Inclusion

Touch targets of at least 44pt and readable numbers for use mid-set; follows the system light/dark setting.
