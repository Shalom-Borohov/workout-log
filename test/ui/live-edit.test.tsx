import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../src/data/db'
import { saveRoutine, saveWorkout } from '../../src/data/repo'
import { firstSectionNames, resetDb, savedWorkout } from '../helpers/db'
import { alertPresented, buttonByLabel, modalPresented, OPEN_MODAL, queryButtonByLabel, toasts } from '../helpers/ionic'
import { chooseFromMenu } from '../helpers/live'
import { exercisePicker } from '../helpers/picker'
import { renderAt } from '../helpers/renderAt'
import { done, exercise, oct, open, reps, routine, workout } from '../helpers/workouts'

const session = workout({
  id: 'w1',
  startedAt: oct(26),
  finishedAt: null,
  exercises: [
    exercise('סקוואט', [done(60, 10), open(60, 10)]),
    exercise('לחיצת חזה', [open(40, 10), open(40, 10)]),
    exercise('חתירה', [open(30, 12), open(30, 12)]),
  ],
})

describe('editing the workout from the exercise menu', () => {
  beforeEach(async () => {
    await resetDb()
    await saveWorkout(session)
  })

  it('opens the exercise list already in edit mode, and the toolbar still switches back', async () => {
    renderAt('/tabs/timeline/workout/w1')

    await chooseFromMenu('עריכת האימון')

    expect(await screen.findByLabelText('מחיקת סקוואט')).toBeInTheDocument()
    expect(screen.getByText('הוספת תרגיל', { selector: 'ion-modal ion-label' })).toBeInTheDocument()

    fireEvent.click(screen.getByText('סיום', { selector: 'ion-modal ion-button' }))

    await waitFor(() => expect(screen.queryByLabelText('מחיקת סקוואט')).not.toBeInTheDocument())
    expect(screen.getByText('עריכה', { selector: 'ion-modal ion-button' })).toBeInTheDocument()
  })

  it('leaving edit mode hides a revealed delete', async () => {
    renderAt('/tabs/timeline/workout/w1')
    await chooseFromMenu('עריכת האימון')

    fireEvent.click(await buttonByLabel('הצגת מחיקה · סקוואט', OPEN_MODAL))
    await buttonByLabel('מחיקת סקוואט', OPEN_MODAL)
    fireEvent.click(screen.getByText('סיום', { selector: 'ion-modal ion-button' }))
    fireEvent.click(await screen.findByText('עריכה', { selector: 'ion-modal ion-button' }))

    await buttonByLabel('הצגת מחיקה · סקוואט', OPEN_MODAL)
    expect(queryButtonByLabel('מחיקת סקוואט', OPEN_MODAL)).toBeUndefined()
  })

  it('adds an exercise after the one open in the exercise sheet', async () => {
    renderAt('/tabs/timeline/workout/w1')
    const listShown = modalPresented()

    await chooseFromMenu('עריכת האימון')
    await listShown

    const sheetShown = modalPresented()

    fireEvent.click(await screen.findByText('לחיצת חזה', { selector: 'ion-modal ion-item ion-label' }))
    await sheetShown
    fireEvent.click(screen.getByText('הוספת תרגיל אחרי'))

    await waitFor(() => expect(screen.queryByLabelText('שם התרגיל')).not.toBeInTheDocument())
    fireEvent.click(await (await exercisePicker()).findByText('תרגיל חדש'))

    await waitFor(async () => expect(await firstSectionNames('w1')).toEqual(['סקוואט', 'לחיצת חזה', 'תרגיל חדש', 'חתירה']))
    expect(await screen.findByLabelText('שם התרגיל')).toHaveValue('תרגיל חדש')
    expect(screen.getByText('סקוואט', { selector: 'h1' })).toBeInTheDocument()
  })
})

