import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../src/data/db'
import { saveRoutine, saveWorkout } from '../../src/data/repo'
import { resetDb } from '../helpers/db'
import { buttonByLabel, ionElement } from '../helpers/ionic'
import { exercisePicker } from '../helpers/picker'
import { currentPath, renderAt } from '../helpers/renderAt'
import { dailyRoutine, done, exercise, oct, reps, routine, seconds, workout } from '../helpers/workouts'

const fullBody = routine('r1', 'אימון גוף מלא', [
  [{ name: 'סקוואט', target: reps(12) }],
  [
    { name: 'לחיצת חזה', target: reps(10) },
    { name: 'פלאנק', target: seconds(30) },
  ],
  [{ name: 'מתח', target: reps(8) }],
])

const names = async () =>
  (await db.routines.get('r1'))?.sections[0].items.map((item) => item.exercises.map((entry) => entry.name).join(' + '))

const deadlifts = workout({ id: 'prev', startedAt: oct(22), exercises: [exercise('דדליפט', [done(80, 8)], reps(8))] })

const deleteOption = (title: string) => ionElement(`ion-item-option[aria-label="מחיקת ${title}"]`)

describe('routine editor actions', () => {
  beforeEach(resetDb)

  it('⊖ reveals delete, and "מחיקה" removes the exercise without asking', async () => {
    await saveRoutine(fullBody)
    renderAt('/tabs/routines/r1')

    fireEvent.click(await buttonByLabel('הצגת מחיקה · סקוואט'))
    fireEvent.click(await deleteOption('סקוואט'))

    await waitFor(async () => expect(await names()).toEqual(['לחיצת חזה + פלאנק', 'מתח']))
    expect(document.querySelector('ion-alert')).toBeNull()
  })

  it('the swipe option deletes a pair', async () => {
    await saveRoutine(fullBody)
    renderAt('/tabs/routines/r1')

    fireEvent.click(await deleteOption('לחיצת חזה + פלאנק'))

    await waitFor(async () => expect(await names()).toEqual(['סקוואט', 'מתח']))
  })

  it('"הוספת תרגיל אחרי" inserts a picked exercise right after the item, without opening it', async () => {
    await saveRoutine(fullBody)
    await saveWorkout(deadlifts)
    renderAt('/tabs/routines/r1')

    fireEvent.click(await screen.findByText('סקוואט', { selector: 'h2' }))
    fireEvent.click(await screen.findByText('הוספת תרגיל אחרי'))
    fireEvent.click(await (await exercisePicker()).findByText('דדליפט'))

    await waitFor(async () => expect(await names()).toEqual(['סקוואט', 'דדליפט', 'לחיצת חזה + פלאנק', 'מתח']))
    await waitFor(() => expect(document.querySelector('ion-modal ion-searchbar')).toBeNull())
    expect(screen.queryByText('מחיקת התרגיל')).not.toBeInTheDocument()
  })

  it('"הוספת תרגיל אחרי" a pair goes after the whole pair', async () => {
    await saveRoutine(fullBody)
    await saveWorkout(deadlifts)
    renderAt('/tabs/routines/r1')

    fireEvent.click(await screen.findByText('לחיצת חזה + פלאנק', { selector: 'h2' }))
    fireEvent.click(await screen.findByText('הוספת תרגיל אחרי'))
    fireEvent.click(await (await exercisePicker()).findByText('דדליפט'))

    await waitFor(async () => expect(await names()).toEqual(['סקוואט', 'לחיצת חזה + פלאנק', 'דדליפט', 'מתח']))
  })

  it('"הוספת תרגיל אחרי" with "תרגיל חדש" inserts a new exercise after the item and opens it', async () => {
    await saveRoutine(fullBody)
    renderAt('/tabs/routines/r1')

    fireEvent.click(await screen.findByText('סקוואט', { selector: 'h2' }))
    fireEvent.click(await screen.findByText('הוספת תרגיל אחרי'))
    fireEvent.click(await (await exercisePicker()).findByText('תרגיל חדש'))

    await waitFor(async () => expect(await names()).toEqual(['סקוואט', 'תרגיל חדש', 'לחיצת חזה + פלאנק', 'מתח']))
    expect(await screen.findByText('מחיקת התרגיל')).toBeInTheDocument()
  })

  it('"שכפול האימון" saves a copy and opens its editor', async () => {
    await saveRoutine(fullBody)
    renderAt('/tabs/routines/r1')

    fireEvent.click(await screen.findByText('שכפול האימון'))

    await waitFor(async () => expect(await db.routines.count()).toBe(2))

    const copy = (await db.routines.toArray()).find((saved) => saved.id !== 'r1')

    expect(copy).toMatchObject({ name: 'אימון גוף מלא (עותק)', sections: [{ items: [{}, {}, {}] }] })
    await waitFor(() => expect(currentPath()).toBe(`/tabs/routines/${copy?.id}`))
  })

  it('a copy of a daily routine gets the colour the other daily routines use least', async () => {
    await saveRoutine(dailyRoutine('d1', 'חטיפי תנועה', [[{ name: 'גשר ישבן', target: reps(15) }]], { color: 'red' }))
    await saveRoutine(dailyRoutine('d2', 'מתיחות', [], { color: 'orange' }))
    renderAt('/tabs/daily/d1')

    fireEvent.click(await screen.findByText('שכפול האימון'))

    await waitFor(async () => expect(await db.routines.count()).toBe(3))

    const copy = (await db.routines.toArray()).find((saved) => saved.id !== 'd1' && saved.id !== 'd2')

    expect(copy).toMatchObject({ name: 'חטיפי תנועה (עותק)', daily: true, archived: false, color: 'yellow' })
  })

  it('a daily routine moves to the archive and back from its editor', async () => {
    await saveRoutine(dailyRoutine('d1', 'חטיפי תנועה', [[{ name: 'גשר ישבן', target: reps(15) }]]))
    renderAt('/tabs/daily/d1')

    fireEvent.click(await screen.findByText('העברה לארכיון'))
    await waitFor(async () => expect((await db.routines.get('d1'))?.archived).toBe(true))

    fireEvent.click(await screen.findByText('הוצאה מהארכיון'))
    await waitFor(async () => expect((await db.routines.get('d1'))?.archived).toBe(false))
    expect(await screen.findByText('העברה לארכיון')).toBeInTheDocument()
    expect(currentPath()).toBe('/tabs/daily/d1')
  })

  it('back from restoring the last archived routine skips the empty archive and lands on יומי', async () => {
    await saveRoutine(dailyRoutine('d1', 'חטיפי תנועה', [], { archived: true }))
    renderAt('/tabs/daily/archive')

    fireEvent.click(await screen.findByText('חטיפי תנועה', { selector: 'h2' }))
    await waitFor(() => expect(currentPath()).toBe('/tabs/daily/d1'))
    fireEvent.click(await screen.findByText('הוצאה מהארכיון'))
    await waitFor(async () => expect((await db.routines.get('d1'))?.archived).toBe(false))
    fireEvent.click(await ionElement('ion-back-button'))

    await waitFor(() => expect(currentPath()).toBe('/tabs/daily'))
  })

  it('a gym routine has no archive row', async () => {
    await saveRoutine(fullBody)
    renderAt('/tabs/routines/r1')

    await screen.findByText('שכפול האימון')

    expect(screen.queryByText('העברה לארכיון')).not.toBeInTheDocument()
  })
})
