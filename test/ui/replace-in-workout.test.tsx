import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, expect, it } from 'vitest'
import { saveWorkout } from '../../src/data/repo'
import { firstSectionNames, resetDb, savedWorkout } from '../helpers/db'
import { heading, openOverviewEditing } from '../helpers/live'
import { exercisePicker } from '../helpers/picker'
import { renderAt } from '../helpers/renderAt'
import { userEvent } from '@testing-library/user-event'
import { done, exercise, oct, open, reps, workout } from '../helpers/workouts'

beforeEach(async () => {
  await resetDb()
  await saveWorkout(workout({ id: 'prev', startedAt: oct(22), exercises: [exercise('דדליפט', [done(80, 8), done(80, 6)], reps(8))] }))

  await saveWorkout(
    workout({
      id: 'w1',
      startedAt: oct(26),
      finishedAt: null,
      exercises: [exercise('סקוואט', [done(60, 10), open(60, 10)]), exercise('לחיצת חזה', [open(40, 10)])],
    }),
  )
})

it('keeps a ticked set on the replaced exercise and starts the new one after it, on the card and in its sheet', async () => {
  const user = await openOverviewEditing()

  await user.click(await screen.findByText('סקוואט', { selector: 'ion-modal ion-item ion-label' }))
  fireEvent.click(await screen.findByText('החלפת תרגיל'))
  fireEvent.click(await (await exercisePicker()).findByText('דדליפט'))

  await waitFor(async () => expect(await firstSectionNames('w1')).toEqual(['סקוואט', 'דדליפט', 'לחיצת חזה']))
  const items = (await savedWorkout('w1'))?.sections[0].items
  expect(items?.[0].exercises[0].sets).toEqual([done(60, 10)])
  expect(items?.[1].exercises[0].sets).toEqual([open(80, 8)])
  await waitFor(() => expect(screen.getByLabelText('שם התרגיל')).toHaveValue('דדליפט'))
  expect(await heading('דדליפט')).toBeInTheDocument()
})

it('starts the new exercise at its first set even when a ticked set was chosen on the card', async () => {
  await saveWorkout(
    workout({
      id: 'w1',
      startedAt: oct(26),
      finishedAt: null,
      exercises: [exercise('סקוואט', [done(60, 10), done(60, 10), open(60, 10), open(60, 10)]), exercise('לחיצת חזה', [open(40, 10)])],
    }),
  )
  const user = userEvent.setup()
  renderAt('/tabs/timeline/workout/w1')
  await user.click(await screen.findByText('סט 2'))
  await screen.findByLabelText('סקוואט סט 2 משקל')
  await user.click(screen.getByLabelText('כל התרגילים'))
  await user.click(await screen.findByText('עריכה', { selector: 'ion-modal ion-button' }))

  await user.click(await screen.findByText('סקוואט', { selector: 'ion-modal ion-item ion-label' }))
  fireEvent.click(await screen.findByText('החלפת תרגיל'))
  fireEvent.click(await (await exercisePicker()).findByText('דדליפט'))

  expect(await screen.findByLabelText('דדליפט סט 1 משקל')).toBeInTheDocument()
})
