import { describe, expect, it } from 'vitest'
import { WEIGHT_STEP, amountStep, stepValue, workoutProgress } from '../../src/domain/workoutEdits'
import { done, exercise, oct, open, reps, seconds, workout } from '../helpers/workouts'

describe('workoutProgress', () => {
  it('counts done sets out of all sets, leaving out skipped exercises', () => {
    const active = workout({
      id: 'w1',
      startedAt: oct(26),
      finishedAt: null,
      exercises: [
        exercise('סקוואט', [done(40, 12), open(40, 12), open(40, 12)]),
        { ...exercise('לחיצת חזה', [done(30, 10), open(30, 10)]), skipped: true },
        exercise('פלאנק', [done(null, 30)], seconds(30)),
      ],
    })

    expect(workoutProgress(active)).toEqual({ done: 2, total: 4 })
  })
})

describe('stepValue', () => {
  it('steps up and down without going below zero', () => {
    expect(stepValue(20, 2.5, 500)).toBe(22.5)
    expect(stepValue(1, -2.5, 500)).toBe(0)
  })

  it('starts an empty weight at one step', () => {
    expect(stepValue(null, 2.5, 500)).toBe(2.5)
    expect(stepValue(null, -2.5, 500)).toBe(0)
  })

  it('does not step past the max', () => {
    expect(stepValue(499, 2.5, 500)).toBe(500)
    expect(stepValue(500, 1, 500)).toBe(500)
  })
})

describe('step sizes', () => {
  it('uses gym-sized steps for weight and each amount unit', () => {
    expect(WEIGHT_STEP).toBe(2.5)
    expect(amountStep(reps(10))).toBe(1)
    expect(amountStep(seconds(900))).toBe(60)
    expect(amountStep(seconds(30))).toBe(15)
  })
})
