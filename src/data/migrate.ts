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

export type LegacyActivity = Legacy<Activity, 'location'>

export type LegacyRecord = LegacyWorkout | LegacyActivity

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

const upgradeActivity = (activity: LegacyActivity): Activity => ({ ...activity, location: activity.location ?? '' })

export function upgradeRecord(record: LegacyRecord): WorkoutRecord {
  return record.kind === 'activity' ? upgradeActivity(record) : upgradeWorkout(record)
}

function carryInto(workout: Workout, latest: Map<string, string>): Workout {
  return {
    ...workout,
    sections: workout.sections.map((section) => ({
      ...section,
      items: section.items.map((item) => ({
        ...item,
        exercises: item.exercises.map((exercise) => {
          if (exercise.note !== '') {
            latest.set(exercise.name, exercise.note)

            return exercise
          }
          const carried = latest.get(exercise.name)

          return carried === undefined ? exercise : { ...exercise, note: carried }
        }),
      })),
    })),
  }
}

export function carryNotesForward(records: WorkoutRecord[]): WorkoutRecord[] {
  const latest = new Map<string, string>()
  const carried = [...records]

  const chronological = records
    .map((_, index) => index)
    .sort((first, second) => records[first].startedAt - records[second].startedAt)

  for (const index of chronological) {
    const record = records[index]

    if (record.kind !== 'activity') {
      carried[index] = carryInto(record, latest)
    }
  }

  return carried
}
