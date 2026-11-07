import { act, fireEvent, renderHook, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { db } from '../../src/data/db'
import { saveRoutine, saveWorkout } from '../../src/data/repo'
import { MINUTE_MS } from '../../src/domain/time'
import { removeItem } from '../../src/domain/workoutStructure'
import { useLiveWorkout } from '../../src/pages/live/useLiveWorkout'
import { resetDb, savedWorkout } from '../helpers/db'
import { ionChange, ionEvent, ionField, toasts } from '../helpers/ionic'
import { cardButton, heading } from '../helpers/live'
import { currentPath, renderAt } from '../helpers/renderAt'
import { dailyLog, dailyRoutine, done, exercise, oct, open, reps, routine, workout } from '../helpers/workouts'

const SAVE_FAILED = 'לא נשמר. אפשר לנסות שוב.'

const LOST_CONNECTION = new DOMException('Connection to Indexed Database server lost', 'UnknownError')

let frozenAt = oct(26, 12)

beforeEach(() => {
  frozenAt += MINUTE_MS
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(frozenAt)
})

afterEach(() => {
  vi.useRealTimers()
})

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

const saveFailureShown = () => waitFor(() => expect(toasts()).toContain(SAVE_FAILED))

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

describe('other screens when a save fails', () => {
  beforeEach(resetDb)

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('says so when a routine edit fails', async () => {
    await saveRoutine(routine('r1', 'רגליים', [[{ name: 'סקוואט', target: reps(12) }]]))
    renderAt('/tabs/routines/r1')
    const field = await ionField('שם האימון')

    vi.spyOn(db.routines, 'put').mockRejectedValue(LOST_CONNECTION)
    ionChange(field, 'גב')
    await saveFailureShown()

    vi.restoreAllMocks()
    expect((await db.routines.get('r1'))?.name).toBe('רגליים')
  })

  it('puts the routine name back when renaming fails', async () => {
    await saveRoutine(routine('r1', 'רגליים', [[{ name: 'סקוואט', target: reps(12) }]]))
    renderAt('/tabs/routines/r1')
    const field = (await ionField('שם האימון')).closest('ion-input')

    vi.spyOn(db.routines, 'put').mockRejectedValue(LOST_CONNECTION)
    ionChange(await ionField('שם האימון'), 'גב')
    await saveFailureShown()

    await waitFor(() => expect(field?.value).toBe('רגליים'))
  })

  it('puts the daily switch back when saving it fails', async () => {
    await saveRoutine(routine('r1', 'רגליים', [[{ name: 'סקוואט', target: reps(12) }]]))
    renderAt('/tabs/routines/r1')
    await ionField('שם האימון')
    const toggle = document.querySelector('ion-toggle')

    if (!toggle) {
      throw new Error('no daily switch')
    }

    vi.spyOn(db.routines, 'put').mockRejectedValue(LOST_CONNECTION)
    toggle.checked = true
    ionEvent(toggle, 'ionChange', { checked: true })
    await saveFailureShown()

    await waitFor(() => expect(toggle.checked).toBe(false))
  })

  it('says so when the summary of a finished workout fails', async () => {
    await saveWorkout(workout({ id: 'w1', startedAt: oct(26), exercises: [exercise('סקוואט', [done(60, 10)])] }))
    renderAt('/tabs/timeline/w1')
    const field = await ionField('סיכום')

    failWorkoutWrites()
    ionChange(field, 'היה טוב')

    await saveFailureShown()
  })

  it('says so when starting a workout cannot read the stored data', async () => {
    await saveRoutine(routine('r1', 'רגליים', [[{ name: 'סקוואט', target: reps(12) }]]))
    renderAt('/tabs/routines')
    const start = await screen.findByText('התחל', { selector: 'ion-button' })

    vi.spyOn(db.workouts, 'orderBy').mockImplementation(() => {
      throw LOST_CONNECTION
    })
    fireEvent.click(start)

    await saveFailureShown()
  })

  it('leaves a daily number to the newer write when an older one fails', async () => {
    const drill = dailyRoutine('d1', 'חטיפי תנועה', [[{ name: 'גשר ישבן', target: reps(15) }]])

    await saveRoutine(drill)
    await db.dailyLogs.put(dailyLog('d1', '2026-10-25', [{ name: 'גשר ישבן', sets: 3, target: reps(15) }]))
    renderAt('/tabs/daily')

    fireEvent.click(await screen.findByRole('button', { name: /25\.10/ }))
    fireEvent.click(await screen.findByRole('button', { name: /חטיפי תנועה/, expanded: false }))
    const addSet = await screen.findByRole('button', { name: 'הוספת סט, גשר ישבן' })

    vi.spyOn(db.dailyLogs, 'update').mockRejectedValueOnce(LOST_CONNECTION).mockResolvedValueOnce(1)
    fireEvent.click(addSet)
    fireEvent.click(addSet)
    await saveFailureShown()

    expect(await screen.findByText('גשר ישבן 5 × 15')).toBeInTheDocument()
  })

  it('says so when logging a daily routine fails', async () => {
    await saveRoutine({
      ...routine('d1', 'חטיפי תנועה', [[{ name: 'גשר ישבן', target: reps(15) }]]),
      daily: true,
      color: 'teal',
    })
    renderAt('/tabs/daily')
    const check = await screen.findByRole('button', { name: /חטיפי תנועה/, pressed: false })

    vi.spyOn(db.dailyLogs, 'put').mockRejectedValue(LOST_CONNECTION)
    fireEvent.click(check)
    await saveFailureShown()

    expect(screen.getByRole('button', { name: /חטיפי תנועה/, pressed: false })).toBeInTheDocument()
  })

  it('takes a daily drill number back when its save fails', async () => {
    const drill = dailyRoutine('d1', 'חטיפי תנועה', [[{ name: 'גשר ישבן', target: reps(15) }]])

    await saveRoutine(drill)
    await db.dailyLogs.put(dailyLog('d1', '2026-10-25', [{ name: 'גשר ישבן', sets: 3, target: reps(15) }]))
    renderAt('/tabs/daily')

    fireEvent.click(await screen.findByRole('button', { name: /25\.10/ }))
    fireEvent.click(await screen.findByRole('button', { name: /חטיפי תנועה/, expanded: false }))
    const addSet = await screen.findByRole('button', { name: 'הוספת סט, גשר ישבן' })

    vi.spyOn(db.dailyLogs, 'update').mockRejectedValue(LOST_CONNECTION)
    fireEvent.click(addSet)
    await saveFailureShown()

    expect(await screen.findByText('גשר ישבן 3 × 15')).toBeInTheDocument()
  })

  it('says so when deleting a finished workout fails, and stays', async () => {
    await saveWorkout(workout({ id: 'w1', startedAt: oct(26), exercises: [exercise('סקוואט', [done(60, 10)])] }))
    const user = userEvent.setup()

    renderAt('/tabs/timeline/w1')
    await user.click(await screen.findByText('מחיקת האימון'))
    await screen.findByRole('button', { name: 'מחיקה' })

    vi.spyOn(db.workouts, 'delete').mockRejectedValue(LOST_CONNECTION)
    fireEvent.click(screen.getByRole('button', { name: 'מחיקה' }))
    await saveFailureShown()

    expect(currentPath()).toBe('/tabs/timeline/w1')
  })
})
