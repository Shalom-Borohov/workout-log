import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { ACCENT_COLORS } from '../../src/domain/accentColors'
import { DRILL_COLORS } from '../../src/domain/drillColors'

const AA_TEXT_CONTRAST = 4.5
const SURFACES = ['#000000', '#1c1c1e', '#2c2c2e']
const TEXT_ON_TILE = '#000000'
const SKETCH_TEAL = '#00aba9'

const theme = readFileSync('src/theme.css', 'utf8')

const token = (name: string) => {
  const match = theme.match(new RegExp(`\\s${name}:\\s*([^;]+);`))
  if (!match) {
    throw new Error(`${name} is not defined`)
  }

  return match[1].trim()
}

const channel = (hex: string, at: number) => Number.parseInt(hex.slice(at, at + 2), 16)

const channels = (hex: string) => [channel(hex, 1), channel(hex, 3), channel(hex, 5)] as const

const linear = (value: number) => {
  const fraction = value / 255

  return fraction <= 0.03928 ? fraction / 12.92 : ((fraction + 0.055) / 1.055) ** 2.4
}

const luminance = (hex: string) => {
  const [red, green, blue] = channels(hex)

  return 0.2126 * linear(red) + 0.7152 * linear(green) + 0.0722 * linear(blue)
}

const contrast = (first: string, second: string) => {
  const firstLuminance = luminance(first)
  const secondLuminance = luminance(second)

  return (Math.max(firstLuminance, secondLuminance) + 0.05) / (Math.min(firstLuminance, secondLuminance) + 0.05)
}

describe('the theme', () => {
  it('is dark only, whatever the phone is set to', () => {
    expect(theme).not.toContain('prefers-color-scheme')
  })
})

describe('accent colours', () => {
  it('makes טורקיז the sea-teal the owner chose in the sketches', () => {
    expect(token('--app-accent-teal')).toBe(SKETCH_TEAL)
  })

  it.each(ACCENT_COLORS)('%s has a hex shade with matching rgb channels', (id) => {
    const hex = token(`--app-accent-${id}`)

    expect(hex).toMatch(/^#[0-9a-f]{6}$/)
    expect(token(`--app-accent-${id}-rgb`)).toBe(channels(hex).join(', '))
  })

  it.each(ACCENT_COLORS)('%s is readable as text on every surface', (id) => {
    const hex = token(`--app-accent-${id}`)

    for (const surface of SURFACES) {
      expect(contrast(hex, surface), `${hex} on ${surface}`).toBeGreaterThanOrEqual(AA_TEXT_CONTRAST)
    }
  })

  it.each(ACCENT_COLORS)('%s carries black text as a tile', (id) => {
    const hex = token(`--app-accent-${id}`)

    expect(contrast(TEXT_ON_TILE, hex), `black on ${hex}`).toBeGreaterThanOrEqual(AA_TEXT_CONTRAST)
  })
})

describe('text colours', () => {
  it.each(['--app-label-secondary', '--ion-color-danger'])('%s is readable on every surface', (name) => {
    const hex = token(name)

    for (const surface of SURFACES) {
      expect(contrast(hex, surface), `${name} ${hex} on ${surface}`).toBeGreaterThanOrEqual(AA_TEXT_CONTRAST)
    }
  })
})

describe('daily routine colours', () => {
  it.each(DRILL_COLORS)('%s carries black text as a tile', (id) => {
    const hex = token(`--app-drill-${id}`)

    expect(hex).toMatch(/^#[0-9a-f]{6}$/)
    expect(contrast(TEXT_ON_TILE, hex), `black on ${hex}`).toBeGreaterThanOrEqual(AA_TEXT_CONTRAST)
  })
})
