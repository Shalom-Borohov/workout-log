import { describe, expect, it } from 'vitest'
import {
  bestSet,
  exerciseHistory,
  exerciseNames,
  previousSessionLookup,
  previousSetsLookup,
  startWorkout,
  targetAmount,
} from '../../src/domain/progress'
import { done, exercise, oct, open, reps, routine, seconds, workout } from '../helpers/workouts'

const fullBody = routine('r1', 'אימון גוף מלא', [
  [{ name: 'סקוואט', target: reps(12) }],
  [{ name: 'פלאנק', target: seconds(30) }],
])

const ids = () => {
  let next = 0

  return () => `w${++next}`
}

describe('startWorkout', () => {
  it('prefills from target when no history', () => {
    const started = startWorkout(fullBody, [], oct(26), ids())

    expect(started).toEqual({
      id: 'w1',
      routineId: 'r1',
      routineName: 'אימון גוף מלא',
      startedAt: oct(26),
      finishedAt: null,
      summary: '',
      sections: [
        {
          name: 'עיקרי',
          items: [
            {
              id: 'r1-i0',
              exercises: [
                {
                  name: 'סקוואט',
                  target: { kind: 'reps', reps: 12 },
                  skipped: false,
                  tip: '',
                  note: '',
                  sets: [
                    { weight: null, amount: 12, done: false },
                    { weight: null, amount: 12, done: false },
                    { weight: null, amount: 12, done: false },
                  ],
                },
              ],
            },
            {
              id: 'r1-i1',
              exercises: [
                {
                  name: 'פלאנק',
                  target: { kind: 'duration', seconds: 30 },
                  skipped: false,
                  tip: '',
                  note: '',
                  sets: [
                    { weight: null, amount: 30, done: false },
                    { weight: null, amount: 30, done: false },
                    { weight: null, amount: 30, done: false },
                  ],
                },
              ],
            },
          ],
        },
      ],
    })
  })

  it('uses the exercise set count over the section count', () => {
    const plan = routine('r1', 'אימון גוף מלא', [[{ name: 'סקוואט', target: reps(12) }], [{ name: 'מתח', target: reps(8) }]])
    plan.sections[0].items[1].sets = 5

    const started = startWorkout(plan, [], oct(26), ids())

    expect(started.sections[0].items.map((item) => item.exercises[0].sets.length)).toEqual([3, 5])
  })

  it('prefills the starting weight only while the exercise has no history', () => {
    const plan = routine('r1', 'אימון גוף מלא', [
      [{ name: 'סקוואט', target: reps(12), weight: 20 }],
      [{ name: 'מתח', target: reps(8), weight: 10 }],
    ])
    const history = [workout({ id: 'last', startedAt: oct(19), exercises: [exercise('מתח', [done(15, 8)])] })]

    const started = startWorkout(plan, history, oct(26), ids())

    expect(started.sections[0].items[0].exercises[0].sets.map((set) => set.weight)).toEqual([20, 20, 20])
    expect(started.sections[0].items[1].exercises[0].sets.map((set) => set.weight)).toEqual([15, 15, 15])
  })

  it('copies the exercise tip and starts with an empty note', () => {
    const plan = routine('r1', 'אימון גוף מלא', [[{ name: 'סקוואט', target: reps(12), tip: 'מושב על 4' }]])

    const [squat] = startWorkout(plan, [], oct(26), ids()).sections[0].items[0].exercises

    expect(squat.tip).toBe('מושב על 4')
    expect(squat.note).toBe('')
  })

  it('prefills from last session', () => {
    const history = [
      workout({ id: 'old', startedAt: oct(12), exercises: [exercise('סקוואט', [done(30, 12), done(30, 12), done(30, 12)])] }),
      workout({ id: 'last', startedAt: oct(19), exercises: [exercise('סקוואט', [done(40, 12), done(45, 10), done(45, 8)])] }),
    ]

    const started = startWorkout(fullBody, history, oct(26), ids())

    expect(started.sections[0].items[0].exercises[0].sets).toEqual([
      { weight: 40, amount: 12, done: false },
      { weight: 45, amount: 10, done: false },
      { weight: 45, amount: 8, done: false },
    ])
  })

  it('prefills from the routine target after a switch between reps and time', () => {
    const history = [workout({ id: 'last', startedAt: oct(19), exercises: [exercise('פלאנק', [done(5, 12)], reps(12))] })]
    const timed = routine('r1', 'ליבה', [[{ name: 'פלאנק', target: seconds(30) }]], 2)

    const started = startWorkout(timed, history, oct(26), ids())

    expect(started.sections[0].items[0].exercises[0].sets).toEqual([
      { weight: null, amount: 30, done: false },
      { weight: null, amount: 30, done: false },
    ])
  })

  it('extra sets reuse the last logged set', () => {
    const history = [workout({ id: 'last', startedAt: oct(19), exercises: [exercise('סקוואט', [done(40, 12), done(42.5, 10)])] })]

    const started = startWorkout(fullBody, history, oct(26), ids())

    expect(started.sections[0].items[0].exercises[0].sets).toEqual([
      { weight: 40, amount: 12, done: false },
      { weight: 42.5, amount: 10, done: false },
      { weight: 42.5, amount: 10, done: false },
    ])
  })

  it('prefills each exercise of a pair from its own history', () => {
    const pairRoutine = routine(
      'r2',
      'גב',
      [
        [
          { name: 'משיכה לפנים', target: reps(12) },
          { name: 'הכנסת סנטר', target: reps(10) },
        ],
      ],
      2,
    )

    const history = [workout({ id: 'last', startedAt: oct(19), exercises: [exercise('משיכה לפנים', [done(25, 12), done(25, 11)])] })]

    const pair = startWorkout(pairRoutine, history, oct(26), ids()).sections[0].items[0]

    expect(pair.id).toBe('r2-i0')
    expect(pair.exercises.map((pairExercise) => pairExercise.sets)).toEqual([
      [
        { weight: 25, amount: 12, done: false },
        { weight: 25, amount: 11, done: false },
      ],
      [
        { weight: null, amount: 10, done: false },
        { weight: null, amount: 10, done: false },
      ],
    ])
  })
})

