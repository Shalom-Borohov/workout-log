import { fireEvent, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { db } from '../../src/data/db'
import { saveRoutine, saveWorkout } from '../../src/data/repo'
import { freezeDate } from '../helpers/clock'
import { resetDb } from '../helpers/db'
import { renderAt } from '../helpers/renderAt'
import { done, exercise, oct, reps, routine, workout } from '../helpers/workouts'

const legs = routine('r1', 'אימון רגליים', [[{ name: 'סקוואט', target: reps(12) }]])

const past = workout({ id: 'w1', startedAt: oct(20), exercises: [exercise('סקוואט', [done(40, 12)])] })

async function readJson(file: Blob | undefined) {
  if (!file) {
    throw new Error('no file')
  }

  return JSON.parse(await file.text())
}

const { summary: _summary, ...noSummary } = past

const toasts = () => Array.from(document.querySelectorAll('ion-toast'), (toast) => toast.message)

function chooseFile(input: HTMLElement, text: string) {
  fireEvent.change(input, { target: { files: [new File([text], 'backup.json', { type: 'application/json' })] } })
}

describe('settings', () => {
  beforeEach(resetDb)
  freezeDate(oct(26, 9, 30))

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('exports a backup through the share sheet', async () => {
    await saveRoutine(legs)
    await saveWorkout(past)

    const share = vi.fn<(data: ShareData) => Promise<void>>().mockResolvedValue()

    Object.assign(navigator, { share, canShare: () => true })
    renderAt('/tabs/routines/settings')

    fireEvent.click(await screen.findByText('ייצוא גיבוי'))

    await waitFor(() => expect(share).toHaveBeenCalledOnce())

    const files = share.mock.calls[0][0].files

    expect(files?.map((f) => f.name)).toEqual(['workouts-backup-2026-10-26.json'])
    expect(await readJson(files?.[0])).toEqual({
      version: 1,
      exportedAt: new Date(2026, 9, 26, 9, 30).getTime(),
      routines: [legs],
      workouts: [past],
    })
  })

  it('downloads the backup when sharing files is unsupported', async () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    Object.assign(navigator, { canShare: () => false })
    Object.assign(URL, { createObjectURL: () => 'blob:backup', revokeObjectURL: () => {} })
    renderAt('/tabs/routines/settings')

    fireEvent.click(await screen.findByText('ייצוא גיבוי'))

    await waitFor(() => expect(click).toHaveBeenCalledOnce())
    expect(click.mock.contexts[0]).toMatchObject({ download: 'workouts-backup-2026-10-26.json', href: 'blob:backup' })
  })

  it('imports a backup after confirming', async () => {
    await saveRoutine(routine('old', 'אימון ישן', []))

    const backup = { version: 1, exportedAt: oct(25), routines: [legs], workouts: [past] }

    renderAt('/tabs/routines/settings')
    chooseFile(await screen.findByLabelText('קובץ גיבוי'), JSON.stringify(backup))

    expect(await screen.findByText('הייבוא יחליף את כל הנתונים')).toBeInTheDocument()
    fireEvent.click(screen.getByText('ייבוא', { selector: '.alert-button *' }))

    await waitFor(() => expect(toasts()).toContain('הגיבוי שוחזר'))
    expect(await db.routines.toArray()).toEqual([legs])
    expect(await db.workouts.toArray()).toEqual([past])
  })

  it.each([
    ['not JSON', () => 'not json'],
    ['a workout without summary', () => JSON.stringify({ version: 1, exportedAt: 1, routines: [], workouts: [noSummary] })],
  ])('invalid backup (%s) shows an error and leaves data intact', async (_case, text) => {
    await saveRoutine(legs)
    await saveWorkout(past)
    renderAt('/tabs/routines/settings')

    chooseFile(await screen.findByLabelText('קובץ גיבוי'), text())

    await waitFor(() => expect(toasts()).toEqual(['קובץ הגיבוי לא תקין']))
    expect(screen.queryByText('הייבוא יחליף את כל הנתונים')).not.toBeInTheDocument()
    expect(await db.routines.toArray()).toEqual([legs])
    expect(await db.workouts.toArray()).toEqual([past])
  })
})

