import { describe, expect, it } from 'vitest'
import { routineFromWorkout } from '../../src/domain/routineFromWorkout'
import type { Routine, Workout } from '../../src/domain/types'
import { counter } from '../helpers/ids'
import { done, exercise, oct, open, reps, routineExercise, seconds } from '../helpers/workouts'

const sets = (count: number) => Array.from({ length: count }, () => open(40, 10))

const session: Workout = {
  id: 'w1',
  routineId: 'r1',
  routineName: 'אימון גוף מלא',
  startedAt: oct(26),
  finishedAt: null,
  summary: '',
  sections: [
    {
      name: 'חימום',
      items: [{ id: 'i1', exercises: [{ ...exercise('אופניים', [done(null, 300)], seconds(300)), tip: 'קצב קל' }] }],
    },
    {
      name: 'עיקרי',
      items: [
        { id: 'i2', exercises: [exercise('סקוואט', sets(4), reps(8))] },
        { id: 'i3', exercises: [exercise('לחיצת חזה', sets(3)), exercise('פלאנק', sets(3), seconds(30))] },
        { id: 'i4', exercises: [{ ...exercise('מתח', sets(3), reps(6)), skipped: true }] },
      ],
    },
  ],
}

const base: Routine = {
  id: 'r1',
  name: 'גוף מלא',
  createdAt: 3,
  updatedAt: 5,
  sections: [
    {
      id: 's1',
      name: 'חימום',
      sets: 1,
      items: [{ id: 'old', sets: null, exercises: [routineExercise({ name: 'סקוואט', target: reps(12), weight: 60 })] }],
    },
  ],
}

describe('routineFromWorkout', () => {
  it('rebuilds the routine from the workout, keeping its id, name, creation date, section ids and starting weights', () => {
    expect(routineFromWorkout(session, base, counter(), 900)).toEqual({
      id: 'r1',
      name: 'גוף מלא',
      createdAt: 3,
      updatedAt: 900,
      sections: [
        {
          id: 's1',
          name: 'חימום',
          sets: 1,
          items: [
            { id: 'i1', sets: null, exercises: [{ name: 'אופניים', target: seconds(300), weight: null, tip: 'קצב קל' }] },
          ],
        },
        {
          id: 'n1',
          name: 'עיקרי',
          sets: 3,
          items: [
            { id: 'i2', sets: 4, exercises: [{ name: 'סקוואט', target: reps(8), weight: 60, tip: '' }] },
            {
              id: 'i3',
              sets: null,
              exercises: [
                { name: 'לחיצת חזה', target: reps(10), weight: null, tip: '' },
                { name: 'פלאנק', target: seconds(30), weight: null, tip: '' },
              ],
            },
            { id: 'i4', sets: null, exercises: [{ name: 'מתח', target: reps(6), weight: null, tip: '' }] },
          ],
        },
      ],
    })
  })

  it('without a base, names the routine after the workout under fresh ids, created now, with no starting weights', () => {
    const routine = routineFromWorkout(session, undefined, counter(), 900)

    expect([routine.id, routine.name, routine.createdAt]).toEqual(['n3', 'אימון גוף מלא', 900])
    expect(routine.sections.map((section) => section.id)).toEqual(['n1', 'n2'])
    expect(routine.sections[1].items[0].exercises[0].weight).toBeNull()
  })
})
