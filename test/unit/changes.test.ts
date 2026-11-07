import { describe, expect, it } from 'vitest'
import { type Change, changeTally, withChanges } from '../../src/domain/progress'
import type { SetLog, Target, Workout } from '../../src/domain/types'
import { activity, done, exercise, oct, open, reps, seconds, workout } from '../helpers/workouts'

const changesOf = (target: Workout, history: Workout[]) => withChanges(history).find((entry) => entry.id === target.id)?.changes

describe('changes across a switch between reps and time', () => {
  const session = (id: string, day: number, set: SetLog, target: Target) =>
    workout({ id, startedAt: oct(day), exercises: [exercise('פלאנק', [set], target)] })

  it('a bigger amount of the other kind at the same weight is no improvement', () => {
    const counted = session('a', 19, done(20, 10), reps(10))
    const timed = session('now', 26, done(20, 30), seconds(30))

    expect(changesOf(timed, [counted, timed])).toEqual([])
  })

  it('holds in the other direction too', () => {
    const timed = session('a', 19, done(20, 10), seconds(10))
    const counted = session('now', 26, done(20, 30), reps(30))

    expect(changesOf(counted, [timed, counted])).toEqual([])
  })

  it('holds for bodyweight', () => {
    const counted = session('a', 19, done(null, 10), reps(10))
    const timed = session('now', 26, done(null, 30), seconds(30))

    expect(changesOf(timed, [counted, timed])).toEqual([])
  })

  it('a higher weight is still up, below the heaviest ever', () => {
    const heaviest = session('a', 12, done(50, 6), reps(6))
    const counted = session('b', 19, done(20, 10), reps(10))
    const timed = session('now', 26, done(25, 30), seconds(30))

    expect(changesOf(timed, [heaviest, counted, timed])).toEqual([
      { name: 'פלאנק', kind: 'up', set: done(25, 30), target: seconds(30) },
    ])
  })

  it('a new heaviest weight is still a record', () => {
    const counted = session('a', 19, done(20, 10), reps(10))
    const timed = session('now', 26, done(25, 30), seconds(30))

    expect(changesOf(timed, [counted, timed])).toEqual([
      { name: 'פלאנק', kind: 'record', set: done(25, 30), target: seconds(30) },
    ])
  })

  it('compares amounts again from the next session of the new kind', () => {
    const counted = session('a', 12, done(20, 10), reps(10))
    const firstTimed = session('b', 19, done(20, 30), seconds(30))
    const longer = session('now', 26, done(20, 40), seconds(40))

    expect(changesOf(longer, [counted, firstTimed, longer])).toEqual([
      { name: 'פלאנק', kind: 'up', set: done(20, 40), target: seconds(40) },
    ])
  })

  it('reads the kind of a session from the row that was ticked, when the exercise appears twice', () => {
    const untickedCounted = exercise('פלאנק', [open(20, 10)], reps(10))
    const tickedTimed = exercise('פלאנק', [done(20, 30)], seconds(30))
    const twice = workout({ id: 'a', startedAt: oct(19), exercises: [untickedCounted, tickedTimed] })
    const longer = session('now', 26, done(20, 40), seconds(40))

    expect(changesOf(longer, [twice, longer])).toEqual([
      { name: 'פלאנק', kind: 'up', set: done(20, 40), target: seconds(40) },
    ])
  })
})

describe('changes per workout', () => {
  it('no changes on first session', () => {
    const current =workout({ id: 'now', startedAt: oct(26), exercises: [exercise('סקוואט', [done(40, 12)])] })

    expect(changesOf(current, [current])).toEqual([])
  })

  it('equal weight more reps is up', () => {
    const history = [
      workout({ id: 'a', startedAt: oct(12), exercises: [exercise('סקוואט', [done(50, 6)])] }),
      workout({ id: 'b', startedAt: oct(19), exercises: [exercise('סקוואט', [done(45, 8)])] }),
    ]

    const current =workout({ id: 'now', startedAt: oct(26), exercises: [exercise('סקוואט', [done(40, 12), done(45, 10)])] })

    expect(changesOf(current, [...history, current])).toEqual([{ name: 'סקוואט', kind: 'up', set: { weight: 45, amount: 10, done: true }, target: reps(10) }])
  })

  it('record beats up', () => {
    const history = [
      workout({ id: 'a', startedAt: oct(12), exercises: [exercise('סקוואט', [done(50, 6)])] }),
      workout({ id: 'b', startedAt: oct(19), exercises: [exercise('סקוואט', [done(45, 8)])] }),
    ]

    const current =workout({ id: 'now', startedAt: oct(26), exercises: [exercise('סקוואט', [done(52.5, 5)])] })

    expect(changesOf(current, [...history, current])).toEqual([{ name: 'סקוואט', kind: 'record', set: { weight: 52.5, amount: 5, done: true }, target: reps(10) }])
  })

  it('reports nothing when the best set did not improve', () => {
    const history = [workout({ id: 'b', startedAt: oct(19), exercises: [exercise('סקוואט', [done(45, 10)])] })]

    const current =workout({ id: 'now', startedAt: oct(26), exercises: [exercise('סקוואט', [done(45, 10), done(40, 12)])] })

    expect(changesOf(current, [...history, current])).toEqual([])
  })

  it('compares only against earlier workouts, in workout order', () => {
    const history = [
      workout({ id: 'b', startedAt: oct(19), exercises: [exercise('סקוואט', [done(45, 10)]), exercise('לחיצת חזה', [done(30, 10)])] }),
      workout({ id: 'later', startedAt: oct(28), exercises: [exercise('סקוואט', [done(90, 10)]), exercise('לחיצת חזה', [done(90, 10)])] }),
    ]

    const current =workout({
      id: 'now',
      startedAt: oct(26),
      exercises: [exercise('לחיצת חזה', [done(30, 12)]), exercise('סקוואט', [done(50, 10)]), exercise('פלאנק', [done(null, 60)])],
    })

    expect(changesOf(current, [...history, current])).toEqual([
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

    expect(withChanges(history).map((entry) => [entry.id, entry.changes.map((change) => change.kind)])).toEqual([
      ['c', []],
      ['b', ['record']],
      ['a', []],
    ])
  })

  it('keeps activities in place with no changes and without breaking comparisons', () => {
    const history = [
      workout({ id: 'a', startedAt: oct(12), exercises: [exercise('סקוואט', [done(40, 10)])] }),
      activity({ id: 'boxing', startedAt: oct(15) }),
      workout({ id: 'b', startedAt: oct(19), exercises: [exercise('סקוואט', [done(45, 10)])] }),
    ]

    expect(withChanges(history).map((entry) => [entry.id, entry.changes.map((change) => change.kind)])).toEqual([
      ['b', ['record']],
      ['boxing', []],
      ['a', []],
    ])
  })
})

describe('changeTally', () => {
  const change = (name: string, kind: Change['kind']): Change => ({ name, kind, set: done(20, 10), target: reps(10) })

  it('counts improvements before new bests and leaves out kinds with none', () => {
    expect(changeTally([change('סקוואט', 'record'), change('לחיצה', 'up'), change('חתירה', 'up')])).toEqual([
      { kind: 'up', count: 2 },
      { kind: 'record', count: 1 },
    ])
    expect(changeTally([change('סקוואט', 'record')])).toEqual([{ kind: 'record', count: 1 }])
    expect(changeTally([])).toEqual([])
  })
})
