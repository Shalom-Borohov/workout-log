import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../src/data/db'
import { saveRoutine } from '../../src/data/repo'
import { freezeDate } from '../helpers/clock'
import { resetDb } from '../helpers/db'
import { ionElement } from '../helpers/ionic'
import { renderAt } from '../helpers/renderAt'
import { dailyLog, dailyRoutine, oct, reps, seconds } from '../helpers/workouts'

const drills = {
  ...dailyRoutine('d1', 'חטיפי תנועה', [[{ name: 'גשר ישבן', target: reps(15) }], [{ name: 'פלאנק', target: seconds(30) }]]),
  createdAt: oct(20),
}

const dayButton = (name: string) => screen.findByRole('button', { name })

describe('daily routine rows', () => {
  beforeEach(resetDb)
  freezeDate(oct(26, 12))

  it('archiving a row from its swipe hides it, and its days stay in the calendar', async () => {
    await saveRoutine(drills)
    await db.dailyLogs.put(dailyLog('d1', '2026-10-25'))
    renderAt('/tabs/daily')

    fireEvent.click(await screen.findByText('ארכיון', { selector: 'ion-item-option' }))

    await waitFor(async () => expect((await db.routines.get('d1'))?.archived).toBe(true))
    await waitFor(() => expect(screen.queryByText('חטיפי תנועה', { selector: 'h2' })).not.toBeInTheDocument())
    expect(await dayButton('יום א׳ 25.10, חטיפי תנועה')).toBeInTheDocument()
    expect(screen.queryByText('עוד אין אימון יומי')).not.toBeInTheDocument()
  })

  it('a full swipe on a row archives it', async () => {
    await saveRoutine(drills)
    renderAt('/tabs/daily')

    expect(await screen.findByText('ארכיון', { selector: 'ion-item-option' })).toBeInTheDocument()
    fireEvent(await ionElement('ion-item-options'), new CustomEvent('ionSwipe', { detail: { side: 'end' }, bubbles: true }))

    await waitFor(async () => expect((await db.routines.get('d1'))?.archived).toBe(true))
  })

  it('the routine rows come before the calendar, newest first', async () => {
    await saveRoutine(drills)
    await saveRoutine({ ...dailyRoutine('d2', 'מתיחות', [], { color: 'blue' }), createdAt: oct(22) })
    renderAt('/tabs/daily')

    const calendar = await screen.findByText('אוקטובר 2026')
    const names = await screen.findAllByText(/^(מתיחות|חטיפי תנועה)$/, { selector: 'h2' })

    expect(names.map((name) => name.textContent)).toEqual(['מתיחות', 'חטיפי תנועה'])
    expect(names[1].compareDocumentPosition(calendar) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('the "בארכיון" row shows only when something is archived, between the rows and the calendar', async () => {
    await saveRoutine(drills)
    renderAt('/tabs/daily')

    const calendar = await screen.findByText('אוקטובר 2026')

    expect(screen.queryByText('בארכיון')).not.toBeInTheDocument()

    await saveRoutine({ ...dailyRoutine('d2', 'מתיחות', [], { color: 'blue', archived: true }), createdAt: oct(22) })
    const archiveRow = await screen.findByText('בארכיון')
    const row = await screen.findByText('חטיפי תנועה', { selector: 'h2' })

    expect(archiveRow).toHaveTextContent(/^בארכיון$/)
    expect(row.compareDocumentPosition(archiveRow) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(archiveRow.compareDocumentPosition(calendar) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
})
