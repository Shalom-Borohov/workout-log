import { beforeEach, describe, expect, it } from 'vitest'
import {
  activityDetailsMap,
  saveActivity,
  setActivityLocation,
  setActivityNote,
} from '../../src/data/activityDetails'
import { db } from '../../src/data/db'
import { saveRecord } from '../../src/data/repo'
import { activity, oct } from '../helpers/workouts'
import { resetDb } from '../helpers/db'

const detailsOf = async (name: string) => (await activityDetailsMap()).get(name)

const before = (name: string) => activity({ id: 'a1', name, startedAt: oct(20, 7) })

describe('activity details', () => {
  beforeEach(resetDb)

  it('an activity has no details until a note or a location is saved', async () => {
    expect(await activityDetailsMap()).toEqual(new Map())
  })

  it('keeps a note per activity name, trimmed', async () => {
    await setActivityNote('אגרוף תאילנדי', '  חניה ברחוב ביאליק  ')

    expect(await detailsOf('אגרוף תאילנדי')).toEqual({
      name: 'אגרוף תאילנדי',
      note: 'חניה ברחוב ביאליק',
      location: '',
    })
  })

  it('a first note keeps the location the activity already remembered from its sessions', async () => {
    await saveRecord(activity({ id: 'a1', startedAt: oct(20, 19), location: 'מועדון הגבעה' }))

    await setActivityNote('אגרוף תאילנדי', 'להביא כפפות')

    expect(await detailsOf('אגרוף תאילנדי')).toEqual({
      name: 'אגרוף תאילנדי',
      note: 'להביא כפפות',
      location: 'מועדון הגבעה',
    })
  })

  it('changing the location keeps the note, and changing the note keeps the location', async () => {
    await setActivityNote('פילאטיס', 'קומה 2')
    await setActivityLocation('פילאטיס', ' סטודיו גל ')
    await setActivityNote('פילאטיס', 'קומה 3')

    expect(await detailsOf('פילאטיס')).toEqual({ name: 'פילאטיס', note: 'קומה 3', location: 'סטודיו גל' })
  })

  it('a location saved before any note starts with an empty note', async () => {
    await setActivityLocation('ריצה', 'פארק הירקון')

    expect(await detailsOf('ריצה')).toEqual({ name: 'ריצה', note: '', location: 'פארק הירקון' })
  })

  describe('renaming an activity', () => {
    it('gives the new name the old name’s note and location, and the old name keeps them', async () => {
      await setActivityNote('פילאטיס', 'קומה 2')
      await setActivityLocation('פילאטיס', 'סטודיו גל')

      await saveActivity(activity({ id: 'a1', name: 'פילאטיס מכשירים', startedAt: oct(20, 7) }), before('פילאטיס'))

      expect(await detailsOf('פילאטיס מכשירים')).toEqual({
        name: 'פילאטיס מכשירים',
        note: 'קומה 2',
        location: 'סטודיו גל',
      })
      expect(await detailsOf('פילאטיס')).toEqual({ name: 'פילאטיס', note: 'קומה 2', location: 'סטודיו גל' })
    })

    it('keeps the new name’s own details', async () => {
      await setActivityNote('פילאטיס', 'קומה 2')
      await setActivityNote('יוגה', 'להביא מזרן')

      await saveActivity(activity({ id: 'a1', name: 'יוגה', startedAt: oct(20, 7) }), before('פילאטיס'))

      expect(await detailsOf('יוגה')).toEqual({ name: 'יוגה', note: 'להביא מזרן', location: '' })
    })

    it('changes nothing when the old name has no details', async () => {
      await saveActivity(activity({ id: 'a1', name: 'ריצה ארוכה', startedAt: oct(20, 7) }), before('ריצה'))

      expect(await activityDetailsMap()).toEqual(new Map())
    })
  })

  describe('saving an activity', () => {
    it('stores the session and remembers its location for the name', async () => {
      const record = activity({ id: 'a1', name: 'ריצה', startedAt: oct(20, 7), location: 'פארק הירקון' })

      await saveActivity(record, null)

      expect(await db.workouts.get('a1')).toEqual(record)
      expect(await detailsOf('ריצה')).toEqual({ name: 'ריצה', note: '', location: 'פארק הירקון' })
    })

    it('leaves the details alone when the session has no location', async () => {
      await saveActivity(activity({ id: 'a1', name: 'ריצה', startedAt: oct(20, 7) }), null)

      expect(await activityDetailsMap()).toEqual(new Map())
    })

    it('editing a session without changing its location keeps the location set on the activity page', async () => {
      const old = activity({ id: 'a1', startedAt: oct(10, 19), location: 'מועדון הגבעה' })

      await setActivityLocation('אגרוף תאילנדי', 'סטודיו גל')
      await saveActivity({ ...old, finishedAt: oct(10, 20, 30) }, old)

      expect(await detailsOf('אגרוף תאילנדי')).toEqual({ name: 'אגרוף תאילנדי', note: '', location: 'סטודיו גל' })
    })

    it('editing a session’s location remembers the new one', async () => {
      const old = activity({ id: 'a1', startedAt: oct(10, 19), location: 'מועדון הגבעה' })

      await setActivityLocation('אגרוף תאילנדי', 'סטודיו גל')
      await saveActivity({ ...old, location: 'אולם חדש' }, old)

      expect(await detailsOf('אגרוף תאילנדי')).toEqual({ name: 'אגרוף תאילנדי', note: '', location: 'אולם חדש' })
    })

    it('a rename carries the old name’s details, and the typed location wins', async () => {
      await setActivityNote('פילאטיס', 'קומה 2')
      await setActivityLocation('פילאטיס', 'סטודיו גל')

      await saveActivity(
        activity({ id: 'a1', name: 'פילאטיס מכשירים', startedAt: oct(20, 7), location: 'סטודיו חדש' }),
        before('פילאטיס'),
      )

      expect(await detailsOf('פילאטיס מכשירים')).toEqual({
        name: 'פילאטיס מכשירים',
        note: 'קומה 2',
        location: 'סטודיו חדש',
      })
    })
  })
})
