import { COMMON_COPY } from '../copy/common'
import { recordLastError } from '../data/lastError'
import { AppError } from '../domain/appError'

export const TOAST_OPTIONS = { duration: 2500, position: 'top' } as const

export function errorMessage(error: unknown) {
  if (error instanceof AppError) {
    return error.message
  }

  recordLastError(error)

  return COMMON_COPY.actionFailed
}
