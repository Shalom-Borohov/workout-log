import type { DataSnapshot } from '../domain/types'
import { db } from './db'
import { storedDataTables } from './storedData'

export type StoredLists = Record<keyof DataSnapshot, unknown[]>

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function openAtStoredVersion(): Promise<IDBDatabase> {
  const request = indexedDB.open(db.name)

  request.onupgradeneeded = () => request.transaction?.abort()

  return requestResult(request)
}

export async function readRawStoredData(): Promise<StoredLists> {
  const connection = await openAtStoredVersion()

  try {
    const storedNames = storedDataTables()
      .map((table) => table.name)
      .filter((name) => connection.objectStoreNames.contains(name))

    const transaction = connection.transaction(storedNames, 'readonly')

    const readAll = (name: string): Promise<unknown[]> =>
      storedNames.includes(name) ? requestResult(transaction.objectStore(name).getAll()) : Promise.resolve([])

    const [routines, workouts, dailyLogs, exerciseAreas, activityDetails] = await Promise.all([
      readAll(db.routines.name),
      readAll(db.workouts.name),
      readAll(db.dailyLogs.name),
      readAll(db.exerciseAreas.name),
      readAll(db.activityDetails.name),
    ])

    return { routines, workouts, dailyLogs, exerciseAreas, activityDetails }
  } finally {
    connection.close()
  }
}
