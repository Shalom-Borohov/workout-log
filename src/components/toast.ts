import { COMMON_COPY } from '../copy/common'

export const TOAST_OPTIONS = { duration: 2500, position: 'top' } as const

export const errorMessage = (error: unknown) => (error instanceof Error ? error.message : COMMON_COPY.actionFailed)
