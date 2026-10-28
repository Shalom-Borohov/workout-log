import { describe, expect, it } from 'vitest'
import { duplicateRoutine, setSectionSets } from '../../src/domain/routineEdit'
import type { Routine } from '../../src/domain/types'
import { counter } from '../helpers/ids'
import { reps, routineExercise } from '../helpers/workouts'

const squat = routineExercise({ name: 'סקוואט', target: reps(12), weight: 40, tip: 'גב ישר' })

const legs: Routine = {
  id: 'r1',
  name: 'אימון רגליים',
  updatedAt: 100,
  sections: [
    { id: 's1', name: 'חימום', sets: 2, items: [{ id: 'i1', sets: null, exercises: [squat] }] },
    { id: 's2', name: 'עיקרי', sets: 3, items: [{ id: 'i2', sets: 4, exercises: [squat, squat] }] },
  ],
}

describe('duplicateRoutine', () => {
  it('copies the routine under fresh ids and a copy name', () => {
    expect(duplicateRoutine(legs, counter(), 500)).toEqual({
      id: 'n1',
      name: 'אימון רגליים (עותק)',
      updatedAt: 500,
      sections: [
        { id: 'n2', name: 'חימום', sets: 2, items: [{ id: 'n3', sets: null, exercises: [squat] }] },
        { id: 'n4', name: 'עיקרי', sets: 3, items: [{ id: 'n5', sets: 4, exercises: [squat, squat] }] },
      ],
    })
  })

  it('leaves the original routine unchanged', () => {
    const before = structuredClone(legs)

    duplicateRoutine(legs, counter(), 500)

    expect(legs).toEqual(before)
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
