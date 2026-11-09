import { type Backup, countBadRecords, exportBackup, parseBackup } from '../data/backup'
import { markBackedUp } from '../data/backupStatus'
import { recordLastError } from '../data/lastError'
import { isoDate } from '../domain/format'
import { shareFailure, shareFile } from './shareFile'

const BACKUP_TYPE = 'application/json'

export const BACKUP_FILE_ACCEPT = `${BACKUP_TYPE},.json`

const backupFileName = (exportedAt: number) => `workouts-backup-${isoDate(exportedAt)}.json`

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

export async function readBackup(file: File): Promise<Backup> {
  return parseBackup(parseJson(await file.text()))
}

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
      (error) => {
        recordLastError(error)

        return true
      },
    )

    return { failure: null, dateNotSaved, badRecords }
  } catch (error) {
    return { failure: shareFailure(error), dateNotSaved: false, badRecords }
  }
}
