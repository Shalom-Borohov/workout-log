import { describe, expect, it } from 'vitest'
import { stepRest } from '../../src/domain/rest'

describe('stepRest', () => {
  it('moves the rest by 15 seconds', () => {
    expect(stepRest(60, 1)).toBe(75)
    expect(stepRest(60, -1)).toBe(45)
  })

  it('never goes below 15 seconds', () => {
    expect(stepRest(15, -1)).toBe(15)
  })
})
