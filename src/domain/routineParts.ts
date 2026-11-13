import { LIST_SEPARATOR } from './format'
import { DEFAULT_SECTION_NAME } from './routineEdit'
import type { Routine } from './types'

export interface RoutinePart {
  name: string
  exercises: number
}

export function routineParts(routine: Pick<Routine, 'sections'>): RoutinePart[] {
  return routine.sections.map((section) => ({
    name: section.name.trim() || DEFAULT_SECTION_NAME,
    exercises: section.items.flatMap((item) => item.exercises).length,
  }))
}

export function routinePartsLine(parts: RoutinePart[]): string {
  return parts.map((part) => `${part.name} ${part.exercises}`).join(LIST_SEPARATOR)
}
