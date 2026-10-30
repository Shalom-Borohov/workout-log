import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { saveWorkout } from '../../src/data/repo'
import { saveSeenVersion } from '../../src/data/seenVersion'
import { resetDb } from '../helpers/db'
import { expectInOrder } from '../helpers/ionic'
import { renderAt } from '../helpers/renderAt'
import { exercise, oct, open, workout } from '../helpers/workouts'

vi.mock('../../src/appUpdate/changelog', () => ({
  CHANGELOG: [
    { version: '0.1.0', features: ['הכי ישן'], fixes: [] },
    { version: __APP_VERSION__, features: ['בחירת תרגיל קיים'], fixes: ['תיקון ההחלקה'] },
    { version: '0.2.0', features: ['ישן'], fixes: [] },
  ],
}))

const OLDEST_SEEN = '0.1.0'

const closeButton = () => screen.findByText('סגירה')

beforeEach(async () => {
  await resetDb()
  localStorage.clear()
})

describe('what’s new after an update', () => {
  it('lists the releases since the last one seen, newest first', async () => {
    saveSeenVersion(OLDEST_SEEN)
    renderAt('/tabs/timeline')

    expect(await screen.findByText('מה חדש')).toBeInTheDocument()
    expect(screen.getByText(`גרסה ${__APP_VERSION__}`)).toBeInTheDocument()
    expect(screen.getByText('בחירת תרגיל קיים')).toBeInTheDocument()
    expect(screen.getByText('תיקון ההחלקה')).toBeInTheDocument()
    expect(screen.getByText('גרסה 0.2.0')).toBeInTheDocument()
    expect(screen.queryByText('הכי ישן')).not.toBeInTheDocument()
    await expectInOrder([`גרסה ${__APP_VERSION__}`, 'גרסה 0.2.0'])
  })

  it('shows only once', async () => {
    saveSeenVersion(OLDEST_SEEN)
    renderAt('/tabs/timeline')

    fireEvent.click(await closeButton())
    await waitFor(() => expect(screen.queryByText('בחירת תרגיל קיים')).not.toBeInTheDocument())

    cleanup()
    renderAt('/tabs/timeline')

    expect(await screen.findAllByText('ציר זמן')).not.toHaveLength(0)
    expect(screen.queryByText('מה חדש')).not.toBeInTheDocument()
  })

  it('shows only the running release when no version was seen before', async () => {
    renderAt('/tabs/timeline')

    expect(await screen.findByText(`גרסה ${__APP_VERSION__}`)).toBeInTheDocument()
    expect(screen.queryByText('גרסה 0.2.0')).not.toBeInTheDocument()
  })

  it('waits until the workout is left', async () => {
    saveSeenVersion(OLDEST_SEEN)
    await saveWorkout(
      workout({ id: 'w1', startedAt: oct(26), finishedAt: null, exercises: [exercise('סקוואט', [open(60, 10)])] }),
    )
    renderAt('/tabs/timeline/workout/w1')

    expect(await screen.findAllByText('סקוואט')).not.toHaveLength(0)
    expect(screen.queryByText('מה חדש')).not.toBeInTheDocument()
  })

  it('opens every release from the version line in Settings', async () => {
    saveSeenVersion(__APP_VERSION__)
    renderAt('/tabs/timeline/settings')

    fireEvent.click(await screen.findByText(new RegExp(`^גרסה ${__APP_VERSION__} · עודכן`)))

    expect(await screen.findByText('מה חדש')).toBeInTheDocument()
    expect(screen.getByText('הכי ישן')).toBeInTheDocument()
    expect(screen.getByText('ישן')).toBeInTheDocument()
    expect(screen.getByText('בחירת תרגיל קיים')).toBeInTheDocument()
  })
})
