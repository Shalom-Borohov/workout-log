import { beforeEach, describe, expect, it, vi } from 'vitest'
import { exportBackup, parseBackup } from '../../src/data/backup'
import { backupStatus, markBackedUp } from '../../src/data/backupStatus'
import { db } from '../../src/data/db'
import { finishedRecords, saveRoutine, saveWorkout } from '../../src/data/repo'
import { dropExpiredRestoreUndo, restoreBackup, restorePreview, restoreUndo, swapRestore } from '../../src/data/restore'
import { DAY_MS } from '../../src/domain/time'
import { resetDb } from '../helpers/db'
import { LOST_CONNECTION } from '../helpers/saveFailure'
import { oct, routine, workout } from '../helpers/workouts'

const onPhone = workout({ id: 'phone', startedAt: oct(24), exercises: [] })

const inFile = workout({ id: 'file', startedAt: oct(10), exercises: [] })

const oldFile = parseBackup({ version: 2, exportedAt: oct(11), routines: [routine('r1', 'ישן', [])], workouts: [inFile] })

const emptyFile = parseBackup({ version: 2, exportedAt: oct(12), routines: [], workouts: [] })

const ids = async () => (await finishedRecords()).map((record) => record.id)

describe('undoing a restore', () => {
  beforeEach(async () => {
    await resetDb()
    await saveWorkout(onPhone)
    await markBackedUp(oct(24, 12))
  })

  it('a restore keeps what was on the phone for 7 days', async () => {
    await restoreBackup(oldFile, oct(26))

    expect(await ids()).toEqual(['file'])
    expect(await restoreUndo(oct(27))).toEqual({ undone: false, until: oct(26) + 7 * DAY_MS })
    expect(await restoreUndo(oct(26) + 7 * DAY_MS)).toBeNull()
  })

  it('undoing brings back the data and the last backup from before the restore', async () => {
    await restoreBackup(oldFile, oct(26))
    await swapRestore()

    expect(await ids()).toEqual(['phone'])
    expect(await backupStatus()).toEqual({ backedUpAt: oct(24, 12), records: 1 })
    expect(await restoreUndo(oct(27))).toEqual({ undone: true, until: oct(26) + 7 * DAY_MS })
  })

  it('undoing the undo puts the restored file back, with what was logged since kept aside', async () => {
    await restoreBackup(oldFile, oct(26))
    await saveWorkout(workout({ id: 'since', startedAt: oct(27), exercises: [] }))
    await swapRestore()
    await swapRestore()

    expect(await ids()).toEqual(['since', 'file'])
    expect(await backupStatus()).toEqual({ backedUpAt: oct(11), records: 1 })
    expect(await restoreUndo(oct(27))).toEqual({ undone: false, until: oct(26) + 7 * DAY_MS })
  })

  it('a second import while the undo is open keeps the copy from before the first, for 7 days from the second', async () => {
    await restoreBackup(oldFile, oct(26))
    await restoreBackup(emptyFile, oct(27))

    expect(await restoreUndo(oct(28))).toEqual({ undone: false, until: oct(27) + 7 * DAY_MS })

    await swapRestore()

    expect(await ids()).toEqual(['phone'])
    expect(await backupStatus()).toEqual({ backedUpAt: oct(24, 12), records: 1 })
  })

  it('an import after an undo keeps what the phone has then', async () => {
    await restoreBackup(oldFile, oct(26))
    await swapRestore()
    await restoreBackup(emptyFile, oct(27))
    await swapRestore()

    expect(await ids()).toEqual(['phone'])
  })

  it('an import after the 7 days keeps what the phone has then', async () => {
    await restoreBackup(oldFile, oct(26))
    await restoreBackup(emptyFile, oct(26) + 8 * DAY_MS)
    await swapRestore()

    expect(await ids()).toEqual(['file'])
  })

  it('the kept copy is dropped once its 7 days are over', async () => {
    await restoreBackup(oldFile, oct(26))
    await dropExpiredRestoreUndo(oct(26) + 7 * DAY_MS - 1)

    expect(await restoreUndo(oct(27))).not.toBeNull()

    await dropExpiredRestoreUndo(oct(26) + 7 * DAY_MS)

    expect(await restoreUndo(oct(27))).toBeNull()
  })

  it('when the copy can\'t be kept, nothing is restored', async () => {
    vi.spyOn(db.settings, 'put').mockRejectedValueOnce(LOST_CONNECTION)

    await expect(restoreBackup(oldFile, oct(26))).rejects.toThrow()

    vi.restoreAllMocks()

    expect(await ids()).toEqual(['phone'])
    expect(await restoreUndo(oct(27))).toBeNull()
  })

  it('the phone line leaves out a damaged record\'s times', async () => {
    const stringStart = JSON.parse('{"kind":"activity","id":"bad1","name":"x","startedAt":"2026-10-30","finishedAt":5,"summary":"","location":""}')
    const stringEnd = JSON.parse('{"kind":"activity","id":"bad2","name":"x","startedAt":9999999999999,"finishedAt":"x","summary":"","location":""}')

    await db.workouts.bulkPut([stringStart, stringEnd])

    expect((await restorePreview(oldFile))[1]).toBe('במכשיר: אימון אחד, האחרון 24.10.2026')
  })

  it('the kept copy is not in an exported backup', async () => {
    await saveRoutine(routine('r2', 'חדש', []))
    await restoreBackup(oldFile, oct(26))

    expect(Object.keys(await exportBackup(oct(27))).sort()).toEqual(['dailyLogs', 'exerciseAreas', 'exportedAt', 'routines', 'version', 'workouts'])
    expect((await exportBackup(oct(27))).routines.map((saved) => saved.id)).toEqual(['r1'])
  })
})
