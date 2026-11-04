import type { BackupStatus } from '../domain/types'
import { db } from './db'
import { finishedCount } from './repo'

export const BACKUP_KEY = 'backup'

export async function backupStatus(): Promise<BackupStatus> {
  const setting = await db.settings.get(BACKUP_KEY)

  if (setting?.key !== BACKUP_KEY) {
    return { backedUpAt: null, records: 0 }
  }

  return { backedUpAt: setting.backedUpAt, records: setting.records }
}

function saveStatus(backedUpAt: (current: BackupStatus) => number | null) {
  return db.transaction('rw', db.workouts, db.settings, async () => {
    const records = await finishedCount()

    await db.settings.put({ key: BACKUP_KEY, backedUpAt: backedUpAt(await backupStatus()), records })
  })
}

export async function markBackedUp(at: number) {
  await saveStatus(() => at)
}

export async function dismissBackupReminder() {
  await saveStatus((current) => current.backedUpAt)
}
