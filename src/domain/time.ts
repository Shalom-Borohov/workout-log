export const SECOND_MS = 1000

export const MINUTE_MS = 60 * SECOND_MS

export const HOUR_MS = 60 * MINUTE_MS

export const DAY_MS = 24 * HOUR_MS

export const daysSince = (at: number, now: number) => Math.floor((now - at) / DAY_MS)

export const SECONDS_PER_MINUTE = 60

export const SECONDS_PER_HOUR = 60 * SECONDS_PER_MINUTE

export const DAYS_PER_WEEK = 7
