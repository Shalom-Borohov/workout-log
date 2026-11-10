import { describe, expect, it } from 'vitest'
import { addItemAfter, duplicateRoutine, namedOrDefault, newExercise, newRoutine, setSectionSets } from '../../src/domain/routineEdit'
import type { Routine } from '../../src/domain/types'
import { counter } from '../helpers/ids'
import { reps, routineExercise } from '../helpers/workouts'

const squat = routineExercise({ name: 'סקוואט', target: reps(12), weight: 40, tip: 'גב ישר' })

const legs: Routine = {
  id: 'r1',
  name: 'אימון רגליים',
  daily: false,
  color: null,
  archived: false,
  createdAt: 50,
  updatedAt: 100,
  sections: [
    { id: 's1', name: 'חימום', sets: 2, items: [{ id: 'i1', sets: null, exercises: [squat] }] },
    { id: 's2', name: 'עיקרי', sets: 3, items: [{ id: 'i2', sets: 4, exercises: [squat, squat] }] },
  ],
}

describe('duplicateRoutine', () => {
  it('copies the routine under fresh ids, a copy name and a new creation date', () => {
    expect(duplicateRoutine(legs, counter(), 500)).toEqual({
      id: 'n1',
      name: 'אימון רגליים (עותק)',
      daily: false,
      color: null,
      archived: false,
      createdAt: 500,
      updatedAt: 500,
      sections: [
        { id: 'n2', name: 'חימום', sets: 2, items: [{ id: 'n3', sets: null, exercises: [squat] }] },
        { id: 'n4', name: 'עיקרי', sets: 3, items: [{ id: 'n5', sets: 4, exercises: [squat, squat] }] },
      ],
    })
  })

  it('a copy of a daily routine is daily too, in the same colour and out of the archive', () => {
    expect(duplicateRoutine({ ...legs, daily: true, color: 'teal', archived: true }, counter(), 500)).toMatchObject({
      daily: true,
      color: 'teal',
      archived: false,
    })
  })

  it('leaves the original routine unchanged', () => {
    const before = structuredClone(legs)

    duplicateRoutine(legs, counter(), 500)

    expect(legs).toEqual(before)
  })
})

describe('newRoutine', () => {
  it('is created now', () => {
    expect(newRoutine('r2', 's1', 700)).toMatchObject({
      id: 'r2',
      daily: false,
      color: null,
      archived: false,
      createdAt: 700,
      updatedAt: 700,
    })
  })
})

describe('setSectionSets', () => {
  it('keeps an exercise’s own set count while the section count steps past it', () => {
    const section = {
      id: 's1',
      name: 'עיקרי',
      sets: 3,
      items: [
        { id: 'a', sets: null, exercises: [squat] },
        { id: 'b', sets: 4, exercises: [squat] },
      ],
    }

    expect(setSectionSets(setSectionSets(section, 4), 5)).toEqual({
      ...section,
      sets: 5,
      items: [
        { id: 'a', sets: null, exercises: [squat] },
        { id: 'b', sets: 4, exercises: [squat] },
      ],
    })
  })
})

describe('addItemAfter', () => {
  const press = routineExercise({ name: 'לחיצת חזה', target: reps(10), weight: null })
  const added = { id: 'new', sets: null, exercises: [press] }

  it('puts the item right after the given one, in its section', () => {
    const withThree: Routine = {
      ...legs,
      sections: [
        legs.sections[0],
        { ...legs.sections[1], items: [legs.sections[1].items[0], { id: 'i3', sets: null, exercises: [squat] }] },
      ],
    }

    const ids = addItemAfter(withThree, 'i2', added).sections.map((section) => section.items.map((item) => item.id))

    expect(ids).toEqual([['i1'], ['i2', 'new', 'i3']])
  })

  it('after the last item of a section, ends that section', () => {
    const ids = addItemAfter(legs, 'i1', added).sections.map((section) => section.items.map((item) => item.id))

    expect(ids).toEqual([['i1', 'new'], ['i2']])
  })
})

describe('newExercise', () => {
  it('takes the given name', () => {
    expect(newExercise('פולאובר').name).toBe('פולאובר')
  })

  it('is named "תרגיל חדש" by default', () => {
    expect(newExercise().name).toBe('תרגיל חדש')
  })
})

describe('namedOrDefault', () => {
  it('trims the name', () => {
    expect(namedOrDefault('  פולאובר ')).toBe('פולאובר')
  })

  it('falls back to "תרגיל חדש" for a blank name', () => {
    expect(namedOrDefault('  ')).toBe('תרגיל חדש')
  })
})
