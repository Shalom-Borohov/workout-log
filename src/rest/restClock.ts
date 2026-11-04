import { useEffect, useSyncExternalStore } from 'react'
import { useActiveWorkout } from '../data/hooks'
import { readRestSound } from '../data/restSettings'
import { clearRunningRest, readRunningRest, type RunningRest, saveRunningRest } from '../data/runningRest'
import { SECOND_MS } from '../domain/time'
import { currentIndex } from '../domain/workoutEdits'
import { useWakeLock } from '../hooks/useWakeLock'
import { playRestSound, relockRestSound, unlockRestSound } from './restSound'

const LATE_SOUND_MS = 2 * SECOND_MS

export interface Rest extends RunningRest {
  ended: boolean
}

let rest: Rest | null = null
let timer: ReturnType<typeof setTimeout> | undefined
const listeners = new Set<() => void>()

const sameRest = (a: Rest | null, b: Rest | null) =>
  a === b || (a !== null && b !== null && a.workoutId === b.workoutId && a.endsAt === b.endsAt && a.ended === b.ended)

function publish(next: Rest | null) {
  if (sameRest(rest, next)) {
    return
  }
  rest = next
  listeners.forEach((listener) => listener())
}

function schedule(running: RunningRest) {
  clearTimeout(timer)
  publish({ ...running, ended: false })
  timer = setTimeout(() => {
    if (readRestSound() && Date.now() - running.endsAt < LATE_SOUND_MS) {
      playRestSound()
    }
    publish({ ...running, ended: true })
  }, running.endsAt - Date.now())
}

function stopRest() {
  clearTimeout(timer)
  clearRunningRest()
  publish(null)
}

function syncRest() {
  const running = readRunningRest()

  if (!running) {
    stopRest()
  } else if (Date.now() < running.endsAt) {
    schedule(running)
  } else {
    clearTimeout(timer)
    publish({ ...running, ended: true })
  }
}

export function startRest(workoutId: string, seconds: number) {
  const running = { workoutId, endsAt: Date.now() + seconds * SECOND_MS }

  saveRunningRest(running)
  schedule(running)
}

export function moveRest(deltaMs: number) {
  if (!rest || rest.ended) {
    return
  }
  const running = { workoutId: rest.workoutId, endsAt: Math.max(rest.endsAt + deltaMs, Date.now()) }

  saveRunningRest(running)
  schedule(running)
}

function onVisibility() {
  if (document.visibilityState === 'hidden') {
    clearTimeout(timer)
    relockRestSound()
  } else {
    syncRest()
  }
}

export function RestClock() {
  const active = useActiveWorkout()
  const running = useRunningRest()

  useWakeLock(running !== null && !running.ended)

  useEffect(() => {
    syncRest()
    document.addEventListener('visibilitychange', onVisibility)

    if (rest && !rest.ended && readRestSound()) {
      document.addEventListener('pointerup', unlockRestSound, { once: true })
    }

    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      document.removeEventListener('pointerup', unlockRestSound)
      clearTimeout(timer)
      relockRestSound()
      publish(null)
    }
  }, [])

  useEffect(() => {
    if (rest && active !== undefined && (active?.id !== rest.workoutId || currentIndex(active) === null)) {
      stopRest()
    }
  }, [active])

  return null
}

function subscribe(listener: () => void) {
  listeners.add(listener)

  return () => listeners.delete(listener)
}

export const useRunningRest = () => useSyncExternalStore(subscribe, () => rest)
