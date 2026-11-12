export const ACCENT_COLORS = ['orange', 'teal', 'blue', 'indigo', 'purple', 'pink'] as const

export type AccentColor = (typeof ACCENT_COLORS)[number]

export const DEFAULT_ACCENT_COLOR: AccentColor = 'teal'

export const isAccentColor = (value: unknown): value is AccentColor => ACCENT_COLORS.some((color) => color === value)
