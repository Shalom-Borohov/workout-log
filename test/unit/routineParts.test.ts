import { describe, expect, it } from 'vitest'
import { routineParts, routinePartsLine } from '../../src/domain/routineParts'
import type { Routine, RoutineExercise, RoutineSection } from '../../src/domain/types'
import { reps, routine, routineExercise } from '../helpers/workouts'

const squat = routineExercise({ name: 'סקוואט', target: reps(12) })

const bike = routineExercise({ name: 'אופניים', target: reps(5) })

const pullUp = routineExercise({ name: 'מתח', target: reps(8) })

function section(name: string, items: RoutineExercise[][]): RoutineSection {
  return { id: name, name, sets: 3, items: items.map((exercises, index) => ({ id: `${name}-${index}`, sets: null, exercises })) }
}

const withSections = (sections: RoutineSection[]): Routine => ({ ...routine('r1', 'אימון גוף מלא', []), sections })

describe('routineParts', () => {
  it('gives each part its name and number of exercises, in order', () => {
    const fullBody = withSections([
      section('חימום', [[bike], [squat]]),
      section('עיקרי', [[squat], [pullUp], [bike]]),
      section('סיום', [[pullUp]]),
    ])

    expect(routineParts(fullBody)).toEqual([
      { name: 'חימום', exercises: 2 },
      { name: 'עיקרי', exercises: 3 },
      { name: 'סיום', exercises: 1 },
    ])
    expect(routinePartsLine(routineParts(fullBody))).toBe('חימום 2 · עיקרי 3 · סיום 1')
  })

  it('counts a pair as two exercises', () => {
    const legs = withSections([section('עיקרי', [[squat, pullUp], [bike]])])

    expect(routineParts(legs)).toEqual([{ name: 'עיקרי', exercises: 3 }])
    expect(routinePartsLine(routineParts(legs))).toBe('עיקרי 3')
  })

  it('names a part left without a name after the default part', () => {
    const unnamed = withSections([section('חימום', [[bike]]), section(' ', [[squat], [pullUp]])])

    expect(routineParts(unnamed)).toEqual([
      { name: 'חימום', exercises: 1 },
      { name: 'עיקרי', exercises: 2 },
    ])
    expect(routinePartsLine(routineParts(unnamed))).toBe('חימום 1 · עיקרי 2')
  })
})
