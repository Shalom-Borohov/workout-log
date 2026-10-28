import { describe, expect, it } from 'vitest'
import { groupByWeek, summarize } from '../../src/domain/timeline'
import { done, exercise, oct, open, workout } from '../helpers/workouts'

describe('summarize', () => {
  it('summary counts done sets only', () => {
    const finished =workout({
      id: 'a',
      startedAt: oct(26, 10, 0),
      finishedAt: oct(26, 10, 47) + 30000,
      exercises: [
        exercise('סקוואט', [done(40, 12), done(40, 12), open(40, 12)]),
        { ...exercise('לחיצת חזה', [open(30, 10)]), skipped: true },
        exercise('פלאנק', [done(null, 30)]),
      ],
    })

    expect(summarize(finished)).toEqual({ minutes: 48, doneSets: 3 })
  })

  it('does not count ticked sets of a skipped exercise', () => {
    const finished =workout({
      id: 'a',
      startedAt: oct(26),
      exercises: [exercise('סקוואט', [done(40, 12)]), { ...exercise('לחיצת חזה', [done(30, 10)]), skipped: true }],
    })

    expect(summarize(finished).doneSets).toBe(1)
  })
})

const titlesAndIds = (groups: { title: string; workouts: { id: string }[] }[]) =>
  groups.map((group) => [group.title, group.workouts.map((entry) => entry.id)])

describe('groupByWeek', () => {
  it('week starts on Sunday', () => {
    const workouts = [
      workout({ id: 'sat', startedAt: oct(24, 23, 0), exercises: [] }),
      workout({ id: 'sun', startedAt: oct(25, 0, 30), exercises: [] }),
    ]

    expect(titlesAndIds(groupByWeek(workouts, oct(26)))).toEqual([
      ['השבוע', ['sun']],
      ['שבוע שעבר', ['sat']],
    ])
  })

  it('titles older weeks by Sunday–Saturday range, newest first', () => {
    const workouts = [
      workout({ id: 'sep30', startedAt: new Date(2026, 8, 30, 18, 0).getTime(), exercises: [] }),
      workout({ id: 'oct13', startedAt: oct(13), exercises: [] }),
      workout({ id: 'oct26', startedAt: oct(26, 7, 0), exercises: [] }),
      workout({ id: 'oct15', startedAt: oct(15), exercises: [] }),
      workout({ id: 'oct11', startedAt: oct(11, 0, 0), exercises: [] }),
    ]

    expect(titlesAndIds(groupByWeek(workouts, oct(26)))).toEqual([
      ['השבוע', ['oct26']],
      ['11.10–17.10', ['oct15', 'oct13', 'oct11']],
      ['27.9–3.10', ['sep30']],
    ])
  })
})
