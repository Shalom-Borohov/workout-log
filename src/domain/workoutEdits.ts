import { durationUnit } from './format'
import { exercisesOf } from './progress'
import { SECONDS_PER_MINUTE } from './time'
import type { SetLog, Target, Workout, WorkoutItem } from './types'

export type ItemRef = { section: number; item: number }

export function itemRefs(workout: Workout): ItemRef[] {
  return workout.sections.flatMap((workoutSection, section) => workoutSection.items.map((_, item) => ({ section, item })))
}

export function itemAt(workout: Workout, ref: ItemRef): WorkoutItem {
  return workout.sections[ref.section].items[ref.item]
}

export function itemTitle(item: { exercises: { name: string }[] }): string {
  return item.exercises.map((exercise) => exercise.name).join(' + ')
}

function isUnfinished(item: WorkoutItem): boolean {
  return item.exercises.some((exercise) => !exercise.skipped && exercise.sets.some((set) => !set.done))
}

export function firstUnfinished(workout: Workout): number {
  const refs = itemRefs(workout)
  const index = refs.findIndex((ref) => isUnfinished(itemAt(workout, ref)))

  return index === -1 ? refs.length - 1 : index
}

export function nextUnfinished(workout: Workout, current: number): number | null {
  const index = itemRefs(workout).findIndex((ref, refIndex) => refIndex > current && isUnfinished(itemAt(workout, ref)))

  return index === -1 ? null : index
}

function mapItem(workout: Workout, ref: ItemRef, edit: (item: WorkoutItem) => WorkoutItem): Workout {
  return {
    ...workout,
    sections: workout.sections.map((section, sectionIndex) =>
      sectionIndex === ref.section
        ? { ...section, items: section.items.map((item, itemIndex) => (itemIndex === ref.item ? edit(item) : item)) }
        : section,
    ),
  }
}

export function updateSet(workout: Workout, ref: ItemRef, exercise: number, set: number, patch: Partial<SetLog>): Workout {
  return mapItem(workout, ref, (item) => ({
    ...item,
    exercises: item.exercises.map((workoutExercise, exerciseIndex) =>
      exerciseIndex === exercise
        ? {
            ...workoutExercise,
            sets: workoutExercise.sets.map((setLog, setIndex) => (setIndex === set ? { ...setLog, ...patch } : setLog)),
          }
        : workoutExercise,
    ),
  }))
}

export function fillWeight(workout: Workout, ref: ItemRef, exercise: number, set: number, weight: number | null): Workout {
  return mapItem(workout, ref, (item) => ({
    ...item,
    exercises: item.exercises.map((workoutExercise, exerciseIndex) => {
      if (exerciseIndex !== exercise) {
        return workoutExercise
      }
      const old = workoutExercise.sets[set].weight

      const sets = workoutExercise.sets.map((setLog, setIndex) =>
        setIndex === set || (setIndex > set && !setLog.done && (setLog.weight === null || setLog.weight === old))
          ? { ...setLog, weight }
          : setLog,
      )

      return { ...workoutExercise, sets }
    }),
  }))
}

export function editSet(workout: Workout, ref: ItemRef, exercise: number, set: number, patch: Partial<SetLog>): Workout {
  const { weight, ...rest } = patch
  const filled = weight === undefined ? workout : fillWeight(workout, ref, exercise, set, weight)

  return updateSet(filled, ref, exercise, set, rest)
}

export function addSet(workout: Workout, ref: ItemRef): Workout {
  return mapItem(workout, ref, (item) => ({
    ...item,
    exercises: item.exercises.map((exercise) => {
      const last = exercise.sets[exercise.sets.length - 1]

      return { ...exercise, sets: [...exercise.sets, { ...last, done: false }] }
    }),
  }))
}

export function isSkipped(item: WorkoutItem): boolean {
  return item.exercises.every((exercise) => exercise.skipped)
}

export function isDone(item: WorkoutItem): boolean {
  return !isSkipped(item) && item.exercises.every((exercise) => exercise.sets.every((set) => set.done))
}

export function workoutProgress(workout: Workout): { done: number; total: number } {
  const sets = exercisesOf(workout)
    .filter((exercise) => !exercise.skipped)
    .flatMap((exercise) => exercise.sets)

  return { done: sets.filter((set) => set.done).length, total: sets.length }
}

export function stepValue(current: number | null, delta: number, max: number): number {
  return Math.min(Math.max(current === null ? delta : current + delta, 0), max)
}

export const WEIGHT_STEP = 2.5

const SECONDS_STEP = 15

export function amountStep(target: Target): number {
  if (target.kind === 'reps') {
    return 1
  }

  return durationUnit(target) === 'minutes' ? SECONDS_PER_MINUTE : SECONDS_STEP
}

export function toggleSkip(workout: Workout, ref: ItemRef): Workout {
  return mapItem(workout, ref, (item) => {
    const skipped = !isSkipped(item)

    return { ...item, exercises: item.exercises.map((exercise) => ({ ...exercise, skipped })) }
  })
}

export function setNotes(workout: Workout, ref: ItemRef, notes: string[]): Workout {
  return mapItem(workout, ref, (item) => ({
    ...item,
    exercises: item.exercises.map((exercise, exerciseIndex) => ({ ...exercise, note: notes[exerciseIndex] })),
  }))
}

export function removeSet(workout: Workout, ref: ItemRef): Workout {
  return mapItem(workout, ref, (item) => ({
    ...item,
    exercises: item.exercises.map((exercise) => (exercise.sets.length > 1 ? { ...exercise, sets: exercise.sets.slice(0, -1) } : exercise)),
  }))
}
