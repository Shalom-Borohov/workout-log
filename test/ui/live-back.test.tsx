import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { saveWorkout } from '../../src/data/repo'
import { resetDb } from '../helpers/db'
import { renderAt } from '../helpers/renderAt'
import { done, exercise, oct, open, workout } from '../helpers/workouts'

const BACK = 'חזרה לתרגיל הנוכחי'

const threeItems = (finishedAt: number | null) =>
  workout({
    id: 'w1',
    startedAt: oct(26),
    finishedAt,
    exercises: [
      exercise('סקוואט', [done(60, 10)]),
      exercise('לחיצת חזה', [open(40, 10)]),
      exercise('חתירה', [open(30, 12)]),
    ],
  })

beforeEach(async () => {
  await resetDb()
})

describe('live back to current exercise', () => {
  it('appears once you move off the current exercise and brings you back to it', async () => {
    await saveWorkout(threeItems(null))
    const user = userEvent.setup()
    renderAt('/tabs/timeline/workout/w1')

    expect(await screen.findByText('לחיצת חזה', { selector: 'h1' })).toBeInTheDocument()
    expect(screen.queryByText(BACK)).not.toBeInTheDocument()

    await user.click(screen.getByText('הבא', { selector: 'ion-button' }))
    expect(await screen.findByText('חתירה', { selector: 'h1' })).toBeInTheDocument()

    await user.click(screen.getByText(BACK))

    expect(await screen.findByText('לחיצת חזה', { selector: 'h1' })).toBeInTheDocument()
    expect(screen.queryByText(BACK)).not.toBeInTheDocument()
  })

  it('is hidden once every exercise is done', async () => {
    await saveWorkout(
      workout({ id: 'w1', startedAt: oct(26), finishedAt: null, exercises: [exercise('סקוואט', [done(60, 10)]), exercise('חתירה', [done(30, 12)])] }),
    )
    const user = userEvent.setup()
    renderAt('/tabs/timeline/workout/w1')

    expect(await screen.findByText('חתירה', { selector: 'h1' })).toBeInTheDocument()
    await user.click(screen.getByText('הקודם', { selector: 'ion-button' }))

    expect(await screen.findByText('סקוואט', { selector: 'h1' })).toBeInTheDocument()
    expect(screen.queryByText(BACK)).not.toBeInTheDocument()
  })

  it('is hidden when editing a finished workout', async () => {
    await saveWorkout(threeItems(oct(26, 11)))
    const user = userEvent.setup()
    renderAt('/tabs/timeline/workout/w1')

    expect(await screen.findByText('לחיצת חזה', { selector: 'h1' })).toBeInTheDocument()
    await user.click(screen.getByText('הבא', { selector: 'ion-button' }))

    expect(await screen.findByText('חתירה', { selector: 'h1' })).toBeInTheDocument()
    expect(screen.queryByText(BACK)).not.toBeInTheDocument()
  })
})
