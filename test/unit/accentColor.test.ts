import { describe, expect, it } from 'vitest'
import { applyAccentColor } from '../../src/components/accentColor'
import { readAccentColor, saveAccentColor } from '../../src/data/accentColor'

const rootStyle = (property: string) => document.documentElement.style.getPropertyValue(property)

describe('applying the accent colour', () => {
  it('points the app accent and its rgb at the chosen colour', () => {
    applyAccentColor('teal')

    expect(rootStyle('--app-accent')).toBe('var(--app-accent-teal)')
    expect(rootStyle('--app-accent-rgb')).toBe('var(--app-accent-teal-rgb)')
  })

  it('replaces an earlier choice', () => {
    applyAccentColor('teal')
    applyAccentColor('pink')

    expect(rootStyle('--app-accent')).toBe('var(--app-accent-pink)')
  })
})

describe('accent colour', () => {
  it('is teal until one is chosen', () => {
    expect(readAccentColor()).toBe('teal')
  })

  it('reads back the chosen colour', () => {
    saveAccentColor('blue')

    expect(readAccentColor()).toBe('blue')
  })

  it('is kept under its own workout-log key', () => {
    saveAccentColor('purple')

    expect(localStorage.getItem('workout-log:accent')).toBe('purple')
  })

  it('falls back to teal when the stored value is not a colour it offers', () => {
    localStorage.setItem('workout-log:accent', 'red')

    expect(readAccentColor()).toBe('teal')
  })

  it('keeps orange for a phone that chose it before teal became the default', () => {
    localStorage.setItem('workout-log:accent', 'orange')

    expect(readAccentColor()).toBe('orange')
  })
})
