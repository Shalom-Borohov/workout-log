import { bestSet, type ExerciseSession } from './progress'
import type { Target } from './types'

const MIN_BAR_FRACTION = 1 / 3

type Measure = 'weight' | Target['kind']

type Measured = { id: string; measure: Measure; value: number }

function measured(session: ExerciseSession): Measured | null {
  const best = bestSet(session.sets)
  if (!best) {
    return null
  }

  return {
    id: session.workoutId,
    measure: best.weight !== null ? 'weight' : session.target.kind,
    value: best.weight ?? best.amount,
  }
}

function byMeasure(values: Measured[]): Measured[][] {
  const groups = new Map<Measure, Measured[]>()
  for (const entry of values) {
    const group = groups.get(entry.measure)
    if (group) {
      group.push(entry)
    } else {
      groups.set(entry.measure, [entry])
    }
  }

  return [...groups.values()]
}

function groupFractions(group: Measured[]): [string, number][] {
  const values = group.map(({ value }) => value)
  const min = Math.min(...values)
  const max = Math.max(...values)

  return group.map(({ id, value }) => [
    id,
    max === min ? 1 : MIN_BAR_FRACTION + ((value - min) / (max - min)) * (1 - MIN_BAR_FRACTION),
  ])
}

export function sessionBarFractions(sessions: ExerciseSession[]): Map<string, number> {
  const values = sessions.flatMap((session) => {
    const entry = measured(session)

    return entry ? [entry] : []
  })

  return new Map(byMeasure(values).flatMap(groupFractions))
}
