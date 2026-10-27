import { durationUnit } from './format'
import { exercisesOf } from './progress'
import type { SetLog, Target, Workout, WorkoutItem } from './types'

export type ItemRef = { section: number; item: number }

export function itemRefs(w: Workout): ItemRef[] {
  return w.sections.flatMap((s, section) => s.items.map((_, item) => ({ section, item })))
}

export function itemAt(w: Workout, ref: ItemRef): WorkoutItem {
  return w.sections[ref.section].items[ref.item]
}

export function itemTitle(item: { exercises: { name: string }[] }): string {
  return item.exercises.map((e) => e.name).join(' + ')
}

function isUnfinished(item: WorkoutItem): boolean {
  return item.exercises.some((e) => !e.skipped && e.sets.some((s) => !s.done))
}

export function firstUnfinished(w: Workout): number {
  const refs = itemRefs(w)
  const index = refs.findIndex((ref) => isUnfinished(itemAt(w, ref)))

  return index === -1 ? refs.length - 1 : index
}

function mapItem(w: Workout, ref: ItemRef, edit: (item: WorkoutItem) => WorkoutItem): Workout {
  return {
    ...w,
    sections: w.sections.map((s, si) =>
      si === ref.section ? { ...s, items: s.items.map((it, ii) => (ii === ref.item ? edit(it) : it)) } : s,
    ),
  }
}

export function updateSet(w: Workout, ref: ItemRef, exercise: number, set: number, patch: Partial<SetLog>): Workout {
  return mapItem(w, ref, (item) => ({
    ...item,
    exercises: item.exercises.map((e, ei) =>
      ei === exercise ? { ...e, sets: e.sets.map((s, si) => (si === set ? { ...s, ...patch } : s)) } : e,
    ),
  }))
}

export function addSet(w: Workout, ref: ItemRef): Workout {
  return mapItem(w, ref, (item) => ({
    ...item,
    exercises: item.exercises.map((e) => {
      const last = e.sets[e.sets.length - 1]

      return { ...e, sets: [...e.sets, { ...last, done: false }] }
    }),
  }))
}

export function isSkipped(item: WorkoutItem): boolean {
  return item.exercises.every((e) => e.skipped)
}

export function isDone(item: WorkoutItem): boolean {
  return !isSkipped(item) && item.exercises.every((e) => e.sets.every((s) => s.done))
}

export function workoutProgress(w: Workout): { done: number; total: number } {
  const sets = exercisesOf(w)
    .filter((e) => !e.skipped)
    .flatMap((e) => e.sets)

  return { done: sets.filter((s) => s.done).length, total: sets.length }
}

export function stepValue(value: number | null, delta: number): number {
  return Math.max(value === null ? delta : value + delta, 0)
}

export const WEIGHT_STEP = 2.5

export function amountStep(target: Target): number {
  if (target.kind === 'reps') {
    return 1
  }

  return durationUnit(target) === 'minutes' ? 60 : 15
}

export function toggleSkip(w: Workout, ref: ItemRef): Workout {
  return mapItem(w, ref, (item) => {
    const skipped = !isSkipped(item)

    return { ...item, exercises: item.exercises.map((e) => ({ ...e, skipped })) }
  })
}

export function removeSet(w: Workout, ref: ItemRef): Workout {
  return mapItem(w, ref, (item) => ({
    ...item,
    exercises: item.exercises.map((e) => (e.sets.length > 1 ? { ...e, sets: e.sets.slice(0, -1) } : e)),
  }))
}
