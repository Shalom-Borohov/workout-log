import { beforeEach, describe, expect, it } from 'vitest'
import { carryExerciseArea, claimExerciseArea, exerciseAreaMap, setExerciseArea } from '../../src/data/exerciseAreas'
import { areaOf } from '../../src/domain/bodyAreas'
import { resetDb } from '../helpers/db'

const savedArea = async (name: string) => areaOf(await exerciseAreaMap(), name)

describe('exercise areas', () => {
  beforeEach(resetDb)

  it('an exercise has no area until one is picked', async () => {
    expect(await savedArea('סקוואט')).toBeNull()

    await setExerciseArea('סקוואט', 'legs')

    expect(await savedArea('סקוואט')).toBe('legs')
  })

  it('picking no area clears the one the exercise had', async () => {
    await setExerciseArea('סקוואט', 'legs')
    await setExerciseArea('סקוואט', null)

    expect(await savedArea('סקוואט')).toBeNull()
    expect(await exerciseAreaMap()).toEqual(new Map())
  })

  it('maps every tagged exercise to its area', async () => {
    await setExerciseArea('סקוואט', 'legs')
    await setExerciseArea('חתירה', 'back')

    expect(await exerciseAreaMap()).toEqual(
      new Map([
        ['סקוואט', 'legs'],
        ['חתירה', 'back'],
      ]),
    )
  })

  describe('renaming an exercise', () => {
    it('gives the new name the old name’s area, and the old name keeps it for other routines', async () => {
      await setExerciseArea('סקוואט', 'legs')

      await carryExerciseArea('סקוואט', 'סקוואט גביע')

      expect(await savedArea('סקוואט גביע')).toBe('legs')
      expect(await savedArea('סקוואט')).toBe('legs')
    })

    it('keeps the new name’s own area', async () => {
      await setExerciseArea('סקוואט', 'legs')
      await setExerciseArea('גשר ישבן', 'glutes')

      await carryExerciseArea('סקוואט', 'גשר ישבן')

      expect(await savedArea('גשר ישבן')).toBe('glutes')
    })

    it('gives a newly named exercise the area picked before naming it', async () => {
      await claimExerciseArea('פלאנק', 'core')

      expect(await exerciseAreaMap()).toEqual(new Map([['פלאנק', 'core']]))
    })

    it('keeps the area a name already had over one picked before naming', async () => {
      await setExerciseArea('פלאנק', 'core')

      await claimExerciseArea('פלאנק', 'fullBody')

      expect(await savedArea('פלאנק')).toBe('core')
    })

    it('changes nothing when the name stays the same', async () => {
      await setExerciseArea('תרגיל חדש', 'core')

      await carryExerciseArea('תרגיל חדש', 'תרגיל חדש')

      expect(await exerciseAreaMap()).toEqual(new Map([['תרגיל חדש', 'core']]))
    })

    it('changes nothing when the old name has no area', async () => {
      await setExerciseArea('פלאנק', 'core')

      await carryExerciseArea('סקוואט', 'סקוואט גביע')
      await carryExerciseArea('תרגיל חדש', 'פלאנק')

      expect(await exerciseAreaMap()).toEqual(new Map([['פלאנק', 'core']]))
    })
  })
})
