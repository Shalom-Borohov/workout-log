import { describe, expect, it } from 'vitest'
import type { SetLog, Workout } from '../../src/domain/types'
import { addSet, firstUnfinished, removeSet } from '../../src/domain/workoutEdits'
import { done, exercise, oct, open, workout } from '../helpers/workouts'

const ref = { section: 0, item: 0 }

function pairWorkout(a: SetLog[], b: SetLog[]): Workout {
  const w = workout({ id: 'w1', startedAt: oct(26), finishedAt: null, exercises: [] })

  return { ...w, sections: [{ name: 'עיקרי', items: [{ id: 'p', exercises: [exercise('A', a), exercise('B', b)] }] }] }
}

describe('workoutEdits', () => {
  it('firstUnfinished skips done and skipped', () => {
    const skipped = { ...exercise('לחיצת חזה', [open(40, 10)]), skipped: true }

    const w = workout({
      id: 'w1',
      startedAt: oct(26),
      finishedAt: null,
      exercises: [exercise('סקוואט', [done(60, 10), done(60, 10)]), skipped, exercise('חתירה', [done(30, 12), open(30, 12)])],
    })

    expect(firstUnfinished(w)).toBe(2)
  })

  it('addSet copies last set', () => {
    const w = pairWorkout([done(20, 12), done(22, 10)], [done(null, 15)])
    const sets = addSet(w, ref).sections[0].items[0].exercises.map((e) => e.sets)

    expect(sets).toEqual([
      [done(20, 12), done(22, 10), open(22, 10)],
      [done(null, 15), open(null, 15)],
    ])
    expect(w.sections[0].items[0].exercises[0].sets).toHaveLength(2)
  })

  it('removeSet keeps one', () => {
    const w = pairWorkout([done(20, 12), open(22, 10)], [done(null, 15), open(null, 15)])
    const once = removeSet(w, ref)
    const twice = removeSet(once, ref)

    expect(once.sections[0].items[0].exercises.map((e) => e.sets)).toEqual([[done(20, 12)], [done(null, 15)]])
    expect(twice).toEqual(once)
  })
})
