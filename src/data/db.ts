import Dexie, { type EntityTable, type Transaction } from 'dexie'
import type { DailyLog, Routine, Setting, WorkoutRecord } from '../domain/types'
import {
  carryNotesForward,
  colorDailyRoutines,
  type LegacyDailyLog,
  type LegacyRecord,
  type LegacyRoutine,
  type LegacyWorkout,
  upgradeDailyLogs,
  upgradeRecord,
  upgradeRoutine,
  upgradeWorkout,
} from './migrate'

const DB_NAME = 'workout-log'

function upgradeRoutines(transaction: Transaction) {
  return transaction
    .table<LegacyRoutine>('routines')
    .toCollection()
    .modify((routine, ref) => {
      ref.value = upgradeRoutine(routine)
    })
}

function upgradeActivities(transaction: Transaction) {
  return transaction
    .table<LegacyRecord>('workouts')
    .filter((record) => record.kind === 'activity')
    .modify((record, ref) => {
      ref.value = upgradeRecord(record)
    })
}

class WorkoutDb extends Dexie {
  routines!: EntityTable<Routine, 'id'>
  workouts!: EntityTable<WorkoutRecord, 'id'>
  // Dexie's default insert type doesn't distribute over a union, so inserts take a whole Setting.
  settings!: EntityTable<Setting, 'key', Setting>
  dailyLogs!: EntityTable<DailyLog, 'id'>

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
        await upgradeRoutines(transaction)
        await transaction
          .table<LegacyWorkout>('workouts')
          .toCollection()
          .modify((workout, ref) => {
            ref.value = upgradeWorkout(workout)
          })
      })
    this.version(4)
      .stores({ routines: 'id, createdAt' })
      .upgrade(upgradeRoutines)
    this.version(5)
      .stores({})
      .upgrade((transaction) =>
        transaction
          .table<LegacyWorkout>('workouts')
          .toCollection()
          .modify((workout) => {
            workout.kind = 'routine'
          }),
      )
    this.version(6).stores({}).upgrade(upgradeActivities)
    this.version(7)
      .stores({ dailyLogs: 'id' })
      .upgrade(upgradeRoutines)
    this.version(8)
      .stores({})
      .upgrade(async (transaction) => {
        const workouts = transaction.table<WorkoutRecord>('workouts')

        await workouts.bulkPut(carryNotesForward(await workouts.toArray()))
      })
    this.version(9)
      .stores({})
      .upgrade(async (transaction) => {
        const routines = transaction.table<LegacyRoutine>('routines')
        const logs = transaction.table<LegacyDailyLog>('dailyLogs')
        const upgraded = colorDailyRoutines((await routines.toArray()).map(upgradeRoutine))

        await routines.bulkPut(upgraded)
        await logs.bulkPut(upgradeDailyLogs(await logs.toArray(), upgraded))
      })
  }
}

export const db = new WorkoutDb()
