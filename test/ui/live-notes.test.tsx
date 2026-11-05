import { screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../src/data/db'
import { saveWorkout } from '../../src/data/repo'
import { resetDb, savedWorkout } from '../helpers/db'
import { userEvent } from '@testing-library/user-event'
import { ionInput, visibleAll } from '../helpers/ionic'
import { chooseFromMenu } from '../helpers/live'
import { currentPath, renderAt } from '../helpers/renderAt'
import { exercise, oct, open, workout } from '../helpers/workouts'

const tips = () => visibleAll('.item-tip').map((line) => line.textContent)

beforeEach(async () => {
  await resetDb()
})

const savedExercises = async () => (await savedWorkout('w1'))?.sections[0].items[0].exercises

const exerciseNotes = () => visibleAll('.item-note').map((line) => line.textContent)

describe('live exercise note', () => {
  it('writes one note per exercise of the item in the note sheet and shows them under the sets', async () => {
    const base = workout({ id: 'w1', startedAt: oct(26), finishedAt: null, exercises: [] })

    const pair = {
      id: 'p',
      exercises: [{ ...exercise('מתח', [open(null, 8)]), note: 'ישן' }, exercise('מקבילים', [open(10, 10)])],
    }

    await saveWorkout({ ...base, sections: [{ name: 'סופר סט', items: [pair] }] })
    const user = userEvent.setup()
    renderAt('/tabs/timeline/workout/w1')

    await user.click(await screen.findByText('מתח: ישן', { selector: '.item-note' }))

    expect(await screen.findByText('הערה לתרגיל', { selector: 'ion-modal ion-title' })).toBeInTheDocument()
    expect(screen.getByLabelText('הערה · מתח')).toHaveValue('ישן')
    ionInput(screen.getByLabelText('הערה · מתח'), 'אחיזה צרה')
    ionInput(screen.getByLabelText('הערה · מקבילים'), 'להוסיף משקל \n')
    await user.click(screen.getByText('שמירה', { selector: 'ion-modal ion-button' }))

    await waitFor(async () => expect((await savedExercises())?.map((pairExercise) => pairExercise.note)).toEqual(['אחיזה צרה', 'להוסיף משקל']))
    await waitFor(() => expect(exerciseNotes()).toEqual(['מתח: אחיזה צרה', 'מקבילים: להוסיף משקל']))

    const lastSet = screen.getByRole('button', { name: 'מקבילים סט 1' })

    expect(lastSet.compareDocumentPosition(visibleAll('.item-note')[0]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('reopens the note sheet from the note on the card', async () => {
    const squat = { ...exercise('סקוואט', [open(60, 10)]), note: 'לעלות במשקל' }
    await saveWorkout(workout({ id: 'w1', startedAt: oct(26), finishedAt: null, exercises: [squat] }))
    const user = userEvent.setup()
    renderAt('/tabs/timeline/workout/w1')

    await user.click(await screen.findByText('לעלות במשקל', { selector: '.item-note' }))

    expect(await screen.findByLabelText('הערה · סקוואט')).toHaveValue('לעלות במשקל')
  })

  it('offers to add a note when there is none', async () => {
    await saveWorkout(workout({ id: 'w1', startedAt: oct(26), finishedAt: null, exercises: [exercise('סקוואט', [open(60, 10)])] }))
    const user = userEvent.setup()
    renderAt('/tabs/timeline/workout/w1')

    await user.click(await screen.findByText('הוספת הערה', { selector: '.item-note' }))

    expect(await screen.findByLabelText('הערה · סקוואט')).toHaveValue('')
  })
})

describe('live summary mid-workout', () => {
  it('saves the summary from the item menu without finishing, and the finish sheet shows it', async () => {
    await saveWorkout(workout({ id: 'w1', startedAt: oct(26), finishedAt: null, exercises: [exercise('סקוואט', [open(60, 10)])] }))
    const user = userEvent.setup()
    renderAt('/tabs/timeline/workout/w1')

    await chooseFromMenu('הוספה לסיכום')

    expect(await screen.findByText('סיכום', { selector: 'ion-title' })).toBeInTheDocument()
    expect(screen.queryByText('מחיקת האימון')).not.toBeInTheDocument()
    ionInput(screen.getByLabelText('סיכום האימון'), 'כתף כואבת ')
    await user.click(screen.getByText('שמירה', { selector: 'ion-button' }))

    await waitFor(async () => expect((await db.workouts.get('w1'))?.summary).toBe('כתף כואבת'))
    expect((await db.workouts.get('w1'))?.finishedAt).toBeNull()
    expect(currentPath()).toBe('/tabs/timeline/workout/w1')

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
    renderAt('/tabs/timeline/workout/w1')

    await waitFor(() => expect(tips()).toEqual(['גב ישר']))
  })

  it('prefixes each tip of a pair with its exercise and hides empty tips', async () => {
    const base = workout({ id: 'w1', startedAt: oct(26), finishedAt: null, exercises: [] })

    const pair = {
      id: 'p',
      exercises: [{ ...exercise('מתח', [open(null, 8)]), tip: 'אחיזה רחבה' }, exercise('מקבילים', [open(10, 10)])],
    }

    await saveWorkout({ ...base, sections: [{ name: 'סופר סט', items: [pair] }] })
    renderAt('/tabs/timeline/workout/w1')

    expect(await screen.findByText('מתח + מקבילים', { selector: 'h1' })).toBeInTheDocument()
    expect(tips()).toEqual(['מתח: אחיזה רחבה'])
  })
})
