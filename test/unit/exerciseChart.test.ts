import { describe, expect, it } from 'vitest'
import { trendGeometry } from '../../src/pages/exercises/trendGeometry'

describe('trendGeometry', () => {
  it('spreads points by time left to right and by weight bottom to top', () => {
    const points = [
      { startedAt: 0, weight: 20 },
      { startedAt: 5, weight: 22.5 },
      { startedAt: 10, weight: 27.5 },
    ]

    expect(trendGeometry(points)).toEqual({
      path: 'M8 104 L160 80 L312 32',
      dots: [
        { x: 8, y: 104 },
        { x: 160, y: 80 },
        { x: 312, y: 32 },
      ],
    })
  })

  it('places unequal gaps in proportion to time', () => {
    const points = [
      { startedAt: 0, weight: 30 },
      { startedAt: 1, weight: 20 },
      { startedAt: 3, weight: 25 },
    ]

    expect(trendGeometry(points).path).toBe('M8 32 L109.3 104 L312 68')
  })

  it('draws an unchanged weight as a level line through the middle', () => {
    const points = [
      { startedAt: 0, weight: 25 },
      { startedAt: 7, weight: 25 },
    ]

    expect(trendGeometry(points).path).toBe('M8 68 L312 68')
  })
})
