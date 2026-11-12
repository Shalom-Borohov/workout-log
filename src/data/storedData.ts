import type { DataSnapshot } from '../domain/types'
import { db } from './db'

export const storedDataTables = () => [db.routines, db.workouts, db.dailyLogs, db.exerciseAreas, db.activityDetails]

export async function readStoredData(): Promise<DataSnapshot> {
  const [routines, workouts, dailyLogs, exerciseAreas, activityDetails] = await Promise.all([
    db.routines.toArray(),
    db.workouts.toArray(),
    db.dailyLogs.toArray(),
    db.exerciseAreas.toArray(),
    db.activityDetails.toArray(),
  ])

  return { routines, workouts, dailyLogs, exerciseAreas, activityDetails }
}

export async function replaceStoredData(data: DataSnapshot) {
  await Promise.all(storedDataTables().map((table) => table.clear()))
  await Promise.all([
    db.routines.bulkPut(data.routines),
    db.workouts.bulkPut(data.workouts),
    db.dailyLogs.bulkPut(data.dailyLogs),
    db.exerciseAreas.bulkPut(data.exerciseAreas),
    db.activityDetails.bulkPut(data.activityDetails),
  ])
}
