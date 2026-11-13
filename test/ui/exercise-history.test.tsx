import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { setExerciseArea } from '../../src/data/exerciseAreas'
import { saveRoutine, saveWorkout } from '../../src/data/repo'
import { areaIconOf } from '../helpers/areas'
import { freezeDate } from '../helpers/clock'
import { resetDb } from '../helpers/db'
import { expectInOrder, OPEN_MODAL, radioByLabel } from '../helpers/ionic'
import { renderAt } from '../helpers/renderAt'
import { done, exercise, oct, reps, routine, seconds, workout } from '../helpers/workouts'

const fullBody = routine('r1', 'אימון גוף מלא', [
  [{ name: 'סקוואט', target: reps(10) }],
  [{ name: 'לחיצת חזה', target: reps(8) }],
])

const historyOf = (name: string) => renderAt(`/tabs/exercises/${encodeURIComponent(name)}`)

function sessionRow(date: HTMLElement) {
  const row = date.closest('ion-item')

  if (!(row instanceof HTMLElement)) {
    throw new Error('no session row')
  }

  return row
}

function barOf(row: HTMLElement) {
  const bar = row.querySelector('.session-bar')

  if (!(bar instanceof HTMLElement)) {
    throw new Error('no bar')
  }

  return bar
}

describe('exercise history', () => {
  beforeEach(resetDb)
  freezeDate(oct(26, 12))

  it('sets the body area from a sheet', async () => {
    await saveRoutine(fullBody)
    historyOf('סקוואט')

    const label = await screen.findByText('אזור בגוף', { selector: 'ion-label' })
    const row = label.closest('ion-item')

    expect(row).toHaveTextContent('ללא')
    fireEvent.click(label)
    fireEvent.click(await radioByLabel('רגליים'))

    await waitFor(() => expect(row).toHaveTextContent('רגליים'))
    await waitFor(() => expect(document.querySelector(OPEN_MODAL)).toBeNull())
    expect(areaIconOf(label)).toBe('legs')
  })

  it('closes the area sheet when the current area is tapped again', async () => {
    await saveRoutine(fullBody)
    await setExerciseArea('סקוואט', 'legs')
    historyOf('סקוואט')

    fireEvent.click(await screen.findByText('אזור בגוף', { selector: 'ion-label' }))
    await waitFor(() => expect(document.querySelector(OPEN_MODAL)).not.toBeNull())
    fireEvent.click(await radioByLabel('רגליים'))

    await waitFor(() => expect(document.querySelector(OPEN_MODAL)).toBeNull())
  })

  it('lists sessions newest first, each set on its own', async () => {
    await saveWorkout(workout({ id: 'w1', startedAt: oct(12), exercises: [exercise('סקוואט', [done(20, 10)])] }))
    await saveWorkout(workout({ id: 'w2', startedAt: oct(19), exercises: [exercise('סקוואט', [done(25, 8), done(25, 6)])] }))
    await saveWorkout(workout({ id: 'w3', startedAt: oct(26, 8), exercises: [exercise('סקוואט', [done(22, 10)])] }))
    historyOf('סקוואט')

    await expectInOrder(['יום ב׳ 26.10', 'יום ב׳ 19.10', 'יום ב׳ 12.10'])
    const record = sessionRow(screen.getByText('יום ב׳ 19.10'))

    expect(within(record).getByText('25 × 8')).toBeInTheDocument()
    expect(within(record).getByText('25 × 6')).toBeInTheDocument()
    expect(screen.getByText('20 × 10')).toBeInTheDocument()
    expect(screen.getByLabelText('שיא חדש').closest('ion-item')).toBe(record)
    expect(screen.getAllByLabelText('שיא חדש')).toHaveLength(1)
    expect(screen.queryByText('★')).not.toBeInTheDocument()
  })

  it('shows each session as its own plate', async () => {
    await saveWorkout(workout({ id: 'w1', startedAt: oct(12), exercises: [exercise('סקוואט', [done(20, 10)])] }))
    await saveWorkout(workout({ id: 'w2', startedAt: oct(19), exercises: [exercise('סקוואט', [done(25, 8)])] }))
    historyOf('סקוואט')

    const latest = sessionRow(await screen.findByText('יום ב׳ 19.10'))

    expect(latest.closest('ion-list')).toHaveClass('list-plates')
  })

  it('shows each session’s best weight as a number with its unit, and stars only the record', async () => {
    await saveWorkout(workout({ id: 'w1', startedAt: oct(12), exercises: [exercise('סקוואט', [done(20, 10)])] }))
    await saveWorkout(workout({ id: 'w2', startedAt: oct(19), exercises: [exercise('סקוואט', [done(25, 8), done(25, 6)])] }))
    await saveWorkout(workout({ id: 'w3', startedAt: oct(26, 8), exercises: [exercise('סקוואט', [done(20, 12), done(22.5, 10)])] }))
    historyOf('סקוואט')

    const record = sessionRow(await screen.findByText('יום ב׳ 19.10'))
    const latest = sessionRow(screen.getByText('יום ב׳ 26.10'))

    expect(within(record).getByText('25')).toBeInTheDocument()
    expect(within(record).getByText('ק״ג')).toBeInTheDocument()
    expect(within(record).getByLabelText('שיא חדש')).toBeInTheDocument()
    expect(within(latest).getByText('22.5')).toBeInTheDocument()
    expect(within(latest).getByText('ק״ג')).toBeInTheDocument()
    expect(within(latest).queryByLabelText('שיא חדש')).not.toBeInTheDocument()
    expect(within(sessionRow(screen.getByText('יום ב׳ 12.10'))).getByText('20')).toBeInTheDocument()
  })

  it('shows the best amount with its unit for a session with no weight', async () => {
    await saveWorkout(workout({ id: 'w1', startedAt: oct(19), exercises: [exercise('שכיבות סמיכה', [done(null, 12), done(null, 15)])] }))
    await saveWorkout(workout({ id: 'w2', startedAt: oct(26, 8), exercises: [exercise('שכיבות סמיכה', [done(null, 10)])] }))
    historyOf('שכיבות סמיכה')

    const row = sessionRow(await screen.findByText('יום ב׳ 19.10'))

    expect(within(row).getByText('15', { selector: '.session-best-value' })).toBeInTheDocument()
    expect(within(row).getByText('חזרות')).toBeInTheDocument()
    expect(within(sessionRow(screen.getByText('יום ב׳ 26.10'))).getByText('10', { selector: '.session-best-value' })).toBeInTheDocument()
  })

  it('shows a timed session’s best time in minutes when whole, otherwise in seconds', async () => {
    await saveWorkout(workout({ id: 'w1', startedAt: oct(19), exercises: [exercise('פלאנק', [done(null, 45), done(null, 50)], seconds(45))] }))
    await saveWorkout(workout({ id: 'w2', startedAt: oct(26, 8), exercises: [exercise('פלאנק', [done(null, 120), done(null, 45)], seconds(45))] }))
    historyOf('פלאנק')

    const seconds50 = sessionRow(await screen.findByText('יום ב׳ 19.10'))
    const minutes2 = sessionRow(screen.getByText('יום ב׳ 26.10'))

    expect(within(seconds50).getByText('50')).toBeInTheDocument()
    expect(within(seconds50).getByText('שנ׳')).toBeInTheDocument()
    expect(within(minutes2).getByText('2')).toBeInTheDocument()
    expect(within(minutes2).getByText('דק׳')).toBeInTheDocument()
  })

  it('has no chart', async () => {
    await saveWorkout(workout({ id: 'w1', startedAt: oct(12), exercises: [exercise('סקוואט', [done(20, 10)])] }))
    await saveWorkout(workout({ id: 'w2', startedAt: oct(19), exercises: [exercise('סקוואט', [done(22.5, 10)])] }))
    historyOf('סקוואט')

    await screen.findByText('יום ב׳ 19.10')
    expect(screen.queryByRole('img', { name: /משקל מרבי/ })).not.toBeInTheDocument()
  })

  it('marks the record session’s plate', async () => {
    await saveWorkout(workout({ id: 'w1', startedAt: oct(12), exercises: [exercise('סקוואט', [done(25, 10)])] }))
    await saveWorkout(workout({ id: 'w2', startedAt: oct(19), exercises: [exercise('סקוואט', [done(20, 8)])] }))
    historyOf('סקוואט')

    expect(sessionRow(await screen.findByText('יום ב׳ 12.10'))).toHaveClass('session-record')
    expect(sessionRow(screen.getByText('יום ב׳ 19.10'))).not.toHaveClass('session-record')
  })

  it('draws each session’s bar as long as its best weight, from a third for the lightest to full for the heaviest', async () => {
    await saveWorkout(workout({ id: 'w1', startedAt: oct(12), exercises: [exercise('סקוואט', [done(20, 10)])] }))
    await saveWorkout(workout({ id: 'w2', startedAt: oct(19), exercises: [exercise('סקוואט', [done(21, 10)])] }))
    await saveWorkout(workout({ id: 'w3', startedAt: oct(26, 8), exercises: [exercise('סקוואט', [done(24, 8)])] }))
    historyOf('סקוואט')

    const heaviest = sessionRow(await screen.findByText('יום ב׳ 26.10'))

    expect(barOf(heaviest)).toHaveStyle({ width: '100%' })
    expect(barOf(sessionRow(screen.getByText('יום ב׳ 19.10')))).toHaveStyle({ width: '50%' })
    expect(barOf(sessionRow(screen.getByText('יום ב׳ 12.10')))).toHaveStyle({ width: `${(1 / 3) * 100}%` })
  })
})
