import { fireEvent, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { saveRecord, saveRoutine } from '../../src/data/repo'
import { freezeDate } from '../helpers/clock'
import { resetDb } from '../helpers/db'
import { expectInOrder, ionElement, ionInput } from '../helpers/ionic'
import { renderAt } from '../helpers/renderAt'
import { activity, oct, reps, routine } from '../helpers/workouts'

const AREA_TILES = { name: 'אזור בגוף ופעילויות' }

const fullBody = routine('r1', 'אימון גוף מלא', [[{ name: 'סקוואט', target: reps(10) }]])

async function saveActivities() {
  await saveRecord(activity({ id: 'a1', name: 'אגרוף תאילנדי', startedAt: oct(20, 19) }))
  await saveRecord(activity({ id: 'a2', name: 'פילאטיס', startedAt: oct(22, 8) }))
  await saveRecord(activity({ id: 'a3', name: 'אגרוף תאילנדי', startedAt: oct(24, 19) }))
}

const activityRow = (name: string) => screen.getByText(name, { selector: 'h2' }).closest('ion-item')

describe('activities tile', () => {
  beforeEach(resetDb)
  freezeDate(oct(26, 12))

  it('shows a פעילויות tile after the area tiles with the number of activities', async () => {
    await saveRoutine(fullBody)
    await saveActivities()
    renderAt('/tabs/exercises')

    const tile = await screen.findByRole('button', { name: 'פעילויות, 2' })
    const tiles = within(screen.getByRole('group', AREA_TILES)).getAllByRole('button')

    expect(tiles).toHaveLength(2)
    expect(tiles.at(-1)).toBe(tile)
    expect(tile).toHaveAttribute('aria-pressed', 'false')
    expect(within(tile).getByText('2')).toBeInTheDocument()
  })

  it('has no פעילויות tile without activities', async () => {
    await saveRoutine(fullBody)
    renderAt('/tabs/exercises')

    await screen.findByText('סקוואט')
    expect(screen.queryByRole('button', { name: /פעילויות/ })).not.toBeInTheDocument()
  })

  it('selecting the tile lists the activities newest first, each with its last date, instead of the exercises', async () => {
    await saveRoutine(fullBody)
    await saveActivities()
    renderAt('/tabs/exercises')

    fireEvent.click(await screen.findByRole('button', { name: 'פעילויות, 2' }))

    await expectInOrder(['אגרוף תאילנדי', 'פילאטיס'])
    expect(screen.getByRole('button', { name: 'פעילויות, 2' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.queryByText('סקוואט')).not.toBeInTheDocument()
    expect(activityRow('אגרוף תאילנדי')).toHaveTextContent('יום ש׳ 24.10')
    expect(activityRow('פילאטיס')).toHaveTextContent('יום ה׳ 22.10')
  })

  it('with activities and no exercises, shows only the פעילויות tile, selected, and no empty state', async () => {
    await saveActivities()
    renderAt('/tabs/exercises')

    const tile = await screen.findByRole('button', { name: 'פעילויות, 2' })

    expect(within(screen.getByRole('group', AREA_TILES)).getAllByRole('button')).toEqual([tile])
    expect(tile).toHaveAttribute('aria-pressed', 'true')
    expect(await screen.findByText('פילאטיס')).toBeInTheDocument()
    expect(screen.queryByText('עוד אין תרגילים')).not.toBeInTheDocument()
  })

  it('search lists matching activities under פעילויות, after the area groups', async () => {
    await saveRoutine(routine('r1', 'אימון', [[{ name: 'פיתולי בטן', target: reps(10) }]]))
    await saveActivities()
    renderAt('/tabs/exercises')
    await screen.findByText('פיתולי בטן')

    ionInput(await ionElement('ion-searchbar'), 'פי')

    await expectInOrder(['ללא', 'פיתולי בטן', 'פעילויות', 'פילאטיס'])
    expect(screen.queryByText('אגרוף תאילנדי')).not.toBeInTheDocument()
  })

  it('search that matches only an activity shows no empty state', async () => {
    await saveRoutine(fullBody)
    await saveActivities()
    renderAt('/tabs/exercises')
    await screen.findByText('סקוואט')

    ionInput(await ionElement('ion-searchbar'), 'אגרוף')

    expect(await screen.findByText('אגרוף תאילנדי')).toBeInTheDocument()
    expect(screen.queryByText(/אין תוצאות/)).not.toBeInTheDocument()
  })
})
