import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { saveRoutine } from '../../src/data/repo'
import { resetDb } from '../helpers/db'
import { renderAt } from '../helpers/renderAt'
import { reps, routine, seconds } from '../helpers/workouts'

describe('routine editor', () => {
  beforeEach(resetDb)

  it('a section has no sets stepper', async () => {
    await saveRoutine(routine('r1', 'אימון רגליים', [[{ name: 'סקוואט', target: reps(12) }]], 2))
    renderAt('/tabs/routines/r1')

    await screen.findByText('סקוואט', { selector: 'h2' })

    expect(screen.queryByRole('button', { name: 'הוספת סט' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'הורדת סט' })).not.toBeInTheDocument()
    expect(screen.queryByText('סטים', { selector: 'ion-label' })).not.toBeInTheDocument()
  })

  it('exercise rows show the name over the sets and target, pairs joined with +', async () => {
    await saveRoutine(
      routine('r1', 'אימון גוף מלא', [
        [{ name: 'סקוואט', target: reps(12) }],
        [
          { name: 'לחיצת חזה', target: reps(10) },
          { name: 'פלאנק', target: seconds(30) },
        ],
        [{ name: 'מתח', target: reps(0) }],
      ]),
    )
    renderAt('/tabs/routines/r1')

    expect(await screen.findByText('סקוואט', { selector: 'h2' })).toBeInTheDocument()
    expect(screen.getByText('3 סטים · 12 חזרות', { selector: 'p' })).toBeInTheDocument()
    expect(screen.getByText('לחיצת חזה + פלאנק', { selector: 'h2' })).toBeInTheDocument()
    expect(screen.getByText('3 סטים · 10 חזרות + 30 שנ׳', { selector: 'p' })).toBeInTheDocument()
    expect(screen.getByText('?', { selector: 'p ion-text[color="danger"]' })).toBeInTheDocument()
  })

  it('exercise rows show the starting weight when set', async () => {
    await saveRoutine(
      routine('r1', 'אימון גוף מלא', [
        [{ name: 'סקוואט', target: reps(10), weight: 20 }],
        [
          { name: 'לחיצת חזה', target: reps(8), weight: 30 },
          { name: 'פלאנק', target: seconds(30) },
        ],
      ]),
    )
    renderAt('/tabs/routines/r1')

    expect(await screen.findByText('3 סטים · 10 חזרות · 20 ק״ג', { selector: 'p' })).toBeInTheDocument()
    expect(screen.getByText('3 סטים · 8 חזרות · 30 ק״ג + 30 שנ׳', { selector: 'p' })).toBeInTheDocument()
  })

  it('a pair shows its own set count next to the section default', async () => {
    const pair = routine('r1', 'אימון גוף מלא', [
      [
        { name: 'לחיצת חזה', target: reps(8) },
        { name: 'מתח', target: reps(6) },
      ],
      [{ name: 'סקוואט', target: reps(12) }],
    ])

    const [pairItem, squatItem] = pair.sections[0].items

    await saveRoutine({ ...pair, sections: [{ ...pair.sections[0], items: [{ ...pairItem, sets: 4 }, squatItem] }] })
    renderAt('/tabs/routines/r1')

    expect(await screen.findByText('4 סטים · 8 חזרות + 6 חזרות', { selector: 'p' })).toBeInTheDocument()
    expect(screen.getByText('3 סטים · 12 חזרות', { selector: 'p' })).toBeInTheDocument()
  })

  it('whole-minute duration targets read in minutes', async () => {
    await saveRoutine(routine('r1', 'אימון ריצה', [[{ name: 'ריצה', target: seconds(900) }]]))
    renderAt('/tabs/routines/r1')

    expect(await screen.findByText('3 סטים · 15 דק׳', { selector: 'p' })).toBeInTheDocument()
  })
})
