import { describe, expect, it } from 'vitest'
import {
  amountUnit,
  countLabel,
  formatAmount,
  formatClock,
  formatDateTime,
  formatDay,
  formatSet,
  formatSets,
  formatWeekSummary,
  formatWeight,
  fromDisplayAmount,
  isoDate,
  shortDate,
  toDisplayAmount,
} from '../../src/domain/format'
import { done, oct, reps, seconds } from '../helpers/workouts'

describe('isoDate', () => {
  it('shows the local date as YYYY-MM-DD', () => {
    expect(isoDate(oct(5, 23, 59))).toBe('2026-10-05')
  })
})

describe('formatDateTime', () => {
  it('shows the local date as dd.mm.yyyy and the time to the minute', () => {
    expect(formatDateTime(oct(5, 9, 7))).toBe('5.10.2026 09:07')
  })
})

describe('shortDate', () => {
  it('shows day.month within the current year', () => {
    expect(shortDate(new Date(2026, 0, 3).getTime(), oct(29))).toBe('3.1')
  })

  it('adds the two-digit year outside the current year', () => {
    expect(shortDate(new Date(2025, 9, 29).getTime(), oct(29))).toBe('29.10.25')
    expect(shortDate(new Date(2009, 2, 1).getTime(), oct(29))).toBe('1.3.09')
  })
})

describe('formatDay', () => {
  it('shows the Hebrew weekday letter and day.month', () => {
    expect(formatDay(oct(26))).toBe('יום ב׳ 26.10')
    expect(formatDay(oct(31, 23, 59))).toBe('יום ש׳ 31.10')
    expect(formatDay(new Date(2026, 10, 1, 0, 0).getTime())).toBe('יום א׳ 1.11')
  })
})

describe('formatClock', () => {
  it('shows m:ss under an hour and h:mm:ss from an hour', () => {
    expect(formatClock(0)).toBe('0:00')
    expect(formatClock(245999)).toBe('4:05')
    expect(formatClock(3729000)).toBe('1:02:09')
  })
})

describe('formatAmount', () => {
  it('shows reps as a bare number', () => {
    expect(formatAmount(15, reps(12))).toBe('15')
  })

  it('shows durations in minutes when whole, else seconds', () => {
    expect(formatAmount(900, seconds(900))).toBe('15 דק׳')
    expect(formatAmount(30, seconds(30))).toBe('30 שנ׳')
    expect(formatAmount(90, seconds(60))).toBe('90 שנ׳')
  })
})

describe('formatSet', () => {
  it('shows weight × amount without trailing zeros', () => {
    expect(formatSet(done(22, 15), reps(15))).toBe('22 × 15')
    expect(formatSet(done(22.5, 10), reps(12))).toBe('22.5 × 10')
    expect(formatSet(done(10, 30), seconds(30))).toBe('10 × 30 שנ׳')
  })

  it('shows only the amount for bodyweight sets', () => {
    expect(formatSet(done(null, 12), reps(12))).toBe('12')
    expect(formatSet(done(null, 900), seconds(900))).toBe('15 דק׳')
  })
})

describe('formatSets', () => {
  it('names a shared weight once', () => {
    expect(formatSets([done(27.5, 15), done(27.5, 15), done(27.5, 13)], reps(15))).toBe('27.5 ק״ג × 15, 15, 13')
  })

  it('lists bodyweight amounts with the unit once', () => {
    expect(formatSets([done(null, 10), done(null, 10)], reps(10))).toBe('10, 10 חזרות')
    expect(formatSets([done(null, 900)], seconds(900))).toBe('15 דק׳')
    expect(formatSets([done(null, 30), done(null, 45)], seconds(30))).toBe('30, 45 שנ׳')
  })

  it('falls back to each set when weights differ', () => {
    expect(formatSets([done(40, 12), done(45, 10)], reps(12))).toBe('40 ק״ג × 12 · 45 ק״ג × 10')
    expect(formatSets([done(null, 12), done(10, 10)], reps(12))).toBe('12 · 10 ק״ג × 10')
  })
})

describe('formatWeekSummary', () => {
  it('counts workouts and sets in Hebrew', () => {
    expect(formatWeekSummary(1, 38)).toBe('אימון אחד · 38 סטים')
    expect(formatWeekSummary(3, 96)).toBe('3 אימונים · 96 סטים')
  })
})

describe('countLabel', () => {
  it('uses the singular phrase for one and the plural otherwise', () => {
    expect(countLabel(1, 'חלק אחד', 'חלקים')).toBe('חלק אחד')
    expect(countLabel(3, 'חלק אחד', 'חלקים')).toBe('3 חלקים')
    expect(countLabel(0, 'חלק אחד', 'חלקים')).toBe('0 חלקים')
  })
})

describe('formatWeight', () => {
  it('appends kilograms', () => {
    expect(formatWeight(27.5)).toBe('27.5 ק״ג')
  })
})

describe('amount units', () => {
  it('names the unit the target is edited in', () => {
    expect(amountUnit(reps(10))).toBe('חזרות')
    expect(amountUnit(seconds(900))).toBe('דק׳')
    expect(amountUnit(seconds(30))).toBe('שנ׳')
  })

  it('converts stored amounts to and from that unit', () => {
    expect(toDisplayAmount(900, seconds(900))).toBe(15)
    expect(toDisplayAmount(30, seconds(30))).toBe(30)
    expect(toDisplayAmount(12, reps(10))).toBe(12)
    expect(fromDisplayAmount(2.5, seconds(120))).toBe(150)
    expect(fromDisplayAmount(45, seconds(30))).toBe(45)
  })
})
