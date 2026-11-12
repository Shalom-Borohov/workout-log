import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { saveWorkout } from '../../src/data/repo'
import { resetDb } from '../helpers/db'
import { buttonByLabel, ionElement } from '../helpers/ionic'
import { heading } from '../helpers/live'
import { renderAt } from '../helpers/renderAt'
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

const hiddenUntilFocused = (element: Element) => element.closest('.visually-hidden-focusable') !== null

beforeEach(resetDb)

describe('the next exercise peeking above the footer', () => {
  it('names the next exercise in order and moves there when tapped', async () => {
    await saveWorkout(threeItems)
    const user = userEvent.setup()
    renderAt('/tabs/timeline/workout/w1')

    await heading('סקוואט')
    await user.click(screen.getByRole('button', { name: 'הבא: לחיצת חזה' }))

    expect(await heading('לחיצת חזה')).toBeInTheDocument()
    expect((await ionElement('.item-card')).className).toBe('item-card item-enter-next')
    expect(screen.getByRole('button', { name: 'הבא: חתירה' })).toBeInTheDocument()
  })

  it('is hidden on the last exercise', async () => {
    await saveWorkout(threeItems)
    const user = userEvent.setup()
    renderAt('/tabs/timeline/workout/w1')

    await user.click(await screen.findByRole('button', { name: 'הבא: לחיצת חזה' }))
    await user.click(await screen.findByRole('button', { name: 'הבא: חתירה' }))

    expect(await heading('חתירה')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^הבא: / })).not.toBeInTheDocument()
  })
})

describe('the live footer', () => {
  it('shows only the exercise list, and keeps הקודם and הבא for VoiceOver and the keyboard', async () => {
    await saveWorkout(threeItems)
    const user = userEvent.setup()
    renderAt('/tabs/timeline/workout/w1')

    const next = await screen.findByText('הבא', { selector: 'ion-footer ion-button' })
    const previous = screen.getByText('הקודם', { selector: 'ion-footer ion-button' })

    expect(hiddenUntilFocused(next)).toBe(true)
    expect(hiddenUntilFocused(previous)).toBe(true)
    expect(hiddenUntilFocused(await buttonByLabel('כל התרגילים'))).toBe(false)

    await user.click(next)
    expect(await heading('לחיצת חזה')).toBeInTheDocument()

    await user.click(previous)
    expect(await heading('סקוואט')).toBeInTheDocument()
  })
})
