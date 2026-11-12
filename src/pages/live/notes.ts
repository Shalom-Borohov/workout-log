import type { WorkoutItem } from '../../domain/types'

export function notedExercises(item: WorkoutItem) {
  return item.exercises.filter((exercise) => exercise.note !== '')
}
