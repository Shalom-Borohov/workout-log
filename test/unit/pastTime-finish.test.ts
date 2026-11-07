import { describe, expect, it } from 'vitest'
import { finishMinutes, isClockPastLimit } from '../../src/domain/pastTime'

const THREE_HOURS_MS = 10_800_000

describe('isClockPastLimit', () => {
  it('is false at exactly 3 hours', () => {
    expect(isClockPastLimit(1000, 1000 + THREE_HOURS_MS)).toBe(false)
  })

  it('is true one millisecond over 3 hours', () => {
    expect(isClockPastLimit(1000, 1000 + THREE_HOURS_MS + 1)).toBe(true)
  })
})

describe('finishMinutes', () => {
  it.each([
    ['45', 45],
    ['1', 1],
    ['180', 180],
    ['45.6', 46],
    ['45,6', 46],
    ['999', 180],
    ['', 180],
    ['   ', 180],
    ['0', 180],
    ['-5', 180],
    ['abc', 180],
    ['0.2', 1],
  ])('%j gives %i minutes', (typed, minutes) => {
    expect(finishMinutes(typed)).toBe(minutes)
  })
})
