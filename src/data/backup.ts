import type {
  Routine,
  RoutineExercise,
  RoutineItem,
  RoutineSection,
  SetLog,
  Target,
  Workout,
  WorkoutExercise,
  WorkoutItem,
  WorkoutSection,
} from '../domain/types'
import { db } from './db'

export type Backup = { version: 1; exportedAt: number; routines: Routine[]; workouts: Workout[] }

type Guard<T> = (value: unknown) => value is T

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null

const isString = (value: unknown): value is string => typeof value === 'string'

const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)

const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean'

const arrayOf =
  <T>(guard: Guard<T>): Guard<T[]> =>
  (value: unknown): value is T[] =>
    Array.isArray(value) && value.every(guard)

function isTarget(value: unknown): value is Target {
  if (!isObject(value)) {
    return false
  }

  return (value.kind === 'reps' && isNumber(value.reps)) || (value.kind === 'duration' && isNumber(value.seconds))
}

const isRoutineExercise = (v: unknown): v is RoutineExercise => isObject(v) && isString(v.name) && isTarget(v.target)

const isRoutineItem = (v: unknown): v is RoutineItem =>
  isObject(v) && isString(v.id) && arrayOf(isRoutineExercise)(v.exercises)

const isRoutineSection = (v: unknown): v is RoutineSection =>
  isObject(v) && isString(v.id) && isString(v.name) && isNumber(v.sets) && arrayOf(isRoutineItem)(v.items)

const isRoutine = (v: unknown): v is Routine =>
  isObject(v) && isString(v.id) && isString(v.name) && isNumber(v.updatedAt) && arrayOf(isRoutineSection)(v.sections)

const isSetLog = (v: unknown): v is SetLog =>
  isObject(v) && (v.weight === null || isNumber(v.weight)) && isNumber(v.amount) && isBoolean(v.done)

const isWorkoutExercise = (v: unknown): v is WorkoutExercise =>
  isObject(v) && isString(v.name) && isTarget(v.target) && arrayOf(isSetLog)(v.sets) && isBoolean(v.skipped)

const isWorkoutItem = (v: unknown): v is WorkoutItem =>
  isObject(v) && isString(v.id) && arrayOf(isWorkoutExercise)(v.exercises)

const isWorkoutSection = (v: unknown): v is WorkoutSection =>
  isObject(v) && isString(v.name) && arrayOf(isWorkoutItem)(v.items)

const isWorkout = (v: unknown): v is Workout =>
  isObject(v) &&
  isString(v.id) &&
  isString(v.routineId) &&
  isString(v.routineName) &&
  isNumber(v.startedAt) &&
  (v.finishedAt === null || isNumber(v.finishedAt)) &&
  isString(v.summary) &&
  arrayOf(isWorkoutSection)(v.sections)

const isBackup = (v: unknown): v is Backup =>
  isObject(v) &&
  v.version === 1 &&
  isNumber(v.exportedAt) &&
  arrayOf(isRoutine)(v.routines) &&
  arrayOf(isWorkout)(v.workouts)

export function parseBackup(json: unknown): Backup {
  if (!isBackup(json)) {
    throw new Error('קובץ הגיבוי לא תקין')
  }

  return json
}

export async function exportBackup(now: number): Promise<Backup> {
  const [routines, workouts] = await Promise.all([db.routines.toArray(), db.workouts.toArray()])

  return { version: 1, exportedAt: now, routines, workouts }
}

export async function restoreBackup(backup: Backup): Promise<void> {
  await db.transaction('rw', db.routines, db.workouts, async () => {
    await db.routines.clear()
    await db.workouts.clear()
    await db.routines.bulkPut(backup.routines)
    await db.workouts.bulkPut(backup.workouts)
  })
}
