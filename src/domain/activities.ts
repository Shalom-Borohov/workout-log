import type { Activity, Workout, WorkoutRecord, WorkoutSection } from './types'

export const isRoutineWorkout = (record: WorkoutRecord): record is Workout => record.kind === 'routine'

const isActivity = (record: WorkoutRecord): record is Activity => record.kind === 'activity'

export const sectionsOf = (record: WorkoutRecord): WorkoutSection[] => (isRoutineWorkout(record) ? record.sections : [])

export const recordName = (record: WorkoutRecord): string => (record.kind === 'routine' ? record.routineName : record.name)

export function activityNames(records: WorkoutRecord[]): string[] {
  const newestFirst = records.filter(isActivity).sort((first, second) => second.startedAt - first.startedAt)

  return [...new Set(newestFirst.map((activity) => activity.name.trim()))]
}
