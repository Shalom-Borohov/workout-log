import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../src/data/db'
import { setExerciseArea } from '../../src/data/exerciseAreas'
import { saveRoutine } from '../../src/data/repo'
import { areaIconOf } from '../helpers/areas'
import { resetDb } from '../helpers/db'
import { ionChange, ionEvent, ionField, radioByLabel } from '../helpers/ionic'
import { exercisePicker } from '../helpers/picker'
import { renderAt } from '../helpers/renderAt'
import { reps, routine } from '../helpers/workouts'

const legs = routine('r1', 'אימון רגליים', [[{ name: 'סקוואט', target: reps(12) }]])

const savedArea = async (name: string) => (await db.exerciseAreas.get(name))?.area

async function addNewExercise() {
  fireEvent.click(await screen.findByText('הוספת תרגיל', { selector: 'ion-label' }))
  fireEvent.click(await (await exercisePicker()).findByText('תרגיל חדש'))
}

async function openSquat() {
  renderAt('/tabs/routines/r1')
  fireEvent.click(await screen.findByText('סקוואט', { selector: 'h2' }))
}

describe('body area in the exercise editor', () => {
  beforeEach(resetDb)

  it('shows the area saved for the exercise name and saves a new pick at once', async () => {
    await saveRoutine(legs)
    await setExerciseArea('סקוואט', 'glutes')
    await openSquat()

    expect(await radioByLabel('ישבן')).toBeChecked()

    fireEvent.click(await radioByLabel('רגליים'))

    await waitFor(async () => expect(await savedArea('סקוואט')).toBe('legs'))
    await waitFor(async () => expect(await radioByLabel('רגליים')).toBeChecked())
  })

  it('moves an area picked before naming a new exercise to its name, so the next new one starts with none', async () => {
    await saveRoutine(legs)
    renderAt('/tabs/routines/r1')

    fireEvent.click(await screen.findByText('הוספת תרגיל', { selector: 'ion-label' }))
    fireEvent.click(await (await exercisePicker()).findByText('תרגיל חדש'))
    fireEvent.click(await radioByLabel('חזה'))
    await waitFor(async () => expect(await radioByLabel('חזה')).toBeChecked())
    ionChange(await ionField('שם התרגיל'), 'לחיצת חזה')

    await waitFor(async () => expect(await savedArea('לחיצת חזה')).toBe('chest'))
    expect(await savedArea('תרגיל חדש')).toBeUndefined()
  })

  it('an area picked for a new exercise that is deleted before naming doesn’t reach the next new exercise', async () => {
    await saveRoutine(legs)
    renderAt('/tabs/routines/r1')

    await addNewExercise()
    fireEvent.click(await radioByLabel('חזה'))
    await waitFor(async () => expect(await radioByLabel('חזה')).toBeChecked())
    fireEvent.click(await screen.findByText('מחיקת התרגיל'))
    await waitFor(() => expect(screen.queryByRole('group', { name: 'אזור בגוף' })).toBeNull())

    await addNewExercise()

    expect(await radioByLabel('ללא')).toBeChecked()
    expect(await db.exerciseAreas.count()).toBe(0)
  })

  it('in a pair of new exercises, picking an area for one leaves the other blank', async () => {
    await saveRoutine(routine('r1', 'אימון', [[{ name: 'תרגיל חדש', target: reps(10) }, { name: 'תרגיל חדש', target: reps(10) }]]))
    renderAt('/tabs/routines/r1')

    fireEvent.click(await screen.findByText('תרגיל חדש + תרגיל חדש', { selector: 'h2' }))
    await waitFor(() => expect(screen.getAllByText('אזור בגוף', { selector: 'legend' })).toHaveLength(2))
    const [first, second] = Array.from(document.querySelectorAll('fieldset'), (fieldset) => within(fieldset))

    fireEvent.click(first.getByLabelText('חזה'))

    await waitFor(() => expect(first.getByLabelText('חזה')).toBeChecked())
    expect(second.getByLabelText('ללא')).toBeChecked()
  })

  it('renaming keeps the area of a name that already has one', async () => {
    await saveRoutine(legs)
    await setExerciseArea('סקוואט', 'legs')
    await setExerciseArea('גשר ישבן', 'glutes')
    await openSquat()

    ionChange(await ionField('שם התרגיל'), 'גשר ישבן')

    await waitFor(async () => expect(await radioByLabel('ישבן')).toBeChecked())
    expect(await savedArea('סקוואט')).toBe('legs')
  })

  it('shows each exercise’s area icon in הוספת תרגיל', async () => {
    await saveRoutine(routine('r1', 'אימון גוף מלא', [[{ name: 'סקוואט', target: reps(12) }], [{ name: 'חתירה', target: reps(8) }]]))
    await setExerciseArea('סקוואט', 'legs')
    renderAt('/tabs/routines/r1')

    fireEvent.click(await screen.findByText('הוספת תרגיל', { selector: 'ion-label' }))
    const picker = await exercisePicker()

    await waitFor(async () => expect(areaIconOf(await picker.findByText('סקוואט'))).toBe('legs'))
    expect(areaIconOf(await picker.findByText('חתירה'))).toBe('none')
  })

  it('gives each exercise of a pair its own area', async () => {
    await saveRoutine(legs)
    await openSquat()

    ionEvent(await screen.findByText('זוג', { selector: 'ion-toggle' }), 'ionChange', { checked: true })

    await waitFor(() => expect(screen.getAllByLabelText('שם התרגיל')).toHaveLength(2))
    await waitFor(() => expect(screen.getAllByRole('group', { name: 'אזור בגוף' })).toHaveLength(2))
  })
})
