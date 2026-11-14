import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../src/data/db'
import { saveRoutine } from '../../src/data/repo'
import type { Routine } from '../../src/domain/types'
import { freezeDate } from '../helpers/clock'
import { resetDb } from '../helpers/db'
import { expectInOrder } from '../helpers/ionic'
import { currentPath, renderAt } from '../helpers/renderAt'
import { oct, reps, routine, routineExercise } from '../helpers/workouts'

const base = { ...routine('r1', 'אימון רגליים', [[{ name: 'סקוואט', target: reps(12) }]]), createdAt: oct(20) }

const short = routine('r2', 'אימון קצר', [[{ name: 'מתח', target: reps(8) }]])

const lastYear = new Date(2025, 9, 29).getTime()

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
  freezeDate(oct(29, 12))

  it('routine row shows exercise and section counts and the creation date', async () => {
    await saveRoutine(twoSections)
    await saveRoutine({ ...short, createdAt: lastYear })
    renderAt('/tabs/routines')

    expect(await screen.findByText('3 תרגילים · 2 חלקים · נוצר 20.10')).toBeInTheDocument()
    expect(screen.getByText('תרגיל אחד · חלק אחד · נוצר 29.10.25')).toBeInTheDocument()
  })

  it('lists the newest routine first', async () => {
    await saveRoutine({ ...short, createdAt: oct(20) })
    await saveRoutine({ ...base, id: 'r3', createdAt: oct(28) })
    renderAt('/tabs/routines')

    await expectInOrder(['אימון רגליים', 'אימון קצר'])
  })

  it('still lists a routine stored without a creation date', async () => {
    const { createdAt: _createdAt, ...withoutDate } = short
    await saveRoutine(base)
    await db.table('routines').put(withoutDate)

    renderAt('/tabs/routines')

    await expectInOrder(['אימון רגליים', 'אימון קצר'])
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
