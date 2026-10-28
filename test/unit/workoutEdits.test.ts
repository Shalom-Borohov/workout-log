import { describe, expect, it } from 'vitest'
import type { SetLog, Workout } from '../../src/domain/types'
import { addSet, editSet, fillWeight, firstUnfinished, nextUnfinished, removeSet } from '../../src/domain/workoutEdits'
import { done, exercise, oct, open, workout } from '../helpers/workouts'

const ref = { section: 0, item: 0 }

function pairWorkout(firstSets: SetLog[], secondSets: SetLog[]): Workout {
  const base = workout({ id: 'w1', startedAt: oct(26), finishedAt: null, exercises: [] })

  return { ...base, sections: [{ name: 'עיקרי', items: [{ id: 'p', exercises: [exercise('A', firstSets), exercise('B', secondSets)] }] }] }
}

describe('workoutEdits', () => {
  it('firstUnfinished skips done and skipped', () => {
    const skipped = { ...exercise('לחיצת חזה', [open(40, 10)]), skipped: true }

    const active =workout({
      id: 'w1',
      startedAt: oct(26),
      finishedAt: null,
      exercises: [exercise('סקוואט', [done(60, 10), done(60, 10)]), skipped, exercise('חתירה', [done(30, 12), open(30, 12)])],
    })

    expect(firstUnfinished(active)).toBe(2)
  })

  it('addSet copies last set', () => {
    const active =pairWorkout([done(20, 12), done(22, 10)], [done(null, 15)])
    const sets = addSet(active,ref).sections[0].items[0].exercises.map((pairExercise) => pairExercise.sets)

    expect(sets).toEqual([
      [done(20, 12), done(22, 10), open(22, 10)],
      [done(null, 15), open(null, 15)],
    ])
    expect(active.sections[0].items[0].exercises[0].sets).toHaveLength(2)
  })

  it('removeSet keeps one', () => {
    const active =pairWorkout([done(20, 12), open(22, 10)], [done(null, 15), open(null, 15)])
    const once = removeSet(active,ref)
    const twice = removeSet(once, ref)

    expect(once.sections[0].items[0].exercises.map((pairExercise) => pairExercise.sets)).toEqual([[done(20, 12)], [done(null, 15)]])
    expect(twice).toEqual(once)
  })

  it('fillWeight carries a new weight down to later open sets that had the old weight or none', () => {
    const active =pairWorkout([done(20, 10), open(20, 10), open(20, 8), open(15, 8), open(null, 8), done(20, 8)], [open(20, 15)])
    const sets = fillWeight(active,ref, 0, 1, 22.5).sections[0].items[0].exercises.map((pairExercise) => pairExercise.sets)

    expect(sets).toEqual([
      [done(20, 10), open(22.5, 10), open(22.5, 8), open(15, 8), open(22.5, 8), done(20, 8)],
      [open(20, 15)],
    ])
  })

  it('editSet fills a weight down and applies the rest of the patch to that set only', () => {
    const active =pairWorkout([open(20, 10), open(20, 10)], [open(20, 15)])
    const sets = editSet(active,ref, 0, 0, { weight: 25, done: true }).sections[0].items[0].exercises.map((pairExercise) => pairExercise.sets)

    expect(sets).toEqual([[done(25, 10), open(25, 10)], [open(20, 15)]])
  })

  it('nextUnfinished passes over skipped and done items after the current one', () => {
    const skipped = { ...exercise('לחיצת חזה', [open(40, 10)]), skipped: true }

    const active =workout({
      id: 'w1',
      startedAt: oct(26),
      finishedAt: null,
      exercises: [
        exercise('סקוואט', [open(60, 10)]),
        skipped,
        exercise('חתירה', [done(30, 12)]),
        exercise('מתח', [open(null, 8)]),
        exercise('דדליפט', [done(80, 5)]),
      ],
    })

    expect(nextUnfinished(active,0)).toBe(3)
    expect(nextUnfinished(active,3)).toBeNull()
  })
})
