import { shareBackup } from '../components/backupFile'
import { isShareCancel } from '../components/shareFile'
import { errorMessage } from '../components/toast'
import { countBadRecords, exportBackup } from '../data/backup'
import { markBackedUp } from '../data/backupStatus'

export interface BackUpResult {
  failure: string | null
  badRecords: number
}

export async function backUpStoredData(): Promise<BackUpResult> {
  const now = Date.now()
  let badRecords = 0

  try {
    const backup = await exportBackup(now)

    badRecords = countBadRecords(backup)
    await shareBackup(backup)
    await markBackedUp(now)

    return { failure: null, badRecords }
  } catch (error) {
    return { failure: isShareCancel(error) ? null : errorMessage(error), badRecords }
  }
}
