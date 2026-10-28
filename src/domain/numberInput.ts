import { fromDisplayAmount } from './format'
import { clampAmount, clampWeight } from './limits'
import type { SetLog, Target } from './types'

export function weightText(weight: number | null): string {
  return weight === null ? '' : String(weight)
}

export function parseNumber(text: string): number | null {
  const number = Number(text.trim().replace(',', '.'))

  return text.trim() !== '' && Number.isFinite(number) && number >= 0 ? number : null
}

export function weightPatch(text: string): Partial<SetLog> {
  if (text.trim() === '') {
    return { weight: null }
  }
  const weight = parseNumber(text)

  return weight === null ? {} : { weight: clampWeight(weight) }
}

export function amountPatch(text: string, target: Target): Partial<SetLog> {
  const displayAmount = parseNumber(text)

  if (displayAmount === null) {
    return {}
  }

  return { amount: clampAmount(fromDisplayAmount(displayAmount, target), target) }
}
