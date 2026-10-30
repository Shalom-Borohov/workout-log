import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { checkForUpdates } from '../../src/appUpdate/updateChecks'

const SW_URL = '/workout-log/sw.js'

const HOUR_MS = 60 * 60 * 1000

const OK = 200

const SERVER_ERROR = 503

function fakeRegistration() {
  return { installing: null, update: vi.fn(async () => ({})) }
}

function respondWith(status: number) {
  const fetchSpy = vi.fn(async () => new Response(null, { status }))
  vi.stubGlobal('fetch', fetchSpy)

  return fetchSpy
}

function setVisibility(state: DocumentVisibilityState) {
  vi.spyOn(document, 'visibilityState', 'get').mockReturnValue(state)
  document.dispatchEvent(new Event('visibilitychange'))
}

describe('checking for a new version', () => {
  let stopChecking = () => {}

  async function startChecking(registration: ReturnType<typeof fakeRegistration>, fetchSpy: ReturnType<typeof respondWith>) {
    stopChecking = checkForUpdates(SW_URL, registration, document)
    await vi.advanceTimersByTimeAsync(0)
    registration.update.mockClear()
    fetchSpy.mockClear()
  }

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    stopChecking()
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('checks as soon as the app opens', async () => {
    const fetchSpy = respondWith(OK)
    const registration = fakeRegistration()
    stopChecking = checkForUpdates(SW_URL, registration, document)

    await vi.advanceTimersByTimeAsync(0)

    expect(fetchSpy).toHaveBeenCalledWith(SW_URL, expect.objectContaining({ cache: 'no-store' }))
    expect(registration.update).toHaveBeenCalledTimes(1)
  })

  it('checks when the app comes back from the background', async () => {
    const fetchSpy = respondWith(OK)
    const registration = fakeRegistration()
    await startChecking(registration, fetchSpy)

    setVisibility('visible')
    await vi.advanceTimersByTimeAsync(0)

    expect(registration.update).toHaveBeenCalledTimes(1)
  })

  it('does not check when the app goes to the background', async () => {
    const fetchSpy = respondWith(OK)
    await startChecking(fakeRegistration(), fetchSpy)

    setVisibility('hidden')
    await vi.advanceTimersByTimeAsync(0)

    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('checks every hour while the app is open', async () => {
    const fetchSpy = respondWith(OK)
    const registration = fakeRegistration()
    await startChecking(registration, fetchSpy)

    await vi.advanceTimersByTimeAsync(HOUR_MS - 1)
    expect(registration.update).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(1)
    expect(registration.update).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTimeAsync(HOUR_MS)
    expect(registration.update).toHaveBeenCalledTimes(2)
  })

  it('skips the check while offline', async () => {
    const fetchSpy = respondWith(OK)
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
    stopChecking = checkForUpdates(SW_URL, fakeRegistration(), document)

    setVisibility('visible')
    await vi.advanceTimersByTimeAsync(HOUR_MS)

    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('skips the check while a new version is already installing', async () => {
    const fetchSpy = respondWith(OK)
    const installing = { ...fakeRegistration(), installing: new EventTarget() }
    stopChecking = checkForUpdates(SW_URL, installing, document)

    setVisibility('visible')
    await vi.advanceTimersByTimeAsync(0)

    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('does not update when the site does not answer', async () => {
    respondWith(SERVER_ERROR)
    const registration = fakeRegistration()
    stopChecking = checkForUpdates(SW_URL, registration, document)

    setVisibility('visible')
    await vi.advanceTimersByTimeAsync(0)

    expect(registration.update).not.toHaveBeenCalled()
  })

  it('stops checking once released', async () => {
    const fetchSpy = respondWith(OK)
    await startChecking(fakeRegistration(), fetchSpy)
    stopChecking()

    setVisibility('visible')
    await vi.advanceTimersByTimeAsync(HOUR_MS)

    expect(fetchSpy).not.toHaveBeenCalled()
  })
})
