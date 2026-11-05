import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../src/data/db'
import { saveRecord, saveRoutine, saveWorkout } from '../../src/data/repo'
import { freezeDate } from '../helpers/clock'
import { resetDb } from '../helpers/db'
import { expectInOrder, modalPresented } from '../helpers/ionic'
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
