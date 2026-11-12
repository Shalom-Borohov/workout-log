import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { setActivityNote } from '../../src/data/activityDetails'
import { saveRecord } from '../../src/data/repo'
import { freezeDate } from '../helpers/clock'
import { resetDb } from '../helpers/db'
import { expectInOrder, ionField, ionInput, OPEN_MODAL } from '../helpers/ionic'
import { currentPath, renderAt } from '../helpers/renderAt'
import { activity, oct } from '../helpers/workouts'

const THAI_BOXING = 'אגרוף תאילנדי'

const pagePath = `/tabs/exercises/activity/${encodeURIComponent(THAI_BOXING)}`

async function saveSessions() {
  await saveRecord(activity({ id: 'a1', startedAt: oct(20, 19), location: 'מועדון הגבעה' }))
  await saveRecord(activity({ id: 'a2', startedAt: oct(24, 19, 15), finishedAt: oct(24, 20) }))
  await saveRecord(activity({ id: 'a3', name: 'פילאטיס', startedAt: oct(22, 8), location: 'סטודיו' }))
}

async function fieldRow(label: string) {
  const row = (await screen.findByText(label, { selector: 'ion-label' })).closest('ion-item')

  if (!(row instanceof HTMLElement)) {
    throw new Error(`no ${label} row`)
  }

  return row
}

function sessionRow(day: string) {
  const row = screen.getByText(day).closest('ion-item')

  if (!(row instanceof HTMLElement)) {
    throw new Error(`no session row for ${day}`)
  }

  return row
}

const sheetButton = (text: string) => screen.findByText(text, { selector: 'ion-modal ion-button' })

const sheetClosed = () => waitFor(() => expect(document.querySelector(OPEN_MODAL)).toBeNull())

describe('activity page', () => {
  beforeEach(resetDb)
  freezeDate(oct(26, 12))

  it('opens from its row under the פעילויות tile', async () => {
    await saveSessions()
    renderAt('/tabs/exercises')

    fireEvent.click(await screen.findByText(THAI_BOXING))

    await waitFor(() => expect(currentPath()).toBe(pagePath))
  })

  it('shows the name, the location from history, a note placeholder and the sessions newest first', async () => {
    await saveSessions()
    renderAt(pagePath)

    expect(await screen.findByText(THAI_BOXING, { selector: '.exercise-history-title-text' })).toBeInTheDocument()
    await waitFor(async () => expect(await fieldRow('מיקום')).toHaveTextContent('מועדון הגבעה'))
    expect(await fieldRow('הערה')).toHaveTextContent('הוספת הערה')
    await expectInOrder(['יום ש׳ 24.10', 'יום ג׳ 20.10'])
    expect(within(sessionRow('יום ש׳ 24.10')).getByText('19:15')).toBeInTheDocument()
    expect(within(sessionRow('יום ש׳ 24.10')).getByText('45')).toBeInTheDocument()
    expect(within(sessionRow('יום ג׳ 20.10')).getByText('60')).toBeInTheDocument()
    expect(within(sessionRow('יום ג׳ 20.10')).getByText('דק׳')).toBeInTheDocument()
    expect(screen.queryByText('יום ה׳ 22.10')).not.toBeInTheDocument()
  })

  it('shows the location placeholder when no session has a location', async () => {
    await saveRecord(activity({ id: 'a1', startedAt: oct(20, 19) }))
    renderAt(pagePath)

    expect(await fieldRow('מיקום')).toHaveTextContent('הוספת מיקום')
  })

  it('saves a note from its sheet and shows its first line, also after reopening', async () => {
    await saveSessions()
    const { unmount } = renderAt(pagePath)

    fireEvent.click(await fieldRow('הערה'))
    ionInput(await ionField('הערה'), 'חניה בביאליק\nקומה 2')
    fireEvent.click(await sheetButton('שמירה'))

    await waitFor(async () => expect(await fieldRow('הערה')).toHaveTextContent('חניה בביאליק'))
    expect(await fieldRow('הערה')).not.toHaveTextContent('קומה 2')
    await sheetClosed()

    unmount()
    renderAt(pagePath)

    await waitFor(async () => expect(await fieldRow('הערה')).toHaveTextContent('חניה בביאליק'))
  })

  it('opens the note sheet with the whole note', async () => {
    await saveSessions()
    await setActivityNote(THAI_BOXING, 'חניה בביאליק\nקומה 2')
    renderAt(pagePath)

    fireEvent.click(await fieldRow('הערה'))

    expect(await ionField('הערה')).toHaveProperty('value', 'חניה בביאליק\nקומה 2')
  })

  it('saves a location from its sheet', async () => {
    await saveSessions()
    renderAt(pagePath)

    fireEvent.click(await fieldRow('מיקום'))
    ionInput(await ionField('מיקום'), ' מועדון חדש ')
    fireEvent.click(await sheetButton('שמירה'))

    await waitFor(async () => expect(await fieldRow('מיקום')).toHaveTextContent('מועדון חדש'))
    await sheetClosed()
  })

  it('ביטול closes the sheet without saving', async () => {
    await saveSessions()
    renderAt(pagePath)

    fireEvent.click(await fieldRow('מיקום'))
    ionInput(await ionField('מיקום'), 'מועדון חדש')
    fireEvent.click(await sheetButton('ביטול'))

    await sheetClosed()
    expect(await fieldRow('מיקום')).toHaveTextContent('מועדון הגבעה')
  })
})
