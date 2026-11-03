import { useMemo, useRef, useState } from 'react'
import { useFinishedWorkouts } from '../../data/hooks'
import { saveWorkout } from '../../data/repo'
import { previousExerciseLookup } from '../../domain/progress'
import type { SetLog, Workout } from '../../domain/types'
import { currentIndex, editSet, firstUnfinished, isDone, itemAt, itemRefs, nextUnfinished } from '../../domain/workoutEdits'
import { followIndex } from '../../domain/workoutStructure'
import { useRestTimer } from './useRestTimer'

export type Travel = 'next' | 'prev' | null

type Position = { index: number; travel: Travel }

export function useLiveWorkout(initial: Workout) {
  const [workout, setWorkout] = useState(initial)
  const latest = useRef(initial)
  const [{ index, travel }, setPosition] = useState<Position>(() => ({ index: firstUnfinished(initial), travel: null }))
  const refs = itemRefs(workout)
  const total = refs.length
  const ref = refs[index]
  const item = itemAt(workout, ref)
  const active = workout.finishedAt === null
  const history = useFinishedWorkouts()
  const restTimer = useRestTimer()

  const previous = useMemo(
    () => history && previousExerciseLookup(history, workout.startedAt),
    [history, workout.startedAt],
  )

  function apply(edit: (current: Workout) => Workout) {
    const before = latest.current
    const next = edit(before)

    latest.current = next
    setWorkout(next)
    setPosition((position) => {
      const kept = followIndex(before, next, position.index)

      return kept === position.index ? position : { index: kept, travel: null }
    })
    void saveWorkout(next)
  }

  function move(next: number) {
    setPosition((position) => ({ index: next, travel: next > position.index ? 'next' : 'prev' }))
  }

  function step(delta: 1 | -1) {
    const next = index + delta

    if (next >= 0 && next < total) {
      move(next)
    }
  }

  function changeSet(exercise: number, set: number, patch: Partial<SetLog>) {
    apply((current) => editSet(current, ref, exercise, set, patch))

    if (patch.done !== true || !active) {
      return
    }

    if (currentIndex(latest.current) === null) {
      restTimer.stop()

      return
    }
    restTimer.start()

    if (!isDone(itemAt(latest.current, ref))) {
      return
    }
    const next = nextUnfinished(latest.current, index)

    if (next !== null) {
      move(next)
    }
  }

  function finish(summary: string): Promise<void> {
    return saveWorkout({ ...latest.current, summary, finishedAt: Date.now() })
  }

  return { workout, index, travel, total, ref, item, active, previous, restTimer, apply, move, step, changeSet, finish }
}
