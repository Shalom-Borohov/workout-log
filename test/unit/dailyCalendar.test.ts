import { describe, expect, it } from 'vitest'
import {
  dayDrills,
  monthGrid,
  monthStart,
  quickLogDrill,
  recordDates,
  recordsOn,
  sheetDrills,
  shiftMonth,
} from '../../src/domain/dailyCalendar'
import { activity, dailyLog, dailyRoutine, oct, routine, workout } from '../helpers/workouts'

const now = oct(26, 12)

const drill = (id: string, archived = false) => dailyRoutine(id, id, [], { archived })

const posture = drill('posture')

const mobility = drill('mobility')

const stopped = drill('stopped', true)

describe('monthGrid', () => {
  it('pads the weeks to Sunday and marks each day future or today', () => {
    const grid = monthGrid(oct(1, 0), now)

    expect(grid.slice(0, 4)).toEqual([null, null, null, null])
    expect(grid.slice(4).map((cell) => cell?.date)).toHaveLength(31)
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

describe('dayDrills', () => {
  it('collects every daily routine done on a day, archived ones too, in the order of the routines', () => {
    const logs = [dailyLog('mobility', '2026-10-25'), dailyLog('posture', '2026-10-25'), dailyLog('stopped', '2026-10-01')]

    const drills = dayDrills(logs, [posture, mobility, stopped])

    expect(drills.get('2026-10-25')).toEqual([posture, mobility])
    expect(drills.get('2026-10-01')).toEqual([stopped])
  })

  it('leaves out logs of a deleted routine or one that is no longer daily', () => {
    const gym = routine('gym', 'gym', [])

    expect(dayDrills([dailyLog('gone', '2026-10-25'), dailyLog('gym', '2026-10-25')], [gym]).size).toBe(0)
  })
})

describe('records by day', () => {
  const evening = workout({ id: 'w1', startedAt: oct(25, 18), exercises: [] })
  const boxing = activity({ id: 'a1', startedAt: oct(25, 9) })
  it('marks the days a workout or activity started', () => {
    expect(recordDates([evening, activity({ id: 'a2', startedAt: oct(20, 9) })])).toEqual(new Set(['2026-10-25', '2026-10-20']))
  })

  it('lists the records of a day from the earliest', () => {
    expect(recordsOn([evening, boxing, workout({ id: 'w3', startedAt: oct(24, 18), exercises: [] })], '2026-10-25')).toEqual([boxing, evening])
  })
})

describe('sheetDrills', () => {
  it('offers the active daily routines and the archived ones done that day', () => {
    const other = drill('other', true)
    const logs = [dailyLog('stopped', '2026-10-25')]

    expect(sheetDrills([posture, routine('gym', 'gym', []), stopped, other], logs, '2026-10-25')).toEqual([posture, stopped])
  })
})

describe('quickLogDrill', () => {
  const day = '2026-10-25'

  it('is the only active drill when it is not done that day and nothing else happened', () => {
    expect(quickLogDrill([posture, stopped, routine('gym', 'gym', [])], [], new Set(), day)).toBe(posture)
  })

  it('is none with two active drills', () => {
    expect(quickLogDrill([posture, mobility], [], new Set(), day)).toBeUndefined()
  })

  it('is none once the drill is done that day, so the tap opens the sheet', () => {
    expect(quickLogDrill([posture], [dailyLog('posture', day)], new Set(), day)).toBeUndefined()
  })

  it('is none on a day with a workout or activity, so it can be looked at', () => {
    expect(quickLogDrill([posture], [], new Set([day]), day)).toBeUndefined()
  })
})