describe('deleting an exercise from the list', () => {
  beforeEach(async () => {
    await resetDb()
    await saveWorkout(session)
  })

  it('asks first when the exercise has a ticked set, and keeps it on cancel', async () => {
    renderAt('/tabs/timeline/workout/w1')
    await chooseFromMenu('עריכת האימון')
    const cancelled = alertPresented()

    fireEvent.click(await screen.findByLabelText('מחיקת סקוואט'))
    await cancelled

    expect(screen.getByText('למחוק את התרגיל?')).toBeInTheDocument()
    expect(screen.getByText('הסטים שרשמת בתרגיל יימחקו.')).toBeInTheDocument()
    fireEvent.click(screen.getByText('ביטול', { selector: '.alert-button-inner' }))
    await waitFor(() => expect(document.querySelector('ion-alert')).toBeNull())
    expect(await firstSectionNames('w1')).toEqual(['סקוואט', 'לחיצת חזה', 'חתירה'])

    const confirmed = alertPresented()

    fireEvent.click(await screen.findByLabelText('מחיקת סקוואט'))
    await confirmed
    fireEvent.click(screen.getByText('מחיקה', { selector: '.alert-button-inner' }))

    await waitFor(async () => expect(await firstSectionNames('w1')).toEqual(['לחיצת חזה', 'חתירה']))
  })

  it('⊖ then the revealed "מחיקה" asks first when the exercise has a ticked set', async () => {
    renderAt('/tabs/timeline/workout/w1')
    await chooseFromMenu('עריכת האימון')
    const presented = alertPresented()

    fireEvent.click(await buttonByLabel('הצגת מחיקה · סקוואט', OPEN_MODAL))
    fireEvent.click(await buttonByLabel('מחיקת סקוואט', OPEN_MODAL))
    await presented

    expect(screen.getByText('למחוק את התרגיל?')).toBeInTheDocument()
    fireEvent.click(screen.getByText('מחיקה', { selector: '.alert-button-inner' }))

    await waitFor(async () => expect(await firstSectionNames('w1')).toEqual(['לחיצת חזה', 'חתירה']))
  })

  it('deletes an untouched exercise at once', async () => {
    renderAt('/tabs/timeline/workout/w1')
    await chooseFromMenu('עריכת האימון')

    fireEvent.click(await screen.findByLabelText('מחיקת חתירה'))

    await waitFor(async () => expect(await firstSectionNames('w1')).toEqual(['סקוואט', 'לחיצת חזה']))
    expect(document.querySelector('ion-alert')).toBeNull()
  })

  it('asks from the exercise sheet too', async () => {
    renderAt('/tabs/timeline/workout/w1')
    const listShown = modalPresented()

    await chooseFromMenu('עריכת האימון')
    await listShown

    const sheetShown = modalPresented()

    fireEvent.click(await screen.findByText('סקוואט', { selector: 'ion-modal ion-item ion-label' }))
    await sheetShown
    const presented = alertPresented()

    fireEvent.click(screen.getByText('מחיקת התרגיל'))
    await presented
    fireEvent.click(screen.getByText('מחיקה', { selector: '.alert-button-inner' }))

    await waitFor(async () => expect(await firstSectionNames('w1')).toEqual(['לחיצת חזה', 'חתירה']))
  })

  it("doesn't ask about the workout's only exercise, which can't be deleted", async () => {
    await saveWorkout(workout({ id: 'w2', startedAt: oct(27), finishedAt: null, exercises: [exercise('סקוואט', [done(60, 10)])] }))
    renderAt('/tabs/timeline/workout/w2')
    const listShown = modalPresented()

    await chooseFromMenu('עריכת האימון')
    await listShown

    const sheetShown = modalPresented()

    fireEvent.click(await screen.findByText('סקוואט', { selector: 'ion-modal ion-item ion-label' }))
    await sheetShown
    fireEvent.click(screen.getByText('מחיקת התרגיל'))

    await waitFor(() => expect(screen.queryByLabelText('שם התרגיל')).not.toBeInTheDocument())
    expect(document.querySelector('ion-alert')).toBeNull()
    expect(await firstSectionNames('w2')).toEqual(['סקוואט'])
  })
})

