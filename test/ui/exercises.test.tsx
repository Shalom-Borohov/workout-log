import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { setExerciseArea } from '../../src/data/exerciseAreas'
import { saveRoutine, saveWorkout } from '../../src/data/repo'
import { freezeDate } from '../helpers/clock'
import { resetDb } from '../helpers/db'
import { areaIconOf } from '../helpers/areas'
import { expectInOrder, ionElement, ionInput } from '../helpers/ionic'
import { currentPath, renderAt } from '../helpers/renderAt'
import { done, exercise, oct, reps, routine, workout } from '../helpers/workouts'

const fullBody = routine('r1', 'אימון גוף מלא', [
  [{ name: 'סקוואט', target: reps(10) }],
  [{ name: 'לחיצת חזה', target: reps(8) }],
])

async function saveTaggedExercises() {
  await saveRoutine(routine('r1', 'אימון גוף מלא', [
    [{ name: 'סקוואט', target: reps(10) }],
    [{ name: 'לחיצת חזה', target: reps(8) }],
    [{ name: 'הכנסת סנטר', target: reps(10) }],
    [{ name: 'לאנג׳', target: reps(10) }],
  ]))
  await setExerciseArea('סקוואט', 'legs')
  await setExerciseArea('לאנג׳', 'legs')
  await setExerciseArea('לחיצת חזה', 'chest')
}

const AREA_RAIL = { name: 'אזור בגוף' }

const areaCells = async () => within(await screen.findByRole('group', AREA_RAIL)).getAllByRole('button')

