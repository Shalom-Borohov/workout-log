import { fireEvent, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { db } from '../../src/data/db'
import { saveRoutine, saveWorkout } from '../../src/data/repo'
import { resetDb } from '../helpers/db'
import { buttonByLabel, ionChange, ionEvent, ionField, toasts } from '../helpers/ionic'
import { currentPath, renderAt } from '../helpers/renderAt'
import { LOST_CONNECTION, SAVE_FAILED, saveFailureShown, stepClockPastMessageThrottle } from '../helpers/saveFailure'
import { dailyLog, dailyRoutine, done, exercise, oct, reps, routine, workout } from '../helpers/workouts'

stepClockPastMessageThrottle()

const failWorkoutWrites = () => vi.spyOn(db.workouts, 'put').mockRejectedValue(LOST_CONNECTION)

const legs = routine('r1', 'רגליים', [[{ name: 'סקוואט', target: reps(12) }]])

const finished = workout({ id: 'w1', startedAt: oct(26), exercises: [exercise('סקוואט', [done(60, 10)])] })

async function openDayDrillSteppers() {
  const drill = dailyRoutine('d1', 'חטיפי תנועה', [[{ name: 'גשר ישבן', target: reps(15) }]])

  await saveRoutine(drill)
  await db.dailyLogs.put(dailyLog('d1', '2026-10-25', [{ name: 'גשר ישבן', sets: 3, target: reps(15) }]))
  renderAt('/tabs/daily')

  fireEvent.click(await screen.findByRole('button', { name: /25\.10/ }))
  fireEvent.click(await screen.findByRole('button', { name: /חטיפי תנועה/, expanded: false }))

  return screen.findByRole('button', { name: 'הוספת סט, גשר ישבן' })
}

function chooseFile(input: HTMLElement, file: File) {
  fireEvent.change(input, { target: { files: [file] } })
}

describe('other screens when a save fails', () => {
  beforeEach(resetDb)

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('says so when a routine edit fails', async () => {
    await saveRoutine(legs)
    renderAt('/tabs/routines/r1')
    const field = await ionField('שם האימון')

    vi.spyOn(db.routines, 'put').mockRejectedValue(LOST_CONNECTION)
    ionChange(field, 'גב')
    await saveFailureShown()

    vi.restoreAllMocks()
    expect((await db.routines.get('r1'))?.name).toBe('רגליים')
  })

  it('puts the routine name back when renaming fails', async () => {
    await saveRoutine(legs)
    renderAt('/tabs/routines/r1')
    const field = (await ionField('שם האימון')).closest('ion-input')

    vi.spyOn(db.routines, 'put').mockRejectedValue(LOST_CONNECTION)
    ionChange(await ionField('שם האימון'), 'גב')
    await saveFailureShown()

    await waitFor(() => expect(field?.value).toBe('רגליים'))
  })

  it('puts the daily switch back when saving it fails', async () => {
    await saveRoutine(legs)
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
    await saveWorkout(finished)
    renderAt('/tabs/timeline/w1')
    const field = await ionField('סיכום')

    failWorkoutWrites()
    ionChange(field, 'היה טוב')

    await saveFailureShown()
  })

  it('says so when starting a workout cannot read the stored data', async () => {
    await saveRoutine(legs)
    renderAt('/tabs/routines')
    const start = await buttonByLabel('התחל')

    vi.spyOn(db.workouts, 'orderBy').mockImplementation(() => {
      throw LOST_CONNECTION
    })
    fireEvent.click(start)

    await saveFailureShown()
  })

  it('leaves a daily number to the newer write when an older one fails', async () => {
    const addSet = await openDayDrillSteppers()

    vi.spyOn(db.dailyLogs, 'update').mockRejectedValueOnce(LOST_CONNECTION).mockResolvedValueOnce(1)
    fireEvent.click(addSet)
    fireEvent.click(addSet)
    await saveFailureShown()

    expect(await screen.findByText('גשר ישבן 5 × 15')).toBeInTheDocument()
  })

  it('takes a daily drill number back when its save fails', async () => {
    const addSet = await openDayDrillSteppers()

    vi.spyOn(db.dailyLogs, 'update').mockRejectedValue(LOST_CONNECTION)
    fireEvent.click(addSet)
    await saveFailureShown()

    expect(await screen.findByText('גשר ישבן 3 × 15')).toBeInTheDocument()
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

  it('says so when deleting a finished workout fails, and stays', async () => {
    await saveWorkout(finished)
    const user = userEvent.setup()

    renderAt('/tabs/timeline/w1')
    await user.click(await screen.findByText('מחיקת האימון'))
    await screen.findByRole('button', { name: 'מחיקה' })

    vi.spyOn(db.workouts, 'delete').mockRejectedValue(LOST_CONNECTION)
    fireEvent.click(screen.getByRole('button', { name: 'מחיקה' }))
    await saveFailureShown()

    expect(currentPath()).toBe('/tabs/timeline/w1')
  })

  it('says so in Hebrew when restoring a backup fails', async () => {
    const backup = { version: 2, exportedAt: oct(25), routines: [legs], workouts: [], dailyLogs: [], exerciseAreas: [] }

    renderAt('/tabs/routines/settings')
    chooseFile(
      await screen.findByLabelText('קובץ גיבוי'),
      new File([JSON.stringify(backup)], 'backup.json', { type: 'application/json' }),
    )
    await screen.findByText(/הייבוא יחליף את כל הנתונים במכשיר\.$/)

    vi.spyOn(db.routines, 'clear').mockRejectedValue(LOST_CONNECTION)
    fireEvent.click(screen.getByText('ייבוא', { selector: '.alert-button *' }))

    await waitFor(() => expect(toasts()).toEqual([SAVE_FAILED]))
  })
})
