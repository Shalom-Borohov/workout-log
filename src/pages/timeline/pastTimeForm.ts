import { formatTime, isoDate } from '../../domain/format'
import { HOUR_MS } from '../../domain/time'
import { summarize } from '../../domain/timeline'
import type { Activity } from '../../domain/types'

export interface PastTime {
  date: string
  time: string
  duration: string
}

const DEFAULT_DURATION_MINUTES = 60

const pastTimeAt = (startedAt: number, minutes: number): PastTime => ({
  date: isoDate(startedAt),
  time: formatTime(startedAt),
  duration: String(minutes),
})

export const defaultPastTime = (now: number) => pastTimeAt(now - HOUR_MS, DEFAULT_DURATION_MINUTES)

export const pastTimeOf = (activity: Activity) => pastTimeAt(activity.startedAt, summarize(activity).minutes)

const CLOCK_TIME = /\d{2}:\d{2}/

export function clockTime(value: string | string[] | null | undefined): string | null {
  const match = typeof value === 'string' ? CLOCK_TIME.exec(value) : null

  return match && match[0]
}

export function readPastTime({ date, time, duration }: PastTime) {
  return { startedAt: new Date(`${date}T${time}`).getTime(), minutes: Number(duration) }
}
