import { fireEvent, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { saveRoutine, saveWorkout } from '../../src/data/repo'
import { freezeDate } from '../helpers/clock'
import { resetDb } from '../helpers/db'
import { actionSheetPresented, buttonByLabel, dialogName, OPEN_MODAL } from '../helpers/ionic'
import { chooseFromMenu, openOverviewEditing } from '../helpers/live'
import { exercisePicker } from '../helpers/picker'
import { renderAt } from '../helpers/renderAt'
import { dailyRoutine, exercise, oct, open, reps, seconds, workout } from '../helpers/workouts'

const session = workout({
  id: 'w1',
  startedAt: oct(26),
  finishedAt: null,
  exercises: [exercise('סקוואט', [open(60, 10), open(60, 10)]), exercise('לחיצת חזה', [open(40, 10)])],
})

const drills = { ...dailyRoutine('d1', 'חטיפי תנועה', [[{ name: 'גשר ישבן', target: reps(15) }]]), createdAt: oct(20) }

const stretches = { ...dailyRoutine('d2', 'מתיחות', [[{ name: 'פרפר', target: seconds(30) }]]), createdAt: oct(20) }

const dayButton = (name: string) => screen.findByRole('button', { name })

const openSheetNames = () => Array.from(document.querySelectorAll(OPEN_MODAL), dialogName)

const expectOpenSheets = (names: string[]) => waitFor(() => expect(openSheetNames()).toEqual(names))

freezeDate(oct(26, 12))

describe('sheet names for VoiceOver', () => {
  beforeEach(async () => {
    await resetDb()
    await saveWorkout(session)
  })

  it('names the live workout exercise list with its title', async () => {
    renderAt('/tabs/timeline/workout/w1')

    fireEvent.click(await screen.findByLabelText('כל התרגילים'))

    await expectOpenSheets(['תרגילים'])
  })

  it('names the exercise picker after what it does, also when it switches from adding to replacing', async () => {
    const user = await openOverviewEditing()

    fireEvent.click(await screen.findByText('הוספת תרגיל', { selector: 'ion-label' }))
    await expectOpenSheets(['תרגילים', 'הוספת תרגיל'])

    fireEvent.click(await (await exercisePicker()).findByText('ביטול'))
    await expectOpenSheets(['תרגילים'])

    await user.click(await screen.findByText('לחיצת חזה', { selector: 'ion-modal ion-item ion-label' }))
    fireEvent.click(await screen.findByText('החלפת תרגיל'))

    await expectOpenSheets(['תרגילים', 'החלפת תרגיל'])
  })

  it('names the summary sheet "סיכום האימון" at סיום and "סיכום" from the item menu', async () => {
    const user = userEvent.setup()
    renderAt('/tabs/timeline/workout/w1')

    await user.click(await screen.findByText('סיום', { selector: 'ion-button' }))
    await expectOpenSheets(['סיכום האימון'])

    await user.click(screen.getByText('ביטול', { selector: 'ion-modal ion-button' }))
    await expectOpenSheets([])

    await chooseFromMenu('הוספה לסיכום')
    await expectOpenSheets(['סיכום'])
  })

  it('keeps the name on the dialog only, also after the sheet re-renders', async () => {
    await openOverviewEditing()

    await expectOpenSheets(['תרגילים'])
    expect(document.querySelectorAll('ion-modal[aria-label]')).toHaveLength(0)
  })
})

describe('timeline addition names', () => {
  beforeEach(resetDb)

  it('names the "+" action sheet "הוספה"', async () => {
    renderAt('/tabs/timeline')
    const presented = actionSheetPresented()

    fireEvent.click(await buttonByLabel('הוספה'))
    await presented

    expect(screen.getByRole('dialog', { name: 'הוספה' })).toBe(document.querySelector('ion-action-sheet'))
  })
})

describe('day sheet names', () => {
  beforeEach(async () => {
    await resetDb()
    await saveRoutine(drills)
    await saveRoutine(stretches)
  })

  it('names each day’s sheet with that day', async () => {
    renderAt('/tabs/daily')

    fireEvent.click(await dayButton('יום א׳ 25.10'))
    await expectOpenSheets(['יום א׳ 25.10'])

    fireEvent.click(await screen.findByText('סגירה', { selector: 'ion-modal ion-button' }))
    await expectOpenSheets([])

    fireEvent.click(await dayButton('יום ש׳ 24.10'))
    await expectOpenSheets(['יום ש׳ 24.10'])
  })
})
