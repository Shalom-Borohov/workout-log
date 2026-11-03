import { isRoutineWorkout } from '../domain/activities'
import { startWorkout } from '../domain/progress'
import type { DailyLog, Routine, Workout, WorkoutRecord } from '../domain/types'
import { db } from './db'

export async function saveRoutine(routine: Routine) {
  await db.routines.put(routine)
}

export async function updateRoutine(id: string, change: (routine: Routine) => Routine) {
  await db.transaction('rw', db.routines, async () => {
    const current = await db.routines.get(id)

    if (current) {
      await saveRoutine({ ...change(current), updatedAt: Date.now() })
    }
  })
}

export async function deleteRoutine(id: string) {
  await db.routines.delete(id)
}

export async function saveRecord(record: WorkoutRecord) {
  await db.workouts.put(record)
}

export async function saveWorkout(workout: Workout) {
  await saveRecord(workout)
}

export async function deleteWorkout(id: string) {
  await db.workouts.delete(id)
}

export function finishedRecords(): Promise<WorkoutRecord[]> {
  return db.workouts.where('finishedAt').above(0).reverse().sortBy('startedAt')
}

export async function finishedWorkouts(): Promise<Workout[]> {
  return (await finishedRecords()).filter(isRoutineWorkout)
}

export function activeWorkout(): Promise<Workout | undefined> {
  return db.workouts
    .orderBy('startedAt')
    .reverse()
    .filter((record): record is Workout => record.kind === 'routine' && record.finishedAt === null)
    .first()
}

async function freshWorkout(routine: Routine, startedAt: number): Promise<Workout> {
  return startWorkout(routine, await finishedWorkouts(), startedAt, () => crypto.randomUUID())
}

export function beginWorkout(routine: Routine): Promise<Workout> {
  return db.transaction('rw', db.workouts, async () => {
    const active = await activeWorkout()
    if (active) {
      return active
    }
    const workout = await freshWorkout(routine, Date.now())
    await saveWorkout(workout)

    return workout
  })
}

export async function addPastWorkout(routine: Routine, startedAt: number, durationMs: number): Promise<Workout> {
  const workout = { ...(await freshWorkout(routine, startedAt)), finishedAt: startedAt + durationMs }

  await saveWorkout(workout)

  return workout
}

export async function toggleDailyLog(log: DailyLog) {
  await db.transaction('rw', db.dailyLogs, async () => {
    if (await db.dailyLogs.get(log.id)) {
      await db.dailyLogs.delete(log.id)
    } else {
      await db.dailyLogs.put(log)
    }
  })
}

export function dailyLogs(): Promise<DailyLog[]> {
  return db.dailyLogs.toArray()
}
