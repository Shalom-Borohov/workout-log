import { waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, vi } from 'vitest'
import { MINUTE_MS } from '../../src/domain/time'
import { toasts } from './ionic'
import { oct } from './workouts'

export const SAVE_FAILED = 'לא נשמר. אפשר לנסות שוב.'

export const LOST_CONNECTION = new DOMException('Connection to Indexed Database server lost', 'UnknownError')

export const saveFailureShown = () => waitFor(() => expect(toasts()).toContain(SAVE_FAILED))

export function stepClockPastMessageThrottle() {
  let frozenAt = oct(26, 12)

  beforeEach(() => {
    frozenAt += MINUTE_MS
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(frozenAt)
  })

  afterEach(() => {
    vi.useRealTimers()
  })
}
