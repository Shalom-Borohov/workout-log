import { fireEvent, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../src/data/db'
import { saveRoutine, saveWorkout } from '../../src/data/repo'
import { freezeDate } from '../helpers/clock'
import { resetDb } from '../helpers/db'
import { alertPresented, ionChange, ionElement, ionEvent, ionField, ionInput, OPEN_MODAL, visibleAll } from '../helpers/ionic'
import { exercisePicker, pickerRows, pickerSearch } from '../helpers/picker'
import { renderAt } from '../helpers/renderAt'
import { done, exercise, oct, open, reps, routine, seconds, workout } from '../helpers/workouts'

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

const savedNames = async () =>
  (await db.workouts.get('w1'))?.sections.map((section) => section.items.map((item) => item.exercises.map((itemExercise) => itemExercise.name).join(' + ')))

const modalElement = (selector: string) => ionElement(selector, OPEN_MODAL)

async function openOverviewEditing() {
  const user = userEvent.setup()

  renderAt('/tabs/timeline/workout/w1')
  await user.click(await screen.findByLabelText('כל התרגילים'))
  await user.click(await screen.findByText('עריכה', { selector: 'ion-modal ion-button' }))

  return user
}

describe('overview editing', () => {
  beforeEach(async () => {
    await resetDb()
    await saveWorkout(session)
  })

  it('adds a new exercise to a section from the picker and opens it for editing', async () => {
    await openOverviewEditing()

    fireEvent.click(await screen.findByText('הוספת תרגיל', { selector: 'ion-label' }))
    fireEvent.click(await (await exercisePicker()).findByText('תרגיל חדש'))

    await waitFor(async () => expect(await savedNames()).toEqual([['סקוואט', 'לחיצת חזה', 'חתירה', 'תרגיל חדש']]))

    const added = (await db.workouts.get('w1'))?.sections[0].items[3].exercises[0]

    expect(added?.sets).toEqual([open(null, 10), open(null, 10)])
    expect(await screen.findByLabelText('שם התרגיל')).toHaveValue('תרגיל חדש')
  })

  it('renames an exercise through the item editor, keeping its sets', async () => {
    const user = await openOverviewEditing()

    await user.click(await screen.findByText('סקוואט', { selector: 'ion-modal ion-item ion-label' }))
    ionChange(await ionField('שם התרגיל'), 'סקוואט גביע')

    await waitFor(async () => expect(await savedNames()).toEqual([['סקוואט גביע', 'לחיצת חזה', 'חתירה']]))
    expect((await db.workouts.get('w1'))?.sections[0].items[0].exercises[0].sets).toEqual([done(60, 10), open(60, 10)])
    expect(screen.queryByText('משקל התחלתי (ק״ג)')).not.toBeInTheDocument()
  })

  it('deletes the current exercise and moves on to the next one', async () => {
    await openOverviewEditing()

    fireEvent.click(await screen.findByLabelText('מחיקת סקוואט'))

    await waitFor(async () => expect(await savedNames()).toEqual([['לחיצת חזה', 'חתירה']]))
    expect(await screen.findByText('לחיצת חזה', { selector: 'h1' })).toBeInTheDocument()
    expect(screen.getByText('תרגיל 1 מתוך 2')).toBeInTheDocument()
  })

  it('reorders within a section and keeps showing the current exercise', async () => {
    await openOverviewEditing()

    ionEvent(await modalElement('ion-reorder-group'), 'ionReorderEnd', { from: 0, to: 2, complete: () => {} })

    await waitFor(async () => expect(await savedNames()).toEqual([['לחיצת חזה', 'חתירה', 'סקוואט']]))
    expect(screen.getByText('סקוואט', { selector: 'h1' })).toBeInTheDocument()
    expect(screen.getByText('תרגיל 3 מתוך 3')).toBeInTheDocument()
  })

  it('a deleted exercise does not carry its selected set over to the next one', async () => {
    await saveWorkout(
      workout({
        id: 'w1',
        startedAt: oct(26),
        finishedAt: null,
        exercises: [
          exercise('סקוואט', [open(60, 10), open(60, 10)]),
          exercise('לחיצת חזה', [open(40, 10), open(40, 10), open(40, 10)]),
        ],
      }),
    )
    renderAt('/tabs/timeline/workout/w1')
    fireEvent.click((await screen.findAllByText('סט 2', { selector: '.set-select .set-title' }))[0])
    fireEvent.click(await screen.findByLabelText('כל התרגילים'))
    fireEvent.click(await screen.findByText('עריכה', { selector: 'ion-modal ion-button' }))

    fireEvent.click(await screen.findByLabelText('מחיקת סקוואט'))

    expect(await screen.findByText('לחיצת חזה', { selector: 'h1' })).toBeInTheDocument()
    expect(document.querySelector('.set-row-current .current-title')).toHaveTextContent('סט 1')
  })

  it('deletes from the item editor', async () => {
    const user = await openOverviewEditing()

    await user.click(await screen.findByText('חתירה', { selector: 'ion-modal ion-item ion-label' }))
    fireEvent.click(await screen.findByText('מחיקת התרגיל'))

    await waitFor(async () => expect(await savedNames()).toEqual([['סקוואט', 'לחיצת חזה']]))
  })
})

describe('adding an existing exercise', () => {
  freezeDate(oct(26, 12))

  beforeEach(async () => {
    await resetDb()
    await saveWorkout(session)
    await saveRoutine(routine('r1', 'אימון גוף מלא', [[{ name: 'פלאנק', target: seconds(30) }]]))

    await saveWorkout(
      workout({
        id: 'prev',
        startedAt: oct(22),
        exercises: [{ ...exercise('דדליפט', [done(80, 8), done(80, 6)], reps(8)), tip: 'גב ישר' }, exercise('מתח', [done(null, 8)])],
      }),
    )
  })

  it('lists done exercises with their last date before routine ones, and filters by search', async () => {
    await openOverviewEditing()

    fireEvent.click(await screen.findByText('הוספת תרגיל', { selector: 'ion-label' }))

    await waitFor(async () => expect(await pickerRows()).toEqual(['תרגיל חדש', 'דדליפט 22.10', 'מתח 22.10', 'פלאנק']))
    ionInput(await pickerSearch(), ' דד ')
    await waitFor(async () => expect(await pickerRows()).toEqual(['תרגיל חדש', 'דדליפט 22.10']))
  })

  it('adds the picked exercise with its target, tip and last sets, without opening the editor', async () => {
    await openOverviewEditing()

    fireEvent.click(await screen.findByText('הוספת תרגיל', { selector: 'ion-label' }))
    fireEvent.click(await (await exercisePicker()).findByText('דדליפט'))

    await waitFor(async () => expect(await savedNames()).toEqual([['סקוואט', 'לחיצת חזה', 'חתירה', 'דדליפט']]))
    expect((await db.workouts.get('w1'))?.sections[0].items[3].exercises[0]).toEqual({
      ...exercise('דדליפט', [open(80, 8), open(80, 6)], reps(8)),
      tip: 'גב ישר',
    })
    await waitFor(() => expect(document.querySelector('ion-modal ion-searchbar')).toBeNull())
    expect(screen.queryByLabelText('שם התרגיל')).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('סיום', { selector: 'ion-modal ion-button' }))
    fireEvent.click(await screen.findByText('דדליפט', { selector: 'ion-modal ion-item ion-label' }))

    expect(await screen.findByText('דדליפט', { selector: 'h1' })).toBeInTheDocument()
    await waitFor(() => expect(visibleAll('.item-previous').map((line) => line.textContent)).toEqual(['פעם קודמת: 80 ק״ג × 8, 6']))
  })
})

