import { beforeEach, describe, expect, it } from 'vitest'
import { exportBackup, parseBackup, restoreBackup } from '../../src/data/backup'
import { db } from '../../src/data/db'
import { setBackground } from '../../src/data/background'
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
      {
        ...valid,
        routines: [
          {
            ...fullBody,
            sections: [{ id: 's', name: 'עיקרי', sets: 3, items: [{ id: 'i', sets: null, exercises: [{ name: 'x', target: reps(12), weight: '20', tip: '' }] }] }],
          },
        ],
      },
      { ...valid, workouts: [{ ...past, sections: [{ ...past.sections[0], items: [{ id: 'i', exercises: [{ ...past.sections[0].items[0].exercises[0], note: 5 }] }] }] }] },
    ]

    for (const json of invalid) {
      expect(() => parseBackup(json)).toThrow('קובץ הגיבוי לא תקין')
    }

    expect(await db.routines.toArray()).toEqual([fullBody])
    expect(await db.workouts.toArray()).toEqual([past])
  })

  it('a backup from before exercise tips and notes imports with empty defaults', async () => {
    const legacy = {
      version: 1,
      exportedAt: oct(26),
      routines: [
        {
          id: 'r1',
          name: 'אימון גוף מלא',
          updatedAt: 5,
          sections: [
            { id: 's1', name: 'עיקרי', sets: 3, items: [{ id: 'i1', exercises: [{ name: 'סקוואט', target: { kind: 'reps', reps: 12 } }] }] },
          ],
        },
      ],
      workouts: [
        {
          id: 'w1',
          routineId: 'r1',
          routineName: 'אימון גוף מלא',
          startedAt: oct(20),
          finishedAt: oct(20, 11),
          summary: '',
          sections: [
            {
              name: 'עיקרי',
              items: [
                {
                  id: 'i1',
                  exercises: [
                    { name: 'סקוואט', target: { kind: 'reps', reps: 12 }, sets: [{ weight: 40, amount: 12, done: true }], skipped: false },
                  ],
                },
              ],
            },
          ],
        },
      ],
    }

    await restoreBackup(parseBackup(legacy))

    const [squatPlan] = (await db.routines.toArray())[0].sections[0].items
    const [squatDone] = (await db.workouts.toArray())[0].sections[0].items[0].exercises

    expect(squatPlan).toEqual({ id: 'i1', sets: null, exercises: [{ name: 'סקוואט', target: { kind: 'reps', reps: 12 }, weight: null, tip: '' }] })
    expect(squatDone).toEqual({
      name: 'סקוואט',
      target: { kind: 'reps', reps: 12 },
      sets: [{ weight: 40, amount: 12, done: true }],
      skipped: false,
      tip: '',
      note: '',
    })
  })

  it('the background photo stays out of the backup and survives a restore', async () => {
    await setBackground(new Blob(['photo'], { type: 'image/jpeg' }))
    await saveRoutine(fullBody)

    const json = JSON.parse(JSON.stringify(await exportBackup(oct(26))))
    await restoreBackup(parseBackup(json))

    expect(Object.keys(json).sort()).toEqual(['exportedAt', 'routines', 'version', 'workouts'])
    expect(await db.settings.count()).toBe(1)
  })
})
