import { screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { saveWorkout } from '../../src/data/repo'
import { freezeDate } from '../helpers/clock'
import { resetDb, savedWorkout } from '../helpers/db'
import { ionField, ionInput } from '../helpers/ionic'
import { chooseFromMenu, setVisibility } from '../helpers/live'
import { currentPath, renderAt } from '../helpers/renderAt'
import { exercise, oct, open, workout } from '../helpers/workouts'

const NOW = oct(26, 12)
const OVER_LIMIT_START = oct(26, 8)
const DURATION_LABEL = 'משך (דקות)'

const startWorkoutAt = (startedAt: number) =>
  saveWorkout(workout({ id: 'w1', startedAt, finishedAt: null, exercises: [exercise('סקוואט', [open(60, 10)])] }))

async function openFinishSheet() {
  const user = userEvent.setup()

  renderAt('/tabs/timeline/workout/w1')
  await user.click(await screen.findByText('סיום', { selector: 'ion-button' }))
  await screen.findByText('סיכום האימון', { selector: 'ion-title' })

  return user
}

async function saveAndLeave(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByText('שמירה', { selector: 'ion-button' }))
  await waitFor(() => expect(currentPath()).toBe('/tabs/timeline/w1'))
}

beforeEach(async () => {
  await resetDb()
})

describe('finishing a forgotten workout', () => {
  freezeDate(NOW)

  it('offers 180 minutes and ends the workout 3 hours after its start in one tap', async () => {
    await startWorkoutAt(OVER_LIMIT_START)
    const user = await openFinishSheet()

    expect(screen.getByLabelText(DURATION_LABEL)).toHaveValue(180)
    await saveAndLeave(user)

    expect((await savedWorkout('w1'))?.finishedAt).toBe(oct(26, 11))
  })

  it('ends the workout after the minutes typed', async () => {
    await startWorkoutAt(OVER_LIMIT_START)
    const user = await openFinishSheet()

    ionInput(await ionField(DURATION_LABEL), '45')
    await saveAndLeave(user)

    expect((await savedWorkout('w1'))?.finishedAt).toBe(oct(26, 8, 45))
  })

  it('saves 180 minutes when the field is left blank', async () => {
    await startWorkoutAt(OVER_LIMIT_START)
    const user = await openFinishSheet()

    ionInput(await ionField(DURATION_LABEL), '')
    await saveAndLeave(user)

    expect((await savedWorkout('w1'))?.finishedAt).toBe(oct(26, 11))
  })

  it.each([
    ['exactly 3 hours', oct(26, 9)],
    ['a short time', oct(26, 11, 30)],
  ])('does not ask after %s, and ends the workout now', async (_name, startedAt) => {
    await startWorkoutAt(startedAt)
    const user = await openFinishSheet()

    expect(screen.queryByLabelText(DURATION_LABEL)).not.toBeInTheDocument()
    await saveAndLeave(user)

    expect((await savedWorkout('w1'))?.finishedAt).toBe(NOW)
  })

  it('asks when the sheet was left open past 3 hours', async () => {
    await startWorkoutAt(oct(26, 11, 30))
    const user = await openFinishSheet()

    expect(screen.queryByLabelText(DURATION_LABEL)).not.toBeInTheDocument()

    vi.setSystemTime(oct(27, 9))
    await setVisibility('visible')

    expect(await screen.findByLabelText(DURATION_LABEL)).toHaveValue(180)
    await saveAndLeave(user)

    expect((await savedWorkout('w1'))?.finishedAt).toBe(oct(26, 14, 30))
  })

  it('does not ask or finish when adding to the summary mid-workout', async () => {
    await startWorkoutAt(OVER_LIMIT_START)
    const user = userEvent.setup()

    renderAt('/tabs/timeline/workout/w1')
    await chooseFromMenu('הוספה לסיכום')
    await screen.findByText('סיכום', { selector: 'ion-title' })

    expect(screen.queryByLabelText(DURATION_LABEL)).not.toBeInTheDocument()
    ionInput(screen.getByLabelText('סיכום האימון'), 'כתף כואבת')
    await user.click(screen.getByText('שמירה', { selector: 'ion-button' }))

    await waitFor(async () => expect((await savedWorkout('w1'))?.summary).toBe('כתף כואבת'))
    expect((await savedWorkout('w1'))?.finishedAt).toBeNull()
    expect(currentPath()).toBe('/tabs/timeline/workout/w1')
  })
})
