import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../src/data/db'
import { saveWorkout } from '../../src/data/repo'
import { resetDb } from '../helpers/db'
import { userEvent } from '@testing-library/user-event'
import { actionSheetPresented, alertPresented, ionInput, visibleAll } from '../helpers/ionic'
import { currentPath, renderAt } from '../helpers/renderAt'
import { exercise, oct, open, workout } from '../helpers/workouts'

const tips = () => visibleAll('.item-tip').map((line) => line.textContent)

beforeEach(async () => {
  await resetDb()
})

async function chooseFromMenu(text: string) {
  const presented = actionSheetPresented()

  fireEvent.click(await screen.findByLabelText('פעולות לתרגיל'))
  await presented
  fireEvent.click(screen.getByText(text, { selector: '.action-sheet-button-label' }))
}

const savedExercises = async () => (await db.workouts.get('w1'))?.sections[0].items[0].exercises

describe('live next-time note', () => {
  it('saves one note per exercise of the item from the item menu', async () => {
    const base = workout({ id: 'w1', startedAt: oct(26), finishedAt: null, exercises: [] })

    const pair = {
      id: 'p',
      exercises: [{ ...exercise('מתח', [open(null, 8)]), note: 'ישן' }, exercise('מקבילים', [open(10, 10)])],
    }

    await saveWorkout({ ...base, sections: [{ name: 'סופר סט', items: [pair] }] })
    renderAt('/tabs/workout/w1')

    const presented = alertPresented()

    await chooseFromMenu('הערה לפעם הבאה')
    await presented

    expect(screen.getByLabelText('הערה · מתח')).toHaveValue('ישן')
    fireEvent.input(screen.getByLabelText('הערה · מתח'), { target: { value: 'אחיזה צרה' } })
    fireEvent.input(screen.getByLabelText('הערה · מקבילים'), { target: { value: 'להוסיף משקל \n' } })
    fireEvent.click(screen.getByText('שמירה', { selector: '.alert-button-inner' }))

    await waitFor(async () => expect((await savedExercises())?.map((pairExercise) => pairExercise.note)).toEqual(['אחיזה צרה', 'להוסיף משקל']))
  })
})

describe('live summary mid-workout', () => {
  it('saves the summary from the item menu without finishing, and the finish sheet shows it', async () => {
    await saveWorkout(workout({ id: 'w1', startedAt: oct(26), finishedAt: null, exercises: [exercise('סקוואט', [open(60, 10)])] }))
    const user = userEvent.setup()
    renderAt('/tabs/workout/w1')

    await chooseFromMenu('הוספה לסיכום')

    expect(await screen.findByText('סיכום', { selector: 'ion-title' })).toBeInTheDocument()
    expect(screen.queryByText('מחיקת האימון')).not.toBeInTheDocument()
    ionInput(screen.getByLabelText('סיכום האימון'), 'כתף כואבת ')
    await user.click(screen.getByText('שמירה', { selector: 'ion-button' }))

    await waitFor(async () => expect((await db.workouts.get('w1'))?.summary).toBe('כתף כואבת'))
    expect((await db.workouts.get('w1'))?.finishedAt).toBeNull()
    expect(currentPath()).toBe('/tabs/workout/w1')

    await waitFor(() => expect(document.querySelector('ion-modal.show-modal')).toBeNull())
    await user.click(screen.getByText('סיום', { selector: 'ion-button' }))

    expect(await screen.findByText('סיכום האימון', { selector: 'ion-title' })).toBeInTheDocument()
    expect(screen.getByLabelText('סיכום האימון')).toHaveValue('כתף כואבת')
  })
})

describe('live exercise tips', () => {
  it('shows the tip under the title', async () => {
    const squat = { ...exercise('סקוואט', [open(60, 10)]), tip: 'גב ישר' }
    await saveWorkout(workout({ id: 'w1', startedAt: oct(26), finishedAt: null, exercises: [squat] }))
    renderAt('/tabs/workout/w1')

    await waitFor(() => expect(tips()).toEqual(['גב ישר']))
  })

  it('prefixes each tip of a pair with its exercise and hides empty tips', async () => {
    const base = workout({ id: 'w1', startedAt: oct(26), finishedAt: null, exercises: [] })

    const pair = {
      id: 'p',
      exercises: [{ ...exercise('מתח', [open(null, 8)]), tip: 'אחיזה רחבה' }, exercise('מקבילים', [open(10, 10)])],
    }

    await saveWorkout({ ...base, sections: [{ name: 'סופר סט', items: [pair] }] })
    renderAt('/tabs/workout/w1')

    expect(await screen.findByText('מתח + מקבילים', { selector: 'h1' })).toBeInTheDocument()
    expect(tips()).toEqual(['מתח: אחיזה רחבה'])
  })
})
