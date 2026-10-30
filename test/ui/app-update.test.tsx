import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import { saveWorkout } from '../../src/data/repo'
import { resetDb } from '../helpers/db'
import { buttonByLabel } from '../helpers/ionic'
import { renderAt } from '../helpers/renderAt'
import { exercise, oct, open, workout } from '../helpers/workouts'

interface PwaMock {
  needRefresh: boolean
  updateServiceWorker: Mock<() => Promise<void>>
}

const pwa = vi.hoisted(() => {
  const state: PwaMock = { needRefresh: true, updateServiceWorker: vi.fn(async () => {}) }

  return state
})

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => ({
    needRefresh: [pwa.needRefresh, vi.fn()],
    offlineReady: [false, vi.fn()],
    updateServiceWorker: pwa.updateServiceWorker,
  }),
}))

const READY = 'גרסה חדשה זמינה'

function becomeVisible() {
  vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible')
  fireEvent(document, new Event('visibilitychange'))
}

beforeEach(async () => {
  await resetDb()
  pwa.needRefresh = true
  pwa.updateServiceWorker.mockClear()
})

describe('a new version of the app', () => {
  it('offers the update on the main screens', async () => {
    renderAt('/tabs/timeline')

    expect(await screen.findByText(READY)).toBeInTheDocument()
  })

  it('updates when עדכון is tapped', async () => {
    renderAt('/tabs/routines')

    fireEvent.click(await screen.findByText('עדכון'))

    expect(pwa.updateServiceWorker).toHaveBeenCalledTimes(1)
  })

  it('stays out of the way during a workout', async () => {
    await saveWorkout(
      workout({ id: 'w1', startedAt: oct(26), finishedAt: null, exercises: [exercise('סקוואט', [open(60, 10)])] }),
    )
    renderAt('/tabs/timeline/workout/w1')

    expect(await screen.findAllByText('סקוואט')).not.toHaveLength(0)
    expect(screen.queryByText(READY)).not.toBeInTheDocument()
  })

  it('can be put off until the app is opened again', async () => {
    renderAt('/tabs/timeline')

    fireEvent.click(await buttonByLabel('לא עכשיו'))
    await waitFor(() => expect(screen.queryByText(READY)).not.toBeInTheDocument())

    becomeVisible()

    expect(await screen.findByText(READY)).toBeInTheDocument()
  })

  it('shows nothing while there is no new version', async () => {
    pwa.needRefresh = false
    renderAt('/tabs/timeline')

    expect(await screen.findAllByText('ציר זמן')).not.toHaveLength(0)
    expect(screen.queryByText(READY)).not.toBeInTheDocument()
  })
})
