import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from '../../src/App'
import { db } from '../../src/data/db'
import { saveWorkout } from '../../src/data/repo'
import { feedbackUrl } from '../../src/pages/settings/feedbackUrl'
import { resetDb } from '../helpers/db'
import { renderAt } from '../helpers/renderAt'
import { mockShare } from '../helpers/share'
import { exercise, oct, open, workout } from '../helpers/workouts'

const reportBody = () => new URL(feedbackUrl('bug', 'דיווח')).searchParams.get('body')

const expectReportToName = (type: string) => waitFor(() => expect(reportBody()).toContain(`שגיאה אחרונה: ${type} (`))

const emptyBackup = JSON.stringify({ version: 1, exportedAt: oct(25), routines: [], workouts: [] })

const running = workout({ id: 'w1', startedAt: oct(26), finishedAt: null, exercises: [exercise('סקוואט', [open(60, 10)])] })

const noSections = JSON.parse(
  '{"kind":"routine","id":"bad","routineId":"r1","routineName":"x","startedAt":1000,"finishedAt":2000,"summary":""}',
)

describe('a report after a failure that does not show the generic text', () => {
  beforeEach(resetDb)

  afterEach(() => {
    vi.restoreAllMocks()
    window.location.hash = ''
  })

  it('names the error when restoring a backup fails', async () => {
    renderAt('/tabs/routines/settings')
    const input = await screen.findByLabelText('קובץ גיבוי')

    vi.spyOn(db.routines, 'clear').mockRejectedValue(new TypeError('Failed'))
    fireEvent.change(input, { target: { files: [new File([emptyBackup], 'backup.json', { type: 'application/json' })] } })
    fireEvent.click(await screen.findByText('ייבוא', { selector: '.alert-button *' }))

    await expectReportToName('TypeError')
  })

  it('names the error when a tick in a workout fails to save', async () => {
    await saveWorkout(running)
    renderAt('/tabs/timeline/workout/w1')
    const check = await screen.findByRole('button', { name: 'סקוואט סט 1', pressed: false })

    vi.spyOn(db.workouts, 'put').mockRejectedValue(new RangeError('Failed'))
    fireEvent.click(check)

    await expectReportToName('RangeError')
  })

  it('names the error when the backup date fails to save after a share', async () => {
    mockShare()
    renderAt('/tabs/routines/settings')
    const button = await screen.findByText('ייצוא גיבוי')

    vi.spyOn(db.settings, 'put').mockRejectedValue(new SyntaxError('Failed'))
    fireEvent.click(button)

    await expectReportToName('SyntaxError')
  })

  it('names the error when a page cannot draw', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    await db.workouts.bulkPut([noSections])
    window.location.hash = '#/tabs/timeline'
    render(<App />)

    await screen.findByRole('heading', { name: 'משהו השתבש' })

    await expectReportToName('TypeError')
  })
})
