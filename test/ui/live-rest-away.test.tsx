import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { saveWorkout } from '../../src/data/repo'
import { BackGesture } from '../helpers/BackGesture'
import { freezeDate } from '../helpers/clock'
import { resetDb } from '../helpers/db'
import { ionElement } from '../helpers/ionic'
import { heading, openRest, restButton, setVisibility, spyPlayed, tickSquat as tick } from '../helpers/live'
import { currentPath, renderAt } from '../helpers/renderAt'
import { exercise, oct, open, workout } from '../helpers/workouts'

const squats = workout({
  id: 'w1',
  startedAt: oct(26),
  finishedAt: null,
  exercises: [exercise('סקוואט', [open(60, 10), open(60, 10), open(60, 10)])],
})

async function enterWorkout(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByText('אימון בתהליך'))
  await waitFor(() => expect(currentPath()).toBe('/tabs/timeline/workout/w1'))
}

async function leaveWorkout(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByTestId('swipe-back'))
  await waitFor(() => expect(currentPath()).toBe('/tabs/timeline'))
}

beforeEach(async () => {
  await resetDb()
  await saveWorkout(squats)
})

async function passTime(ms: number) {
  await act(async () => {
    vi.advanceTimersByTime(ms)
  })
}

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('rest away from the workout', () => {
  freezeDate(oct(26, 9, 30))

  it('keeps running after leaving the workout and coming back', async () => {
    const user = userEvent.setup()
    renderAt('/tabs/timeline', <BackGesture />)

    await enterWorkout(user)
    await tick(user, 1)
    await leaveWorkout(user)
    await waitFor(() => expect(restButton()).toBeNull())
    await enterWorkout(user)

    await openRest(user)

    expect(screen.getByRole('timer')).toHaveTextContent('1:00')
  })

  it('keeps running after the app reloads', async () => {
    const user = userEvent.setup()
    const { unmount } = renderAt('/tabs/timeline/workout/w1')

    await tick(user, 1)
    unmount()
    renderAt('/tabs/timeline/workout/w1')

    await openRest(user)

    expect(screen.getByRole('timer')).toHaveTextContent('1:00')
  })

  it('shows the right workout time as soon as the app comes back', async () => {
    vi.setSystemTime(oct(26, 10, 30))
    renderAt('/tabs/timeline/workout/w1')

    expect(await screen.findByText('30:00')).toBeInTheDocument()

    await setVisibility('hidden')
    vi.setSystemTime(oct(26, 10, 45))
    await setVisibility('visible')

    expect(screen.getByText('45:00')).toBeInTheDocument()
  })

  it('primes the sound on the first tap after the app reloads mid-rest', async () => {
    const user = userEvent.setup()
    const { unmount } = renderAt('/tabs/timeline/workout/w1')

    await tick(user, 1)
    unmount()
    const played = spyPlayed()
    renderAt('/tabs/timeline/workout/w1')

    await user.click(await heading('סקוואט'))

    expect(played).toEqual([true])
  })

  it('primes the sound once, and again on the first tick after the app was away', async () => {
    await saveWorkout(
      workout({
        id: 'w1',
        startedAt: oct(26),
        finishedAt: null,
        exercises: [exercise('סקוואט', [open(60, 10), open(60, 10), open(60, 10), open(60, 10)])],
      }),
    )
    const played = spyPlayed()
    const user = userEvent.setup()
    renderAt('/tabs/timeline/workout/w1')

    await tick(user, 1)
    await tick(user, 2)

    expect(played).toEqual([true])

    await setVisibility('hidden')
    await setVisibility('visible')
    await tick(user, 3)

    expect(played).toEqual([true, true])
  })

  it('lets the end sound finish when the next set is ticked while it plays', async () => {
    const played = spyPlayed()
    const pause = vi.spyOn(HTMLMediaElement.prototype, 'pause')
    const user = userEvent.setup()
    renderAt('/tabs/timeline/workout/w1')

    await tick(user, 1)
    await setVisibility('hidden')
    await setVisibility('visible')
    played.length = 0
    pause.mockClear()
    vi.spyOn(HTMLMediaElement.prototype, 'paused', 'get').mockReturnValue(false)
    await tick(user, 2)

    expect(played).toEqual([])
    expect(pause).not.toHaveBeenCalled()
  })
})

describe('rest ending away from the workout', () => {
  freezeDate(oct(26, 9, 30))

  async function startRest() {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const played = spyPlayed()
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderAt('/tabs/timeline', <BackGesture />)

    await enterWorkout(user)
    await tick(user, 1)

    return { played, user }
  }

  it('plays the sound while on another page', async () => {
    const { played, user } = await startRest()

    await leaveWorkout(user)
    await passTime(60_000)

    expect(played.at(-1)).toBe(false)
  })

  it('keeps the screen awake on another page until the rest is over', async () => {
    const release = vi.fn(() => Promise.resolve())
    const request = vi.fn(() => Promise.resolve({ release }))

    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const { unmount } = renderAt('/tabs/timeline/workout/w1')

    await tick(user, 1)
    unmount()
    Object.defineProperty(navigator, 'wakeLock', { configurable: true, value: { request } })
    renderAt('/tabs/timeline')

    await waitFor(() => expect(request).toHaveBeenCalledWith('screen'))
    expect(release).not.toHaveBeenCalled()

    await passTime(60_000)

    await waitFor(() => expect(release).toHaveBeenCalled())
    Reflect.deleteProperty(navigator, 'wakeLock')
  })

  it('plays the sound on time when the app comes back before the rest is over', async () => {
    const { played } = await startRest()

    await setVisibility('hidden')
    vi.setSystemTime(Date.now() + 30_000)
    await setVisibility('visible')
    await passTime(29_000)

    expect(played).not.toContain(false)

    await passTime(1_000)

    expect(played.at(-1)).toBe(false)
  })

  it('stays quiet and shows the rest is over when it ended while the app was away', async () => {
    const { played } = await startRest()

    await setVisibility('hidden')
    vi.setSystemTime(Date.now() + 180_000)
    await setVisibility('visible')

    expect(await ionElement('ion-button.rest-button.rest-ended')).toBeInTheDocument()
    expect(played).not.toContain(false)
  })

  it('ends with the workout when it is finished', async () => {
    const { played, user } = await startRest()

    await user.click(await screen.findByText('סיום', { selector: 'ion-button' }))
    await user.click(await screen.findByText('שמירה', { selector: 'ion-button' }))
    await waitFor(() => expect(currentPath()).toBe('/tabs/timeline/w1'))
    await waitFor(() => expect(localStorage.getItem('running-rest')).toBeNull())
    await passTime(60_000)

    expect(played).not.toContain(false)
  })

  it('ends with the workout when it is deleted', async () => {
    const { played, user } = await startRest()

    await user.click(await screen.findByText('סיום', { selector: 'ion-button' }))
    await user.click(await screen.findByText('מחיקת האימון'))
    fireEvent.click(await screen.findByText('מחיקה', { selector: '.alert-button-inner' }))
    await waitFor(() => expect(currentPath()).toBe('/tabs/timeline'))
    await waitFor(() => expect(localStorage.getItem('running-rest')).toBeNull())
    await passTime(60_000)

    expect(played).not.toContain(false)
  })
})
