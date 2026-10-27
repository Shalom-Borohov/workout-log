import { beforeEach, describe, expect, it } from 'vitest'
import { exportBackup, parseBackup, restoreBackup } from '../../src/data/backup'
import { db } from '../../src/data/db'
import { saveRoutine, saveWorkout } from '../../src/data/repo'
import { resetDb } from '../helpers/db'
import { done, exercise, oct, reps, routine, seconds, workout } from '../helpers/workouts'

const fullBody = {
  ...routine('r1', 'אימון גוף מלא', [
    [
      { name: 'סקוואט', target: reps(12) },
      { name: 'פלאנק', target: seconds(30) },
    ],
  ]),
  updatedAt: 5,
}

const past = workout({
  id: 'w1',
  startedAt: oct(20),
  exercises: [exercise('סקוואט', [done(40, 12), done(null, 10)]), exercise('פלאנק', [done(null, 30)], seconds(30))],
})

describe('backup', () => {
  beforeEach(resetDb)

  it('backup round-trips', async () => {
    await saveRoutine(fullBody)
    await saveWorkout({ ...past, summary: 'הרגשתי חזק' })

    const json = JSON.parse(JSON.stringify(await exportBackup(oct(26))))

    await resetDb()
    await saveRoutine({ ...fullBody, id: 'other' })
    await restoreBackup(parseBackup(json))

    expect(json.version).toBe(1)
    expect(json.exportedAt).toBe(oct(26))
    expect(await db.routines.toArray()).toEqual([fullBody])
    expect(await db.workouts.toArray()).toEqual([{ ...past, summary: 'הרגשתי חזק' }])
  })

  it('invalid backup leaves data intact', async () => {
    await saveRoutine(fullBody)
    await saveWorkout(past)

    const valid = JSON.parse(JSON.stringify(await exportBackup(oct(26))))
    const { summary: _summary, ...noSummary } = past

    const badTarget = {
      name: 'עיקרי',
      items: [{ id: 'i', exercises: [{ name: 'x', target: { kind: 'weight' }, sets: [], skipped: false }] }],
    }

    const invalid = [
      null,
      'גיבוי',
      [],
      { ...valid, version: 2 },
      { ...valid, routines: undefined },
      { ...valid, routines: [{ ...fullBody, sections: [{ id: 's1', name: 'עיקרי', sets: '3', items: [] }] }] },
      { ...valid, workouts: [noSummary] },
      { ...valid, workouts: [{ ...past, finishedAt: undefined }] },
      { ...valid, workouts: [{ ...past, sections: [badTarget] }] },
    ]

    for (const json of invalid) {
      expect(() => parseBackup(json)).toThrow('קובץ הגיבוי לא תקין')
    }

    expect(await db.routines.toArray()).toEqual([fullBody])
    expect(await db.workouts.toArray()).toEqual([past])
  })
})
