import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../src/data/db'
import { saveRecord, saveRoutine, saveWorkout } from '../../src/data/repo'
import type { DailyLog } from '../../src/domain/types'
import { freezeDate } from '../helpers/clock'
import { resetDb } from '../helpers/db'
import { alertPresented, expectInOrder, modalPresented } from '../helpers/ionic'
import { currentPath, renderAt } from '../helpers/renderAt'
import { activity, dailyLog, dailyRoutine, done, exercise, oct, reps, seconds, workout } from '../helpers/workouts'

const drills = {
  ...dailyRoutine('d1', 'חטיפי תנועה', [[{ name: 'גשר ישבן', target: reps(15) }], [{ name: 'פלאנק', target: seconds(30) }]]),
  createdAt: oct(20),
}

const stretches = { ...dailyRoutine('d2', 'מתיחות', [[{ name: 'פרפר', target: seconds(30) }]], { color: 'blue' }), createdAt: oct(22) }

const plannedDrills = [
  { name: 'גשר ישבן', sets: 3, target: reps(15) },
  { name: 'פלאנק', sets: 3, target: seconds(30) },
]

const button = (name: string | RegExp) => screen.findByRole('button', { name })

const sheetTitle = (day: string) => screen.queryByText(day, { selector: 'ion-modal ion-title' })

