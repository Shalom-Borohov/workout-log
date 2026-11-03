import { formatAmount, isoDate, LIST_SEPARATOR } from './format'
import { exercisesOf, targetAmount } from './progress'
import type { DailyLog, Routine } from './types'

export interface DailyDay {
  date: string
  day: number
  done: boolean
  future: boolean
  today: boolean
}

export const dailyLogId = (routineId: string, date: string) => `${routineId}|${date}`

export function newDailyLog(routineId: string, date: string): DailyLog {
  return { id: dailyLogId(routineId, date), routineId, date }
}

export function loggedDates(logs: DailyLog[], routineId: string): Set<string> {
  return new Set(logs.filter((log) => log.routineId === routineId).map((log) => log.date))
}

export function monthStart(timestamp: number): number {
  const date = new Date(timestamp)

  return new Date(date.getFullYear(), date.getMonth(), 1).getTime()
}

export function shiftMonth(start: number, months: number): number {
  const date = new Date(start)

  return new Date(date.getFullYear(), date.getMonth() + months, 1).getTime()
}

export function monthGrid(start: number, logged: Set<string>, now: number): (DailyDay | null)[] {
  const first = new Date(start)
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
  const today = isoDate(now)

  const days = Array.from({ length: daysInMonth }, (_, index) => {
    const day = new Date(first.getFullYear(), first.getMonth(), index + 1).getTime()
    const date = isoDate(day)

    return { date, day, done: logged.has(date), future: day > now, today: date === today }
  })

  return [...Array.from({ length: first.getDay() }, () => null), ...days]
}

export function drillsLine(routine: Routine): string {
  return exercisesOf(routine)
    .map((exercise) => `${exercise.name} ${formatAmount(targetAmount(exercise.target), exercise.target)}`)
    .join(LIST_SEPARATOR)
}
