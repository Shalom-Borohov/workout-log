import { render, screen } from '@testing-library/react'
import { App } from '../../src/App'
import { db } from '../../src/data/db'

export const RECOVERY_HEADING = 'משהו השתבש'

export const finishedWithoutSections = JSON.parse(
  '{"kind":"routine","id":"bad","routineId":"r1","routineName":"x","startedAt":1000,"finishedAt":2000,"summary":""}',
)

export async function openOnBadRecord() {
  await db.workouts.bulkPut([finishedWithoutSections])
  window.location.hash = '#/tabs/timeline'
  render(<App />)

  return screen.findByRole('heading', { name: RECOVERY_HEADING })
}
