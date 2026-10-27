import Dexie, { type EntityTable } from 'dexie'
import type { Routine, Workout } from '../domain/types'

class WorkoutDb extends Dexie {
  routines!: EntityTable<Routine, 'id'>
  workouts!: EntityTable<Workout, 'id'>

  constructor() {
    super('workout-log')
    this.version(1).stores({
      routines: 'id, name',
      workouts: 'id, startedAt',
    })
    this.version(2).stores({
      workouts: 'id, startedAt, finishedAt',
    })
  }
}

export const db = new WorkoutDb()
