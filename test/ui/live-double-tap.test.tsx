import { fireEvent, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { saveWorkout } from '../../src/data/repo'
import { guardTapsDuringTransitions } from '../../src/navigation/tapGuard'
import { resetDb, savedWorkout } from '../helpers/db'
import { cardButton, heading, pause } from '../helpers/live'
import { renderAt } from '../helpers/renderAt'
import { exercise, oct, open, workout } from '../helpers/workouts'

const IGNORED_MS = 300

const WELL_PAST_ANY_EARLIER_ADVANCE_MS = 10_000

const WRITES_SETTLED_MS = 50

const oneSetEach = workout({
  id: 'w1',
  startedAt: oct(26),
  finishedAt: null,
  exercises: [exercise('א', [open(60, 10)]), exercise('ב', [open(40, 10)]), exercise('ג', [open(30, 10)])],
})

const twoSets = workout({
  id: 'w1',
  startedAt: oct(26),
  finishedAt: null,
  exercises: [exercise('א', [open(60, 10), open(60, 10)]), exercise('ב', [open(40, 10)])],
})

const tick = async (name: string) => fireEvent.click(await screen.findByRole('button', { name, pressed: false }))

const storedDone = async () =>
  (await savedWorkout('w1'))?.sections[0].items.map((item) => item.exercises[0].sets.every((set) => set.done))

const storedSkipped = async () =>
  (await savedWorkout('w1'))?.sections[0].items.map((item) => item.exercises[0].skipped)

describe('taps right after an advance', () => {
  let release = () => {}
  let now = 0

  beforeEach(async () => {
    await resetDb()
    now += WELL_PAST_ANY_EARLIER_ADVANCE_MS
    vi.spyOn(performance, 'now').mockImplementation(() => now)
    Object.defineProperty(document, 'getAnimations', { configurable: true, value: () => [] })
    release = guardTapsDuringTransitions(document)
  })

  afterEach(() => {
    release()
    vi.restoreAllMocks()
  })

  it('ignores a second ✓ that lands on the next exercise', async () => {
    await saveWorkout(oneSetEach)
    renderAt('/tabs/timeline/workout/w1')

    await tick('א סט 1')
    await heading('ב')
    now += IGNORED_MS
    await tick('ב סט 1')
    await pause(WRITES_SETTLED_MS)

    expect(await heading('ב')).toBeInTheDocument()
    expect(await storedDone()).toEqual([true, false, false])
  })

  it('takes the next ✓ once the moment has passed', async () => {
    await saveWorkout(oneSetEach)
    renderAt('/tabs/timeline/workout/w1')

    await tick('א סט 1')
    await heading('ב')
    now += IGNORED_MS + 1
    await tick('ב סט 1')

    expect(await heading('ג')).toBeInTheDocument()
  })

  it('ignores a second דלג that lands on the next exercise', async () => {
    await saveWorkout(oneSetEach)
    renderAt('/tabs/timeline/workout/w1')

    fireEvent.click(await cardButton('דלג'))
    await heading('ב')
    now += IGNORED_MS
    fireEvent.click(await cardButton('דלג'))
    await pause(WRITES_SETTLED_MS)

    expect(await heading('ב')).toBeInTheDocument()
    expect(await storedSkipped()).toEqual([true, false, false])
  })

  it('does not slow down ticking the sets of one exercise', async () => {
    await saveWorkout(twoSets)
    renderAt('/tabs/timeline/workout/w1')

    await tick('א סט 1')
    await tick('א סט 2')

    expect(await heading('ב')).toBeInTheDocument()
  })
})
