import Dexie from 'dexie'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../src/data/db'
import { reps, routine } from '../helpers/workouts'

describe('database upgrade to exercise areas', () => {
  beforeEach(() => db.delete({ disableAutoOpen: false }))

  it('keeps every v9 record and starts with no exercise areas', async () => {
    const v9Routine = routine('r1', 'אימון רגליים', [[{ name: 'סקוואט', target: reps(12) }]])

    const legacyDb = new Dexie('workout-log')
    legacyDb.version(9).stores({ routines: 'id, createdAt', workouts: 'id, startedAt, finishedAt', settings: 'key', dailyLogs: 'id' })
    await legacyDb.table('routines').put(v9Routine)
    legacyDb.close()

    expect(await db.routines.toArray()).toEqual([v9Routine])
    expect(await db.exerciseAreas.count()).toBe(0)
  })
})
