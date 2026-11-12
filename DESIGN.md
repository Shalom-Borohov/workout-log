---
name: אימונים
description: A Hebrew iPhone workout log where the numbers are the interface, set at poster size on flat accent tiles over pure black.
colors:
  accent-teal: "#00aba9"
  accent-orange: "#ff9f0a"
  accent-blue: "#409cff"
  accent-indigo: "#8a88ff"
  accent-purple: "#da8fff"
  accent-pink: "#ff73c0"
  done-green: "#30d158"
  danger-coral: "#ff6961"
  ground-black: "#000000"
  sheet-graphite: "#1c1c1e"
  raised-graphite: "#2c2c2e"
  control-fill: "rgba(118, 118, 128, 0.24)"
  label-white: "#ffffff"
  label-secondary: "#98989d"
  label-dim: "#6e6e73"
  label-tertiary: "rgba(235, 235, 245, 0.3)"
  on-accent-black: "#000000"
  drill-red: "#ff453a"
  drill-orange: "#ff9f0a"
  drill-yellow: "#ffd60a"
  drill-green: "#30d158"
  drill-teal: "#40c8e0"
  drill-blue: "#0a84ff"
  drill-purple: "#bf5af2"
  drill-pink: "#ff375f"
typography:
  poster:
    fontFamily: "Heebo Variable, -apple-system, BlinkMacSystemFont, SF Pro Text, Arial Hebrew, sans-serif"
    fontSize: "132px"
    fontWeight: 200
    lineHeight: 0.9
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Heebo Variable, -apple-system, BlinkMacSystemFont, SF Pro Text, Arial Hebrew, sans-serif"
    fontSize: "56px"
    fontWeight: 200
    lineHeight: 1.05
    letterSpacing: "-0.01em"
  display:
    fontFamily: "Heebo Variable, -apple-system, BlinkMacSystemFont, SF Pro Text, Arial Hebrew, sans-serif"
    fontSize: "46px"
    fontWeight: 200
    lineHeight: 1.04
    letterSpacing: "-0.01em"
  heading:
    fontFamily: "Heebo Variable, -apple-system, BlinkMacSystemFont, SF Pro Text, Arial Hebrew, sans-serif"
    fontSize: "30px"
    fontWeight: 200
    lineHeight: 1.2
  row:
    fontFamily: "Heebo Variable, -apple-system, BlinkMacSystemFont, SF Pro Text, Arial Hebrew, sans-serif"
    fontSize: "22px"
    fontWeight: 300
    lineHeight: 1.3
  body:
    fontFamily: "Heebo Variable, -apple-system, BlinkMacSystemFont, SF Pro Text, Arial Hebrew, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.3
  note:
    fontFamily: "Heebo Variable, -apple-system, BlinkMacSystemFont, SF Pro Text, Arial Hebrew, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: "20px"
  caption:
    fontFamily: "Heebo Variable, -apple-system, BlinkMacSystemFont, SF Pro Text, Arial Hebrew, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: "18px"
rounded:
  control: "12px"
  panel: "16px"
  tile: "24px"
  full: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  gutter: "16px"
  section: "32px"
components:
  tile-accent:
    backgroundColor: "{colors.accent-teal}"
    textColor: "{colors.on-accent-black}"
    rounded: "{rounded.tile}"
    padding: "16px 8px 12px"
  tile-quiet:
    backgroundColor: "{colors.sheet-graphite}"
    textColor: "{colors.label-white}"
    rounded: "{rounded.tile}"
    padding: "16px 8px"
  check-primary:
    backgroundColor: "{colors.on-accent-black}"
    textColor: "{colors.accent-teal}"
    rounded: "{rounded.full}"
    size: "72px"
  check-primary-done:
    backgroundColor: "{colors.on-accent-black}"
    textColor: "{colors.done-green}"
    rounded: "{rounded.full}"
    size: "72px"
  check-row:
    textColor: "{colors.label-secondary}"
    size: "48px"
  check-row-done:
    textColor: "{colors.done-green}"
    size: "48px"
  text-action:
    textColor: "{colors.accent-teal}"
    typography: "{typography.body}"
    height: "48px"
    padding: "0 12px"
  area-tile:
    backgroundColor: "{colors.sheet-graphite}"
    textColor: "{colors.label-white}"
    rounded: "{rounded.panel}"
    padding: "10px 12px 8px"
    height: "92px"
  area-tile-selected:
    backgroundColor: "{colors.accent-teal}"
    textColor: "{colors.on-accent-black}"
    rounded: "{rounded.panel}"
  day-tile-gym:
    backgroundColor: "{colors.accent-teal}"
    textColor: "{colors.on-accent-black}"
    rounded: "{rounded.control}"
    height: "58px"
  day-tile-activity:
    backgroundColor: "{colors.raised-graphite}"
    textColor: "{colors.label-white}"
    rounded: "{rounded.control}"
    height: "58px"
  pill-back:
    backgroundColor: "{colors.sheet-graphite}"
    textColor: "{colors.accent-teal}"
    rounded: "{rounded.full}"
    padding: "10px 20px"
    height: "44px"
  stepper:
    backgroundColor: "{colors.control-fill}"
    textColor: "{colors.label-white}"
    rounded: "{rounded.control}"
    height: "44px"
  search-field:
    backgroundColor: "{colors.sheet-graphite}"
    textColor: "{colors.label-white}"
    rounded: "{rounded.control}"
  list-inset:
    backgroundColor: "{colors.sheet-graphite}"
    textColor: "{colors.label-white}"
    rounded: "{rounded.panel}"
    seam: "2px of the ground between rows"
