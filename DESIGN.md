---
name: אימונים
description: A Hebrew iPhone workout log read like a highway sign: heavy Heebo on outlined graphite plates over asphalt charcoal, one accent plate for the thing that matters.
colors:
  accent-teal: "#00aba9"
  accent-orange: "#ff9f0a"
  accent-blue: "#409cff"
  accent-indigo: "#8a88ff"
  accent-purple: "#da8fff"
  accent-pink: "#ff73c0"
  accent-ink: "#0b0d0e"
  done-green: "#30d158"
  delete-coral: "#ff6961"
  asphalt-ground: "#14171a"
  plate-graphite: "#1f2428"
  keyline-quiet: "#3a4147"
  sign-white: "#f4f5f5"
  label-secondary: "#a9b1b7"
  label-tertiary: "#6b747b"
  drill-red: "#ff453a"
  drill-orange: "#ff9f0a"
  drill-yellow: "#ffd60a"
  drill-green: "#30d158"
  drill-teal: "#40c8e0"
  drill-blue: "#0a84ff"
  drill-purple: "#bf5af2"
  drill-pink: "#ff375f"
typography:
  numeral:
    fontFamily: "Heebo Variable, -apple-system, SF Pro Text, Arial Hebrew, sans-serif"
    fontSize: "64px"
    fontWeight: 900
    lineHeight: "60px"
    letterSpacing: "-0.02em"
    fontFeature: "tnum"
  display:
    fontFamily: "Heebo Variable, -apple-system, SF Pro Text, Arial Hebrew, sans-serif"
    fontSize: "36px"
    fontWeight: 900
    lineHeight: "44px"
  title:
    fontFamily: "Heebo Variable, -apple-system, SF Pro Text, Arial Hebrew, sans-serif"
    fontSize: "34px"
    fontWeight: 900
    lineHeight: 1.2
  figure:
    fontFamily: "Heebo Variable, -apple-system, SF Pro Text, Arial Hebrew, sans-serif"
    fontSize: "30px"
    fontWeight: 900
    lineHeight: "34px"
    fontFeature: "tnum"
  name:
    fontFamily: "Heebo Variable, -apple-system, SF Pro Text, Arial Hebrew, sans-serif"
    fontSize: "24px"
    fontWeight: 900
    lineHeight: 1.25
  heading:
    fontFamily: "Heebo Variable, -apple-system, SF Pro Text, Arial Hebrew, sans-serif"
    fontSize: "22px"
    fontWeight: 900
    lineHeight: 1.25
  row:
    fontFamily: "Heebo Variable, -apple-system, SF Pro Text, Arial Hebrew, sans-serif"
    fontSize: "18px"
    fontWeight: 700
  body:
    fontFamily: "Heebo Variable, -apple-system, SF Pro Text, Arial Hebrew, sans-serif"
    fontSize: "17px"
    fontWeight: 500
  note:
    fontFamily: "Heebo Variable, -apple-system, SF Pro Text, Arial Hebrew, sans-serif"
    fontSize: "15px"
    fontWeight: 500
    lineHeight: "20px"
  meta:
    fontFamily: "Heebo Variable, -apple-system, SF Pro Text, Arial Hebrew, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: "20px"
  caption:
    fontFamily: "Heebo Variable, -apple-system, SF Pro Text, Arial Hebrew, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: "16px"
rounded:
  segment: "9px"
  control: "12px"
  plate: "14px"
  pill: "999px"
spacing:
  gap: "12px"
  gutter: "16px"
