import { isRoutineWorkout } from './activities'
import { itemSets } from './routineEdit'
import type { Routine, RoutineExercise, SetLog, Target, Workout, WorkoutExercise, WorkoutRecord } from './types'

export const LOCALE = 'he'

export function targetAmount(target: Target): number {
  return target.kind === 'reps' ? target.reps : target.seconds
}

export function withTargetAmount(target: Target, amount: number): Target {
  return target.kind === 'reps' ? { kind: 'reps', reps: amount } : { kind: 'duration', seconds: amount }
}

export function exercisesOf<E>(plan: { sections: { items: { exercises: E[] }[] }[] }): E[] {
  return plan.sections.flatMap((section) => section.items).flatMap((item) => item.exercises)
}

export function completedSets(exercise: WorkoutExercise): SetLog[] {
  return exercise.skipped ? [] : exercise.sets.filter((set) => set.done)
}

export type ExerciseSession = { workoutId: string; startedAt: number; target: Target; sets: SetLog[] }

function sessionOf(workout: Workout, name: string): ExerciseSession | null {
  const ticked = exercisesOf(workout).filter((exercise) => exercise.name === name && completedSets(exercise).length > 0)

  return ticked.length > 0
    ? { workoutId: workout.id, startedAt: workout.startedAt, target: ticked[0].target, sets: ticked.flatMap(completedSets) }
    : null
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

export type PreviousExercise = { sets: SetLog[] | null; note: string }

export type PreviousExerciseLookup = (exercise: LookupKey) => PreviousExercise

export const NO_HISTORY: PreviousExerciseLookup = () => ({ sets: null, note: '' })

function latestNotes(workouts: Workout[]): Map<string, string> {
  return new Map(workouts.flatMap(exercisesOf).map((exercise) => [exercise.name, exercise.note]))
}

function targetOnlySets(target: Target): SetLog[] {
  return prefill({ target, weight: null }, 1, null)
}

function setsToPrefillFrom(session: ExerciseSession, target: Target): SetLog[] {
  return session.target.kind === target.kind ? session.sets : targetOnlySets(target)
}

export function previousExerciseLookup(history: Workout[], before: number): PreviousExerciseLookup {
  const workouts = chronological(history, before)
  const sessions = latestSessions(workouts)
  const notes = latestNotes(workouts)

  return (exercise) => {
    const session = sessions.get(exercise.name)
    const note = notes.get(exercise.name)

    return {
      sets: session ? setsToPrefillFrom(session, exercise.target) : null,
      note: note === undefined ? '' : note,
    }
  }
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

export function toWorkoutExercise(exercise: RoutineExercise, count: number, previous: PreviousExerciseLookup): WorkoutExercise {
  const { sets, note } = previous(exercise)

  return {
    name: exercise.name,
    target: exercise.target,
    sets: prefill(exercise, count, sets),
    skipped: false,
    tip: exercise.tip,
    note,
  }
}

export function startWorkout(routine: Routine, history: Workout[], now: number, newId: () => string): Workout {
  const previous = previousExerciseLookup(history, now)

  return {
    kind: 'routine',
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

const CHANGE_KINDS = ['up', 'record'] as const

export type Change = { name: string; kind: (typeof CHANGE_KINDS)[number]; set: SetLog; target: Target }

type ExerciseState = { heaviest: number; previousBest: SetLog; previousKind: Target['kind'] }

function improved(best: SetLog, kind: Target['kind'], earlier: ExerciseState): boolean {
  return kind === earlier.previousKind
    ? beats(best, earlier.previousBest)
    : weightRank(best.weight) > weightRank(earlier.previousBest.weight)
}

function changeTracker() {
  const state = new Map<string, ExerciseState>()

  return (workout: WorkoutRecord): Change[] => {
    if (!isRoutineWorkout(workout)) {
      return []
    }
    const names = [...new Set(exercisesOf(workout).map((exercise) => exercise.name))]

    return names.flatMap((name): Change[] => {
      const session = sessionOf(workout, name)
      const best = session && bestSet(session.sets)
      if (!session || !best) {
        return []
      }
      const earlier = state.get(name)
      const heaviest = Math.max(...session.sets.map((set) => weightRank(set.weight)))

      state.set(name, {
        heaviest: Math.max(heaviest, earlier ? earlier.heaviest : -Infinity),
        previousBest: best,
        previousKind: session.target.kind,
      })
      if (!earlier) {
        return []
      }
      if (best.weight !== null && best.weight > earlier.heaviest) {
        return [{ name, kind: 'record', set: best, target: session.target }]
      }

      return improved(best, session.target.kind, earlier) ? [{ name, kind: 'up', set: best, target: session.target }] : []
    })
  }
}

export function chronological<R extends WorkoutRecord>(history: R[], before: number): R[] {
  return history
    .filter((workout) => workout.finishedAt !== null && workout.startedAt < before)
    .sort((first, second) => first.startedAt - second.startedAt)
}

export type WorkoutWithChanges = WorkoutRecord & { changes: Change[] }

export function withChanges(history: WorkoutRecord[]): WorkoutWithChanges[] {
  const track = changeTracker()

  return chronological(history, Infinity)
    .map((workout) => ({ ...workout, changes: track(workout) }))
    .reverse()
}

export function changesOf(history: WorkoutRecord[], id: string): Change[] {
  const track = changeTracker()
  for (const workout of chronological(history, Infinity)) {
    const changes = track(workout)
    if (workout.id === id) {
      return changes
    }
  }

  return []
}

export function changeTally(changes: Change[]): { kind: Change['kind']; count: number }[] {
  return CHANGE_KINDS.map((kind) => ({ kind, count: changes.filter((change) => change.kind === kind).length })).filter(
    ({ count }) => count > 0,
  )
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
  const gymRoutines = routines.filter((routine) => !routine.daily)
  const names = [...gymRoutines.flatMap(exercisesOf), ...workouts.flatMap(exercisesOf)].map((exercise) => exercise.name)

  return [...new Set(names)].sort((first, second) => first.localeCompare(second, LOCALE))
}

export function hasExercises(routine: Routine): boolean {
  return routine.sections.some((section) => section.items.length > 0)
}

export function isStartable(routine: Routine): boolean {
  return hasExercises(routine) && !routine.daily
}
