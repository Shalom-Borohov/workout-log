import { act, fireEvent, renderHook, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { db } from '../../src/data/db'
import { saveWorkout } from '../../src/data/repo'
import { removeItem } from '../../src/domain/workoutStructure'
import { useLiveWorkout } from '../../src/pages/live/useLiveWorkout'
import { resetDb, savedWorkout } from '../helpers/db'
import { toasts } from '../helpers/ionic'
import { cardButton, heading } from '../helpers/live'
import { currentPath, renderAt } from '../helpers/renderAt'
import { LOST_CONNECTION, SAVE_FAILED, saveFailureShown, stepClockPastMessageThrottle } from '../helpers/saveFailure'
import { exercise, oct, open, workout } from '../helpers/workouts'

stepClockPastMessageThrottle()

const running = workout({
  id: 'w1',
  startedAt: oct(26),
  finishedAt: null,
  exercises: [exercise('סקוואט', [open(60, 10), open(60, 10)]), exercise('חתירה', [open(30, 12)])],
})

const oneSetFirst = workout({
  id: 'w1',
  startedAt: oct(26),
  finishedAt: null,
  exercises: [exercise('סקוואט', [open(60, 10)]), exercise('חתירה', [open(30, 12)])],
})

const failWorkoutWrites = () => vi.spyOn(db.workouts, 'put').mockRejectedValue(LOST_CONNECTION)

const squatSets = async () => (await savedWorkout('w1'))?.sections[0].items[0].exercises[0].sets

describe('a live workout when a save fails', () => {
  beforeEach(resetDb)

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('takes the tick back and says so', async () => {
    await saveWorkout(running)
    const user = userEvent.setup()

    renderAt('/tabs/timeline/workout/w1')
    const check = await screen.findByRole('button', { name: 'סקוואט סט 1', pressed: false })

    failWorkoutWrites()
    await user.click(check)
    await saveFailureShown()

    expect(await screen.findByRole('button', { name: 'סקוואט סט 1', pressed: false })).toBeInTheDocument()
    vi.restoreAllMocks()
    expect((await squatSets())?.[0].done).toBe(false)
  })

  it('returns to the exercise when the tick that advanced from it fails', async () => {
    await saveWorkout(oneSetFirst)
    const user = userEvent.setup()

    renderAt('/tabs/timeline/workout/w1')
    const check = await screen.findByRole('button', { name: 'סקוואט סט 1', pressed: false })

    failWorkoutWrites()
    await user.click(check)
    await saveFailureShown()

    expect(await heading('סקוואט')).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'סקוואט סט 1', pressed: false })).toBeInTheDocument()
  })

  it('takes a skip back and returns to the exercise', async () => {
    await saveWorkout(running)
    const user = userEvent.setup()

    renderAt('/tabs/timeline/workout/w1')
    const skip = await cardButton('דלג')

    failWorkoutWrites()
    await user.click(skip)
    await saveFailureShown()

    expect(await heading('סקוואט')).toBeInTheDocument()
    expect(await cardButton('דלג')).toBeInTheDocument()
  })

  it('keeps the last tick that was stored when a later one fails', async () => {
    await saveWorkout(running)
    const user = userEvent.setup()

    renderAt('/tabs/timeline/workout/w1')
    await user.click(await screen.findByRole('button', { name: 'סקוואט סט 1', pressed: false }))
    await waitFor(async () => expect((await squatSets())?.[0].done).toBe(true))

    failWorkoutWrites()
    await user.click(await screen.findByRole('button', { name: 'סקוואט סט 2', pressed: false }))
    await saveFailureShown()

    expect(await screen.findByRole('button', { name: 'סקוואט סט 2', pressed: false })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'סקוואט סט 1', pressed: true })).toBeInTheDocument()
  })

  it('stays on the workout and keeps the summary sheet when finishing fails', async () => {
    await saveWorkout(running)
    const user = userEvent.setup()

    renderAt('/tabs/timeline/workout/w1')
    await user.click(await screen.findByText('סיום', { selector: 'ion-button' }))
    await screen.findByLabelText('סיכום האימון')

    failWorkoutWrites()
    fireEvent.click(screen.getByText('שמירה', { selector: 'ion-button' }))
    await saveFailureShown()

    expect(currentPath()).toBe('/tabs/timeline/workout/w1')
    expect(screen.getByLabelText('סיכום האימון').closest('ion-modal')?.isOpen).toBe(true)
    vi.restoreAllMocks()
    expect((await savedWorkout('w1'))?.finishedAt).toBeNull()
  })

  it('keeps the summary sheet when deleting the workout from it fails', async () => {
    await saveWorkout(running)
    const user = userEvent.setup()

    renderAt('/tabs/timeline/workout/w1')
    await user.click(await screen.findByText('סיום', { selector: 'ion-button' }))
    await user.click(await screen.findByText('מחיקת האימון'))
    await screen.findByRole('button', { name: 'מחיקה' })

    vi.spyOn(db.workouts, 'delete').mockRejectedValue(LOST_CONNECTION)
    fireEvent.click(screen.getByRole('button', { name: 'מחיקה' }))
    await saveFailureShown()

    expect(currentPath()).toBe('/tabs/timeline/workout/w1')
    expect(screen.getByLabelText('סיכום האימון').closest('ion-modal')?.isOpen).toBe(true)
  })

  it('shows the message once while the tick and the finish both fail', async () => {
    await saveWorkout(running)
    const user = userEvent.setup()

    renderAt('/tabs/timeline/workout/w1')
    const check = await screen.findByRole('button', { name: 'סקוואט סט 1', pressed: false })
    const failedWrites = failWorkoutWrites()

    await user.click(check)
    await saveFailureShown()
    await user.click(await screen.findByText('סיום', { selector: 'ion-button' }))
    await screen.findByLabelText('סיכום האימון')
    fireEvent.click(screen.getByText('שמירה', { selector: 'ion-button' }))
    await waitFor(() => expect(failedWrites).toHaveBeenCalledTimes(2))
    await act(() => Promise.resolve())

    expect(toasts().filter((message) => message === SAVE_FAILED)).toHaveLength(1)
  })

  it('shows no message when the save works', async () => {
    await saveWorkout(running)
    const user = userEvent.setup()

    renderAt('/tabs/timeline/workout/w1')
    await user.click(await screen.findByRole('button', { name: 'סקוואט סט 1', pressed: false }))
    await waitFor(async () => expect((await squatSets())?.[0].done).toBe(true))

    expect(toasts()).not.toContain(SAVE_FAILED)
    expect(screen.getByRole('button', { name: 'סקוואט סט 1', pressed: true })).toBeInTheDocument()
  })
})

describe('a failed edit that had shifted the exercise list', () => {
  beforeEach(resetDb)

  afterEach(() => {
    vi.restoreAllMocks()
    document.querySelectorAll('ion-toast').forEach((toast) => toast.remove())
  })

  it('returns to the exercise it was on', async () => {
    const fourExercises = workout({
      id: 'w1',
      startedAt: oct(26),
      finishedAt: null,
      exercises: ['א', 'ב', 'ג', 'ד'].map((name) => exercise(name, [open(60, 10)])),
    })

    await saveWorkout(fourExercises)
    const { result } = renderHook(() => useLiveWorkout(fourExercises))

    act(() => result.current.move(2))
    failWorkoutWrites()
    act(() => result.current.apply((current) => removeItem(current, { section: 0, item: 0 })))
    await saveFailureShown()

    await waitFor(() => expect(result.current.total).toBe(4))
    expect(result.current.item.exercises[0].name).toBe('ג')
  })
})
