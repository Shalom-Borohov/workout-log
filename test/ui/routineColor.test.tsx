import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../src/data/db'
import { saveRoutine } from '../../src/data/repo'
import { resetDb } from '../helpers/db'
import { ionEvent, radioByLabel, visibleAll } from '../helpers/ionic'
import { renderAt } from '../helpers/renderAt'
import { dailyRoutine, reps, routine } from '../helpers/workouts'

const drills = dailyRoutine('d1', 'חטיפי תנועה', [[{ name: 'גשר ישבן', target: reps(15) }]])

const gym = routine('r1', 'אימון גוף מלא', [[{ name: 'סקוואט', target: reps(12) }]])

describe('daily routine colour', () => {
  beforeEach(resetDb)

  it('shows the chosen colour and saves a new one', async () => {
    await saveRoutine(drills)
    renderAt('/tabs/daily/d1')

    expect(await radioByLabel('אדום')).toBeChecked()

    fireEvent.click(await radioByLabel('כחול'))

    await waitFor(async () => expect((await db.routines.get('d1'))?.color).toBe('blue'))
    await waitFor(async () => expect(await radioByLabel('כחול')).toBeChecked())
  })

  it('gives a gym routine turned daily the next free colour', async () => {
    await saveRoutine(drills)
    await saveRoutine(gym)
    renderAt('/tabs/routines/r1')

    const toggle = await screen.findByText('אימון יומי', { selector: 'ion-toggle' })

    expect(visibleAll('input[type="radio"]')).toHaveLength(0)

    ionEvent(toggle, 'ionChange', { checked: true })

    await waitFor(async () => expect((await db.routines.get('r1'))?.color).toBe('orange'))
    expect(await radioByLabel('כתום')).toBeChecked()
  })

  it('takes an archived daily routine out of the archive when it stops being daily', async () => {
    await saveRoutine({ ...drills, archived: true })
    renderAt('/tabs/daily/d1')

    ionEvent(await screen.findByText('אימון יומי', { selector: 'ion-toggle' }), 'ionChange', { checked: false })

    await waitFor(async () => expect(await db.routines.get('d1')).toMatchObject({ daily: false, archived: false, color: 'red' }))
    await waitFor(() => expect(visibleAll('input[type="radio"]')).toHaveLength(0))
  })
})
