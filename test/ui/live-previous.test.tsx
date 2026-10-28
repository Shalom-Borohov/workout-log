import { screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { saveWorkout } from '../../src/data/repo'
import { resetDb } from '../helpers/db'
import { renderAt } from '../helpers/renderAt'
import { done, exercise, oct, open, workout } from '../helpers/workouts'
import { visibleAll } from '../helpers/ionic'

const previousLines = () =>
  visibleAll('.item-previous').map((line) => line.textContent)

beforeEach(async () => {
  await resetDb()
})

describe('live previous session', () => {
  it('shows the completed sets of the last session of the exercise', async () => {
    await saveWorkout(workout({ id: 'old', startedAt: oct(19), exercises: [exercise('סקוואט', [done(55, 10)])] }))
    await saveWorkout(
      workout({ id: 'prev', startedAt: oct(22), exercises: [exercise('סקוואט', [done(57.5, 10), done(57.5, 8), open(57.5, 8)])] }),
    )
    await saveWorkout(workout({ id: 'w1', startedAt: oct(26), finishedAt: null, exercises: [exercise('סקוואט', [open(60, 10)])] }))
    renderAt('/tabs/workout/w1')

    await waitFor(() => expect(previousLines()).toEqual(['פעם קודמת: 57.5 ק״ג × 10, 8']))
  })

  it('shows the note left for next time in the previous session', async () => {
    await saveWorkout(
      workout({ id: 'prev', startedAt: oct(22), exercises: [{ ...exercise('סקוואט', [done(57.5, 10)]), note: 'לעלות במשקל' }] }),
    )
    await saveWorkout(
      workout({
        id: 'w1',
        startedAt: oct(26),
        finishedAt: null,
        exercises: [exercise('סקוואט', [open(60, 10)]), exercise('חתירה', [open(30, 12)])],
      }),
    )
    renderAt('/tabs/workout/w1')

    await waitFor(() => expect(visibleAll('.item-note').map((line) => line.textContent)).toEqual(['הערה: לעלות במשקל']))
  })

  it('shows no note line when the previous note is empty', async () => {
    await saveWorkout(workout({ id: 'prev', startedAt: oct(22), exercises: [exercise('סקוואט', [done(57.5, 10)])] }))
    await saveWorkout(workout({ id: 'w1', startedAt: oct(26), finishedAt: null, exercises: [exercise('סקוואט', [open(60, 10)])] }))
    renderAt('/tabs/workout/w1')

    await waitFor(() => expect(previousLines()).toHaveLength(1))
    expect(visibleAll('.item-note')).toEqual([])
  })

  it('is hidden the first time an exercise is done', async () => {
    await saveWorkout(workout({ id: 'w1', startedAt: oct(26), finishedAt: null, exercises: [exercise('סקוואט', [open(60, 10)])] }))
    renderAt('/tabs/workout/w1')

    expect(await screen.findByText('סקוואט', { selector: 'h1' })).toBeInTheDocument()
    expect(previousLines()).toEqual([])
  })

  it('shows one line per exercise of a pair', async () => {
    await saveWorkout(
      workout({ id: 'prev', startedAt: oct(22), exercises: [exercise('מתח', [done(null, 8), done(null, 7)]), exercise('מקבילים', [done(10, 10)])] }),
    )
    const base = workout({ id: 'w1', startedAt: oct(26), finishedAt: null, exercises: [] })
    const pair = { id: 'p', exercises: [exercise('מתח', [open(null, 8)]), exercise('מקבילים', [open(10, 10)])] }
    await saveWorkout({ ...base, sections: [{ name: 'סופר סט', items: [pair] }] })
    renderAt('/tabs/workout/w1')

    await waitFor(() => expect(previousLines()).toEqual(['פעם קודמת · מתח: 8, 7 חזרות', 'פעם קודמת · מקבילים: 10 ק״ג × 10']))
  })
})
