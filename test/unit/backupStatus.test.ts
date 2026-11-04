import { beforeEach, describe, expect, it } from 'vitest'
import { backupStatus, dismissBackupReminder, markBackedUp } from '../../src/data/backupStatus'
import { finishedCount, saveRecord } from '../../src/data/repo'
import { resetDb } from '../helpers/db'
import { activity, exercise, oct, workout } from '../helpers/workouts'

const finished = workout({ id: 'w1', startedAt: oct(20), exercises: [exercise('סקוואט', [])] })

const active = workout({ id: 'w2', startedAt: oct(26), finishedAt: null, exercises: [exercise('סקוואט', [])] })

const boxing = activity({ id: 'a1', startedAt: oct(21, 19) })

describe('backup status', () => {
  beforeEach(async () => {
    await resetDb()
    await Promise.all([finished, active, boxing].map(saveRecord))
  })

  it('has no backup on record until one is made', async () => {
    expect(await backupStatus()).toEqual({ backedUpAt: null, records: 0 })
  })

  it('counts finished workouts and activities, not the one in progress', async () => {
    expect(await finishedCount()).toBe(2)
  })

  it('records when the backup was made and how much it held', async () => {
    await markBackedUp(oct(26, 9, 30))

    expect(await backupStatus()).toEqual({ backedUpAt: oct(26, 9, 30), records: 2 })
  })

  it('dismissing the reminder keeps the last backup time', async () => {
    await markBackedUp(oct(20))
    await saveRecord(activity({ id: 'a2', startedAt: oct(25, 19) }))
    await dismissBackupReminder()

    expect(await backupStatus()).toEqual({ backedUpAt: oct(20), records: 3 })
  })
})
