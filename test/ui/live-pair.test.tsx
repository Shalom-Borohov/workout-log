import { screen, waitFor, within } from '@testing-library/react'
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

async function pairSwitch(): Promise<HTMLElement> {
  return waitFor(() => {
    const found = document.querySelector<HTMLElement>('.set-row-current .pair-switch')

    if (!found) {
      throw new Error('no pair switch')
    }

    return found
  })
}

const segment = (name: RegExp, pressed: boolean) => screen.findByRole('button', { name, pressed })

const plateChecks = () => document.querySelectorAll('.set-row-current .set-check')

beforeEach(async () => {
  await resetDb()
})

describe('a pair in a live workout', () => {
  it('puts both exercises in a switch on one plate, the other one with its values', async () => {
    await savePair(exercise('מתח', [open(15, 12), open(15, 12)]), exercise('מקבילים', [open(null, 10), open(null, 10)]))
    renderAt('/tabs/timeline/workout/w1')

    const segments = within(await pairSwitch()).getAllByRole('button')

    expect(segments.map((button) => button.textContent)).toEqual(['מתח', 'מקבילים 10'])
    expect(segments.map((button) => button.getAttribute('aria-pressed'))).toEqual(['true', 'false'])
    expect(await screen.findByLabelText('מתח סט 1 חזרות')).toHaveValue('12')
    expect(screen.queryByLabelText('מקבילים סט 1 חזרות')).not.toBeInTheDocument()
    expect(plateChecks()).toHaveLength(1)
  })

  it('ticking moves the plate to the other exercise, and the ticked one shows its ✓ in the switch', async () => {
    await savePair(exercise('מתח', [open(15, 12), open(15, 12)]), exercise('מקבילים', [open(null, 10), open(null, 10)]))
    const user = userEvent.setup()
    renderAt('/tabs/timeline/workout/w1')

    await user.click(await screen.findByRole('button', { name: 'מתח סט 1', pressed: false }))

    expect(await screen.findByLabelText('מקבילים סט 1 חזרות')).toHaveValue('10')
    expect(await segment(/^מקבילים$/, true)).toBeInTheDocument()

    const ticked = await segment(/^מתח/, false)

    expect(ticked).toHaveTextContent('15 × 12')
    expect(within(ticked).getByRole('img', { name: 'הושלם' })).toBeInTheDocument()
    expect(plateChecks()).toHaveLength(1)
  })

  it('tapping the other part of the switch makes its exercise the active one', async () => {
    await savePair(exercise('מתח', [open(15, 12), open(15, 12)]), exercise('מקבילים', [open(null, 10), open(null, 10)]))
    const user = userEvent.setup()
    renderAt('/tabs/timeline/workout/w1')

    await user.click(await segment(/^מקבילים/, false))

    expect(await screen.findByLabelText('מקבילים סט 1 חזרות')).toHaveValue('10')
    expect(screen.queryByLabelText('מתח סט 1 חזרות')).not.toBeInTheDocument()
    expect(await segment(/^מתח 15 × 12$/, false)).toBeInTheDocument()
    expect(within(await segment(/^מתח/, false)).queryByRole('img', { name: 'הושלם' })).not.toBeInTheDocument()
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

  it('tapping a row moves the plate to its first unticked exercise, or its first when both are done', async () => {
    await savePair(
      exercise('מתח', [done(15, 12), open(15, 12), done(17.5, 10)]),
      exercise('מקבילים', [done(null, 10), open(null, 10), open(null, 8)]),
    )
    const user = userEvent.setup()
    renderAt('/tabs/timeline/workout/w1')

    await user.click(await pairRow('סט 3'))

    expect(await screen.findByLabelText('מקבילים סט 3 חזרות')).toHaveValue('8')
    expect(await segment(/^מקבילים$/, true)).toBeInTheDocument()

    await user.click(await pairRow('סט 1'))

    expect(await screen.findByLabelText('מתח סט 1 חזרות')).toHaveValue('12')
    expect(await segment(/^מתח$/, true)).toBeInTheDocument()
  })

  it('an uneven pair counts the shown exercise’s own sets on its plate', async () => {
    await savePair(exercise('מתח', [open(15, 12)]), exercise('מקבילים', [open(null, 10), open(null, 8)]))
    renderAt('/tabs/timeline/workout/w1')

    expect(await screen.findByLabelText('מתח סט 1 חזרות')).toHaveValue('12')
    expect(screen.getByText('סט 1 מתוך 1')).toBeInTheDocument()
  })

  it('an uneven pair shows no switch for the set only one exercise has, just its name', async () => {
    await savePair(exercise('מתח', [done(15, 12)]), exercise('מקבילים', [open(null, 10), open(null, 8)]))
    const user = userEvent.setup()
    renderAt('/tabs/timeline/workout/w1')

    expect(await screen.findByLabelText('מקבילים סט 1 חזרות')).toHaveValue('10')
    expect(rowValues(await pairRow('סט 2'))).toEqual(['–', '8'])

    await user.click(await pairRow('סט 2'))

    expect(await screen.findByLabelText('מקבילים סט 2 חזרות')).toHaveValue('8')
    expect(document.querySelector('.set-row-current .pair-switch')).toBeNull()
    expect(screen.getByText('מקבילים', { selector: '.set-row-current .pair-name' })).toBeInTheDocument()
  })
})
