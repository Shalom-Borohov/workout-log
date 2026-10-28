import { db } from '../../src/data/db'

export async function resetDb() {
  await db.routines.clear()
  await db.workouts.clear()
  await db.settings.clear()
}
