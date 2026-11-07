const SEEN_VERSION_KEY = 'workout-log:seen-version'

export const readSeenVersion = () => localStorage.getItem(SEEN_VERSION_KEY)

export function saveSeenVersion(version: string) {
  localStorage.setItem(SEEN_VERSION_KEY, version)
}
