import { useState } from 'react'
import { readRestSeconds, readRestSound, saveRestSeconds, saveRestSound } from '../../data/restSettings'
import { stepRest } from '../../domain/rest'
import { SECOND_MS } from '../../domain/time'
import { moveRest, startRest, useRunningRest } from '../../rest/restClock'
import { unlockRestSound } from '../../rest/restSound'

export type RestTimer = ReturnType<typeof useRestTimer>

export function useRestTimer(workoutId: string) {
  const running = useRunningRest()
  const rest = running?.workoutId === workoutId ? running : null
  const [seconds, setSeconds] = useState(readRestSeconds)
  const [sound, setSound] = useState(readRestSound)

  function start() {
    if (sound) {
      unlockRestSound()
    }
    startRest(workoutId, seconds)
  }

  function adjust(direction: 1 | -1) {
    const next = stepRest(seconds, direction)

    setSeconds(next)
    saveRestSeconds(next)
    moveRest((next - seconds) * SECOND_MS)
  }

  function toggleSound() {
    if (!sound) {
      unlockRestSound()
    }
    setSound(!sound)
    saveRestSound(!sound)
  }

  return { rest, seconds, sound, start, adjust, toggleSound }
}
