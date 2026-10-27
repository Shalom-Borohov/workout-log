export type Target = { kind: 'reps'; reps: number } | { kind: 'duration'; seconds: number }

export interface RoutineExercise {
  name: string
  target: Target
}

export interface RoutineItem {
  id: string
  exercises: RoutineExercise[]
}

export interface RoutineSection {
  id: string
  name: string
  sets: number
  items: RoutineItem[]
}

export interface Routine {
  id: string
  name: string
  sections: RoutineSection[]
  updatedAt: number
}

export interface SetLog {
  weight: number | null
  amount: number
  done: boolean
}

export interface WorkoutExercise {
  name: string
  target: Target
  sets: SetLog[]
  skipped: boolean
}

export interface WorkoutItem {
  id: string
  exercises: WorkoutExercise[]
}

export interface WorkoutSection {
  name: string
  items: WorkoutItem[]
}

export interface Workout {
  id: string
  routineId: string
  routineName: string
  startedAt: number
  finishedAt: number | null
  summary: string
  sections: WorkoutSection[]
}
