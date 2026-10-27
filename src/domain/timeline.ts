import { dayMonth } from './format'
import { completedSets, exercisesOf } from './progress'
import type { Workout } from './types'

export function summarize(w: Workout): { minutes: number; doneSets: number } {
  const doneSets = exercisesOf(w).flatMap(completedSets).length
  const minutes = w.finishedAt === null ? 0 : Math.round((w.finishedAt - w.startedAt) / 60000)

  return { minutes, doneSets }
}

function weekStart(ts: number): number {
  const d = new Date(ts)

  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - d.getDay()).getTime()
}

function shiftWeeks(start: number, weeks: number): number {
  const d = new Date(start)

  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + weeks * 7).getTime()
}

function weekTitle(start: number, now: number): string {
  const current = weekStart(now)
  if (start === current) {
    return 'השבוע'
  }
  if (start === shiftWeeks(current, -1)) {
    return 'שבוע שעבר'
  }

  return `${dayMonth(start)}–${dayMonth(shiftWeeks(start, 1) - 1)}`
}

export function groupByWeek<W extends Workout>(workouts: W[], now: number): { title: string; workouts: W[] }[] {
  const groups = new Map<number, W[]>()
  for (const w of [...workouts].sort((a, b) => b.startedAt - a.startedAt)) {
    const start = weekStart(w.startedAt)
    const group = groups.get(start)
    if (group) {
      group.push(w)
    } else {
      groups.set(start, [w])
    }
  }

  return [...groups].map(([start, items]) => ({ title: weekTitle(start, now), workouts: items }))
}
