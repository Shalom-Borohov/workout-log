import type { Activity, Workout, WorkoutRecord, WorkoutSection } from './types'

export const isRoutineWorkout = (record: WorkoutRecord): record is Workout => record.kind === 'routine'

const isActivity = (record: WorkoutRecord): record is Activity => record.kind === 'activity'

export const sectionsOf = (record: WorkoutRecord): WorkoutSection[] => (isRoutineWorkout(record) ? record.sections : [])

export const recordName = (record: WorkoutRecord): string => (record.kind === 'routine' ? record.routineName : record.name)

export const locationOf = (record: WorkoutRecord): string => (isActivity(record) ? record.location : '')

const newestActivitiesFirst = (records: WorkoutRecord[]) =>
  records.filter(isActivity).sort((first, second) => second.startedAt - first.startedAt)

export function activityNames(records: WorkoutRecord[]): string[] {
  return [...new Set(newestActivitiesFirst(records).map((activity) => activity.name.trim()))]
}

export function lastLocation(records: WorkoutRecord[], name: string): string {
  const located = newestActivitiesFirst(records).find((activity) => activity.name.trim() === name && activity.location !== '')

  return located ? located.location : ''
}
