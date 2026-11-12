import { lastLocation } from '../domain/activities'
import type { Activity, ActivityDetails } from '../domain/types'
import { db } from './db'

export async function activityDetailsMap(): Promise<Map<string, ActivityDetails>> {
  const saved = await db.activityDetails.toArray()

  return new Map(saved.map((details) => [details.name, details]))
}

export async function setActivityNote(name: string, note: string) {
  await db.transaction('rw', db.activityDetails, db.workouts, async () => {
    const saved = await db.activityDetails.get(name)
    const location = saved ? saved.location : lastLocation(await db.workouts.toArray(), name)

    await db.activityDetails.put({ name, note: note.trim(), location })
  })
}

async function writeLocation(name: string, location: string) {
  const saved = await db.activityDetails.get(name)

  await db.activityDetails.put({ name, note: saved ? saved.note : '', location: location.trim() })
}

export async function setActivityLocation(name: string, location: string) {
  await db.transaction('rw', db.activityDetails, () => writeLocation(name, location))
}

async function carryDetails(from: string, to: string) {
  if (from === to) {
    return
  }

  const carried = await db.activityDetails.get(from)

  if (carried && !(await db.activityDetails.get(to))) {
    await db.activityDetails.put({ ...carried, name: to })
  }
}

export async function saveActivity(record: Activity, previous: Activity | null) {
  const typedLocation = record.location !== '' && (previous === null || previous.location !== record.location)

  await db.transaction('rw', db.workouts, db.activityDetails, async () => {
    await db.workouts.put(record)

    if (previous !== null) {
      await carryDetails(previous.name.trim(), record.name)
    }

    if (typedLocation) {
      await writeLocation(record.name, record.location)
    }
  })
}
