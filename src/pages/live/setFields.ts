import { fromDisplayAmount } from '../../domain/format'
import type { SetLog, Target } from '../../domain/types'

export function weightText(weight: number | null): string {
  return weight === null ? '' : String(weight)
}

function parseNumber(text: string): number | null {
  const value = Number(text.trim().replace(',', '.'))

  return text.trim() !== '' && Number.isFinite(value) && value >= 0 ? value : null
}

export function weightPatch(text: string): Partial<SetLog> {
  if (text.trim() === '') {
    return { weight: null }
  }
  const value = parseNumber(text)

  return value === null ? {} : { weight: value }
}

export function amountPatch(text: string, target: Target): Partial<SetLog> {
  const value = parseNumber(text)

  if (value === null) {
    return {}
  }

  return { amount: fromDisplayAmount(value, target) }
}
