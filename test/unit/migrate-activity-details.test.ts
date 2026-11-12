import Dexie from 'dexie'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../src/data/db'
import { swapRestore } from '../../src/data/restore'
import { oct, reps, routine } from '../helpers/workouts'

const V10_STORES = {
  routines: 'id, createdAt',
  workouts: 'id, startedAt, finishedAt',
  settings: 'key',
  dailyLogs: 'id',
  exerciseAreas: 'name',
}

const onPhone = routine('r1', 'אימון רגליים', [[{ name: 'סקוואט', target: reps(12) }]])

const keptAside = routine('r0', 'אימון ישן', [])

const v10Copy = {
  key: 'restoreCopy',
  routines: [keptAside],
  workouts: [],
  dailyLogs: [],
  exerciseAreas: [{ name: 'סקוואט', area: 'legs' }],
  status: { backedUpAt: oct(20), records: 0 },
}

async function openV10WithData() {
  const legacyDb = new Dexie('workout-log')
  legacyDb.version(10).stores(V10_STORES)
  await legacyDb.table('routines').put(onPhone)
  await legacyDb.table('settings').bulkPut([v10Copy, { key: 'restoreUndo', until: oct(30), undone: false }])
  legacyDb.close()
}

describe('database upgrade to activity details', () => {
  beforeEach(() => db.delete({ disableAutoOpen: false }))

  it('keeps every v10 record and starts with no activity details', async () => {
    await openV10WithData()

    expect(await db.routines.toArray()).toEqual([onPhone])
    expect(await db.activityDetails.count()).toBe(0)
  })

  it('gives a kept restore copy an empty list of activity details', async () => {
    await openV10WithData()

    expect(await db.settings.get('restoreCopy')).toEqual({ ...v10Copy, activityDetails: [] })
  })

  it('undoing a restore kept before the upgrade still works', async () => {
    await openV10WithData()
    await swapRestore()

    expect(await db.routines.toArray()).toEqual([keptAside])
    expect(await db.exerciseAreas.toArray()).toEqual([{ name: 'סקוואט', area: 'legs' }])
    expect(await db.activityDetails.count()).toBe(0)
  })
})
