import { describe, expect, it } from 'vitest'
import type { PreviousLookup } from '../../src/domain/progress'
import type { RoutineItem, Workout, WorkoutItem } from '../../src/domain/types'
import {
  addItem,
  applyItemEdit,
  asRoutineItem,
  canRemoveItem,
  editItem,
  followIndex,
  moveItem,
  removeItem,
  setCount,
} from '../../src/domain/workoutStructure'
import { done, exercise, oct, open, reps, routineExercise, seconds, workout } from '../helpers/workouts'

const noHistory: PreviousLookup = () => null

const squatHistory: PreviousLookup = ({ name }) => (name === 'סקוואט' ? [done(60, 8), done(65, 6)] : null)

function sized(counts: number[]): Workout {
  return workout({
    id: 'w1',
    startedAt: oct(26),
    finishedAt: null,
    exercises: counts.map((count, index) => exercise(`תרגיל ${index}`, Array.from({ length: count }, () => open(20, 10)))),
  })
}

const squatItem: RoutineItem = {
  id: 'new',
  sets: 3,
  exercises: [routineExercise({ name: 'סקוואט', target: reps(10), tip: 'גב ישר' })],
}

describe('addItem', () => {
  it('appends the item with its own set count, prefilled from history', () => {
    const added = addItem(sized([2]), 0, squatItem, squatHistory).sections[0].items

    expect(added).toHaveLength(2)
    expect(added[1]).toEqual({
      id: 'new',
      exercises: [
        { name: 'סקוואט', target: reps(10), sets: [open(60, 8), open(65, 6), open(65, 6)], skipped: false, tip: 'גב ישר', note: '' },
      ],
    })
  })

  it('without its own count, takes the most common count in the section', () => {
    const item = { ...squatItem, sets: null }

    const counts = (base: Workout) =>
      addItem(base, 0, item, noHistory).sections[0].items.at(-1)?.exercises[0].sets.length

    expect(counts(sized([4, 2, 4]))).toBe(4)
    expect(counts(sized([2, 5]))).toBe(2)
    expect(counts(sized([]))).toBe(3)
  })
})

const ids = (target: Workout) => target.sections.map((section) => section.items.map((item) => item.id))

describe('removeItem and moveItem', () => {
  it('removeItem drops the referenced item', () => {
    expect(ids(removeItem(sized([1, 1, 1]), { section: 0, item: 1 }))).toEqual([['i0', 'i2']])
  })

  it('removeItem keeps the last item', () => {
    const original = sized([1])

    expect(canRemoveItem(original)).toBe(false)
    expect(removeItem(original, { section: 0, item: 0 })).toBe(original)
  })

  it('moveItem reorders within one section', () => {
    const original = sized([1, 1, 1])
    const twoSections = { ...original, sections: [{ name: 'חימום', items: [] }, ...original.sections] }

    expect(ids(moveItem(twoSections, 1, 0, 2))).toEqual([[], ['i1', 'i2', 'i0']])
  })
})

const pair: WorkoutItem = {
  id: 'p',
  exercises: [
    { ...exercise('לחיצת חזה', [done(40, 10), open(40, 10)]), tip: 'מרפקים פנימה', note: 'להעלות' },
    exercise('פלאנק', [done(null, 30), open(null, 30)], seconds(30)),
  ],
}

describe('editItem', () => {
  it('edits the item with that id through its routine view, leaving the others', () => {
    const original = sized([2, 2])
    const edited = editItem(original, 'i1', (view) => ({ ...view, sets: 3 }), noHistory)

    expect(edited.sections[0].items.map((item) => item.exercises[0].sets)).toEqual([
      [open(20, 10), open(20, 10)],
      [open(20, 10), open(20, 10), open(20, 10)],
    ])
    expect(editItem(original, 'missing', (view) => ({ ...view, sets: 3 }), noHistory)).toBe(original)
  })
})

describe('followIndex', () => {
  const original = sized([1, 1, 1])

  it('follows the current item when it moves', () => {
    expect(followIndex(original, moveItem(original, 0, 0, 2), 0)).toBe(2)
    expect(followIndex(original, moveItem(original, 0, 0, 2), 1)).toBe(0)
  })

  it('stays at the same place when the current item is removed, within range', () => {
    expect(followIndex(original, removeItem(original, { section: 0, item: 1 }), 1)).toBe(1)
    expect(followIndex(original, removeItem(original, { section: 0, item: 2 }), 2)).toBe(1)
  })
})

