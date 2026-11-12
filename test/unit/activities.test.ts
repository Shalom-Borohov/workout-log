import { describe, expect, it } from 'vitest'
import {
  activityNames,
  activitySessions,
  lastLocation,
  latestActivities,
  recordMinutes,
  rememberedLocation,
} from '../../src/domain/activities'
import { pastTimeProblems } from '../../src/domain/pastTime'
import { activity, oct, workout } from '../helpers/workouts'

describe('activity names', () => {
  it('lists each past activity name once, most recent first, ignoring routine workouts', () => {
    const records = [
      activity({ id: 'a1', name: 'פילאטיס מכשירים', startedAt: oct(10) }),
      workout({ id: 'w1', startedAt: oct(22), exercises: [] }),
      activity({ id: 'a2', name: 'אגרוף תאילנדי', startedAt: oct(20) }),
      activity({ id: 'a3', name: 'פילאטיס מכשירים', startedAt: oct(14) }),
      activity({ id: 'a4', name: ' אגרוף תאילנדי ', startedAt: oct(6) }),
    ]

    expect(activityNames(records)).toEqual(['אגרוף תאילנדי', 'פילאטיס מכשירים'])
  })
})

describe('last location', () => {
  const records = [
    activity({ id: 'a1', name: 'כדורגל', startedAt: oct(10), location: 'פארק הירקון' }),
    activity({ id: 'a2', name: ' כדורגל ', startedAt: oct(14), location: 'מגרש השכונה' }),
    activity({ id: 'a3', name: 'כדורגל', startedAt: oct(20) }),
    activity({ id: 'a4', name: 'כדורסל', startedAt: oct(22), location: 'אולם הספורט' }),
    workout({ id: 'w1', startedAt: oct(24), exercises: [] }),
  ]

  it('takes the newest location given for that name, skipping ones left empty', () => {
    expect(lastLocation(records, 'כדורגל')).toBe('מגרש השכונה')
  })

  it('is empty for a name with no location or no past activity', () => {
    expect(lastLocation([activity({ id: 'a1', name: 'פילאטיס', startedAt: oct(10) })], 'פילאטיס')).toBe('')
    expect(lastLocation(records, 'כדורעף')).toBe('')
  })
})

describe('remembered location', () => {
  const records = [activity({ id: 'a1', startedAt: oct(20), location: 'מועדון הגבעה' })]

  it('is the one saved for the activity name when there is one', () => {
    const details = new Map([['אגרוף תאילנדי', { name: 'אגרוף תאילנדי', note: '', location: 'אולם חדש' }]])

    expect(rememberedLocation(records, details, 'אגרוף תאילנדי')).toBe('אולם חדש')
  })

  it('is empty when the saved location was cleared', () => {
    const details = new Map([['אגרוף תאילנדי', { name: 'אגרוף תאילנדי', note: 'קומה 2', location: '' }]])

    expect(rememberedLocation(records, details, 'אגרוף תאילנדי')).toBe('')
  })

  it('falls back to the newest session’s location when nothing is saved for the name', () => {
    expect(rememberedLocation(records, new Map(), 'אגרוף תאילנדי')).toBe('מועדון הגבעה')
  })
})

describe('activity sessions', () => {
  it('lists the sessions of one activity name, newest first, with their minutes', () => {
    const records = [
      activity({ id: 'a1', name: 'ריצה', startedAt: oct(10, 7), finishedAt: oct(10, 7, 45) }),
      activity({ id: 'a2', startedAt: oct(20, 19) }),
      workout({ id: 'w1', startedAt: oct(22), exercises: [] }),
      activity({ id: 'a3', name: ' ריצה ', startedAt: oct(14, 7), finishedAt: oct(14, 8, 30) }),
    ]

    expect(activitySessions(records, 'ריצה')).toEqual([
      { id: 'a3', startedAt: oct(14, 7), minutes: 90 },
      { id: 'a1', startedAt: oct(10, 7), minutes: 45 },
    ])
  })
})

describe('latest activities', () => {
  it('lists each activity name once with its newest session, newest first, ignoring routine workouts', () => {
    const records = [
      activity({ id: 'a1', name: 'ריצה', startedAt: oct(10, 7), finishedAt: oct(10, 7, 45) }),
      activity({ id: 'a2', name: 'אגרוף תאילנדי', startedAt: oct(20, 19) }),
      workout({ id: 'w1', startedAt: oct(22), exercises: [] }),
      activity({ id: 'a3', name: ' ריצה ', startedAt: oct(14, 7), finishedAt: oct(14, 8, 30) }),
    ]

    expect(latestActivities(records)).toEqual([
      { name: 'אגרוף תאילנדי', last: { id: 'a2', startedAt: oct(20, 19), minutes: 60 } },
      { name: 'ריצה', last: { id: 'a3', startedAt: oct(14, 7), minutes: 90 } },
    ])
  })

  it('is empty with no activities', () => {
    expect(latestActivities([workout({ id: 'w1', startedAt: oct(22), exercises: [] })])).toEqual([])
  })
})

describe('record minutes', () => {
  it('rounds the time from start to finish to whole minutes', () => {
    expect(recordMinutes(activity({ id: 'a1', startedAt: oct(10, 7), finishedAt: oct(10, 7, 45) + 31000 }))).toBe(46)
  })

  it('is 0 for a workout still running', () => {
    expect(recordMinutes(workout({ id: 'w1', startedAt: oct(22), finishedAt: null, exercises: [] }))).toBe(0)
  })
})

describe('past time problems', () => {
  const now = oct(26, 12)

  it('accepts a past session that ended by now', () => {
    expect(pastTimeProblems(oct(26, 10), 60, now)).toEqual({ inFuture: false, endsAfterNow: false, tooLong: false, valid: true })
  })

  it('flags a start in the future', () => {
    expect(pastTimeProblems(oct(26, 12, 30), 60, now)).toMatchObject({ inFuture: true, endsAfterNow: false, valid: false })
  })

  it('flags a session still running now', () => {
    expect(pastTimeProblems(oct(26, 11, 30), 45, now)).toMatchObject({ inFuture: false, endsAfterNow: true, valid: false })
  })

  it('flags more than 3 hours', () => {
    expect(pastTimeProblems(oct(24), 181, now)).toMatchObject({ tooLong: true, valid: false })
    expect(pastTimeProblems(oct(24), 180, now)).toMatchObject({ tooLong: false, valid: true })
  })

  it.each([
    ['no duration', oct(24), 0],
    ['a fractional duration', oct(24), 1.5],
    ['an unreadable start', Number.NaN, 60],
  ])('is invalid with %s', (_case, startedAt, minutes) => {
    expect(pastTimeProblems(startedAt, minutes, now).valid).toBe(false)
  })
})
