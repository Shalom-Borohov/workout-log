import { useIonRouter } from '@ionic/react'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { saveWorkout } from '../../src/data/repo'
import { resetDb } from '../helpers/db'
import { renderAt } from '../helpers/renderAt'
import { done, exercise, oct, open, workout } from '../helpers/workouts'

function BackGesture() {
  const router = useIonRouter()

  return (
    <button type="button" data-testid="swipe-back" onClick={() => router.goBack()}>
      back
    </button>
  )
}

const renderApp = (path: string) => renderAt(path, <BackGesture />)

const VISIBLE = '.ion-page:not(.ion-page-hidden)'

function visiblePageText() {
  return Array.from(document.querySelectorAll(VISIBLE))
    .map((page) => page.textContent)
    .join(' ')
}

const expectVisible = (text: string) => waitFor(() => expect(visiblePageText()).toContain(text))

const path = () => screen.getByTestId('location').textContent

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
    await expectVisible('תרגיל 1 מתוך 1')
  })

  it('an active workout shows its exercise every time it is re-entered', async () => {
    await saveWorkout(
      workout({ id: 'live', startedAt: oct(26, 11), finishedAt: null, exercises: [exercise('סקוואט', [open(20, 10)])] }),
    )
    renderApp('/tabs/timeline')

    for (let round = 0; round < 3; round++) {
      fireEvent.click(await screen.findByText('אימון בתהליך'))
      await waitFor(() => expect(path()).toBe('/tabs/timeline/workout/live'))
      await expectVisible('תרגיל 1 מתוך 1')

      fireEvent.click(screen.getByTestId('swipe-back'))
      await waitFor(() => expect(path()).toBe('/tabs/timeline'))
      await expectVisible('אימון בתהליך')
    }
  })
})
