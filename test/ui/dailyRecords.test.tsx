import { fireEvent, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { finishedWorkouts, saveWorkout } from '../../src/data/repo'
import { resetDb } from '../helpers/db'
import { ionElement } from '../helpers/ionic'
import { currentPath, renderAt } from '../helpers/renderAt'
import { done, exercise, oct, workout } from '../helpers/workouts'

const legs = workout({ id: 'w1', startedAt: oct(25, 18), exercises: [exercise('סקוואט', [done(20, 10)])] })

describe('a workout opened from the daily tab', () => {
  beforeEach(async () => {
    await resetDb()
    await saveWorkout(legs)
  })

  it('shows its detail under the daily tab and goes back to it', async () => {
    renderAt('/tabs/daily/record/w1')

    expect(await screen.findByText('מחיקת האימון')).toBeInTheDocument()
    fireEvent.click(await ionElement('ion-back-button'))

    await waitFor(() => expect(currentPath()).toBe('/tabs/daily'))
  })

  it('edits under the daily tab, with the tab bar hidden', async () => {
    renderAt('/tabs/daily/record/w1')

    fireEvent.click(await screen.findByText('עריכה'))

    await waitFor(() => expect(currentPath()).toBe('/tabs/daily/workout/w1'))
    expect(document.querySelector('ion-tab-bar')).toHaveClass('ion-hide')
  })

  it('edit opened without history goes back to its daily detail', async () => {
    const user = userEvent.setup()
    renderAt('/tabs/daily/workout/w1')

    expect(await screen.findByText('עריכת אימון', { selector: 'ion-title div' })).toBeInTheDocument()
    await user.click(screen.getByText('סיום', { selector: 'ion-button' }))

    await waitFor(() => expect(currentPath()).toBe('/tabs/daily/record/w1'))
  })

  it('deleting it from its daily detail returns to the daily tab', async () => {
    renderAt('/tabs/daily/record/w1')

    fireEvent.click(await screen.findByText('מחיקת האימון'))
    fireEvent.click(await screen.findByText('מחיקה', { selector: '.alert-button *' }))

    await waitFor(async () => expect(await finishedWorkouts()).toHaveLength(0))
    await waitFor(() => expect(currentPath()).toBe('/tabs/daily'))
  })
})
