import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../src/data/db'
import { saveRoutine } from '../../src/data/repo'
import type { Routine } from '../../src/domain/types'
import { resetDb } from '../helpers/db'
import { currentPath, renderAt } from '../helpers/renderAt'
import { reps, routine, routineExercise } from '../helpers/workouts'

const base = routine('r1', 'אימון רגליים', [[{ name: 'סקוואט', target: reps(12) }]])

const twoSections: Routine = {
  ...base,
  sections: [
    { id: 's1', name: 'חימום', sets: 2, items: [{ id: 'i1', sets: null, exercises: [routineExercise({ name: 'אופניים', target: reps(5) })] }] },
    {
      id: 's2',
      name: 'עיקרי',
      sets: 3,
      items: [
        {
          id: 'i2',
          sets: null,
          exercises: [
            routineExercise({ name: 'סקוואט', target: reps(12) }),
            routineExercise({ name: 'מתח', target: reps(8) }),
          ],
        },
      ],
    },
  ],
}

describe('routines list', () => {
  beforeEach(resetDb)

  it('routine row shows exercise and section counts', async () => {
    await saveRoutine(twoSections)
    await saveRoutine(routine('r2', 'אימון קצר', [[{ name: 'מתח', target: reps(8) }]]))
    renderAt('/tabs/routines')

    expect(await screen.findByText('3 תרגילים · 2 חלקים')).toBeInTheDocument()
    expect(screen.getByText('תרגיל אחד · חלק אחד')).toBeInTheDocument()
  })

  it('swipe duplicate saves a copy and opens its editor', async () => {
    await saveRoutine(twoSections)
    renderAt('/tabs/routines')

    fireEvent.click(await screen.findByText('שכפול', { selector: 'ion-item-option' }))

    await waitFor(async () => expect(await db.routines.count()).toBe(2))

    const copy = (await db.routines.toArray()).find((saved) => saved.id !== 'r1')

    expect(copy).toMatchObject({
      name: 'אימון רגליים (עותק)',
      sections: [
        { name: 'חימום', items: [{ exercises: [{ name: 'אופניים' }] }] },
        { name: 'עיקרי', items: [{ exercises: [{ name: 'סקוואט' }, { name: 'מתח' }] }] },
      ],
    })
    await waitFor(() => expect(currentPath()).toBe(`/tabs/routines/${copy?.id}`))
  })

  it('empty state offers pasting a note', async () => {
    renderAt('/tabs/routines')

    expect(await screen.findByText('אין עדיין אימונים')).toBeInTheDocument()
    fireEvent.click(screen.getByText('הדבקת פתק', { selector: 'ion-label h2' }))

    await waitFor(() => expect(currentPath()).toBe('/tabs/routines/import'))
  })

  it('empty state offers an empty routine', async () => {
    renderAt('/tabs/routines')

    fireEvent.click(await screen.findByText('אימון ריק', { selector: 'ion-label h2' }))

    await waitFor(async () => expect(await db.routines.count()).toBe(1))

    const [created] = await db.routines.toArray()

    await waitFor(() => expect(currentPath()).toBe(`/tabs/routines/${created.id}`))
  })
})
