import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { saveRecord, saveWorkout } from '../../src/data/repo'
import { freezeDate } from '../helpers/clock'
import { resetDb } from '../helpers/db'
import { chooseFile } from '../helpers/files'
import { renderAt } from '../helpers/renderAt'
import { activity, done, exercise, oct, workout } from '../helpers/workouts'

const squats = [exercise('סקוואט', [done(40, 12)])]

describe('restore preview', () => {
  beforeEach(resetDb)
  freezeDate(oct(26, 9, 30))

  it('compares the workouts in the file with the ones on the phone before importing', async () => {
    await saveWorkout(workout({ id: 'p1', startedAt: oct(18), exercises: squats }))
    await saveWorkout(workout({ id: 'p2', startedAt: oct(24), exercises: squats }))
    await saveRecord(activity({ id: 'p3', startedAt: oct(21) }))
    await saveWorkout(workout({ id: 'live', startedAt: oct(26, 9), finishedAt: null, exercises: squats }))

    const backup = {
      version: 2,
      exportedAt: oct(23),
      routines: [],
      workouts: [workout({ id: 'f1', startedAt: oct(22), exercises: squats })],
      dailyLogs: [],
      exerciseAreas: [],
    }

    renderAt('/tabs/routines/settings')
    chooseFile(await screen.findByLabelText('קובץ גיבוי'), JSON.stringify(backup))

    const message = await screen.findByText(/^בקובץ:/)

    expect(message.textContent).toBe(
      'בקובץ: אימון אחד, האחרון 22.10.2026\nבמכשיר: 3 אימונים, האחרון 24.10.2026\nהייבוא יחליף את כל הנתונים במכשיר.',
    )
    expect(message.closest('ion-alert')).toHaveClass('restore-preview')
  })
})