components:
  plate:
    backgroundColor: "{colors.plate-graphite}"
    textColor: "{colors.sign-white}"
    rounded: "{rounded.plate}"
    padding: "14px"
  plate-strong:
    backgroundColor: "{colors.plate-graphite}"
    textColor: "{colors.sign-white}"
    rounded: "{rounded.plate}"
    padding: "14px"
  plate-accent:
    backgroundColor: "{colors.accent-teal}"
    textColor: "{colors.accent-ink}"
    rounded: "{rounded.plate}"
    padding: "14px 16px 12px"
  bar-button:
    backgroundColor: "{colors.accent-teal}"
    textColor: "{colors.accent-ink}"
    typography: "{typography.row}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "48px"
    width: "100%"
  step-button:
    textColor: "{colors.accent-ink}"
    rounded: "{rounded.control}"
    size: "48px"
  check-bar:
    backgroundColor: "{colors.accent-ink}"
    textColor: "{colors.accent-teal}"
    rounded: "{rounded.control}"
    height: "64px"
    width: "100%"
  check-bar-done:
    backgroundColor: "{colors.accent-ink}"
    textColor: "{colors.done-green}"
    rounded: "{rounded.control}"
    height: "64px"
  pill:
    backgroundColor: "{colors.keyline-quiet}"
    textColor: "{colors.sign-white}"
    typography: "{typography.meta}"
    rounded: "{rounded.pill}"
    padding: "0 10px"
    height: "26px"
  rest-pill:
    backgroundColor: "{colors.accent-ink}"
    textColor: "{colors.accent-teal}"
    rounded: "{rounded.pill}"
    padding: "0 10px"
    height: "26px"
  set-row:
    backgroundColor: "{colors.plate-graphite}"
    textColor: "{colors.label-secondary}"
    typography: "{typography.heading}"
    rounded: "{rounded.plate}"
    height: "48px"
  searchbar:
    backgroundColor: "{colors.plate-graphite}"
    textColor: "{colors.sign-white}"
    rounded: "{rounded.control}"
    height: "44px"
  tab-bar:
    backgroundColor: "{colors.plate-graphite}"
    textColor: "{colors.label-secondary}"
  tab-bar-selected:
    textColor: "{colors.accent-teal}"
---

# Design System: אימונים

## Overview

**Creative North Star: "Road Signs"**

The app reads like Israeli highway signage seen from a moving car: heavy Hebrew type on outlined plates, over asphalt grey, legible in one glance from arm's length. The owner uses it mid-set on an iPhone SE, one-handed, between sets; every screen is drawn at 375×647 first and judged on the phone. The sign world lends type, palette, density and one signature move, the keyline plate. Navigation, sheets, swipe-back and the tab bar stay iOS-standard (Ionic forced to iOS mode).

Density is low and deliberate. Each record, set, routine or session is its own plate; the one thing that matters on a plate gets the owner's accent as a fill, with near-black ink text and an ink ring just inside the edge. Real buttons sit under the thumb in the lower half: outlined 48px steppers and full-width bars, never bare glyphs. The world rejects the dark card holding a set table, thin poster numerals, and flat colour tiles (the replaced "Type tiles" look).

**Key Characteristics:**
- Always dark: charcoal ground, graphite plates, 2px keylines, 14px corners.
- Heebo at 500, 700 and 900 only; numbers are heavy and units quiet.
- One accent fill per plate, picked by the owner from six; ink text on it.
- Controls are large and outlined or filled, never bare glyphs.
- iOS behaviour, the app's own look.

## Colors

A near-neutral asphalt palette with one owner-chosen signal colour and two fixed semantic colours.

### Primary
- **Owner's Accent** (`accent-teal` by default; `accent-orange`, `accent-blue`, `accent-indigo`, `accent-purple`, `accent-pink`): set at runtime on `--app-accent` from Settings and mapped onto Ionic's primary. It fills the current set, a "התחל" bar, a gym day in the week strip, the chosen body-area cell, the active pair segment and the record's history bar; it tints text buttons, toolbar actions, the selected tab, body-area icons and ★. Every accent passes 4.5:1 as text on the ground and on a plate, and under ink text.
- **Accent Ink** (`accent-ink`): the text, icons, ring and ✓ bar on any accent fill. Never white on the accent.

### Secondary
- **Done Green** (`done-green`): a ticked ✓ (filled circle in rows, green ✓ on the ink bar), an ended rest (pill and ⏱), the ↑ improvement badge. iOS's own green, kept for meaning.
- **Delete Coral** (`delete-coral`): destructive actions and error text only (delete rows, destructive alert buttons, warning footers).

### Tertiary
- **Drill Colours** (`drill-red` … `drill-pink`): the owner's label for a daily routine (its bar, its dots on the month calendar, the picker). They never appear outside יומי and its editor.

### Neutral
- **Asphalt Ground** (`asphalt-ground`): page, toolbar, sheet and theme-color background; it runs under the status bar clock (`black-translucent`).
- **Plate Graphite** (`plate-graphite`): every plate, inset list, alert, action sheet, toast, popover, searchbar and the tab bar.
- **Quiet Keyline** (`keyline-quiet`): the 2px outline of ordinary plates, 1px rules inside an inset list, the pill fill, toggle track, progress track.
- **Sign White** (`sign-white`): primary text, and the strong keyline on the one plate that matters without being the action (next exercise, activity day, today, the record session, focus outline).
- **Secondary Label** (`label-secondary`): every secondary text at every size: units, tips, meta lines, list headers, waiting set values.
- **Tertiary Label** (`label-tertiary`): disabled and future things only (disabled steppers and "התחל", future days, no-area icon, sheet handle, non-record history bars).

