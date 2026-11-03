import { MIN_REST_SECONDS } from '../domain/rest'

const REST_SECONDS_KEY = 'rest-seconds'

const REST_SOUND_KEY = 'rest-sound'

const SOUND_OFF = 'off'

const DEFAULT_REST_SECONDS = 60

export function readRestSeconds(): number {
  const saved = Number(localStorage.getItem(REST_SECONDS_KEY))

  return saved >= MIN_REST_SECONDS ? saved : DEFAULT_REST_SECONDS
}

export function saveRestSeconds(seconds: number) {
  localStorage.setItem(REST_SECONDS_KEY, String(seconds))
}

export const readRestSound = () => localStorage.getItem(REST_SOUND_KEY) !== SOUND_OFF

export function saveRestSound(on: boolean) {
  if (on) {
    localStorage.removeItem(REST_SOUND_KEY)
  } else {
    localStorage.setItem(REST_SOUND_KEY, SOUND_OFF)
  }
}
