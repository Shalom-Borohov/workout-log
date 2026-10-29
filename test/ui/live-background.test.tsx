import { screen, waitFor } from '@testing-library/react'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { setBackground } from '../../src/data/background'
import { saveWorkout } from '../../src/data/repo'
import { resetDb } from '../helpers/db'
import { ionElement } from '../helpers/ionic'
import { renderAt } from '../helpers/renderAt'
import { exercise, oct, open, workout } from '../helpers/workouts'

const active = workout({ id: 'w1', startedAt: oct(26), finishedAt: null, exercises: [exercise('סקוואט', [open(60, 10)])] })

const content = () => ionElement('ion-content.live-content')

const revoke = vi.fn()

beforeAll(() => {
  URL.createObjectURL = () => 'blob:photo'
  URL.revokeObjectURL = revoke
})

beforeEach(async () => {
  await resetDb()
  revoke.mockClear()
})

describe('live background photo', () => {
  it('shows the chosen photo behind the live page', async () => {
    await setBackground(new Blob(['photo'], { type: 'image/jpeg' }))
    await saveWorkout(active)
    renderAt('/tabs/timeline/workout/w1')

    await waitFor(async () => expect((await content()).getAttribute('style')).toContain('blob:photo'))
    expect((await content()).classList).toContain('live-photo')
  })

  it('releases the photo URL when the page closes', async () => {
    await setBackground(new Blob(['photo'], { type: 'image/jpeg' }))
    await saveWorkout(active)
    const view = renderAt('/tabs/timeline/workout/w1')

    await waitFor(async () => expect((await content()).getAttribute('style')).toContain('blob:photo'))
    view.unmount()

    expect(revoke).toHaveBeenCalledWith('blob:photo')
  })

  it('has no photo when none is set', async () => {
    await saveWorkout(active)
    renderAt('/tabs/timeline/workout/w1')

    expect(await screen.findByText('סקוואט', { selector: 'h1' })).toBeInTheDocument()
    expect((await content()).classList).not.toContain('live-photo')
  })
})
