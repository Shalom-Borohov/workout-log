import { startWorkout } from '../domain/progress'
import type { Routine, Workout } from '../domain/types'
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

export async function saveWorkout(workout: Workout) {
  await db.workouts.put(workout)
}

export async function deleteWorkout(id: string) {
  await db.workouts.delete(id)
}

export function finishedWorkouts(): Promise<Workout[]> {
  return db.workouts.where('finishedAt').above(0).reverse().sortBy('startedAt')
}

export function activeWorkout(): Promise<Workout | undefined> {
  return db.workouts
    .orderBy('startedAt')
    .reverse()
    .filter((w) => w.finishedAt === null)
    .first()
}

export function beginWorkout(routine: Routine): Promise<Workout> {
  return db.transaction('rw', db.workouts, async () => {
    const active = await activeWorkout()
    if (active) {
      return active
    }
    const workout = startWorkout(routine, await finishedWorkouts(), Date.now(), () => crypto.randomUUID())
    await saveWorkout(workout)

    return workout
  })
}
