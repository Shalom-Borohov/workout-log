import Dexie from 'dexie'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../src/data/db'
import { readRawStoredData } from '../../src/data/rawStoredData'

const withoutSections = { id: 'bad', name: 'שבור', daily: false, createdAt: 8, updatedAt: 8 }

const log = { id: 'd1|2026-10-25', routineId: 'd1', date: '2026-10-25' }

describe('readRawStoredData', () => {
  beforeEach(() => db.delete({ disableAutoOpen: false }))

  it('reads a version 8 database as stored, with empty lists for the tables it does not have yet', async () => {
    const legacyDb = new Dexie(db.name)

    legacyDb.version(8).stores({ routines: 'id, createdAt', workouts: 'id, startedAt, finishedAt', settings: 'key', dailyLogs: 'id' })
    await legacyDb.table('routines').put(withoutSections)
    await legacyDb.table('dailyLogs').put(log)
    legacyDb.close()

    expect(await readRawStoredData()).toEqual({
      routines: [withoutSections],
      workouts: [],
      dailyLogs: [log],
      exerciseAreas: [],
      activityDetails: [],
    })
  })

  it('fails without creating a database when there is none', async () => {
    await expect(readRawStoredData()).rejects.toMatchObject({ name: 'AbortError' })
    expect((await indexedDB.databases()).map((database) => database.name)).not.toContain(db.name)
  })
})
