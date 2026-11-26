import { describe, expect, it } from 'vitest'
import { NO_HISTORY, type PreviousExerciseLookup } from '../../src/domain/progress'
import { newItem } from '../../src/domain/routineEdit'
import { addItems } from '../../src/domain/workoutStructure'
import type { Workout, WorkoutExercise } from '../../src/domain/types'
import { replaceInWorkout } from '../../src/domain/workoutReplace'
import { done, exercise, oct, open, reps, routineExercise, seconds, workout } from '../helpers/workouts'

const inclineHistory: PreviousExerciseLookup = ({ name }) => ({
  sets: name === 'לחיצה בשיפוע' ? [done(30, 10), done(32, 8)] : null,
  note: name === 'לחיצה בשיפוע' ? 'ספסל על 3' : '',
})

const incline = routineExercise({ name: 'לחיצה בשיפוע', target: reps(10), tip: 'מרפקים פנימה' })

function single(benchExercise: WorkoutExercise): Workout {
  return workout({ id: 'w1', startedAt: oct(26), finishedAt: null, exercises: [benchExercise, exercise('סקוואט', [open(60, 8)])] })
}

describe('replaceInWorkout', () => {
  it('leaves the ticked sets on the old exercise and starts the new one after it with the sets left', () => {
    const bench = { ...exercise('לחיצת חזה', [done(50, 10), done(50, 9), open(50, 10), open(50, 10)]), note: 'להעלות' }

    const items = replaceInWorkout(single(bench), 'i0', 0, incline, inclineHistory, 'done-part').sections[0].items

    expect(items.map((item) => item.id)).toEqual(['done-part', 'i0', 'i1'])
    expect(items[0].exercises).toEqual([{ ...bench, sets: [done(50, 10), done(50, 9)] }])
    expect(items[1].exercises).toEqual([
      { name: 'לחיצה בשיפוע', target: reps(10), sets: [open(30, 10), open(32, 8)], skipped: false, tip: 'מרפקים פנימה', note: 'ספסל על 3' },
    ])
  })

  it('marks the ticked part as replaced by the new exercise, which was planned with the old count', () => {
    const bench = exercise('לחיצת חזה', [done(50, 10), done(50, 9), open(50, 10), open(50, 10)])

    const items = replaceInWorkout(single(bench), 'i0', 0, incline, inclineHistory, 'done-part').sections[0].items

    expect(items.map((item) => item.replacedBy)).toEqual([{ id: 'i0', sets: 4 }, undefined, undefined])
  })

  it('keeps the first planned count when the new exercise is replaced again', () => {
    const bench = exercise('לחיצת חזה', [done(50, 10), done(50, 9), open(50, 10), open(50, 10)])
    const once = replaceInWorkout(single(bench), 'i0', 0, incline, inclineHistory, 'first')
    const [leftover, continuing, squat] = once.sections[0].items

    const inclineTicked: Workout = {
      ...once,
      sections: [{ ...once.sections[0], items: [leftover, { ...continuing, exercises: [{ ...continuing.exercises[0], sets: [done(30, 10), open(32, 8)] }] }, squat] }],
    }

    const row = routineExercise({ name: 'חתירה', target: reps(12) })

    const items = replaceInWorkout(inclineTicked, 'i0', 0, row, inclineHistory, 'second').sections[0].items

    expect(items.map((item) => [item.id, item.replacedBy?.sets])).toEqual([
      ['first', 4],
      ['second', 4],
      ['i0', undefined],
      ['i1', undefined],
    ])
  })

  it('gives the new exercise the old one’s full count when every set was ticked', () => {
    const finished = single(exercise('לחיצת חזה', [done(50, 10), done(50, 10), done(50, 8)]))

    const items = replaceInWorkout(finished, 'i0', 0, incline, inclineHistory, 'done-part').sections[0].items

    expect(items[0].exercises[0].sets).toEqual([done(50, 10), done(50, 10), done(50, 8)])
    expect(items[1].exercises[0].sets).toEqual([open(30, 10), open(32, 8), open(32, 8)])
  })

  it('keeps ticked sets that aren’t in a row and counts only the unticked ones as left', () => {
    const gaps = single(exercise('לחיצת חזה', [done(50, 10), open(50, 10), done(50, 8), open(50, 10)]))

    const items = replaceInWorkout(gaps, 'i0', 0, incline, inclineHistory, 'done-part').sections[0].items

    expect(items[0].exercises[0].sets).toEqual([done(50, 10), done(50, 8)])
    expect(items[1].exercises[0].sets).toHaveLength(2)
  })

  it('keeps the ticked sets when the new exercise is timed', () => {
    const plank = routineExercise({ name: 'פלאנק', target: seconds(60) })
    const bench = single(exercise('לחיצת חזה', [done(50, 10), open(50, 10)]))

    const items = replaceInWorkout(bench, 'i0', 0, plank, inclineHistory, 'done-part').sections[0].items

    expect(items[0].exercises[0].sets).toEqual([done(50, 10)])
    expect(items[1].exercises[0]).toMatchObject({ name: 'פלאנק', target: seconds(60), sets: [open(null, 60)] })
  })

  describe('in a pair', () => {
    const row = routineExercise({ name: 'חתירה', target: reps(12) })

    function paired(bench: WorkoutExercise, pullUp: WorkoutExercise): Workout {
      return {
        ...single(bench),
        sections: [{ name: 'עיקרי', items: [{ id: 'p', exercises: [bench, pullUp] }] }],
      }
    }

    it('keeps the ticked rounds in the pair and pairs the partner’s rounds left with the new exercise', () => {
      const bench = exercise('לחיצת חזה', [done(50, 10), done(50, 10), open(52, 10)])
      const pullUp = exercise('מתח', [done(null, 6), done(null, 6), open(null, 6)])

      const items = replaceInWorkout(paired(bench, pullUp), 'p', 1, row, inclineHistory, 'done-part').sections[0].items

      expect(items.map((item) => item.id)).toEqual(['done-part', 'p'])
      expect(items[0].exercises).toEqual([
        { ...bench, sets: [done(50, 10), done(50, 10)] },
        { ...pullUp, sets: [done(null, 6), done(null, 6)] },
      ])
      expect(items[1].exercises).toEqual([
        { ...bench, sets: [open(52, 10)] },
        { name: 'חתירה', target: reps(12), sets: [open(null, 12)], skipped: false, tip: '', note: '' },
      ])
    })

    it('starts the new exercise alone when the partner has no rounds left', () => {
      const bench = exercise('לחיצת חזה', [done(50, 10), done(50, 10)])
      const pullUp = exercise('מתח', [done(null, 6), open(null, 6)])

      const items = replaceInWorkout(paired(bench, pullUp), 'p', 1, row, inclineHistory, 'done-part').sections[0].items

      expect(items[1].exercises.map((pairExercise) => pairExercise.name)).toEqual(['חתירה'])
    })

    it('leaves out of the ticked part a partner with no ticked sets', () => {
      const bench = exercise('לחיצת חזה', [open(50, 10), open(50, 10)])
      const pullUp = exercise('מתח', [done(null, 6), open(null, 6)])

      const items = replaceInWorkout(paired(bench, pullUp), 'p', 1, row, inclineHistory, 'done-part').sections[0].items

      expect(items[0].exercises.map((pairExercise) => pairExercise.name)).toEqual(['מתח'])
      expect(items[1].exercises.map((pairExercise) => pairExercise.name)).toEqual(['לחיצת חזה', 'חתירה'])
    })

    it('swaps in place when only the partner has ticked sets', () => {
      const bench = exercise('לחיצת חזה', [done(50, 10), open(50, 10)])
      const pullUp = exercise('מתח', [open(null, 6), open(null, 6)])

      const items = replaceInWorkout(paired(bench, pullUp), 'p', 1, row, inclineHistory, 'done-part').sections[0].items

      expect(items.map((item) => item.id)).toEqual(['p'])
      expect(items[0].exercises.map((pairExercise) => pairExercise.name)).toEqual(['לחיצת חזה', 'חתירה'])
      expect(items[0].exercises[0].sets).toEqual([done(50, 10), open(50, 10)])
    })
  })

  it('keeps the exercise whole, with its sets, when it is replaced by itself', () => {
    const bench = exercise('לחיצת חזה', [done(50, 10), open(55, 10)])
    const sameBench = routineExercise({ name: 'לחיצת חזה', target: reps(10) })

    const items = replaceInWorkout(single(bench), 'i0', 0, sameBench, inclineHistory, 'done-part').sections[0].items

    expect(items.map((item) => item.id)).toEqual(['i0', 'i1'])
    expect(items[0].exercises[0].sets).toEqual([done(50, 10), open(55, 10)])
  })

  it('leaves the workout as it is when the exercise is no longer there', () => {
    const before = single(exercise('לחיצת חזה', [done(50, 10), open(50, 10)]))

    expect(replaceInWorkout(before, 'i0', 1, incline, inclineHistory, 'done-part')).toBe(before)
  })

  it('swaps an exercise with no ticked sets in place, as before', () => {
    const untouched = single(exercise('לחיצת חזה', [open(50, 10), open(50, 10)]))

    const items = replaceInWorkout(untouched, 'i0', 0, incline, inclineHistory, 'done-part').sections[0].items

    expect(items.map((item) => item.id)).toEqual(['i0', 'i1'])
    expect(items[0].exercises).toEqual([
      { name: 'לחיצה בשיפוע', target: reps(10), sets: [open(30, 10), open(32, 8)], skipped: false, tip: 'מרפקים פנימה', note: 'ספסל על 3' },
    ])
  })

  it('leaves the ticked part out of the section’s usual count for exercises added later', () => {
    const fourSets = [open(50, 10), open(50, 10), open(50, 10), open(50, 10)]
    const bench = exercise('לחיצת חזה', [done(50, 10), done(50, 10), open(50, 10), open(50, 10)])
    const workoutOfFours = workout({ id: 'w1', startedAt: oct(26), finishedAt: null, exercises: [bench, exercise('סקוואט', fourSets)] })
    const split = replaceInWorkout(workoutOfFours, 'i0', 0, incline, inclineHistory, 'done-part')

    const added = addItems(split, 0, [newItem('new', [routineExercise({ name: 'מתח', target: reps(8) })])], NO_HISTORY)

    expect(added.sections[0].items.at(-1)?.exercises[0].sets).toHaveLength(4)
  })
})
