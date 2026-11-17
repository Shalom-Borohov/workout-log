import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../src/data/db'
import { saveRoutine, saveWorkout } from '../../src/data/repo'
import { freezeDate } from '../helpers/clock'
import { firstSectionNames, firstSectionRoutineNames, resetDb, savedWorkout } from '../helpers/db'
import { ionInput, OPEN_MODAL } from '../helpers/ionic'
import { openOverviewEditing } from '../helpers/live'
import { addPicked, exercisePicker, pickerRows, pickerSearch, tickedRow, tickPicked } from '../helpers/picker'
import { renderAt } from '../helpers/renderAt'
import { done, exercise, oct, open, reps, routine, seconds, workout } from '../helpers/workouts'

const base = routine('r1', 'אימון גוף מלא', [
  [{ name: 'סקוואט', target: reps(12) }],
  [
    { name: 'לחיצת חזה', target: reps(10) },
    { name: 'פלאנק', target: seconds(30) },
  ],
  [{ name: 'מתח', target: reps(8) }],
])

const SQUAT_SETS = 5

const OTHER_SETS = 4

const fullBody = {
  ...base,
  sections: [
    {
      ...base.sections[0],
      items: base.sections[0].items.map((item, itemIndex) => ({ ...item, sets: itemIndex === 0 ? SQUAT_SETS : OTHER_SETS })),
    },
  ],
}

const history = workout({
  id: 'prev',
  startedAt: oct(22),
  exercises: [{ ...exercise('דדליפט', [done(80, 8), done(80, 6)], reps(8)), tip: 'גב ישר' }, exercise('חתירה', [done(30, 12)])],
})

const savedItems = async () => (await db.routines.get('r1'))?.sections[0].items

const names = () => firstSectionRoutineNames('r1')

const pickerOpen = () => document.querySelector(`${OPEN_MODAL} ion-searchbar`) !== null

const openAdd = async () => fireEvent.click(await screen.findByText('הוספת תרגיל', { selector: 'ion-label' }))

freezeDate(oct(26, 12))

async function openAddAfter(title: string) {
  fireEvent.click(await screen.findByText(title, { selector: 'h2' }))
  fireEvent.click(await screen.findByText('הוספת תרגיל אחרי'))
}

describe('adding several exercises in the routine editor', () => {
  beforeEach(async () => {
    await resetDb()
    await saveRoutine(fullBody)
    await saveWorkout(history)
    renderAt('/tabs/routines/r1')
  })

  it('ticks names instead of adding them, and adds the ticked ones in tick order', async () => {
    await openAdd()
    await tickPicked('חתירה', 'דדליפט')

    expect(await tickedRow('חתירה')).toHaveTextContent('חתירה נבחר')
    expect(await tickedRow('מתח')).not.toHaveTextContent('נבחר')
    expect(await names()).toEqual(['סקוואט', 'לחיצת חזה + פלאנק', 'מתח'])

    fireEvent.click(await (await exercisePicker()).findByText('הוספה (2)'))

    await waitFor(async () => expect(await names()).toEqual(['סקוואט', 'לחיצת חזה + פלאנק', 'מתח', 'חתירה', 'דדליפט']))
    expect((await savedItems())?.[4]).toMatchObject({ sets: 4, exercises: [{ name: 'דדליפט', target: reps(8), weight: null, tip: 'גב ישר' }] })
    await waitFor(() => expect(pickerOpen()).toBe(false))
    expect(screen.queryByText('מחיקת התרגיל')).not.toBeInTheDocument()
  })

  it('a second tap unticks a name', async () => {
    await openAdd()
    await tickPicked('חתירה', 'דדליפט', 'חתירה')

    expect(await tickedRow('חתירה')).not.toHaveTextContent('נבחר')
    fireEvent.click(await (await exercisePicker()).findByText('הוספה (1)'))

    await waitFor(async () => expect(await names()).toEqual(['סקוואט', 'לחיצת חזה + פלאנק', 'מתח', 'דדליפט']))
  })

  it('keeps the ticks while the search changes', async () => {
    await openAdd()
    await tickPicked('דדליפט')
    ionInput(await pickerSearch(), 'חתי')
    await waitFor(async () => expect(await pickerRows()).toEqual(['תרגיל חדש: חתי', 'חתירה 22.10']))
    await tickPicked('חתירה')
    ionInput(await pickerSearch(), '')

    expect(await tickedRow('דדליפט')).toHaveTextContent('דדליפט נבחר')
    fireEvent.click(await (await exercisePicker()).findByText('הוספה (2)'))

    await waitFor(async () => expect(await names()).toEqual(['סקוואט', 'לחיצת חזה + פלאנק', 'מתח', 'דדליפט', 'חתירה']))
  })

  it('"הוספה" is disabled until a name is ticked, and "ביטול" adds nothing and drops the ticks', async () => {
    await openAdd()

    expect((await (await exercisePicker()).findByText('הוספה')).closest('ion-button')).toHaveAttribute('disabled')
    await tickPicked('דדליפט')
    fireEvent.click(await (await exercisePicker()).findByText('ביטול'))
    await waitFor(() => expect(pickerOpen()).toBe(false))

    await openAdd()

    expect(await tickedRow('דדליפט')).not.toHaveTextContent('נבחר')
    expect(await names()).toEqual(['סקוואט', 'לחיצת חזה + פלאנק', 'מתח'])
  })

  it('"+ תרגיל חדש" adds the ticked ones first, then the new one, and opens the new one', async () => {
    await openAdd()
    await tickPicked('דדליפט')
    ionInput(await pickerSearch(), 'פולאובר')
    fireEvent.click(await (await exercisePicker()).findByText('תרגיל חדש: פולאובר'))

    await waitFor(async () => expect(await names()).toEqual(['סקוואט', 'לחיצת חזה + פלאנק', 'מתח', 'דדליפט', 'פולאובר']))
    expect(await screen.findByLabelText('שם התרגיל')).toHaveValue('פולאובר')
  })

  it('"הוספת תרגיל אחרי" inserts the ticked ones in tick order with that exercise’s sets', async () => {
    await openAddAfter('סקוואט')
    await addPicked('חתירה', 'דדליפט')

    await waitFor(async () => expect(await names()).toEqual(['סקוואט', 'חתירה', 'דדליפט', 'לחיצת חזה + פלאנק', 'מתח']))
    expect((await savedItems())?.map((item) => item.sets)).toEqual([5, 5, 5, 4, 4])
  })

  it('"הוספת תרגיל אחרי" a pair goes after the whole pair', async () => {
    await openAddAfter('לחיצת חזה + פלאנק')
    await addPicked('דדליפט', 'חתירה')

    await waitFor(async () => expect(await names()).toEqual(['סקוואט', 'לחיצת חזה + פלאנק', 'דדליפט', 'חתירה', 'מתח']))
  })
})

