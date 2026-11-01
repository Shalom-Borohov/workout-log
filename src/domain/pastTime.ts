import { MAX_SECONDS } from './limits'
import { MINUTE_MS, SECONDS_PER_MINUTE } from './time'

export const MAX_DURATION_MINUTES = MAX_SECONDS / SECONDS_PER_MINUTE

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
