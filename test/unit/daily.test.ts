import { describe, expect, it } from 'vitest'
import { drillsLine, loggedDates, monthGrid, monthStart, shiftMonth } from '../../src/domain/daily'
import { exerciseNames, isStartable } from '../../src/domain/progress'
import { dailyLog, oct, reps, routine, seconds } from '../helpers/workouts'

const now = oct(26, 12)

const drills = {
  ...routine('d1', 'חטיפי תנועה', [[{ name: 'גשר ישבן', target: reps(15) }], [{ name: 'פלאנק', target: seconds(30) }]]),
  daily: true,
}

const gym = routine('r1', 'אימון גוף מלא', [[{ name: 'סקוואט', target: reps(12) }]])

describe('monthGrid', () => {
  it('pads the weeks to Sunday and marks each day done, future or today', () => {
    const logs = [dailyLog('d1', '2026-10-01'), dailyLog('d1', '2026-10-25'), dailyLog('other', '2026-10-02')]

    const grid = monthGrid(oct(1, 0), loggedDates(logs, 'd1'), now)

    expect(grid.slice(0, 4)).toEqual([null, null, null, null])
    expect(grid.slice(4).map((cell) => cell?.date)).toHaveLength(31)
    expect(grid.flatMap((cell) => (cell?.done ? [cell.date] : []))).toEqual(['2026-10-01', '2026-10-25'])
    expect(grid.flatMap((cell) => (cell?.today ? [cell.date] : []))).toEqual(['2026-10-26'])
    expect(grid.flatMap((cell) => (cell?.future ? [cell.date] : []))).toEqual([
      '2026-10-27',
      '2026-10-28',
      '2026-10-29',
      '2026-10-30',
      '2026-10-31',
    ])
  })
})

describe('months', () => {
  it('a month starts on its first day at midnight', () => {
    expect(monthStart(now)).toBe(oct(1, 0))
  })

  it('moves across year boundaries', () => {
    expect(shiftMonth(oct(1, 0), 3)).toBe(new Date(2027, 0, 1).getTime())
    expect(shiftMonth(oct(1, 0), -10)).toBe(new Date(2025, 11, 1).getTime())
  })
})

describe('drillsLine', () => {
  it('lists each drill with its target', () => {
    expect(drillsLine(drills)).toBe('גשר ישבן 15 · פלאנק 30 שנ׳')
  })
})

describe('daily routines elsewhere', () => {
  it('cannot be started, unlike a routine with exercises', () => {
    expect(isStartable(gym)).toBe(true)
    expect(isStartable(drills)).toBe(false)
    expect(isStartable(routine('r2', 'ריק', []))).toBe(false)
  })

  it('leave their exercises out of the exercise list', () => {
    expect(exerciseNames([gym, drills], [])).toEqual(['סקוואט'])
  })
})
