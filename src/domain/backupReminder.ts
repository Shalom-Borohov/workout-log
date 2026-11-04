import { daysSince } from './time'
import type { BackupStatus } from './types'

export const BACKUP_REMINDER_DAYS = 7

export function isBackupDue({ backedUpAt, records }: BackupStatus, finishedRecords: number, now: number) {
  if (finishedRecords <= records) {
    return false
  }

  return backedUpAt === null || daysSince(backedUpAt, now) >= BACKUP_REMINDER_DAYS
}
