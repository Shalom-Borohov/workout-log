const TABS_PATH = '/tabs'

export const TIMELINE_PATH = `${TABS_PATH}/timeline`

export const ROUTINES_PATH = `${TABS_PATH}/routines`

export const EXERCISES_PATH = `${TABS_PATH}/exercises`

export const DAILY_PATH = `${TABS_PATH}/daily`

export const IMPORT_PATH = `${ROUTINES_PATH}/import`

export const DAILY_ARCHIVE_PATH = `${DAILY_PATH}/archive`

export type HostTabPath = typeof TIMELINE_PATH | typeof ROUTINES_PATH

export type WorkoutHostPath = HostTabPath | typeof DAILY_PATH

export type DetailHostPath = typeof TIMELINE_PATH | typeof DAILY_PATH

export type RoutineHostPath = typeof ROUTINES_PATH | typeof DAILY_PATH

const WORKOUT_TABS: WorkoutHostPath[] = [TIMELINE_PATH, ROUTINES_PATH, DAILY_PATH]

export const settingsPath = (tab: HostTabPath) => `${tab}/settings`

export const workoutPath = (tab: WorkoutHostPath, id: string) => `${tab}/workout/${id}`

export const isWorkoutPath = (pathname: string) => WORKOUT_TABS.some((tab) => pathname.startsWith(workoutPath(tab, '')))

export const workoutDetailPath = (tab: WorkoutHostPath, id: string) =>
  tab === DAILY_PATH ? `${DAILY_PATH}/record/${id}` : `${TIMELINE_PATH}/${id}`

export const routinePath = (tab: RoutineHostPath, id: string) => `${tab}/${id}`

export const exerciseHistoryPath = (name: string) => `${EXERCISES_PATH}/${encodeURIComponent(name)}`

export const activityPath = (name: string) => `${EXERCISES_PATH}/activity/${encodeURIComponent(name)}`
