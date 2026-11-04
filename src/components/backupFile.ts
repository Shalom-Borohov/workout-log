import type { Backup } from '../data/backup'
import { isoDate } from '../domain/format'
import { shareFile } from './shareFile'

const BACKUP_TYPE = 'application/json'

const backupFileName = (exportedAt: number) => `workouts-backup-${isoDate(exportedAt)}.json`

export function shareBackup(backup: Backup): Promise<void> {
  return shareFile(backupFileName(backup.exportedAt), BACKUP_TYPE, JSON.stringify(backup))
}
