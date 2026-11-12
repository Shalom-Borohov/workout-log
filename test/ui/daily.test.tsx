import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { db } from '../../src/data/db'
import { activeWorkout, saveRoutine, saveWorkout } from '../../src/data/repo'
import { freezeDate } from '../helpers/clock'
import { resetDb } from '../helpers/db'
import { alertPresented, buttonByLabel, ionElement, ionEvent } from '../helpers/ionic'
import { currentPath, renderAt } from '../helpers/renderAt'
import { dailyLog, done, exercise, oct, reps, routine, seconds, workout } from '../helpers/workouts'

const gym = { ...routine('r1', 'אימון גוף מלא', [[{ name: 'סקוואט', target: reps(12) }]]), createdAt: oct(1) }

const drills = {
  ...routine('d1', 'חטיפי תנועה', [[{ name: 'גשר ישבן', target: reps(15) }], [{ name: 'פלאנק', target: seconds(30) }]]),
  daily: true,
  color: 'red' as const,
  createdAt: oct(20),
}

const stretches = {
  ...routine('d2', 'מתיחות', [[{ name: 'פרפר', target: seconds(30) }]]),
  daily: true,
  color: 'blue' as const,
  createdAt: oct(22),
}

const plannedDrills = [
  { name: 'גשר ישבן', sets: 3, target: reps(15) },
  { name: 'פלאנק', sets: 3, target: seconds(30) },
]

const dayButton = (name: string | RegExp) => screen.findByRole('button', { name })

const tileNames = (page: Element) => Array.from(page.querySelectorAll('h2'), (name) => name.textContent)

function swipe(element: Element, dx: number, dy: number, startX = 200) {
  fireEvent.touchStart(element, { touches: [{ clientX: startX, clientY: 300 }] })
  fireEvent.touchEnd(element, { changedTouches: [{ clientX: startX + dx, clientY: 300 + dy }] })
}

async function octoberCalendar() {
  const calendar = (await screen.findByText('אוקטובר 2026')).closest('section')

  if (!calendar) {
    throw new Error('no calendar')
  }

  return calendar
}

