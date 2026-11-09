import { beforeEach, describe, expect, it } from 'vitest'
import { exportBackup, parseBackup } from '../../src/data/backup'
import { exerciseAreaMap, setExerciseArea } from '../../src/data/exerciseAreas'
import { restoreBackup } from '../../src/data/restore'
import { resetDb } from '../helpers/db'
import { oct } from '../helpers/workouts'

describe('backup of exercise areas', () => {
  beforeEach(resetDb)

  it('exercise areas round-trip, replacing the ones on the phone', async () => {
    await setExerciseArea('סקוואט', 'legs')
    await setExerciseArea('חתירה', 'back')

    const json = JSON.parse(JSON.stringify(await exportBackup(oct(26))))

    await resetDb()
    await setExerciseArea('פלאנק', 'core')
    await restoreBackup(parseBackup(json), oct(27))

    expect(await exerciseAreaMap()).toEqual(
      new Map([
        ['סקוואט', 'legs'],
        ['חתירה', 'back'],
      ]),
    )
  })

  it('a backup from before exercise areas imports with none', async () => {
    await setExerciseArea('פלאנק', 'core')

    const backup = parseBackup({ version: 2, exportedAt: oct(26), routines: [], workouts: [], dailyLogs: [] })

    await restoreBackup(backup, oct(27))

    expect(backup.exerciseAreas).toEqual([])
    expect(await exerciseAreaMap()).toEqual(new Map())
  })

  it('rejects an unknown area or an unnamed exercise', async () => {
    const valid = JSON.parse(JSON.stringify(await exportBackup(oct(26))))

    const invalid = [
      { ...valid, exerciseAreas: 'legs' },
      { ...valid, exerciseAreas: [{ name: 'סקוואט', area: 'neck' }] },
      { ...valid, exerciseAreas: [{ name: 5, area: 'legs' }] },
      { ...valid, exerciseAreas: [{ area: 'legs' }] },
    ]

    for (const json of invalid) {
      expect(() => parseBackup(json)).toThrow('קובץ הגיבוי לא תקין')
    }
  })
})
