import { COMMON_COPY } from '../copy/common'
import { FORMAT_COPY } from '../copy/format'
import { completedSets } from './progress'
import { SECOND_MS, SECONDS_PER_HOUR, SECONDS_PER_MINUTE } from './time'
import type { SetLog, Target, WorkoutExercise } from './types'

export const LIST_SEPARATOR = ' · '

export const pad = (value: number) => String(value).padStart(2, '0')

export function isoDate(timestamp: number): string {
  const date = new Date(timestamp)

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp)

  return `${dayMonth(timestamp)}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function dayMonth(timestamp: number): string {
  const date = new Date(timestamp)

  return `${date.getDate()}.${date.getMonth() + 1}`
}

const YEARS_PER_CENTURY = 100

export function shortDate(timestamp: number, now: number): string {
  const year = new Date(timestamp).getFullYear()

  if (year === new Date(now).getFullYear()) {
    return dayMonth(timestamp)
  }

  return `${dayMonth(timestamp)}.${pad(year % YEARS_PER_CENTURY)}`
}

export function formatDay(timestamp: number): string {
  return FORMAT_COPY.day(FORMAT_COPY.weekdays[new Date(timestamp).getDay()], dayMonth(timestamp))
}

export function formatClock(durationMs: number): string {
  const total = Math.floor(durationMs / SECOND_MS)
  const hours = Math.floor(total / SECONDS_PER_HOUR)
  const minutes = Math.floor((total % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE)
  const seconds = total % SECONDS_PER_MINUTE

  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`
}

export function durationUnit(target: Target): 'minutes' | 'seconds' {
  return target.kind === 'duration' && target.seconds > 0 && target.seconds % SECONDS_PER_MINUTE === 0 ? 'minutes' : 'seconds'
}

export function amountUnit(target: Target): string {
  if (target.kind === 'reps') {
    return COMMON_COPY.reps
  }

  return durationUnit(target) === 'minutes' ? FORMAT_COPY.minutesUnit : FORMAT_COPY.secondsUnit
}

export function toDisplayAmount(amount: number, target: Target): number {
  return target.kind === 'duration' && durationUnit(target) === 'minutes' ? amount / SECONDS_PER_MINUTE : amount
}

export function fromDisplayAmount(displayAmount: number, target: Target): number {
  return Math.round(
    target.kind === 'duration' && durationUnit(target) === 'minutes' ? displayAmount * SECONDS_PER_MINUTE : displayAmount,
  )
}

export function formatWeight(weight: number): string {
  return FORMAT_COPY.kilograms(weight)
}

export function countLabel(count: number, one: string, many: string): string {
  return count === 1 ? one : `${count} ${many}`
}

export function formatAmount(amount: number, target: Target): string {
  if (target.kind === 'reps') {
    return String(amount)
  }

  return amount % SECONDS_PER_MINUTE === 0 ? FORMAT_COPY.minutes(amount / SECONDS_PER_MINUTE) : FORMAT_COPY.seconds(amount)
}

export function formatSet(set: SetLog, target: Target): string {
  const amount = formatAmount(set.amount, target)

  return set.weight === null ? amount : `${set.weight} × ${amount}`
}

function amountsText(amounts: number[], target: Target): string {
  if (target.kind === 'reps') {
    return amounts.join(', ')
  }

  return amounts.every((amount) => amount % SECONDS_PER_MINUTE === 0)
    ? FORMAT_COPY.minutes(amounts.map((amount) => amount / SECONDS_PER_MINUTE).join(', '))
    : FORMAT_COPY.seconds(amounts.join(', '))
}

export function formatSets(sets: SetLog[], target: Target): string {
  const [first] = sets
  if (!first || !sets.every((set) => set.weight === first.weight)) {
    return sets
      .map((set) =>
        set.weight === null ? formatAmount(set.amount, target) : `${formatWeight(set.weight)} × ${formatAmount(set.amount, target)}`,
      )
      .join(LIST_SEPARATOR)
  }
  const amounts = amountsText(sets.map((set) => set.amount), target)

  if (first.weight !== null) {
    return `${formatWeight(first.weight)} × ${amounts}`
  }

  return target.kind === 'reps' ? FORMAT_COPY.reps(amounts) : amounts
}

export function exerciseResult(exercise: WorkoutExercise, format: (sets: SetLog[], target: Target) => string): string {
  if (exercise.skipped) {
    return COMMON_COPY.skipped
  }
  const sets = completedSets(exercise)

  return sets.length > 0 ? format(sets, exercise.target) : FORMAT_COPY.notDone
}

export function setsLabel(sets: number): string {
  return countLabel(sets, FORMAT_COPY.oneSet, COMMON_COPY.sets)
}

export function formatSummary(minutes: number, doneSets: number): string {
  return `${FORMAT_COPY.minutes(minutes)} · ${setsLabel(doneSets)}`
}

export function formatWeekSummary(workouts: number, doneSets: number): string {
  return `${countLabel(workouts, FORMAT_COPY.oneWorkout, FORMAT_COPY.workouts)} · ${setsLabel(doneSets)}`
}
