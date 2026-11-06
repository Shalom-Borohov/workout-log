import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../src/data/db'
import { finishedWorkouts, saveRoutine, saveWorkout } from '../../src/data/repo'
import { startWorkout } from '../../src/domain/progress'
import { resetDb, savedWorkout } from '../helpers/db'
import { ionChange, ionField } from '../helpers/ionic'
import { renderAt } from '../helpers/renderAt'
import { done, exercise, oct, reps, routine, workout } from '../helpers/workouts'

const legs = routine('r1', 'אימון רגליים', [[{ name: 'סקוואט', target: reps(12) }]])

const savedRoutine = () => db.routines.get('r1')

const savedExerciseName = async () => (await savedRoutine())?.sections[0].items[0].exercises[0].name

async function routineStored() {
  const stored = await savedRoutine()

  if (!stored) {
    throw new Error('routine not stored')
  }

  return stored
}

async function openSquatField() {
  renderAt('/tabs/routines/r1')
  fireEvent.click(await screen.findByText('סקוואט', { selector: 'h2' }))

  return ionField('שם התרגיל')
}

const shownName = () => screen.getByLabelText('שם התרגיל')

describe('an exercise name', () => {
  beforeEach(resetDb)

  it('drops spaces around a new name', async () => {
    await saveRoutine(legs)
    const field = await openSquatField()

    ionChange(field, '  לחיצת רגליים ')

    await waitFor(async () => expect(await savedExerciseName()).toBe('לחיצת רגליים'))
  })

  it('stays the same exercise when only a trailing space was added', async () => {
    await saveRoutine(legs)
    const before = (await savedRoutine())?.updatedAt
    const field = await openSquatField()

    ionChange(field, 'סקוואט ')
    await waitFor(() => expect(shownName()).toHaveValue('סקוואט'))

    expect(await savedExerciseName()).toBe('סקוואט')
    expect((await savedRoutine())?.updatedAt).toBe(before)
  })

  it('keeps the previous name when cleared', async () => {
    await saveRoutine(legs)
    const field = await openSquatField()

    ionChange(field, '   ')
    await waitFor(() => expect(shownName()).toHaveValue('סקוואט'))

    expect(await savedExerciseName()).toBe('סקוואט')
  })

  it('keeps its history and prefill when a workout starts after the trailing space', async () => {
    await saveRoutine(legs)
    await saveWorkout(workout({ id: 'w0', startedAt: oct(20), exercises: [exercise('סקוואט', [done(51, 12)])] }))
    const field = await openSquatField()

    ionChange(field, 'סקוואט ')
    await waitFor(() => expect(shownName()).toHaveValue('סקוואט'))

    const started = startWorkout(
      await routineStored(),
      await finishedWorkouts(),
      oct(26),
      () => 'id',
    )

    expect(started.sections[0].items[0].exercises[0].sets[0].weight).toBe(51)
  })
})

describe('an exercise name in a workout', () => {
  beforeEach(resetDb)

  it('is trimmed the same way when editing the workout', async () => {
    await saveWorkout(
      workout({ id: 'w1', startedAt: oct(26), finishedAt: null, exercises: [exercise('סקוואט', [done(60, 10)]), exercise('חתירה', [done(30, 10)])] }),
    )
    renderAt('/tabs/timeline/workout/w1')
    fireEvent.click(await screen.findByLabelText('כל התרגילים'))
    fireEvent.click(await screen.findByText('עריכה', { selector: 'ion-modal ion-button' }))
    fireEvent.click(await screen.findByText('סקוואט', { selector: 'ion-modal ion-item ion-label' }))

    ionChange(await ionField('שם התרגיל'), ' לחיצה ')

    await waitFor(async () => expect((await savedWorkout('w1'))?.sections[0].items[0].exercises[0].name).toBe('לחיצה'))
  })
})

describe('a routine name', () => {
  beforeEach(resetDb)

  it('drops spaces around a new name', async () => {
    await saveRoutine(legs)
    renderAt('/tabs/routines/r1')

    ionChange(await ionField('שם האימון'), ' רגליים ב׳  ')

    await waitFor(async () => expect((await savedRoutine())?.name).toBe('רגליים ב׳'))
  })

  it('keeps the previous name when cleared', async () => {
    await saveRoutine(legs)
    const before = (await savedRoutine())?.updatedAt
    renderAt('/tabs/routines/r1')
    const field = await ionField('שם האימון')

    ionChange(field, '  ')
    await waitFor(() => expect(screen.getByLabelText('שם האימון')).toHaveValue('אימון רגליים'))

    expect((await savedRoutine())?.name).toBe('אימון רגליים')
    expect((await savedRoutine())?.updatedAt).toBe(before)
  })
})
