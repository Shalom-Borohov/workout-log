import { countBadRecords, exportBackup } from '../data/backup'
import { markBackedUp } from '../data/backupStatus'
import { isoDate } from '../domain/format'
import { shareFailure, shareFile } from './shareFile'

const BACKUP_TYPE = 'application/json'

const backupFileName = (exportedAt: number) => `workouts-backup-${isoDate(exportedAt)}.json`

export interface BackUpResult {
  failure: string | null
  dateNotSaved: boolean
  badRecords: number
}

export async function backUpStoredData(): Promise<BackUpResult> {
  const now = Date.now()
  let badRecords = 0

  try {
    const fileText = JSON.stringify(await exportBackup(now))

    badRecords = countBadRecords(fileText)
    await shareFile(backupFileName(now), BACKUP_TYPE, fileText)

    const dateNotSaved = await markBackedUp(now).then(
      () => false,
      () => true,
    )

    return { failure: null, dateNotSaved, badRecords }
  } catch (error) {
    return { failure: shareFailure(error), dateNotSaved: false, badRecords }
  }
}
