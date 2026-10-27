import { type Backup, parseBackup } from '../../data/backup'
import { pad } from '../../domain/format'

function backupFileName(ts: number): string {
  const d = new Date(ts)

  return `workouts-backup-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}.json`
}

export async function shareBackup(backup: Backup): Promise<void> {
  const file = new File([JSON.stringify(backup)], backupFileName(backup.exportedAt), { type: 'application/json' })

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
