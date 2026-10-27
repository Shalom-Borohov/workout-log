import { describe, expect, it } from 'vitest'
import { parseNote } from '../../src/domain/parseNote'

const FULL_BODY = `אימון גוף מלא
חימום 2 סטים בבית:
גשר ישבן 10
חרק מת 20
הרמת רגל הצידה בעמידה 10


3 סטים:
סקוואט 15
לאנג׳ אחורי עם משקל 20
דדליפט רומני עם משקולות יד 8 
חתירה אופקית 8
משיכה אנכית 8
לחיצת חזה במכונה בשיפוע 8
פשיטת ירך 10
משיכה לפנים 12 -> הכנסת סנטר 10
יד קדמית 8


סיום:
מדרגות 15 דקות
מתיחת כופפי ירך בכריעה 30 שניות
`

function counter(): () => string {
  let n = 0

  return () => `id${++n}`
}

describe('parseNote', () => {
  it('exercises before a header go to עיקרי', () => {
    const result = parseNote('אימון רגליים\nסקוואט 15', counter())

    expect(result).toEqual({
      name: 'אימון רגליים',
      sections: [
        {
          id: 'id1',
          name: 'עיקרי',
          sets: 1,
          items: [{ id: 'id2', exercises: [{ name: 'סקוואט', target: { kind: 'reps', reps: 15 } }] }],
        },
      ],
    })
  })

  it('default name when first line is an exercise', () => {
    const result = parseNote('סקוואט 15\nחתירה 8', counter())

    expect(result.name).toBe('אימון חדש')
    expect(result.sections[0].items.map((item) => item.exercises[0].name)).toEqual(['סקוואט', 'חתירה'])
  })

  it('parses the full-body sample', () => {
    const result = parseNote(FULL_BODY, counter())

    const summary = result.sections.map((section) => ({
      name: section.name,
      sets: section.sets,
      items: section.items.length,
    }))

    const [warmup, main, finish] = result.sections

    expect(result.name).toBe('אימון גוף מלא')
    expect(summary).toEqual([
      { name: 'חימום בבית', sets: 2, items: 3 },
      { name: 'עיקרי', sets: 3, items: 9 },
      { name: 'סיום', sets: 1, items: 2 },
    ])
    expect(warmup.items[0].exercises).toEqual([{ name: 'גשר ישבן', target: { kind: 'reps', reps: 10 } }])
    expect(main.items[2].exercises).toEqual([
      { name: 'דדליפט רומני עם משקולות יד', target: { kind: 'reps', reps: 8 } },
    ])
    expect(main.items[7].exercises).toEqual([
      { name: 'משיכה לפנים', target: { kind: 'reps', reps: 12 } },
      { name: 'הכנסת סנטר', target: { kind: 'reps', reps: 10 } },
    ])
    expect(finish.items.map((item) => item.exercises)).toEqual([
      [{ name: 'מדרגות', target: { kind: 'duration', seconds: 900 } }],
      [{ name: 'מתיחת כופפי ירך בכריעה', target: { kind: 'duration', seconds: 30 } }],
    ])
  })

  it('accepts unicode arrow', () => {
    const result = parseNote('משיכה לפנים 12 → הכנסת סנטר 10', counter())

    expect(result.sections[0].items[0].exercises).toEqual([
      { name: 'משיכה לפנים', target: { kind: 'reps', reps: 12 } },
      { name: 'הכנסת סנטר', target: { kind: 'reps', reps: 10 } },
    ])
  })

  it('accepts abbreviated units typed with a plain apostrophe', () => {
    const result = parseNote("אימון\nמדרגות 15 דק'\nמתיחה 30 שנ'", counter())

    expect(result.sections[0].items.map((i) => i.exercises[0].target)).toEqual([
      { kind: 'duration', seconds: 900 },
      { kind: 'duration', seconds: 30 },
    ])
  })

  it('line without number gets reps 0', () => {
    const result = parseNote('אימון\nסקוואט 15\nפלאנק', counter())

    expect(result.sections[0].items[1].exercises).toEqual([{ name: 'פלאנק', target: { kind: 'reps', reps: 0 } }])
  })

  it('drops empty sections', () => {
    const result = parseNote('אימון\nחימום:\n3 סטים:\nסקוואט 15\nסיום:', counter())

    expect(result.sections.map((section) => section.name)).toEqual(['עיקרי'])
  })

  it('tolerates blank lines and trailing spaces', () => {
    const result = parseNote('\n  \nאימון רגליים  \n   \nחימום 2 סטים:   \n\nסקוואט 15   \n\n', counter())

    expect(result).toEqual({
      name: 'אימון רגליים',
      sections: [
        {
          id: 'id1',
          name: 'חימום',
          sets: 2,
          items: [{ id: 'id2', exercises: [{ name: 'סקוואט', target: { kind: 'reps', reps: 15 } }] }],
        },
      ],
    })
  })
})