### Named Rules
**The One Fill Per Plate Rule.** A plate carries at most one accent fill: the thing to act on now. A screen may hold several accent plates (one per routine, one per gym day), never two fills inside one plate.

**The Ink On Accent Rule.** Anything on an accent fill is `accent-ink`, and the fill is framed by an ink ring 4px inside its edge, 2px wide (`--accent-ring`). This is what keeps all six accents legible.

**The Semantic Colours Stay Put Rule.** Done is green, delete is coral, drill colours label daily routines. The accent never stands in for done, and green never stands in for the accent.

## Typography

**Display Font:** Heebo Variable (bundled; falls back to -apple-system, SF Pro Text, Arial Hebrew)
**Body Font:** Heebo Variable

**Character:** One family carrying everything, by weight: road-sign heavy for anything read at a glance, medium for running text. Numbers are tabular everywhere.

### Hierarchy
- **Numeral** (900, 64px, 60px line, -0.02em): weight and reps on the current set. Steps down by length so 122.5 fits beside its unit: 60px at four characters, 48px at five, 40px at six.
- **Display** (900, 36px, 44px line, up to two lines): the exercise name on the live screen; a long name drops to 28px on up to three lines, a pair's name to 24px.
- **Title** (900, 34px): iOS large page titles.
- **Figure** (900, 30px): the best set on a history session.
- **Name** (900, 24px): routine names on their plates.
- **Heading** (22px; 900 for section and week titles, 700 for set values in rows): week, part and month titles, done/waiting set values, rest time left.
- **Row** (18px; 700 or 900): bar-button labels, list row names, part counts.
- **Body** (500, 17px): running text, field rows; 900 for the active pair segment and alert titles.
- **Note / Meta / Caption** (500 or 700, 15 / 14 / 13px): units, tips, set titles, meta lines, rail cells.

### Named Rules
**The Three Weights Rule.** Weights are 500, 700 and 900 only, always through `--app-weight-text`, `--app-weight-strong`, `--app-weight-heavy`. Nothing thinner than 500 exists.

**The Heavy Floor Rule.** 900 is used only from 17px up. Below that, emphasis is 700.

**The Quiet Unit Rule.** Next to a heavy number, its unit and × are smaller (15px), 500, and secondary ("70 × 8" reads as two numbers). On the accent plate the unit stays ink, at 15px 700.

## Layout

