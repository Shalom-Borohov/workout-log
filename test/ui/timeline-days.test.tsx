import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { saveRecord, saveWorkout } from '../../src/data/repo'
import { freezeDate } from '../helpers/clock'
import { resetDb } from '../helpers/db'
import { currentPath, renderAt } from '../helpers/renderAt'
import { activity, done, exercise, oct, workout } from '../helpers/workouts'

const squats = (id: string, startedAt: number) => workout({ id, startedAt, exercises: [exercise('סקוואט', [done(40, 12)])] })

async function saveTwoWeeks() {
  await saveWorkout(squats('w-sun', oct(25, 8)))
  await saveRecord(activity({ id: 'a-mon', startedAt: oct(26, 19) }))
  await saveRecord(activity({ id: 'a-tue', startedAt: oct(27, 7) }))
  await saveWorkout(squats('w-tue', oct(27, 18)))
  await saveWorkout(squats('w-prev', oct(20, 8)))
}

async function weekStrip(title: string) {
  await screen.findByText(title, { selector: 'h2' })

  return screen.getByRole('list', { name: title })
}

async function dayButton(name: string) {
  await screen.findByText('השבוע', { selector: 'h2' })

  return screen.getByRole('button', { name })
}

function tileStates(week: HTMLElement) {
  return within(week)
    .getAllByRole('listitem')
    .map((item) => {
      const tile = item.querySelector('.day-tile')

      return tile ? Array.from(tile.classList).filter((name) => name.startsWith('day-tile-')) : []
    })
}

describe('timeline day strip', () => {
  beforeEach(resetDb)
  freezeDate(oct(28, 12))

  it('shows the seven days of each week, Sunday first, coloured by what was done, with today marked', async () => {
    await saveTwoWeeks()
    renderAt('/tabs/timeline')

    const thisWeek = await weekStrip('השבוע')
    const [sunday] = within(thisWeek).getAllByRole('listitem')

    expect(tileStates(thisWeek)).toEqual([
      ['day-tile-gym'],
      ['day-tile-activity'],
      ['day-tile-gym'],
      ['day-tile-none', 'day-tile-today'],
      ['day-tile-none', 'day-tile-future'],
      ['day-tile-none', 'day-tile-future'],
      ['day-tile-none', 'day-tile-future'],
    ])
    expect(within(sunday).getByText('א׳')).toHaveAttribute('aria-hidden', 'true')
    expect(within(sunday).getByText('25')).toHaveAttribute('aria-hidden', 'true')
    expect(within(thisWeek).getByText('יום ד׳ 28.10').closest('[aria-current="date"]')).not.toBeNull()
    expect(tileStates(await weekStrip('שבוע שעבר'))).toEqual([
      ['day-tile-none'],
      ['day-tile-none'],
      ['day-tile-gym'],
      ['day-tile-none'],
      ['day-tile-none'],
      ['day-tile-none'],
      ['day-tile-none'],
    ])
  })

  it('a day with a gym workout and an activity opens the gym workout', async () => {
    await saveTwoWeeks()
    renderAt('/tabs/timeline')

    fireEvent.click(await dayButton('יום ג׳ 27.10 · אימון גוף מלא'))

    await waitFor(() => expect(currentPath()).toBe('/tabs/timeline/w-tue'))
  })

  it('an activity day opens the activity', async () => {
    await saveTwoWeeks()
    renderAt('/tabs/timeline')

    fireEvent.click(await dayButton('יום ב׳ 26.10 · אגרוף תאילנדי'))

    await waitFor(() => expect(currentPath()).toBe('/tabs/timeline/a-mon'))
  })

  it('an empty day is not a button, and still reads out its date', async () => {
    await saveTwoWeeks()
    renderAt('/tabs/timeline')

    const lastWeek = await weekStrip('שבוע שעבר')

    expect(within(lastWeek).getByText('יום ד׳ 21.10').closest('button')).toBeNull()
    expect(within(lastWeek).getAllByRole('button').map((button) => button.getAttribute('aria-label'))).toEqual([
      'יום ג׳ 20.10 · אימון גוף מלא',
    ])
  })
})
