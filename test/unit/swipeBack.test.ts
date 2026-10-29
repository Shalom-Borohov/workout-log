import { describe, expect, it } from 'vitest'
import { isSystemSwipeBack } from '../../src/navigation/swipeBack'

describe('telling the iOS swipe-back apart from an in-app back', () => {
  it('treats a back step with no recent tap as the iOS swipe', () => {
    expect(isSystemSwipeBack('back', 5000, 1000)).toBe(true)
  })

  it('treats a back step right after a tap as an in-app back', () => {
    expect(isSystemSwipeBack('back', 5000, 4700)).toBe(false)
  })

  it('never treats a forward step as a swipe-back', () => {
    expect(isSystemSwipeBack('forward', 5000, 1000)).toBe(false)
  })

  it('treats a back step before any tap at all as the iOS swipe', () => {
    expect(isSystemSwipeBack('back', 5000, null)).toBe(true)
  })
})
