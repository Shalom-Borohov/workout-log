import { FORMAT_COPY } from '../copy/format'
import { isRoutineWorkout, locationOf, sectionsOf } from './activities'
import { dayMonth, formatSummary, LIST_SEPARATOR } from './format'
import { type Change, completedSets, exercisesOf } from './progress'
import { DAYS_PER_WEEK, MINUTE_MS } from './time'
import type { SetLog, WorkoutExercise, WorkoutRecord } from './types'

export function summarize(record: WorkoutRecord): { minutes: number; doneSets: number } {
  const doneSets = exercisesOf({ sections: sectionsOf(record) }).flatMap(completedSets).length
  const minutes = record.finishedAt === null ? 0 : Math.round((record.finishedAt - record.startedAt) / MINUTE_MS)

  return { minutes, doneSets }
}

export function minutesAndLocation(record: WorkoutRecord): string {
  const minutes = FORMAT_COPY.minutes(summarize(record).minutes)
  const location = locationOf(record)

  return location ? `${minutes}${LIST_SEPARATOR}${location}` : minutes
}

export function summaryLine(record: WorkoutRecord): string {
  if (!isRoutineWorkout(record)) {
    return minutesAndLocation(record)
  }
  const { minutes, doneSets } = summarize(record)

  return formatSummary(minutes, doneSets)
}

const holdsSet = (exercise: WorkoutExercise, best: SetLog) =>
  exercise.sets.some((set) => set.done && set.weight === best.weight && set.amount === best.amount)

export function changeHolders(exercises: WorkoutExercise[], changes: Change[]): Map<WorkoutExercise, Change> {
  const holders = new Map<WorkoutExercise, Change>()
  for (const change of changes) {
    const holder = exercises.find((exercise) => exercise.name === change.name && holdsSet(exercise, change.set))
    if (holder) {
      holders.set(holder, change)
    }
  }

  return holders
}

function weekStart(timestamp: number): number {
  const date = new Date(timestamp)

  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay()).getTime()
}

function shiftWeeks(start: number, weeks: number): number {
  const date = new Date(start)

  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + weeks * DAYS_PER_WEEK).getTime()
}

function weekTitle(start: number, now: number): string {
  const current = weekStart(now)
  if (start === current) {
    return FORMAT_COPY.thisWeek
  }
  if (start === shiftWeeks(current, -1)) {
    return FORMAT_COPY.lastWeek
  }

  return `${dayMonth(start)}–${dayMonth(shiftWeeks(start, 1) - 1)}`
}

export function groupByWeek<W extends WorkoutRecord>(workouts: W[], now: number): { title: string; workouts: W[] }[] {
  const groups = new Map<number, W[]>()
  for (const workout of [...workouts].sort((first, second) => second.startedAt - first.startedAt)) {
    const start = weekStart(workout.startedAt)
    const group = groups.get(start)
    if (group) {
      group.push(workout)
    } else {
      groups.set(start, [workout])
    }
  }

  return [...groups].map(([start, items]) => ({ title: weekTitle(start, now), workouts: items }))
}
