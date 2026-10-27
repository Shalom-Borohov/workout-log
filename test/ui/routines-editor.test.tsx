import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../src/data/db'
import { saveRoutine } from '../../src/data/repo'
import { resetDb } from '../helpers/db'
import { renderAt } from '../helpers/renderAt'
import { reps, routine, seconds } from '../helpers/workouts'

const setsShown = (count: string) => screen.findByText(count, { selector: '.count-stepper-value' })

const stepButton = (name: string) => screen.getByRole('button', { name })

const savedSets = async () => (await db.routines.get('r1'))?.sections[0].sets

describe('routine editor', () => {
  beforeEach(resetDb)

  it('sets stepper steps down to one and back up', async () => {
    await saveRoutine(routine('r1', 'אימון רגליים', [[{ name: 'סקוואט', target: reps(12) }]], 2))
    renderAt('/tabs/routines/r1')

    await setsShown('2')
    expect(stepButton('הורדת סט')).not.toHaveAttribute('disabled')

    fireEvent.click(stepButton('הורדת סט'))
    await setsShown('1')
    await waitFor(async () => expect(await savedSets()).toBe(1))
    expect(stepButton('הורדת סט')).toHaveAttribute('disabled')

    fireEvent.click(stepButton('הוספת סט'))
    await setsShown('2')
    await waitFor(async () => expect(await savedSets()).toBe(2))
  })

  it('sets stepper stops at ten', async () => {
    await saveRoutine(routine('r1', 'אימון רגליים', [[{ name: 'סקוואט', target: reps(12) }]], 9))
    renderAt('/tabs/routines/r1')

    await setsShown('9')
    fireEvent.click(stepButton('הוספת סט'))
    await setsShown('10')
    await waitFor(async () => expect(await savedSets()).toBe(10))
    expect(stepButton('הוספת סט')).toHaveAttribute('disabled')
    expect(stepButton('הורדת סט')).not.toHaveAttribute('disabled')
  })

  it('exercise rows show the name over the target, pairs joined with +', async () => {
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
    expect(screen.getByText('12 חזרות', { selector: 'p' })).toBeInTheDocument()
    expect(screen.getByText('לחיצת חזה + פלאנק', { selector: 'h2' })).toBeInTheDocument()
    expect(screen.getByText('10 חזרות + 30 שנ׳', { selector: 'p' })).toBeInTheDocument()
    expect(screen.getByText('?', { selector: 'p ion-text[color="danger"]' })).toBeInTheDocument()
  })

  it('whole-minute duration targets read in minutes', async () => {
    await saveRoutine(routine('r1', 'אימון ריצה', [[{ name: 'ריצה', target: seconds(900) }]]))
    renderAt('/tabs/routines/r1')

    expect(await screen.findByText('15 דק׳', { selector: 'p' })).toBeInTheDocument()
  })
})
