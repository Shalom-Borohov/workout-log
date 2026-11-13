import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../src/data/db'
import { saveRoutine } from '../../src/data/repo'
import { resetDb } from '../helpers/db'
import { ionElement, OPEN_MODAL } from '../helpers/ionic'
import { currentPath, renderAt } from '../helpers/renderAt'
import { dailyRoutine, reps, routine } from '../helpers/workouts'

const gym = routine('r1', 'אימון רגליים', [[{ name: 'סקוואט', target: reps(12) }]])

const drills = dailyRoutine('d1', 'חטיפי תנועה', [[{ name: 'גשר ישבן', target: reps(15) }]])

async function rowOf(text: string) {
  const row = (await screen.findByText(text)).closest('ion-item')

  if (!row) {
    throw new Error(`no row for ${text}`)
  }

  return row
}

describe('rows with a control inside', () => {
  beforeEach(async () => {
    await resetDb()
    await saveRoutine(gym)
    await saveRoutine(drills)
  })

  it('a routine row is not one big button, and its own button opens the routine', async () => {
    renderAt('/tabs/routines')
    const row = await rowOf('אימון רגליים')

    expect(row.button).toBeFalsy()
    fireEvent.click(within(row).getByRole('button', { name: 'אימון רגליים' }))

    await waitFor(() => expect(currentPath()).toBe('/tabs/routines/r1'))
  })

  it('a daily row is not one big button, and its own button opens the routine', async () => {
    renderAt('/tabs/daily')
    const row = await rowOf('חטיפי תנועה')

    expect(row.button).toBeFalsy()
    fireEvent.click(within(row).getByRole('button', { name: 'חטיפי תנועה' }))

    await waitFor(() => expect(currentPath()).toBe('/tabs/daily/d1'))
  })

  it('✓ on a daily row logs today without opening the routine', async () => {
    renderAt('/tabs/daily')
    const row = await rowOf('חטיפי תנועה')

    fireEvent.click(within(row).getByRole('button', { pressed: false }))

    await waitFor(async () => expect(await db.dailyLogs.count()).toBe(1))
    expect(currentPath()).toBe('/tabs/daily')
  })

  it('an editor row is not one big button, and its own button opens the exercise', async () => {
    renderAt('/tabs/routines/r1')
    const row = await rowOf('סקוואט')

    expect(row.button).toBeFalsy()
    fireEvent.click(within(row).getByRole('button', { name: 'סקוואט' }))

    expect(await ionElement(OPEN_MODAL, 'body')).toBeInTheDocument()
  })
})
