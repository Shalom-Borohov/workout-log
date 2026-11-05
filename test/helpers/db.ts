import { db } from '../../src/data/db'
import { isRoutineWorkout } from '../../src/domain/activities'
import type { Workout } from '../../src/domain/types'

export async function resetDb() {
  await db.routines.clear()
  await db.workouts.clear()
  await db.settings.clear()
  await db.dailyLogs.clear()
}

export async function savedWorkout(id: string): Promise<Workout | undefined> {
  const record = await db.workouts.get(id)

  return record && isRoutineWorkout(record) ? record : undefined
}

export const firstSectionNames = async (id: string) =>
  (await savedWorkout(id))?.sections[0].items.map((item) => item.exercises[0].name)
