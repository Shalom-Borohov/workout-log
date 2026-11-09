import { fireEvent, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { db } from '../../src/data/db'
import { saveWorkout } from '../../src/data/repo'
import { readLastError } from '../../src/data/lastError'
import { resetDb } from '../helpers/db'
import { chooseFile } from '../helpers/files'
import { finishedWithoutSections, openOnBadRecord } from '../helpers/recovery'
import { spyOnReload } from '../helpers/reload'
import { LOST_CONNECTION, SAVE_FAILED } from '../helpers/saveFailure'
import { done, exercise, oct, workout } from '../helpers/workouts'

const sound = workout({ id: 'good', startedAt: oct(26), exercises: [exercise('סקוואט', [done(60, 10)])] })

const fromFile = [
  workout({ id: 'file-1', startedAt: oct(18), exercises: [exercise('לחיצת חזה', [done(40, 8)])] }),
  workout({ id: 'file-2', startedAt: oct(20), exercises: [exercise('לחיצת חזה', [done(42, 8)])] }),
]

const backupText = JSON.stringify({ version: 1, exportedAt: oct(21), routines: [], workouts: fromFile })

async function openRecoveryScreen() {
  await saveWorkout(sound)

  return openOnBadRecord()
}

describe('importing a backup from the recovery screen', () => {
  beforeEach(async () => {
    await resetDb()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
    window.location.hash = ''
  })

  it('shows what the file and the phone hold before replacing anything', async () => {
    await openRecoveryScreen()
    chooseFile(screen.getByLabelText('קובץ גיבוי'), backupText)

    expect(await screen.findByText('בקובץ: 2 אימונים, האחרון 20.10.2026')).toBeVisible()
    expect(screen.getByText('במכשיר: 2 אימונים, האחרון 26.10.2026')).toBeVisible()
    expect(screen.getByText('הייבוא יחליף את כל הנתונים במכשיר.')).toBeVisible()
  })

  it('moves focus to cancel when the comparison appears, as a destructive confirmation should', async () => {
    await openRecoveryScreen()
    chooseFile(screen.getByLabelText('קובץ גיבוי'), backupText)

    await waitFor(() => expect(screen.getByRole('button', { name: 'ביטול' })).toHaveFocus())
  })

  it('gives focus back to the import button after cancelling', async () => {
    await openRecoveryScreen()
    chooseFile(screen.getByLabelText('קובץ גיבוי'), backupText)
    fireEvent.click(await screen.findByRole('button', { name: 'ביטול' }))

    await waitFor(() => expect(screen.getByRole('button', { name: 'ייבוא גיבוי' })).toHaveFocus())
  })

  it('replaces the stored data with the file and reloads at the start', async () => {
    await openRecoveryScreen()
    const reload = spyOnReload()
    chooseFile(screen.getByLabelText('קובץ גיבוי'), backupText)
    fireEvent.click(await screen.findByRole('button', { name: 'ייבוא' }))

    await waitFor(() => expect(reload).toHaveBeenCalledOnce())
    expect(window.location.hash).toBe('')
    expect(await db.workouts.toArray()).toEqual(fromFile)
  })

  it('imports once on a double tap, so the undo copy keeps the phone data', async () => {
    await openRecoveryScreen()
    const reload = spyOnReload()
    chooseFile(screen.getByLabelText('קובץ גיבוי'), backupText)

    const importButton = await screen.findByRole('button', { name: 'ייבוא' })

    fireEvent.click(importButton)
    fireEvent.click(importButton)

    await waitFor(() => expect(reload).toHaveBeenCalled())
    expect(await db.settings.get('restoreCopy')).toMatchObject({ workouts: expect.arrayContaining([sound]) })
    expect(reload).toHaveBeenCalledOnce()
  })

  it('leaves the stored data alone on cancel and offers the import again', async () => {
    await openRecoveryScreen()
    chooseFile(screen.getByLabelText('קובץ גיבוי'), backupText)
    fireEvent.click(await screen.findByRole('button', { name: 'ביטול' }))

    expect(screen.getByRole('button', { name: 'ייבוא גיבוי' })).toBeVisible()
    expect(screen.queryByText('הייבוא יחליף את כל הנתונים במכשיר.')).not.toBeInTheDocument()
    expect(await db.workouts.get('good')).toEqual(sound)
    expect(await db.workouts.get('file-1')).toBeUndefined()
  })

  it('says a bad file is not a valid backup and changes nothing', async () => {
    await openRecoveryScreen()
    chooseFile(screen.getByLabelText('קובץ גיבוי'), 'not json')

    expect(await screen.findByText('קובץ הגיבוי לא תקין')).toBeVisible()
    expect(screen.queryByRole('button', { name: 'ייבוא' })).not.toBeInTheDocument()
    expect(await db.workouts.get('good')).toEqual(sound)
    expect(await db.workouts.get('bad')).toEqual(finishedWithoutSections)
  })

  it('says the import was not saved when the restore fails', async () => {
    await openRecoveryScreen()
    const reload = spyOnReload()
    vi.spyOn(db.routines, 'clear').mockRejectedValue(LOST_CONNECTION)
    chooseFile(screen.getByLabelText('קובץ גיבוי'), backupText)
    fireEvent.click(await screen.findByRole('button', { name: 'ייבוא' }))

    expect(await screen.findByText(SAVE_FAILED)).toBeVisible()
    expect(reload).not.toHaveBeenCalled()
    expect(readLastError()).toMatch(/^UnknownError/)

    fireEvent.click(screen.getByRole('button', { name: 'ביטול' }))

    expect(screen.queryByText(SAVE_FAILED)).not.toBeInTheDocument()
  })
})