---

# Design System: אימונים

## Overview

**Creative North Star: "Type Tiles"**

The numbers are the interface. Weight and reps sit at poster size, thin Heebo on one flat tile of the owner's accent colour, over a ground that is pure black on every screen and in every state. Everything else steps back: the done set is one grey text row, the next set is another, actions are bare accent words, and the next exercise's name waits at display size in dim grey, cropped by the screen edge. The world borrows the Metro typographic-tile vocabulary (type as the main material, flat colour fields, no ornament) and rounds the tiles to suit the owner.

Density is low where the owner reads at arm's length and normal where they manage things. Hierarchy comes from size and weight of type, from the black / graphite / raised tonal steps, and from the single accent; never from lines, shadows or bar backgrounds. Navigation, sheets, action sheets, the tab bar and controls stay iOS-standard (Ionic in iOS mode); only the look is the app's own. The interface is Hebrew and right-to-left throughout.

**Key Characteristics:**
- Always dark: a pure black ground, no light mode, no appearance setting.
- Heebo Variable, bundled with the app; weight 200 for every numeral and all type from 30px up, 300 at 22 to 26px, 400 for small text.
- One accent, chosen by the owner from six; used as flat fills with black text on them, or as the colour of text actions.
- Rounded flat tiles (12 / 16 / 24px) on tonal graphite steps; no borders, dividers, shadows or bar backgrounds.
- Lists of rows are graphite panels whose rows are split by a 2px seam of the ground.
- Tabular numerals everywhere.

## Colors

A black ground with three graphite steps, a strict grey text ladder, iOS-system signal colours, and one owner-chosen accent.

### Primary
- **Owner's Accent** (default **Teal**, `accent-teal`): the only brand colour, stored as `--app-accent` and switched at runtime in Settings to one of six: Teal (default, טורקיז), Orange, Blue, Indigo, Purple, Pink. It fills the current-set tile, gym days in the week strip, the selected body-area tile and the start-workout bar; it colours text actions, the tab bar's selected item, the progress line, the caret, the focus ring and date numerals on the timeline. Any new surface must read the token, never a literal hue.

### Secondary
- **Done Green** (`done-green`, iOS system green): the done state only. A finished set's ✓, the ended rest timer, and the "improved" change badge. It never decorates.
- **Danger Coral** (`danger-coral`, iOS dark red): destructive actions (delete) only.

### Tertiary
- **Drill colours** (`drill-red` through `drill-pink`, the eight iOS system colours): the owner tags each daily drill routine with one. They appear as 8px dots, as unchecked rings, and as the fill of a done routine tile on the יומי screen. They are data labels, not a second palette; they never colour chrome.

### Neutral
- **Ground Black** (`ground-black`): every page background, toolbar and tab bar. Inside sheets the ground becomes **Sheet Graphite**.
- **Sheet Graphite** (`sheet-graphite`): quiet tiles, inset lists, search fields, the progress track, the update bar; and the ground of every sheet.
- **Raised Graphite** (`raised-graphite`): one step up. Pressed states on graphite, activity days in the week strip, and panels inside sheets (where it replaces Sheet Graphite as the quiet fill).
- **Control Fill** (`control-fill`): the translucent iOS fill behind steppers and the selected body-area option.
- **Label White** (`label-white`): primary text.
- **Label Secondary** (`label-secondary`): every piece of secondary text at any size: captions, units, meta lines, the waiting set row, unchecked ✓ outlines.
- **Label Dim** (`label-dim`): a quieter grey for large type only: the peeking next-exercise name, an empty numeral placeholder, days with nothing logged in the week strip.
- **Label Tertiary** (`label-tertiary`): disabled and future states only (future days, disabled stepper halves, unset drill dots).
- **On-Accent Black** (`on-accent-black`): all text and icons on an accent or drill-colour fill, and the disc behind the primary ✓.

