import type { Routine, RoutineExercise, SetLog, Target, Workout, WorkoutExercise } from './types'

export function targetAmount(t: Target): number {
  return t.kind === 'reps' ? t.reps : t.seconds
}

export function exercisesOf<E>(x: { sections: { items: { exercises: E[] }[] }[] }): E[] {
  return x.sections.flatMap((s) => s.items).flatMap((i) => i.exercises)
}

export function completedSets(e: WorkoutExercise): SetLog[] {
  return e.skipped ? [] : e.sets.filter((s) => s.done)
}

export type ExerciseSession = { workoutId: string; startedAt: number; target: Target; sets: SetLog[] }

function sessionOf(w: Workout, name: string): ExerciseSession | null {
  const matching = exercisesOf(w).filter((e) => e.name === name)
  const sets = matching.flatMap(completedSets)

  return sets.length > 0 ? { workoutId: w.id, startedAt: w.startedAt, target: matching[0].target, sets } : null
}

export function exerciseHistory(history: Workout[], name: string): ExerciseSession[] {
  return chronological(history, Infinity)
    .reverse()
    .flatMap((w) => {
      const session = sessionOf(w, name)

      return session ? [session] : []
    })
}

export type PreviousLookup = (exercise: Pick<RoutineExercise, 'name' | 'target'>) => SetLog[] | null

export function previousSetsLookup(history: Workout[], before: number): PreviousLookup {
  const latest = latestSessions(chronological(history, before))

  return (exercise) => {
    const last = latest.get(exercise.name)

    return last && last.target.kind === exercise.target.kind ? last.sets : null
  }
}

function prefill(target: Target, count: number, last: SetLog[] | null): SetLog[] {
  return Array.from({ length: count }, (_, i) => {
    if (!last) {
      return { weight: null, amount: targetAmount(target), done: false }
    }
    const source = last[i] ?? last[last.length - 1]

    return { weight: source.weight, amount: source.amount, done: false }
  })
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
        exercises: item.exercises.map(
          (e): WorkoutExercise => ({
            name: e.name,
            target: e.target,
            sets: prefill(e.target, section.sets, previous(e)),
            skipped: false,
          }),
        ),
      })),
    })),
  }
}

function weightRank(weight: number | null): number {
  return weight === null ? -Infinity : weight
}

function beats(a: SetLog, b: SetLog): boolean {
  const aw = weightRank(a.weight)
  const bw = weightRank(b.weight)

  return aw > bw || (aw === bw && a.amount > b.amount)
}

export function bestSet(sets: SetLog[]): SetLog | null {
  return sets.filter((s) => s.done).reduce<SetLog | null>((best, s) => (!best || beats(s, best) ? s : best), null)
}

export type Change = { name: string; kind: 'up' | 'record'; set: SetLog; target: Target }

type ExerciseState = { heaviest: number; previousBest: SetLog }

function changeTracker() {
  const state = new Map<string, ExerciseState>()

  return (w: Workout): Change[] => {
    const names = [...new Set(exercisesOf(w).map((e) => e.name))]

    return names.flatMap((name): Change[] => {
      const session = sessionOf(w, name)
      const best = session && bestSet(session.sets)
      if (!session || !best) {
        return []
      }
      const earlier = state.get(name)
      const heaviest = Math.max(...session.sets.map((s) => weightRank(s.weight)))

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
    .filter((h) => h.finishedAt !== null && h.startedAt < before)
    .sort((a, b) => a.startedAt - b.startedAt)
}

export type WorkoutWithChanges = Workout & { changes: Change[] }

export function withChanges(history: Workout[]): WorkoutWithChanges[] {
  const track = changeTracker()

  return chronological(history, Infinity)
    .map((w) => ({ ...w, changes: track(w) }))
    .reverse()
}

function weightsOf(sets: SetLog[]): number[] {
  return sets.flatMap((set) => (set.weight === null ? [] : [set.weight]))
}

export function recordSessionId(sessions: ExerciseSession[]): string | null {
  const weights = weightsOf(sessions.flatMap((s) => s.sets))
  if (weights.length === 0) {
    return null
  }
  const max = Math.max(...weights)
  const holders = sessions.filter((s) => s.sets.some((set) => set.weight === max))

  return holders[holders.length - 1].workoutId
}

export type TrendPoint = { startedAt: number; weight: number }

export function weightTrend(sessions: ExerciseSession[]): TrendPoint[] {
  return [...sessions]
    .sort((a, b) => a.startedAt - b.startedAt)
    .flatMap((s) => {
      const weights = weightsOf(s.sets)

      return weights.length > 0 ? [{ startedAt: s.startedAt, weight: Math.max(...weights) }] : []
    })
}

export function latestSessions(history: Workout[]): Map<string, ExerciseSession> {
  const latest = new Map<string, ExerciseSession>()

  for (const w of chronological(history, Infinity).reverse()) {
    for (const name of new Set(exercisesOf(w).map((e) => e.name))) {
      const session = latest.has(name) ? null : sessionOf(w, name)
      if (session) {
        latest.set(name, session)
      }
    }
  }

  return latest
}

export function exerciseNames(routines: Routine[], workouts: Workout[]): string[] {
  const names = [...routines.flatMap(exercisesOf), ...workouts.flatMap(exercisesOf)].map((e) => e.name)

  return [...new Set(names)].sort((a, b) => a.localeCompare(b, 'he'))
}

export function hasExercises(routine: Routine): boolean {
  return routine.sections.some((s) => s.items.length > 0)
}
