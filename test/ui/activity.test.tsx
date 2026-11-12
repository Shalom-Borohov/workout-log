import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { activityDetailsMap, setActivityLocation, setActivityNote } from '../../src/data/activityDetails'
import { finishedRecords, saveRecord, saveWorkout } from '../../src/data/repo'
import { freezeDate } from '../helpers/clock'
import { resetDb } from '../helpers/db'
import { buttonByLabel, ionChange, ionField, ionInput, startTimePicker } from '../helpers/ionic'
import { currentPath, renderAt } from '../helpers/renderAt'
import { activity, done, exercise, oct, workout } from '../helpers/workouts'

async function openActivityForm() {
  renderAt('/tabs/timeline')
  fireEvent.click(await buttonByLabel('הוספה'))
  fireEvent.click(await screen.findByText('פעילות אחרת', { selector: '.action-sheet-button *' }))
}

const saveButton = () => screen.getByText('שמירה').closest('ion-button')

const cardOf = async (title: string) => (await screen.findByText(title, { selector: 'h2' })).closest('ion-item')

describe('other activity', () => {
  beforeEach(resetDb)
  freezeDate(oct(26, 12))

  it('logs an activity after the fact and stays on the timeline', async () => {
    await openActivityForm()

    ionInput(await ionField('שם הפעילות'), 'אגרוף תאילנדי')
    ionInput(await ionField('תאריך'), '2026-10-24')
    ionChange(await startTimePicker(), '19:00')
    fireEvent.click(screen.getByText('שמירה'))

    await waitFor(async () =>
      expect(await finishedRecords()).toEqual([
        {
          kind: 'activity',
          id: expect.any(String),
          name: 'אגרוף תאילנדי',
          startedAt: oct(24, 19),
          finishedAt: oct(24, 20),
          summary: '',
          location: '',
        },
      ]),
    )
    expect(currentPath()).toBe('/tabs/timeline')
    expect((await cardOf('אגרוף תאילנדי'))?.textContent).toContain('60 דק׳')
  })

  it('saves the location typed for it and shows it on the card', async () => {
    await openActivityForm()

    ionInput(await ionField('שם הפעילות'), 'כדורגל')
    ionInput(await ionField('מיקום'), ' פארק הירקון ')
    ionChange(await startTimePicker(), '10:00')
    fireEvent.click(screen.getByText('שמירה'))

    await waitFor(async () => expect(await finishedRecords()).toEqual([expect.objectContaining({ name: 'כדורגל', location: 'פארק הירקון' })]))
    expect((await cardOf('כדורגל'))?.textContent).toContain('60 דק׳ · פארק הירקון')
  })

  it('needs a name before it can be saved', async () => {
    await openActivityForm()

    await ionField('שם הפעילות')
    expect(saveButton()).toHaveProperty('disabled', true)

    ionInput(await ionField('שם הפעילות'), '   ')
    expect(saveButton()).toHaveProperty('disabled', true)
  })

  it('uses the same time rules as a past workout', async () => {
    await openActivityForm()

    ionInput(await ionField('שם הפעילות'), 'פילאטיס')
    ionChange(await startTimePicker(), '12:30')

    expect(await screen.findByText('שעת ההתחלה צריכה להיות בעבר')).toBeInTheDocument()
    expect(saveButton()).toHaveProperty('disabled', true)
  })

  it('offers past activity names, filtered by what is typed', async () => {
    await saveRecord(activity({ id: 'a1', name: 'אגרוף תאילנדי', startedAt: oct(20, 19) }))
    await saveRecord(activity({ id: 'a2', name: 'פילאטיס מכשירים', startedAt: oct(22, 8) }))
    await openActivityForm()

    expect(await screen.findByText('פילאטיס מכשירים', { selector: 'ion-modal ion-label' })).toBeInTheDocument()
    expect(screen.getByText('אגרוף תאילנדי', { selector: 'ion-modal ion-label' })).toBeInTheDocument()

    ionInput(await ionField('שם הפעילות'), 'פיל')
    await waitFor(() => expect(screen.queryByText('אגרוף תאילנדי', { selector: 'ion-modal ion-label' })).not.toBeInTheDocument())
    fireEvent.click(screen.getByText('פילאטיס מכשירים', { selector: 'ion-modal ion-label' }))

    expect(await screen.findByLabelText('שם הפעילות')).toHaveValue('פילאטיס מכשירים')
  })

  it('picking a past activity fills in the last location given for it, which can still be changed', async () => {
    await saveRecord(activity({ id: 'a1', name: 'כדורגל', startedAt: oct(20, 19), location: 'פארק הירקון' }))
    await saveRecord(activity({ id: 'a2', name: 'כדורגל', startedAt: oct(22, 19) }))
    await openActivityForm()

    fireEvent.click(await screen.findByText('כדורגל', { selector: 'ion-modal ion-label' }))
    expect(await screen.findByLabelText('מיקום')).toHaveValue('פארק הירקון')

    ionInput(await ionField('מיקום'), 'מגרש השכונה')
    ionChange(await startTimePicker(), '10:00')
    fireEvent.click(screen.getByText('שמירה'))

    await waitFor(async () => expect((await finishedRecords())[0]).toMatchObject({ name: 'כדורגל', location: 'מגרש השכונה' }))
  })

  it('typing a past activity name in full fills in its location', async () => {
    await saveRecord(activity({ id: 'a1', name: 'כדורגל', startedAt: oct(20, 19), location: 'פארק הירקון' }))
    await openActivityForm()

    ionInput(await ionField('שם הפעילות'), 'כדורגל ')

    await waitFor(() => expect(screen.getByLabelText('מיקום')).toHaveValue('פארק הירקון'))
  })

  it('keeps a location typed by hand when the name changes', async () => {
    await saveRecord(activity({ id: 'a1', name: 'כדורגל', startedAt: oct(20, 19), location: 'פארק הירקון' }))
    await openActivityForm()
    await screen.findByText('כדורגל', { selector: 'ion-modal ion-label' })

    ionInput(await ionField('מיקום'), 'חוף הים')
    ionInput(await ionField('שם הפעילות'), 'כדורגל')

    await waitFor(() => expect(screen.getByLabelText('שם הפעילות')).toHaveValue('כדורגל'))
    expect(screen.getByLabelText('מיקום')).toHaveValue('חוף הים')
  })

  it('fills in the location saved for the activity over the last one logged', async () => {
    await saveRecord(activity({ id: 'a1', name: 'כדורגל', startedAt: oct(20, 19), location: 'פארק הירקון' }))
    await setActivityLocation('כדורגל', 'מגרש השכונה')
    await openActivityForm()

    ionInput(await ionField('שם הפעילות'), 'כדורגל')

    await waitFor(() => expect(screen.getByLabelText('מיקום')).toHaveValue('מגרש השכונה'))
  })

  it('logging an activity with a location saves it as the location for that name', async () => {
    await saveRecord(activity({ id: 'a1', name: 'כדורגל', startedAt: oct(20, 19), location: 'פארק הירקון' }))
    await setActivityNote('כדורגל', 'להביא נעליים')
    await openActivityForm()

    ionInput(await ionField('שם הפעילות'), 'כדורגל')
    ionInput(await ionField('מיקום'), ' חוף הים ')
    ionChange(await startTimePicker(), '10:00')
    fireEvent.click(screen.getByText('שמירה'))

    await waitFor(async () =>
      expect(await activityDetailsMap()).toEqual(new Map([['כדורגל', { name: 'כדורגל', note: 'להביא נעליים', location: 'חוף הים' }]])),
    )
  })

  it('renaming an activity carries its note to the new name, with the location typed in the form', async () => {
    await saveRecord(activity({ id: 'a1', startedAt: oct(24, 19), location: 'המכון' }))
    await setActivityNote('אגרוף תאילנדי', 'להביא כפפות')
    renderAt('/tabs/timeline/a1')

    fireEvent.click(await screen.findByText('עריכה'))
    ionInput(await ionField('שם הפעילות'), 'קיקבוקס')
    ionInput(await ionField('מיקום'), 'חוף הים')
    fireEvent.click(screen.getByText('שמירה'))

    await waitFor(async () =>
      expect((await activityDetailsMap()).get('קיקבוקס')).toEqual({ name: 'קיקבוקס', note: 'להביא כפפות', location: 'חוף הים' }),
    )
  })

  it('counts as a workout in the week header and shows no sets on its card', async () => {
    await saveWorkout(workout({ id: 'w1', startedAt: oct(25, 8), exercises: [exercise('סקוואט', [done(20, 10), done(20, 10)])] }))
    await saveRecord(activity({ id: 'a1', startedAt: oct(26, 7) }))
    renderAt('/tabs/timeline')

    expect(await screen.findByText('2 אימונים · 2 סטים')).toBeInTheDocument()
    expect((await cardOf('אגרוף תאילנדי'))?.textContent).not.toContain('סטים')
  })

  it('detail shows the activity and edits it in the same form', async () => {
    await saveRecord(activity({ id: 'a1', startedAt: oct(24, 19), summary: 'ספארינג' }))
    renderAt('/tabs/timeline/a1')

    expect(await screen.findByText(/60 דק׳$/, { selector: '.workout-overview' })).toBeInTheDocument()
    fireEvent.click(await screen.findByText('עריכה'))

    expect(await screen.findByLabelText('שם הפעילות')).toHaveValue('אגרוף תאילנדי')
    ionInput(await ionField('משך (דקות)'), '90')
    fireEvent.click(screen.getByText('שמירה'))

    await waitFor(async () =>
      expect(await finishedRecords()).toEqual([activity({ id: 'a1', startedAt: oct(24, 19), finishedAt: oct(24, 20, 30), summary: 'ספארינג' })]),
    )
    expect(currentPath()).toBe('/tabs/timeline/a1')
  })

  it('detail shows the location, and editing keeps it when another past name is picked', async () => {
    await saveRecord(activity({ id: 'a1', name: 'כדורגל', startedAt: oct(20, 19), location: 'פארק הירקון' }))
    await saveRecord(activity({ id: 'a2', name: 'כדורסל', startedAt: oct(24, 19), location: 'אולם הספורט' }))
    renderAt('/tabs/timeline/a2')

    expect(await screen.findByText(/60 דק׳ · אולם הספורט$/, { selector: '.workout-overview' })).toBeInTheDocument()
    fireEvent.click(await screen.findByText('עריכה'))
    ionInput(await ionField('שם הפעילות'), '')
    fireEvent.click(await screen.findByText('כדורגל', { selector: 'ion-modal ion-label' }))

    await waitFor(() => expect(screen.getByLabelText('שם הפעילות')).toHaveValue('כדורגל'))
    expect(screen.getByLabelText('מיקום')).toHaveValue('אולם הספורט')
  })

  it('detail deletes the activity', async () => {
    await saveRecord(activity({ id: 'a1', startedAt: oct(24, 19) }))
    renderAt('/tabs/timeline/a1')

    fireEvent.click(await screen.findByText('מחיקת האימון'))
    fireEvent.click(await screen.findByText('מחיקה', { selector: '.alert-button *' }))

    await waitFor(async () => expect(await finishedRecords()).toHaveLength(0))
  })
})
