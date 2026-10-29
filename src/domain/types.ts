export type Target = { kind: 'reps'; reps: number } | { kind: 'duration'; seconds: number }

export interface RoutineExercise {
  name: string
  target: Target
  weight: number | null
  tip: string
}

export interface RoutineItem {
  id: string
  sets: number | null
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
  createdAt: number
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
  tip: string
  note: string
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

export interface BackgroundSetting {
  key: 'background'
  image: Blob
}
