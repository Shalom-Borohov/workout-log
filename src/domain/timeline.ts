import { FORMAT_COPY } from '../copy/format'
import { isRoutineWorkout, sectionsOf } from './activities'
import { dayMonth, formatSummary } from './format'
import { completedSets, exercisesOf } from './progress'
import { DAYS_PER_WEEK, MINUTE_MS } from './time'
import type { WorkoutRecord } from './types'

export function summarize(record: WorkoutRecord): { minutes: number; doneSets: number } {
  const doneSets = exercisesOf({ sections: sectionsOf(record) }).flatMap(completedSets).length
  const minutes = record.finishedAt === null ? 0 : Math.round((record.finishedAt - record.startedAt) / MINUTE_MS)

  return { minutes, doneSets }
}

export function summaryLine(record: WorkoutRecord): string {
  const { minutes, doneSets } = summarize(record)

  return isRoutineWorkout(record) ? formatSummary(minutes, doneSets) : FORMAT_COPY.minutes(minutes)
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
