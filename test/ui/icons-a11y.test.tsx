import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { saveRoutine, saveWorkout } from '../../src/data/repo'
import { resetDb } from '../helpers/db'
import { heading } from '../helpers/live'
import { renderAt } from '../helpers/renderAt'
import { dailyRoutine, exercise, oct, open, reps, routine, workout } from '../helpers/workouts'

const gym = routine('r1', 'אימון גוף מלא', [[{ name: 'סקוואט', target: reps(12) }]])

const drills = dailyRoutine('d1', 'חטיפי תנועה', [[{ name: 'גשר ישבן', target: reps(15) }]])

const running = workout({ id: 'w1', startedAt: oct(26), finishedAt: null, exercises: [exercise('סקוואט', [open(60, 10)])] })

const unnamedIcons = () =>
  Array.from(document.querySelectorAll('ion-icon')).filter(
    (icon) => !icon.hasAttribute('aria-hidden') && !icon.hasAttribute('aria-label'),
  )

describe('icons for screen readers', () => {
  beforeEach(async () => {
    await resetDb()
    await saveRoutine(gym)
    await saveRoutine(drills)
  })

  it.each([
    ['the timeline', '/tabs/timeline', 'התחל אימון'],
    ['the routines list', '/tabs/routines', 'התחל'],
    ['the daily tab', '/tabs/daily', 'חטיפי תנועה'],
    ['the exercises tab', '/tabs/exercises', 'תרגילים'],
    ['settings', '/tabs/timeline/settings', 'ייצוא היסטוריה'],
    ['the routine editor', '/tabs/routines/r1', 'סקוואט'],
  ])('%s has no unnamed icon', async (_, path, text) => {
    renderAt(path)

    await screen.findAllByText(text)

    expect(unnamedIcons()).toEqual([])
  })

  it('a live workout has no unnamed icon', async () => {
    await saveWorkout(running)
    renderAt('/tabs/timeline/workout/w1')

    await heading('סקוואט')

    expect(unnamedIcons()).toEqual([])
  })
})
