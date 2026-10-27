import type { Routine, RoutineExercise, SetLog, Target, Workout, WorkoutExercise } from '../../src/domain/types'

export const reps = (n: number): Target => ({ kind: 'reps', reps: n })

export const seconds = (n: number): Target => ({ kind: 'duration', seconds: n })

export const oct = (day: number, hour = 10, minute = 0) => new Date(2026, 9, day, hour, minute).getTime()

export const done = (weight: number | null, amount: number): SetLog => ({ weight, amount, done: true })

export const open = (weight: number | null, amount: number): SetLog => ({ weight, amount, done: false })

export function exercise(name: string, sets: SetLog[], target: Target = reps(10)): WorkoutExercise {
  return { name, target, sets, skipped: false }
}

interface WorkoutInput {
  id: string
  startedAt: number
  finishedAt?: number | null
  exercises: WorkoutExercise[]
}

export function workout({ id, startedAt, finishedAt = startedAt + 3600000, exercises }: WorkoutInput): Workout {
  return {
    id,
    routineId: 'r1',
    routineName: 'אימון גוף מלא',
    startedAt,
    finishedAt,
    summary: '',
    sections: [
      {
        name: 'עיקרי',
        items: exercises.map((e, i) => ({ id: `i${i}`, exercises: [e] })),
      },
    ],
  }
}

export function routine(id: string, name: string, exercises: RoutineExercise[][], sets = 3): Routine {
  return {
    id,
    name,
    updatedAt: 0,
    sections: [
      {
        id: `${id}-s1`,
        name: 'עיקרי',
        sets,
        items: exercises.map((item, i) => ({ id: `${id}-i${i}`, exercises: item })),
      },
    ],
  }
}
