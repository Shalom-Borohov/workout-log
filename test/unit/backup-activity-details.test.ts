import { beforeEach, describe, expect, it } from 'vitest'
import { activityDetailsMap, setActivityLocation, setActivityNote } from '../../src/data/activityDetails'
import { countBadRecords, exportBackup, parseBackup } from '../../src/data/backup'
import { restoreBackup } from '../../src/data/restore'
import { resetDb } from '../helpers/db'
import { oct } from '../helpers/workouts'

describe('backup of activity details', () => {
  beforeEach(resetDb)

  it('activity details round-trip, replacing the ones on the phone', async () => {
    await setActivityNote('ריצה', 'קצב קל')
    await setActivityLocation('שחייה', 'בריכה עירונית')

    const json = JSON.parse(JSON.stringify(await exportBackup(oct(26))))

    await resetDb()
    await setActivityNote('יוגה', 'מזרן')
    await restoreBackup(parseBackup(json), oct(27))

    expect(await activityDetailsMap()).toEqual(
      new Map([
        ['ריצה', { name: 'ריצה', note: 'קצב קל', location: '' }],
        ['שחייה', { name: 'שחייה', note: '', location: 'בריכה עירונית' }],
      ]),
    )
  })

  it('a backup from before activity details imports with none', async () => {
    await setActivityNote('יוגה', 'מזרן')

    const backup = parseBackup({ version: 2, exportedAt: oct(26), routines: [], workouts: [], dailyLogs: [], exerciseAreas: [] })

    await restoreBackup(backup, oct(27))

    expect(backup.activityDetails).toEqual([])
    expect(await activityDetailsMap()).toEqual(new Map())
  })

  it('rejects activity details that are not a list or miss a field', async () => {
    const valid = JSON.parse(JSON.stringify(await exportBackup(oct(26))))

    const invalid = [
      { ...valid, activityDetails: 'ריצה' },
      { ...valid, activityDetails: [{ name: 'ריצה', note: 'קל' }] },
      { ...valid, activityDetails: [{ name: 'ריצה', location: 'פארק' }] },
      { ...valid, activityDetails: [{ name: 5, note: '', location: '' }] },
      { ...valid, activityDetails: [{ note: '', location: '' }] },
    ]

    for (const json of invalid) {
      expect(() => parseBackup(json)).toThrow('קובץ הגיבוי לא תקין')
    }
  })

  it('counts a bad activity details row in the file', async () => {
    const valid = JSON.parse(JSON.stringify(await exportBackup(oct(26))))

    const withBadRow = {
      ...valid,
      activityDetails: [
        { name: 'ריצה', note: '', location: 'פארק' },
        { name: 'שחייה', note: 3, location: '' },
      ],
    }

    expect(countBadRecords(JSON.stringify(withBadRow))).toBe(1)
  })
})
