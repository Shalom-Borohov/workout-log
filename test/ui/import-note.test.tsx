import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../src/data/db'
import { resetDb } from '../helpers/db'
import { ionField, ionInput } from '../helpers/ionic'
import { currentPath, renderAt } from '../helpers/renderAt'
import { reps, seconds } from '../helpers/workouts'

const NOTE = `אימון גוף מלא
חימום 2 סטים:
אופניים 5 דקות

עיקרי 3 סטים:
סקוואט 12 -> לחיצת כתפיים 10
מתח
`

const UNCLEAR_AMOUNT_HINT = 'בתרגיל עם ? המספר חסר או לא ברור. אפשר לתקן בפתק או אחרי השמירה.'

describe('import note page', () => {
  beforeEach(resetDb)

  it('explains the ? on a zero-length timed exercise', async () => {
    renderAt('/tabs/routines/import')

    ionInput(await ionField('פתק'), 'ליבה\nסיום:\nפלאנק 0 שניות')

    expect(await screen.findByText('פלאנק', { selector: 'h2' })).toBeInTheDocument()
    expect(screen.getByText(UNCLEAR_AMOUNT_HINT)).toBeInTheDocument()
  })

  it('shows an amount over the limit as the limit', async () => {
    renderAt('/tabs/routines/import')

    ionInput(await ionField('פתק'), 'אימון\nריצה 5000')

    expect(await screen.findByText('סט אחד · 100 חזרות', { selector: 'p' })).toBeInTheDocument()
    expect(screen.queryByText(/5000 חזרות/)).not.toBeInTheDocument()
  })

  it('reads a clock time and sets times reps, and marks a range with ? under its plain name', async () => {
    renderAt('/tabs/routines/import')

    ionInput(await ionField('פתק'), 'אימון\nפלאנק 1:30\nסקוואט 3x12\nלאנג׳ 8-10')

    expect(await screen.findByText('סט אחד · 90 שנ׳', { selector: 'p' })).toBeInTheDocument()
    expect(screen.getByText('3 סטים · 12 חזרות', { selector: 'p' })).toBeInTheDocument()
    expect(screen.getByText('לאנג׳', { selector: 'h2' })).toBeInTheDocument()
    expect(screen.getByText('?', { selector: 'ion-text[color="danger"]' })).toBeInTheDocument()
    expect(screen.getByText(UNCLEAR_AMOUNT_HINT)).toBeInTheDocument()

    fireEvent.click(screen.getByText('שמירה', { selector: 'ion-button' }))

    await waitFor(async () => expect(await db.routines.count()).toBe(1))

    const [saved] = await db.routines.toArray()

    expect(saved.sections[0].items).toMatchObject([
      { sets: null, exercises: [{ name: 'פלאנק', target: seconds(90) }] },
      { sets: 3, exercises: [{ name: 'סקוואט', target: reps(12) }] },
      { sets: null, exercises: [{ name: 'לאנג׳', target: reps(0) }] },
    ])
  })

  it('saves parsed routine', async () => {
    renderAt('/tabs/routines/import')

    const note = await ionField('פתק')

    ionInput(note, NOTE)

    expect(await screen.findByText('חימום', { selector: 'ion-list-header ion-label' })).toBeInTheDocument()
    expect(screen.getByText('אופניים', { selector: 'h2' })).toBeInTheDocument()
    expect(screen.getByText('2 סטים · 5 דק׳', { selector: 'p' })).toBeInTheDocument()
    expect(screen.getByText('סקוואט + לחיצת כתפיים', { selector: 'h2' })).toBeInTheDocument()
    expect(screen.getByText('3 סטים · 12 חזרות + 10 חזרות', { selector: 'p' })).toBeInTheDocument()
    expect(screen.queryByText('סטים', { selector: 'ion-label' })).not.toBeInTheDocument()
    expect(screen.getByText('?', { selector: 'ion-text[color="danger"]' })).toBeInTheDocument()
    expect(screen.getByText(UNCLEAR_AMOUNT_HINT)).toBeInTheDocument()

    fireEvent.click(screen.getByText('שמירה', { selector: 'ion-button' }))

    await waitFor(async () => expect(await db.routines.count()).toBe(1))

    const [saved] = await db.routines.toArray()

    expect(saved).toMatchObject({
      name: 'אימון גוף מלא',
      sections: [
        { name: 'חימום', sets: 2, items: [{ exercises: [{ name: 'אופניים', target: seconds(300) }] }] },
        {
          name: 'עיקרי',
          sets: 3,
          items: [
            {
              exercises: [
                { name: 'סקוואט', target: reps(12) },
                { name: 'לחיצת כתפיים', target: reps(10) },
              ],
            },
            { exercises: [{ name: 'מתח', target: reps(0) }] },
          ],
        },
      ],
    })
    await waitFor(() => expect(currentPath()).toBe(`/tabs/routines/${saved.id}`))
  })
})
