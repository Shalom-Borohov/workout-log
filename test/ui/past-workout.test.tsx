import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../src/data/db'
import { saveRoutine, saveWorkout } from '../../src/data/repo'
import { freezeDate } from '../helpers/clock'
import { resetDb } from '../helpers/db'
import { buttonByLabel, ionChange, ionField, ionInput } from '../helpers/ionic'
import { currentPath, renderAt } from '../helpers/renderAt'
import { done, exercise, oct, reps, routine, workout } from '../helpers/workouts'

const legs = routine('r1', 'אימון רגליים', [[{ name: 'סקוואט', target: reps(10) }]], 1)

async function openModal() {
  renderAt('/tabs/timeline')
  fireEvent.click(await buttonByLabel('הוספת אימון קודם'))
}

const saveButton = () => screen.getByText('שמירה').closest('ion-button')

const optionNames = () => Array.from(document.querySelectorAll('ion-modal ion-select-option'), (option) => option.textContent)

function selectField() {
  const select = document.querySelector('ion-modal ion-select')

  if (!select) {
    throw new Error('no routine picker')
  }

  return select
}

describe('past workout', () => {
  beforeEach(resetDb)
  freezeDate(oct(26, 12))

  it('adds a finished workout on a past date and opens it for editing', async () => {
    await saveRoutine(legs)
    await saveWorkout(workout({ id: 'prev', startedAt: oct(19), exercises: [exercise('סקוואט', [done(20, 10)])] }))
    await openModal()

    ionInput(await ionField('תאריך'), '2026-10-24')
    ionInput(await ionField('שעת התחלה'), '18:30')
    ionInput(await ionField('משך (דקות)'), '45')
    fireEvent.click(await screen.findByText('שמירה'))

    await waitFor(() => expect(currentPath()).toMatch(/^\/tabs\/workout\//))

    const [added] = (await db.workouts.toArray()).filter((saved) => saved.id !== 'prev')

    expect(currentPath()).toBe(`/tabs/workout/${added.id}`)
    expect(added).toMatchObject({ routineId: 'r1', startedAt: oct(24, 18, 30), finishedAt: oct(24, 19, 15) })
    expect(added.sections[0].items[0].exercises[0].sets).toEqual([{ weight: 20, amount: 10, done: false }])
  })

  it('picks among routines with exercises and defaults to an hour ending now', async () => {
    await saveRoutine(legs)
    await saveRoutine(routine('r2', 'אימון גב', [[{ name: 'חתירה', target: reps(12) }]]))
    await saveRoutine({ ...routine('r3', 'אימון ריק', []), sections: [] })
    await openModal()

    await waitFor(() => expect(optionNames()).toEqual(['אימון גב', 'אימון רגליים']))
    ionChange(selectField(), 'r1')
    fireEvent.click(screen.getByText('שמירה'))

    await waitFor(() => expect(currentPath()).toMatch(/^\/tabs\/workout\//))
    expect(await db.workouts.toArray()).toMatchObject([{ routineId: 'r1', startedAt: oct(26, 11), finishedAt: oct(26, 12) }])
  })

  it.each([
    ['later today', '2026-10-26', '12:30'],
    ['a future date', '2026-10-27', '08:00'],
  ])('cannot save a start time %s', async (_case, date, time) => {
    await saveRoutine(legs)
    await openModal()

    ionInput(await ionField('תאריך'), date)
    ionInput(await ionField('שעת התחלה'), time)

    expect(await screen.findByText('שעת ההתחלה צריכה להיות בעבר')).toBeInTheDocument()
    expect(saveButton()).toHaveProperty('disabled', true)
  })
})
