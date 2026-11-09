import { APP_COPY } from '../copy/app'
import { AppError } from '../domain/appError'
import { isBodyArea } from '../domain/bodyAreas'
import { dailyLogId } from '../domain/daily'
import { isDrillColor } from '../domain/drillColors'
import type { DailyExercise, DataSnapshot, ExerciseArea, SetLog, Target } from '../domain/types'
import { isNumber, isObject, isString } from './guards'
import { readStoredData } from './storedData'
import {
  carryNotesForward,
  colorDailyRoutines,
  type LegacyActivity,
  type LegacyDailyLog,
  type LegacyRecord,
  type LegacyRoutine,
  type LegacyRoutineExercise,
  type LegacyRoutineItem,
  type LegacyRoutineSection,
  type LegacyWorkout,
  type LegacyWorkoutExercise,
  type LegacyWorkoutItem,
  type LegacyWorkoutSection,
  upgradeDailyLogs,
  upgradeRecord,
  upgradeRoutine,
} from './migrate'

const BACKUP_VERSION = 2

const VERSION_BEFORE_CARRIED_NOTES = 1

export type Backup = DataSnapshot & {
  version: typeof BACKUP_VERSION
  exportedAt: number
}

type LegacyBackup = {
  version: typeof VERSION_BEFORE_CARRIED_NOTES | typeof BACKUP_VERSION
  exportedAt: number
  routines: LegacyRoutine[]
  workouts: LegacyRecord[]
  dailyLogs?: LegacyDailyLog[]
  exerciseAreas?: ExerciseArea[]
}

type Guard<T> = (value: unknown) => value is T

const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean'

const optional =
  <T>(guard: Guard<T>): Guard<T | undefined> =>
  (value: unknown): value is T | undefined =>
    value === undefined || guard(value)

const nullable =
  <T>(guard: Guard<T>): Guard<T | null> =>
  (value: unknown): value is T | null =>
    value === null || guard(value)

const isNumberOrNull = nullable(isNumber)

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
  optional(nullable(isDrillColor))(routine.color) &&
  optional(isBoolean)(routine.archived) &&
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

const isDailyExercise = (exercise: unknown): exercise is DailyExercise =>
  isObject(exercise) && isString(exercise.name) && isNumber(exercise.sets) && isTarget(exercise.target)

const isDailyLog = (log: unknown): log is LegacyDailyLog =>
  isObject(log) &&
  isString(log.routineId) &&
  isString(log.date) &&
  ISO_DATE.test(log.date) &&
  log.id === dailyLogId(log.routineId, log.date) &&
  optional(arrayOf(isDailyExercise))(log.exercises)

const isExerciseArea = (exerciseArea: unknown): exerciseArea is ExerciseArea =>
  isObject(exerciseArea) && isString(exerciseArea.name) && isBodyArea(exerciseArea.area)

const isBackup = (backup: unknown): backup is LegacyBackup =>
  isObject(backup) &&
  (backup.version === VERSION_BEFORE_CARRIED_NOTES || backup.version === BACKUP_VERSION) &&
  isNumber(backup.exportedAt) &&
  arrayOf(isRoutine)(backup.routines) &&
  arrayOf(isRecord)(backup.workouts) &&
  optional(arrayOf(isDailyLog))(backup.dailyLogs) &&
  optional(arrayOf(isExerciseArea))(backup.exerciseAreas)

export function parseBackup(json: unknown): Backup {
  if (!isBackup(json)) {
    throw new AppError(APP_COPY.invalidBackup)
  }

  const workouts = json.workouts.map(upgradeRecord)
  const routines = colorDailyRoutines(json.routines.map(upgradeRoutine))

  return {
    ...json,
    version: BACKUP_VERSION,
    routines,
    workouts: json.version === VERSION_BEFORE_CARRIED_NOTES ? carryNotesForward(workouts) : workouts,
    dailyLogs: upgradeDailyLogs(json.dailyLogs ?? [], routines),
    exerciseAreas: json.exerciseAreas ?? [],
  }
}

export async function exportBackup(now: number): Promise<Backup> {
  return { version: BACKUP_VERSION, exportedAt: now, ...(await readStoredData()) }
}

const countFailing = (guard: (value: unknown) => boolean, records: unknown[]) =>
  records.filter((record) => !guard(record)).length

type ExportedLists = Record<'routines' | 'workouts' | 'dailyLogs' | 'exerciseAreas', unknown[]>

const isExportedLists = (json: unknown): json is ExportedLists =>
  isObject(json) &&
  [json.routines, json.workouts, json.dailyLogs, json.exerciseAreas].every((list) => Array.isArray(list))

export function countBadRecords(fileText: string): number {
  const json: unknown = JSON.parse(fileText)

  if (!isExportedLists(json)) {
    throw new Error(APP_COPY.invalidBackup)
  }

  const { routines, workouts, dailyLogs, exerciseAreas } = json

  return (
    countFailing(isRoutine, routines) +
    countFailing(isRecord, workouts) +
    countFailing(isDailyLog, dailyLogs) +
    countFailing(isExerciseArea, exerciseAreas)
  )
}