const toasts =() => Array.from(document.querySelectorAll('ion-toast'), (toast) => toast.message)

describe('saving the workout as a routine', () => {
  beforeEach(async () => {
    await resetDb()
    await saveWorkout(session)
    await saveRoutine(routine('r1', 'אימון גוף מלא', [[{ name: 'סקוואט', target: reps(12), weight: 50 }]], 3))
  })

  it('updates the routine it came from', async () => {
    await openOverviewEditing()

    fireEvent.click(await screen.findByText('עדכון אימון גוף מלא'))

    await waitFor(async () =>
      expect((await db.routines.get('r1'))?.sections).toEqual([
        {
          id: 'r1-s1',
          name: 'עיקרי',
          sets: 2,
          items: [
            { id: 'i0', sets: null, exercises: [{ name: 'סקוואט', target: reps(10), weight: 50, tip: '' }] },
            { id: 'i1', sets: null, exercises: [{ name: 'לחיצת חזה', target: reps(10), weight: null, tip: '' }] },
            { id: 'i2', sets: null, exercises: [{ name: 'חתירה', target: reps(10), weight: null, tip: '' }] },
          ],
        },
      ]),
    )
    expect((await db.routines.get('r1'))?.name).toBe('אימון גוף מלא')
    await waitFor(() => expect(toasts()).toContain('האימון עודכן'))
  })

  it('saves a new routine under the given name and keeps the workout on its routine', async () => {
    await openOverviewEditing()
    const presented = alertPresented()

    fireEvent.click(await screen.findByText('שמירה כאימון חדש'))
    await presented

    const name = screen.getByLabelText('שם האימון')

    expect(name).toHaveValue('אימון גוף מלא (עותק)')
    fireEvent.input(name, { target: { value: 'גוף מלא ב' } })
    fireEvent.click(screen.getByText('שמירה', { selector: '.alert-button-inner' }))

    await waitFor(async () => expect(await db.routines.count()).toBe(2))

    const created = (await db.routines.toArray()).find((saved) => saved.id !== 'r1')

    expect(created?.name).toBe('גוף מלא ב')
    expect(created?.sections[0].items.map((item) => item.exercises[0].name)).toEqual(['סקוואט', 'לחיצת חזה', 'חתירה'])
    expect(created?.sections[0].items[0].exercises[0].weight).toBe(50)
    expect((await db.routines.get('r1'))?.sections[0].items).toHaveLength(1)
    expect((await db.workouts.get('w1'))?.routineId).toBe('r1')
    await waitFor(() => expect(toasts()).toContain('נשמר אימון חדש'))
  })

  it('hides the update when the routine no longer exists', async () => {
    await db.routines.clear()
    await openOverviewEditing()

    expect(await screen.findByText('שמירה כאימון חדש')).toBeInTheDocument()
    expect(screen.queryByText('עדכון אימון גוף מלא')).not.toBeInTheDocument()
  })
})
