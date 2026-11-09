import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { parseBackup } from '../../src/data/backup'
import { db } from '../../src/data/db'
import { saveWorkout } from '../../src/data/repo'
import { restoreBackup } from '../../src/data/restore'
import { DAY_MS } from '../../src/domain/time'
import { freezeDate } from '../helpers/clock'
import { resetDb } from '../helpers/db'
import { chooseFile } from '../helpers/files'
import { toasts } from '../helpers/ionic'
import { renderAt } from '../helpers/renderAt'
import { done, exercise, oct, workout } from '../helpers/workouts'

const squats = [exercise('סקוואט', [done(40, 12)])]

const onPhone = workout({ id: 'phone', startedAt: oct(24), exercises: squats })

const inFile = workout({ id: 'file', startedAt: oct(22), exercises: squats })

const backupText = JSON.stringify({
  version: 2,
  exportedAt: oct(23),
  routines: [],
  workouts: [inFile],
  dailyLogs: [],
  exerciseAreas: [],
})

async function importBackup() {
  renderAt('/tabs/routines/settings')
  chooseFile(await screen.findByLabelText('קובץ גיבוי'), backupText)
  await screen.findByText(/^בקובץ:/)
  fireEvent.click(screen.getByText('ייבוא', { selector: '.alert-button *' }))
}

describe('undoing a restore', () => {
  beforeEach(resetDb)
  freezeDate(oct(26, 9, 30))

  it('offers to undo the restore for a week', async () => {
    await saveWorkout(onPhone)
    await importBackup()

    const row = await screen.findByText('ביטול השחזור')

    expect(row.closest('ion-item')).toHaveTextContent('אפשר עד 2.11')
  })

  it('brings back the phone data, then the file data again', async () => {
    await saveWorkout(onPhone)
    await importBackup()

    fireEvent.click(await screen.findByText('ביטול השחזור'))

    await waitFor(() => expect(toasts()).toContain('השחזור בוטל'))
    expect(await db.workouts.toArray()).toEqual([onPhone])

    const redo = await screen.findByText('שחזור הגיבוי שוב')

    expect(redo.closest('ion-item')).toHaveTextContent('אפשר עד 2.11')

    fireEvent.click(redo)

    await waitFor(() => expect(toasts()).toContain('הגיבוי שוחזר שוב'))
    expect(await db.workouts.toArray()).toEqual([inFile])
    expect(await screen.findByText('ביטול השחזור')).toBeInTheDocument()
  })

  it('a double tap swaps once', async () => {
    await saveWorkout(onPhone)
    await importBackup()

    const row = await screen.findByText('ביטול השחזור')

    fireEvent.click(row)
    fireEvent.click(row)

    expect(await screen.findByText('שחזור הגיבוי שוב')).toBeInTheDocument()
    await waitFor(() => expect(toasts()).toContain('השחזור בוטל'))
    expect(toasts()).not.toContain('הגיבוי שוחזר שוב')
    expect(await db.workouts.toArray()).toEqual([onPhone])
  })

  it('the row goes when the week ends while Settings is open', async () => {
    await saveWorkout(onPhone)
    await importBackup()
    await screen.findByText('ביטול השחזור')

    vi.setSystemTime(oct(26, 9, 30) + 8 * DAY_MS)
    document.dispatchEvent(new Event('visibilitychange'))

    await waitFor(() => expect(screen.queryByText('ביטול השחזור')).not.toBeInTheDocument())
  })

  it('offers nothing when there was no restore', async () => {
    renderAt('/tabs/routines/settings')

    expect(await screen.findByText('ייבוא גיבוי')).toBeInTheDocument()
    expect(screen.queryByText('ביטול השחזור')).not.toBeInTheDocument()
  })

  it('offers nothing once the week has passed', async () => {
    await saveWorkout(onPhone)
    await restoreBackup(parseBackup(JSON.parse(backupText)), oct(18, 9))
    renderAt('/tabs/routines/settings')

    expect(await screen.findByText('גיבוי אחרון: 23.10.2026 10:00')).toBeInTheDocument()
    expect(screen.queryByText('ביטול השחזור')).not.toBeInTheDocument()
    expect(screen.queryByText('שחזור הגיבוי שוב')).not.toBeInTheDocument()
  })
})
