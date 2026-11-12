import { COMMON_COPY } from '../../copy/common'
import { FORMAT_COPY } from '../../copy/format'
import { SECONDS_PER_MINUTE } from '../../domain/time'
import type { SetLog, Target } from '../../domain/types'

export interface Numeral {
  value: number
  unit: string
}

export function bestNumeral(set: SetLog, target: Target): Numeral {
  if (set.weight !== null) {
    return { value: set.weight, unit: FORMAT_COPY.kilogramsUnit }
  }

  if (target.kind === 'reps') {
    return { value: set.amount, unit: COMMON_COPY.reps }
  }

  return set.amount % SECONDS_PER_MINUTE === 0
    ? { value: set.amount / SECONDS_PER_MINUTE, unit: FORMAT_COPY.minutesUnit }
    : { value: set.amount, unit: FORMAT_COPY.secondsUnit }
}
