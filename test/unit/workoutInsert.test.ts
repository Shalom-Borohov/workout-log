import { describe, expect, it } from 'vitest'
import { NO_HISTORY, type PreviousExerciseLookup } from '../../src/domain/progress'
import type { RoutineItem, Workout } from '../../src/domain/types'
import { insertItemAfter } from '../../src/domain/workoutStructure'
import { done, exercise, oct, open, reps, routineExercise } from '../helpers/workouts'

const squatHistory: PreviousExerciseLookup = ({ name }) => ({
  sets: name === 'סקוואט' ? [done(60, 8)] : null,
  note: '',
})

const session: Workout = {
  kind: 'routine',
  id: 'w1',
  routineId: 'r1',
  routineName: 'גוף מלא',
  startedAt: oct(26),
  finishedAt: null,
  summary: '',
  sections: [
    { name: 'חימום', items: [{ id: 'a', exercises: [exercise('אופניים', [open(null, 10)])] }] },
    {
      name: 'עיקרי',
      items: [
        { id: 'b', exercises: [exercise('לחיצת חזה', [open(40, 10), open(40, 10)]), exercise('פלאנק', [open(null, 30)])] },
        { id: 'c', exercises: [exercise('מתח', [open(null, 6), open(null, 6)])] },
      ],
    },
  ],
}

const squat: RoutineItem = { id: 'new', sets: null, exercises: [routineExercise({ name: 'סקוואט', target: reps(10) })] }

const ids = (workout: Workout) => workout.sections.map((section) => section.items.map((item) => item.id))

describe('insertItemAfter', () => {
  it('puts the item right after the given one, in its section', () => {
    expect(ids(insertItemAfter(session, 'b', squat, NO_HISTORY))).toEqual([['a'], ['b', 'new', 'c']])
  })

  it('after the last item of a section, ends that section', () => {
    expect(ids(insertItemAfter(session, 'a', squat, NO_HISTORY))).toEqual([['a', 'new'], ['b', 'c']])
  })

  it("takes the most common set count of the item's section, prefilled from history", () => {
    const added = insertItemAfter(session, 'b', squat, squatHistory).sections[1].items[1]

    expect(added.exercises[0].sets).toEqual([open(60, 8), open(60, 8)])
  })

  it('leaves the workout as it is when the item is gone', () => {
    expect(insertItemAfter(session, 'gone', squat, NO_HISTORY)).toBe(session)
  })
})