describe('exercises', () => {
  beforeEach(resetDb)
  freezeDate(oct(26, 12))

  it('exercise list filters', async () => {
    await saveRoutine(fullBody)
    await saveWorkout(workout({ id: 'w1', startedAt: oct(26, 8), exercises: [exercise('סקוואט', [done(20, 10), done(22, 8)])] }))
    renderAt('/tabs/exercises')

    expect(await screen.findByText('סקוואט')).toBeInTheDocument()
    expect(screen.getByText('לחיצת חזה')).toBeInTheDocument()
    expect(screen.getByText('סקוואט').closest('ion-item')).toHaveTextContent('22 ק״ג × 8')
    expect(screen.getByText('יום ב׳ 26.10').closest('ion-item')).toHaveTextContent('סקוואט')

    ionInput(await ionElement('ion-searchbar'), 'לחי')

    await waitFor(() => expect(screen.queryByText('סקוואט')).not.toBeInTheDocument())
    expect(screen.getByText('לחיצת חזה')).toBeInTheDocument()
  })

  it('exercise list has a cell for each body area with exercises, untagged last, and lists the first area', async () => {
    await saveTaggedExercises()
    renderAt('/tabs/exercises')

    const cells = await areaCells()

    expect(cells).toHaveLength(3)
    expect(cells[0]).toHaveAccessibleName('חזה, תרגיל אחד')
    expect(cells[1]).toHaveAccessibleName('רגליים, 2 תרגילים')
    expect(cells[2]).toHaveAccessibleName('ללא, תרגיל אחד')
    expect(cells.map((cell) => cell.getAttribute('aria-pressed'))).toEqual(['true', 'false', 'false'])
    expect(screen.getByText('לחיצת חזה')).toBeInTheDocument()
    expect(screen.queryByText('סקוואט')).not.toBeInTheDocument()
    expect(screen.queryByText('הכנסת סנטר')).not.toBeInTheDocument()
  })

  it('tapping an area cell lists only that area, without repeating its icon on the rows', async () => {
    await saveTaggedExercises()
    renderAt('/tabs/exercises')

    fireEvent.click(await screen.findByRole('button', { name: 'רגליים, 2 תרגילים' }))

    await expectInOrder(['לאנג׳', 'סקוואט'])
    expect(screen.queryByText('לחיצת חזה')).not.toBeInTheDocument()
    expect((await areaCells()).map((cell) => cell.getAttribute('aria-pressed'))).toEqual(['false', 'true', 'false'])
    expect(areaIconOf(screen.getByText('סקוואט'))).toBeUndefined()
  })

  it('lists an area’s exercises in one panel', async () => {
    await saveTaggedExercises()
    renderAt('/tabs/exercises')

    expect((await screen.findByText('לחיצת חזה')).closest('ion-list')).toHaveClass('list-inset')
  })

  it('lists each area’s search matches in its own panel', async () => {
    await saveTaggedExercises()
    renderAt('/tabs/exercises')
    await areaCells()

    ionInput(await ionElement('ion-searchbar'), 'ס')

    const squat = (await screen.findByText('סקוואט')).closest('ion-list')
    const chinTuck = screen.getByText('הכנסת סנטר').closest('ion-list')

    expect(squat).toHaveClass('list-inset')
    expect(chinTuck).toHaveClass('list-inset')
    expect(chinTuck).not.toBe(squat)
  })

  it('searching hides the area cells and lists matches from every area under their area names, with icons', async () => {
    await saveTaggedExercises()
    renderAt('/tabs/exercises')
    await areaCells()

    ionInput(await ionElement('ion-searchbar'), 'ס')

    await expectInOrder(['רגליים', 'סקוואט', 'ללא', 'הכנסת סנטר'])
    expect(screen.queryByRole('group', AREA_RAIL)).not.toBeInTheDocument()
    expect(screen.queryByText('חזה')).not.toBeInTheDocument()
    expect(screen.queryByText('לאנג׳')).not.toBeInTheDocument()
    expect(areaIconOf(screen.getByText('סקוואט'))).toBe('legs')
    expect(areaIconOf(screen.getByText('הכנסת סנטר'))).toBe('none')
  })

  it('keeps the chosen area after a search is cleared', async () => {
    await saveTaggedExercises()
    renderAt('/tabs/exercises')
    fireEvent.click(await screen.findByRole('button', { name: 'רגליים, 2 תרגילים' }))
    const searchbar = await ionElement('ion-searchbar')

    ionInput(searchbar, 'ס')
    await waitFor(() => expect(screen.queryByRole('group', AREA_RAIL)).not.toBeInTheDocument())
    ionInput(searchbar, '')

    expect(await screen.findByRole('button', { name: 'רגליים, 2 תרגילים' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('לאנג׳')).toBeInTheDocument()
  })

  it('selects the first area again when the chosen area loses its last exercise', async () => {
    await saveTaggedExercises()
    renderAt('/tabs/exercises')
    fireEvent.click(await screen.findByRole('button', { name: 'רגליים, 2 תרגילים' }))
    await screen.findByText('לאנג׳')

    await setExerciseArea('סקוואט', 'chest')
    await setExerciseArea('לאנג׳', 'chest')

    expect(await screen.findByRole('button', { name: 'חזה, 3 תרגילים' })).toHaveAttribute('aria-pressed', 'true')
    await expectInOrder(['לאנג׳', 'לחיצת חזה', 'סקוואט'])
  })

  it('exercise list leaves out the drills of a daily routine', async () => {
    await saveRoutine(fullBody)
    await saveRoutine({ ...routine('d1', 'חטיפי תנועה', [[{ name: 'גשר ישבן', target: reps(15) }]]), daily: true })
    renderAt('/tabs/exercises')

    expect(await screen.findByText('סקוואט')).toBeInTheDocument()
    expect(screen.queryByText('גשר ישבן')).not.toBeInTheDocument()
  })

  it('exercise list explains where exercises come from when there are none', async () => {
    renderAt('/tabs/exercises')

    expect(await screen.findByText('עוד אין תרגילים')).toBeInTheDocument()
    expect(screen.getByText('תרגילים יופיעו כאן אחרי שתוסיפו אימון בלשונית אימונים או תסיימו אימון.')).toBeInTheDocument()
    expect(screen.queryByRole('group', AREA_RAIL)).not.toBeInTheDocument()
  })

  it('exercise list says when a search matches nothing', async () => {
    await saveRoutine(fullBody)
    renderAt('/tabs/exercises')
    await screen.findByText('סקוואט')

    ionInput(await ionElement('ion-searchbar'), 'חתירה')

    expect(await screen.findByText('אין תוצאות עבור ״חתירה״')).toBeInTheDocument()
    expect(screen.queryByText('עוד אין תרגילים')).not.toBeInTheDocument()
  })

  it('tapping an exercise opens its history', async () => {
    await saveRoutine(fullBody)
    renderAt('/tabs/exercises')

    fireEvent.click(await screen.findByText('לחיצת חזה'))

    await waitFor(() => expect(currentPath()).toBe(`/tabs/exercises/${encodeURIComponent('לחיצת חזה')}`))
  })
})
