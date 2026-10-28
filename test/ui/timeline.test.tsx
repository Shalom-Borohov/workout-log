import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { activeWorkout, finishedWorkouts, saveRoutine, saveWorkout } from '../../src/data/repo'
import { freezeDate } from '../helpers/clock'
import { resetDb } from '../helpers/db'
import { expectInOrder, ionChange, ionField } from '../helpers/ionic'
import { currentPath, renderAt } from '../helpers/renderAt'
import { done, exercise, oct, open, reps, routine, seconds, workout } from '../helpers/workouts'

const squatOnly = [[{ name: 'סקוואט', target: reps(10) }]]

async function startedWorkout() {
  const active = await activeWorkout()
  if (!active) {
    throw new Error('no active workout')
  }

  return active
}

describe('timeline', () => {
  beforeEach(resetDb)
  freezeDate(oct(26, 12))

  it('empty state', async () => {
    renderAt('/tabs/timeline')

    expect(await screen.findByText('עוד אין אימונים')).toBeInTheDocument()
    expect(screen.getByText('לוחצים על „התחל אימון” למטה. כל אימון שמסיימים יופיע כאן, עם השיפורים והשיאים.')).toBeInTheDocument()
    expect((await screen.findByText('התחל אימון')).closest('ion-footer')).not.toBeNull()
  })

  it('shows workouts grouped by week with changes', async () => {
    await saveWorkout(
      workout({ id: 'w0', startedAt: oct(5), exercises: [exercise('סקוואט', [done(25, 10)]), exercise('לחיצה', [done(28, 8)])] }),
    )
    await saveWorkout(workout({ id: 'w1', startedAt: oct(19), exercises: [exercise('סקוואט', [done(20, 10)])] }))
    await saveWorkout(
      workout({
        id: 'w2',
        startedAt: oct(26, 8),
        finishedAt: oct(26, 8, 45),
        exercises: [exercise('סקוואט', [done(22, 10), done(22, 10)]), exercise('לחיצה', [done(30, 8)])],
      }),
    )
    renderAt('/tabs/timeline')

    await expectInOrder(['השבוע', 'יום ב׳ 26.10', 'שבוע שעבר', 'יום ב׳ 19.10', '4.10–10.10', 'יום ב׳ 5.10'])
    expect(screen.getByText('45 דק׳ · 3 סטים')).toBeInTheDocument()
    expect(within(screen.getByText('סקוואט 22 ק״ג')).getByLabelText('שיפור')).toBeInTheDocument()
    expect(within(screen.getByText('לחיצה 30 ק״ג')).getByLabelText('שיא חדש')).toBeInTheDocument()
  })

  it('card shows at most three change badges', async () => {
    const names = ['סקוואט', 'לחיצה', 'חתירה', 'מתח']
    await saveWorkout(workout({ id: 'w0', startedAt: oct(19), exercises: names.map((name) => exercise(name, [done(20, 10)])) }))
    await saveWorkout(workout({ id: 'w1', startedAt: oct(26, 8), exercises: names.map((name) => exercise(name, [done(20, 12)])) }))
    renderAt('/tabs/timeline')

    expect(await screen.findAllByLabelText('שיפור')).toHaveLength(3)
    expect(screen.queryByText('מתח 20 ק״ג')).not.toBeInTheDocument()
  })

  it('week header shows workouts and sets count', async () => {
    await saveWorkout(workout({ id: 'w1', startedAt: oct(25), exercises: [exercise('סקוואט', [done(20, 10), done(20, 10)])] }))
    await saveWorkout(workout({ id: 'w2', startedAt: oct(26, 8), exercises: [exercise('סקוואט', [done(20, 10), open(20, 10)])] }))
    await saveWorkout(workout({ id: 'w3', startedAt: oct(19), exercises: [exercise('לחיצה', [done(30, 8)])] }))
    renderAt('/tabs/timeline')

    await expectInOrder(['השבוע', '2 אימונים · 3 סטים', 'שבוע שעבר', 'אימון אחד · סט אחד'])
  })

  it('card shows first line of summary', async () => {
    await saveWorkout({
      ...workout({ id: 'w1', startedAt: oct(26, 8), exercises: [exercise('סקוואט', [done(20, 10)])] }),
      summary: 'הרגשתי חזק\nהברך קצת כאבה',
    })
    renderAt('/tabs/timeline')

    expect(await screen.findByText('הרגשתי חזק')).toBeInTheDocument()
    expect(screen.queryByText(/הברך קצת כאבה/)).not.toBeInTheDocument()
  })

  it('start with one routine opens live workout', async () => {
    await saveRoutine(routine('r1', 'אימון גוף מלא', squatOnly))
    renderAt('/tabs/timeline')

    fireEvent.click(await screen.findByText('התחל אימון'))

    const started = await waitFor(startedWorkout)
    expect(started.routineId).toBe('r1')
    await waitFor(() => expect(currentPath()).toBe(`/tabs/workout/${started.id}`))
  })

  it('start skips routines without exercises', async () => {
    await saveRoutine(routine('r1', 'אימון גוף מלא', squatOnly))
    await saveRoutine({ ...routine('r2', 'אימון חדש', []), sections: [] })
    renderAt('/tabs/timeline')

    fireEvent.click(await screen.findByText('התחל אימון'))

    const started = await waitFor(startedWorkout)
    expect(started.routineId).toBe('r1')
  })

  it('start with no routines opens import', async () => {
    renderAt('/tabs/timeline')

    fireEvent.click(await screen.findByText('התחל אימון'))

    await waitFor(() => expect(currentPath()).toBe('/tabs/routines/import'))
  })

  it('start with several routines picks one from a sheet', async () => {
    await saveRoutine(routine('r1', 'אימון גוף מלא', squatOnly))
    await saveRoutine(routine('r2', 'אימון רגליים', squatOnly))
    renderAt('/tabs/timeline')

    fireEvent.click(await screen.findByText('התחל אימון'))
    fireEvent.click(await screen.findByText('אימון רגליים', { selector: '.action-sheet-button *' }))

    const started = await waitFor(startedWorkout)
    expect(started.routineId).toBe('r2')
    await waitFor(() => expect(currentPath()).toBe(`/tabs/workout/${started.id}`))
  })

  it('active workout shows resume banner', async () => {
    await saveWorkout(
      workout({ id: 'live', startedAt: oct(26, 11, 30), finishedAt: null, exercises: [exercise('סקוואט', [done(20, 10)])] }),
    )
    renderAt('/tabs/timeline')

    fireEvent.click(await screen.findByText('אימון בתהליך'))

    expect(screen.getByText('אימון בתהליך').closest('ion-footer')).not.toBeNull()
    expect(screen.getByText('30:00')).toBeInTheDocument()
    expect(screen.queryByText('התחל אימון')).not.toBeInTheDocument()
    await waitFor(() => expect(currentPath()).toBe('/tabs/workout/live'))
  })

  it('detail lists sets per exercise', async () => {
    await saveWorkout(
      workout({
        id: 'w1',
        startedAt: oct(26, 8),
        exercises: [
          exercise('סקוואט', [done(20, 10), done(22, 10), open(22, 10)]),
          { ...exercise('מתח', [open(null, 8)]), skipped: true },
          exercise('פלאנק', [done(null, 60)], seconds(60)),
        ],
      }),
    )
    renderAt('/tabs/timeline/w1')

    expect(await screen.findByText('20 ק״ג × 10 · 22 ק״ג × 10')).toBeInTheDocument()
    expect(screen.getByText('דילגת')).toBeInTheDocument()
    expect(screen.getByText('1 דק׳')).toBeInTheDocument()
    expect(screen.getByText('עיקרי')).toBeInTheDocument()
  })

  it('detail shows a repeated weight once', async () => {
    await saveWorkout(
      workout({
        id: 'w1',
        startedAt: oct(26, 8),
        exercises: [exercise('סקוואט', [done(27.5, 15), done(27.5, 15), done(27.5, 13)]), exercise('מתח', [done(null, 8), done(null, 6)])],
      }),
    )
    renderAt('/tabs/timeline/w1')

    expect(await screen.findByText('27.5 ק״ג × 15, 15, 13')).toBeInTheDocument()
    expect(screen.getByText('8, 6 חזרות')).toBeInTheDocument()
  })

  it('detail edits summary', async () => {
    await saveWorkout({
      ...workout({ id: 'w1', startedAt: oct(26, 8), exercises: [exercise('סקוואט', [done(20, 10)])] }),
      summary: 'ישן',
    })
    renderAt('/tabs/timeline/w1')

    const field = await ionField('סיכום')
    await waitFor(() => expect(field).toHaveProperty('value', 'ישן'))
    ionChange(field, 'הרגשתי טוב\nעוד שורה')

    await waitFor(async () => expect((await finishedWorkouts())[0].summary).toBe('הרגשתי טוב\nעוד שורה'))
  })

  it('detail deletes workout', async () => {
    await saveWorkout(workout({ id: 'w1', startedAt: oct(26, 8), exercises: [exercise('סקוואט', [done(20, 10)])] }))
    renderAt('/tabs/timeline/w1')

    fireEvent.click(await screen.findByText('מחיקת האימון'))
    fireEvent.click(await screen.findByText('מחיקה', { selector: '.alert-button *' }))

    await waitFor(async () => expect(await finishedWorkouts()).toHaveLength(0))
    await waitFor(() => expect(currentPath()).toBe('/tabs/timeline'))
  })

  it('detail edit opens the workout for editing', async () => {
    await saveWorkout(workout({ id: 'w1', startedAt: oct(26, 8), exercises: [exercise('סקוואט', [done(20, 10)])] }))
    renderAt('/tabs/timeline/w1')

    fireEvent.click(await screen.findByText('עריכה'))

    await waitFor(() => expect(currentPath()).toBe('/tabs/workout/w1'))
  })
})
