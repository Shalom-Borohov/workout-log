import type { AccentColor } from '../domain/accentColors'

export const accentSwatchStyle = (color: AccentColor) => ({ color: `var(--app-accent-${color})` })

export function applyAccentColor(color: AccentColor) {
  const root = document.documentElement.style

  root.setProperty('--app-accent', `var(--app-accent-${color})`)
  root.setProperty('--app-accent-rgb', `var(--app-accent-${color}-rgb)`)
}
