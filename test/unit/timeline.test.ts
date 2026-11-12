import { describe, expect, it } from 'vitest'
import type { Change } from '../../src/domain/progress'
import { changeHolders, groupByWeek, summarize, summaryLine, weekDays, weekStart } from '../../src/domain/timeline'
import { activity, done, exercise, oct, open, reps, workout } from '../helpers/workouts'

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

  it('an activity has its minutes and no sets', () => {
    expect(summarize(activity({ id: 'boxing', startedAt: oct(26, 19), finishedAt: oct(26, 20, 15) }))).toEqual({
      minutes: 75,
      doneSets: 0,
    })
  })

  it('an activity line shows its minutes, then its location when it has one', () => {
    const football = { id: 'a1', name: 'כדורגל', startedAt: oct(26, 19), finishedAt: oct(26, 20) }

    expect(summaryLine(activity({ ...football, location: 'פארק הירקון' }))).toBe('60 דק׳ · פארק הירקון')
    expect(summaryLine(activity(football))).toBe('60 דק׳')
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

  it('gives each week the midnight of its Sunday', () => {
    const workouts = [
      workout({ id: 'tue', startedAt: oct(27), exercises: [] }),
      workout({ id: 'sat', startedAt: oct(24, 23, 0), exercises: [] }),
    ]

    expect(groupByWeek(workouts, oct(28)).map((group) => group.start)).toEqual([
      new Date(2026, 9, 25).getTime(),
      new Date(2026, 9, 18).getTime(),
    ])
  })
})

const midnight = (dayOfOctober: number) => new Date(2026, 9, dayOfOctober).getTime()

const SUNDAY_25_OCT = midnight(25)

describe('weekDays', () => {
  it('gives the seven days of the week from midnight, Sunday first, also across a clock change', () => {
    const days = weekDays(weekStart(oct(28, 12)), [], oct(28, 12))

    expect(days.map((day) => day.date)).toEqual([25, 26, 27, 28, 29, 30, 31].map(midnight))
  })

  it('marks gym days and activity days, and ignores records from other weeks', () => {
    const records = [
      workout({ id: 'sun', startedAt: oct(25, 0, 10), exercises: [] }),
      activity({ id: 'mon', startedAt: oct(26, 19) }),
      workout({ id: 'sat', startedAt: oct(31, 23, 30), exercises: [] }),
      workout({ id: 'before', startedAt: oct(24, 23, 30), exercises: [] }),
      activity({ id: 'after', startedAt: new Date(2026, 10, 1, 0, 30).getTime() }),
    ]

    const days = weekDays(SUNDAY_25_OCT, records, oct(31, 23, 50))

    expect(days.map((day) => day.kind)).toEqual(['gym', 'activity', 'none', 'none', 'none', 'none', 'gym'])
    expect(days.map((day) => day.record && day.record.id)).toEqual(['sun', 'mon', null, null, null, null, 'sat'])
  })

  it('a day with a gym workout and an activity is a gym day that opens the workout', () => {
    const records = [activity({ id: 'boxing', startedAt: oct(27, 7) }), workout({ id: 'gym', startedAt: oct(27, 18), exercises: [] })]

    const tuesday = weekDays(SUNDAY_25_OCT, records, oct(31, 12))[2]

    expect(tuesday.kind).toBe('gym')
    expect(tuesday.record && tuesday.record.id).toBe('gym')
  })

  it('a day with two records of the same kind opens the earliest', () => {
    const records = [activity({ id: 'evening', startedAt: oct(27, 19) }), activity({ id: 'morning', startedAt: oct(27, 8) })]

    const tuesday = weekDays(SUNDAY_25_OCT, records, oct(31, 12))[2]

    expect(tuesday.kind).toBe('activity')
    expect(tuesday.record && tuesday.record.id).toBe('morning')
  })

  it('marks today, and the days after it as future', () => {
    const days = weekDays(SUNDAY_25_OCT, [], oct(28, 12))

    expect(days.map((day) => day.isToday)).toEqual([false, false, false, true, false, false, false])
    expect(days.map((day) => day.isFuture)).toEqual([false, false, false, false, true, true, true])
  })

  it('a past week has no today and no future days', () => {
    const days = weekDays(SUNDAY_25_OCT, [], new Date(2026, 10, 4, 12).getTime())

    expect(days.some((day) => day.isToday || day.isFuture)).toBe(false)
  })
})

describe('changeHolders', () => {
  it('puts a change on the row that holds its best set, once per exercise', () => {
    const light = exercise('סקוואט', [done(20, 10)])
    const heavy = exercise('סקוואט', [done(22, 10), open(24, 10)])
    const unchanged = exercise('חתירה', [done(30, 10)])
    const change: Change = { name: 'סקוואט', kind: 'up', set: done(22, 10), target: reps(10) }

    const holders = changeHolders([light, heavy, unchanged], [change])

    expect([...holders]).toEqual([[heavy, change]])
  })
})
