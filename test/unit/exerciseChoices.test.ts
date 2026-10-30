import { describe, expect, it } from 'vitest'
import { exerciseChoices } from '../../src/domain/exerciseChoices'
import { done, exercise, oct, open, reps, routine, seconds, workout } from '../helpers/workouts'

const SET = [done(40, 10)]

describe('exerciseChoices', () => {
  it('lists done exercises most recent first, then routine-only ones alphabetically', () => {
    const plan = routine('r1', 'אימון גוף מלא', [
      [{ name: 'פלאנק', target: seconds(30) }],
      [{ name: 'סקוואט', target: reps(12) }],
      [{ name: 'אופניים', target: seconds(300) }],
      [{ name: 'בטן', target: reps(20) }],
    ])

    const history = [
      workout({ id: 'a', startedAt: oct(12), exercises: [exercise('חתירה', SET), exercise('סקוואט', SET)] }),
      workout({ id: 'b', startedAt: oct(20), exercises: [exercise('סקוואט', SET)] }),
      workout({ id: 'c', startedAt: oct(16), exercises: [exercise('לחיצת חזה', SET)] }),
    ]

    const choices = exerciseChoices([plan], history)

    expect(choices.map((choice) => [choice.exercise.name, choice.lastDone])).toEqual([
      ['סקוואט', oct(20)],
      ['לחיצת חזה', oct(16)],
      ['חתירה', oct(12)],
      ['אופניים', null],
      ['בטן', null],
      ['פלאנק', null],
    ])
  })

  it('leaves out the new-exercise placeholder', () => {
    const plan = routine('r1', 'אימון גוף מלא', [[{ name: 'תרגיל חדש', target: reps(10) }], [{ name: 'סקוואט', target: reps(12) }]])
    const history = [workout({ id: 'a', startedAt: oct(12), exercises: [exercise('תרגיל חדש', SET), exercise('חתירה', SET)] })]

    expect(exerciseChoices([plan], history).map((choice) => choice.exercise.name)).toEqual(['חתירה', 'סקוואט'])
  })

  it('takes the target and tip from the latest workout with the exercise, without a weight', () => {
    const plan = routine('r1', 'אימון גוף מלא', [[{ name: 'סקוואט', target: reps(12), weight: 50, tip: 'מהתוכנית' }]])

    const history = [
      workout({ id: 'a', startedAt: oct(12), exercises: [{ ...exercise('סקוואט', SET), tip: 'ישן' }] }),
      workout({ id: 'b', startedAt: oct(20), exercises: [{ ...exercise('סקוואט', SET, reps(8)), tip: 'גב ישר' }] }),
    ]

    expect(exerciseChoices([plan], history)).toEqual([
      { exercise: { name: 'סקוואט', target: reps(8), weight: null, tip: 'גב ישר' }, lastDone: oct(20) },
    ])
  })

  it('dates an exercise by the last workout where a set of it was done', () => {
    const history = [
      workout({ id: 'a', startedAt: oct(12), exercises: [exercise('חתירה', [done(40, 12)], reps(12))] }),
      workout({ id: 'b', startedAt: oct(20), exercises: [{ ...exercise('חתירה', [open(40, 8)], reps(8)), skipped: true }] }),
    ]

    expect(exerciseChoices([], history).map((choice) => choice.lastDone)).toEqual([oct(12)])
  })

  it('takes the target and tip from the last workout that has the exercise, even if it was skipped there', () => {
    const plan = routine('r1', 'אימון גוף מלא', [[{ name: 'מתח', target: reps(12), tip: 'מהתוכנית' }]])

    const history = [
      workout({ id: 'a', startedAt: oct(12), exercises: [exercise('חתירה', [done(40, 12)], reps(12))] }),
      workout({
        id: 'b',
        startedAt: oct(20),
        exercises: [
          { ...exercise('חתירה', [open(40, 8)], reps(8)), skipped: true, tip: 'מרפקים צמודים' },
          { ...exercise('מתח', [open(null, 5)], reps(5)), tip: 'עד הסנטר' },
        ],
      }),
    ]

    expect(exerciseChoices([plan], history)).toEqual([
      { exercise: { name: 'חתירה', target: reps(8), weight: null, tip: 'מרפקים צמודים' }, lastDone: oct(12) },
      { exercise: { name: 'מתח', target: reps(5), weight: null, tip: 'עד הסנטר' }, lastDone: null },
    ])
  })

  it('takes a never-done exercise from the most recently updated routine, without a weight', () => {
    const older = { ...routine('r1', 'אימון א', [[{ name: 'פלאנק', target: seconds(30), tip: 'ישן' }]]), updatedAt: oct(10) }
    const newer = { ...routine('r2', 'אימון ב', [[{ name: 'פלאנק', target: seconds(60), weight: 5, tip: 'בטן אסופה' }]]), updatedAt: oct(14) }

    expect(exerciseChoices([older, newer], [])).toEqual([
      { exercise: { name: 'פלאנק', target: seconds(60), weight: null, tip: 'בטן אסופה' }, lastDone: null },
    ])
  })
})
