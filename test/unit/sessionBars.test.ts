import { describe, expect, it } from 'vitest'
import type { ExerciseSession } from '../../src/domain/progress'
import { sessionBarFractions } from '../../src/domain/sessionBars'
import type { SetLog, Target } from '../../src/domain/types'
import { done, oct, reps, seconds } from '../helpers/workouts'

const session = (workoutId: string, sets: SetLog[], target: Target = reps(8)): ExerciseSession => ({
  workoutId,
  startedAt: oct(1),
  target,
  sets,
})

describe('sessionBarFractions', () => {
  it('gives the heaviest session the full width and the lightest a third, linear in between', () => {
    const sessions = [70, 67.5, 65, 65, 62.5, 60].map((weight, index) => session(`w${index}`, [done(weight, 8)]))

    const fractions = sessionBarFractions(sessions)

    expect(fractions.get('w0')).toBeCloseTo(1)
    expect(fractions.get('w1')).toBeCloseTo(0.8333)
    expect(fractions.get('w2')).toBeCloseTo(0.6667)
    expect(fractions.get('w3')).toBeCloseTo(0.6667)
    expect(fractions.get('w4')).toBeCloseTo(0.5)
    expect(fractions.get('w5')).toBeCloseTo(0.3333)
  })

  it('gives a single session the full width', () => {
    expect(sessionBarFractions([session('w1', [done(40, 8)])]).get('w1')).toBe(1)
  })

  it('gives every session the full width when all are equal', () => {
    const fractions = sessionBarFractions([session('w1', [done(40, 8)]), session('w2', [done(40, 6)])])

    expect([...fractions.values()]).toEqual([1, 1])
  })

  it('scales sessions with no weight by their best reps', () => {
    const fractions = sessionBarFractions([session('w1', [done(null, 15), done(null, 12)]), session('w2', [done(null, 10)])])

    expect(fractions.get('w1')).toBe(1)
    expect(fractions.get('w2')).toBeCloseTo(1 / 3)
  })

  it('scales timed sessions by their best time', () => {
    const fractions = sessionBarFractions([
      session('w1', [done(null, 120)], seconds(60)),
      session('w2', [done(null, 45)], seconds(60)),
    ])

    expect(fractions.get('w1')).toBe(1)
    expect(fractions.get('w2')).toBeCloseTo(1 / 3)
  })

  it('scales weighted and reps-only sessions each among their own kind', () => {
    const fractions = sessionBarFractions([
      session('heavy', [done(30, 8)]),
      session('light', [done(20, 8)]),
      session('many', [done(null, 20)]),
      session('few', [done(null, 10)]),
      session('middle', [done(null, 15)]),
    ])

    expect(fractions.get('heavy')).toBe(1)
    expect(fractions.get('light')).toBeCloseTo(1 / 3)
    expect(fractions.get('many')).toBe(1)
    expect(fractions.get('few')).toBeCloseTo(1 / 3)
    expect(fractions.get('middle')).toBeCloseTo(2 / 3)
  })
})