### Named Rules
**The One Accent Rule.** The owner's accent is the only brand hue on screen. Green means done, coral means delete, drill colours label drills; nothing else gets colour.

**The Black-On-Accent Rule.** Text on any accent or drill fill is black, never white. Six accents of different lightness stay legible only because the text colour never changes.

**The Large Dim Rule.** Label Dim (#6e6e73) is used only for text 24px and up. Anything smaller that needs to be quiet uses Label Secondary (#98989d).

## Typography

**Display Font:** Heebo Variable (bundled via @fontsource-variable/heebo, with -apple-system, SF Pro Text and Arial Hebrew as fallbacks)
**Body Font:** Heebo Variable, same stack
**Label/Mono Font:** none; numerals use Heebo with `tabular-nums` globally

**Character:** One Hebrew-native family across the whole range, made expressive by weight: hairline-thin at poster and display sizes so huge numbers stay light, plain regular for everything a thumb reads at 17px and below.

### Hierarchy
- **Poster** (200, 132px, 0.9 line height, -0.02em): weight and reps on the current-set tile. Steps down to 108px on a paired tile and 80px on a waiting tile; numerals of 3 to 6 characters shrink to fit (88 / 76 / 62 / 52px).
- **Title** (200, 56px, 1.05): large page titles in the collapsing iOS header.
- **Display** (200, 46px, 1.04): the exercise name on the live screen (up to three lines, flush to the reading start, 34px when long), the peeking next name, the workout detail title. Section titles on workout detail (36px) and routine names (40px) sit between Display and Heading.
- **Heading** (200, 30px): week titles, done-set values in text rows, area counts, the rest countdown, empty-state titles.
- **Row** (300, 22px): list titles (workout cards, routine tiles, routine parts), date numerals. Weight 300 holds from 22 to 26px (tile name 26px, day numbers 24px).
- **Body** (400, 17px): text actions, list item text, the start-workout bar label at Row size.
- **Note** (400, 15px, 20px line): set titles, units under numerals, meta lines, notes, section labels.
- **Caption** (400, 13px): week summaries, list headers and footers, the peek label. Weekday initials and tab labels go to 11px.

### Named Rules
**The Thin From Thirty Rule.** Weight 200 appears only at 30px and above; every numeral that size is 200. Below 30px nothing is thinner than 300, and below 22px everything is 400.

**The Size Is Hierarchy Rule.** Rank is carried by size and weight steps, never by bold, colour fills behind text or uppercase. Weight 600 is reserved for the one warning line (a skipped exercise).

## Layout

A single phone column at 390pt wide, right-to-left. The page gutter is 16px; inset tiles and lists sit 16px from the edges (the live tiles 16px, routine rows 8px so their 24px corners clear the gutter). List headers and footers indent 32px to align with text inside inset panels.

Rhythm is 4 / 8 / 12 / 16px inside components and 20 to 36px between groups (weeks 20px apart, routines 36px apart). Grids are small and fixed: three columns for body-area tiles (8px gaps, 92px tall), seven for the week strip (5px gaps, 58px tall), two for routine tiles (10px gaps, 100px tall, paged horizontally with snap).

The live screen stacks a plain-text nav row over a 4px accent progress line, the exercise heading, the done set as one row, the ~290px tile, the waiting set, a row of three text actions, and the next exercise's name cropped by the edge above a plain-text footer. Thumb actions live low: the primary ✓ sits in the tile's bottom end corner, routine tiles and the start-workout bar sit in the bottom bar.

Every tap target is at least 44 × 44pt; steppers and checks are 48px; invisible hit-area expansion is added to toolbar buttons.

## Elevation & Depth

Flat. No element casts a shadow; Ionic's default button and toggle shadows are switched off. Depth is tonal: Ground Black, then Sheet Graphite, then Raised Graphite. A sheet raises the whole ladder one step (its ground is #1c1c1e and its panels #2c2c2e), so a sheet reads as lifted without any edge or shadow.

### Named Rules
**The Tonal Step Rule.** To lift something, move it one graphite step; to press it, move it one more or drop its opacity to 0.6 to 0.7. Never add a shadow, border or blur.

**The No-Line Rule.** No dividers, hairlines, toolbar or tab bar borders, and no bar backgrounds. A list of rows is one graphite panel (16px corners, 16px from the screen edges), and its rows are split by a 2px seam where the ground shows through (`--app-seam`): black on a page, Sheet Graphite in a sheet. The seam is space, not a drawn line. There is no seam after the last row, and a label row stays joined to the rows it labels (a drill exercise's name and its two steppers are one block). The live screen's done and upcoming set rows stay flat on black, since a graphite row there would read as the waiting tile.

## Shapes

Rounded, never square. Three radii scale with the object: controls and day cells 12px, panels and small tiles 16px, big tiles 24px. Round things are fully round: the ✓ discs and rings, swatches, drill dots, the start button, the back-to-current pill.

Strokes exist only as state marks, never as structure: a 1.5px white ring for today (week strip, month calendar), 1.5 to 2px rings for an unchecked set or drill, the outlined ✓ on a waiting tile, and a 2px accent ring on a selected body-area option. Selection marks on swatches use a 3px offset outline in the swatch's own colour.

## Components

### Buttons
Words and shapes, not boxes.
- **Text action:** accent-coloured Body text with an optional 18px leading icon, no fill, 48px tall (הוספת סט, דלג, הוספת הערה, toolbar actions).
- **Primary ✓:** a 72px black disc in the tile's bottom end corner with an accent check; the check turns Done Green when the set is done. On a waiting tile it becomes a 56px outlined ring.
- **Row ✓:** a 48px bare check in Label Secondary, Done Green when done.
- **Start-workout bar:** a full-width accent fill, 64px tall, black Row-size label, no shadow.
- **Pressed:** opacity 0.6 to 0.7 on bare and tile buttons, one tonal step on graphite, black at 12% on accent.

### Chips
- **Back-to-current pill:** Sheet Graphite fill, accent Note text, fully round, 44px minimum; pressed moves to Raised Graphite. It is the only pill.

### Cards / Containers
- **Accent tile:** the signature. Owner's accent fill, black text, 24px corners, about 290px tall on the live screen, holding two poster numerals with a thin × between, a Note-size unit under each, − and + steppers (44 × 48px, 34px glyphs) under each, and the primary ✓.
- **Quiet tile / panel:** Sheet Graphite fill, white text; area tiles (16px, 92px tall, icon, name and a thin count), routine tiles, inset lists, the update bar, the backup reminder.
- **Day tile:** 12px cells; accent fill for a gym day, Raised Graphite for another activity, Label Dim numeral when nothing was logged, Label Tertiary for future days.

### Inputs / Fields
- **Search field:** Sheet Graphite fill, 12px corners, Label Secondary placeholder and icon.
- **Stepper:** Control Fill track with 12px corners and two 48 × 44px halves; disabled halves drop to Label Tertiary.
- **Numeral entry:** editing a numeral on the tile keeps the poster type, black text and caret, with the placeholder at 35% black.
- **Focus:** a 2px accent outline offset 2px everywhere; on an accent tile the ring is black.

### Navigation
- **Tab bar:** iOS tab bar on Ground Black with no border; labels 11px in Label Secondary, selected in the accent.
- **Header:** iOS large-title header that collapses; toolbar on Ground Black with no border, icon buttons in white, text buttons in the accent.
- **Live nav row:** plain text (routine name in 16px regular, elapsed clock in Caption), then the 4px progress line (accent on Sheet Graphite).

### Next-Exercise Peek
The live screen's signature move. Below the actions, a Caption label "הבא" and the next exercise's name in Display weight 200, Label Dim, on one line cropped by the screen edge. Swiping between exercises slides the new content in 48px from the travel edge over 280ms (`cubic-bezier(0.16, 1, 0.3, 1)`, the heading first, the rest 40ms later); under reduce-motion there is no motion.

## Do's and Don'ts

### Do:
- **Do** keep the ground pure black (#000000) on every page and Sheet Graphite (#1c1c1e) in every sheet, with Raised Graphite (#2c2c2e) for panels inside sheets.
- **Do** read the accent from its token (`--app-accent` / `--ion-color-primary`) so the owner's choice of six reaches every surface; put black text on it.
- **Do** set numerals and all type 30px and up in Heebo weight 200, with tabular numerals.
- **Do** use Label Secondary (#98989d) for small quiet text and keep Label Dim (#6e6e73) for text 24px and up.
- **Do** use Done Green (#30d158) only for done, and the type-size ladder (132 / 56 / 46 / 30 / 22 / 17 / 15 / 13px) for rank.
- **Do** round every tile and control (12 / 16 / 24px) and keep tap targets at least 44pt.
- **Do** switch off every transition and animation under reduce-motion.

### Don't:
- **Don't** add a light mode, an appearance setting or a token-swapped light theme; a token swap was tried and rejected.
- **Don't** use borders, dividers, hairlines, shadows or bar backgrounds; strokes appear only as state rings, and rows are split by a seam of the ground, never a line.
- **Don't** use decorative gradients. The only gradient is the black scrim over the owner's background photo on the live screen, there for legibility.
- **Don't** put white text on the accent or on a drill colour.
- **Don't** use weight 200 below 30px, bold for hierarchy, or uppercase.
- **Don't** introduce a second brand hue, or use drill colours outside drill labels.
- **Don't** return to stock iOS grouped lists or dark cards holding a set table for the live screen.
- **Don't** set square tiles or edge-to-edge blocks.
