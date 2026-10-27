import type { SetLog, Target } from './types'

const weekdays = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳']

export const pad = (n: number) => String(n).padStart(2, '0')

export function dayMonth(ts: number): string {
  const d = new Date(ts)

  return `${d.getDate()}.${d.getMonth() + 1}`
}

export function formatDay(ts: number): string {
  return `יום ${weekdays[new Date(ts).getDay()]} ${dayMonth(ts)}`
}

export function formatClock(ms: number): string {
  const total = Math.floor(ms / 1000)
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60

  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`
}

export function durationUnit(target: Target): 'minutes' | 'seconds' {
  return target.kind === 'duration' && target.seconds > 0 && target.seconds % 60 === 0 ? 'minutes' : 'seconds'
}

export function amountUnit(target: Target): string {
  if (target.kind === 'reps') {
    return 'חזרות'
  }

  return durationUnit(target) === 'minutes' ? 'דק׳' : 'שנ׳'
}

export function toDisplayAmount(amount: number, target: Target): number {
  return target.kind === 'duration' && durationUnit(target) === 'minutes' ? amount / 60 : amount
}

export function fromDisplayAmount(value: number, target: Target): number {
  return Math.round(target.kind === 'duration' && durationUnit(target) === 'minutes' ? value * 60 : value)
}

export function formatWeight(kg: number): string {
  return `${kg} ק״ג`
}

export function countLabel(count: number, one: string, many: string): string {
  return count === 1 ? one : `${count} ${many}`
}

export function formatAmount(amount: number, target: Target): string {
  if (target.kind === 'reps') {
    return String(amount)
  }

  return amount % 60 === 0 ? `${amount / 60} דק׳` : `${amount} שנ׳`
}

export function formatSet(set: SetLog, target: Target): string {
  const amount = formatAmount(set.amount, target)

  return set.weight === null ? amount : `${set.weight} × ${amount}`
}

function amountsText(amounts: number[], target: Target): string {
  if (target.kind === 'reps') {
    return amounts.join(', ')
  }

  return amounts.every((a) => a % 60 === 0)
    ? `${amounts.map((a) => a / 60).join(', ')} דק׳`
    : `${amounts.join(', ')} שנ׳`
}

export function formatSets(sets: SetLog[], target: Target): string {
  const [first] = sets
  if (!first || !sets.every((s) => s.weight === first.weight)) {
    return sets
      .map((s) => (s.weight === null ? formatAmount(s.amount, target) : `${formatWeight(s.weight)} × ${formatAmount(s.amount, target)}`))
      .join(' · ')
  }
  const amounts = amountsText(sets.map((s) => s.amount), target)

  if (first.weight !== null) {
    return `${formatWeight(first.weight)} × ${amounts}`
  }

  return target.kind === 'reps' ? `${amounts} חזרות` : amounts
}

export function setsLabel(sets: number): string {
  return countLabel(sets, 'סט אחד', 'סטים')
}

export function formatSummary(minutes: number, doneSets: number): string {
  return `${minutes} דק׳ · ${setsLabel(doneSets)}`
}

export function formatWeekSummary(workouts: number, doneSets: number): string {
  return `${countLabel(workouts, 'אימון אחד', 'אימונים')} · ${setsLabel(doneSets)}`
}
