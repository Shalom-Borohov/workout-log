import { useEffect, useRef, useState } from 'react'
import { readRestSeconds, readRestSound, saveRestSeconds, saveRestSound } from '../../data/restSettings'
import { stepRest } from '../../domain/rest'
import { SECOND_MS } from '../../domain/time'
import { playRestSound, unlockRestSound } from './restSound'

const LATE_SOUND_MS = 2 * SECOND_MS

export type Rest = { endsAt: number; ended: boolean }

export type RestTimer = ReturnType<typeof useRestTimer>

export function useRestTimer() {
  const [rest, setRest] = useState<Rest | null>(null)
  const [seconds, setSeconds] = useState(readRestSeconds)
  const [sound, setSound] = useState(readRestSound)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  function schedule(endsAt: number) {
    clearTimeout(timer.current)
    setRest({ endsAt, ended: false })
    timer.current = setTimeout(() => {
      if (readRestSound() && Date.now() - endsAt < LATE_SOUND_MS) {
        playRestSound()
      }
      setRest({ endsAt, ended: true })
    }, endsAt - Date.now())
  }

  function start() {
    if (sound) {
      unlockRestSound()
    }
    schedule(Date.now() + seconds * SECOND_MS)
  }

  function stop() {
    clearTimeout(timer.current)
    setRest(null)
  }

  function adjust(direction: 1 | -1) {
    const next = stepRest(seconds, direction)

    setSeconds(next)
    saveRestSeconds(next)

    if (rest && !rest.ended) {
      schedule(Math.max(rest.endsAt + (next - seconds) * SECOND_MS, Date.now()))
    }
  }

  function toggleSound() {
    if (!sound) {
      unlockRestSound()
    }
    setSound(!sound)
    saveRestSound(!sound)
  }

  useEffect(() => () => clearTimeout(timer.current), [])

  return { rest, seconds, sound, start, stop, adjust, toggleSound }
}
