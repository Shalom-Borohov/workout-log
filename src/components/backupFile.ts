import { type Backup, countBadRecords, exportBackup, exportRawBackup, parseBackup } from '../data/backup'
import { markBackedUp } from '../data/backupStatus'
import { db } from '../data/db'
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

const saveBackupDate = (now: number) =>
  markBackedUp(now).then(
    () => false,
    (error) => {
      recordLastError(error)

      return true
    },
  )

export async function backUpStoredData(): Promise<BackUpResult> {
  const now = Date.now()
  const databaseFailed = db.hasFailed()
  let badRecords = 0

  try {
    const fileText = JSON.stringify(databaseFailed ? await exportRawBackup(now) : await exportBackup(now))

    badRecords = countBadRecords(fileText)
    await shareFile(backupFileName(now), BACKUP_TYPE, fileText)

    const dateNotSaved = !databaseFailed && (await saveBackupDate(now))

    return { failure: null, dateNotSaved, badRecords }
  } catch (error) {
    return { failure: shareFailure(error), dateNotSaved: false, badRecords }
  }
}
