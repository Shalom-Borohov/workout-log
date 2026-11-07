import { fireEvent, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { guardTapsDuringTransitions } from '../../src/navigation/tapGuard'
import { resetDb } from '../helpers/db'
import { ionField, ionInput, OPEN_MODAL, toasts } from '../helpers/ionic'
import { pause } from '../helpers/live'
import { renderAt } from '../helpers/renderAt'

const REPORT = 'הכפתור לא עובד'

const WELL_PAST_ANY_EARLIER_TAP_MS = 10_000

const TOAST_SETTLE_MS = 200

const FOOTER = 'הדיווח נפתח ב-GitHub, עם סוג הדפדפן, הגרסה וסוג השגיאה האחרונה. נתוני האימונים לא נשלחים.'

const TOO_LONG = 'הדיווח ארוך מדי לקישור של GitHub. צריך לקצר אותו כדי לפתוח.'

const mainButton = () => screen.getByText('פתיחה ב-GitHub').closest('ion-button')

async function openSheetWith(report: string) {
  renderAt('/tabs/routines/settings')
  fireEvent.click(await screen.findByText('דיווח על באג / הצעה'))
  ionInput(await ionField('תיאור'), report)
}

async function sendReport(opened: Window | null) {
  const openWindow = vi.spyOn(window, 'open').mockReturnValue(opened)

  await openSheetWith(REPORT)
  fireEvent.click(screen.getByText('פתיחה ב-GitHub'))

  return openWindow
}

describe('a second tap on פתיחה ב-GitHub', () => {
  let release = () => {}
  let now = 0

  beforeEach(async () => {
    await resetDb()
    now += WELL_PAST_ANY_EARLIER_TAP_MS
    vi.spyOn(performance, 'now').mockImplementation(() => now)
    Object.defineProperty(document, 'getAnimations', { configurable: true, value: () => [] })
    release = guardTapsDuringTransitions(document)
  })

  afterEach(() => {
    release()
    vi.restoreAllMocks()
  })

  it('opens one draft on a double tap, and lets a later tap try again', async () => {
    const openWindow = await sendReport(window)

    now += 100
    fireEvent.click(screen.getByText('פתיחה ב-GitHub'))

    expect(openWindow).toHaveBeenCalledOnce()

    now += 400
    fireEvent.click(screen.getByText('פתיחה ב-GitHub'))

    expect(openWindow).toHaveBeenCalledTimes(2)
  })
})

describe('the report sheet', () => {
  beforeEach(resetDb)

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('stays open with the text after the tap and offers סיום instead of ביטול', async () => {
    await sendReport(window)

    expect(await screen.findByText('סיום')).toBeInTheDocument()
    expect(screen.queryByText('ביטול')).not.toBeInTheDocument()
    expect(await ionField('תיאור')).toHaveProperty('value', REPORT)
    await waitFor(() => expect(document.querySelector(OPEN_MODAL)).not.toBeNull())
  })

  it('says GitHub did not open and keeps the text when the browser blocks the window', async () => {
    await sendReport(null)

    await waitFor(() => expect(toasts()).toEqual(['GitHub לא נפתח. הטקסט נשאר כאן, אפשר לנסות שוב.']))
    expect(await ionField('תיאור')).toHaveProperty('value', REPORT)
  })

  it('shows no toast when the window opened', async () => {
    const openWindow = await sendReport(window)

    await pause(TOAST_SETTLE_MS)

    expect(openWindow).toHaveBeenCalledOnce()
    expect(toasts()).toEqual([])
  })

  it('closes on סיום and opens again empty, with ביטול back', async () => {
    await sendReport(window)
    fireEvent.click(await screen.findByText('סיום'))

    await waitFor(() => expect(document.querySelector(OPEN_MODAL)).toBeNull())
    await waitFor(() => expect(screen.queryByText('סיום')).not.toBeInTheDocument())

    fireEvent.click(screen.getByText('דיווח על באג / הצעה'))

    expect(await ionField('תיאור')).toHaveProperty('value', '')
    expect(screen.getByText('ביטול')).toBeInTheDocument()
  })

  it('blocks a report too long for the link, in the same status line, until it is shortened', async () => {
    await openSheetWith(REPORT)

    const note = screen.getByText(FOOTER)
    const field = await ionField('תיאור')

    expect(note).toHaveAttribute('role', 'status')

    ionInput(field, 'א'.repeat(1000))

    expect(note).toHaveTextContent(TOO_LONG)
    expect(note).toHaveProperty('color', 'danger')
    expect(mainButton()).toHaveProperty('disabled', true)

    ionInput(field, 'א'.repeat(100))

    expect(note).toHaveTextContent(FOOTER)
    expect(note).toHaveProperty('color', undefined)
    expect(mainButton()).toHaveProperty('disabled', false)
  })
})
