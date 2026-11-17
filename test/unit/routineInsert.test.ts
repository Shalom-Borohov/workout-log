import { describe, expect, it } from 'vitest'
import { addItemsAfter, appendItems, replaceExercise } from '../../src/domain/routineEdit'
import type { Routine, RoutineItem, RoutineSection } from '../../src/domain/types'
import { reps, routineExercise, seconds } from '../helpers/workouts'

const squat = routineExercise({ name: 'סקוואט', target: reps(12), weight: 40, tip: 'גב ישר' })

const bench = routineExercise({ name: 'לחיצת חזה', target: reps(10) })

const plank = routineExercise({ name: 'פלאנק', target: seconds(45) })

const deadlift = routineExercise({ name: 'דדליפט', target: reps(8), tip: 'גב ישר' })

const pullUp = routineExercise({ name: 'מתח', target: reps(6) })

const picked = (id: string, exercise = deadlift): RoutineItem => ({ id, sets: null, exercises: [exercise] })

const legs: Routine = {
  id: 'r1',
  name: 'אימון רגליים',
  daily: false,
  color: null,
  archived: false,
  createdAt: 50,
  updatedAt: 100,
  sections: [
    {
      id: 's1',
      name: 'עיקרי',
      sets: 3,
      items: [
        { id: 'i1', sets: 5, exercises: [squat] },
        { id: 'i2', sets: null, exercises: [bench, plank] },
        { id: 'i3', sets: 2, exercises: [pullUp] },
      ],
    },
  ],
}

const sectionItems = (routine: Routine) => routine.sections[0].items.map(({ id, sets }) => ({ id, sets }))

describe('appendItems', () => {
  it('adds the items at the end of the section, each with the sets of its last item', () => {
    const section: RoutineSection = { id: 's1', name: 'עיקרי', sets: 3, items: [{ id: 'i1', sets: 5, exercises: [squat] }] }

    expect(appendItems(section, [picked('n1'), picked('n2', pullUp)]).items).toEqual([
      { id: 'i1', sets: 5, exercises: [squat] },
      { id: 'n1', sets: 5, exercises: [deadlift] },
      { id: 'n2', sets: 5, exercises: [pullUp] },
    ])
  })

  it('leaves the sets to the section in an empty section', () => {
    const section: RoutineSection = { id: 's1', name: 'עיקרי', sets: 4, items: [] }

    expect(appendItems(section, [{ ...picked('n1'), sets: 6 }]).items).toEqual([{ id: 'n1', sets: null, exercises: [deadlift] }])
  })
})

describe('addItemsAfter', () => {
  it('inserts the items right after the item, in order, with that item’s sets', () => {
    expect(sectionItems(addItemsAfter(legs, 'i1', [picked('n1'), picked('n2')]))).toEqual([
      { id: 'i1', sets: 5 },
      { id: 'n1', sets: 5 },
      { id: 'n2', sets: 5 },
      { id: 'i2', sets: null },
      { id: 'i3', sets: 2 },
    ])
  })

  it('after a pair, goes after the whole pair and keeps the section default', () => {
    expect(sectionItems(addItemsAfter(legs, 'i2', [picked('n1')]))).toEqual([
      { id: 'i1', sets: 5 },
      { id: 'i2', sets: null },
      { id: 'n1', sets: null },
      { id: 'i3', sets: 2 },
    ])
  })

  it('leaves the routine as it is for an unknown item', () => {
    expect(addItemsAfter(legs, 'missing', [picked('n1')])).toEqual(legs)
  })
})

describe('replaceExercise', () => {
  it('puts the exercise in place of that one exercise and keeps the item’s id, sets and pair order', () => {
    expect(replaceExercise({ id: 'i2', sets: 4, exercises: [bench, plank] }, 1, deadlift)).toEqual({
      id: 'i2',
      sets: 4,
      exercises: [bench, deadlift],
    })
  })
})
