import { isExerciseLine, parseExercise, type ParsedExercise } from './noteLine'
import { DEFAULT_ROUTINE_NAME, DEFAULT_SECTION_NAME, MAX_SETS, MIN_SETS, newItem, newSection } from './routineEdit'
import type { RoutineItem, RoutineSection } from './types'

const SETS = /(\d+)\s*סטים?/
const DEFAULT_NOTE_SETS = 1

const withinSetLimits = (sets: number) => Math.min(Math.max(sets, MIN_SETS), MAX_SETS)

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
  const hasName = lines.length > 0 && !lines[0].endsWith(':') && !isExerciseLine(lines[0])
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
