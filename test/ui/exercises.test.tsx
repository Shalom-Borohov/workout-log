import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { saveRoutine, saveWorkout } from '../../src/data/repo'
import { freezeDate } from '../helpers/clock'
import { resetDb } from '../helpers/db'
import { expectInOrder, ionElement, ionInput } from '../helpers/ionic'
import { currentPath, renderAt } from '../helpers/renderAt'
import { done, exercise, oct, reps, routine, workout } from '../helpers/workouts'

const fullBody = routine('r1', 'אימון גוף מלא', [
  [{ name: 'סקוואט', target: reps(10) }],
  [{ name: 'לחיצת חזה', target: reps(8) }],
])

describe('exercises', () => {
  beforeEach(resetDb)
  freezeDate(oct(26, 12))

  it('exercise list filters', async () => {
    await saveRoutine(fullBody)
    await saveWorkout(workout({ id: 'w1', startedAt: oct(26, 8), exercises: [exercise('סקוואט', [done(20, 10), done(22, 8)])] }))
    renderAt('/tabs/exercises')

    expect(await screen.findByText('סקוואט')).toBeInTheDocument()
    expect(screen.getByText('לחיצת חזה')).toBeInTheDocument()
    expect(screen.getByText('22 ק״ג × 8').closest('ion-item')).toHaveTextContent('סקוואט')
    expect(screen.getByText('יום ב׳ 26.10').closest('ion-item')).toHaveTextContent('סקוואט')

    ionInput(await ionElement('ion-searchbar'), 'לחי')

    await waitFor(() => expect(screen.queryByText('סקוואט')).not.toBeInTheDocument())
    expect(screen.getByText('לחיצת חזה')).toBeInTheDocument()
  })

  it('exercise list explains where exercises come from when there are none', async () => {
    renderAt('/tabs/exercises')

    expect(await screen.findByText('עוד אין תרגילים')).toBeInTheDocument()
    expect(screen.getByText('תרגילים יופיעו כאן אחרי שתוסיפו אימון בלשונית אימונים או תסיימו אימון.')).toBeInTheDocument()
  })

  it('exercise list says when a search matches nothing', async () => {
    await saveRoutine(fullBody)
    renderAt('/tabs/exercises')
    await screen.findByText('סקוואט')

    ionInput(await ionElement('ion-searchbar'), 'חתירה')

    expect(await screen.findByText('אין תוצאות עבור ״חתירה״')).toBeInTheDocument()
    expect(screen.queryByText('עוד אין תרגילים')).not.toBeInTheDocument()
  })

  it('exercise history newest first', async () => {
    await saveWorkout(workout({ id: 'w1', startedAt: oct(12), exercises: [exercise('סקוואט', [done(20, 10)])] }))
    await saveWorkout(workout({ id: 'w2', startedAt: oct(19), exercises: [exercise('סקוואט', [done(25, 8), done(25, 6)])] }))
    await saveWorkout(workout({ id: 'w3', startedAt: oct(26, 8), exercises: [exercise('סקוואט', [done(22, 10)])] }))
    renderAt(`/tabs/exercises/${encodeURIComponent('סקוואט')}`)

    await expectInOrder(['יום ב׳ 26.10', 'יום ב׳ 19.10', 'יום ב׳ 12.10'])
    expect(screen.getByText('25 ק״ג × 8, 6')).toBeInTheDocument()
    expect(screen.getByText('20 ק״ג × 10')).toBeInTheDocument()
    expect(screen.getByLabelText('שיא חדש').closest('ion-item')).toHaveTextContent('יום ב׳ 19.10')
    expect(screen.getAllByLabelText('שיא חדש')).toHaveLength(1)
    expect(screen.queryByText('★')).not.toBeInTheDocument()
  })

  it('exercise history charts the heaviest weight once there are two weighted sessions', async () => {
    await saveWorkout(workout({ id: 'w1', startedAt: oct(12), exercises: [exercise('סקוואט', [done(20, 10)])] }))
    await saveWorkout(workout({ id: 'w2', startedAt: oct(19), exercises: [exercise('סקוואט', [done(null, 12)])] }))
    await saveWorkout(workout({ id: 'w3', startedAt: oct(26, 8), exercises: [exercise('סקוואט', [done(20, 8), done(22.5, 6)])] }))
    renderAt(`/tabs/exercises/${encodeURIComponent('סקוואט')}`)

    expect(await screen.findByRole('img', { name: 'משקל מרבי: מ־20 ק״ג ב־12.10 ל־22.5 ק״ג ב־26.10' })).toBeInTheDocument()
    expect(screen.getByText('22.5 ק״ג')).toBeInTheDocument()
  })

  it('exercise history has no chart with fewer than two weighted sessions', async () => {
    await saveWorkout(workout({ id: 'w1', startedAt: oct(12), exercises: [exercise('סקוואט', [done(null, 12)])] }))
    await saveWorkout(workout({ id: 'w2', startedAt: oct(19), exercises: [exercise('סקוואט', [done(20, 10)])] }))
    renderAt(`/tabs/exercises/${encodeURIComponent('סקוואט')}`)

    await screen.findByText('יום ב׳ 19.10')
    expect(screen.queryByRole('img', { name: /משקל מרבי/ })).not.toBeInTheDocument()
  })

  it('tapping an exercise opens its history', async () => {
    await saveRoutine(fullBody)
    renderAt('/tabs/exercises')

    fireEvent.click(await screen.findByText('לחיצת חזה'))

    await waitFor(() => expect(currentPath()).toBe(`/tabs/exercises/${encodeURIComponent('לחיצת חזה')}`))
  })
})
