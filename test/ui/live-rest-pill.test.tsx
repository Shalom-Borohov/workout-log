import { act, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { saveWorkout } from '../../src/data/repo'
import type { WorkoutExercise } from '../../src/domain/types'
import { freezeDate } from '../helpers/clock'
import { resetDb } from '../helpers/db'
import { openRest, tickSquat as tick } from '../helpers/live'
import { renderAt } from '../helpers/renderAt'
import { exercise, oct, open, workout } from '../helpers/workouts'

const squats = (finishedAt: number | null, sets = 3) =>
  workout({
    id: 'w1',
    startedAt: oct(26),
    finishedAt,
    exercises: [exercise('סקוואט', Array.from({ length: sets }, () => open(60, 10)))],
  })

async function savePair(first: WorkoutExercise, second: WorkoutExercise) {
  const base = workout({ id: 'w1', startedAt: oct(26), finishedAt: null, exercises: [] })

  await saveWorkout({ ...base, sections: [{ name: 'סופר סט', items: [{ id: 'p', exercises: [first, second] }] }] })
}

const pill = () => document.querySelector('.set-row-current .rest-pill')

async function passTime(ms: number) {
  await act(async () => {
    vi.advanceTimersByTime(ms)
  })
}

beforeEach(async () => {
  await resetDb()
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('the rest pill on the current set', () => {
  freezeDate(oct(26, 9, 30))

  it('appears on the current set once a set is ticked', async () => {
    await saveWorkout(squats(null))
    const user = userEvent.setup()
    renderAt('/tabs/timeline/workout/w1')

    expect(await screen.findByLabelText('סקוואט סט 1 משקל')).toBeInTheDocument()
    expect(pill()).toBeNull()

    await tick(user, 1)

    expect(await screen.findByText('מנוחה 1:00')).toBe(pill())
    expect(pill()?.closest('.set-row-current')).toContainElement(screen.getByLabelText('סקוואט סט 2 משקל'))
  })

  it('counts down and follows the rest when it is lengthened', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    await saveWorkout(squats(null))
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderAt('/tabs/timeline/workout/w1')

    await tick(user, 1)
    await passTime(12_000)

    expect(await screen.findByText('מנוחה 0:48')).toBeInTheDocument()

    await openRest(user)
    await user.click(screen.getByRole('button', { name: 'הגדלת מנוחה' }))

    expect(await screen.findByText('מנוחה 1:03')).toBeInTheDocument()
  })

  it('turns green and says the rest is over when the time is up', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue()
    await saveWorkout(squats(null))
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderAt('/tabs/timeline/workout/w1')

    await tick(user, 1)
    await passTime(60_000)

    expect(await screen.findByText('המנוחה נגמרה')).toBe(pill())
    expect(pill()).toHaveClass('rest-pill-ended')
  })

  it('shows on a pair', async () => {
    await savePair(exercise('מתח', [open(15, 12), open(15, 12)]), exercise('מקבילים', [open(null, 10), open(null, 10)]))
    const user = userEvent.setup()
    renderAt('/tabs/timeline/workout/w1')

    await user.click(await screen.findByRole('button', { name: 'מתח סט 1', pressed: false }))

    expect(await screen.findByText('מנוחה 1:00')).toBe(pill())
    expect(pill()?.closest('.set-row-current')).toContainElement(screen.getByLabelText('מקבילים סט 1 חזרות'))
  })

  it('never shows while editing a finished workout', async () => {
    await saveWorkout(squats(oct(26, 11)))
    const user = userEvent.setup()
    renderAt('/tabs/timeline/workout/w1')

    await tick(user, 1)

    expect(await screen.findByRole('button', { name: 'סקוואט סט 1', pressed: true })).toBeInTheDocument()
    expect(pill()).toBeNull()
  })

  it('is gone after the tick that finishes the workout', async () => {
    await saveWorkout(squats(null, 2))
    const user = userEvent.setup()
    renderAt('/tabs/timeline/workout/w1')

    await tick(user, 1)
    expect(await screen.findByText('מנוחה 1:00')).toBeInTheDocument()

    await tick(user, 2)

    expect(await screen.findByRole('button', { name: 'סקוואט סט 2', pressed: true })).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByText(/^מנוחה /)).not.toBeInTheDocument())
  })
})
