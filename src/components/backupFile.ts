import { COMMON_COPY } from '../copy/common'
import { countBadRecords, exportBackup } from '../data/backup'
import { markBackedUp } from '../data/backupStatus'
import { isoDate } from '../domain/format'
import { shareFailure, shareFile } from './shareFile'

const BACKUP_TYPE = 'application/json'

const backupFileName = (exportedAt: number) => `workouts-backup-${isoDate(exportedAt)}.json`

export interface BackUpResult {
  failure: string | null
  badRecords: number
}

export async function backUpStoredData(): Promise<BackUpResult> {
  const now = Date.now()
  let badRecords = 0

  try {
    const fileText = JSON.stringify(await exportBackup(now))

    badRecords = countBadRecords(fileText)
    await shareFile(backupFileName(now), BACKUP_TYPE, fileText)

    const failure = await markBackedUp(now).then(
      () => null,
      () => COMMON_COPY.saveFailed,
    )

    return { failure, badRecords }
  } catch (error) {
    return { failure: shareFailure(error), badRecords }
  }
}
