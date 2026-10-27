import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { db } from '../../src/data/db'
import { saveWorkout } from '../../src/data/repo'
import { resetDb } from '../helpers/db'
import { actionSheetPresented, ionChange, ionInput } from '../helpers/ionic'
import { currentPath, renderAt } from '../helpers/renderAt'
import { done, exercise, oct, open, seconds, workout } from '../helpers/workouts'
import { userEvent } from '@testing-library/user-event'

const active = workout({
  id: 'w1',
  startedAt: oct(26),
  finishedAt: null,
  exercises: [exercise('סקוואט', [open(60, 10), open(60, 10)])],
})

const halfDone = workout({
  id: 'w1',
  startedAt: oct(26),
  finishedAt: null,
  exercises: [
    exercise('סקוואט', [done(60, 10), done(60, 10)]),
    { ...exercise('לחיצת חזה', [open(40, 10), open(40, 10)]), skipped: true },
    exercise('חתירה', [done(30, 12), open(30, 12)]),
  ],
})

beforeEach(async () => {
  await resetDb()
})

describe('live workout', () => {
  it('ticking a set persists', async () => {
    await saveWorkout(active)
    const user = userEvent.setup()
    const view = renderAt('/workout/w1')

    await user.click(await screen.findByRole('button', { name: 'סקוואט סט 1', pressed: false }))

    await waitFor(async () => expect((await db.workouts.get('w1'))?.sections[0].items[0].exercises[0].sets[0].done).toBe(true))
    view.unmount()
    renderAt('/workout/w1')

    expect(await screen.findByRole('button', { name: 'סקוואט סט 1', pressed: true })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'סקוואט סט 2', pressed: false })).toBeInTheDocument()
  })

  it('resumes at first unfinished item', async () => {
    await saveWorkout(halfDone)
    const user = userEvent.setup()
    renderAt('/workout/w1')

    expect(await screen.findByText('חתירה', { selector: 'h1' })).toBeInTheDocument()
    expect(screen.getByText('תרגיל 3 מתוך 3')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'חתירה סט 1', pressed: true })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'חתירה סט 2', pressed: false })).toBeInTheDocument()

    await user.click(screen.getByText('הקודם', { selector: 'ion-button' }))
    await user.click(screen.getByText('הקודם', { selector: 'ion-button' }))

    expect(await screen.findByText('סקוואט', { selector: 'h1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'סקוואט סט 1', pressed: true })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'סקוואט סט 2', pressed: true })).toBeInTheDocument()
  })

  it('editing weight and amount persists', async () => {
    await saveWorkout(
      workout({
        id: 'w1',
        startedAt: oct(26),
        finishedAt: null,
        exercises: [exercise('סקוואט', [open(60, 10)]), exercise('פלאנק', [open(null, 120)], seconds(120))],
      }),
    )
    const user = userEvent.setup()
    renderAt('/workout/w1')
    const firstSet = async () => (await db.workouts.get('w1'))?.sections[0].items.map((i) => i.exercises[0].sets[0])

    ionChange(await screen.findByLabelText('סקוואט סט 1 משקל'), '62.5')
    ionChange(screen.getByLabelText('סקוואט סט 1 חזרות'), '8')
    await waitFor(async () => expect((await firstSet())?.[0]).toEqual(open(62.5, 8)))

    ionChange(screen.getByLabelText('סקוואט סט 1 משקל'), '')
    await waitFor(async () => expect((await firstSet())?.[0]).toEqual(open(null, 8)))

    await user.click(screen.getByText('הבא', { selector: 'ion-button' }))
    expect(await screen.findByLabelText('פלאנק סט 1 דק׳')).toHaveValue('2')
    expect(screen.queryByLabelText('פלאנק סט 1 משקל')).not.toBeInTheDocument()

    ionChange(screen.getByLabelText('פלאנק סט 1 דק׳'), '3')
    await waitFor(async () => expect((await firstSet())?.[1]).toEqual(open(null, 180)))
  })

  it('item list shows progress and jumps to an item', async () => {
    await saveWorkout(halfDone)
    const user = userEvent.setup()
    renderAt('/workout/w1')

    await user.click(await screen.findByLabelText('כל התרגילים'))
    const rows = await screen.findAllByText(/סקוואט|לחיצת חזה|חתירה/, { selector: 'ion-modal ion-item ion-label' })

    expect(rows.map((row) => row.textContent)).toEqual(['סקוואט', 'לחיצת חזה', 'חתירה'])
    expect(screen.getByLabelText('הושלם')).toBeInTheDocument()
    expect(screen.getByText('דילגת', { selector: 'ion-modal ion-note' })).toBeInTheDocument()

    await user.click(rows[0])

    expect(await screen.findByText('סקוואט', { selector: 'h1' })).toBeInTheDocument()
  })

  it('item menu skips and adds and removes sets', async () => {
    await saveWorkout(active)
    const user = userEvent.setup()
    renderAt('/workout/w1')
    const squat = async () => (await db.workouts.get('w1'))?.sections[0].items[0].exercises[0]
    const choose = async (text: string) => {
      const presented = actionSheetPresented()

      await user.click(await screen.findByLabelText('פעולות לתרגיל'))
      await presented
      fireEvent.click(screen.getByText(text, { selector: '.action-sheet-button-label' }))
      await waitFor(() => expect(document.querySelector('ion-action-sheet')).toBeNull())
    }

    await choose('דלג על התרגיל')
    expect(await screen.findByText('דילגת על התרגיל')).toBeInTheDocument()
    await waitFor(async () => expect((await squat())?.skipped).toBe(true))

    await choose('בטל דילוג')
    await waitFor(async () => expect((await squat())?.skipped).toBe(false))

    await choose('הוסף סט')
    expect(await screen.findByRole('button', { name: 'סקוואט סט 3' })).toBeInTheDocument()

    await choose('הסר סט')
    await waitFor(() => expect(screen.queryByRole('button', { name: 'סקוואט סט 3' })).not.toBeInTheDocument())
    await waitFor(async () => expect((await squat())?.sets).toHaveLength(2))
  })

  it('finish saves summary and finishedAt and opens detail', async () => {
    const before = Date.now()
    await saveWorkout(active)
    const user = userEvent.setup()
    renderAt('/workout/w1')

    await user.click(await screen.findByText('סיום', { selector: 'ion-button' }))
    expect(await screen.findByText('סיכום האימון', { selector: 'ion-title' })).toBeInTheDocument()
    ionInput(screen.getByLabelText('סיכום האימון'), '  היה טוב\n')
    await user.click(screen.getByText('שמירה', { selector: 'ion-button' }))

    await waitFor(() => expect(currentPath()).toBe('/tabs/timeline/w1'))
    const saved = await db.workouts.get('w1')

    expect(saved?.summary).toBe('היה טוב')
    expect(saved?.finishedAt).toBeGreaterThanOrEqual(before)
  })

  it('finish with empty summary', async () => {
    const before = Date.now()
    await saveWorkout(active)
    const user = userEvent.setup()
    renderAt('/workout/w1')

    await user.click(await screen.findByText('סיום', { selector: 'ion-button' }))
    await user.click(await screen.findByText('שמירה', { selector: 'ion-button' }))

    await waitFor(() => expect(currentPath()).toBe('/tabs/timeline/w1'))
    const saved = await db.workouts.get('w1')

    expect(saved?.summary).toBe('')
    expect(saved?.finishedAt).toBeGreaterThanOrEqual(before)
  })

  it('deleting from the finish sheet removes the workout', async () => {
    await saveWorkout(active)
    const user = userEvent.setup()
    renderAt('/workout/w1')

    await user.click(await screen.findByText('סיום', { selector: 'ion-button' }))
    await user.click(await screen.findByText('מחיקת האימון'))
    fireEvent.click(await screen.findByText('מחיקה', { selector: '.alert-button-inner' }))

    await waitFor(() => expect(currentPath()).toBe('/tabs/timeline'))
    expect(await db.workouts.get('w1')).toBeUndefined()
  })

  it('edit mode keeps the workout finished and goes back', async () => {
    const finished = { ...active, finishedAt: oct(26, 11), summary: 'טוב' }
    await saveWorkout(finished)
    const user = userEvent.setup()
    renderAt('/workout/w1')

    expect(await screen.findByText('עריכת אימון', { selector: 'ion-title div' })).toBeInTheDocument()
    expect(screen.queryByText(/^\d+:\d\d$/)).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'סקוואט סט 1' }))
    await waitFor(async () => expect((await db.workouts.get('w1'))?.sections[0].items[0].exercises[0].sets[0].done).toBe(true))
    await user.click(screen.getByText('סיום', { selector: 'ion-button' }))

    expect(screen.queryByText('סיכום האימון', { selector: 'ion-title' })).not.toBeInTheDocument()
    expect(await db.workouts.get('w1')).toMatchObject({ finishedAt: oct(26, 11), summary: 'טוב' })
  })

  it('pair shows each set with A then B', async () => {
    const base = workout({ id: 'w1', startedAt: oct(26), finishedAt: null, exercises: [] })
    const pair = { id: 'p', exercises: [exercise('מתח', [open(null, 8), open(null, 8)]), exercise('מקבילים', [open(null, 10), open(null, 10)])] }
    await saveWorkout({ ...base, sections: [{ name: 'סופר סט', items: [pair] }] })
    const user = userEvent.setup()
    renderAt('/workout/w1')

    const checks = await screen.findAllByRole('button', { name: /סט \d$/ })

    expect(checks.map((c) => c.getAttribute('aria-label'))).toEqual(['מתח סט 1', 'מקבילים סט 1', 'מתח סט 2', 'מקבילים סט 2'])

    await user.click(screen.getByRole('button', { name: 'מקבילים סט 1' }))
    await waitFor(async () =>
      expect((await db.workouts.get('w1'))?.sections[0].items[0].exercises.map((e) => e.sets[0].done)).toEqual([false, true]),
    )
  })

  it('keeps the screen awake during an active workout', async () => {
    const release = vi.fn(() => Promise.resolve())
    const request = vi.fn(() => Promise.resolve({ release }))
    Object.defineProperty(navigator, 'wakeLock', { configurable: true, value: { request } })
    await saveWorkout(active)
    const view = renderAt('/workout/w1')

    await waitFor(() => expect(request).toHaveBeenCalledWith('screen'))
    view.unmount()
    await waitFor(() => expect(release).toHaveBeenCalled())
    Reflect.deleteProperty(navigator, 'wakeLock')
  })
})
