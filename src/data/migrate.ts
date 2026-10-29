import type {
  Routine,
  RoutineExercise,
  RoutineItem,
  RoutineSection,
  Workout,
  WorkoutExercise,
  WorkoutItem,
  WorkoutSection,
} from '../domain/types'

type Legacy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type LegacyRoutineExercise = Legacy<RoutineExercise, 'weight' | 'tip'>

export type LegacyRoutineItem = Omit<Legacy<RoutineItem, 'sets'>, 'exercises'> & { exercises: LegacyRoutineExercise[] }

export type LegacyRoutineSection = Omit<RoutineSection, 'items'> & { items: LegacyRoutineItem[] }

export type LegacyRoutine = Omit<Legacy<Routine, 'createdAt'>, 'sections'> & { sections: LegacyRoutineSection[] }

export type LegacyWorkoutExercise = Legacy<WorkoutExercise, 'tip' | 'note'>

export type LegacyWorkoutItem = Omit<WorkoutItem, 'exercises'> & { exercises: LegacyWorkoutExercise[] }

export type LegacyWorkoutSection = Omit<WorkoutSection, 'items'> & { items: LegacyWorkoutItem[] }

export type LegacyWorkout = Omit<Workout, 'sections'> & { sections: LegacyWorkoutSection[] }

export function upgradeRoutine(routine: LegacyRoutine): Routine {
  return {
    ...routine,
    createdAt: routine.createdAt ?? routine.updatedAt,
    sections: routine.sections.map((section) => ({
      ...section,
      items: section.items.map((item) => ({
        ...item,
        sets: item.sets ?? null,
        exercises: item.exercises.map((exercise) => ({ ...exercise, weight: exercise.weight ?? null, tip: exercise.tip ?? '' })),
      })),
    })),
  }
}

export function upgradeWorkout(workout: LegacyWorkout): Workout {
  return {
    ...workout,
    sections: workout.sections.map((section) => ({
      ...section,
      items: section.items.map((item) => ({
        ...item,
        exercises: item.exercises.map((exercise) => ({ ...exercise, tip: exercise.tip ?? '', note: exercise.note ?? '' })),
      })),
    })),
  }
}
