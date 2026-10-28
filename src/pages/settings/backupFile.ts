import { type Backup, parseBackup } from '../../data/backup'
import { isoDate } from '../../domain/format'

export async function shareFile(name: string, type: string, content: string): Promise<void> {
  const file = new File([content], name, { type })

  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file] })

    return
  }

  const url = URL.createObjectURL(file)
  const link = document.createElement('a')

  link.href = url
  link.download = file.name
  link.click()
  setTimeout(() => URL.revokeObjectURL(url))
}

const BACKUP_TYPE = 'application/json'

const backupFileName = (exportedAt: number) => `workouts-backup-${isoDate(exportedAt)}.json`

export function shareBackup(backup: Backup): Promise<void> {
  return shareFile(backupFileName(backup.exportedAt), BACKUP_TYPE, JSON.stringify(backup))
}

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

export const isShareCancel = (error: unknown) => error instanceof DOMException && error.name === 'AbortError'
