import { restorePreviewLines, summarizeWorkouts } from '../domain/restorePreview'
import { DAY_MS } from '../domain/time'
import type { RestoreCopySetting, RestoreUndoSetting } from '../domain/types'
import type { Backup } from './backup'
import { backupStatus, markBackedUp, setBackupStatus } from './backupStatus'
import { db, RESTORE_COPY_KEY } from './db'
import { phoneWorkoutSummary } from './repo'
import { readStoredData, replaceStoredData, storedDataTables } from './storedData'

const RESTORE_UNDO_KEY = 'restoreUndo'

const RESTORE_UNDO_DAYS = 7

export type RestoreUndo = Omit<RestoreUndoSetting, 'key'>

const inRestoreTransaction = (work: () => Promise<void>) => db.transaction('rw', [...storedDataTables(), db.settings], work)

const isOpen = (undo: RestoreUndo, now: number) => undo.until > now

async function undoSetting(): Promise<RestoreUndoSetting | undefined> {
  const setting = await db.settings.get(RESTORE_UNDO_KEY)

  return setting?.key === RESTORE_UNDO_KEY ? setting : undefined
}

async function keptCopy(): Promise<RestoreCopySetting | undefined> {
  const setting = await db.settings.get(RESTORE_COPY_KEY)

  return setting?.key === RESTORE_COPY_KEY ? setting : undefined
}

async function currentState() {
  const [data, status] = await Promise.all([readStoredData(), backupStatus()])

  return { ...data, status }
}

export async function restorePreview(backup: Backup): Promise<string[]> {
  return restorePreviewLines(summarizeWorkouts(backup.workouts), await phoneWorkoutSummary())
}

export async function restoreBackup(backup: Backup, now: number): Promise<void> {
  await inRestoreTransaction(async () => {
    const undo = await undoSetting()
    const keepsEarlierCopy = undo !== undefined && isOpen(undo, now) && !undo.undone

    if (!keepsEarlierCopy) {
      await db.settings.put({ key: RESTORE_COPY_KEY, ...(await currentState()) })
    }

    await replaceStoredData(backup)
    await markBackedUp(backup.exportedAt)
    await db.settings.put({ key: RESTORE_UNDO_KEY, until: now + RESTORE_UNDO_DAYS * DAY_MS, undone: false })
  })
}

export async function swapRestore(): Promise<void> {
  await inRestoreTransaction(async () => {
    const [undo, kept] = await Promise.all([undoSetting(), keptCopy()])

    if (!undo || !kept) {
      return
    }

    const current = await currentState()

    await replaceStoredData(kept)
    await setBackupStatus(kept.status)
    await db.settings.put({ ...kept, ...current })
    await db.settings.put({ ...undo, undone: !undo.undone })
  })
}

export async function restoreUndo(now: number): Promise<RestoreUndo | null> {
  const undo = await undoSetting()

  return undo && isOpen(undo, now) ? { undone: undo.undone, until: undo.until } : null
}

export async function dropExpiredRestoreUndo(now: number): Promise<void> {
  const undo = await undoSetting()

  if (undo && !isOpen(undo, now)) {
    await db.settings.bulkDelete([RESTORE_UNDO_KEY, RESTORE_COPY_KEY])
  }
}
