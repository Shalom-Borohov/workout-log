import { useMemo, useRef, useState } from 'react'
import { useFinishedWorkouts } from '../../data/hooks'
import { saveWorkout } from '../../data/repo'
import { previousExerciseLookup } from '../../domain/progress'
import type { SetLog, Workout } from '../../domain/types'
import {
  currentIndex,
  editSet,
  firstUnfinished,
  isDone,
  isSkipped,
  itemAt,
  itemRefs,
  nextUnfinished,
  toggleSkip,
} from '../../domain/workoutEdits'
import { followIndex } from '../../domain/workoutStructure'
import { useSave } from '../../hooks/useSave'
import { ignoreTapsFor } from '../../navigation/tapGuard'
import { useRestTimer } from './useRestTimer'

const AFTER_ADVANCE_TAPS_IGNORED_MS = 300

export type Travel = 'next' | 'prev' | null

type Position = { index: number; travel: Travel }

export function useLiveWorkout(initial: Workout) {
  const [workout, setWorkout] = useState(initial)
  const latest = useRef(initial)
  const stored = useRef(initial)
  const { saveFailed } = useSave()
  const [{ index, travel }, setPosition] = useState<Position>(() => ({ index: firstUnfinished(initial), travel: null }))
  const refs = itemRefs(workout)
  const total = refs.length
  const ref = refs[index]
  const item = itemAt(workout, ref)
  const active = workout.finishedAt === null
  const history = useFinishedWorkouts()
  const restTimer = useRestTimer(initial.id)

  const previous = useMemo(
    () => history && previousExerciseLookup(history, workout.startedAt),
    [history, workout.startedAt],
  )

  async function saveOrTakeBack(before: Workout, next: Workout) {
    try {
      await saveWorkout(next)
      stored.current = next
    } catch {
      if (latest.current !== next) {
        return
      }

      latest.current = stored.current
      setWorkout(stored.current)
      setPosition({ index: followIndex(before, stored.current, index), travel: null })
      saveFailed()
    }
  }

  function apply(edit: (current: Workout) => Workout) {
    const before = latest.current
    const next = edit(before)

    latest.current = next
    setWorkout(next)
    setPosition((position) => {
      const kept = followIndex(before, next, position.index)

      return kept === position.index ? position : { index: kept, travel: null }
    })
    void saveOrTakeBack(before, next)
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
      return
    }
    restTimer.start()

    if (isDone(itemAt(latest.current, ref))) {
      moveOn()
    }
  }

  function toggleItemSkip() {
    apply((current) => toggleSkip(current, ref))

    if (active && isSkipped(itemAt(latest.current, ref))) {
      moveOn()
    }
  }

  function moveOn() {
    const next = nextUnfinished(latest.current, index)

    if (next !== null) {
      ignoreTapsFor(AFTER_ADVANCE_TAPS_IGNORED_MS)
      move(next)
    }
  }

  function finish(summary: string): Promise<void> {
    return saveWorkout({ ...latest.current, summary, finishedAt: Date.now() })
  }

  return {
    workout,
    index,
    travel,
    total,
    ref,
    item,
    active,
    previous,
    restTimer,
    apply,
    move,
    step,
    changeSet,
    toggleItemSkip,
    finish,
  }
}