A single column with 16px gutters and 12px between plates, both as tokens (`gap`, `gutter`). Screens are designed at 375×647 (the SE's Home Screen viewport under the status bar) and judged there; taller phones get more air, and there are no short-screen special cases (`max-height` queries are banned by test). Pages start below the clock; the ground runs under it.

Lists take one of two forms: separate plates 12px apart (each record, set, routine or session its own plate), or one inset plate whose rows are split by 1px quiet rules (settings, notes, pickers). Rows are at least 48px tall; tap areas are at least 44pt.

On the live screen, actions sit in the lower half under the thumb: the current-set plate with its steppers and ✓ bar, then text actions, then a footer of the next-exercise plate beside the "כל התרגילים" button. תרגילים splits into a 64px leading rail of area cells and the exercise list beside it.

## Elevation & Depth

Flat. Depth comes from tone (ground, then plate) and from keylines, never from drop shadows. Sheets, alerts, action sheets, toasts and popovers have their shadows and blur removed and take the plate fill with a 2px keyline. The only box-shadows in the system are inset or outset rings drawn with solid colour.

### Shadow Vocabulary
- **Accent ring** (`box-shadow: inset 0 0 0 4px <accent>, inset 0 0 0 6px <ink>`): inside every accent fill (accent plate, bar button, chosen body area). The week strip's gym day uses a tighter 2px/4px version.
- **Today ring** (`box-shadow: 0 0 0 2px <ground>, 0 0 0 4px <sign-white>`): a second ring outside today's cell in the week strip.

### Named Rules
**The Keyline Not Shadow Rule.** Separation is a 2px keyline or the ground showing between plates. No drop shadow, glow or backdrop blur.

## Shapes

Rounded rectangles with firm, even corners: 14px for plates (and sheets, alerts, toasts), 12px for controls inside them (bar buttons, steppers, the ✓ bar, searchbar, segments, day cells), 9px for segments inside a control, and full capsules for pills. Strokes are 2px (`--app-stroke`) everywhere a shape is outlined; 1px (`--app-rule`) only for rules between rows. Status marks are circles: the 28px ✓ ring in rows, filled green when done.

## Components

### Buttons
Real, chunky, under the thumb.
- **Bar button:** full width, 48px tall, accent fill with the accent ring, ink label at 18px 900, 12px corners. The primary action of its plate ("התחל", start workout). Pressed: 0.6 opacity; disabled: 0.4 opacity (or, for "התחל", a graphite plate with a keyline and tertiary label).
- **Step button:** 48×48 outlined square, 2px stroke in the current colour, 12px corners, ionicon − or + at 20px. − comes before + in reading order; 12px apart. Disabled: tertiary colour (0.4 opacity on an accent plate).
- **Text buttons:** iOS clear buttons in the accent, 700; destructive in coral.
- **Focus:** a 2px sign-white outline 2px outside (ink on an accent plate).

### Chips (pills)
- **Style:** 26px capsule, quiet keyline fill, white 14px 700 text.
- **Rest pill:** on the current set, ink fill with accent text and a timer icon ("מנוחה 1:12"); turns green when the rest ends.

### Cards / Containers (plates)
- **Corner Style:** 14px.
- **Background:** plate graphite.
- **Border:** 2px quiet keyline; sign-white for the one plate that matters (next exercise, activity day, record session).
- **Accent plate:** accent fill, ink text, accent ring, no keyline. The current set is this plate.
- **Internal Padding:** 14px (16px inline on the current set).
- **Pressed:** 0.6 opacity on tappable plates.

### Inputs / Fields
- **Searchbar:** plate fill, 2px quiet keyline, 12px corners, 44px tall; keyline turns sign-white on focus.
- **Inputs:** placeholder in secondary label at 500; accent caret and focus highlight. The current-set numerals are inputs styled as 64px heavy ink numbers.
- **Segments and toggles:** segment on the ground with the accent indicator and ink text when checked; toggle with a keyline track that fills with the accent.

### Navigation
- iOS nav bars on the ground, no border; large titles at 34px 900. Icon-only toolbar buttons in white, text actions in the accent.
- Tab bar on plate graphite with a 2px keyline top, 11px labels: secondary at 500, selected in the accent at 700. Hidden on the live workout.
- Swipe-back, sheets and action sheets are iOS-standard, restyled as plates.

### Current Set (signature)
The accent plate in the lower half of the live screen: title "סט 2 מתוך 3" and the rest pill on top; weight and reps as heavy numerals with quiet units; an outlined − and + under each; a full-width 64px ink ✓ bar at its foot (accent ✓, green once done). Done and waiting sets are graphite plates above and below with their values at 22px and a tappable 28px ✓ ring. A pair adds an ink two-part switch on top: the active part is accent with ink 17px 900 text, the other shows its name and values in white.

### Next Exercise Plate
A sign-white keyline plate above the home bar: "הבא:" in secondary 14px, the name at 20px 900, and an arrow; beside it the "כל התרגילים" button. On the last exercise only the list button shows.

## Do's and Don'ts

### Do:
- **Do** use the tokens in `src/theme.css`; hex values live there only (enforced by test).
- **Do** set weights through the three weight tokens, and use 900 only from 17px up.
- **Do** give each plate at most one accent fill, with ink text and the accent ring.
- **Do** make every control at least 48px (44pt minimum tap area), and give −/+ outlined buttons, not bare glyphs.
- **Do** set units and × as quiet units beside heavy numbers.
- **Do** draw and check every screen at 375×647 first.
- **Do** mark the one plate that matters without acting with the sign-white keyline.

### Don't:
- **Don't** use weights below 500, or any numeric `font-weight` in feature CSS.
- **Don't** put white text on an accent fill, or use the accent for done or delete.
- **Don't** use drop shadows, glows or backdrop blur; depth is keyline and tone.
- **Don't** add a `max-height` media query or shrink anything for short screens.
- **Don't** use drill colours outside daily routines.
- **Don't** use the tertiary label for readable text; it is for disabled and future things.
- **Don't** build a light mode; the app is always dark.
