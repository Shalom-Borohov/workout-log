import { describe, expect, it } from 'vitest'
import { exerciseHistory, previousExerciseLookup, startWorkout, weightTrend } from '../../src/domain/progress'
import { counter } from '../helpers/ids'
import { done, exercise, oct, open, reps, routine, seconds, workout } from '../helpers/workouts'

describe('previous sets', () => {
  it('returns the last completed sets of the same type before a time', () => {
    const history = [
      workout({ id: 'a', startedAt: oct(12), exercises: [exercise('סקוואט', [done(40, 12), done(40, 10)])] }),
      workout({ id: 'b', startedAt: oct(26), exercises: [exercise('סקוואט', [done(50, 12)])] }),
    ]

    const previous = previousExerciseLookup(history, oct(20))

    expect(previous({ name: 'סקוואט', target: reps(12) }).sets).toEqual([done(40, 12), done(40, 10)])
    expect(previous({ name: 'פלאנק', target: seconds(30) }).sets).toBeNull()
  })

  it('offers only the target, with no weight, when the last session was of the other kind', () => {
    const history = [workout({ id: 'a', startedAt: oct(12), exercises: [exercise('סקוואט', [done(40, 12)])] })]

    const previous = previousExerciseLookup(history, oct(20))

    expect(previous({ name: 'סקוואט', target: seconds(30) }).sets).toEqual([open(null, 30)])
  })

  it('starts a workout with the target and no starting weight when the last session was of the other kind', () => {
    const history = [workout({ id: 'last', startedAt: oct(19), exercises: [exercise('פלאנק', [done(5, 45)], seconds(45))] })]
    const counted = routine('r1', 'ליבה', [[{ name: 'פלאנק', target: reps(12), weight: 20 }]], 2)

    const started = startWorkout(counted, history, oct(26), counter())

    expect(started.sections[0].items[0].exercises[0].sets).toEqual([open(null, 12), open(null, 12)])
  })

  it('reads the kind of a session from the row that was ticked, when the exercise appears twice', () => {
    const untickedCounted = exercise('פלאנק', [open(20, 10)], reps(10))
    const tickedTimed = exercise('פלאנק', [done(5, 45)], seconds(45))
    const history = [workout({ id: 'a', startedAt: oct(12), exercises: [untickedCounted, tickedTimed] })]

    const previous = previousExerciseLookup(history, oct(20))

    expect(previous({ name: 'פלאנק', target: seconds(60) }).sets).toEqual([done(5, 45)])
    expect(previous({ name: 'פלאנק', target: reps(12) }).sets).toEqual([open(null, 12)])
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
