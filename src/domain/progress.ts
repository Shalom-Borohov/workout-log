import { itemSets } from './routineEdit'
import type { Routine, RoutineExercise, SetLog, Target, Workout, WorkoutExercise } from './types'

const LOCALE = 'he'

export function targetAmount(target: Target): number {
  return target.kind === 'reps' ? target.reps : target.seconds
}

export function exercisesOf<E>(plan: { sections: { items: { exercises: E[] }[] }[] }): E[] {
  return plan.sections.flatMap((section) => section.items).flatMap((item) => item.exercises)
}

export function completedSets(exercise: WorkoutExercise): SetLog[] {
  return exercise.skipped ? [] : exercise.sets.filter((set) => set.done)
}

export type ExerciseSession = { workoutId: string; startedAt: number; target: Target; sets: SetLog[]; note: string }

function sessionOf(workout: Workout, name: string): ExerciseSession | null {
  const matching = exercisesOf(workout).filter((exercise) => exercise.name === name)
  const sets = matching.flatMap(completedSets)

  const note = matching
    .map((exercise) => exercise.note)
    .filter((exerciseNote) => exerciseNote !== '')
    .join('\n')

  return sets.length > 0 ? { workoutId: workout.id, startedAt: workout.startedAt, target: matching[0].target, sets, note } : null
}

export function exerciseHistory(history: Workout[], name: string): ExerciseSession[] {
  return chronological(history, Infinity)
    .reverse()
    .flatMap((workout) => {
      const session = sessionOf(workout, name)

      return session ? [session] : []
    })
}

type LookupKey = Pick<RoutineExercise, 'name' | 'target'>

export type PreviousLookup = (exercise: LookupKey) => SetLog[] | null

export type PreviousSessionLookup = (exercise: LookupKey) => ExerciseSession | null

export function previousSessionLookup(history: Workout[], before: number): PreviousSessionLookup {
  const latest = latestSessions(chronological(history, before))

  return (exercise) => {
    const last = latest.get(exercise.name)

    return last && last.target.kind === exercise.target.kind ? last : null
  }
}

export function setsOf(lookup: PreviousSessionLookup): PreviousLookup {
  return (exercise) => {
    const last = lookup(exercise)

    return last && last.sets
  }
}

export function previousSetsLookup(history: Workout[], before: number): PreviousLookup {
  return setsOf(previousSessionLookup(history, before))
}

export function prefill(exercise: Pick<RoutineExercise, 'target' | 'weight'>, count: number, last: SetLog[] | null): SetLog[] {
  return Array.from({ length: count }, (_, index) => {
    if (!last) {
      return { weight: exercise.weight, amount: targetAmount(exercise.target), done: false }
    }
    const source = last[index] ?? last[last.length - 1]

    return { weight: source.weight, amount: source.amount, done: false }
  })
}

export function toWorkoutExercise(exercise: RoutineExercise, count: number, previous: PreviousLookup): WorkoutExercise {
  return {
    name: exercise.name,
    target: exercise.target,
    sets: prefill(exercise, count, previous(exercise)),
    skipped: false,
    tip: exercise.tip,
    note: '',
  }
}

export function startWorkout(routine: Routine, history: Workout[], now: number, newId: () => string): Workout {
  const previous = previousSetsLookup(history, now)

  return {
    id: newId(),
    routineId: routine.id,
    routineName: routine.name,
    startedAt: now,
    finishedAt: null,
    summary: '',
    sections: routine.sections.map((section) => ({
      name: section.name,
      items: section.items.map((item) => ({
        id: item.id,
        exercises: item.exercises.map((exercise) => toWorkoutExercise(exercise, itemSets(item, section.sets), previous)),
      })),
    })),
  }
}

function weightRank(weight: number | null): number {
  return weight === null ? -Infinity : weight
}

function beats(candidate: SetLog, current: SetLog): boolean {
  const candidateWeight = weightRank(candidate.weight)
  const currentWeight = weightRank(current.weight)

  return candidateWeight > currentWeight || (candidateWeight === currentWeight && candidate.amount > current.amount)
}

export function bestSet(sets: SetLog[]): SetLog | null {
  return sets.filter((set) => set.done).reduce<SetLog | null>((best, set) => (!best || beats(set, best) ? set : best), null)
}

export type Change = { name: string; kind: 'up' | 'record'; set: SetLog; target: Target }

type ExerciseState = { heaviest: number; previousBest: SetLog }

function changeTracker() {
  const state = new Map<string, ExerciseState>()

  return (workout: Workout): Change[] => {
    const names = [...new Set(exercisesOf(workout).map((exercise) => exercise.name))]

    return names.flatMap((name): Change[] => {
      const session = sessionOf(workout, name)
      const best = session && bestSet(session.sets)
      if (!session || !best) {
        return []
      }
      const earlier = state.get(name)
      const heaviest = Math.max(...session.sets.map((set) => weightRank(set.weight)))

      state.set(name, { heaviest: Math.max(heaviest, earlier ? earlier.heaviest : -Infinity), previousBest: best })
      if (!earlier) {
        return []
      }
      if (best.weight !== null && best.weight > earlier.heaviest) {
        return [{ name, kind: 'record', set: best, target: session.target }]
      }

      return beats(best, earlier.previousBest) ? [{ name, kind: 'up', set: best, target: session.target }] : []
    })
  }
}

function chronological(history: Workout[], before: number): Workout[] {
  return history
    .filter((workout) => workout.finishedAt !== null && workout.startedAt < before)
    .sort((first, second) => first.startedAt - second.startedAt)
}

export type WorkoutWithChanges = Workout & { changes: Change[] }

export function withChanges(history: Workout[]): WorkoutWithChanges[] {
  const track = changeTracker()

  return chronological(history, Infinity)
    .map((workout) => ({ ...workout, changes: track(workout) }))
    .reverse()
}

function weightsOf(sets: SetLog[]): number[] {
  return sets.flatMap((set) => (set.weight === null ? [] : [set.weight]))
}

export function recordSessionId(sessions: ExerciseSession[]): string | null {
  const weights = weightsOf(sessions.flatMap((session) => session.sets))
  if (weights.length === 0) {
    return null
  }
  const max = Math.max(...weights)
  const holders = sessions.filter((session) => session.sets.some((set) => set.weight === max))

  return holders[holders.length - 1].workoutId
}

export type TrendPoint = { startedAt: number; weight: number }

export function weightTrend(sessions: ExerciseSession[]): TrendPoint[] {
  return [...sessions]
    .sort((first, second) => first.startedAt - second.startedAt)
    .flatMap((session) => {
      const weights = weightsOf(session.sets)

      return weights.length > 0 ? [{ startedAt: session.startedAt, weight: Math.max(...weights) }] : []
    })
}

export function latestSessions(history: Workout[]): Map<string, ExerciseSession> {
  const latest = new Map<string, ExerciseSession>()

  for (const workout of chronological(history, Infinity).reverse()) {
    for (const name of new Set(exercisesOf(workout).map((exercise) => exercise.name))) {
      const session = latest.has(name) ? null : sessionOf(workout, name)
      if (session) {
        latest.set(name, session)
      }
    }
  }

  return latest
}

export function exerciseNames(routines: Routine[], workouts: Workout[]): string[] {
  const names = [...routines.flatMap(exercisesOf), ...workouts.flatMap(exercisesOf)].map((exercise) => exercise.name)

  return [...new Set(names)].sort((first, second) => first.localeCompare(second, LOCALE))
}

export function hasExercises(routine: Routine): boolean {
  return routine.sections.some((section) => section.items.length > 0)
}
