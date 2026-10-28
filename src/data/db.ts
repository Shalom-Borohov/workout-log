import Dexie, { type EntityTable } from 'dexie'
import type { BackgroundSetting, Routine, Workout } from '../domain/types'
import { type LegacyRoutine, type LegacyWorkout, upgradeRoutine, upgradeWorkout } from './migrate'

const DB_NAME = 'workout-log'

class WorkoutDb extends Dexie {
  routines!: EntityTable<Routine, 'id'>
  workouts!: EntityTable<Workout, 'id'>
  settings!: EntityTable<BackgroundSetting, 'key'>

  constructor() {
    super(DB_NAME)
    this.version(1).stores({
      routines: 'id, name',
      workouts: 'id, startedAt',
    })
    this.version(2).stores({
      workouts: 'id, startedAt, finishedAt',
    })
    this.version(3)
      .stores({ settings: 'key' })
      .upgrade(async (transaction) => {
        await transaction
          .table<LegacyRoutine>('routines')
          .toCollection()
          .modify((routine, ref) => {
            ref.value = upgradeRoutine(routine)
          })
        await transaction
          .table<LegacyWorkout>('workouts')
          .toCollection()
          .modify((workout, ref) => {
            ref.value = upgradeWorkout(workout)
          })
      })
  }
}

export const db = new WorkoutDb()
