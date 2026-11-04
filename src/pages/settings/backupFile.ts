import { type Backup, parseBackup } from '../../data/backup'

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
