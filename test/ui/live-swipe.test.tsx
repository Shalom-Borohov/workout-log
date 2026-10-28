import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { saveWorkout } from '../../src/data/repo'
import { resetDb } from '../helpers/db'
import { ionElement } from '../helpers/ionic'
import { heading, pause } from '../helpers/live'
import { renderAt } from '../helpers/renderAt'
import { drag } from '../helpers/swipe'
import { exercise, oct, open, workout } from '../helpers/workouts'

const threeItems = workout({
  id: 'w1',
  startedAt: oct(26),
  finishedAt: null,
  exercises: [
    exercise('סקוואט', [open(60, 10)]),
    { ...exercise('לחיצת חזה', [open(40, 10)]), skipped: true },
    exercise('חתירה', [open(30, 12)]),
  ],
})

const right = window.innerWidth

beforeEach(async () => {
  await resetDb()
  document.documentElement.dir = 'rtl'
})

afterEach(() => {
  document.documentElement.dir = ''
})

const listRows = () => screen.queryAllByText('חתירה', { selector: 'ion-modal ion-item ion-label' })

const cardClass = async () => (await ionElement('.item-card')).className

describe('live card motion', () => {
  it('slides the new card in from the direction of travel, not on first load', async () => {
    await saveWorkout(threeItems)
    const user = userEvent.setup()
    renderAt('/tabs/workout/w1')

    await heading('סקוואט')
    expect(await cardClass()).toBe('item-card')

    await user.click(screen.getByText('הבא', { selector: 'ion-button' }))
    await heading('לחיצת חזה')
    expect(await cardClass()).toBe('item-card item-enter-next')

    drag(await heading('לחיצת חזה'), { x: 450, y: 200 }, { x: 300, y: 205 })
    await heading('סקוואט')
    expect(await cardClass()).toBe('item-card item-enter-prev')
  })
})

describe('live swipe up on the footer', () => {
  it('opens the exercise list', async () => {
    await saveWorkout(threeItems)
    renderAt('/tabs/workout/w1')

    const footer = (await screen.findByText('הבא', { selector: 'ion-button' })).closest('ion-footer')

    if (!footer) {
      throw new Error('no footer')
    }
    drag(footer, { x: 500, y: 700 }, { x: 505, y: 600 })

    expect(await screen.findAllByText('חתירה', { selector: 'ion-modal ion-item ion-label' })).not.toHaveLength(0)
  })

  it('ignores a downward or short drag', async () => {
    await saveWorkout(threeItems)
    renderAt('/tabs/workout/w1')

    const footer = (await screen.findByText('הבא', { selector: 'ion-button' })).closest('ion-footer')

    if (!footer) {
      throw new Error('no footer')
    }
    drag(footer, { x: 500, y: 600 }, { x: 505, y: 700 })
    drag(footer, { x: 500, y: 700 }, { x: 500, y: 680 })
    await pause(100)

    expect(listRows()).toEqual([])
  })
})

describe('live swipe between exercises', () => {
  it('dragging toward the start side (right in RTL) moves to the next exercise, even a skipped one', async () => {
    await saveWorkout(threeItems)
    renderAt('/tabs/workout/w1')

    drag(await heading('סקוואט'), { x: 300, y: 200 }, { x: 450, y: 205 })

    expect(await heading('לחיצת חזה')).toBeInTheDocument()
    expect(screen.getByText('דילגת על התרגיל')).toBeInTheDocument()
  })

  it('dragging toward the end side (left in RTL) moves to the previous exercise', async () => {
    await saveWorkout(threeItems)
    const user = userEvent.setup()
    renderAt('/tabs/workout/w1')

    await user.click(await screen.findByText('הבא', { selector: 'ion-button' }))
    drag(await heading('לחיצת חזה'), { x: 450, y: 200 }, { x: 300, y: 205 })

    expect(await heading('סקוואט')).toBeInTheDocument()
  })

  it('ignores a drag that starts at the swipe-back edge', async () => {
    await saveWorkout(threeItems)
    const user = userEvent.setup()
    renderAt('/tabs/workout/w1')

    await user.click(await screen.findByText('הבא', { selector: 'ion-button' }))
    drag(await heading('לחיצת חזה'), { x: right - 20, y: 200 }, { x: right - 200, y: 205 })
    await pause(100)

    expect(screen.getByText('לחיצת חזה', { selector: 'h1' })).toBeInTheDocument()
  })

  it('ignores a short or mostly vertical drag', async () => {
    await saveWorkout(threeItems)
    renderAt('/tabs/workout/w1')

    drag(await heading('סקוואט'), { x: 300, y: 200 }, { x: 330, y: 202 })
    drag(screen.getByText('סקוואט', { selector: 'h1' }), { x: 300, y: 200 }, { x: 360, y: 400 })
    await pause(100)

    expect(screen.getByText('סקוואט', { selector: 'h1' })).toBeInTheDocument()
  })

  it('does nothing past the first or last exercise', async () => {
    await saveWorkout(threeItems)
    renderAt('/tabs/workout/w1')

    drag(await heading('סקוואט'), { x: 450, y: 200 }, { x: 300, y: 205 })
    await pause(100)

    expect(screen.getByText('סקוואט', { selector: 'h1' })).toBeInTheDocument()
    expect(screen.getByText('תרגיל 1 מתוך 3')).toBeInTheDocument()
  })
})
