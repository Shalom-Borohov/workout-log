import { beforeEach, describe, expect, it } from 'vitest'
import { readAccentColor, saveAccentColor } from '../../src/data/accentColor'
import { exportBackup, parseBackup } from '../../src/data/backup'
import { restoreBackup } from '../../src/data/restore'
import { db } from '../../src/data/db'
import { background, setBackground } from '../../src/data/background'
import { backupStatus } from '../../src/data/backupStatus'
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

const boxing = activity({ id: 'a1', startedAt: oct(21, 19), summary: 'ספארינג', location: 'מועדון הדרום' })

const drills = {
  ...routine('d1', 'חטיפי תנועה', [[{ name: 'גשר ישבן', target: reps(15) }]]),
  daily: true,
  color: 'teal' as const,
  archived: true,
}

const sundayDrills = dailyLog('d1', '2026-10-25', [{ name: 'גשר ישבן', sets: 2, target: reps(20) }])

describe('backup', () => {
  beforeEach(resetDb)

  it('backup round-trips', async () => {
    await saveRoutine(fullBody)
    await saveWorkout({ ...past, summary: 'הרגשתי חזק' })

    const json = JSON.parse(JSON.stringify(await exportBackup(oct(26))))

    await resetDb()
    await saveRoutine({ ...fullBody, id: 'other' })
    await restoreBackup(parseBackup(json), oct(27))

    expect(json.version).toBe(2)
    expect(json.exportedAt).toBe(oct(26))
    expect(await db.routines.toArray()).toEqual([fullBody])
    expect(await db.workouts.toArray()).toEqual([{ ...past, summary: 'הרגשתי חזק' }])
  })

  it('an activity round-trips with the workouts', async () => {
    await saveWorkout(past)
    await saveRecord(boxing)

    const json = JSON.parse(JSON.stringify(await exportBackup(oct(26))))

    await resetDb()
    await restoreBackup(parseBackup(json), oct(27))

    expect(await finishedRecords()).toEqual([boxing, past])
  })

  it('daily routines and their logs round-trip', async () => {
    await saveRoutine(drills)
    await db.dailyLogs.put(sundayDrills)

    const json = JSON.parse(JSON.stringify(await exportBackup(oct(26))))

    await resetDb()
    await db.dailyLogs.put(dailyLog('other', '2026-10-20'))
    await restoreBackup(parseBackup(json), oct(27))

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
      { ...valid, routines: [{ ...drills, color: 'magenta' }] },
      { ...valid, routines: [{ ...drills, archived: 'yes' }] },
      { ...valid, dailyLogs: [{ ...sundayDrills, exercises: 'all' }] },
      { ...valid, dailyLogs: [{ ...sundayDrills, exercises: [{ name: 'גשר ישבן', sets: '2', target: reps(20) }] }] },
      { ...valid, dailyLogs: [{ ...sundayDrills, exercises: [{ name: 'גשר ישבן', sets: 2, target: { kind: 'reps' } }] }] },
    ]

    for (const json of invalid) {
      expect(() => parseBackup(json)).toThrow('קובץ הגיבוי לא תקין')
    }
  })

  it('a backup from before daily routines imports them as not daily, with no daily logs', async () => {
    const { daily: _daily, ...plain } = fullBody
    await db.dailyLogs.put(sundayDrills)

    await restoreBackup(parseBackup({ version: 1, exportedAt: oct(26), routines: [plain], workouts: [] }), oct(27))

    expect(await db.routines.toArray()).toEqual([fullBody])
    expect(await db.dailyLogs.count()).toBe(0)
  })

  it('a backup from before drill colours colours its daily routines and fills its logs from them', async () => {
    const { color: _color, archived: _archived, ...uncoloured } = drills
    const { exercises: _exercises, ...bare } = sundayDrills

    const backup = parseBackup({ version: 2, exportedAt: oct(26), routines: [uncoloured], workouts: [], dailyLogs: [bare] })

    expect(backup.routines).toEqual([{ ...drills, color: 'red', archived: false }])
    expect(backup.dailyLogs).toEqual([{ ...bare, exercises: [{ name: 'גשר ישבן', sets: 3, target: reps(15) }] }])
  })

  it('rejects a malformed activity', async () => {
    const valid = JSON.parse(JSON.stringify(await exportBackup(oct(26))))
    const { name: _name, ...unnamed } = boxing

    for (const bad of [unnamed, { ...boxing, finishedAt: null }, { ...boxing, kind: 'class' }, { ...boxing, location: 5 }]) {
      expect(() => parseBackup({ ...valid, workouts: [bad] })).toThrow('קובץ הגיבוי לא תקין')
    }
  })

  it('an activity from before locations imports with an empty location', async () => {
    const { location: _location, ...noLocation } = boxing

    await restoreBackup(parseBackup({ version: 1, exportedAt: oct(26), routines: [], workouts: [noLocation] }), oct(27))

    expect(await finishedRecords()).toEqual([{ ...boxing, location: '' }])
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
      { ...valid, version: 3 },
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

    await restoreBackup(parseBackup(legacy), oct(27))

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

    await restoreBackup(parseBackup({ version: 1, exportedAt: oct(26), routines: [undated], workouts: [] }), oct(27))

    expect(await db.routines.toArray()).toEqual([{ ...fullBody, createdAt: 5 }])
  })

  it('the background photo stays out of the backup and survives a restore', async () => {
    await setBackground(new Blob(['photo'], { type: 'image/jpeg' }))
    await saveRoutine(fullBody)

    const json = JSON.parse(JSON.stringify(await exportBackup(oct(26))))
    await restoreBackup(parseBackup(json), oct(27))

    expect(Object.keys(json).sort()).toEqual(['dailyLogs', 'exerciseAreas', 'exportedAt', 'routines', 'version', 'workouts'])
    expect(await background()).toBeDefined()
  })

  it('the accent colour stays out of the backup and survives a restore', async () => {
    saveAccentColor('indigo')
    await saveRoutine(fullBody)

    const exported = JSON.stringify(await exportBackup(oct(26)))

    expect(exported).not.toContain('indigo')

    saveAccentColor('blue')
    await restoreBackup(parseBackup(JSON.parse(exported)), oct(27))

    expect(readAccentColor()).toBe('blue')
  })

  it('a restore counts as a backup made when the file was exported', async () => {
    const active = workout({ id: 'w2', startedAt: oct(25), finishedAt: null, exercises: [] })

    await restoreBackup(parseBackup({ version: 2, exportedAt: oct(25, 12), routines: [], workouts: [past, boxing, active] }), oct(27))

    expect(await backupStatus()).toEqual({ backedUpAt: oct(25, 12), records: 2 })
  })

  it('carries next-time notes forward from a backup made before notes carried over, but not from a newer one', () => {
    const noted = workout({ id: 'a', startedAt: oct(12), exercises: [{ ...exercise('סקוואט', [done(50, 10)]), note: 'ברכיים החוצה' }] })
    const cleared = workout({ id: 'b', startedAt: oct(19), exercises: [exercise('סקוואט', [done(55, 10)])] })
    const note = (backup: unknown) => parseBackup(backup).workouts.flatMap((record) => (record.kind === 'activity' ? [] : record.sections[0].items[0].exercises[0].note))

    expect(note({ version: 1, exportedAt: oct(26), routines: [], workouts: [noted, cleared] })).toEqual(['ברכיים החוצה', 'ברכיים החוצה'])
    expect(note({ version: 2, exportedAt: oct(26), routines: [], workouts: [noted, cleared] })).toEqual(['ברכיים החוצה', ''])
  })
})
