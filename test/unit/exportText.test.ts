import { describe, expect, it } from 'vitest'
import { historyText } from '../../src/domain/exportText'
import { done, exercise, oct, open, seconds, workout } from '../helpers/workouts'

describe('historyText', () => {
  it('writes a workout as a heading, its section and one line per exercise', () => {
    const legs = workout({
      id: 'w1',
      startedAt: oct(26, 8),
      finishedAt: oct(26, 8, 45),
      exercises: [exercise('לחיצת חזה', [done(20, 10), done(20, 10), done(22.5, 8)]), exercise('מתח', [done(null, 6)])],
    })

    expect(historyText([legs])).toBe(
      ['אימון גוף מלא · יום ב׳ 26.10.2026 · 45 דק׳', 'עיקרי', 'לחיצת חזה: 20 × 10, 20 × 10, 22.5 × 8', 'מתח: 6'].join('\n'),
    )
  })

  it('writes skipped, undone and timed exercises', () => {
    const mixed = workout({
      id: 'w1',
      startedAt: oct(26, 8),
      exercises: [
        { ...exercise('סקוואט', [done(40, 12)]), skipped: true },
        exercise('לחיצה', [open(30, 8)]),
        exercise('פלאנק', [done(null, 60), done(null, 45)], seconds(60)),
        exercise('חבל', [done(10, 120)], seconds(120)),
      ],
    })

    expect(historyText([mixed]).split('\n').slice(2)).toEqual([
      'סקוואט: דילגת',
      'לחיצה: לא בוצע',
      'פלאנק: 1 דק׳, 45 שנ׳',
      'חבל: 10 × 2 דק׳',
    ])
  })

  it('ends a workout with its summary and separates workouts with a blank line', () => {
    const newer = {
      ...workout({ id: 'w2', startedAt: oct(26, 8), exercises: [exercise('סקוואט', [done(40, 12)])] }),
      summary: ' הרגשתי חזק\nהברך כאבה \n',
    }

    const older = workout({ id: 'w1', startedAt: oct(19, 8), exercises: [exercise('סקוואט', [done(35, 12)])] })

    expect(historyText([newer, older])).toBe(
      [
        'אימון גוף מלא · יום ב׳ 26.10.2026 · 60 דק׳',
        'עיקרי',
        'סקוואט: 40 × 12',
        'הרגשתי חזק\nהברך כאבה',
        '',
        'אימון גוף מלא · יום ב׳ 19.10.2026 · 60 דק׳',
        'עיקרי',
        'סקוואט: 35 × 12',
      ].join('\n'),
    )
  })
})
