import { liveQuery } from 'dexie'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  activeWorkout,
  addPastWorkout,
  beginWorkout,
  finishedRecords,
  finishedWorkouts,
  dailyLogs,
  logDailyDay,
  saveRecord,
  saveRoutine,
  saveWorkout,
  addDailyRoutine,
  setRoutineDaily,
  toggleDailyLog,
  updateDailyLog,
} from '../../src/data/repo'
import { db } from '../../src/data/db'
import { resetDb } from '../helpers/db'
import { activity, dailyLog, dailyRoutine, done, exercise, reps, routine, workout } from '../helpers/workouts'

describe('repo', () => {
  beforeEach(resetDb)

  it('lists finished workouts newest first', async () => {
    await saveWorkout(workout({ id: 'old', startedAt: 1_000, finishedAt: 2_000, exercises: [] }))
    await saveWorkout(workout({ id: 'active', startedAt: 5_000, finishedAt: null, exercises: [] }))
    await saveWorkout(workout({ id: 'new', startedAt: 3_000, finishedAt: 4_000, exercises: [] }))

    const ids = (await finishedWorkouts()).map((entry) => entry.id)

    expect(ids).toEqual(['new', 'old'])
  })

  it('lists activities with finished records but keeps them out of routine workouts', async () => {
    await saveWorkout(workout({ id: 'gym', startedAt: 1_000, finishedAt: 2_000, exercises: [] }))
    await saveWorkout(workout({ id: 'active', startedAt: 5_000, finishedAt: null, exercises: [] }))
    await saveRecord(activity({ id: 'boxing', startedAt: 3_000, finishedAt: 4_000 }))

    expect((await finishedRecords()).map((entry) => entry.id)).toEqual(['boxing', 'gym'])
    expect((await finishedWorkouts()).map((entry) => entry.id)).toEqual(['gym'])
    expect((await activeWorkout())?.id).toBe('active')
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
    const subscription = liveQuery(finishedWorkouts).subscribe((workouts) => emissions.push(workouts.map((entry) => entry.id)))

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

  it('adds a finished past workout prefilled from sessions before its date', async () => {
    const fullBody = routine('r1', 'אימון גוף מלא', [[{ name: 'סקוואט', target: reps(10) }]], 1)

    await saveWorkout(workout({ id: 'before', startedAt: 1_000, exercises: [exercise('סקוואט', [done(20, 10)])] }))
    await saveWorkout(workout({ id: 'after', startedAt: 9_000_000, exercises: [exercise('סקוואט', [done(30, 10)])] }))

    const added = await addPastWorkout(fullBody, 5_000_000, 3_600_000)

    expect(added).toMatchObject({ routineId: 'r1', startedAt: 5_000_000, finishedAt: 8_600_000 })
    expect(added.sections[0].items[0].exercises[0].sets).toEqual([{ weight: 20, amount: 10, done: false }])
    expect((await finishedWorkouts()).map((entry) => entry.id)).toEqual(['after', added.id, 'before'])
  })

  it('toggling a daily log adds it, and toggling it again removes it, even when the taps overlap', async () => {
    const log = dailyLog('d1', '2026-10-25')

    await toggleDailyLog(log)
    expect(await dailyLogs()).toEqual([log])

    await Promise.all([toggleDailyLog(log), toggleDailyLog(log)])
    expect(await dailyLogs()).toEqual([log])
  })

  it('logging a day adds it once, and never replaces or removes a log already there', async () => {
    const log = dailyLog('d1', '2026-10-25', [{ name: 'גשר ישבן', sets: 3, target: reps(15) }])
    const edited = { ...log, exercises: [{ name: 'גשר ישבן', sets: 2, target: reps(15) }] }

    await Promise.all([logDailyDay(log), logDailyDay(log)])
    expect(await dailyLogs()).toEqual([log])

    await updateDailyLog(edited)
    await logDailyDay(log)
    expect(await dailyLogs()).toEqual([edited])
  })

  it('a new daily routine and one switched to daily take the least used colour', async () => {
    await saveRoutine(dailyRoutine('d1', 'יציבה'))
    await saveRoutine(routine('r1', 'גוף מלא', []))

    await addDailyRoutine(routine('d2', 'מוביליות', []))
    await setRoutineDaily('r1', true)

    expect(await db.routines.get('d2')).toMatchObject({ daily: true, color: 'orange' })
    expect(await db.routines.get('r1')).toMatchObject({ daily: true, color: 'yellow' })
  })

  it('updating a daily log changes its drills, but never brings back a log already removed', async () => {
    const log = dailyLog('d1', '2026-10-25', [{ name: 'גשר ישבן', sets: 3, target: reps(15) }])
    const edited = { ...log, exercises: [{ name: 'גשר ישבן', sets: 2, target: reps(15) }] }

    await toggleDailyLog(log)
    await updateDailyLog(edited)
    expect(await dailyLogs()).toEqual([edited])

    await toggleDailyLog(log)
    await updateDailyLog(edited)
    expect(await dailyLogs()).toEqual([])
  })
})
