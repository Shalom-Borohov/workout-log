import { type PreviousExerciseLookup, toWorkoutExercise } from './progress'
import { replaceExercise } from './routineEdit'
import type { RoutineExercise, Workout, WorkoutExercise, WorkoutItem } from './types'
import { editItem, locateItem, mapItems, plannedCount } from './workoutStructure'

const withSetsWhere = (exercise: WorkoutExercise, done: boolean): WorkoutExercise => ({
  ...exercise,
  sets: exercise.sets.filter((set) => set.done === done),
})

const hasSets = (exercise: WorkoutExercise) => exercise.sets.length > 0

export function replaceInWorkout(
  workout: Workout,
  id: string,
  exerciseIndex: number,
  exercise: RoutineExercise,
  previous: PreviousExerciseLookup,
  doneId: string,
): Workout {
  const located = locateItem(workout, id)
  if (!located) {
    return workout
  }
  const { ref, item } = located
  const replaced = item.exercises.at(exerciseIndex)
  if (!replaced) {
    return workout
  }
  const replacedBySelf = replaced.name === exercise.name
  if (replacedBySelf || !replaced.sets.some((set) => set.done)) {
    return editItem(workout, id, (edited) => replaceExercise(edited, exerciseIndex, exercise), previous)
  }
  const setsLeft = replaced.sets.filter((set) => !set.done).length
  const fresh = toWorkoutExercise(exercise, setsLeft > 0 ? setsLeft : replaced.sets.length, previous)

  const donePart: WorkoutItem = {
    id: doneId,
    exercises: item.exercises.map((current) => withSetsWhere(current, true)).filter(hasSets),
    replacedBy: { id, sets: plannedCount(workout.sections.flatMap((section) => section.items), item) },
  }

  const continuing: WorkoutItem = {
    id,
    exercises: item.exercises
      .map((current, index) => (index === exerciseIndex ? fresh : withSetsWhere(current, false)))
      .filter(hasSets),
  }

  return mapItems(workout, ref.section, (items) =>
    items.flatMap((existing, itemIndex) => (itemIndex === ref.item ? [donePart, continuing] : [existing])),
  )
}
