import { useSyncExternalStore } from 'react'
import { type AccentColor, DEFAULT_ACCENT_COLOR, isAccentColor } from '../domain/accentColors'

const ACCENT_COLOR_KEY = 'workout-log:accent'

const listeners = new Set<() => void>()

export function readAccentColor(): AccentColor {
  const saved = localStorage.getItem(ACCENT_COLOR_KEY)

  return isAccentColor(saved) ? saved : DEFAULT_ACCENT_COLOR
}

export function saveAccentColor(color: AccentColor) {
  localStorage.setItem(ACCENT_COLOR_KEY, color)
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

export const useAccentColor = () => useSyncExternalStore(subscribe, readAccentColor)
