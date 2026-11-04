import { fireEvent, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { markBackedUp } from '../../src/data/backupStatus'
import { saveRecord, saveWorkout } from '../../src/data/repo'
import { freezeDate } from '../helpers/clock'
import { resetDb } from '../helpers/db'
import { buttonByLabel } from '../helpers/ionic'
import { renderAt } from '../helpers/renderAt'
import { mockShare } from '../helpers/share'
import { activity, done, exercise, oct, workout } from '../helpers/workouts'

const squats = (id: string, day: number) => workout({ id, startedAt: oct(day), exercises: [exercise('סקוואט', [done(40, 12)])] })

async function timelineShown() {
  await screen.findAllByText('אימון גוף מלא')
}

describe('backup reminder', () => {
  beforeEach(resetDb)
  freezeDate(oct(14, 12))

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('asks for a first backup once a workout is logged', async () => {
    await saveWorkout(squats('w1', 13))
    renderAt('/tabs/timeline')

    expect(await screen.findByText('עוד לא גיבית')).toBeInTheDocument()
    expect(screen.getByText('גיבוי')).toBeInTheDocument()
  })

  it('says how long ago the last backup was when a week has passed and more was logged', async () => {
    await saveWorkout(squats('w1', 4))
    await markBackedUp(oct(5, 12))
    await saveWorkout(squats('w2', 13))
    renderAt('/tabs/timeline')

    expect(await screen.findByText('הגיבוי האחרון לפני 9 ימים')).toBeInTheDocument()
  })

  it('stays away within a week of a backup, or when nothing was logged since', async () => {
    await saveWorkout(squats('w1', 4))
    await markBackedUp(oct(5, 12))
    renderAt('/tabs/timeline')
    await timelineShown()

    expect(screen.queryByText('הגיבוי האחרון לפני 9 ימים')).not.toBeInTheDocument()

    await saveWorkout(squats('w2', 13))
    await markBackedUp(oct(10, 12))

    await waitFor(() => expect(screen.getAllByText('אימון גוף מלא')).toHaveLength(2))
    await waitFor(() => expect(screen.queryByText('גיבוי')).not.toBeInTheDocument())
  })

  it('shares the backup file and goes away', async () => {
    await saveWorkout(squats('w1', 13))
    const share = mockShare()
    renderAt('/tabs/timeline')

    fireEvent.click(await screen.findByText('גיבוי'))

    await waitFor(() => expect(share).toHaveBeenCalledOnce())
    expect(share.mock.calls[0][0].files?.map((file) => file.name)).toEqual(['workouts-backup-2026-10-14.json'])
    await waitFor(() => expect(screen.queryByText('עוד לא גיבית')).not.toBeInTheDocument())
  })

  it('stays when the share sheet is cancelled', async () => {
    await saveWorkout(squats('w1', 13))
    const share = mockShare().mockRejectedValue(new DOMException('', 'AbortError'))
    renderAt('/tabs/timeline')

    fireEvent.click(await screen.findByText('גיבוי'))

    await waitFor(() => expect(share).toHaveBeenCalledOnce())
    expect(screen.getByText('עוד לא גיבית')).toBeInTheDocument()
    expect(document.querySelector('ion-toast')).toBeNull()
  })

  it('× hides it until another workout or activity is logged', async () => {
    await saveWorkout(squats('w1', 13))
    renderAt('/tabs/timeline')

    fireEvent.click(await buttonByLabel('סגירה'))

    await waitFor(() => expect(screen.queryByText('עוד לא גיבית')).not.toBeInTheDocument())

    await saveRecord(activity({ id: 'a1', startedAt: oct(14, 8) }))

    expect(await screen.findByText('עוד לא גיבית')).toBeInTheDocument()
  })
})
