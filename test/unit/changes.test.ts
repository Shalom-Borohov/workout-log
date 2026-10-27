import { describe, expect, it } from 'vitest'
import { withChanges } from '../../src/domain/progress'
import type { Workout } from '../../src/domain/types'
import { done, exercise, oct, reps, workout } from '../helpers/workouts'

const changesOf = (w: Workout, history: Workout[]) => withChanges(history).find((x) => x.id === w.id)?.changes

describe('changes per workout', () => {
  it('no changes on first session', () => {
    const w = workout({ id: 'now', startedAt: oct(26), exercises: [exercise('סקוואט', [done(40, 12)])] })

    expect(changesOf(w, [w])).toEqual([])
  })

  it('equal weight more reps is up', () => {
    const history = [
      workout({ id: 'a', startedAt: oct(12), exercises: [exercise('סקוואט', [done(50, 6)])] }),
      workout({ id: 'b', startedAt: oct(19), exercises: [exercise('סקוואט', [done(45, 8)])] }),
    ]

    const w = workout({ id: 'now', startedAt: oct(26), exercises: [exercise('סקוואט', [done(40, 12), done(45, 10)])] })

    expect(changesOf(w, [...history, w])).toEqual([{ name: 'סקוואט', kind: 'up', set: { weight: 45, amount: 10, done: true }, target: reps(10) }])
  })

  it('record beats up', () => {
    const history = [
      workout({ id: 'a', startedAt: oct(12), exercises: [exercise('סקוואט', [done(50, 6)])] }),
      workout({ id: 'b', startedAt: oct(19), exercises: [exercise('סקוואט', [done(45, 8)])] }),
    ]

    const w = workout({ id: 'now', startedAt: oct(26), exercises: [exercise('סקוואט', [done(52.5, 5)])] })

    expect(changesOf(w, [...history, w])).toEqual([{ name: 'סקוואט', kind: 'record', set: { weight: 52.5, amount: 5, done: true }, target: reps(10) }])
  })

  it('reports nothing when the best set did not improve', () => {
    const history = [workout({ id: 'b', startedAt: oct(19), exercises: [exercise('סקוואט', [done(45, 10)])] })]

    const w = workout({ id: 'now', startedAt: oct(26), exercises: [exercise('סקוואט', [done(45, 10), done(40, 12)])] })

    expect(changesOf(w, [...history, w])).toEqual([])
  })

  it('compares only against earlier workouts, in workout order', () => {
    const history = [
      workout({ id: 'b', startedAt: oct(19), exercises: [exercise('סקוואט', [done(45, 10)]), exercise('לחיצת חזה', [done(30, 10)])] }),
      workout({ id: 'later', startedAt: oct(28), exercises: [exercise('סקוואט', [done(90, 10)]), exercise('לחיצת חזה', [done(90, 10)])] }),
    ]

    const w = workout({
      id: 'now',
      startedAt: oct(26),
      exercises: [exercise('לחיצת חזה', [done(30, 12)]), exercise('סקוואט', [done(50, 10)]), exercise('פלאנק', [done(null, 60)])],
    })

    expect(changesOf(w, [...history, w])).toEqual([
      { name: 'לחיצת חזה', kind: 'up', set: { weight: 30, amount: 12, done: true }, target: reps(10) },
      { name: 'סקוואט', kind: 'record', set: { weight: 50, amount: 10, done: true }, target: reps(10) },
    ])
  })
})

describe('withChanges', () => {
  it('attaches each finished workout its changes, newest first', () => {
    const history = [
      workout({ id: 'a', startedAt: oct(12), exercises: [exercise('סקוואט', [done(40, 10)])] }),
      workout({ id: 'c', startedAt: oct(26), exercises: [exercise('סקוואט', [done(40, 12)])] }),
      workout({ id: 'active', startedAt: oct(27), finishedAt: null, exercises: [exercise('סקוואט', [done(60, 12)])] }),
      workout({ id: 'b', startedAt: oct(19), exercises: [exercise('סקוואט', [done(45, 10)])] }),
    ]

    expect(withChanges(history).map((w) => [w.id, w.changes.map((c) => c.kind)])).toEqual([
      ['c', []],
      ['b', ['record']],
      ['a', []],
    ])
  })
})
