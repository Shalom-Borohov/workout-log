import type { BodyArea } from '../domain/bodyAreas'
import { db } from './db'

export async function exerciseAreaMap(): Promise<Map<string, BodyArea>> {
  const saved = await db.exerciseAreas.toArray()

  return new Map(saved.map(({ name, area }) => [name, area]))
}

export async function setExerciseArea(name: string, area: BodyArea | null) {
  if (area === null) {
    await db.exerciseAreas.delete(name)

    return
  }

  await db.exerciseAreas.put({ name, area })
}

export async function claimExerciseArea(name: string, area: BodyArea) {
  await db.transaction('rw', db.exerciseAreas, async () => {
    if (!(await db.exerciseAreas.get(name))) {
      await db.exerciseAreas.put({ name, area })
    }
  })
}

export async function carryExerciseArea(from: string, to: string) {
  if (from === to) {
    return
  }

  await db.transaction('rw', db.exerciseAreas, async () => {
    const carried = await db.exerciseAreas.get(from)

    if (carried) {
      await claimExerciseArea(to, carried.area)
    }
  })
}
