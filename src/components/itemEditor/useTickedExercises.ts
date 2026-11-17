import { useState } from 'react'
import type { RoutineExercise } from '../../domain/types'

export function useTickedExercises() {
  const [ticked, setTicked] = useState<RoutineExercise[]>([])

  const isTicked = (name: string) => ticked.some((exercise) => exercise.name === name)

  function toggle(exercise: RoutineExercise) {
    setTicked((current) =>
      current.some((entry) => entry.name === exercise.name)
        ? current.filter((entry) => entry.name !== exercise.name)
        : [...current, exercise],
    )
  }

  return { ticked, isTicked, toggle, clear: () => setTicked([]) }
}
