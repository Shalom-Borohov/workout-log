import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from '../../src/App'
import { db } from '../../src/data/db'
import { saveWorkout } from '../../src/data/repo'
import { resetDb } from '../helpers/db'
import { finishedWithoutSections, openOnBadRecord, RECOVERY_HEADING } from '../helpers/recovery'
import { mockShare } from '../helpers/share'
import { done, exercise, oct, workout } from '../helpers/workouts'

const EXPORT_BUTTON = 'ייצוא גיבוי'

const sound = workout({ id: 'good', startedAt: oct(26), exercises: [exercise('סקוואט', [done(60, 10)])] })

async function sharedFileText(share: ReturnType<typeof mockShare>) {
  const [data] = share.mock.calls[0]
  const [file] = data.files ?? []

  return file.text()
}

async function openOnStoredRecords() {
  await saveWorkout(sound)

  return openOnBadRecord()
}

describe('a malformed stored record', () => {
  beforeEach(async () => {
    await resetDb()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
    window.location.hash = ''
  })

  it('shows the recovery screen instead of a blank page', async () => {
    expect(await openOnStoredRecords()).toBeVisible()
  })

  it('exports every stored record from the recovery screen, the bad one included', async () => {
    const share = mockShare()

    await openOnStoredRecords()
    fireEvent.click(screen.getByRole('button', { name: EXPORT_BUTTON }))
    await waitFor(() => expect(share).toHaveBeenCalledOnce())

    const exported = JSON.parse(await sharedFileText(share))

    expect(exported.workouts.map((record: { id: string }) => record.id).sort()).toEqual(['bad', 'good'])
  })

  it('says at export time that the file holds a record that cannot be restored', async () => {
    mockShare()

    await openOnStoredRecords()
    fireEvent.click(screen.getByRole('button', { name: EXPORT_BUTTON }))

    expect(await screen.findByText('בגיבוי יש רשומה פגומה אחת, וייבוא הקובץ ייכשל')).toBeVisible()
  })

  it('reports a failed export in Hebrew on the recovery screen', async () => {
    mockShare().mockRejectedValue(new Error('share failed'))

    await openOnStoredRecords()
    fireEvent.click(screen.getByRole('button', { name: EXPORT_BUTTON }))

    expect(await screen.findByText('הפעולה נכשלה')).toBeVisible()
  })

  it('says only the backup date failed when the file was already shared', async () => {
    mockShare()

    await openOnStoredRecords()
    vi.spyOn(db.settings, 'put').mockRejectedValue(new DOMException('Connection lost', 'UnknownError'))
    fireEvent.click(screen.getByRole('button', { name: EXPORT_BUTTON }))

    expect(await screen.findByText('לא נשמר. אפשר לנסות שוב.')).toBeVisible()
    expect(screen.queryByText('הפעולה נכשלה')).not.toBeInTheDocument()
  })

  it('never changes what is stored', async () => {
    await openOnStoredRecords()

    expect(await db.workouts.get('bad')).toEqual(finishedWithoutSections)
    expect(await db.workouts.get('good')).toEqual(sound)
  })

  it('offers a reload', async () => {
    await openOnStoredRecords()

    expect(screen.getByRole('button', { name: 'טעינה מחדש' })).toBeVisible()
  })

  it('reloads at the start, so the page that could not draw does not open again', async () => {
    await openOnStoredRecords()
    fireEvent.click(screen.getByRole('button', { name: 'טעינה מחדש' }))

    expect(window.location.hash).toBe('')
  })
})

describe('the app with sound records', () => {
  beforeEach(resetDb)

  afterEach(() => {
    window.location.hash = ''
  })

  it('does not show the recovery screen', async () => {
    await saveWorkout(sound)
    window.location.hash = '#/tabs/timeline'
    render(<App />)

    expect(await screen.findByText('ציר זמן', { selector: 'ion-tab-button ion-label' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: RECOVERY_HEADING })).not.toBeInTheDocument()
  })
})
