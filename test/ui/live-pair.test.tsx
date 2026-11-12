import { screen, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { saveWorkout } from '../../src/data/repo'
import type { WorkoutExercise } from '../../src/domain/types'
import { resetDb } from '../helpers/db'
import { renderAt } from '../helpers/renderAt'
import { done, exercise, oct, open, workout } from '../helpers/workouts'

async function savePair(first: WorkoutExercise, second: WorkoutExercise) {
  const base = workout({ id: 'w1', startedAt: oct(26), finishedAt: null, exercises: [] })

  await saveWorkout({ ...base, sections: [{ name: 'סופר סט', items: [{ id: 'p', exercises: [first, second] }] }] })
}

async function pairRow(setTitle: string): Promise<HTMLElement> {
  const title = await screen.findByText(setTitle, { selector: '.set-select .set-title' })
  const row = title.closest<HTMLElement>('.set-select')

  if (!row) {
    throw new Error(`no row for ${setTitle}`)
  }

  return row
}

const rowValues = (row: HTMLElement) => Array.from(row.querySelectorAll('.set-value'), (value) => value.textContent)

beforeEach(async () => {
  await resetDb()
})

describe('a pair in a live workout', () => {
  it('tapping the waiting tile makes its exercise the active one', async () => {
    await savePair(exercise('מתח', [open(15, 12), open(15, 12)]), exercise('מקבילים', [open(null, 10), open(null, 10)]))
    const user = userEvent.setup()
    renderAt('/tabs/timeline/workout/w1')

    expect(await screen.findByLabelText('מתח סט 1 חזרות')).toHaveValue('12')
    expect(screen.queryByLabelText('מקבילים סט 1 חזרות')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'סט 1 · מקבילים' }))

    expect(await screen.findByLabelText('מקבילים סט 1 חזרות')).toHaveValue('10')
    expect(screen.queryByLabelText('מתח סט 1 חזרות')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'סט 1 · מתח' })).toBeInTheDocument()
  })

  it('shows each other set as one row with both values, marked once both are done', async () => {
    await savePair(
      exercise('מתח', [done(15, 12), open(15, 12), open(17.5, 10)]),
      exercise('מקבילים', [done(null, 10), open(null, 10), open(null, 8)]),
    )
    renderAt('/tabs/timeline/workout/w1')

    const first = await pairRow('סט 1')
    const last = await pairRow('סט 3')

    expect(rowValues(first)).toEqual(['15 × 12', '10'])
    expect(within(first).getByRole('img', { name: 'הושלם' })).toBeInTheDocument()
    expect(rowValues(last)).toEqual(['17.5 × 10', '8'])
    expect(within(last).queryByRole('img', { name: 'הושלם' })).not.toBeInTheDocument()
  })

  it('tapping a row moves the tiles to its first unticked exercise, or its first when both are done', async () => {
    await savePair(
      exercise('מתח', [done(15, 12), open(15, 12), done(17.5, 10)]),
      exercise('מקבילים', [done(null, 10), open(null, 10), open(null, 8)]),
    )
    const user = userEvent.setup()
    renderAt('/tabs/timeline/workout/w1')

    await user.click(await pairRow('סט 3'))

    expect(await screen.findByLabelText('מקבילים סט 3 חזרות')).toHaveValue('8')
    expect(screen.getByRole('button', { name: 'סט 3 · מתח' })).toBeInTheDocument()

    await user.click(await pairRow('סט 1'))

    expect(await screen.findByLabelText('מתח סט 1 חזרות')).toHaveValue('12')
    expect(screen.getByRole('button', { name: 'סט 1 · מקבילים' })).toBeInTheDocument()
  })

  it('an uneven pair counts the shown exercise’s own sets in its tile', async () => {
    await savePair(exercise('מתח', [open(15, 12)]), exercise('מקבילים', [open(null, 10), open(null, 8)]))
    renderAt('/tabs/timeline/workout/w1')

    expect(await screen.findByLabelText('מתח סט 1 חזרות')).toHaveValue('12')
    expect(screen.getByText('סט 1 מתוך 1')).toBeInTheDocument()
  })

  it('an uneven pair shows the set only one exercise has, and selects that exercise', async () => {
    await savePair(exercise('מתח', [done(15, 12)]), exercise('מקבילים', [open(null, 10), open(null, 8)]))
    const user = userEvent.setup()
    renderAt('/tabs/timeline/workout/w1')

    expect(await screen.findByLabelText('מקבילים סט 1 חזרות')).toHaveValue('10')
    expect(rowValues(await pairRow('סט 2'))).toEqual(['–', '8'])

    await user.click(await pairRow('סט 2'))

    expect(await screen.findByLabelText('מקבילים סט 2 חזרות')).toHaveValue('8')
    expect(screen.queryByRole('button', { name: /^סט 2 · / })).not.toBeInTheDocument()
  })
})
