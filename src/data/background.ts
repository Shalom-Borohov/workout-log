import type { BackgroundSetting } from '../domain/types'
import { db } from './db'

export const BACKGROUND_KEY = 'background'

export async function background(): Promise<BackgroundSetting | undefined> {
  const setting = await db.settings.get(BACKGROUND_KEY)

  return setting?.key === BACKGROUND_KEY ? setting : undefined
}

export async function setBackground(image: Blob) {
  await db.settings.put({ key: BACKGROUND_KEY, image })
}

export async function clearBackground() {
  await db.settings.delete(BACKGROUND_KEY)
}
