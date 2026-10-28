import { SECONDS_PER_HOUR } from './time'
import type { Target } from './types'

export const MAX_WEIGHT = 500

export const MAX_REPS = 100

export const MAX_SECONDS = 3 * SECONDS_PER_HOUR

export function clampWeight(weight: number): number {
  return Math.min(weight, MAX_WEIGHT)
}

export function maxAmount(target: Target): number {
  return target.kind === 'reps' ? MAX_REPS : MAX_SECONDS
}

export function clampAmount(amount: number, target: Target): number {
  const whole = target.kind === 'reps' ? Math.round(amount) : amount

  return Math.min(whole, maxAmount(target))
}
