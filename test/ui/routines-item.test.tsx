import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../src/data/db'
import { saveRoutine } from '../../src/data/repo'
import { resetDb } from '../helpers/db'
import { ionChange, ionElement, ionField, OPEN_MODAL } from '../helpers/ionic'
import { renderAt } from '../helpers/renderAt'
import { reps, routine, seconds } from '../helpers/workouts'

const legs = routine('r1', 'אימון רגליים', [[{ name: 'סקוואט', target: reps(12) }]])

const savedItem = async () => (await db.routines.get('r1'))?.sections[0].items[0]

const savedExercise = async () => (await savedItem())?.exercises[0]

async function openSquat() {
  renderAt('/tabs/routines/r1')
  fireEvent.click(await screen.findByText('סקוואט', { selector: 'h2' }))
}

async function itemSheet() {
  const modal = (await ionElement('ion-content', OPEN_MODAL)).closest('ion-modal')

  if (!(modal instanceof HTMLElement)) {
    throw new Error('item sheet not found')
  }

  return within(modal)
}

describe('item sheet', () => {
  beforeEach(resetDb)

  it('sets and clears the starting weight', async () => {
    await saveRoutine(legs)
    await openSquat()

    ionChange(await ionField('משקל התחלתי (ק״ג)'), '22.5')
    await waitFor(async () => expect((await savedExercise())?.weight).toBe(22.5))

    ionChange(await ionField('משקל התחלתי (ק״ג)'), '')
    await waitFor(async () => expect((await savedExercise())?.weight).toBeNull())
  })

  it('caps the starting weight at 500 kg and shows the capped value', async () => {
    await saveRoutine(legs)
    await openSquat()

    ionChange(await ionField('משקל התחלתי (ק״ג)'), '9999')

    await waitFor(async () => expect((await savedExercise())?.weight).toBe(500))
    await waitFor(() => expect(screen.getByLabelText('משקל התחלתי (ק״ג)')).toHaveValue(500))
  })

  it('shows the cap again when typing over a weight already at the cap', async () => {
    await saveRoutine(routine('r1', 'אימון רגליים', [[{ name: 'סקוואט', target: reps(12), weight: 500 }]]))
    await openSquat()

    const input = await screen.findByLabelText('משקל התחלתי (ק״ג)')

    fireEvent.input(input, { target: { value: '9999' } })
    expect(input).toHaveValue(9999)
    ionChange(await ionField('משקל התחלתי (ק״ג)'), '9999')

    await waitFor(() => expect(input).toHaveValue(500))
  })

  it('caps reps at 100 and a timed target at three hours', async () => {
    await saveRoutine(legs)
    await openSquat()

    ionChange(await ionField('חזרות'), '9999')
    await waitFor(async () => expect((await savedExercise())?.target).toEqual(reps(100)))
    await waitFor(() => expect(screen.getByLabelText('חזרות')).toHaveValue(100))

    ionChange(await screen.findByText('דקות', { selector: 'ion-segment-button ion-label' }), 'minutes')
    ionChange(await ionField('דקות'), '999')
    await waitFor(async () => expect((await savedExercise())?.target).toEqual(seconds(10800)))
    await waitFor(() => expect(screen.getByLabelText('דקות')).toHaveValue(180))
  })

  it('sets per exercise default to the section and back to it', async () => {
    await saveRoutine(legs)
    await openSquat()

    const sheet = await itemSheet()

    expect(await sheet.findByText('3', { selector: '.count-stepper-value' })).toBeInTheDocument()

    fireEvent.click(sheet.getByRole('button', { name: 'הוספת סט' }))
    await waitFor(async () => expect((await savedItem())?.sets).toBe(4))
    expect(await sheet.findByText('4', { selector: '.count-stepper-value' })).toBeInTheDocument()
    expect(await screen.findByText('12 חזרות · 4 סטים', { selector: 'p' })).toBeInTheDocument()

    fireEvent.click(sheet.getByRole('button', { name: 'הורדת סט' }))
    await waitFor(async () => expect((await savedItem())?.sets).toBeNull())
    expect(await screen.findByText('12 חזרות', { selector: 'p' })).toBeInTheDocument()
  })

  it('saves the tips', async () => {
    await saveRoutine(legs)
    await openSquat()

    ionChange(await ionField('דגשים'), 'גב ישר, ברכיים החוצה')

    await waitFor(async () => expect((await savedExercise())?.tip).toBe('גב ישר, ברכיים החוצה'))
  })

  it('hides the starting weight for a timed exercise', async () => {
    await saveRoutine(legs)
    await openSquat()

    await ionField('משקל התחלתי (ק״ג)')
    ionChange(await screen.findByText('שניות', { selector: 'ion-segment-button ion-label' }), 'seconds')

    await waitFor(() => expect(screen.queryByLabelText('משקל התחלתי (ק״ג)')).not.toBeInTheDocument())
  })

  it('drops the starting weight when the exercise becomes timed', async () => {
    await saveRoutine(routine('r1', 'אימון רגליים', [[{ name: 'סקוואט', target: reps(12), weight: 20 }]]))
    await openSquat()

    ionChange(await screen.findByText('שניות', { selector: 'ion-segment-button ion-label' }), 'seconds')

    await waitFor(async () => expect((await savedExercise())?.target).toEqual(seconds(12)))
    expect((await savedExercise())?.weight).toBeNull()
  })
})
