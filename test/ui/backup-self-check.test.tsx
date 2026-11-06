import { fireEvent, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { backupStatus } from '../../src/data/backupStatus'
import { db } from '../../src/data/db'
import { saveRoutine, saveWorkout } from '../../src/data/repo'
import { resetDb } from '../helpers/db'
import { alertPresented, toasts } from '../helpers/ionic'
import { renderAt } from '../helpers/renderAt'
import { mockShare } from '../helpers/share'
import { done, exercise, oct, reps, routine, workout } from '../helpers/workouts'

const nonsenseWeight = JSON.parse(
  '{"kind":"routine","id":"bad","routineId":"r1","routineName":"x","startedAt":1000,"finishedAt":null,"summary":"","sections":[{"name":"א","items":[{"id":"i","exercises":[{"name":"ב","target":{"kind":"reps","reps":1},"skipped":false,"sets":[{"weight":"heavy","amount":1,"done":false}]}]}]}]}',
)

const brokenRoutine = JSON.parse('{"id":"bad-routine","name":"x","updatedAt":"later","sections":[]}')

const ONE_BAD = 'בגיבוי יש רשומה פגומה אחת, וייבוא הקובץ ייכשל'

async function openExport() {
  renderAt('/tabs/routines/settings')

  return screen.findByText('ייצוא גיבוי')
}

const alertMessage = () => document.querySelector('ion-alert .alert-message')?.textContent

describe('exporting a backup', () => {
  beforeEach(resetDb)

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('still produces the file and says it holds a bad record', async () => {
    await saveWorkout(workout({ id: 'good', startedAt: oct(26), exercises: [exercise('סקוואט', [done(60, 10)])] }))
    await db.workouts.bulkPut([nonsenseWeight])
    const share = mockShare()
    const button = await openExport()
    const shown = alertPresented()

    fireEvent.click(button)
    await shown

    expect(share).toHaveBeenCalledOnce()
    expect(alertMessage()).toBe(ONE_BAD)
  })

  it('counts bad records across tables', async () => {
    await db.workouts.bulkPut([nonsenseWeight])
    await db.routines.bulkPut([brokenRoutine])
    mockShare()
    const button = await openExport()
    const shown = alertPresented()

    fireEvent.click(button)
    await shown

    expect(alertMessage()).toBe('בגיבוי יש 2 רשומות פגומות, וייבוא הקובץ ייכשל')
  })

  it('says so even when the share is cancelled, which is not a backup', async () => {
    await db.workouts.bulkPut([nonsenseWeight])
    mockShare().mockRejectedValue(new DOMException('cancelled', 'AbortError'))
    const button = await openExport()
    const shown = alertPresented()

    fireEvent.click(button)
    await shown

    expect(alertMessage()).toBe(ONE_BAD)
    expect(toasts()).toEqual([])
    expect((await backupStatus()).backedUpAt).toBeNull()
  })

  it('counts a completed share with a bad record as a backup, as item 48 says', async () => {
    await db.workouts.bulkPut([nonsenseWeight])
    mockShare()
    const button = await openExport()
    const shown = alertPresented()

    fireEvent.click(button)
    await shown

    expect((await backupStatus()).backedUpAt).not.toBeNull()
  })

  it('says nothing about a file with only sound records', async () => {
    await saveRoutine(routine('r1', 'רגליים', [[{ name: 'סקוואט', target: reps(12) }]]))
    await saveWorkout(workout({ id: 'good', startedAt: oct(26), exercises: [exercise('סקוואט', [done(60, 10)])] }))
    const share = mockShare()

    fireEvent.click(await openExport())
    await waitFor(() => expect(share).toHaveBeenCalledOnce())
    await waitFor(async () => expect((await backupStatus()).backedUpAt).not.toBeNull())

    expect(document.querySelector('ion-alert')).toBeNull()
  })
})
