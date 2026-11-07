import { isoDate } from '../domain/format'

const LAST_ERROR_KEY = 'workout-log:last-error'

export const readLastError = () => localStorage.getItem(LAST_ERROR_KEY)

export function recordLastError(error: unknown) {
  if (!(error instanceof Error)) {
    return
  }

  try {
    localStorage.setItem(LAST_ERROR_KEY, `${error.name} (${isoDate(Date.now())})`)
  } catch {}
}
