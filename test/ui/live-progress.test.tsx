import { screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { saveWorkout } from '../../src/data/repo'
import { resetDb } from '../helpers/db'
import { renderAt } from '../helpers/renderAt'
import { done, exercise, oct, open, workout } from '../helpers/workouts'
import { visibleAll } from '../helpers/ionic'

const progressValue = () => visibleAll('ion-progress-bar')[0]?.getAttribute('aria-valuenow')

beforeEach(async () => {
  await resetDb()
})

describe('live progress', () => {
  it('shows done sets over total sets, skipped exercises excluded', async () => {
    await saveWorkout(
      workout({
        id: 'w1',
        startedAt: oct(26),
        finishedAt: null,
        exercises: [
          exercise('סקוואט', [done(60, 10), open(60, 10)]),
          { ...exercise('לחיצת חזה', [open(40, 10)]), skipped: true },
          exercise('חתירה', [open(30, 12), open(30, 12)]),
        ],
      }),
    )
    const user = userEvent.setup()
    renderAt('/workout/w1')

    expect(await screen.findByRole('progressbar', { name: 'התקדמות האימון' })).toBeInTheDocument()
    await waitFor(() => expect(progressValue()).toBe('0.25'))

    await user.click(screen.getByRole('button', { name: 'סקוואט סט 2', pressed: false }))

    await waitFor(() => expect(progressValue()).toBe('0.5'))
  })
})
