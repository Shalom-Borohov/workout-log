import { APP_COPY } from '../copy/app'
import { dailyLogId } from '../domain/daily'
import type { DailyLog, Routine, SetLog, Target, WorkoutRecord } from '../domain/types'
import { db } from './db'
import {
  type LegacyActivity,
  type LegacyRecord,
  type LegacyRoutine,
  type LegacyRoutineExercise,
  type LegacyRoutineItem,
  type LegacyRoutineSection,
  type LegacyWorkout,
  type LegacyWorkoutExercise,
  type LegacyWorkoutItem,
  type LegacyWorkoutSection,
  upgradeRecord,
  upgradeRoutine,
} from './migrate'

export type Backup = { version: 1; exportedAt: number; routines: Routine[]; workouts: WorkoutRecord[]; dailyLogs: DailyLog[] }

type LegacyBackup = {
  version: 1
  exportedAt: number
  routines: LegacyRoutine[]
  workouts: LegacyRecord[]
  dailyLogs?: DailyLog[]
}

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
  optional(isBoolean)(routine.daily) &&
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
  (workout.kind === undefined || workout.kind === 'routine') &&
  isString(workout.id) &&
  isString(workout.routineId) &&
  isString(workout.routineName) &&
  isNumber(workout.startedAt) &&
  isNumberOrNull(workout.finishedAt) &&
  isString(workout.summary) &&
  arrayOf(isWorkoutSection)(workout.sections)

const isActivity = (activity: unknown): activity is LegacyActivity =>
  isObject(activity) &&
  activity.kind === 'activity' &&
  isString(activity.id) &&
  isString(activity.name) &&
  isNumber(activity.startedAt) &&
  isNumber(activity.finishedAt) &&
  isString(activity.summary) &&
  optional(isString)(activity.location)

const isRecord = (record: unknown): record is LegacyRecord => isActivity(record) || isWorkout(record)

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

const isDailyLog = (log: unknown): log is DailyLog =>
  isObject(log) &&
  isString(log.routineId) &&
  isString(log.date) &&
  ISO_DATE.test(log.date) &&
  log.id === dailyLogId(log.routineId, log.date)

const isBackup = (backup: unknown): backup is LegacyBackup =>
  isObject(backup) &&
  backup.version === 1 &&
  isNumber(backup.exportedAt) &&
  arrayOf(isRoutine)(backup.routines) &&
  arrayOf(isRecord)(backup.workouts) &&
  optional(arrayOf(isDailyLog))(backup.dailyLogs)

export function parseBackup(json: unknown): Backup {
  if (!isBackup(json)) {
    throw new Error(APP_COPY.invalidBackup)
  }

  return {
    ...json,
    routines: json.routines.map(upgradeRoutine),
    workouts: json.workouts.map(upgradeRecord),
    dailyLogs: json.dailyLogs ?? [],
  }
}

export async function exportBackup(now: number): Promise<Backup> {
  const [routines, workouts, dailyLogs] = await Promise.all([
    db.routines.toArray(),
    db.workouts.toArray(),
    db.dailyLogs.toArray(),
  ])

  return { version: 1, exportedAt: now, routines, workouts, dailyLogs }
}

export async function restoreBackup(backup: Backup): Promise<void> {
  await db.transaction('rw', db.routines, db.workouts, db.dailyLogs, async () => {
    await db.routines.clear()
    await db.workouts.clear()
    await db.dailyLogs.clear()
    await db.routines.bulkPut(backup.routines)
    await db.workouts.bulkPut(backup.workouts)
    await db.dailyLogs.bulkPut(backup.dailyLogs)
  })
}
