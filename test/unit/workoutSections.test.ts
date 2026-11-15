import { describe, expect, it } from 'vitest'
import { matchesRoutine } from '../../src/domain/routineFromWorkout'
import type { Routine, Workout } from '../../src/domain/types'
import { canRemoveSection, removeSection } from '../../src/domain/workoutStructure'
import { exercise, oct, open, reps, routine, workout } from '../helpers/workouts'

const base = workout({ id: 'w1', startedAt: oct(26), finishedAt: null, exercises: [exercise('סקוואט', [open(60, 10)])] })

const session: Workout = {
  ...base,
  sections: [{ name: 'חימום', items: [] }, base.sections[0], { name: 'סיום', items: [] }],
}

const plain = routine('r1', 'אימון גוף מלא', [[{ name: 'סקוואט', target: reps(10) }]])

const plan: Routine = {
  ...plain,
  sections: [{ id: 'warm', name: 'חימום', sets: 2, items: [] }, plain.sections[0], { id: 'end', name: 'סיום', sets: 3, items: [] }],
}

const sectionNames = (edited: Workout) => edited.sections.map((section) => section.name)

describe('removeSection', () => {
  it('drops an empty section and keeps the others in order', () => {
    expect(sectionNames(removeSection(session, 0))).toEqual(['עיקרי', 'סיום'])
    expect(sectionNames(removeSection(session, 2))).toEqual(['חימום', 'עיקרי'])
  })

  it('leaves a section that still has exercises', () => {
    expect(removeSection(session, 1)).toBe(session)
  })
})

describe('canRemoveSection', () => {
  it('is true only for a section with no exercises', () => {
    expect(session.sections.map(canRemoveSection)).toEqual([true, false, true])
  })
})

describe('a deleted section and the routine', () => {
  it('no longer matches a routine that still has the section', () => {
    expect(matchesRoutine(session, plan)).toBe(true)
    expect(matchesRoutine(removeSection(session, 0), plan)).toBe(false)
  })
})
