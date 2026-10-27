import type { Routine, RoutineExercise, RoutineItem, RoutineSection } from './types'

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
  return { ...routine, sections: routine.sections.map((s) => (s.id === id ? change(s) : s)) }
}

export function removeSection(routine: Routine, id: string): Routine {
  return { ...routine, sections: routine.sections.filter((s) => s.id !== id) }
}

export function findItem(routine: Routine, id: string): RoutineItem | undefined {
  return routine.sections.flatMap((s) => s.items).find((i) => i.id === id)
}

export function updateItem(routine: Routine, id: string, change: Change<RoutineItem>): Routine {
  return {
    ...routine,
    sections: routine.sections.map((s) => ({ ...s, items: s.items.map((i) => (i.id === id ? change(i) : i)) })),
  }
}

export function removeItem(routine: Routine, id: string): Routine {
  return { ...routine, sections: routine.sections.map((s) => ({ ...s, items: s.items.filter((i) => i.id !== id) })) }
}

export function setPair(item: RoutineItem, pair: boolean): RoutineItem {
  if (pair === item.exercises.length > 1) {
    return item
  }

  return { ...item, exercises: pair ? [...item.exercises, newExercise()] : item.exercises.slice(0, 1) }
}

export const DEFAULT_ROUTINE_NAME = 'אימון חדש'

export const DEFAULT_SECTION_NAME = 'עיקרי'

export function newExercise(): RoutineExercise {
  return { name: 'תרגיל חדש', target: { kind: 'reps', reps: 10 } }
}

export function newSection(id: string, name: string, sets = 3): RoutineSection {
  return { id, name, sets, items: [] }
}

export function newRoutine(id: string, sectionId: string, now: number): Routine {
  return { id, name: DEFAULT_ROUTINE_NAME, updatedAt: now, sections: [newSection(sectionId, DEFAULT_SECTION_NAME)] }
}
