import { describe, expect, it } from 'vitest'
import { matchesRoutine, routineFromWorkout } from '../../src/domain/routineFromWorkout'
import type { Routine, Workout, WorkoutExercise } from '../../src/domain/types'
import { counter } from '../helpers/ids'
import { done, exercise, oct, open, reps, routineExercise, seconds } from '../helpers/workouts'

const sets = (count: number) => Array.from({ length: count }, () => open(40, 10))

const session: Workout = {
  kind: 'routine',
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
  daily: false,
  color: null,
  archived: false,
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
      daily: false,
      color: null,
      archived: false,
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

describe('matchesRoutine', () => {
  const plan: Routine = {
    ...base,
    sections: [
      {
        id: 's1',
        name: 'חימום',
        sets: 1,
        items: [{ id: 'x1', sets: null, exercises: [{ name: 'אופניים', target: seconds(300), weight: 20, tip: 'קצב קל' }] }],
      },
      {
        id: 's2',
        name: 'עיקרי',
        sets: 3,
        items: [
          { id: 'x2', sets: 4, exercises: [{ name: 'סקוואט', target: reps(8), weight: 60, tip: '' }] },
          {
            id: 'x3',
            sets: null,
            exercises: [
              { name: 'לחיצת חזה', target: reps(10), weight: 40, tip: '' },
              { name: 'פלאנק', target: seconds(30), weight: null, tip: '' },
            ],
          },
          { id: 'x4', sets: 3, exercises: [{ name: 'מתח', target: reps(6), weight: null, tip: '' }] },
        ],
      },
    ],
  }

  const main = session.sections[1]

  const withMain = (items: Workout['sections'][number]['items']): Workout => ({
    ...session,
    sections: [session.sections[0], { ...main, items }],
  })

  it('matches when only weights, ticks and skips differ', () => {
    expect(matchesRoutine(session, plan)).toBe(true)
  })

  it('matches a target stored with its keys in another order', () => {
    const warmUp = plan.sections[0]
    const bike = warmUp.items[0]
    const reordered = { ...bike, exercises: [{ ...bike.exercises[0], target: { seconds: 300, kind: 'duration' as const } }] }

    expect(matchesRoutine(session, { ...plan, sections: [{ ...warmUp, items: [reordered] }, plan.sections[1]] })).toBe(true)
  })

  it('matches when only set counts differ, since an extra set is usually a one-off', () => {
    const squat = main.items[0]
    const extraSet = withMain([{ ...squat, exercises: [{ ...squat.exercises[0], sets: sets(5) }] }, main.items[1], main.items[2]])

    expect(matchesRoutine(extraSet, plan)).toBe(true)
  })

  it('differs when an exercise is added, removed or moved', () => {
    expect(matchesRoutine(withMain(main.items.slice(0, 2)), plan)).toBe(false)
    expect(matchesRoutine(withMain([main.items[1], main.items[0], main.items[2]]), plan)).toBe(false)
  })

  it('differs when a name, target or tip changes', () => {
    const squat = main.items[0]

    const edited = (change: Partial<WorkoutExercise>) =>
      withMain([{ ...squat, exercises: [{ ...squat.exercises[0], ...change }] }, main.items[1], main.items[2]])

    expect(matchesRoutine(edited({ name: 'דדליפט' }), plan)).toBe(false)
    expect(matchesRoutine(edited({ target: reps(5) }), plan)).toBe(false)
    expect(matchesRoutine(edited({ tip: 'עמוק' }), plan)).toBe(false)
  })

  it('differs when a section is renamed', () => {
    const renamed = { ...session, sections: [{ ...session.sections[0], name: 'פתיחה' }, main] }

    expect(matchesRoutine(renamed, plan)).toBe(false)
  })
})