const sameAsSession = routine('r1', 'אימון גוף מלא', [
  [{ name: 'סקוואט', target: reps(10) }],
  [{ name: 'לחיצת חזה', target: reps(10) }],
  [{ name: 'חתירה', target: reps(10) }],
])

const withoutRowing = routine('r1', 'אימון גוף מלא', [
  [{ name: 'סקוואט', target: reps(10), weight: 50 }],
  [{ name: 'לחיצת חזה', target: reps(10) }],
])


const saveRows = () => ['עדכון אימון גוף מלא', 'שמירה כאימון חדש'].filter((text) => screen.queryByText(text) !== null)

async function openFinishSheet() {
  fireEvent.click(await screen.findByText('סיום', { selector: 'ion-header ion-button' }))
  expect(await screen.findByText('מחיקת האימון')).toBeInTheDocument()
}

describe('saving changes to the routine when finishing', () => {
  beforeEach(async () => {
    await resetDb()
    await saveWorkout(session)
  })

  it('offers nothing when the workout still matches its routine', async () => {
    await saveRoutine(sameAsSession)
    renderAt('/tabs/timeline/workout/w1')

    await openFinishSheet()

    expect(saveRows()).toEqual([])
  })

  it('offers nothing after only adding a set', async () => {
    await saveRoutine(sameAsSession)
    renderAt('/tabs/timeline/workout/w1')
    fireEvent.click(await screen.findByText('הוספת סט', { selector: '.item-actions ion-button' }))
    await waitFor(async () => expect((await savedWorkout('w1'))?.sections[0].items[0].exercises[0].sets).toHaveLength(3))

    await openFinishSheet()

    expect(saveRows()).toEqual([])
  })

  it('offers nothing when the routine was deleted', async () => {
    renderAt('/tabs/timeline/workout/w1')

    await openFinishSheet()

    expect(saveRows()).toEqual([])
  })

  it('updates the routine when the exercises differ, and the rows go away', async () => {
    await saveRoutine(withoutRowing)
    renderAt('/tabs/timeline/workout/w1')
    await openFinishSheet()

    fireEvent.click(await screen.findByText('עדכון אימון גוף מלא'))

    await waitFor(async () => expect((await db.routines.get('r1'))?.sections[0].items).toHaveLength(3))
    await waitFor(() => expect(toasts()).toContain('האימון עודכן'))
    await waitFor(() => expect(saveRows()).toEqual([]))
    expect(screen.getByText('מחיקת האימון')).toBeInTheDocument()
  })

  it('saves a new routine, moves the workout to it, and the rows go away', async () => {
    await saveRoutine(withoutRowing)
    renderAt('/tabs/timeline/workout/w1')
    await openFinishSheet()
    const presented = alertPresented()

    fireEvent.click(await screen.findByText('שמירה כאימון חדש'))
    await presented
    fireEvent.input(screen.getByLabelText('שם האימון'), { target: { value: 'גוף מלא ב' } })
    fireEvent.click(screen.getByText('שמירה', { selector: '.alert-button-inner' }))

    await waitFor(async () => expect(await db.routines.count()).toBe(2))

    const created = (await db.routines.toArray()).find((saved) => saved.id !== 'r1')

    expect(created?.name).toBe('גוף מלא ב')
    await waitFor(async () => expect((await savedWorkout('w1'))?.routineId).toBe(created?.id))
    expect((await savedWorkout('w1'))?.routineName).toBe('גוף מלא ב')
    expect((await db.routines.get('r1'))?.sections[0].items).toHaveLength(2)
    expect(await screen.findByText('גוף מלא ב', { selector: '.live-title' })).toBeInTheDocument()
    await waitFor(() => expect(toasts()).toContain('נשמר אימון חדש'))
    await waitFor(() => expect(saveRows()).toEqual([]))
  })
})
