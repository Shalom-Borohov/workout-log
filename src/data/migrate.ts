import type {
  Activity,
  Routine,
  RoutineExercise,
  RoutineItem,
  RoutineSection,
  Workout,
  WorkoutExercise,
  WorkoutItem,
  WorkoutRecord,
  WorkoutSection,
} from '../domain/types'

type Legacy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type LegacyRoutineExercise = Legacy<RoutineExercise, 'weight' | 'tip'>

export type LegacyRoutineItem = Omit<Legacy<RoutineItem, 'sets'>, 'exercises'> & { exercises: LegacyRoutineExercise[] }

export type LegacyRoutineSection = Omit<RoutineSection, 'items'> & { items: LegacyRoutineItem[] }

export type LegacyRoutine = Omit<Legacy<Routine, 'createdAt' | 'daily'>, 'sections'> & { sections: LegacyRoutineSection[] }

export type LegacyWorkoutExercise = Legacy<WorkoutExercise, 'tip' | 'note'>

export type LegacyWorkoutItem = Omit<WorkoutItem, 'exercises'> & { exercises: LegacyWorkoutExercise[] }

export type LegacyWorkoutSection = Omit<WorkoutSection, 'items'> & { items: LegacyWorkoutItem[] }

export type LegacyWorkout = Omit<Legacy<Workout, 'kind'>, 'sections'> & { sections: LegacyWorkoutSection[] }

export type LegacyRecord = LegacyWorkout | Activity

export function upgradeRoutine(routine: LegacyRoutine): Routine {
  return {
    ...routine,
    daily: routine.daily ?? false,
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
    kind: 'routine',
    sections: workout.sections.map((section) => ({
      ...section,
      items: section.items.map((item) => ({
        ...item,
        exercises: item.exercises.map((exercise) => ({ ...exercise, tip: exercise.tip ?? '', note: exercise.note ?? '' })),
      })),
    })),
  }
}

export function upgradeRecord(record: LegacyRecord): WorkoutRecord {
  return record.kind === 'activity' ? record : upgradeWorkout(record)
}
