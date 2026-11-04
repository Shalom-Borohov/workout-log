import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { saveWorkout } from '../../src/data/repo'
import { resetDb } from '../helpers/db'
import { cardButton } from '../helpers/live'
import { renderAt } from '../helpers/renderAt'
import { done, exercise, oct, open, workout } from '../helpers/workouts'

const threeItems = (finishedAt: number | null) =>
  workout({
    id: 'w1',
    startedAt: oct(26),
    finishedAt,
    exercises: [
      exercise('סקוואט', [done(60, 10), open(60, 10)]),
      exercise('לחיצת חזה', [open(40, 10)]),
      exercise('חתירה', [open(30, 12)]),
    ],
  })

async function jumpTo(user: ReturnType<typeof userEvent.setup>, name: string) {
  await user.click(await screen.findByLabelText('כל התרגילים'))
  await user.click((await screen.findAllByText(name, { selector: 'ion-modal ion-item ion-label' }))[0])
}

beforeEach(async () => {
  await resetDb()
})

describe('live auto-advance', () => {
  it('moves to the next item as soon as its last set is ticked', async () => {
    await saveWorkout(threeItems(null))
    const user = userEvent.setup()
    renderAt('/tabs/timeline/workout/w1')

    await user.click(await screen.findByRole('button', { name: 'סקוואט סט 2', pressed: false }))

    expect(screen.getByText('לחיצת חזה', { selector: 'h1' })).toBeInTheDocument()
  })

  it('passes over skipped and done items to the next unfinished one', async () => {
    await saveWorkout(
      workout({
        id: 'w1',
        startedAt: oct(26),
        finishedAt: null,
        exercises: [
          exercise('סקוואט', [open(60, 10)]),
          { ...exercise('לחיצת חזה', [open(40, 10)]), skipped: true },
          exercise('דדליפט', [done(80, 5)]),
          exercise('חתירה', [open(30, 12)]),
        ],
      }),
    )
    const user = userEvent.setup()
    renderAt('/tabs/timeline/workout/w1')

    await user.click(await screen.findByRole('button', { name: 'סקוואט סט 1', pressed: false }))

    expect(screen.getByText('חתירה', { selector: 'h1' })).toBeInTheDocument()
  })

  it('does not advance when every later item is skipped or done', async () => {
    await saveWorkout(
      workout({
        id: 'w1',
        startedAt: oct(26),
        finishedAt: null,
        exercises: [exercise('סקוואט', [open(60, 10)]), { ...exercise('לחיצת חזה', [open(40, 10)]), skipped: true }],
      }),
    )
    const user = userEvent.setup()
    renderAt('/tabs/timeline/workout/w1')

    await user.click(await screen.findByRole('button', { name: 'סקוואט סט 1', pressed: false }))

    expect(screen.getByText('סקוואט', { selector: 'h1' })).toBeInTheDocument()
  })

  it('does not advance from the last item', async () => {
    await saveWorkout(threeItems(null))
    const user = userEvent.setup()
    renderAt('/tabs/timeline/workout/w1')

    await jumpTo(user, 'חתירה')
    await user.click(await screen.findByRole('button', { name: 'חתירה סט 1', pressed: false }))

    expect(screen.getByText('חתירה', { selector: 'h1' })).toBeInTheDocument()
    expect(screen.getByText('עיקרי · 3 מתוך 3')).toBeInTheDocument()
  })

  it('does not advance when editing a finished workout', async () => {
    await saveWorkout(threeItems(oct(26, 11)))
    const user = userEvent.setup()
    renderAt('/tabs/timeline/workout/w1')

    await user.click(await screen.findByRole('button', { name: 'סקוואט סט 2', pressed: false }))

    expect(screen.getByText('סקוואט', { selector: 'h1' })).toBeInTheDocument()
  })
})

describe('skip', () => {
  it('moves to the next unfinished item, passing over skipped and done ones', async () => {
    await saveWorkout(
      workout({
        id: 'w1',
        startedAt: oct(26),
        finishedAt: null,
        exercises: [
          exercise('סקוואט', [open(60, 10)]),
          { ...exercise('לחיצת חזה', [open(40, 10)]), skipped: true },
          exercise('דדליפט', [done(80, 5)]),
          exercise('חתירה', [open(30, 12)]),
        ],
      }),
    )
    const user = userEvent.setup()
    renderAt('/tabs/timeline/workout/w1')

    await user.click(await cardButton('דלג'))

    expect(screen.getByText('חתירה', { selector: 'h1' })).toBeInTheDocument()
  })

  it('stays on the item when nothing unfinished comes after it', async () => {
    await saveWorkout(threeItems(null))
    const user = userEvent.setup()
    renderAt('/tabs/timeline/workout/w1')

    await jumpTo(user, 'חתירה')
    await user.click(await cardButton('דלג'))

    expect(screen.getByText('חתירה', { selector: 'h1' })).toBeInTheDocument()
    expect(screen.getByText('דילגת על התרגיל')).toBeInTheDocument()
  })

  it('stays on the item when un-skipping it', async () => {
    await saveWorkout(
      workout({
        id: 'w1',
        startedAt: oct(26),
        finishedAt: null,
        exercises: [{ ...exercise('סקוואט', [open(60, 10)]), skipped: true }, exercise('חתירה', [open(30, 12)])],
      }),
    )
    const user = userEvent.setup()
    renderAt('/tabs/timeline/workout/w1')

    await jumpTo(user, 'סקוואט')
    await user.click(await cardButton('בטל דילוג'))

    expect(screen.getByText('סקוואט', { selector: 'h1' })).toBeInTheDocument()
  })

  it('stays on the item when editing a finished workout', async () => {
    await saveWorkout(threeItems(oct(26, 11)))
    const user = userEvent.setup()
    renderAt('/tabs/timeline/workout/w1')

    await user.click(await cardButton('דלג'))

    expect(screen.getByText('סקוואט', { selector: 'h1' })).toBeInTheDocument()
  })
})
