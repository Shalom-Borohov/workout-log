import { findDailyLog } from './daily'
import { isoDate } from './format'
import type { DailyLog, Routine, WorkoutRecord } from './types'

export interface DailyDay {
  date: string
  day: number
  future: boolean
  today: boolean
}

export function monthStart(timestamp: number): number {
  const date = new Date(timestamp)

  return new Date(date.getFullYear(), date.getMonth(), 1).getTime()
}

export function shiftMonth(start: number, months: number): number {
  const date = new Date(start)

  return new Date(date.getFullYear(), date.getMonth() + months, 1).getTime()
}

export function monthGrid(start: number, now: number): (DailyDay | null)[] {
  const first = new Date(start)
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
  const today = isoDate(now)

  const days = Array.from({ length: daysInMonth }, (_, index) => {
    const day = new Date(first.getFullYear(), first.getMonth(), index + 1).getTime()
    const date = isoDate(day)

    return { date, day, future: day > now, today: date === today }
  })

  return [...Array.from({ length: first.getDay() }, () => null), ...days]
}

export function dayDrills(logs: DailyLog[], routines: Routine[]): Map<string, Routine[]> {
  const byDate = new Map<string, Routine[]>()

  for (const routine of routines.filter((candidate) => candidate.daily)) {
    for (const log of logs.filter((candidate) => candidate.routineId === routine.id)) {
      byDate.set(log.date, [...(byDate.get(log.date) ?? []), routine])
    }
  }

  return byDate
}

export function recordDates(records: WorkoutRecord[]): Set<string> {
  return new Set(records.map((record) => isoDate(record.startedAt)))
}

export function recordsOn(records: WorkoutRecord[], date: string): WorkoutRecord[] {
  return records
    .filter((record) => isoDate(record.startedAt) === date)
    .sort((first, second) => first.startedAt - second.startedAt)
}

export function quickLogDrill(
  routines: Routine[],
  logs: DailyLog[],
  recordDates: Set<string>,
  date: string,
): Routine | undefined {
  const active = routines.filter((routine) => routine.daily && !routine.archived)

  if (active.length !== 1 || recordDates.has(date) || findDailyLog(logs, active[0].id, date)) {
    return undefined
  }

  return active[0]
}

export function sheetDrills(routines: Routine[], logs: DailyLog[], date: string): Routine[] {
  return routines.filter(
    (routine) =>
      routine.daily && (!routine.archived || findDailyLog(logs, routine.id, date) !== undefined),
  )
}
