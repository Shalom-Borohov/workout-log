import { APP_COPY } from '../copy/app'
import type { Routine, SetLog, Target, Workout } from '../domain/types'
import { db } from './db'
import {
  type LegacyRoutine,
  type LegacyRoutineExercise,
  type LegacyRoutineItem,
  type LegacyRoutineSection,
  type LegacyWorkout,
  type LegacyWorkoutExercise,
  type LegacyWorkoutItem,
  type LegacyWorkoutSection,
  upgradeRoutine,
  upgradeWorkout,
} from './migrate'

export type Backup = { version: 1; exportedAt: number; routines: Routine[]; workouts: Workout[] }

type LegacyBackup = { version: 1; exportedAt: number; routines: LegacyRoutine[]; workouts: LegacyWorkout[] }

type Guard<T> = (value: unknown) => value is T

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null

const isString = (value: unknown): value is string => typeof value === 'string'

const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)

const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean'

const isNumberOrNull = (value: unknown): value is number | null => value === null || isNumber(value)

const optional =
  <T>(guard: Guard<T>): Guard<T | undefined> =>
  (value: unknown): value is T | undefined =>
    value === undefined || guard(value)

const arrayOf =
  <T>(guard: Guard<T>): Guard<T[]> =>
  (list: unknown): list is T[] =>
    Array.isArray(list) && list.every(guard)

function isTarget(target: unknown): target is Target {
  if (!isObject(target)) {
    return false
  }

  return (target.kind === 'reps' && isNumber(target.reps)) || (target.kind === 'duration' && isNumber(target.seconds))
}

const isRoutineExercise = (exercise: unknown): exercise is LegacyRoutineExercise =>
  isObject(exercise) &&
  isString(exercise.name) &&
  isTarget(exercise.target) &&
  optional(isNumberOrNull)(exercise.weight) &&
  optional(isString)(exercise.tip)

const isRoutineItem = (item: unknown): item is LegacyRoutineItem =>
  isObject(item) &&
  isString(item.id) &&
  optional(isNumberOrNull)(item.sets) &&
  arrayOf(isRoutineExercise)(item.exercises)

const isRoutineSection = (section: unknown): section is LegacyRoutineSection =>
  isObject(section) &&
  isString(section.id) &&
  isString(section.name) &&
  isNumber(section.sets) &&
  arrayOf(isRoutineItem)(section.items)

const isRoutine = (routine: unknown): routine is LegacyRoutine =>
  isObject(routine) &&
  isString(routine.id) &&
  isString(routine.name) &&
  optional(isNumber)(routine.createdAt) &&
  isNumber(routine.updatedAt) &&
  arrayOf(isRoutineSection)(routine.sections)

const isSetLog = (set: unknown): set is SetLog =>
  isObject(set) && isNumberOrNull(set.weight) && isNumber(set.amount) && isBoolean(set.done)

const isWorkoutExercise = (exercise: unknown): exercise is LegacyWorkoutExercise =>
  isObject(exercise) &&
  isString(exercise.name) &&
  isTarget(exercise.target) &&
  arrayOf(isSetLog)(exercise.sets) &&
  isBoolean(exercise.skipped) &&
  optional(isString)(exercise.tip) &&
  optional(isString)(exercise.note)

const isWorkoutItem = (item: unknown): item is LegacyWorkoutItem =>
  isObject(item) && isString(item.id) && arrayOf(isWorkoutExercise)(item.exercises)

const isWorkoutSection = (section: unknown): section is LegacyWorkoutSection =>
  isObject(section) && isString(section.name) && arrayOf(isWorkoutItem)(section.items)

const isWorkout = (workout: unknown): workout is LegacyWorkout =>
  isObject(workout) &&
  isString(workout.id) &&
  isString(workout.routineId) &&
  isString(workout.routineName) &&
  isNumber(workout.startedAt) &&
  isNumberOrNull(workout.finishedAt) &&
  isString(workout.summary) &&
  arrayOf(isWorkoutSection)(workout.sections)

const isBackup = (backup: unknown): backup is LegacyBackup =>
  isObject(backup) &&
  backup.version === 1 &&
  isNumber(backup.exportedAt) &&
  arrayOf(isRoutine)(backup.routines) &&
  arrayOf(isWorkout)(backup.workouts)

export function parseBackup(json: unknown): Backup {
  if (!isBackup(json)) {
    throw new Error(APP_COPY.invalidBackup)
  }

  return { ...json, routines: json.routines.map(upgradeRoutine), workouts: json.workouts.map(upgradeWorkout) }
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
