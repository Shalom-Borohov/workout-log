import { prefill, type PreviousLookup, targetAmount, toWorkoutExercise } from './progress'
import {
  type Change,
  DEFAULT_SETS,
  itemSets,
  moveItem as moveInList,
  newItem,
  routineExercise,
  withSets,
} from './routineEdit'
import { type ItemRef, itemRefs } from './workoutEdits'
import type { RoutineItem, SetLog, Workout, WorkoutItem, WorkoutSection } from './types'

export function setCount(item: WorkoutItem): number {
  return Math.max(...item.exercises.map((exercise) => exercise.sets.length))
}

export function commonSets(section: WorkoutSection): number {
  const counts = section.items.map(setCount)
  const frequency = (count: number) => counts.filter((other) => other === count).length

  return counts.reduce<number>(
    (best, count) => (frequency(count) > frequency(best) ? count : best),
    counts.length > 0 ? counts[0] : DEFAULT_SETS,
  )
}

export function addItem(workout: Workout, sectionIndex: number, routineItem: RoutineItem, previous: PreviousLookup): Workout {
  const count = itemSets(routineItem, commonSets(workout.sections[sectionIndex]))

  const item: WorkoutItem = {
    id: routineItem.id,
    exercises: routineItem.exercises.map((exercise) => toWorkoutExercise(exercise, count, previous)),
  }

  return mapItems(workout, sectionIndex, (items) => [...items, item])
}

function mapItems(workout: Workout, sectionIndex: number, change: (items: WorkoutItem[]) => WorkoutItem[]): Workout {
  return {
    ...workout,
    sections: workout.sections.map((section, index) => (index === sectionIndex ? { ...section, items: change(section.items) } : section)),
  }
}

export function canRemoveItem(workout: Workout): boolean {
  return itemRefs(workout).length > 1
}

export function removeItem(workout: Workout, ref: ItemRef): Workout {
  if (!canRemoveItem(workout)) {
    return workout
  }

  return mapItems(workout, ref.section, (items) => items.filter((_, itemIndex) => itemIndex !== ref.item))
}

const itemIds = (workout: Workout) => workout.sections.flatMap((section) => section.items.map((item) => item.id))

export function followIndex(before: Workout, after: Workout, index: number): number {
  const ids = itemIds(after)
  const kept = ids.indexOf(itemIds(before)[index])

  return kept === -1 ? Math.min(index, ids.length - 1) : kept
}

export function asRoutineItem(item: WorkoutItem, sectionSets: number): RoutineItem {
  const exercises = item.exercises.map(({ name, target, tip }) => ({ ...routineExercise(name, target), tip }))

  return withSets(newItem(item.id, exercises), setCount(item), sectionSets)
}

function resize(sets: SetLog[], count: number): SetLog[] {
  if (count >= sets.length) {
    const last = sets[sets.length - 1]

    return [...sets, ...Array.from({ length: count - sets.length }, () => ({ ...last, done: false }))]
  }

  return sets.slice(0, Math.max(count, sets.findLastIndex((set) => set.done) + 1))
}

export function applyItemEdit(
  item: WorkoutItem,
  edited: RoutineItem,
  sectionSets: number,
  previous: PreviousLookup,
): WorkoutItem {
  const count = itemSets(edited, sectionSets)

  const exercises = edited.exercises.map((exercise, exerciseIndex) => {
    const current = item.exercises.at(exerciseIndex)
    if (!current) {
      return toWorkoutExercise(exercise, count, previous)
    }
    const sameExercise = current.name === exercise.name && targetAmount(current.target) === targetAmount(exercise.target)
    const keepsSets = current.target.kind === exercise.target.kind && (sameExercise || current.sets.some((set) => set.done))
    const sets = keepsSets ? resize(current.sets, count) : prefill(exercise, count, previous(exercise))

    return { ...current, name: exercise.name, target: exercise.target, tip: exercise.tip, sets }
  })

  return { ...item, exercises }
}

type LocatedItem = { ref: ItemRef; item: WorkoutItem; sectionSets: number }

export function locateItem(workout: Workout, id: string): LocatedItem | undefined {
  return workout.sections
    .flatMap((workoutSection, section) => {
      const sectionSets = commonSets(workoutSection)

      return workoutSection.items.map((item, itemIndex) => ({ ref: { section, item: itemIndex }, item, sectionSets }))
    })
    .find(({ item }) => item.id === id)
}

export function editItem(workout: Workout, id: string, change: Change<RoutineItem>, previous: PreviousLookup): Workout {
  const located = locateItem(workout, id)
  if (!located) {
    return workout
  }
  const { ref, item, sectionSets } = located
  const edited = applyItemEdit(item, change(asRoutineItem(item, sectionSets)), sectionSets, previous)

  return mapItems(workout, ref.section, (items) => items.map((existing, itemIndex) => (itemIndex === ref.item ? edited : existing)))
}

export function moveItem(workout: Workout, sectionIndex: number, from: number, to: number): Workout {
  return mapItems(workout, sectionIndex, (items) => moveInList(items, from, to))
}
