import { screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { saveWorkout } from '../../src/data/repo'
import { freezeDate } from '../helpers/clock'
import { resetDb } from '../helpers/db'
import { renderAt } from '../helpers/renderAt'
import { done, exercise, oct, workout } from '../helpers/workouts'

const ANY_BADGE = /^(שיפור|שיא חדש)$/

async function itemOf(title: string, selector: 'h2' | 'h3') {
  const item = (await screen.findByText(title, { selector })).closest('ion-item')
  if (!item) {
    throw new Error(`no item for ${title}`)
  }

  return item
}

async function saveImprovingHistory() {
  await saveWorkout(
    workout({
      id: 'w0',
      startedAt: oct(5),
      exercises: [exercise('סקוואט', [done(25, 10)]), exercise('לחיצה', [done(28, 8)]), exercise('חתירה', [done(30, 10)])],
    }),
  )
  await saveWorkout(workout({ id: 'w1', startedAt: oct(19), exercises: [exercise('סקוואט', [done(20, 10)])] }))
  await saveWorkout(
    workout({
      id: 'w2',
      startedAt: oct(26, 8),
      finishedAt: oct(26, 8, 45),
      exercises: [exercise('סקוואט', [done(22, 10)]), exercise('לחיצה', [done(30, 8)]), exercise('חתירה', [done(30, 10)])],
    }),
  )
}

describe('timeline cards', () => {
  beforeEach(resetDb)
  freezeDate(oct(26, 12))

  it('counts improvements instead of naming them', async () => {
    const names = ['סקוואט', 'לחיצה', 'חתירה', 'מתח']
    await saveWorkout(workout({ id: 'w0', startedAt: oct(19), exercises: names.map((name) => exercise(name, [done(20, 10)])) }))
    await saveWorkout(workout({ id: 'w1', startedAt: oct(26, 8), exercises: names.map((name) => exercise(name, [done(20, 12)])) }))
    renderAt('/tabs/timeline')

    const improved = await screen.findAllByLabelText('שיפור')

    expect(improved).toHaveLength(1)
    expect(improved[0].parentElement).toHaveTextContent(/^4$/)
    expect(screen.queryByText(/סקוואט/)).not.toBeInTheDocument()
  })

  it('shows improvements before new bests in the stats line', async () => {
    await saveImprovingHistory()
    renderAt('/tabs/timeline')

    const badges = await screen.findAllByLabelText(ANY_BADGE)

    expect(badges.map((icon) => icon.getAttribute('aria-label'))).toEqual(['שיפור', 'שיא חדש'])
    expect(badges.map((icon) => icon.parentElement?.textContent)).toEqual(['1', '1'])
  })

  it('shows the weekday and day number in a column, and reads out the full date', async () => {
    await saveWorkout(workout({ id: 'w1', startedAt: oct(26, 8), exercises: [exercise('סקוואט', [done(20, 10)])] }))
    renderAt('/tabs/timeline')

    const card = within(await itemOf('אימון גוף מלא', 'h2'))

    expect(card.getByText('ב׳')).toHaveAttribute('aria-hidden', 'true')
    expect(card.getByText('26')).toHaveAttribute('aria-hidden', 'true')
    expect(card.getByText('יום ב׳ 26.10')).not.toHaveAttribute('aria-hidden')
  })

  it('detail page marks each improved exercise and new best with its value', async () => {
    await saveImprovingHistory()
    renderAt('/tabs/timeline/w2')

    expect(within(await itemOf('סקוואט', 'h3')).getByLabelText('שיפור').parentElement).toHaveTextContent(/^22 ק״ג$/)
    expect(within(await itemOf('לחיצה', 'h3')).getByLabelText('שיא חדש').parentElement).toHaveTextContent(/^30 ק״ג$/)
    expect(within(await itemOf('חתירה', 'h3')).queryByLabelText(ANY_BADGE)).not.toBeInTheDocument()
  })

  it('leaves the summary to the detail page', async () => {
    await saveWorkout({
      ...workout({ id: 'w1', startedAt: oct(26, 8), exercises: [exercise('סקוואט', [done(20, 10)])] }),
      summary: 'הרגשתי חזק\nהברך קצת כאבה',
    })
    renderAt('/tabs/timeline')

    expect(await screen.findByText('אימון גוף מלא', { selector: 'h2' })).toBeInTheDocument()
    expect(screen.queryByText(/הרגשתי חזק/)).not.toBeInTheDocument()
  })
})
