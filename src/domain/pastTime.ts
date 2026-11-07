import { MAX_SECONDS } from './limits'
import { parseNumber } from './numberInput'
import { MINUTE_MS, SECONDS_PER_MINUTE } from './time'

export const MIN_DURATION_MINUTES = 1

export const MAX_DURATION_MINUTES = MAX_SECONDS / SECONDS_PER_MINUTE

export function isClockPastLimit(startedAt: number, now: number): boolean {
  return now - startedAt > MAX_DURATION_MINUTES * MINUTE_MS
}

export function finishMinutes(typed: string): number {
  const minutes = parseNumber(typed)

  if (minutes === null || minutes === 0) {
    return MAX_DURATION_MINUTES
  }

  return Math.min(Math.max(Math.round(minutes), MIN_DURATION_MINUTES), MAX_DURATION_MINUTES)
}

export interface PastTimeProblems {
  inFuture: boolean
  endsAfterNow: boolean
  tooLong: boolean
  valid: boolean
}

export function pastTimeProblems(startedAt: number, minutes: number, now: number): PastTimeProblems {
  const inFuture = startedAt >= now
  const tooLong = minutes > MAX_DURATION_MINUTES
  const endsAfterNow = !inFuture && startedAt + minutes * MINUTE_MS > now
  const valid = Number.isFinite(startedAt) && Number.isInteger(minutes) && minutes > 0 && !inFuture && !tooLong && !endsAfterNow

  return { inFuture, endsAfterNow, tooLong, valid }
}
