import { isNumber, isObject, isString } from './guards'

const RUNNING_REST_KEY = 'running-rest'

export interface RunningRest {
  workoutId: string
  endsAt: number
}

const isRunningRest = (value: unknown): value is RunningRest =>
  isObject(value) && isString(value.workoutId) && isNumber(value.endsAt)

export function readRunningRest(): RunningRest | null {
  const saved = localStorage.getItem(RUNNING_REST_KEY)

  if (saved === null) {
    return null
  }
  const parsed: unknown = JSON.parse(saved)

  return isRunningRest(parsed) ? parsed : null
}

export function saveRunningRest(rest: RunningRest) {
  localStorage.setItem(RUNNING_REST_KEY, JSON.stringify(rest))
}

export function clearRunningRest() {
  localStorage.removeItem(RUNNING_REST_KEY)
}
