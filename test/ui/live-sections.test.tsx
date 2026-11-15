import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../src/data/db'
import { saveRoutine, saveWorkout } from '../../src/data/repo'
import type { Routine, Workout } from '../../src/domain/types'
import { resetDb, savedWorkout } from '../helpers/db'
import { chooseFromMenu } from '../helpers/live'
import { renderAt } from '../helpers/renderAt'
import { done, exercise, oct, open, reps, routine, workout } from '../helpers/workouts'

const main = workout({
  id: 'w1',
  startedAt: oct(26),
  finishedAt: null,
  exercises: [exercise('סקוואט', [done(60, 10), open(60, 10)]), exercise('לחיצת חזה', [open(40, 10)])],
})

function withSections(base: Workout, finisher: Workout['sections'][number]['items']): Workout {
  return {
    ...base,
    sections: [{ name: 'חימום', items: [] }, base.sections[0], { name: 'סיום', items: finisher }],
  }
}

const session = withSections(main, [])

const pullUps = { id: 'f0', exercises: [exercise('מתח', [open(null, 8)])] }

const plainPlan = routine('r1', 'אימון גוף מלא', [
  [{ name: 'סקוואט', target: reps(10) }],
  [{ name: 'לחיצת חזה', target: reps(10) }],
])

const plan: Routine = {
  ...plainPlan,
  sections: [
    { id: 'warm', name: 'חימום', sets: 2, items: [] },
    plainPlan.sections[0],
    { id: 'end', name: 'סיום', sets: 3, items: [] },
  ],
}

const labelOf = (item: Element) =>
  item.getAttribute('aria-label') ?? item.shadowRoot?.querySelector('[aria-label]')?.getAttribute('aria-label')

const queryRow = (label: string) =>
  Array.from(document.querySelectorAll('ion-modal ion-item')).find((item) => labelOf(item) === label)

function rowLabelled(label: string) {
  return waitFor(() => {
    const row = queryRow(label)

    if (!row) {
      throw new Error(`no row labelled ${label}`)
    }

    return row
  })
}

const deleteRow = (section: string) => rowLabelled(`מחיקת החלק · ${section}`)

const queryDeleteRow = (section: string) => queryRow(`מחיקת החלק · ${section}`)

const savedSectionNames = async () => (await savedWorkout('w1'))?.sections.map((section) => section.name)

describe('deleting an empty section from a workout', () => {
  beforeEach(async () => {
    await resetDb()
  })

  it('offers "מחיקת החלק" only under empty sections, and only in edit mode', async () => {
    await saveWorkout(session)
    renderAt('/tabs/timeline/workout/w1')

    await chooseFromMenu('עריכת האימון')

    expect(await deleteRow('חימום')).toHaveTextContent('מחיקת החלק')
    expect(await deleteRow('סיום')).toBeInTheDocument()
    expect(queryDeleteRow('עיקרי')).toBeUndefined()

    fireEvent.click(screen.getByText('סיום', { selector: 'ion-modal ion-button' }))

    await waitFor(() => expect(queryDeleteRow('חימום')).toBeUndefined())
  })

  it('reads just "מחיקת החלק" for a section with no name', async () => {
    await saveWorkout({ ...session, sections: [{ name: ' ', items: [] }, ...session.sections.slice(1)] })
    renderAt('/tabs/timeline/workout/w1')
    await chooseFromMenu('עריכת האימון')

    expect(await rowLabelled('מחיקת החלק')).toBeInTheDocument()
  })

  it('removes the section at once, without asking', async () => {
    await saveWorkout(session)
    renderAt('/tabs/timeline/workout/w1')
    await chooseFromMenu('עריכת האימון')

    fireEvent.click(await deleteRow('חימום'))

    await waitFor(async () => expect(await savedSectionNames()).toEqual(['עיקרי', 'סיום']))
    expect(document.querySelector('ion-alert')).toBeNull()
    await waitFor(() => expect(queryDeleteRow('חימום')).toBeUndefined())
  })

  it('offers it once the last exercise of a section is deleted', async () => {
    await saveWorkout(withSections(main, [pullUps]))
    renderAt('/tabs/timeline/workout/w1')
    await chooseFromMenu('עריכת האימון')
    await deleteRow('חימום')
    expect(queryDeleteRow('סיום')).toBeUndefined()

    fireEvent.click(await screen.findByLabelText('מחיקת מתח'))

    fireEvent.click(await deleteRow('סיום'))
    await waitFor(async () => expect(await savedSectionNames()).toEqual(['חימום', 'עיקרי']))
  })

  it('works when editing a finished workout', async () => {
    await saveWorkout({ ...session, finishedAt: oct(26, 11) })
    renderAt('/tabs/timeline/workout/w1')
    await chooseFromMenu('עריכת האימון')

    fireEvent.click(await deleteRow('סיום'))

    await waitFor(async () => expect(await savedSectionNames()).toEqual(['חימום', 'עיקרי']))
  })

  it('makes סיום offer to update the routine, which then drops the section too', async () => {
    await saveWorkout(session)
    await saveRoutine(plan)
    renderAt('/tabs/timeline/workout/w1')
    await chooseFromMenu('עריכת האימון')
    expect(screen.queryByText('עדכון אימון גוף מלא')).not.toBeInTheDocument()

    fireEvent.click(await deleteRow('חימום'))

    fireEvent.click(await screen.findByText('עדכון אימון גוף מלא'))
    await waitFor(async () =>
      expect((await db.routines.get('r1'))?.sections.map((section) => section.name)).toEqual(['עיקרי', 'סיום']),
    )
  })
})