describe('day sheet', () => {
  beforeEach(resetDb)
  freezeDate(oct(26, 12))

  it('with one drill, tapping a day it is not done on logs it at once, and tapping it again opens the sheet', async () => {
    await saveRoutine(drills)
    renderAt('/tabs/daily')

    fireEvent.click(await button('יום א׳ 25.10'))

    await waitFor(async () => expect(await db.dailyLogs.toArray()).toEqual([dailyLog('d1', '2026-10-25', plannedDrills)]))
    expect(sheetTitle('יום א׳ 25.10')).not.toBeInTheDocument()

    const sheetFullyOpen = modalPresented()

    fireEvent.click(await button('יום א׳ 25.10, חטיפי תנועה'))
    await sheetFullyOpen

    expect(sheetTitle('יום א׳ 25.10')).toBeInTheDocument()
    expect(await db.dailyLogs.count()).toBe(1)
  })

  it('with two drills, tapping a past day opens its sheet, where ✓ logs that day with the planned numbers', async () => {
    await saveRoutine(drills)
    await saveRoutine(stretches)
    renderAt('/tabs/daily')

    fireEvent.click(await button('יום א׳ 25.10'))

    expect(await screen.findByText('יום א׳ 25.10', { selector: 'ion-modal ion-title' })).toBeInTheDocument()
    const check = await button('חטיפי תנועה, יום א׳ 25.10')
    fireEvent.click(check)

    await waitFor(() => expect(check).toHaveAttribute('aria-pressed', 'true'))
    expect(await db.dailyLogs.toArray()).toEqual([dailyLog('d1', '2026-10-25', plannedDrills)])
    expect(await screen.findByText('גשר ישבן 3 × 15 · פלאנק 3 × 30 שנ׳')).toBeInTheDocument()

    fireEvent.click(check)

    await waitFor(() => expect(check).toHaveAttribute('aria-pressed', 'false'))
    expect(await db.dailyLogs.count()).toBe(0)
    expect(screen.queryByText('גשר ישבן 3 × 15 · פלאנק 3 × 30 שנ׳')).not.toBeInTheDocument()
    expect(document.querySelector('ion-alert')).toBeNull()
  })

  describe('removing a day from its ✓ when the numbers were edited', () => {
    const editedLog = dailyLog('d1', '2026-10-25', [{ ...plannedDrills[0], sets: 5 }, plannedDrills[1]])

    async function openSheetAndExpand(log: DailyLog) {
      await saveRoutine(drills)
      await db.dailyLogs.put(log)
      renderAt('/tabs/daily')

      fireEvent.click(await button(/^יום א׳ 25\.10/))
      const row = await screen.findByRole('button', { name: /חטיפי תנועה/, expanded: false })

      fireEvent.click(row)

      return { row, check: await button('חטיפי תנועה, יום א׳ 25.10') }
    }

    async function tapUntilAsked(check: HTMLElement) {
      const asked = alertPresented()

      fireEvent.click(check)
      await asked
    }

    it('asks first, and cancel keeps the log, the check and the open row', async () => {
      const { row, check } = await openSheetAndExpand(editedLog)

      await tapUntilAsked(check)

      expect(screen.getByText('להסיר את הסימון?')).toBeInTheDocument()
      expect(await db.dailyLogs.toArray()).toEqual([editedLog])

      fireEvent.click(screen.getByText('ביטול', { selector: '.alert-button-inner' }))

      await waitFor(() => expect(document.querySelector('ion-alert')).toBeNull())
      expect(await db.dailyLogs.toArray()).toEqual([editedLog])
      expect(check).toHaveAttribute('aria-pressed', 'true')
      expect(row).toHaveAttribute('aria-expanded', 'true')
      expect(await button('הוספת סט, גשר ישבן')).toBeInTheDocument()
    })

    it('confirming removes the log, and ticking again starts from the plan, closed', async () => {
      const { check } = await openSheetAndExpand(editedLog)

      await tapUntilAsked(check)
      fireEvent.click(screen.getByText('מחיקה', { selector: '.alert-button-inner' }))

      await waitFor(() => expect(check).toHaveAttribute('aria-pressed', 'false'))
      expect(await db.dailyLogs.count()).toBe(0)

      fireEvent.click(check)

      expect(await screen.findByText('גשר ישבן 3 × 15 · פלאנק 3 × 30 שנ׳')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /חטיפי תנועה/, expanded: false })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'הוספת סט, גשר ישבן' })).not.toBeInTheDocument()
    })

    it('asks about numbers still being saved', async () => {
      const { check } = await openSheetAndExpand(dailyLog('d1', '2026-10-25', plannedDrills))
      const addSet = await button('הוספת סט, גשר ישבן')
      const asked = alertPresented()

      fireEvent.click(addSet)
      fireEvent.click(check)
      await asked

      expect(screen.getByText('להסיר את הסימון?')).toBeInTheDocument()
    })

    it('an untouched log goes in one tap', async () => {
      const { check } = await openSheetAndExpand(dailyLog('d1', '2026-10-25', plannedDrills))

      fireEvent.click(check)

      await waitFor(() => expect(check).toHaveAttribute('aria-pressed', 'false'))
      expect(await db.dailyLogs.count()).toBe(0)
      expect(document.querySelector('ion-alert')).toBeNull()
    })
  })

  it('an expanded drill keeps each exercise’s name and steppers as one block, with seams only between exercises', async () => {
    await saveRoutine(drills)
    await db.dailyLogs.put(dailyLog('d1', '2026-10-25', plannedDrills))
    renderAt('/tabs/daily')

    fireEvent.click(await button(/^יום א׳ 25\.10/))
    fireEvent.click(await screen.findByRole('button', { name: /חטיפי תנועה/, expanded: false }))

    const row = async (control: string) => (await button(control)).closest('ion-item')

    expect(await row('הוספת סט, גשר ישבן')).toHaveClass('item-lines-none')
    expect(await row('יותר חזרות, גשר ישבן')).not.toHaveClass('item-lines-none')
    expect(await row('הוספת סט, פלאנק')).toHaveClass('item-lines-none')
  })

  it('a done drill is one row that expands into steppers saving the sets and seconds done', async () => {
    await saveRoutine(drills)
    await db.dailyLogs.put(dailyLog('d1', '2026-10-25', plannedDrills))
    renderAt('/tabs/daily')

    fireEvent.click(await button(/^יום א׳ 25\.10/))
    const row = await screen.findByRole('button', { name: /חטיפי תנועה/, expanded: false })
    expect(screen.queryByRole('button', { name: 'הוספת סט, גשר ישבן' })).not.toBeInTheDocument()

    fireEvent.click(row)

    expect(row).toHaveAttribute('aria-expanded', 'true')
    fireEvent.click(await button('הוספת סט, גשר ישבן'))

    expect(await screen.findByText('גשר ישבן 4 × 15 · פלאנק 3 × 30 שנ׳')).toBeInTheDocument()
    fireEvent.click(await button('יותר שניות, פלאנק'))

    await waitFor(async () =>
      expect((await db.dailyLogs.toArray())[0].exercises).toEqual([
        { ...plannedDrills[0], sets: 4 },
        { ...plannedDrills[1], target: seconds(35) },
      ]),
    )

    fireEvent.click(row)

    expect(row).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('button', { name: 'הוספת סט, גשר ישבן' })).not.toBeInTheDocument()
  })

  it('a day with a workout opens its sheet even with one drill, listing the workouts and activities', async () => {
    await saveRoutine(drills)
    await saveRecord(activity({ id: 'a1', startedAt: oct(25, 18, 30), finishedAt: oct(25, 20) }))
    await saveWorkout(workout({ id: 'w1', startedAt: oct(25, 8), exercises: [exercise('סקוואט', [done(60, 12)])] }))
    await saveWorkout(workout({ id: 'w2', startedAt: oct(24, 8), exercises: [exercise('סקוואט', [done(60, 12)])] }))
    renderAt('/tabs/daily')

    fireEvent.click(await button('יום א׳ 25.10, אימון'))

    expect(await screen.findByText('אימונים ופעילויות')).toBeInTheDocument()
    expect(await db.dailyLogs.count()).toBe(0)
    await expectInOrder(['אימון גוף מלא', 'אגרוף תאילנדי'])
    expect(screen.getByText('08:00 · 60 דק׳')).toBeInTheDocument()
    expect(screen.getByText('18:30 · 90 דק׳')).toBeInTheDocument()

    fireEvent.click(screen.getByText('אימון גוף מלא'))

    await waitFor(() => expect(currentPath()).toBe('/tabs/daily/record/w1'))
  })
})
