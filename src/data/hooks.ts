import { liveQuery } from 'dexie'
import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useState } from 'react'
import { BACKGROUND_KEY } from './background'
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

export function useBackground() {
  return useLiveQuery(() => db.settings.get(BACKGROUND_KEY))
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

    const subscription = liveQuery(() => db.settings.get(BACKGROUND_KEY)).subscribe((setting) => {
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
