const TABS_PATH = '/tabs'

export const TIMELINE_PATH = `${TABS_PATH}/timeline`

export const ROUTINES_PATH = `${TABS_PATH}/routines`

export const EXERCISES_PATH = `${TABS_PATH}/exercises`

export const SETTINGS_PATH = `${ROUTINES_PATH}/settings`

export const IMPORT_PATH = `${ROUTINES_PATH}/import`

export type WorkoutTab = typeof TIMELINE_PATH | typeof ROUTINES_PATH

const WORKOUT_TABS: WorkoutTab[] = [TIMELINE_PATH, ROUTINES_PATH]

export const workoutPath = (tab: WorkoutTab, id: string) => `${tab}/workout/${id}`

export const isWorkoutPath = (pathname: string) => WORKOUT_TABS.some((tab) => pathname.startsWith(workoutPath(tab, '')))

export const workoutDetailPath = (id: string) => `${TIMELINE_PATH}/${id}`

export const routinePath = (id: string) => `${ROUTINES_PATH}/${id}`

export const exerciseHistoryPath = (name: string) => `${EXERCISES_PATH}/${encodeURIComponent(name)}`