describe('replacing an exercise in the routine editor', () => {
  beforeEach(async () => {
    await resetDb()
    await saveRoutine(fullBody)
    await saveWorkout(history)
    renderAt('/tabs/routines/r1')
  })

  async function openReplace() {
    fireEvent.click(await screen.findByText('לחיצת חזה + פלאנק', { selector: 'h2' }))
    fireEvent.click((await screen.findAllByText('החלפת תרגיל'))[1])
    await waitFor(() => expect(pickerOpen()).toBe(true))
  }

  it('shows the list titled "החלפת תרגיל", without ticks, "הוספה" or "+ תרגיל חדש"', async () => {
    await openReplace()
    const picker = await exercisePicker()

    expect(await picker.findByText('החלפת תרגיל')).toBeInTheDocument()
    await waitFor(async () => expect(await pickerRows()).toEqual(['דדליפט 22.10', 'חתירה 22.10', 'לחיצת חזה', 'מתח', 'סקוואט', 'פלאנק']))
    expect(picker.queryByText('הוספה')).not.toBeInTheDocument()
    expect(await tickedRow('מתח')).not.toHaveTextContent('נבחר')
  })

  it('a tap puts the exercise in its place, keeps the sets and the pair order, and reopens the sheet', async () => {
    await openReplace()
    fireEvent.click(await (await exercisePicker()).findByText('דדליפט'))

    await waitFor(async () =>
      expect((await savedItems())?.[1]).toEqual({
        id: 'r1-i1',
        sets: 4,
        exercises: [
          { name: 'לחיצת חזה', target: reps(10), weight: null, tip: '' },
          { name: 'דדליפט', target: reps(8), weight: null, tip: 'גב ישר' },
        ],
      }),
    )
    await waitFor(() => expect(screen.getAllByLabelText('שם התרגיל')[1]).toHaveValue('דדליפט'))
    expect(screen.getAllByLabelText('שם התרגיל')[0]).toHaveValue('לחיצת חזה')
    expect(pickerOpen()).toBe(false)
  })

  it('"ביטול" reopens the sheet unchanged', async () => {
    await openReplace()
    fireEvent.click(await (await exercisePicker()).findByText('ביטול'))

    expect(await screen.findByText('מחיקת התרגיל')).toBeInTheDocument()
    expect(await names()).toEqual(['סקוואט', 'לחיצת חזה + פלאנק', 'מתח'])
  })
})

describe('in a workout’s עריכה', () => {
  beforeEach(async () => {
    await resetDb()
    await saveWorkout(history)

    await saveWorkout(
      workout({
        id: 'w1',
        startedAt: oct(26),
        finishedAt: null,
        exercises: [exercise('סקוואט', [done(60, 10), open(60, 10)]), exercise('לחיצת חזה', [open(40, 10), open(40, 10)])],
      }),
    )
  })

  const savedNames = () => firstSectionNames('w1')

  it('adds the ticked exercises in tick order', async () => {
    await openOverviewEditing()
    fireEvent.click(await screen.findByText('הוספת תרגיל', { selector: 'ion-label' }))
    await addPicked('חתירה', 'דדליפט')

    await waitFor(async () => expect(await savedNames()).toEqual(['סקוואט', 'לחיצת חזה', 'חתירה', 'דדליפט']))
    expect((await savedWorkout('w1'))?.sections[0].items[3].exercises[0].sets).toEqual([open(80, 8), open(80, 6)])
  })

  it('replaces an exercise like renaming it and reopens its sheet', async () => {
    const user = await openOverviewEditing()

    await user.click(await screen.findByText('לחיצת חזה', { selector: 'ion-modal ion-item ion-label' }))
    fireEvent.click(await screen.findByText('החלפת תרגיל'))
    fireEvent.click(await (await exercisePicker()).findByText('דדליפט'))

    await waitFor(async () => expect(await savedNames()).toEqual(['סקוואט', 'דדליפט']))
    expect((await savedWorkout('w1'))?.sections[0].items[1].exercises[0]).toMatchObject({ target: reps(8), tip: 'גב ישר', sets: [open(80, 8), open(80, 6)] })
    await waitFor(() => expect(screen.getByLabelText('שם התרגיל')).toHaveValue('דדליפט'))
  })
})
