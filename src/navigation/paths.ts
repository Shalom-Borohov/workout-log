const TABS_PATH = '/tabs'

const WORKOUT_PREFIX = `${TABS_PATH}/workout/`

export const TIMELINE_PATH = `${TABS_PATH}/timeline`

export const ROUTINES_PATH = `${TABS_PATH}/routines`

export const EXERCISES_PATH = `${TABS_PATH}/exercises`

export const SETTINGS_PATH = `${ROUTINES_PATH}/settings`

export const IMPORT_PATH = `${ROUTINES_PATH}/import`

export const workoutPath = (id: string) => `${WORKOUT_PREFIX}${id}`

export const isWorkoutPath = (pathname: string) => pathname.startsWith(WORKOUT_PREFIX)

export const workoutDetailPath = (id: string) => `${TIMELINE_PATH}/${id}`

export const routinePath = (id: string) => `${ROUTINES_PATH}/${id}`

export const exerciseHistoryPath = (name: string) => `${EXERCISES_PATH}/${encodeURIComponent(name)}`
