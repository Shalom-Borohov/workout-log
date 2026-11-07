import { beforeEach, describe, expect, it } from 'vitest'
import { backupStatus, dismissBackupReminder, markBackedUp } from '../../src/data/backupStatus'
import { db } from '../../src/data/db'
import { deleteWorkout, finishedCount, saveRecord } from '../../src/data/repo'
import { isBackupDue } from '../../src/domain/backupReminder'
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

describe('deleting a record after a backup', () => {
  const logged = (id: string, day: number) => workout({ id, startedAt: oct(day), exercises: [exercise('סקוואט', [])] })

  const dueOn = async (now: number) => isBackupDue(await backupStatus(), await finishedCount(), now)

  beforeEach(async () => {
    await resetDb()
    await Promise.all(Array.from({ length: 10 }, (_, index) => saveRecord(logged(`w${index}`, index + 1))))
    await markBackedUp(oct(11))
  })

  it('a new record behind two deleted ones is still due', async () => {
    await deleteWorkout('w0')
    await deleteWorkout('w1')
    await saveRecord(logged('new', 20))

    expect(await dueOn(oct(20))).toBe(true)
  })

  it('stays due when the delete comes after the new record', async () => {
    await saveRecord(logged('new', 20))
    await deleteWorkout('w0')

    expect(await dueOn(oct(20))).toBe(true)
  })

  it('lowers the stored count and keeps the backup time', async () => {
    await deleteWorkout('w0')

    expect(await backupStatus()).toEqual({ backedUpAt: oct(11), records: 9 })
  })

  it('lowers the stored count for a deleted activity too', async () => {
    await saveRecord(activity({ id: 'a1', startedAt: oct(10, 19) }))
    await markBackedUp(oct(11))
    await deleteWorkout('a1')

    expect(await backupStatus()).toEqual({ backedUpAt: oct(11), records: 10 })
  })

  it('leaves the stored count alone when the workout in progress is deleted', async () => {
    await saveRecord(workout({ id: 'running', startedAt: oct(12), finishedAt: null, exercises: [exercise('סקוואט', [])] }))
    await deleteWorkout('running')

    expect(await backupStatus()).toEqual({ backedUpAt: oct(11), records: 10 })
  })

  it('lowers the stored count once when the same record is deleted twice', async () => {
    await deleteWorkout('w0')
    await deleteWorkout('w0')

    expect(await backupStatus()).toEqual({ backedUpAt: oct(11), records: 9 })
  })

  it('never lowers the stored count below 0', async () => {
    await resetDb()
    await markBackedUp(oct(11))
    await saveRecord(logged('new', 12))
    await deleteWorkout('new')

    expect(await backupStatus()).toEqual({ backedUpAt: oct(11), records: 0 })
  })

  it('writes no backup row when there has been no backup', async () => {
    await db.settings.clear()
    await deleteWorkout('w0')

    expect(await backupStatus()).toEqual({ backedUpAt: null, records: 0 })
    expect(await db.settings.get('backup')).toBeUndefined()
  })
})
