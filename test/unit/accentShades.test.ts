import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { ACCENT_COLORS } from '../../src/domain/accentColors'

const DARK_MEDIA_QUERY = '@media (prefers-color-scheme: dark)'
const AA_TEXT_CONTRAST = 4.5
const LIGHT_SURFACES = ['#ffffff', '#f2f2f7']
const DARK_SURFACES = ['#000000', '#1c1c1e', '#2c2c2e']

const [lightBlock, darkBlock] = readFileSync('src/theme.css', 'utf8').split(DARK_MEDIA_QUERY)

const token = (block: string, name: string) => {
  const match = block.match(new RegExp(`\\s${name}:\\s*([^;]+);`))
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

const modes = [
  { mode: 'light', block: lightBlock, surfaces: LIGHT_SURFACES },
  { mode: 'dark', block: darkBlock, surfaces: DARK_SURFACES },
]

describe('accent colours', () => {
  it('reads a light theme and a dark theme from the stylesheet', () => {
    expect(lightBlock).toContain(':root')
    expect(darkBlock).toContain(':root.ios')
  })

  it.each(ACCENT_COLORS)('%s has a hex shade with matching rgb channels in light and dark', (id) => {
    for (const { block } of modes) {
      const hex = token(block, `--app-accent-${id}`)

      expect(hex).toMatch(/^#[0-9a-f]{6}$/)
      expect(token(block, `--app-accent-${id}-rgb`)).toBe(channels(hex).join(', '))
    }
  })

  it.each(ACCENT_COLORS)('%s is readable on every surface in light and dark', (id) => {
    for (const { mode, block, surfaces } of modes) {
      const hex = token(block, `--app-accent-${id}`)

      for (const surface of surfaces) {
        expect(contrast(hex, surface), `${mode} ${hex} on ${surface}`).toBeGreaterThanOrEqual(AA_TEXT_CONTRAST)
      }
    }
  })
})
