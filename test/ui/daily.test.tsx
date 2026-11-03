import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../src/data/db'
import { activeWorkout, saveRoutine } from '../../src/data/repo'
import { freezeDate } from '../helpers/clock'
import { resetDb } from '../helpers/db'
import { buttonByLabel, ionChange, ionElement, ionEvent } from '../helpers/ionic'
import { currentPath, renderAt } from '../helpers/renderAt'
import { dailyLog, oct, reps, routine, seconds } from '../helpers/workouts'

const gym = { ...routine('r1', 'אימון גוף מלא', [[{ name: 'סקוואט', target: reps(12) }]]), createdAt: oct(1) }

const drills = {
  ...routine('d1', 'חטיפי תנועה', [[{ name: 'גשר ישבן', target: reps(15) }], [{ name: 'פלאנק', target: seconds(30) }]]),
  daily: true,
  createdAt: oct(20),
}

const stretches = { ...routine('d2', 'מתיחות', [[{ name: 'פרפר', target: seconds(30) }]]), daily: true, createdAt: oct(22) }

const dayButton = (name: string) => screen.findByRole('button', { name })

describe('daily tab', () => {
  beforeEach(resetDb)
  freezeDate(oct(26, 12))

  it('explains how to add a daily routine when there is none', async () => {
    renderAt('/tabs/daily')

    expect(await screen.findByText('עוד אין אימון יומי')).toBeInTheDocument()
  })

  it('"+" creates a daily routine and opens it in the editor', async () => {
    renderAt('/tabs/daily')

    fireEvent.click(await buttonByLabel('הוספת אימון יומי'))

    await waitFor(() => expect(currentPath()).toMatch(/^\/tabs\/daily\/[\w-]+$/))
    const [created] = await db.routines.toArray()
    expect(created.daily).toBe(true)
    expect(await screen.findByText('אימון יומי', { selector: 'ion-toggle' })).toBeInTheDocument()
  })

  it('the routines tab lists only gym routines', async () => {
    await saveRoutine(gym)
    await saveRoutine(drills)
    renderAt('/tabs/routines')

    expect(await screen.findByText('אימון גוף מלא')).toBeInTheDocument()
    expect(screen.queryByText('חטיפי תנועה')).not.toBeInTheDocument()
  })

  it('shows the drills and logs today with one tap, and a second tap undoes it', async () => {
    await saveRoutine(drills)
    renderAt('/tabs/daily')

    expect(await screen.findByText('גשר ישבן 15 · פלאנק 30 שנ׳')).toBeInTheDocument()
    const today = await dayButton('חטיפי תנועה, היום')
    fireEvent.click(today)

    await waitFor(() => expect(today).toHaveAttribute('aria-pressed', 'true'))
    expect(await db.dailyLogs.toArray()).toEqual([dailyLog('d1', '2026-10-26')])
    expect(await dayButton('יום ב׳ 26.10')).toHaveAttribute('aria-pressed', 'true')

    fireEvent.click(today)

    await waitFor(() => expect(today).toHaveAttribute('aria-pressed', 'false'))
    expect(await db.dailyLogs.count()).toBe(0)
  })

  it('the today card opens the routine in the editor', async () => {
    await saveRoutine(drills)
    renderAt('/tabs/daily')

    fireEvent.click(await screen.findByText('חטיפי תנועה', { selector: 'h2' }))

    await waitFor(() => expect(currentPath()).toBe('/tabs/daily/d1'))
  })

  it('the calendar logs past days, but not future ones', async () => {
    await saveRoutine(drills)
    renderAt('/tabs/daily')

    const sunday = await dayButton('יום א׳ 25.10')
    fireEvent.click(sunday)

    await waitFor(() => expect(sunday).toHaveAttribute('aria-pressed', 'true'))
    expect(await db.dailyLogs.toArray()).toEqual([dailyLog('d1', '2026-10-25')])
    expect(await dayButton('יום ש׳ 31.10')).toBeDisabled()
    expect(await buttonByLabel('החודש הבא')).toHaveProperty('disabled', true)
  })

  it('goes back a month to fill in an older day', async () => {
    await saveRoutine(drills)
    renderAt('/tabs/daily')

    fireEvent.click(await buttonByLabel('החודש הקודם'))

    expect(await screen.findByText('ספטמבר 2026')).toBeInTheDocument()
    fireEvent.click(await dayButton('יום ג׳ 15.9'))
    await waitFor(async () => expect(await db.dailyLogs.toArray()).toEqual([dailyLog('d1', '2026-09-15')]))
    expect(await buttonByLabel('החודש הבא')).toHaveProperty('disabled', false)
  })

  it('with two daily routines, a card for each and a picker for the calendar', async () => {
    await saveRoutine(drills)
    await saveRoutine(stretches)
    await db.dailyLogs.put(dailyLog('d1', '2026-10-25'))
    renderAt('/tabs/daily')

    expect(await dayButton('מתיחות, היום')).toBeInTheDocument()
    expect(await dayButton('חטיפי תנועה, היום')).toBeInTheDocument()
    expect(await dayButton('יום א׳ 25.10')).toHaveAttribute('aria-pressed', 'false')

    ionChange(await ionElement('ion-segment'), 'd1')

    await waitFor(async () => expect(await dayButton('יום א׳ 25.10')).toHaveAttribute('aria-pressed', 'true'))
  })

  it('the routine editor switch makes a routine daily', async () => {
    await saveRoutine(gym)
    renderAt('/tabs/routines/r1')

    ionEvent(await screen.findByText('אימון יומי', { selector: 'ion-toggle' }), 'ionChange', { checked: true })

    await waitFor(async () => expect((await db.routines.get('r1'))?.daily).toBe(true))
  })

  it('"התחל אימון" skips daily routines', async () => {
    await saveRoutine(gym)
    await saveRoutine(drills)
    renderAt('/tabs/timeline')

    fireEvent.click(await screen.findByText('התחל אימון'))

    await waitFor(async () => expect((await activeWorkout())?.routineId).toBe('r1'))
  })
})
