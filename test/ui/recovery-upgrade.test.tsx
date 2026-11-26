import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import Dexie from 'dexie'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from '../../src/App'
import { db } from '../../src/data/db'
import { RECOVERY_HEADING } from '../helpers/recovery'
import { mockShare, sharedFileText } from '../helpers/share'
import { done, exercise, oct, workout } from '../helpers/workouts'

const VERSION_BEFORE_DAILY_COLOURS = 8

const EXPORT_BUTTON = 'ייצוא גיבוי'

const sound = {
  id: 'r1',
  name: 'אימון רגליים',
  daily: false,
  createdAt: 7,
  updatedAt: 7,
  sections: [
    {
      id: 's1',
      name: 'עיקרי',
      sets: 3,
      items: [{ id: 'i1', sets: null, exercises: [{ name: 'סקוואט', target: { kind: 'reps', reps: 12 }, weight: 40, tip: '' }] }],
    },
  ],
}

const withoutSections = { id: 'bad', name: 'שבור', daily: false, createdAt: 8, updatedAt: 8 }

const logged = workout({ id: 'w1', startedAt: oct(26), exercises: [exercise('סקוואט', [done(40, 12)])] })

async function seedVersion8() {
  const legacyDb = new Dexie(db.name)

  legacyDb.version(VERSION_BEFORE_DAILY_COLOURS).stores({
    routines: 'id, createdAt',
    workouts: 'id, startedAt, finishedAt',
    settings: 'key',
    dailyLogs: 'id',
  })
  await legacyDb.table('routines').bulkPut([sound, withoutSections])
  await legacyDb.table('workouts').put(logged)
  legacyDb.close()
}

function openApp() {
  window.location.hash = '#/tabs/timeline'
  render(<App />)

  return screen.findByRole('heading', { name: RECOVERY_HEADING })
}

describe('an upgrade that fails on a bad record', () => {
  beforeEach(async () => {
    await db.delete({ disableAutoOpen: false })
    await seedVersion8()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
    window.location.hash = ''
  })

  it('shows the recovery screen', async () => {
    expect(await openApp()).toBeVisible()
  })

  it('exports every stored record as it is, the bad one included', async () => {
    const share = mockShare()

    await openApp()
    fireEvent.click(screen.getByRole('button', { name: EXPORT_BUTTON }))
    await waitFor(() => expect(share).toHaveBeenCalledOnce())

    const exported = JSON.parse(await sharedFileText(share))

    expect(exported.routines).toEqual([withoutSections, sound])
    expect(exported.workouts).toEqual([logged])
    expect(await screen.findByText('בגיבוי יש רשומה פגומה אחת, וייבוא הקובץ ייכשל')).toBeVisible()
  })

  it('does not try to save the backup date, so nothing under the backup reads as a failure', async () => {
    const share = mockShare()

    await openApp()
    fireEvent.click(screen.getByRole('button', { name: EXPORT_BUTTON }))
    await waitFor(() => expect(share).toHaveBeenCalledOnce())
    await screen.findByText('בגיבוי יש רשומה פגומה אחת, וייבוא הקובץ ייכשל')

    expect(screen.queryByText('לא נשמר. אפשר לנסות שוב.')).not.toBeInTheDocument()
    expect(screen.queryByText('הפעולה נכשלה')).not.toBeInTheDocument()
  })

  it('leaves the database at its version with every record as stored', async () => {
    const share = mockShare()

    await openApp()
    fireEvent.click(screen.getByRole('button', { name: EXPORT_BUTTON }))
    await waitFor(() => expect(share).toHaveBeenCalledOnce())

    const stored = await new Dexie(db.name).open()

    expect(stored.verno).toBe(VERSION_BEFORE_DAILY_COLOURS)
    expect(await stored.table('routines').toArray()).toEqual([withoutSections, sound])
    stored.close()
  })
})
