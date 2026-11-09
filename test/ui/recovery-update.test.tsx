import { fireEvent, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { resetDb } from '../helpers/db'
import { openOnBadRecord } from '../helpers/recovery'
import { spyOnReload } from '../helpers/reload'

const RELOAD = 'טעינה מחדש'

function fakeServiceWorker(waiting: { postMessage: () => void } | null) {
  const registration = { update: vi.fn().mockResolvedValue({}), installing: null, active: { scriptURL: 'sw.js' }, waiting }

  const serviceWorker = Object.assign(new EventTarget(), {
    getRegistration: vi.fn().mockResolvedValue(registration),
  })

  Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: serviceWorker })

  return { registration, serviceWorker }
}

describe('the recovery screen with a service worker', () => {
  beforeEach(async () => {
    await resetDb()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(null, { status: 200 })),
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    Reflect.deleteProperty(navigator, 'serviceWorker')
    window.location.hash = ''
  })

  it('checks for an update when it opens', async () => {
    const { registration } = fakeServiceWorker(null)

    await openOnBadRecord()

    await waitFor(() => expect(registration.update).toHaveBeenCalledOnce())
  })

  it('skips the check while offline', async () => {
    const { registration, serviceWorker } = fakeServiceWorker(null)

    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
    await openOnBadRecord()

    await waitFor(() => expect(serviceWorker.getRegistration).toHaveBeenCalled())
    expect(registration.update).not.toHaveBeenCalled()
  })

  it('applies a waiting update and reloads at the start once it takes over', async () => {
    const waiting = { postMessage: vi.fn() }
    const { serviceWorker } = fakeServiceWorker(waiting)

    await openOnBadRecord()
    const reload = spyOnReload()
    fireEvent.click(screen.getByRole('button', { name: RELOAD }))

    await waitFor(() => expect(waiting.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' }))
    expect(window.location.hash).toBe('')
    expect(reload).not.toHaveBeenCalled()

    serviceWorker.dispatchEvent(new Event('controllerchange'))

    expect(reload).toHaveBeenCalledOnce()
  })

  it('reloads at the start right away when no update is waiting', async () => {
    fakeServiceWorker(null)

    await openOnBadRecord()
    const reload = spyOnReload()
    fireEvent.click(screen.getByRole('button', { name: RELOAD }))

    await waitFor(() => expect(reload).toHaveBeenCalledOnce())
    expect(window.location.hash).toBe('')
  })

  it('still reloads at the start when the service worker cannot be reached', async () => {
    const { serviceWorker } = fakeServiceWorker(null)

    await openOnBadRecord()
    serviceWorker.getRegistration.mockRejectedValue(new Error('no registration'))
    const reload = spyOnReload()
    fireEvent.click(screen.getByRole('button', { name: RELOAD }))

    await waitFor(() => expect(reload).toHaveBeenCalledOnce())
    expect(window.location.hash).toBe('')
  })
})
