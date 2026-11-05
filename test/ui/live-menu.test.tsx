import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { saveWorkout } from '../../src/data/repo'
import { firstSectionNames, resetDb, savedWorkout } from '../helpers/db'
import { alertPresented } from '../helpers/ionic'
import { chooseFromMenu, openMenu } from '../helpers/live'
import { exercisePicker } from '../helpers/picker'
import { renderAt } from '../helpers/renderAt'
import { done, exercise, oct, open, workout } from '../helpers/workouts'

const squatSets = async () => (await savedWorkout('w1'))?.sections[0].items[0].exercises[0].sets

beforeEach(async () => {
  await resetDb()
})

describe('the exercise menu', () => {
  it('lists adding after, the highlighted set actions, the summary, editing the workout and cancel', async () => {
    await saveWorkout(
      workout({ id: 'w1', startedAt: oct(26), finishedAt: null, exercises: [exercise('סקוואט', [done(60, 10), open(60, 10)])] }),
    )
    renderAt('/tabs/timeline/workout/w1')

    expect(await openMenu()).toEqual([
      'הוספת תרגיל אחרי',
      'שכפול סט 2',
      'מחיקת סט 2',
      'הוספה לסיכום',
      'עריכת האימון',
      'ביטול',
    ])
  })

  it('duplicates and deletes the set that is tapped, not the first undone one', async () => {
    await saveWorkout(
      workout({
        id: 'w1',
        startedAt: oct(26),
        finishedAt: null,
        exercises: [exercise('סקוואט', [open(60, 10), open(65, 8), open(70, 6)])],
      }),
    )
    renderAt('/tabs/timeline/workout/w1')
    fireEvent.click(await screen.findByText('סט 3', { selector: '.set-select .set-title' }))

    await chooseFromMenu('שכפול סט 3')
    await waitFor(async () => expect(await squatSets()).toEqual([open(60, 10), open(65, 8), open(70, 6), open(70, 6)]))

    fireEvent.click(await screen.findByText('סט 2', { selector: '.set-select .set-title' }))
    await chooseFromMenu('מחיקת סט 2')
    await waitFor(async () => expect(await squatSets()).toEqual([open(60, 10), open(70, 6), open(70, 6)]))
  })

  it('offers no delete on an exercise with one set', async () => {
    await saveWorkout(workout({ id: 'w1', startedAt: oct(26), finishedAt: null, exercises: [exercise('מתח', [open(null, 8)])] }))
    renderAt('/tabs/timeline/workout/w1')

    expect(await openMenu()).toEqual(['הוספת תרגיל אחרי', 'שכפול סט 1', 'הוספה לסיכום', 'עריכת האימון', 'ביטול'])
  })

  it('asks before deleting a ticked set', async () => {
    await saveWorkout(
      workout({ id: 'w1', startedAt: oct(26), finishedAt: null, exercises: [exercise('סקוואט', [done(60, 10), open(60, 10)])] }),
    )
    renderAt('/tabs/timeline/workout/w1')
    fireEvent.click(await screen.findByText('סט 1', { selector: '.set-select .set-title' }))
    const asked = alertPresented()

    await chooseFromMenu('מחיקת סט 1')
    await asked

    expect(screen.getByText('להסיר את הסט?')).toBeInTheDocument()
    fireEvent.click(screen.getByText('מחיקה', { selector: '.alert-button-inner' }))
    await waitFor(async () => expect(await squatSets()).toEqual([open(60, 10)]))
  })

  it('names the exercise in a pair', async () => {
    const base = workout({ id: 'w1', startedAt: oct(26), finishedAt: null, exercises: [] })

    const pair = {
      id: 'p',
      exercises: [exercise('מתח', [done(null, 8), open(null, 8)]), exercise('לחיצת חזה', [done(40, 10), open(40, 10)])],
    }

    await saveWorkout({ ...base, sections: [{ name: 'סופר סט', items: [pair] }] })
    renderAt('/tabs/timeline/workout/w1')

    expect(await openMenu()).toEqual([
      'הוספת תרגיל אחרי',
      'שכפול סט 2 · מתח',
      'מחיקת סט 2 · מתח',
      'הוספה לסיכום',
      'עריכת האימון',
      'ביטול',
    ])
  })

  it('offers no set actions when every set is ticked', async () => {
    await saveWorkout(
      workout({
        id: 'w1',
        startedAt: oct(26),
        finishedAt: null,
        exercises: [exercise('סקוואט', [done(60, 10)]), exercise('חתירה', [open(30, 12)])],
      }),
    )
    renderAt('/tabs/timeline/workout/w1')
    fireEvent.click(await screen.findByText('הקודם', { selector: 'ion-button' }))

    expect(await screen.findByText('סקוואט', { selector: 'h1' })).toBeInTheDocument()
    expect(await openMenu()).toEqual(['הוספת תרגיל אחרי', 'הוספה לסיכום', 'עריכת האימון', 'ביטול'])
  })
})


describe('adding an exercise after the current one', () => {
  beforeEach(async () => {
    await saveWorkout(
      workout({
        id: 'w1',
        startedAt: oct(26),
        finishedAt: null,
        exercises: [exercise('סקוואט', [done(60, 10), open(60, 10)]), exercise('לחיצת חזה', [open(40, 10)])],
      }),
    )
    await saveWorkout(workout({ id: 'prev', startedAt: oct(22), exercises: [exercise('דדליפט', [done(80, 8), done(80, 6)])] }))
  })

  it('inserts a picked exercise right after the current one and keeps showing the current one', async () => {
    renderAt('/tabs/timeline/workout/w1')

    await chooseFromMenu('הוספת תרגיל אחרי')
    fireEvent.click(await (await exercisePicker()).findByText('דדליפט'))

    await waitFor(async () => expect(await firstSectionNames('w1')).toEqual(['סקוואט', 'דדליפט', 'לחיצת חזה']))
    expect((await savedWorkout('w1'))?.sections[0].items[1].exercises[0].sets).toEqual([open(80, 8), open(80, 6)])
    expect(screen.getByText('סקוואט', { selector: 'h1' })).toBeInTheDocument()
    expect(await screen.findByText('עיקרי · 1 מתוך 3')).toBeInTheDocument()
    expect(screen.queryByLabelText('שם התרגיל')).not.toBeInTheDocument()
  })

  it('inserts a new exercise and opens its sheet', async () => {
    renderAt('/tabs/timeline/workout/w1')

    await chooseFromMenu('הוספת תרגיל אחרי')
    fireEvent.click(await (await exercisePicker()).findByText('תרגיל חדש'))

    await waitFor(async () => expect(await firstSectionNames('w1')).toEqual(['סקוואט', 'תרגיל חדש', 'לחיצת חזה']))
    expect(await screen.findByLabelText('שם התרגיל')).toHaveValue('תרגיל חדש')
  })
})