describe('previousSets as history lookup', () => {
  it('ignores sessions with no done sets', () => {
    const history = [
      workout({ id: 'a', startedAt: oct(12), exercises: [exercise('סקוואט', [done(40, 12), open(40, 12)])] }),
      workout({ id: 'b', startedAt: oct(19), exercises: [{ ...exercise('סקוואט', [open(45, 12)]), skipped: true }] }),
      workout({ id: 'c', startedAt: oct(21), exercises: [exercise('סקוואט', [open(45, 12), open(45, 12)])] }),
    ]

    expect(previousSetsLookup(history, oct(26))({ name: 'סקוואט', target: reps(10) })).toEqual([{ weight: 40, amount: 12, done: true }])
  })

  it('ignores skipped exercises even with ticked sets', () => {
    const history = [
      workout({ id: 'a', startedAt: oct(12), exercises: [exercise('סקוואט', [done(40, 12)])] }),
      workout({ id: 'b', startedAt: oct(19), exercises: [{ ...exercise('סקוואט', [done(45, 12)]), skipped: true }] }),
    ]

    expect(previousSetsLookup(history, oct(26))({ name: 'סקוואט', target: reps(10) })).toEqual([{ weight: 40, amount: 12, done: true }])
  })

  it('ignores unfinished workouts and workouts from the given time on', () => {
    const history = [
      workout({ id: 'a', startedAt: oct(19), exercises: [exercise('סקוואט', [done(40, 12)])] }),
      workout({ id: 'active', startedAt: oct(25), finishedAt: null, exercises: [exercise('סקוואט', [done(50, 12)])] }),
      workout({ id: 'same', startedAt: oct(26), exercises: [exercise('סקוואט', [done(60, 12)])] }),
    ]

    expect(previousSetsLookup(history, oct(26))({ name: 'סקוואט', target: reps(10) })).toEqual([{ weight: 40, amount: 12, done: true }])
  })

  it('carries the note of the session the previous sets come from', () => {
    const history = [
      workout({ id: 'a', startedAt: oct(12), exercises: [{ ...exercise('סקוואט', [done(40, 12)]), note: 'לעלות ל-42.5' }] }),
      workout({ id: 'b', startedAt: oct(19), exercises: [{ ...exercise('סקוואט', [open(45, 12)]), note: 'כאב בברך' }] }),
    ]

    expect(previousSessionLookup(history, oct(26))({ name: 'סקוואט', target: reps(10) })?.note).toBe('לעלות ל-42.5')
  })

  it('returns null for a never-done exercise', () => {
    const history = [workout({ id: 'a', startedAt: oct(19), exercises: [exercise('סקוואט', [done(40, 12)])] })]

    expect(previousSetsLookup(history, oct(26))({ name: 'פלאנק', target: reps(10) })).toBeNull()
  })
})

