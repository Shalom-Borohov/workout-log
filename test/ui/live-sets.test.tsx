import { fireEvent, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../src/data/db'
import { saveWorkout } from '../../src/data/repo'
import { resetDb } from '../helpers/db'
import { renderAt } from '../helpers/renderAt'
import { ionChange, ionField } from '../helpers/ionic'
import { done, exercise, oct, open, seconds, workout } from '../helpers/workouts'

const firstSets = async () => (await db.workouts.get('w1'))?.sections[0].items[0].exercises[0].sets

beforeEach(async () => {
  await resetDb()
})

describe('live current set', () => {
  it('weight stepper adds 2.5, fills it down to later sets and saves', async () => {
    await saveWorkout(
      workout({ id: 'w1', startedAt: oct(26), finishedAt: null, exercises: [exercise('סקוואט', [open(60, 10), open(60, 10)])] }),
    )
    const user = userEvent.setup()
    renderAt('/tabs/timeline/workout/w1')

    await user.click(await screen.findByRole('button', { name: 'הגדלת משקל' }))

    expect(await screen.findByLabelText('סקוואט סט 1 משקל')).toHaveValue('62.5')
    await waitFor(async () => expect(await firstSets()).toEqual([open(62.5, 10), open(62.5, 10)]))
  })

  it('a typed weight fills down to later open sets with the same or no weight', async () => {
    await saveWorkout(
      workout({
        id: 'w1',
        startedAt: oct(26),
        finishedAt: null,
        exercises: [exercise('סקוואט', [open(20, 10), open(20, 10), open(15, 10), open(null, 10)])],
      }),
    )
    renderAt('/tabs/timeline/workout/w1')

    ionChange(await ionField('סקוואט סט 1 משקל'), '22.5')

    await waitFor(async () =>
      expect(await firstSets()).toEqual([open(22.5, 10), open(22.5, 10), open(15, 10), open(22.5, 10)]),
    )
  })

  it('weight stepper on an empty weight starts at 2.5', async () => {
    await saveWorkout(workout({ id: 'w1', startedAt: oct(26), finishedAt: null, exercises: [exercise('מתח', [open(null, 8)])] }))
    const user = userEvent.setup()
    renderAt('/tabs/timeline/workout/w1')

    expect(await screen.findByRole('button', { name: 'הקטנת משקל' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'הגדלת משקל' }))

    await waitFor(async () => expect(await firstSets()).toEqual([open(2.5, 8)]))
  })

  it('reps stepper subtracts one', async () => {
    await saveWorkout(workout({ id: 'w1', startedAt: oct(26), finishedAt: null, exercises: [exercise('מתח', [open(null, 8)])] }))
    const user = userEvent.setup()
    renderAt('/tabs/timeline/workout/w1')

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
    renderAt('/tabs/timeline/workout/w1')

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
    renderAt('/tabs/timeline/workout/w1')

    await user.click(await screen.findByRole('button', { name: 'סקוואט סט 1', pressed: false }))

    expect(await screen.findByLabelText('סקוואט סט 2 משקל')).toBeInTheDocument()
    expect(screen.queryByLabelText('סקוואט סט 1 משקל')).not.toBeInTheDocument()
  })

  it('a duration set has no weight stepper and steps by 15 seconds', async () => {
    await saveWorkout(
      workout({ id: 'w1', startedAt: oct(26), finishedAt: null, exercises: [exercise('פלאנק', [open(null, 45)], seconds(45))] }),
    )
    const user = userEvent.setup()
    renderAt('/tabs/timeline/workout/w1')

    await user.click(await screen.findByRole('button', { name: 'הגדלת זמן' }))

    expect(screen.queryByRole('button', { name: 'הגדלת משקל' })).not.toBeInTheDocument()
    await waitFor(async () => expect(await firstSets()).toEqual([open(null, 60)]))
  })

  it('typed weight and reps above the limits are stored and shown at the limit', async () => {
    await saveWorkout(workout({ id: 'w1', startedAt: oct(26), finishedAt: null, exercises: [exercise('סקוואט', [open(60, 10)])] }))
    renderAt('/tabs/timeline/workout/w1')

    ionChange(await ionField('סקוואט סט 1 משקל'), '612')
    ionChange(await ionField('סקוואט סט 1 חזרות'), '150')

    expect(await screen.findByLabelText('סקוואט סט 1 משקל')).toHaveValue('500')
    expect(await screen.findByLabelText('סקוואט סט 1 חזרות')).toHaveValue('100')
    await waitFor(async () => expect(await firstSets()).toEqual([open(500, 100)]))
  })

  it('typed reps are rounded to whole reps', async () => {
    await saveWorkout(workout({ id: 'w1', startedAt: oct(26), finishedAt: null, exercises: [exercise('סקוואט', [open(60, 10)])] }))
    renderAt('/tabs/timeline/workout/w1')

    ionChange(await ionField('סקוואט סט 1 חזרות'), '8.6')

    await waitFor(async () => expect(await firstSets()).toEqual([open(60, 9)]))
  })

  it('a typed duration is capped at three hours', async () => {
    await saveWorkout(
      workout({ id: 'w1', startedAt: oct(26), finishedAt: null, exercises: [exercise('הליכה', [open(null, 600)], seconds(600))] }),
    )
    renderAt('/tabs/timeline/workout/w1')

    ionChange(await ionField('הליכה סט 1 דק׳'), '500')

    await waitFor(async () => expect(await firstSets()).toEqual([open(null, 10800)]))
  })

  it('the input shows the limit again when an over-limit value is typed at the limit', async () => {
    await saveWorkout(workout({ id: 'w1', startedAt: oct(26), finishedAt: null, exercises: [exercise('סקוואט', [open(500, 10)])] }))
    renderAt('/tabs/timeline/workout/w1')

    const field = await ionField('סקוואט סט 1 משקל')
    const native = await screen.findByLabelText('סקוואט סט 1 משקל')

    fireEvent.input(native, { target: { value: '700' } })
    ionChange(field, '700')

    await waitFor(() => expect(screen.getByLabelText('סקוואט סט 1 משקל')).toHaveValue('500'))
  })

  it('plus is disabled at the max', async () => {
    await saveWorkout(workout({ id: 'w1', startedAt: oct(26), finishedAt: null, exercises: [exercise('סקוואט', [open(500, 100)])] }))
    renderAt('/tabs/timeline/workout/w1')

    expect(await screen.findByRole('button', { name: 'הגדלת משקל' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'הגדלת חזרות' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'הקטנת משקל' })).toBeEnabled()
  })
})
