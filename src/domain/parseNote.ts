import { clampTarget } from './limits'
import {
  DEFAULT_ROUTINE_NAME,
  DEFAULT_SECTION_NAME,
  MAX_SETS,
  MIN_SETS,
  namedOrDefault,
  newItem,
  newSection,
  routineExercise,
} from './routineEdit'
import { SECONDS_PER_MINUTE } from './time'
import type { RoutineExercise, RoutineItem, RoutineSection, Target } from './types'

const TIME_UNIT = String.raw`דקות|דקה|דק[׳']|שניות|שנייה|שנ[׳']`
const SETS_TIMES = 'xX×*'
const RANGE_WORD = 'עד'

const AMOUNT = new RegExp(
  String.raw`^(?<name>.*?)\s*(?:(?<sets>\d+)\s*[${SETS_TIMES}]\s*)?(?:(?<clockMinutes>\d+):(?<clockSeconds>[0-5]\d)|(?<amount>\d+(?:\.\d+)?))\s*(?<unit>${TIME_UNIT})?$`,
)

const NUMBER_TAIL = new RegExp(String.raw`(?:^|\s+)\d(?:[\d\s:.,\-–—/${SETS_TIMES}]|${RANGE_WORD})*$`)
const LEADING_SETS = new RegExp(String.raw`^\s*(\d+)\s*[${SETS_TIMES}]`)
const SETS = /(\d+)\s*סטים?/
const MINUTES = /^דק/
const DEFAULT_NOTE_SETS = 1
const UNREAD_AMOUNT = 0

type AmountGroups = { clockMinutes?: string; clockSeconds?: string; amount?: string; unit?: string }

function targetOf({ clockMinutes, clockSeconds, amount, unit }: AmountGroups): Target | null {
  if (clockMinutes !== undefined && clockSeconds !== undefined) {
    return clampTarget({ kind: 'duration', seconds: Number(clockMinutes) * SECONDS_PER_MINUTE + Number(clockSeconds) })
  }

  const parsedAmount = Number(amount)
  const inMinutes = unit !== undefined && MINUTES.test(unit)

  if (!Number.isInteger(parsedAmount) && !inMinutes) {
    return null
  }

  return toTarget(parsedAmount, unit)
}

function toTarget(amount: number, unit: string | undefined): Target {
  if (unit === undefined) {
    return clampTarget({ kind: 'reps', reps: amount })
  }

  return clampTarget({ kind: 'duration', seconds: MINUTES.test(unit) ? Math.round(amount * SECONDS_PER_MINUTE) : amount })
}

const withinSetLimits = (sets: number) => Math.min(Math.max(sets, MIN_SETS), MAX_SETS)

type ParsedExercise = { exercise: RoutineExercise; sets: number | null }

function unclearExercise(name: string, unit: string | undefined): ParsedExercise {
  const statedSets = name.match(NUMBER_TAIL)?.[0].match(LEADING_SETS)?.[1]

  return {
    exercise: routineExercise(namedOrDefault(name.replace(NUMBER_TAIL, '')), toTarget(UNREAD_AMOUNT, unit)),
    sets: statedSets === undefined ? null : Number(statedSets),
  }
}

function parseExercise(text: string): ParsedExercise {
  const groups = text.match(AMOUNT)?.groups

  if (!groups) {
    return unclearExercise(text, undefined)
  }

  const target = NUMBER_TAIL.test(groups.name) ? null : targetOf(groups)

  if (target === null) {
    return unclearExercise(groups.name, groups.unit)
  }

  return {
    exercise: routineExercise(namedOrDefault(groups.name), target),
    sets: groups.sets === undefined ? null : Number(groups.sets),
  }
}

function ownSets(halves: ParsedExercise[], sectionSets: number): number | null {
  const sets = withinSetLimits(Math.max(...halves.map((half) => (half.sets === null ? sectionSets : half.sets))))

  return sets === sectionSets ? null : sets
}

function parseItem(line: string, section: RoutineSection, newId: () => string): RoutineItem {
  const halves = line.split(/->|→/).map(parseExercise)

  return {
    ...newItem(
      newId(),
      halves.map((half) => half.exercise),
    ),
    sets: ownSets(halves, section.sets),
  }
}

function parseHeader(line: string, newId: () => string): RoutineSection {
  const sets = line.match(SETS)
  const name = line.slice(0, -1).replace(SETS, '').replace(/\s+/g, ' ').trim()

  return newSection(newId(), name || DEFAULT_SECTION_NAME, sets ? withinSetLimits(Number(sets[1])) : DEFAULT_NOTE_SETS)
}

export function parseNote(text: string, newId: () => string): { name: string; sections: RoutineSection[] } {
  const lines = text.split('\n').map((line) => line.trim()).filter((line) => line !== '')
  const hasName = lines.length > 0 && !lines[0].endsWith(':') && !AMOUNT.test(lines[0])
  const sections: RoutineSection[] = []

  for (const line of hasName ? lines.slice(1) : lines) {
    if (line.endsWith(':')) {
      sections.push(parseHeader(line, newId))
      continue
    }

    if (sections.length === 0) {
      sections.push(newSection(newId(), DEFAULT_SECTION_NAME, DEFAULT_NOTE_SETS))
    }

    const section = sections[sections.length - 1]

    section.items.push(parseItem(line, section, newId))
  }

  return {
    name: hasName ? lines[0] : DEFAULT_ROUTINE_NAME,
    sections: sections.filter((section) => section.items.length > 0),
  }
}
