import { APP_COPY } from '../copy/app'
import { COMMON_COPY } from '../copy/common'
import type { Routine, RoutineExercise, RoutineItem, RoutineSection, Target } from './types'

export type Change<T> = (value: T) => T

export const MIN_SETS = 1

export const MAX_SETS = 10

export function moveItem<T>(list: T[], from: number, to: number): T[] {
  const next = [...list]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)

  return next
}

export function updateSection(routine: Routine, id: string, change: Change<RoutineSection>): Routine {
  return { ...routine, sections: routine.sections.map((section) => (section.id === id ? change(section) : section)) }
}

export function removeSection(routine: Routine, id: string): Routine {
  return { ...routine, sections: routine.sections.filter((section) => section.id !== id) }
}

export interface ItemInSection {
  item: RoutineItem
  sectionSets: number
}

export function findItem(routine: Routine, id: string): ItemInSection | undefined {
  return routine.sections
    .flatMap((section) => section.items.map((item) => ({ item, sectionSets: section.sets })))
    .find(({ item }) => item.id === id)
}

export function withSets(item: RoutineItem, sets: number, sectionSets: number): RoutineItem {
  return { ...item, sets: sets === sectionSets ? null : sets }
}

export function itemSets(item: Pick<RoutineItem, 'sets'>, sectionSets: number): number {
  return item.sets === null ? sectionSets : item.sets
}

export function setSectionSets(section: RoutineSection, sets: number): RoutineSection {
  return { ...section, sets }
}

export function updateItem(routine: Routine, id: string, change: Change<RoutineItem>): Routine {
  return {
    ...routine,
    sections: routine.sections.map((section) => ({
      ...section,
      items: section.items.map((item) => (item.id === id ? change(item) : item)),
    })),
  }
}

export function insertAfter<T extends { id: string }>(list: T[], afterId: string, added: T): T[] {
  const index = list.findIndex((entry) => entry.id === afterId)

  return index === -1 ? list : [...list.slice(0, index + 1), added, ...list.slice(index + 1)]
}

export function addItemAfter(routine: Routine, afterId: string, item: RoutineItem): Routine {
  return {
    ...routine,
    sections: routine.sections.map((section) => ({ ...section, items: insertAfter(section.items, afterId, item) })),
  }
}

export function removeItem(routine: Routine, id: string): Routine {
  return {
    ...routine,
    sections: routine.sections.map((section) => ({ ...section, items: section.items.filter((item) => item.id !== id) })),
  }
}

export function setPair(item: RoutineItem, pair: boolean): RoutineItem {
  if (pair === item.exercises.length > 1) {
    return item
  }

  return { ...item, exercises: pair ? [...item.exercises, newExercise()] : item.exercises.slice(0, 1) }
}

export const DEFAULT_ROUTINE_NAME = COMMON_COPY.newRoutine

export const DEFAULT_SECTION_NAME = APP_COPY.defaultSectionName

export const DEFAULT_EXERCISE_NAME = APP_COPY.defaultExerciseName

export const namedOrDefault = (text: string) => text.trim() || DEFAULT_EXERCISE_NAME

const DEFAULT_REPS = 10

export const DEFAULT_SETS = 3

export function newExercise(name: string = DEFAULT_EXERCISE_NAME): RoutineExercise {
  return { name, target: { kind: 'reps', reps: DEFAULT_REPS }, weight: null, tip: '' }
}

export function routineExercise(name: string, target: Target): RoutineExercise {
  return { name, target, weight: null, tip: '' }
}

export function newItem(id: string, exercises = [newExercise()]): RoutineItem {
  return { id, sets: null, exercises }
}

export function newSection(id: string, name: string, sets = DEFAULT_SETS): RoutineSection {
  return { id, name, sets, items: [] }
}

export function copyName(name: string): string {
  return APP_COPY.copyName(name)
}

export function createRoutine(id: string, name: string, sections: RoutineSection[], now: number): Routine {
  return { id, name, daily: false, color: null, archived: false, sections, createdAt: now, updatedAt: now }
}

export function duplicateRoutine(routine: Routine, newId: () => string, now: number): Routine {
  const id = newId()

  const sections = routine.sections.map((section) => ({
    ...section,
    id: newId(),
    items: section.items.map((item) => ({ ...item, id: newId() })),
  }))

  return { ...createRoutine(id, copyName(routine.name), sections, now), daily: routine.daily, color: routine.color }
}

export function newRoutine(id: string, sectionId: string, now: number): Routine {
  return createRoutine(id, DEFAULT_ROUTINE_NAME, [newSection(sectionId, DEFAULT_SECTION_NAME)], now)
}
