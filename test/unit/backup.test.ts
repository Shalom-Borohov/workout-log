import { beforeEach, describe, expect, it } from 'vitest'
import { exportBackup, parseBackup, restoreBackup } from '../../src/data/backup'
import { db } from '../../src/data/db'
import { setBackground } from '../../src/data/background'
import { finishedRecords, finishedWorkouts, saveRecord, saveRoutine, saveWorkout } from '../../src/data/repo'
import { resetDb } from '../helpers/db'
import { activity, dailyLog, done, exercise, oct, reps, routine, seconds, workout } from '../helpers/workouts'

const fullBody = {
  ...routine('r1', 'אימון גוף מלא', [
    [
      { name: 'סקוואט', target: reps(12) },
      { name: 'פלאנק', target: seconds(30) },
    ],
  ]),
  createdAt: 3,
  updatedAt: 5,
}

const past = workout({
  id: 'w1',
  startedAt: oct(20),
  exercises: [exercise('סקוואט', [done(40, 12), done(null, 10)]), exercise('פלאנק', [done(null, 30)], seconds(30))],
})

const boxing = activity({ id: 'a1', startedAt: oct(21, 19), summary: 'ספארינג' })

const drills = { ...routine('d1', 'חטיפי תנועה', [[{ name: 'גשר ישבן', target: reps(15) }]]), daily: true }

const sundayDrills = dailyLog('d1', '2026-10-25')

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

  it('an activity round-trips with the workouts', async () => {
    await saveWorkout(past)
    await saveRecord(boxing)

    const json = JSON.parse(JSON.stringify(await exportBackup(oct(26))))

    await resetDb()
    await restoreBackup(parseBackup(json))

    expect(await finishedRecords()).toEqual([boxing, past])
  })

  it('daily routines and their logs round-trip', async () => {
    await saveRoutine(drills)
    await db.dailyLogs.put(sundayDrills)

    const json = JSON.parse(JSON.stringify(await exportBackup(oct(26))))

    await resetDb()
    await db.dailyLogs.put(dailyLog('other', '2026-10-20'))
    await restoreBackup(parseBackup(json))

    expect(await db.routines.toArray()).toEqual([drills])
    expect(await db.dailyLogs.toArray()).toEqual([sundayDrills])
  })

  it('rejects a malformed daily log or daily flag', async () => {
    const valid = JSON.parse(JSON.stringify(await exportBackup(oct(26))))
    const { routineId: _routineId, ...unnamed } = sundayDrills

    const invalid = [
      { ...valid, dailyLogs: 'logs' },
      { ...valid, dailyLogs: [unnamed] },
      { ...valid, dailyLogs: [{ ...sundayDrills, date: oct(25) }] },
      { ...valid, dailyLogs: [{ ...sundayDrills, date: '25.10.2026' }] },
      { ...valid, dailyLogs: [{ ...sundayDrills, id: 'log-1' }] },
      { ...valid, routines: [{ ...drills, daily: 'yes' }] },
    ]

    for (const json of invalid) {
      expect(() => parseBackup(json)).toThrow('קובץ הגיבוי לא תקין')
    }
  })

  it('a backup from before daily routines imports them as not daily, with no daily logs', async () => {
    const { daily: _daily, ...plain } = fullBody
    await db.dailyLogs.put(sundayDrills)

    await restoreBackup(parseBackup({ version: 1, exportedAt: oct(26), routines: [plain], workouts: [] }))

    expect(await db.routines.toArray()).toEqual([fullBody])
    expect(await db.dailyLogs.count()).toBe(0)
  })

  it('rejects a malformed activity', async () => {
    const valid = JSON.parse(JSON.stringify(await exportBackup(oct(26))))
    const { name: _name, ...unnamed } = boxing

    for (const bad of [unnamed, { ...boxing, finishedAt: null }, { ...boxing, kind: 'class' }]) {
      expect(() => parseBackup({ ...valid, workouts: [bad] })).toThrow('קובץ הגיבוי לא תקין')
    }
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
      { ...valid, routines: [{ ...fullBody, createdAt: '2026-10-29' }] },
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
    const [restored] = await finishedWorkouts()
    const [squatDone] = restored.sections[0].items[0].exercises

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

  it('a backup from before creation dates dates each routine from its last edit', async () => {
    const { createdAt: _createdAt, ...undated } = fullBody

    await restoreBackup(parseBackup({ version: 1, exportedAt: oct(26), routines: [undated], workouts: [] }))

    expect(await db.routines.toArray()).toEqual([{ ...fullBody, createdAt: 5 }])
  })

  it('the background photo stays out of the backup and survives a restore', async () => {
    await setBackground(new Blob(['photo'], { type: 'image/jpeg' }))
    await saveRoutine(fullBody)

    const json = JSON.parse(JSON.stringify(await exportBackup(oct(26))))
    await restoreBackup(parseBackup(json))

    expect(Object.keys(json).sort()).toEqual(['dailyLogs', 'exportedAt', 'routines', 'version', 'workouts'])
    expect(await db.settings.count()).toBe(1)
  })
})