describe('asRoutineItem', () => {
  it('views a workout item as a routine item without weights', () => {
    expect(asRoutineItem(pair, 3)).toEqual({
      id: 'p',
      sets: 2,
      exercises: [
        { name: 'לחיצת חזה', target: reps(10), weight: null, tip: 'מרפקים פנימה' },
        { name: 'פלאנק', target: seconds(30), weight: null, tip: '' },
      ],
    })
  })

  it('leaves the set count to the section when it matches', () => {
    expect(asRoutineItem(pair, 2).sets).toBeNull()
  })
})

const benchHistory: PreviousLookup = ({ target }) => (target.kind === 'reps' ? [done(50, 8)] : [done(null, 45)])

describe('setCount', () => {
  it('counts the longer side of an uneven pair, as the live card shows it', () => {
    const uneven: WorkoutItem = {
      id: 'u',
      exercises: [exercise('לחיצת חזה', [done(40, 10), done(40, 10)]), exercise('מתח', [done(null, 6), open(null, 6), open(null, 6)])],
    }

    expect(setCount(uneven)).toBe(3)
  })
})

describe('applyItemEdit', () => {
  it('renames and retargets an exercise of the same kind, keeping its sets and note', () => {
    const view = asRoutineItem(pair, 2)

    const edited: RoutineItem = {
      ...view,
      exercises: [{ name: 'לחיצת חזה בשיפוע', target: reps(8), weight: null, tip: 'לאט' }, view.exercises[1]],
    }

    expect(applyItemEdit(pair, edited, 2, benchHistory).exercises).toEqual([
      { name: 'לחיצת חזה בשיפוע', target: reps(8), sets: [done(40, 10), open(40, 10)], skipped: false, tip: 'לאט', note: 'להעלות' },
      pair.exercises[1],
    ])
  })

  it('re-prefills an untouched exercise from the history of its new name and target', () => {
    const fresh: WorkoutItem = { id: 'n', exercises: [exercise('תרגיל חדש', [open(null, 10), open(null, 10)])] }
    const view = asRoutineItem(fresh, 2)
    const edited = { ...view, exercises: [{ ...view.exercises[0], name: 'סקוואט', target: reps(5) }] }

    expect(applyItemEdit(fresh, edited, 2, squatHistory).exercises[0].sets).toEqual([open(60, 8), open(65, 6)])
  })

  it('re-prefills an exercise whose kind changed and drops the second one when unpaired', () => {
    const view = asRoutineItem(pair, 2)
    const edited = { ...view, exercises: [{ ...view.exercises[0], target: seconds(60) }] }

    expect(applyItemEdit(pair, edited, 2, benchHistory).exercises).toEqual([
      { name: 'לחיצת חזה', target: seconds(60), sets: [open(null, 45), open(null, 45)], skipped: false, tip: 'מרפקים פנימה', note: 'להעלות' },
    ])
  })

  it('adds a prefilled exercise when paired', () => {
    const single: WorkoutItem = { id: 's', exercises: [pair.exercises[0]] }
    const view = asRoutineItem(single, 2)
    const edited = { ...view, exercises: [...view.exercises, routineExercise({ name: 'מתח', target: reps(6) })] }

    expect(applyItemEdit(single, edited, 2, benchHistory).exercises[1]).toEqual({
      name: 'מתח',
      target: reps(6),
      sets: [open(50, 8), open(50, 8)],
      skipped: false,
      tip: '',
      note: '',
    })
  })

  const setsAfter = (item: WorkoutItem, sets: number | null, sectionSets: number) =>
    applyItemEdit(item, { ...asRoutineItem(item, sectionSets), sets }, sectionSets, benchHistory).exercises.map(
      (itemExercise) => itemExercise.sets,
    )

  it('adds trailing sets copied from the last one', () => {
    expect(setsAfter(pair, 3, 2)).toEqual([
      [done(40, 10), open(40, 10), open(40, 10)],
      [done(null, 30), open(null, 30), open(null, 30)],
    ])
  })

  it('takes the section count when the item has none', () => {
    expect(setsAfter(pair, null, 3)).toEqual([
      [done(40, 10), open(40, 10), open(40, 10)],
      [done(null, 30), open(null, 30), open(null, 30)],
    ])
  })

  it('removes trailing sets but never a done one', () => {
    const item: WorkoutItem = {
      id: 'x',
      exercises: [exercise('סקוואט', [done(60, 10), done(60, 10), open(60, 10), open(60, 10)])],
    }

    expect(setsAfter(item, 3, 4)).toEqual([[done(60, 10), done(60, 10), open(60, 10)]])
    expect(setsAfter(item, 1, 4)).toEqual([[done(60, 10), done(60, 10)]])
  })
})
