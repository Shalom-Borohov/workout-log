import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../src/data/db'
import { saveRoutine } from '../../src/data/repo'
import { resetDb } from '../helpers/db'
import { ionChange, ionElement, ionField, OPEN_MODAL } from '../helpers/ionic'
import { renderAt } from '../helpers/renderAt'
import { reps, routine, seconds } from '../helpers/workouts'
import type { Target } from '../../src/domain/types'

const legs = routine('r1', 'אימון רגליים', [[{ name: 'סקוואט', target: reps(12) }]])

const savedItem = async () => (await db.routines.get('r1'))?.sections[0].items[0]

const savedExercise = async () => (await savedItem())?.exercises[0]

async function openSquat() {
  renderAt('/tabs/routines/r1')
  fireEvent.click(await screen.findByText('סקוואט', { selector: 'h2' }))
}

async function openSingle(name: string, target: Target) {
  await saveRoutine(routine('r1', 'אימון', [[{ name, target }]]))
  renderAt('/tabs/routines/r1')
  fireEvent.click(await screen.findByText(name, { selector: 'h2' }))
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

  it('steps reps by one and shows the new amount in the field', async () => {
    await saveRoutine(legs)
    await openSquat()

    const sheet = await itemSheet()

    fireEvent.click(await sheet.findByRole('button', { name: 'הגדלת חזרות · סקוואט' }))
    await waitFor(async () => expect((await savedExercise())?.target).toEqual(reps(13)))
    await waitFor(() => expect(sheet.getByLabelText('חזרות')).toHaveValue(13))

    fireEvent.click(sheet.getByRole('button', { name: 'הקטנת חזרות · סקוואט' }))
    fireEvent.click(sheet.getByRole('button', { name: 'הקטנת חזרות · סקוואט' }))
    await waitFor(async () => expect((await savedExercise())?.target).toEqual(reps(11)))
    await waitFor(() => expect(sheet.getByLabelText('חזרות')).toHaveValue(11))
  })

  it('steps a time in seconds by 15 seconds, also past a whole minute', async () => {
    await openSingle('פלאנק', seconds(45))

    const sheet = await itemSheet()

    fireEvent.click(await sheet.findByRole('button', { name: 'הגדלת שניות · פלאנק' }))
    await waitFor(async () => expect((await savedExercise())?.target).toEqual(seconds(60)))
    fireEvent.click(sheet.getByRole('button', { name: 'הגדלת שניות · פלאנק' }))
    await waitFor(async () => expect((await savedExercise())?.target).toEqual(seconds(75)))
    await waitFor(() => expect(sheet.getByLabelText('שניות')).toHaveValue(75))

    fireEvent.click(sheet.getByRole('button', { name: 'הקטנת שניות · פלאנק' }))
    await waitFor(async () => expect((await savedExercise())?.target).toEqual(seconds(60)))
  })

  it('steps a time in minutes by one minute', async () => {
    await openSingle('ריצה', seconds(600))

    const sheet = await itemSheet()

    fireEvent.click(await sheet.findByRole('button', { name: 'הגדלת דקות · ריצה' }))
    await waitFor(async () => expect((await savedExercise())?.target).toEqual(seconds(660)))
    await waitFor(() => expect(sheet.getByLabelText('דקות')).toHaveValue(11))

    fireEvent.click(sheet.getByRole('button', { name: 'הקטנת דקות · ריצה' }))
    await waitFor(async () => expect((await savedExercise())?.target).toEqual(seconds(600)))
  })

  it('disables + at 100 reps and at three hours', async () => {
    await openSingle('סקוואט', reps(100))

    const repsSheet = await itemSheet()

    expect(await repsSheet.findByRole('button', { name: 'הגדלת חזרות · סקוואט' })).toBeDisabled()
    expect(repsSheet.getByRole('button', { name: 'הקטנת חזרות · סקוואט' })).toBeEnabled()

    ionChange(await screen.findByText('דקות', { selector: 'ion-segment-button ion-label' }), 'minutes')
    ionChange(await ionField('דקות'), '180')

    await waitFor(async () => expect((await savedExercise())?.target).toEqual(seconds(10800)))
    await waitFor(() => expect(repsSheet.getByRole('button', { name: 'הגדלת דקות · סקוואט' })).toBeDisabled())
  })

  it('disables − at one step', async () => {
    await openSingle('סקוואט', reps(2))

    const sheet = await itemSheet()

    fireEvent.click(await sheet.findByRole('button', { name: 'הקטנת חזרות · סקוואט' }))
    await waitFor(async () => expect((await savedExercise())?.target).toEqual(reps(1)))
    await waitFor(() => expect(sheet.getByRole('button', { name: 'הקטנת חזרות · סקוואט' })).toBeDisabled())

    ionChange(await screen.findByText('שניות', { selector: 'ion-segment-button ion-label' }), 'seconds')
    ionChange(await ionField('שניות'), '15')

    await waitFor(async () => expect((await savedExercise())?.target).toEqual(seconds(15)))
    await waitFor(() => expect(sheet.getByRole('button', { name: 'הקטנת שניות · סקוואט' })).toBeDisabled())
  })

  it('sets per exercise default to the section and back to it', async () => {
    await saveRoutine(legs)
    await openSquat()

    const sheet = await itemSheet()

    expect(await sheet.findByText('3', { selector: '.count-stepper-value' })).toBeInTheDocument()

    fireEvent.click(sheet.getByRole('button', { name: 'הוספת סט' }))
    await waitFor(async () => expect((await savedItem())?.sets).toBe(4))
    expect(await sheet.findByText('4', { selector: '.count-stepper-value' })).toBeInTheDocument()
    expect(await screen.findByText('4 סטים · 12 חזרות', { selector: 'p' })).toBeInTheDocument()

    fireEvent.click(sheet.getByRole('button', { name: 'הורדת סט' }))
    await waitFor(async () => expect((await savedItem())?.sets).toBeNull())
    expect(await screen.findByText('3 סטים · 12 חזרות', { selector: 'p' })).toBeInTheDocument()
  })

  it('the sheet starts with the sets, ahead of the exercise name', async () => {
    await saveRoutine(legs)
    await openSquat()

    const sheet = await itemSheet()
    const setsRow = await sheet.findByText('סטים', { selector: 'ion-label' })
    const nameField = await sheet.findByLabelText('שם התרגיל')

    expect(setsRow.compareDocumentPosition(nameField) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('each exercise of a pair has a replace row between its name and its unit', async () => {
    await saveRoutine(
      routine('r1', 'אימון גוף מלא', [
        [
          { name: 'לחיצת חזה', target: reps(8) },
          { name: 'מתח', target: reps(6) },
        ],
      ]),
    )
    renderAt('/tabs/routines/r1')
    fireEvent.click(await screen.findByText('לחיצת חזה + מתח', { selector: 'h2' }))

    const sheet = await itemSheet()
    const replaceRows = await sheet.findAllByText('החלפת תרגיל', { selector: 'ion-label' })
    const nameFields = sheet.getAllByLabelText('שם התרגיל')
    const unitSegments = sheet.getAllByText('חזרות', { selector: 'ion-segment-button ion-label' })

    expect(replaceRows).toHaveLength(2)
    expect(replaceRows.map((replaceRow) => replaceRow.textContent)).toEqual(['החלפת תרגיל · לחיצת חזה', 'החלפת תרגיל · מתח'])
    expect(sheet.getByRole('button', { name: 'הגדלת חזרות · לחיצת חזה' })).toBeInTheDocument()
    expect(sheet.getByRole('button', { name: 'הגדלת חזרות · מתח' })).toBeInTheDocument()
    replaceRows.forEach((replaceRow, index) => {
      expect(nameFields[index].compareDocumentPosition(replaceRow) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
      expect(replaceRow.compareDocumentPosition(unitSegments[index]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    })
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
