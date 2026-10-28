import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../src/data/db'
import { activeWorkout, saveRoutine, saveWorkout } from '../../src/data/repo'
import { resetDb } from '../helpers/db'
import { actionSheetPresented, buttonByLabel, ionChange, ionElement, ionEvent, ionField, ionInput } from '../helpers/ionic'
import { currentPath, renderAt } from '../helpers/renderAt'
import { oct, reps, routine, seconds, workout } from '../helpers/workouts'

const fullBody = routine('r1', 'אימון גוף מלא', [
  [{ name: 'סקוואט', target: reps(12) }],
  [
    { name: 'לחיצת חזה', target: reps(10) },
    { name: 'פלאנק', target: seconds(30) },
  ],
])

const NOTE = `אימון גוף מלא
חימום 2 סטים:
אופניים 5 דקות

עיקרי 3 סטים:
סקוואט 12 -> לחיצת כתפיים 10
מתח
`

async function exerciseAt(index: number) {
  return (await db.routines.get('r1'))?.sections[0].items[0].exercises[index]
}

function startButton(name: HTMLElement) {
  const row = name.closest('ion-item')

  if (!row) {
    throw new Error('row not found')
  }

  return within(row).getByText('התחל', { selector: 'ion-button' })
}

describe('routines', () => {
  beforeEach(resetDb)

  it('start opens live workout', async () => {
    await saveRoutine(fullBody)
    renderAt('/tabs/routines')

    expect(await screen.findByText('אימון גוף מלא')).toBeInTheDocument()
    expect(screen.getByText('3 תרגילים · חלק אחד')).toBeInTheDocument()

    fireEvent.click(startButton(screen.getByText('אימון גוף מלא')))

    await waitFor(async () => expect((await activeWorkout())?.routineId).toBe('r1'))

    const active = await activeWorkout()

    await waitFor(() => expect(currentPath()).toBe(`/tabs/workout/${active?.id}`))
  })

  it('start is disabled for a routine without exercises', async () => {
    await saveRoutine(routine('r2', 'אימון חדש', []))
    renderAt('/tabs/routines')

    expect(startButton(await screen.findByText('אימון חדש'))).toHaveAttribute('disabled')
  })

  it('start on the routine in progress opens it', async () => {
    await saveRoutine(fullBody)
    await saveWorkout(workout({ id: 'w-active', startedAt: oct(26), finishedAt: null, exercises: [] }))
    renderAt('/tabs/routines')

    fireEvent.click(startButton(await screen.findByText('אימון גוף מלא')))

    await waitFor(() => expect(currentPath()).toBe('/tabs/workout/w-active'))
    expect(await db.workouts.count()).toBe(1)
  })

  it('start on another routine asks before opening the workout in progress', async () => {
    await saveRoutine(fullBody)
    await saveRoutine(routine('r2', 'אימון רגליים', [[{ name: 'לאנג׳', target: reps(10) }]]))
    await saveWorkout(workout({ id: 'w-active', startedAt: oct(26), finishedAt: null, exercises: [] }))
    renderAt('/tabs/routines')

    const presented = actionSheetPresented()

    fireEvent.click(startButton(await screen.findByText('אימון רגליים')))
    await presented
    expect(screen.getByText('יש אימון בתהליך', { selector: '.action-sheet-title' })).toBeInTheDocument()
    fireEvent.click(screen.getByText('המשך את אימון גוף מלא', { selector: '.action-sheet-button-label' }))

    await waitFor(() => expect(currentPath()).toBe('/tabs/workout/w-active'))
    expect(await db.workouts.count()).toBe(1)
  })

  it('empty routine opens the editor', async () => {
    renderAt('/tabs/routines')

    await screen.findByText('אין עדיין אימונים')
    fireEvent.click(await buttonByLabel('הוספת אימון'))
    fireEvent.click(await screen.findByText('אימון ריק', { selector: '.action-sheet-button *' }))

    await waitFor(async () => expect(await db.routines.count()).toBe(1))

    const [created] = await db.routines.toArray()

    expect(created).toMatchObject({ name: 'אימון חדש', sections: [{ name: 'עיקרי', sets: 3, items: [] }] })
    await waitFor(() => expect(currentPath()).toBe(`/tabs/routines/${created.id}`))
  })

  it('swipe delete asks before removing a routine', async () => {
    await saveRoutine(fullBody)
    renderAt('/tabs/routines')

    fireEvent.click(await screen.findByText('מחיקה', { selector: 'ion-item-option' }))
    fireEvent.click(await screen.findByText('ביטול', { selector: '.alert-button *' }))

    expect(await db.routines.count()).toBe(1)

    fireEvent.click(await screen.findByText('מחיקה', { selector: 'ion-item-option' }))
    fireEvent.click(await screen.findByText('מחיקה', { selector: '.alert-button *' }))

    await waitFor(async () => expect(await db.routines.count()).toBe(0))
  })

  it('import page does not ask for reps on a zero-length timed exercise', async () => {
    renderAt('/tabs/routines/import')

    ionInput(await ionField('פתק'), 'ליבה\nסיום:\nפלאנק 0 שניות')

    expect(await screen.findByText('פלאנק', { selector: 'h2' })).toBeInTheDocument()
    expect(screen.queryByText('תרגיל עם ? חסר בו מספר חזרות. אפשר לתקן אחרי השמירה.')).not.toBeInTheDocument()
  })

  it('import page saves parsed routine', async () => {
    renderAt('/tabs/routines/import')

    const note = await ionField('פתק')

    ionInput(note, NOTE)

    expect(await screen.findByText('חימום', { selector: 'ion-list-header ion-label' })).toBeInTheDocument()
    expect(screen.getByText('אופניים', { selector: 'h2' })).toBeInTheDocument()
    expect(screen.getByText('5 דק׳', { selector: 'p' })).toBeInTheDocument()
    expect(screen.getByText('סקוואט + לחיצת כתפיים', { selector: 'h2' })).toBeInTheDocument()
    expect(screen.getByText('12 חזרות + 10 חזרות', { selector: 'p' })).toBeInTheDocument()
    expect(screen.getByText('?', { selector: 'ion-text[color="danger"]' })).toBeInTheDocument()
    expect(screen.getByText('תרגיל עם ? חסר בו מספר חזרות. אפשר לתקן אחרי השמירה.')).toBeInTheDocument()

    fireEvent.click(screen.getByText('שמירה', { selector: 'ion-button' }))

    await waitFor(async () => expect(await db.routines.count()).toBe(1))

    const [saved] = await db.routines.toArray()

    expect(saved).toMatchObject({
      name: 'אימון גוף מלא',
      sections: [
        { name: 'חימום', sets: 2, items: [{ exercises: [{ name: 'אופניים', target: seconds(300) }] }] },
        {
          name: 'עיקרי',
          sets: 3,
          items: [
            {
              exercises: [
                { name: 'סקוואט', target: reps(12) },
                { name: 'לחיצת כתפיים', target: reps(10) },
              ],
            },
            { exercises: [{ name: 'מתח', target: reps(0) }] },
          ],
        },
      ],
    })
    await waitFor(() => expect(currentPath()).toBe(`/tabs/routines/${saved.id}`))
  })

  it('editor renames and changes sets', async () => {
    await saveRoutine(fullBody)

    renderAt('/tabs/routines/r1')

    await screen.findByText('3', { selector: '.count-stepper-value' })
    ionChange(await ionField('שם האימון'), 'גוף מלא A')
    await waitFor(async () => expect((await db.routines.get('r1'))?.name).toBe('גוף מלא A'))

    ionChange(await ionField('שם החלק'), 'עיקרי כבד')
    await waitFor(async () => expect((await db.routines.get('r1'))?.sections[0].name).toBe('עיקרי כבד'))

    fireEvent.click(screen.getByRole('button', { name: 'הוספת סט' }))
    expect(await screen.findByText('4', { selector: '.count-stepper-value' })).toBeInTheDocument()

    const saved = await db.routines.get('r1')

    expect(saved?.sections[0].sets).toBe(4)
    expect(saved?.updatedAt).toBeGreaterThan(0)
  })

  it('item sheet edits name, target and pair', async () => {
    await saveRoutine(fullBody)
    renderAt('/tabs/routines/r1')

    fireEvent.click(await screen.findByText('סקוואט', { selector: 'h2' }))
    ionChange(await ionField('שם התרגיל'), 'סקוואט גביע')
    await waitFor(async () => expect(await exerciseAt(0)).toEqual({ name: 'סקוואט גביע', target: reps(12), weight: null, tip: '' }))

    ionChange(await screen.findByText('דקות', { selector: 'ion-segment-button ion-label' }), 'minutes')
    await waitFor(async () => expect((await exerciseAt(0))?.target).toEqual(seconds(720)))

    ionChange(await ionField('דקות'), '15')
    await waitFor(async () => expect((await exerciseAt(0))?.target).toEqual(seconds(900)))

    ionChange(await screen.findByText('שניות', { selector: 'ion-segment-button ion-label' }), 'seconds')
    await waitFor(async () => expect((await exerciseAt(0))?.target).toEqual(seconds(15)))

    ionChange(await ionField('שניות'), '45')
    await waitFor(async () => expect((await exerciseAt(0))?.target).toEqual(seconds(45)))

    ionEvent(await screen.findByText('זוג', { selector: 'ion-toggle' }), 'ionChange', { checked: true })
    await waitFor(async () => expect((await db.routines.get('r1'))?.sections[0].items[0].exercises).toHaveLength(2))

    expect(await screen.findByText('סקוואט גביע + תרגיל חדש', { selector: 'h2' })).toBeInTheDocument()
    expect(screen.getByText('45 שנ׳ + 10 חזרות', { selector: 'p' })).toBeInTheDocument()
  })

  it('editor reorders, adds and deletes items and sections', async () => {
    await saveRoutine(fullBody)

    renderAt('/tabs/routines/r1')
    const names = async () => (await db.routines.get('r1'))?.sections.map((section) => section.items.map((item) => item.exercises[0].name))

    await screen.findByText('סקוואט', { selector: 'h2' })
    ionEvent(await ionElement('ion-reorder-group'), 'ionReorderEnd', { from: 0, to: 1, complete: () => {} })
    await waitFor(async () => expect(await names()).toEqual([['לחיצת חזה', 'סקוואט']]))

    fireEvent.click(screen.getByText('הוספת תרגיל'))
    await waitFor(async () => expect(await names()).toEqual([['לחיצת חזה', 'סקוואט', 'תרגיל חדש']]))
    fireEvent.click(await screen.findByText('מחיקת התרגיל'))
    await waitFor(async () => expect(await names()).toEqual([['לחיצת חזה', 'סקוואט']]))

    fireEvent.click(screen.getByText('הוספת חלק'))
    await waitFor(async () => expect(await names()).toEqual([['לחיצת חזה', 'סקוואט'], []]))

    fireEvent.click(screen.getAllByText('מחיקת החלק')[0])
    fireEvent.click(await screen.findByText('מחיקה', { selector: '.alert-button *' }))
    await waitFor(async () => expect(await names()).toEqual([[]]))
    expect((await db.routines.get('r1'))?.sections[0].name).toBe('חלק חדש')
  })

  it('editor deletes the routine', async () => {
    await saveRoutine(fullBody)
    renderAt('/tabs/routines/r1')

    fireEvent.click(await screen.findByText('מחיקת האימון'))
    fireEvent.click(await screen.findByText('מחיקה', { selector: '.alert-button *' }))

    await waitFor(async () => expect(await db.routines.count()).toBe(0))
    await waitFor(() => expect(currentPath()).toBe('/tabs/routines'))
  })
})