describe('bestSet', () => {
  it('picks the heaviest done set, then the most reps', () => {
    expect(bestSet([done(40, 12), done(45, 8), done(45, 10), open(60, 10), done(null, 20)])).toEqual({
      weight: 45,
      amount: 10,
      done: true,
    })
  })

  it('ranks bodyweight below any weight', () => {
    expect(bestSet([done(null, 30), done(5, 6)])).toEqual({ weight: 5, amount: 6, done: true })
    expect(bestSet([done(null, 15), done(null, 20)])).toEqual({ weight: null, amount: 20, done: true })
  })

  it('returns null when nothing is done', () => {
    expect(bestSet([open(40, 12)])).toBeNull()
  })
})

describe('exerciseHistory', () => {
  it('lists finished sessions with done sets, newest first', () => {
    const history = [
      workout({ id: 'a', startedAt: oct(12), exercises: [exercise('פלאנק', [done(null, 30), open(null, 30)], seconds(30))] }),
      workout({ id: 'b', startedAt: oct(19), exercises: [exercise('פלאנק', [done(null, 45)], seconds(45))] }),
      workout({ id: 'c', startedAt: oct(21), exercises: [exercise('פלאנק', [open(null, 45)], seconds(45))] }),
      workout({ id: 'd', startedAt: oct(22), exercises: [exercise('סקוואט', [done(40, 12)])] }),
      workout({ id: 'active', startedAt: oct(26), finishedAt: null, exercises: [exercise('פלאנק', [done(null, 60)], seconds(60))] }),
    ]

    expect(exerciseHistory(history, 'פלאנק')).toEqual([
      {
        workoutId: 'b',
        startedAt: oct(19),
        target: { kind: 'duration', seconds: 45 },
        sets: [{ weight: null, amount: 45, done: true }],
        note: '',
      },
      {
        workoutId: 'a',
        startedAt: oct(12),
        target: { kind: 'duration', seconds: 30 },
        sets: [{ weight: null, amount: 30, done: true }],
        note: '',
      },
    ])
  })
})

describe('exerciseNames', () => {
  it('merges routine and workout names, unique and sorted', () => {
    const workouts = [workout({ id: 'a', startedAt: oct(12), exercises: [exercise('לחיצת חזה', []), exercise('סקוואט', [])] })]

    expect(exerciseNames([fullBody], workouts)).toEqual(['לחיצת חזה', 'סקוואט', 'פלאנק'])
  })
})

describe('targetAmount', () => {
  it('returns reps or seconds', () => {
    expect(targetAmount(reps(12))).toBe(12)
    expect(targetAmount(seconds(900))).toBe(900)
  })
})
