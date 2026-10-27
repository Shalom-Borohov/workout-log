import { screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../src/data/db'
import { saveWorkout } from '../../src/data/repo'
import { resetDb } from '../helpers/db'
import { renderAt } from '../helpers/renderAt'
import { done, exercise, oct, open, seconds, workout } from '../helpers/workouts'

const firstSets = async () => (await db.workouts.get('w1'))?.sections[0].items[0].exercises[0].sets

beforeEach(async () => {
  await resetDb()
})

describe('live current set', () => {
  it('weight stepper adds 2.5 and saves', async () => {
    await saveWorkout(
      workout({ id: 'w1', startedAt: oct(26), finishedAt: null, exercises: [exercise('סקוואט', [open(60, 10), open(60, 10)])] }),
    )
    const user = userEvent.setup()
    renderAt('/workout/w1')

    await user.click(await screen.findByRole('button', { name: 'הגדלת משקל' }))

    expect(await screen.findByLabelText('סקוואט סט 1 משקל')).toHaveValue('62.5')
    await waitFor(async () => expect(await firstSets()).toEqual([open(62.5, 10), open(60, 10)]))
  })

  it('weight stepper on an empty weight starts at 2.5', async () => {
    await saveWorkout(workout({ id: 'w1', startedAt: oct(26), finishedAt: null, exercises: [exercise('מתח', [open(null, 8)])] }))
    const user = userEvent.setup()
    renderAt('/workout/w1')

    expect(await screen.findByRole('button', { name: 'הקטנת משקל' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'הגדלת משקל' }))

    await waitFor(async () => expect(await firstSets()).toEqual([open(2.5, 8)]))
  })

  it('reps stepper subtracts one', async () => {
    await saveWorkout(workout({ id: 'w1', startedAt: oct(26), finishedAt: null, exercises: [exercise('מתח', [open(null, 8)])] }))
    const user = userEvent.setup()
    renderAt('/workout/w1')

    await user.click(await screen.findByRole('button', { name: 'הקטנת חזרות' }))

    await waitFor(async () => expect(await firstSets()).toEqual([open(null, 7)]))
  })

  it('the first undone set is current and tapping another set makes it current', async () => {
    await saveWorkout(
      workout({
        id: 'w1',
        startedAt: oct(26),
        finishedAt: null,
        exercises: [exercise('סקוואט', [done(60, 10), open(62.5, 8), open(62.5, 8)])],
      }),
    )
    const user = userEvent.setup()
    renderAt('/workout/w1')

    expect(await screen.findByLabelText('סקוואט סט 2 משקל')).toHaveValue('62.5')
    expect(screen.queryByLabelText('סקוואט סט 1 משקל')).not.toBeInTheDocument()
    expect(screen.getByText('60 × 10')).toBeInTheDocument()

    await user.click(screen.getByText('סט 1'))

    expect(await screen.findByLabelText('סקוואט סט 1 משקל')).toHaveValue('60')
    expect(screen.queryByLabelText('סקוואט סט 2 משקל')).not.toBeInTheDocument()
  })

  it('ticking the current set moves focus to the next undone set', async () => {
    await saveWorkout(
      workout({ id: 'w1', startedAt: oct(26), finishedAt: null, exercises: [exercise('סקוואט', [open(60, 10), open(60, 10)])] }),
    )
    const user = userEvent.setup()
    renderAt('/workout/w1')

    await user.click(await screen.findByRole('button', { name: 'סקוואט סט 1', pressed: false }))

    expect(await screen.findByLabelText('סקוואט סט 2 משקל')).toBeInTheDocument()
    expect(screen.queryByLabelText('סקוואט סט 1 משקל')).not.toBeInTheDocument()
  })

  it('a duration set has no weight stepper and steps by 15 seconds', async () => {
    await saveWorkout(
      workout({ id: 'w1', startedAt: oct(26), finishedAt: null, exercises: [exercise('פלאנק', [open(null, 45)], seconds(45))] }),
    )
    const user = userEvent.setup()
    renderAt('/workout/w1')

    await user.click(await screen.findByRole('button', { name: 'הגדלת זמן' }))

    expect(screen.queryByRole('button', { name: 'הגדלת משקל' })).not.toBeInTheDocument()
    await waitFor(async () => expect(await firstSets()).toEqual([open(null, 60)]))
  })
})
