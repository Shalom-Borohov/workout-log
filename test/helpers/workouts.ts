import type { Routine, RoutineExercise, SetLog, Target, Workout, WorkoutExercise } from '../../src/domain/types'

export const reps = (count: number): Target => ({ kind: 'reps', reps: count })

export const seconds = (duration: number): Target => ({ kind: 'duration', seconds: duration })

export const oct = (day: number, hour = 10, minute = 0) => new Date(2026, 9, day, hour, minute).getTime()

export const done = (weight: number | null, amount: number): SetLog => ({ weight, amount, done: true })

export const open = (weight: number | null, amount: number): SetLog => ({ weight, amount, done: false })

export function exercise(name: string, sets: SetLog[], target: Target = reps(10)): WorkoutExercise {
  return { name, target, sets, skipped: false, tip: '', note: '' }
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
        items: exercises.map((workoutExercise, index) => ({ id: `i${index}`, exercises: [workoutExercise] })),
      },
    ],
  }
}

type ExerciseInput = Pick<RoutineExercise, 'name' | 'target'> & Partial<Pick<RoutineExercise, 'weight' | 'tip'>>

export const routineExercise = ({ name, target, weight = null, tip = '' }: ExerciseInput): RoutineExercise => ({
  name,
  target,
  weight,
  tip,
})

export function routine(id: string, name: string, exercises: ExerciseInput[][], sets = 3): Routine {
  return {
    id,
    name,
    updatedAt: 0,
    sections: [
      {
        id: `${id}-s1`,
        name: 'עיקרי',
        sets,
        items: exercises.map((item, index) => ({ id: `${id}-i${index}`, sets: null, exercises: item.map(routineExercise) })),
      },
    ],
  }
}
