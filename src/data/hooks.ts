import { liveQuery } from 'dexie'
import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useState } from 'react'
import { background } from './background'
import { backupStatus } from './backupStatus'
import { db } from './db'
import { activityDetailsMap } from './activityDetails'
import { exerciseAreaMap } from './exerciseAreas'
import { activeWorkout, dailyLogs, finishedRecords, finishedWorkouts } from './repo'
import { restoreUndo } from './restore'

export function useRoutines() {
  return useLiveQuery(async () =>
    (await db.routines.toArray()).sort((first, second) => second.createdAt - first.createdAt),
  )
}

export function useRoutine(id: string) {
  return useLiveQuery(() => db.routines.get(id), [id])
}

export function useWorkout(id: string) {
  return useLiveQuery(() => db.workouts.get(id), [id])
}

export function useWorkoutLookup(id: string) {
  return useLiveQuery(async () => ({ workout: await db.workouts.get(id) }), [id])
}

export function useFinishedWorkouts() {
  return useLiveQuery(finishedWorkouts)
}

export function useFinishedRecords() {
  return useLiveQuery(finishedRecords)
}

export function useDailyLogs() {
  return useLiveQuery(dailyLogs)
}

export function useActiveWorkout() {
  return useLiveQuery(async () => (await activeWorkout()) ?? null)
}

export function useBackupStatus() {
  return useLiveQuery(backupStatus)
}

export function useRestoreUndo(now: number) {
  return useLiveQuery(() => restoreUndo(now), [now])
}

export function useExerciseAreas() {
  return useLiveQuery(exerciseAreaMap)
}

export function useActivityDetails() {
  return useLiveQuery(activityDetailsMap)
}

export function useBackground() {
  return useLiveQuery(background)
}

export function useBackgroundUrl(): string | null {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    let current: string | null = null

    const release = () => {
      if (current) {
        URL.revokeObjectURL(current)
      }
    }

    const subscription = liveQuery(background).subscribe((setting) => {
      release()
      current = setting ? URL.createObjectURL(setting.image) : null
      setUrl(current)
    })

    return () => {
      subscription.unsubscribe()
      release()
    }
  }, [])

  return url
}
