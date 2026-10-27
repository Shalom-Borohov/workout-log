import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './db'
import { activeWorkout, finishedWorkouts } from './repo'

export function useRoutines() {
  return useLiveQuery(() => db.routines.orderBy('name').toArray())
}

export function useRoutine(id: string) {
  return useLiveQuery(() => db.routines.get(id), [id])
}

export function useWorkout(id: string) {
  return useLiveQuery(() => db.workouts.get(id), [id])
}

export function useFinishedWorkouts() {
  return useLiveQuery(finishedWorkouts)
}

export function useActiveWorkout() {
  return useLiveQuery(async () => (await activeWorkout()) ?? null)
}
