import { MINUTE_MS } from './time'
import type { Activity, ActivityDetails, Workout, WorkoutRecord, WorkoutSection } from './types'

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

export function rememberedLocation(
  records: WorkoutRecord[],
  details: ReadonlyMap<string, ActivityDetails>,
  name: string,
): string {
  const saved = details.get(name)

  return saved ? saved.location : lastLocation(records, name)
}

export const recordMinutes = (record: WorkoutRecord): number =>
  record.finishedAt === null ? 0 : Math.round((record.finishedAt - record.startedAt) / MINUTE_MS)

export interface ActivitySession {
  id: string
  startedAt: number
  minutes: number
}

const sessionOf = (activity: Activity): ActivitySession => ({
  id: activity.id,
  startedAt: activity.startedAt,
  minutes: recordMinutes(activity),
})

export function activitySessions(records: WorkoutRecord[], name: string): ActivitySession[] {
  return newestActivitiesFirst(records)
    .filter((activity) => activity.name.trim() === name)
    .map(sessionOf)
}

export interface LatestActivity {
  name: string
  last: ActivitySession
}

export function latestActivities(records: WorkoutRecord[]): LatestActivity[] {
  const latest = new Map<string, ActivitySession>()

  for (const activity of newestActivitiesFirst(records)) {
    const name = activity.name.trim()

    if (!latest.has(name)) {
      latest.set(name, sessionOf(activity))
    }
  }

  return [...latest].map(([name, last]) => ({ name, last }))
}
