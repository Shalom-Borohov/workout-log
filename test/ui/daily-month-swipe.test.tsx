import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { saveRoutine } from '../../src/data/repo'
import { freezeDate } from '../helpers/clock'
import { resetDb } from '../helpers/db'
import { renderAt } from '../helpers/renderAt'
import { oct, reps, routine, seconds } from '../helpers/workouts'

const drills = {
  ...routine('d1', 'חטיפי תנועה', [[{ name: 'גשר ישבן', target: reps(15) }], [{ name: 'פלאנק', target: seconds(30) }]]),
  daily: true,
  color: 'red' as const,
  createdAt: oct(20),
}

function swipe(element: Element, deltaX: number, deltaY: number, startX = 200, heldX?: number) {
  const landed = { clientX: startX, clientY: 300 }
  const onScreen = heldX === undefined ? [landed] : [{ clientX: heldX, clientY: 300 }, landed]

  fireEvent.touchStart(element, { touches: onScreen, changedTouches: [landed] })
  fireEvent.touchEnd(element, { changedTouches: [{ clientX: startX + deltaX, clientY: 300 + deltaY }] })
}

async function octoberCalendar() {
  const calendar = (await screen.findByText('אוקטובר 2026')).closest('section')

  if (!calendar) {
    throw new Error('no calendar')
  }

  return calendar
}

describe('swiping the daily calendar between months', () => {
  beforeEach(resetDb)
  freezeDate(oct(26, 12))

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

  it('measures a swipe from the finger that just landed, not one already resting at the edge', async () => {
    await saveRoutine(drills)
    renderAt('/tabs/daily')
    const calendar = await octoberCalendar()

    swipe(calendar, -120, 0, 200, window.innerWidth - 5)
    expect(await screen.findByText('ספטמבר 2026')).toBeInTheDocument()
  })

  it('ignores a resting finger lifting after a second finger lands elsewhere', async () => {
    await saveRoutine(drills)
    renderAt('/tabs/daily')
    const calendar = await octoberCalendar()
    const resting = { identifier: 0, clientX: 100, clientY: 300 }
    const second = { identifier: 1, clientX: 300, clientY: 300 }

    fireEvent.touchStart(calendar, { touches: [resting], changedTouches: [resting] })
    fireEvent.touchStart(calendar, { touches: [resting, second], changedTouches: [second] })
    fireEvent.touchEnd(calendar, { touches: [second], changedTouches: [resting] })
    fireEvent.touchEnd(calendar, { touches: [], changedTouches: [second] })
    expect(screen.getByText('אוקטובר 2026')).toBeInTheDocument()
  })
})
