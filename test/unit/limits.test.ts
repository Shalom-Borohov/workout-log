import { describe, expect, it } from 'vitest'
import { clampAmount, clampWeight, maxAmount } from '../../src/domain/limits'
import { reps, seconds } from '../helpers/workouts'

describe('limits', () => {
  it('caps weight at 500 kg and keeps lighter weights as typed', () => {
    expect(clampWeight(9999)).toBe(500)
    expect(clampWeight(22.5)).toBe(22.5)
  })

  it('caps reps at 100 and rounds them to whole reps', () => {
    expect(clampAmount(9999, reps(10))).toBe(100)
    expect(clampAmount(8.6, reps(10))).toBe(9)
  })

  it('caps a timed set at three hours', () => {
    expect(clampAmount(99999, seconds(30))).toBe(10800)
    expect(clampAmount(45, seconds(30))).toBe(45)
  })

  it('reports the maximum for each target kind', () => {
    expect(maxAmount(reps(10))).toBe(100)
    expect(maxAmount(seconds(30))).toBe(10800)
  })
})
