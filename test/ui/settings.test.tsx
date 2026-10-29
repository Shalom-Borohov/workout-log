import { fireEvent, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { db } from '../../src/data/db'
import { saveRoutine, saveWorkout } from '../../src/data/repo'
import { freezeDate } from '../helpers/clock'
import { resetDb } from '../helpers/db'
import { ionChange, ionField, ionInput } from '../helpers/ionic'
import { renderAt } from '../helpers/renderAt'
import { done, exercise, oct, reps, routine, workout } from '../helpers/workouts'

const { shrunk } = vi.hoisted(() => ({ shrunk: new Blob(['shrunk'], { type: 'image/jpeg' }) }))

vi.mock('../../src/pages/settings/shrinkPhoto', () => ({ shrinkPhoto: async () => shrunk }))

const legs = routine('r1', 'אימון רגליים', [[{ name: 'סקוואט', target: reps(12) }]])

const past = workout({ id: 'w1', startedAt: oct(20), exercises: [exercise('סקוואט', [done(40, 12)])] })

async function readJson(file: Blob | undefined) {
  if (!file) {
    throw new Error('no file')
  }

  return JSON.parse(await file.text())
}

const { summary: _summary, ...noSummary } = past

const toasts = () => Array.from(document.querySelectorAll('ion-toast'), (toast) => toast.message)

function chooseFile(input: HTMLElement, text: string) {
  fireEvent.change(input, { target: { files: [new File([text], 'backup.json', { type: 'application/json' })] } })
}

describe('settings', () => {
  beforeEach(resetDb)
  freezeDate(oct(26, 9, 30))

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('exports a backup through the share sheet', async () => {
    await saveRoutine(legs)
    await saveWorkout(past)

    const share = vi.fn<(data: ShareData) => Promise<void>>().mockResolvedValue()

    Object.assign(navigator, { share, canShare: () => true })
    renderAt('/tabs/routines/settings')

    fireEvent.click(await screen.findByText('ייצוא גיבוי'))

    await waitFor(() => expect(share).toHaveBeenCalledOnce())

    const files = share.mock.calls[0][0].files

    expect(files?.map((file) => file.name)).toEqual(['workouts-backup-2026-10-26.json'])
    expect(await readJson(files?.[0])).toEqual({
      version: 1,
      exportedAt: new Date(2026, 9, 26, 9, 30).getTime(),
      routines: [legs],
      workouts: [past],
    })
  })

  it('exports the finished workouts as a text file', async () => {
    await saveWorkout(past)
    await saveWorkout(workout({ id: 'live', startedAt: oct(26, 9), finishedAt: null, exercises: [] }))

    const share = vi.fn<(data: ShareData) => Promise<void>>().mockResolvedValue()

    Object.assign(navigator, { share, canShare: () => true })
    renderAt('/tabs/routines/settings')

    fireEvent.click(await screen.findByText('ייצוא היסטוריה'))

    await waitFor(() => expect(share).toHaveBeenCalledOnce())

    const file = share.mock.calls[0][0].files?.[0]

    expect(file).toMatchObject({ name: 'workouts-2026-10-26.txt', type: 'text/plain' })
    expect(await file?.text()).toBe('אימון גוף מלא · יום ג׳ 20.10.2026 · 60 דק׳\nעיקרי\nסקוואט: 40 × 12')
  })

  it('sets and removes the background photo', async () => {
    const put = vi.spyOn(db.settings, 'put')

    renderAt('/tabs/routines/settings')

    expect(await screen.findByText('תמונת רקע')).toBeInTheDocument()
    expect(screen.queryByText('הסרת תמונת הרקע')).not.toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('קובץ תמונת רקע'), {
      target: { files: [new File(['photo'], 'gym.jpg', { type: 'image/jpeg' })] },
    })

    const remove = await screen.findByText('הסרת תמונת הרקע')

    expect(put).toHaveBeenCalledWith({ key: 'background', image: shrunk })

    fireEvent.click(remove)

    await waitFor(() => expect(screen.queryByText('הסרת תמונת הרקע')).not.toBeInTheDocument())
    expect(await db.settings.get('background')).toBeUndefined()
  })

  it('opens a GitHub bug report with the text and device details', async () => {
    const openWindow = vi.spyOn(window, 'open').mockReturnValue(null)

    renderAt('/tabs/routines/settings')
    fireEvent.click(await screen.findByText('דיווח על באג / הצעה'))
    ionInput(await ionField('תיאור'), 'הכפתור לא עובד\nלחצתי פעמיים')
    fireEvent.click(await screen.findByText('פתיחה ב-GitHub'))

    expect(openWindow).toHaveBeenCalledOnce()

    const [url, target] = openWindow.mock.calls[0]
    const { origin, pathname, searchParams } = new URL(String(url))

    expect(target).toBe('_blank')
    expect(`${origin}${pathname}`).toBe('https://github.com/Shalom-Borohov/workout-log/issues/new')
    expect(searchParams.get('title')).toBe('הכפתור לא עובד')
    expect(searchParams.get('labels')).toBe('bug')
    expect(searchParams.get('body')).toBe(
      `הכפתור לא עובד\nלחצתי פעמיים\n\n### מכשיר\n${navigator.userAgent}\nגרסה: ${__BUILD_TIME__}`,
    )
  })

  it('shows when the running version was built', async () => {
    renderAt('/tabs/routines/settings')

    expect(await screen.findByText(/^גרסה \d{4}-\d{2}-\d{2} \d{2}:\d{2}$/)).toBeInTheDocument()
  })

  it('opens a suggestion with a shortened title, only once there is text', async () => {
    const openWindow = vi.spyOn(window, 'open').mockReturnValue(null)
    const idea = 'כדאי להוסיף גרף התקדמות שבועי לכל תרגיל, עם השוואה לחודש הקודם ולשיא האישי שלי בתרגיל'

    renderAt('/tabs/routines/settings')
    fireEvent.click(await screen.findByText('דיווח על באג / הצעה'))
    ionChange(await screen.findByText('הצעה', { selector: 'ion-segment-button ion-label' }), 'idea')

    expect((await screen.findByText('פתיחה ב-GitHub')).closest('ion-button')).toHaveProperty('disabled', true)

    ionInput(await ionField('תיאור'), idea)
    fireEvent.click(screen.getByText('פתיחה ב-GitHub'))

    const { searchParams } = new URL(String(openWindow.mock.calls[0][0]))

    expect(searchParams.get('labels')).toBe('enhancement')
    expect(searchParams.get('title')).toBe(`${idea.slice(0, 79)}…`)
  })

  it('downloads the backup when sharing files is unsupported', async () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    Object.assign(navigator, { canShare: () => false })
    Object.assign(URL, { createObjectURL: () => 'blob:backup', revokeObjectURL: () => {} })
    renderAt('/tabs/routines/settings')

    fireEvent.click(await screen.findByText('ייצוא גיבוי'))

    await waitFor(() => expect(click).toHaveBeenCalledOnce())
    expect(click.mock.contexts[0]).toMatchObject({ download: 'workouts-backup-2026-10-26.json', href: 'blob:backup' })
  })

  it('imports a backup after confirming', async () => {
    await saveRoutine(routine('old', 'אימון ישן', []))

    const backup = { version: 1, exportedAt: oct(25), routines: [legs], workouts: [past] }

    renderAt('/tabs/routines/settings')
    chooseFile(await screen.findByLabelText('קובץ גיבוי'), JSON.stringify(backup))

    expect(await screen.findByText('הייבוא יחליף את כל הנתונים')).toBeInTheDocument()
    fireEvent.click(screen.getByText('ייבוא', { selector: '.alert-button *' }))

    await waitFor(() => expect(toasts()).toContain('הגיבוי שוחזר'))
    expect(await db.routines.toArray()).toEqual([legs])
    expect(await db.workouts.toArray()).toEqual([past])
  })

  it.each([
    ['not JSON', () => 'not json'],
    ['a workout without summary', () => JSON.stringify({ version: 1, exportedAt: 1, routines: [], workouts: [noSummary] })],
  ])('invalid backup (%s) shows an error and leaves data intact', async (_case, text) => {
    await saveRoutine(legs)
    await saveWorkout(past)
    renderAt('/tabs/routines/settings')

    chooseFile(await screen.findByLabelText('קובץ גיבוי'), text())

    await waitFor(() => expect(toasts()).toEqual(['קובץ הגיבוי לא תקין']))
    expect(screen.queryByText('הייבוא יחליף את כל הנתונים')).not.toBeInTheDocument()
    expect(await db.routines.toArray()).toEqual([legs])
    expect(await db.workouts.toArray()).toEqual([past])
  })
})

