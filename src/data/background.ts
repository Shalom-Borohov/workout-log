import { db } from './db'

export const BACKGROUND_KEY = 'background'

export async function setBackground(image: Blob) {
  await db.settings.put({ key: BACKGROUND_KEY, image })
}

export async function clearBackground() {
  await db.settings.delete(BACKGROUND_KEY)
}
