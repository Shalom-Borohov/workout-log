import { liveQuery } from 'dexie'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { activeWorkout, beginWorkout, finishedWorkouts, saveWorkout } from '../../src/data/repo'
import { resetDb } from '../helpers/db'
import { done, exercise, reps, routine, workout } from '../helpers/workouts'

describe('repo', () => {
  beforeEach(resetDb)

  it('lists finished workouts newest first', async () => {
    await saveWorkout(workout({ id: 'old', startedAt: 1_000, finishedAt: 2_000, exercises: [] }))
    await saveWorkout(workout({ id: 'active', startedAt: 5_000, finishedAt: null, exercises: [] }))
    await saveWorkout(workout({ id: 'new', startedAt: 3_000, finishedAt: 4_000, exercises: [] }))

    const ids = (await finishedWorkouts()).map((w) => w.id)

    expect(ids).toEqual(['new', 'old'])
  })

  it('finds the workout in progress', async () => {
    await saveWorkout(workout({ id: 'done', startedAt: 1_000, finishedAt: 2_000, exercises: [] }))
    await saveWorkout(workout({ id: 'active', startedAt: 3_000, finishedAt: null, exercises: [] }))

    expect((await activeWorkout())?.id).toBe('active')
  })

  it('begins a workout from a routine, prefilled from the last session', async () => {
    const fullBody = routine('r1', 'אימון גוף מלא', [[{ name: 'סקוואט', target: reps(15) }]], 2)

    const previous = workout({
      id: 'prev',
      startedAt: 1_000,
      finishedAt: 2_000,
      exercises: [exercise('סקוואט', [done(20, 15), done(20, 12)], reps(15))],
    })

    await saveWorkout(previous)

    const started = await beginWorkout(fullBody)

    expect(started.finishedAt).toBeNull()
    expect(started.sections[0].items[0].exercises[0].sets).toEqual([
      { weight: 20, amount: 15, done: false },
      { weight: 20, amount: 12, done: false },
    ])
    expect((await activeWorkout())?.id).toBe(started.id)
  })

  it('saving the active workout does not refresh the finished-workouts query', async () => {
    await saveWorkout(workout({ id: 'done', startedAt: 1_000, finishedAt: 2_000, exercises: [] }))
    await saveWorkout(workout({ id: 'active', startedAt: 3_000, finishedAt: null, exercises: [] }))

    const emissions: string[][] = []
    const subscription = liveQuery(finishedWorkouts).subscribe((ws) => emissions.push(ws.map((w) => w.id)))

    await vi.waitFor(() => expect(emissions).toHaveLength(1))
    await saveWorkout(workout({ id: 'active', startedAt: 3_000, finishedAt: null, exercises: [exercise('סקוואט', [done(20, 10)])] }))
    await new Promise((resolve) => setTimeout(resolve, 100))
    await saveWorkout(workout({ id: 'active', startedAt: 3_000, finishedAt: 4_000, exercises: [] }))
    await vi.waitFor(() => expect(emissions).toEqual([['done'], ['active', 'done']]))
    subscription.unsubscribe()
  })

  it('has no active workout when all are finished', async () => {
    await saveWorkout(workout({ id: 'done', startedAt: 1_000, finishedAt: 2_000, exercises: [] }))

    expect(await activeWorkout()).toBeUndefined()
  })
})
