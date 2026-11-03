import { act, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { saveWorkout } from '../../src/data/repo'
import { freezeDate } from '../helpers/clock'
import { resetDb } from '../helpers/db'
import { ionElement } from '../helpers/ionic'
import { renderAt } from '../helpers/renderAt'
import { exercise, oct, open, workout } from '../helpers/workouts'


const squats = (finishedAt: number | null, sets = 3) =>
  workout({
    id: 'w1',
    startedAt: oct(26),
    finishedAt,
    exercises: [exercise('סקוואט', Array.from({ length: sets }, () => open(60, 10)))],
  })

const restButton = () => document.querySelector('ion-button.rest-button')

const openRest = async (user: ReturnType<typeof userEvent.setup>) => user.click(await ionElement('ion-button.rest-button'))

async function tick(user: ReturnType<typeof userEvent.setup>, set: number) {
  await user.click(await screen.findByRole('button', { name: `סקוואט סט ${set}`, pressed: false }))
}

beforeEach(async () => {
  await resetDb()
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('live rest timer', () => {
  freezeDate(oct(26, 9, 30))

  it('starts out of sight when a set is ticked, and shows the time left on tap', async () => {
    await saveWorkout(squats(null))
    const user = userEvent.setup()
    renderAt('/tabs/timeline/workout/w1')

    expect(await screen.findByText('סקוואט', { selector: 'h1' })).toBeInTheDocument()
    expect(restButton()).toBeNull()

    await tick(user, 1)

    expect(screen.queryByRole('timer')).not.toBeInTheDocument()
    await openRest(user)

    expect(screen.getByRole('timer')).toHaveTextContent('1:00')
  })

  it('lengthens the rest by 15 seconds and keeps the new length for the next rest', async () => {
    await saveWorkout(squats(null))
    const user = userEvent.setup()
    renderAt('/tabs/timeline/workout/w1')

    await tick(user, 1)
    await openRest(user)
    await user.click(screen.getByRole('button', { name: 'הגדלת מנוחה' }))

    expect(screen.getByRole('timer')).toHaveTextContent('1:15')

    await tick(user, 2)

    expect(screen.getByRole('timer')).toHaveTextContent('1:15')
  })

  it('plays a sound and marks the timer when the rest is over', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const played: boolean[] = []

    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(function (this: HTMLMediaElement) {
      played.push(this.muted)

      return Promise.resolve()
    })
    await saveWorkout(squats(null))
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderAt('/tabs/timeline/workout/w1')

    await tick(user, 1)
    expect(played).not.toContain(false)

    await act(async () => {
      vi.advanceTimersByTime(60_000)
    })

    expect(played.at(-1)).toBe(false)
    expect(await ionElement('ion-button.rest-button.rest-ended')).toBeInTheDocument()
  })

  it('stays quiet when the rest ended while the app was in the background', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const play = vi.spyOn(HTMLMediaElement.prototype, 'play')
    await saveWorkout(squats(null))
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderAt('/tabs/timeline/workout/w1')

    await tick(user, 1)
    play.mockClear()

    await act(async () => {
      vi.setSystemTime(Date.now() + 180_000)
      vi.advanceTimersByTime(60_000)
    })

    expect(await ionElement('ion-button.rest-button.rest-ended')).toBeInTheDocument()
    expect(play).not.toHaveBeenCalled()
  })

  it('ends the rest with the sound when − cuts it shorter than the time left', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const played: boolean[] = []

    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(function (this: HTMLMediaElement) {
      played.push(this.muted)

      return Promise.resolve()
    })
    await saveWorkout(squats(null))
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderAt('/tabs/timeline/workout/w1')

    await tick(user, 1)
    await act(async () => {
      vi.advanceTimersByTime(50_000)
    })
    await openRest(user)
    await user.click(screen.getByRole('button', { name: 'הקטנת מנוחה' }))
    await act(async () => {
      vi.advanceTimersByTime(0)
    })

    expect(played.at(-1)).toBe(false)
    expect(await ionElement('ion-button.rest-button.rest-ended')).toBeInTheDocument()
  })

  it('stays quiet once the sound is turned off, and remembers it', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const play = vi.spyOn(HTMLMediaElement.prototype, 'play')
    await saveWorkout(squats(null))
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderAt('/tabs/timeline/workout/w1')

    await tick(user, 1)
    await openRest(user)
    await user.click(screen.getByRole('button', { name: 'צליל בסוף המנוחה', pressed: true }))
    await tick(user, 2)
    play.mockClear()

    expect(screen.getByRole('button', { name: 'צליל בסוף המנוחה', pressed: false })).toBeInTheDocument()

    await act(async () => {
      vi.advanceTimersByTime(60_000)
    })

    expect(await ionElement('ion-button.rest-button.rest-ended')).toBeInTheDocument()
    expect(play).not.toHaveBeenCalled()
  })

  it('asks iOS to play the sound over other audio', async () => {
    const audioSession = { type: 'auto' }

    Object.defineProperty(navigator, 'audioSession', { configurable: true, value: audioSession })
    await saveWorkout(squats(null))
    const user = userEvent.setup()
    renderAt('/tabs/timeline/workout/w1')

    await tick(user, 1)

    expect(audioSession.type).toBe('transient')
    Reflect.deleteProperty(navigator, 'audioSession')
  })

  it('cannot shorten the rest below 15 seconds', async () => {
    localStorage.setItem('rest-seconds', '15')
    await saveWorkout(squats(null))
    const user = userEvent.setup()
    renderAt('/tabs/timeline/workout/w1')

    await tick(user, 1)
    await openRest(user)

    expect(screen.getByRole('timer')).toHaveTextContent('0:15')
    expect(screen.getByRole('button', { name: 'הקטנת מנוחה' })).toBeDisabled()
  })

  it('stops a running rest when the final set of the workout is ticked', async () => {
    await saveWorkout(squats(null, 2))
    const user = userEvent.setup()
    renderAt('/tabs/timeline/workout/w1')

    await tick(user, 1)
    expect(await ionElement('ion-button.rest-button')).toBeInTheDocument()

    await tick(user, 2)

    expect(await screen.findByRole('button', { name: 'סקוואט סט 2', pressed: true })).toBeInTheDocument()
    expect(restButton()).toBeNull()
  })

  it('does not rest after the last set of the workout', async () => {
    await saveWorkout(squats(null, 1))
    const user = userEvent.setup()
    renderAt('/tabs/timeline/workout/w1')

    await tick(user, 1)

    expect(await screen.findByRole('button', { name: 'סקוואט סט 1', pressed: true })).toBeInTheDocument()
    expect(restButton()).toBeNull()
  })

  it('does not rest while editing a finished workout', async () => {
    await saveWorkout(squats(oct(26, 11)))
    const user = userEvent.setup()
    renderAt('/tabs/timeline/workout/w1')

    await tick(user, 1)

    expect(await screen.findByRole('button', { name: 'סקוואט סט 1', pressed: true })).toBeInTheDocument()
    expect(restButton()).toBeNull()
  })
})
