import { DEFAULT_ROUTINE_NAME, DEFAULT_SECTION_NAME, newItem, newSection, routineExercise } from './routineEdit'
import { SECONDS_PER_MINUTE } from './time'
import type { RoutineExercise, RoutineSection, Target } from './types'

const AMOUNT = /^(.*?)\s*(\d+)\s*(דקות|דקה|דק[׳']|שניות|שנייה|שנ[׳'])?$/
const SETS = /(\d+)\s*סטים?/
const MINUTES = /^דק/
const DEFAULT_NOTE_SETS = 1

function toTarget(amount: number, unit: string | undefined): Target {
  if (unit === undefined) {
    return { kind: 'reps', reps: amount }
  }

  return { kind: 'duration', seconds: MINUTES.test(unit) ? amount * SECONDS_PER_MINUTE : amount }
}

function parseExercise(text: string): RoutineExercise {
  const match = text.match(AMOUNT)

  if (!match) {
    return routineExercise(text.trim(), { kind: 'reps', reps: 0 })
  }

  return routineExercise(match[1].trim(), toTarget(Number(match[2]), match[3]))
}

function parseHeader(line: string, newId: () => string): RoutineSection {
  const sets = line.match(SETS)
  const name = line.slice(0, -1).replace(SETS, '').replace(/\s+/g, ' ').trim()

  return newSection(newId(), name || DEFAULT_SECTION_NAME, sets ? Number(sets[1]) : DEFAULT_NOTE_SETS)
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

    sections[sections.length - 1].items.push(newItem(newId(), line.split(/->|→/).map(parseExercise)))
  }

  return {
    name: hasName ? lines[0] : DEFAULT_ROUTINE_NAME,
    sections: sections.filter((section) => section.items.length > 0),
  }
}
