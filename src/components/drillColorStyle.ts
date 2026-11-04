import type { DrillColor } from '../domain/types'

export const drillColorStyle = (color: DrillColor) => ({ color: `var(--app-drill-${color})` })
