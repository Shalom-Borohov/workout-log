import { describe, expect, it } from 'vitest'
import { readRestSeconds, readRestSound, saveRestSeconds, saveRestSound } from '../../src/data/restSettings'

describe('rest length', () => {
  it('is a minute until one is saved', () => {
    expect(readRestSeconds()).toBe(60)
  })

  it('reads back the saved length', () => {
    saveRestSeconds(75)

    expect(readRestSeconds()).toBe(75)
  })

  it('falls back to a minute when the stored value is not a valid length', () => {
    localStorage.setItem('rest-seconds', 'abc')

    expect(readRestSeconds()).toBe(60)

    localStorage.setItem('rest-seconds', '7')

    expect(readRestSeconds()).toBe(60)
  })

  it('keeps the sound on until it is turned off', () => {
    expect(readRestSound()).toBe(true)

    saveRestSound(false)

    expect(readRestSound()).toBe(false)

    saveRestSound(true)

    expect(readRestSound()).toBe(true)
  })
})
