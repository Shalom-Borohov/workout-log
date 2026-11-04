import type { Routine } from './types'

export const DRILL_COLORS = ['red', 'orange', 'yellow', 'green', 'teal', 'blue', 'purple', 'pink'] as const

export type DrillColor = (typeof DRILL_COLORS)[number]

export const isDrillColor = (value: unknown): value is DrillColor => DRILL_COLORS.some((color) => color === value)

export function nextDrillColor(routines: Routine[]): DrillColor {
  const uses = (color: DrillColor) => routines.filter((routine) => routine.daily && routine.color === color).length

  return DRILL_COLORS.reduce((least, color) => (uses(color) < uses(least) ? color : least))
}

export function makeDaily(routine: Routine, daily: boolean, routines: Routine[]): Routine {
  if (!daily) {
    return { ...routine, daily, archived: false }
  }

  return { ...routine, daily, color: routine.color ?? nextDrillColor(routines.filter((other) => other.id !== routine.id)) }
}
