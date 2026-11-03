import { describe, expect, it } from 'vitest'
import { exerciseHistory, previousExerciseLookup, weightTrend } from '../../src/domain/progress'
import { done, exercise, oct, reps, seconds, workout } from '../helpers/workouts'

describe('previous sets', () => {
  it('returns the last completed sets of the same type before a time', () => {
    const history = [
      workout({ id: 'a', startedAt: oct(12), exercises: [exercise('סקוואט', [done(40, 12), done(40, 10)])] }),
      workout({ id: 'b', startedAt: oct(26), exercises: [exercise('סקוואט', [done(50, 12)])] }),
    ]

    const previous = previousExerciseLookup(history, oct(20))

    expect(previous({ name: 'סקוואט', target: reps(12) }).sets).toEqual([done(40, 12), done(40, 10)])
    expect(previous({ name: 'סקוואט', target: seconds(30) }).sets).toBeNull()
    expect(previous({ name: 'פלאנק', target: seconds(30) }).sets).toBeNull()
  })
})

describe('weightTrend', () => {
  it('lists the heaviest weight per session, oldest first, skipping bodyweight sessions', () => {
    const history = [
      workout({ id: 'c', startedAt: oct(26), exercises: [exercise('סקוואט', [done(45, 10), done(50, 8)])] }),
      workout({ id: 'b', startedAt: oct(19), exercises: [exercise('סקוואט', [done(null, 15)])] }),
      workout({ id: 'a', startedAt: oct(12), exercises: [exercise('סקוואט', [done(40, 12)])] }),
    ]

    expect(weightTrend(exerciseHistory(history, 'סקוואט'))).toEqual([
      { startedAt: oct(12), weight: 40 },
      { startedAt: oct(26), weight: 50 },
    ])
  })
})
