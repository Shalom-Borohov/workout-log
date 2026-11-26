import { beforeEach, expect, it } from 'vitest'
import { exportBackup, parseBackup } from '../../src/data/backup'
import { saveWorkout } from '../../src/data/repo'
import type { Workout } from '../../src/domain/types'
import { resetDb } from '../helpers/db'
import { done, exercise, oct, open, workout } from '../helpers/workouts'

const plain = workout({ id: 'w1', startedAt: oct(20), exercises: [exercise('לחיצת חזה', [done(50, 10)]), exercise('לחיצה בשיפוע', [open(30, 10)])] })

const split: Workout = {
  ...plain,
  sections: [{ ...plain.sections[0], items: [{ ...plain.sections[0].items[0], replacedBy: { id: 'i1', sets: 4 } }, plain.sections[0].items[1]] }],
}

beforeEach(resetDb)

it('keeps the mark on the ticked part of a replaced exercise through a backup', async () => {
  await saveWorkout(split)

  const parsed = parseBackup(JSON.parse(JSON.stringify(await exportBackup(oct(26)))))

  expect(parsed.workouts).toEqual([split])
})

it('rejects a malformed mark on a replaced exercise', async () => {
  const valid = JSON.parse(JSON.stringify(await exportBackup(oct(26))))
  const [ticked, continuing] = plain.sections[0].items

  for (const replacedBy of [{ id: 'i1' }, { id: 5, sets: 4 }, 'i1']) {
    const bad = { ...plain, sections: [{ ...plain.sections[0], items: [{ ...ticked, replacedBy }, continuing] }] }

    expect(() => parseBackup({ ...valid, workouts: [bad] })).toThrow('קובץ הגיבוי לא תקין')
  }
})
