import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { setExerciseArea } from '../../src/data/exerciseAreas'
import { saveRoutine, saveWorkout } from '../../src/data/repo'
import { freezeDate } from '../helpers/clock'
import { resetDb } from '../helpers/db'
import { areaIconOf } from '../helpers/areas'
import { expectInOrder, ionElement, ionInput, OPEN_MODAL, radioByLabel } from '../helpers/ionic'
import { currentPath, renderAt } from '../helpers/renderAt'
import { done, exercise, oct, reps, routine, seconds, workout } from '../helpers/workouts'

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

const AREA_TILES = { name: 'אזור בגוף' }

const areaTiles = async () => within(await screen.findByRole('group', AREA_TILES)).getAllByRole('button')

function sessionRow(date: HTMLElement) {
  const row = date.closest('ion-item')

  if (!(row instanceof HTMLElement)) {
    throw new Error('no session row')
  }

  return row
}

describe('exercises', () => {
  beforeEach(resetDb)
  freezeDate(oct(26, 12))

  it('exercise list filters', async () => {
    await saveRoutine(fullBody)
    await saveWorkout(workout({ id: 'w1', startedAt: oct(26, 8), exercises: [exercise('סקוואט', [done(20, 10), done(22, 8)])] }))
    renderAt('/tabs/exercises')

    expect(await screen.findByText('סקוואט')).toBeInTheDocument()
    expect(screen.getByText('לחיצת חזה')).toBeInTheDocument()
    expect(screen.getByText('22 ק״ג × 8').closest('ion-item')).toHaveTextContent('סקוואט')
    expect(screen.getByText('יום ב׳ 26.10').closest('ion-item')).toHaveTextContent('סקוואט')

    ionInput(await ionElement('ion-searchbar'), 'לחי')

    await waitFor(() => expect(screen.queryByText('סקוואט')).not.toBeInTheDocument())
    expect(screen.getByText('לחיצת חזה')).toBeInTheDocument()
  })

  it('exercise list has a tile for each body area with exercises, untagged last, and lists the first area', async () => {
    await saveTaggedExercises()
    renderAt('/tabs/exercises')

    const tiles = await areaTiles()

    expect(tiles).toHaveLength(3)
    expect(tiles[0]).toHaveAccessibleName('חזה, תרגיל אחד')
    expect(tiles[1]).toHaveAccessibleName('רגליים, 2 תרגילים')
    expect(tiles[2]).toHaveAccessibleName('ללא, תרגיל אחד')
    expect(tiles.map((tile) => tile.getAttribute('aria-pressed'))).toEqual(['true', 'false', 'false'])
    expect(screen.getByText('לחיצת חזה')).toBeInTheDocument()
    expect(screen.queryByText('סקוואט')).not.toBeInTheDocument()
    expect(screen.queryByText('הכנסת סנטר')).not.toBeInTheDocument()
  })

  it('tapping an area tile lists only that area, without repeating its icon on the rows', async () => {
    await saveTaggedExercises()
    renderAt('/tabs/exercises')

    fireEvent.click(await screen.findByRole('button', { name: 'רגליים, 2 תרגילים' }))

    await expectInOrder(['לאנג׳', 'סקוואט'])
    expect(screen.queryByText('לחיצת חזה')).not.toBeInTheDocument()
    expect((await areaTiles()).map((tile) => tile.getAttribute('aria-pressed'))).toEqual(['false', 'true', 'false'])
    expect(areaIconOf(screen.getByText('סקוואט'))).toBeUndefined()
  })

  it('searching hides the area tiles and lists matches from every area under their area names, with icons', async () => {
    await saveTaggedExercises()
    renderAt('/tabs/exercises')
    await areaTiles()

    ionInput(await ionElement('ion-searchbar'), 'ס')

    await expectInOrder(['רגליים', 'סקוואט', 'ללא', 'הכנסת סנטר'])
    expect(screen.queryByRole('group', AREA_TILES)).not.toBeInTheDocument()
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
    await waitFor(() => expect(screen.queryByRole('group', AREA_TILES)).not.toBeInTheDocument())
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

  it('exercise page sets the body area from a sheet', async () => {
    await saveRoutine(fullBody)
    renderAt(`/tabs/exercises/${encodeURIComponent('סקוואט')}`)

    const label = await screen.findByText('אזור בגוף', { selector: 'ion-label' })
    const row = label.closest('ion-item')

    expect(row).toHaveTextContent('ללא')
    fireEvent.click(label)
    fireEvent.click(await radioByLabel('רגליים'))

    await waitFor(() => expect(row).toHaveTextContent('רגליים'))
    await waitFor(() => expect(document.querySelector(OPEN_MODAL)).toBeNull())
    expect(areaIconOf(label)).toBe('legs')
  })

  it('exercise page closes the area sheet when the current area is tapped again', async () => {
    await saveRoutine(fullBody)
    await setExerciseArea('סקוואט', 'legs')
    renderAt(`/tabs/exercises/${encodeURIComponent('סקוואט')}`)

    fireEvent.click(await screen.findByText('אזור בגוף', { selector: 'ion-label' }))
    await waitFor(() => expect(document.querySelector(OPEN_MODAL)).not.toBeNull())
    fireEvent.click(await radioByLabel('רגליים'))

    await waitFor(() => expect(document.querySelector(OPEN_MODAL)).toBeNull())
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
    expect(screen.queryByRole('group', AREA_TILES)).not.toBeInTheDocument()
  })

  it('exercise list says when a search matches nothing', async () => {
    await saveRoutine(fullBody)
    renderAt('/tabs/exercises')
    await screen.findByText('סקוואט')

    ionInput(await ionElement('ion-searchbar'), 'חתירה')

    expect(await screen.findByText('אין תוצאות עבור ״חתירה״')).toBeInTheDocument()
    expect(screen.queryByText('עוד אין תרגילים')).not.toBeInTheDocument()
  })

  it('exercise history newest first', async () => {
    await saveWorkout(workout({ id: 'w1', startedAt: oct(12), exercises: [exercise('סקוואט', [done(20, 10)])] }))
    await saveWorkout(workout({ id: 'w2', startedAt: oct(19), exercises: [exercise('סקוואט', [done(25, 8), done(25, 6)])] }))
    await saveWorkout(workout({ id: 'w3', startedAt: oct(26, 8), exercises: [exercise('סקוואט', [done(22, 10)])] }))
    renderAt(`/tabs/exercises/${encodeURIComponent('סקוואט')}`)

    await expectInOrder(['יום ב׳ 26.10', 'יום ב׳ 19.10', 'יום ב׳ 12.10'])
    expect(screen.getByText('25 ק״ג × 8, 6')).toBeInTheDocument()
    expect(screen.getByText('20 ק״ג × 10')).toBeInTheDocument()
    expect(screen.getByLabelText('שיא חדש').closest('ion-item')).toHaveTextContent('יום ב׳ 19.10')
    expect(screen.getAllByLabelText('שיא חדש')).toHaveLength(1)
    expect(screen.queryByText('★')).not.toBeInTheDocument()
  })

  it('exercise history shows each session’s best weight as a number with its unit, and stars only the record', async () => {
    await saveWorkout(workout({ id: 'w1', startedAt: oct(12), exercises: [exercise('סקוואט', [done(20, 10)])] }))
    await saveWorkout(workout({ id: 'w2', startedAt: oct(19), exercises: [exercise('סקוואט', [done(25, 8), done(25, 6)])] }))
    await saveWorkout(workout({ id: 'w3', startedAt: oct(26, 8), exercises: [exercise('סקוואט', [done(20, 12), done(22.5, 10)])] }))
    renderAt(`/tabs/exercises/${encodeURIComponent('סקוואט')}`)

    const record = sessionRow(await screen.findByText('יום ב׳ 19.10'))
    const latest = sessionRow(screen.getByText('יום ב׳ 26.10'))

    expect(within(record).getByText('25')).toBeInTheDocument()
    expect(within(record).getByText('ק״ג')).toBeInTheDocument()
    expect(within(record).getByLabelText('שיא חדש')).toBeInTheDocument()
    expect(within(latest).getByText('22.5')).toBeInTheDocument()
    expect(within(latest).getByText('ק״ג')).toBeInTheDocument()
    expect(within(latest).queryByLabelText('שיא חדש')).not.toBeInTheDocument()
    expect(within(sessionRow(screen.getByText('יום ב׳ 12.10'))).getByText('20')).toBeInTheDocument()
  })

  it('exercise history shows the best amount with its unit for a session with no weight', async () => {
    await saveWorkout(workout({ id: 'w1', startedAt: oct(19), exercises: [exercise('שכיבות סמיכה', [done(null, 12), done(null, 15)])] }))
    await saveWorkout(workout({ id: 'w2', startedAt: oct(26, 8), exercises: [exercise('שכיבות סמיכה', [done(null, 10)])] }))
    renderAt(`/tabs/exercises/${encodeURIComponent('שכיבות סמיכה')}`)

    const row = sessionRow(await screen.findByText('יום ב׳ 19.10'))

    expect(within(row).getByText('15')).toBeInTheDocument()
    expect(within(row).getByText('חזרות')).toBeInTheDocument()
    expect(within(sessionRow(screen.getByText('יום ב׳ 26.10'))).getByText('10')).toBeInTheDocument()
  })

  it('exercise history shows a timed session’s best time in minutes when whole, otherwise in seconds', async () => {
    await saveWorkout(workout({ id: 'w1', startedAt: oct(19), exercises: [exercise('פלאנק', [done(null, 45), done(null, 50)], seconds(45))] }))
    await saveWorkout(workout({ id: 'w2', startedAt: oct(26, 8), exercises: [exercise('פלאנק', [done(null, 120), done(null, 45)], seconds(45))] }))
    renderAt(`/tabs/exercises/${encodeURIComponent('פלאנק')}`)

    const seconds50 = sessionRow(await screen.findByText('יום ב׳ 19.10'))
    const minutes2 = sessionRow(screen.getByText('יום ב׳ 26.10'))

    expect(within(seconds50).getByText('50')).toBeInTheDocument()
    expect(within(seconds50).getByText('שנ׳')).toBeInTheDocument()
    expect(within(minutes2).getByText('2')).toBeInTheDocument()
    expect(within(minutes2).getByText('דק׳')).toBeInTheDocument()
  })

  it('exercise history charts the heaviest weight once there are two weighted sessions', async () => {
    await saveWorkout(workout({ id: 'w1', startedAt: oct(12), exercises: [exercise('סקוואט', [done(20, 10)])] }))
    await saveWorkout(workout({ id: 'w2', startedAt: oct(19), exercises: [exercise('סקוואט', [done(null, 12)])] }))
    await saveWorkout(workout({ id: 'w3', startedAt: oct(26, 8), exercises: [exercise('סקוואט', [done(20, 8), done(22.5, 6)])] }))
    renderAt(`/tabs/exercises/${encodeURIComponent('סקוואט')}`)

    expect(await screen.findByRole('img', { name: 'משקל מרבי: מ־20 ק״ג ב־12.10 ל־22.5 ק״ג ב־26.10' })).toBeInTheDocument()
    expect(screen.getByText('משקל מרבי')).toBeInTheDocument()
  })

  it('exercise history has no chart with fewer than two weighted sessions', async () => {
    await saveWorkout(workout({ id: 'w1', startedAt: oct(12), exercises: [exercise('סקוואט', [done(null, 12)])] }))
    await saveWorkout(workout({ id: 'w2', startedAt: oct(19), exercises: [exercise('סקוואט', [done(20, 10)])] }))
    renderAt(`/tabs/exercises/${encodeURIComponent('סקוואט')}`)

    await screen.findByText('יום ב׳ 19.10')
    expect(screen.queryByRole('img', { name: /משקל מרבי/ })).not.toBeInTheDocument()
  })

  it('tapping an exercise opens its history', async () => {
    await saveRoutine(fullBody)
    renderAt('/tabs/exercises')

    fireEvent.click(await screen.findByText('לחיצת חזה'))

    await waitFor(() => expect(currentPath()).toBe(`/tabs/exercises/${encodeURIComponent('לחיצת חזה')}`))
  })
})
