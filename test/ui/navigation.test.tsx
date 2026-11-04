import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { saveRoutine, saveWorkout } from '../../src/data/repo'
import { BackGesture } from '../helpers/BackGesture'
import { resetDb } from '../helpers/db'
import { renderAt } from '../helpers/renderAt'
import { done, exercise, oct, open, reps, routine, workout } from '../helpers/workouts'

const renderApp = (path: string) => renderAt(path, <BackGesture />)

const VISIBLE = '.ion-page:not(.ion-page-hidden)'

function visiblePageText() {
  return Array.from(document.querySelectorAll(VISIBLE))
    .map((page) => page.textContent)
    .join(' ')
}

const expectVisible = (text: string) => waitFor(() => expect(visiblePageText()).toContain(text))

const path = () => screen.getByTestId('location').textContent

function tabButton(tab: string): Element {
  const button = document.querySelector(`ion-tab-button[tab="${tab}"]`)

  if (!button) {
    throw new Error(`no tab button ${tab}`)
  }

  return button
}

describe('navigation round trips', () => {
  beforeEach(resetDb)

  it('a finished workout opens again after going back, repeatedly', async () => {
    await saveWorkout(workout({ id: 'w1', startedAt: oct(20), exercises: [exercise('סקוואט', [done(40, 12)])] }))
    renderApp('/tabs/timeline')

    for (let round = 0; round < 3; round++) {
      fireEvent.click(await screen.findByText('אימון גוף מלא', { selector: `${VISIBLE} ion-item h2, ${VISIBLE} ion-item *` }))
      await waitFor(() => expect(path()).toBe('/tabs/timeline/w1'))
      await expectVisible('עריכה')

      fireEvent.click(screen.getByTestId('swipe-back'))
      await waitFor(() => expect(path()).toBe('/tabs/timeline'))
      await expectVisible('ציר זמן')
    }
  })

  it.each(['/workout/live', '/tabs/workout/live'])('a workout link from a previous version (%s) still opens the workout', async (link) => {
    await saveWorkout(
      workout({ id: 'live', startedAt: oct(26, 11), finishedAt: null, exercises: [exercise('סקוואט', [open(20, 10)])] }),
    )
    renderApp(link)

    await waitFor(() => expect(path()).toBe('/tabs/timeline/workout/live'))
    await expectVisible('עיקרי · 1 מתוך 1')
  })

  it('the routines tab shows its list again after finishing a workout started from it', async () => {
    await saveRoutine(routine('r1', 'אימון רגליים', [[{ name: 'סקוואט', target: reps(10) }]]))
    renderApp('/tabs/routines')

    fireEvent.click(await screen.findByText('התחל', { selector: `${VISIBLE} ion-button` }))
    await waitFor(() => expect(path()).toMatch(/^\/tabs\/routines\/workout\//))
    fireEvent.click(await screen.findByText('סיום', { selector: `${VISIBLE} ion-button` }))
    fireEvent.click(await screen.findByText('שמירה', { selector: 'ion-modal ion-button' }))
    await waitFor(() => expect(path()).toMatch(/^\/tabs\/timeline\/[^/]+$/))
    await expectVisible('עריכה')

    fireEvent.click(tabButton('routines'))

    await waitFor(() => expect(path()).toBe('/tabs/routines'))
    await expectVisible('התחל')
  })

  it('the routines tab shows its list again after deleting a workout started from it', async () => {
    await saveRoutine(routine('r1', 'אימון רגליים', [[{ name: 'סקוואט', target: reps(10) }]]))
    renderApp('/tabs/routines')

    fireEvent.click(await screen.findByText('התחל', { selector: `${VISIBLE} ion-button` }))
    await waitFor(() => expect(path()).toMatch(/^\/tabs\/routines\/workout\//))
    fireEvent.click(await screen.findByText('סיום', { selector: `${VISIBLE} ion-button` }))
    fireEvent.click(await screen.findByText('מחיקת האימון'))
    fireEvent.click(await screen.findByText('מחיקה', { selector: '.alert-button-inner' }))
    await waitFor(() => expect(path()).toBe('/tabs/timeline'))
    await expectVisible('ציר זמן')

    fireEvent.click(tabButton('routines'))

    await waitFor(() => expect(path()).toBe('/tabs/routines'))
    await expectVisible('התחל')
  })

  it('an active workout shows its exercise every time it is re-entered', async () => {
    await saveWorkout(
      workout({ id: 'live', startedAt: oct(26, 11), finishedAt: null, exercises: [exercise('סקוואט', [open(20, 10)])] }),
    )
    renderApp('/tabs/timeline')

    for (let round = 0; round < 3; round++) {
      fireEvent.click(await screen.findByText('אימון בתהליך'))
      await waitFor(() => expect(path()).toBe('/tabs/timeline/workout/live'))
      await expectVisible('עיקרי · 1 מתוך 1')

      fireEvent.click(screen.getByTestId('swipe-back'))
      await waitFor(() => expect(path()).toBe('/tabs/timeline'))
      await expectVisible('אימון בתהליך')
    }
  })
})