describe('daily tab', () => {
  beforeEach(resetDb)
  freezeDate(oct(26, 12))

  it('explains how to add a daily routine when there is none', async () => {
    renderAt('/tabs/daily')

    expect(await screen.findByText('עוד אין אימון יומי')).toBeInTheDocument()
  })

  it('"+" creates a daily routine and opens it in the editor', async () => {
    renderAt('/tabs/daily')
    await screen.findByText('עוד אין אימון יומי')

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
    expect(await db.dailyLogs.toArray()).toEqual([dailyLog('d1', '2026-10-26', plannedDrills)])
    expect(await dayButton('יום ב׳ 26.10, חטיפי תנועה')).toBeInTheDocument()

    fireEvent.click(today)

    await waitFor(() => expect(today).toHaveAttribute('aria-pressed', 'false'))
    expect(await db.dailyLogs.count()).toBe(0)
    expect(document.querySelector('ion-alert')).toBeNull()
  })

  describe('removing today from a tile when its numbers were edited', () => {
    const editedLog = dailyLog('d1', '2026-10-26', [{ ...plannedDrills[0], sets: 5 }, plannedDrills[1]])

    async function tapCheckUntilAsked() {
      await saveRoutine(drills)
      await db.dailyLogs.put(editedLog)
      renderAt('/tabs/daily')

      const today = await dayButton('חטיפי תנועה, היום')
      await waitFor(() => expect(today).toHaveAttribute('aria-pressed', 'true'))
      const asked = alertPresented()

      fireEvent.click(today)
      await asked

      return today
    }

    it('asks first, and cancel keeps the log and the check', async () => {
      const today = await tapCheckUntilAsked()

      expect(screen.getByText('להסיר את הסימון?')).toBeInTheDocument()
      expect(screen.getByText('המספרים שנרשמו ביום הזה יימחקו.')).toBeInTheDocument()
      expect(await db.dailyLogs.toArray()).toEqual([editedLog])

      fireEvent.click(screen.getByText('ביטול', { selector: '.alert-button-inner' }))

      await waitFor(() => expect(document.querySelector('ion-alert')).toBeNull())
      expect(await db.dailyLogs.toArray()).toEqual([editedLog])
      expect(today).toHaveAttribute('aria-pressed', 'true')
    })

    it('confirming removes the log', async () => {
      const today = await tapCheckUntilAsked()

      fireEvent.click(screen.getByText('מחיקה', { selector: '.alert-button-inner' }))

      await waitFor(() => expect(today).toHaveAttribute('aria-pressed', 'false'))
      expect(await db.dailyLogs.count()).toBe(0)
    })

    it('a double tap on מחיקה removes the log and does not bring it back from the plan', async () => {
      const today = await tapCheckUntilAsked()
      const remove = screen.getByText('מחיקה', { selector: '.alert-button-inner' })

      fireEvent.click(remove)
      fireEvent.click(remove)

      await waitFor(() => expect(document.querySelector('ion-alert')).toBeNull())
      await waitFor(() => expect(today).toHaveAttribute('aria-pressed', 'false'))
      expect(await db.dailyLogs.count()).toBe(0)
    })

    it('after midnight, before the page refreshes, ✓ logs the new day without asking about yesterday', async () => {
      await saveRoutine(drills)
      await db.dailyLogs.put(editedLog)
      renderAt('/tabs/daily')

      const today = await dayButton('חטיפי תנועה, היום')
      await waitFor(() => expect(today).toHaveAttribute('aria-pressed', 'true'))

      vi.setSystemTime(oct(27, 0, 30))
      fireEvent.click(today)

      await waitFor(async () => expect(await db.dailyLogs.count()).toBe(2))
      expect(document.querySelector('ion-alert')).toBeNull()
      expect(await db.dailyLogs.get(editedLog.id)).toEqual(editedLog)
    })
  })

  it('a tile opens the routine in the editor', async () => {
    await saveRoutine(drills)
    renderAt('/tabs/daily')

    fireEvent.click(await screen.findByText('חטיפי תנועה', { selector: 'h2' }))

    await waitFor(() => expect(currentPath()).toBe('/tabs/daily/d1'))
  })

  it('names every drill done on a day in its label, and mentions a workout', async () => {
    await saveRoutine(drills)
    await saveRoutine(stretches)
    await db.dailyLogs.put(dailyLog('d1', '2026-10-25'))
    await db.dailyLogs.put(dailyLog('d2', '2026-10-25'))
    await saveWorkout(workout({ id: 'w1', startedAt: oct(24, 18), exercises: [exercise('סקוואט', [done(60, 12)])] }))
    renderAt('/tabs/daily')

    expect(await dayButton('יום א׳ 25.10, מתיחות, חטיפי תנועה')).toBeInTheDocument()
    expect(await dayButton('יום ש׳ 24.10, אימון')).toBeInTheDocument()
    expect(await dayButton('יום ו׳ 23.10')).toBeInTheDocument()
  })

  it('disables days after today', async () => {
    await saveRoutine(drills)
    renderAt('/tabs/daily')

    expect(await buttonByLabel('החודש הבא')).toHaveProperty('disabled', true)
    expect(await dayButton('יום ש׳ 31.10')).toBeDisabled()
  })

  it('goes back a month, which re-enables the next month', async () => {
    await saveRoutine(drills)
    renderAt('/tabs/daily')

    fireEvent.click(await buttonByLabel('החודש הקודם'))

    expect(await screen.findByText('ספטמבר 2026')).toBeInTheDocument()
    expect(await dayButton('יום ג׳ 15.9')).toBeEnabled()
    expect(await buttonByLabel('החודש הבא')).toHaveProperty('disabled', false)
  })

  it('a sideways swipe on the calendar moves between months, forward up to the current one', async () => {
    await saveRoutine(drills)
    renderAt('/tabs/daily')
    const calendar = await octoberCalendar()

    swipe(calendar, -120, 10)
    expect(await screen.findByText('ספטמבר 2026')).toBeInTheDocument()

    swipe(calendar, 120, -10)
    expect(await screen.findByText('אוקטובר 2026')).toBeInTheDocument()

    swipe(calendar, 120, 0)
    swipe(calendar, -30, 0)
    swipe(calendar, -80, 120)
    expect(screen.getByText('אוקטובר 2026')).toBeInTheDocument()
  })

  it('leaves a calendar swipe that starts within 20 px of either screen edge alone', async () => {
    await saveRoutine(drills)
    renderAt('/tabs/daily')
    const calendar = await octoberCalendar()
    const screenWidth = window.innerWidth

    swipe(calendar, -120, 0, screenWidth - 18)
    expect(screen.getByText('אוקטובר 2026')).toBeInTheDocument()

    swipe(calendar, -120, 0, screenWidth - 21)
    expect(await screen.findByText('ספטמבר 2026')).toBeInTheDocument()

    swipe(calendar, 120, 0, 18)
    expect(screen.getByText('ספטמבר 2026')).toBeInTheDocument()

    swipe(calendar, 120, 0, 21)
    expect(await screen.findByText('אוקטובר 2026')).toBeInTheDocument()
  })

  it('pages the tiles four at a time, newest first, so a fifth routine starts a second page', async () => {
    const names = ['נשימות', 'מתיחות ערב', 'ניידות בוקר', 'יציבה', 'חטיפי תנועה']

    for (const [index, name] of names.entries()) {
      await saveRoutine({ ...routine(`d${index}`, name, []), daily: true, color: 'green', createdAt: oct(20 - index) })
    }
    renderAt('/tabs/daily')
    await screen.findByText('חטיפי תנועה', { selector: 'h2' })

    expect(Array.from(document.querySelectorAll('.routine-tiles-page'), tileNames)).toEqual([
      ['נשימות', 'מתיחות ערב', 'ניידות בוקר', 'יציבה'],
      ['חטיפי תנועה'],
    ])
  })

  it('a tile has no archive swipe; its editor archives it, and its days stay in the calendar', async () => {
    await saveRoutine(drills)
    await db.dailyLogs.put(dailyLog('d1', '2026-10-25'))
    renderAt('/tabs/daily')

    const tile = await screen.findByRole('button', { name: 'חטיפי תנועה' })

    expect(screen.queryByText('ארכיון', { selector: 'ion-item-option' })).not.toBeInTheDocument()
    fireEvent.click(tile)
    await waitFor(() => expect(currentPath()).toBe('/tabs/daily/d1'))

    fireEvent.click(await screen.findByText('העברה לארכיון'))
    await waitFor(async () => expect((await db.routines.get('d1'))?.archived).toBe(true))
    fireEvent.click(await ionElement('ion-back-button'))

    await waitFor(() => expect(currentPath()).toBe('/tabs/daily'))
    await waitFor(() => expect(screen.queryByText('חטיפי תנועה', { selector: 'h2' })).not.toBeInTheDocument())
    expect(await dayButton('יום א׳ 25.10, חטיפי תנועה')).toBeInTheDocument()
    expect(await screen.findByText('בארכיון')).toBeInTheDocument()
    expect(screen.queryByText('עוד אין אימון יומי')).not.toBeInTheDocument()
  })

  it('a "בארכיון" link among the tiles opens the archive, where "החזרה" brings a drill back', async () => {
    await saveRoutine({ ...drills, archived: true })
    await saveRoutine(stretches)
    renderAt('/tabs/daily')

    const tile = await screen.findByText('מתיחות', { selector: 'h2' })
    const archiveLink = await screen.findByText('בארכיון')

    expect(archiveLink.closest('.routine-tiles-page')).toContainElement(tile)
    fireEvent.click(archiveLink)

    await waitFor(() => expect(currentPath()).toBe('/tabs/daily/archive'))
    expect(await screen.findByText('חטיפי תנועה', { selector: '.ion-page:not(.ion-page-hidden) h2' })).toBeInTheDocument()
    fireEvent.click(await screen.findByText('החזרה', { selector: 'ion-item-option' }))

    await waitFor(async () => expect((await db.routines.get('d1'))?.archived).toBe(false))
    await waitFor(() => expect(currentPath()).toBe('/tabs/daily'))
  })

  it('an archived drill opens in the editor from the archive', async () => {
    await saveRoutine({ ...drills, archived: true })
    renderAt('/tabs/daily/archive')

    fireEvent.click(await screen.findByText('חטיפי תנועה', { selector: 'h2' }))

    await waitFor(() => expect(currentPath()).toBe('/tabs/daily/d1'))
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
