import { describe, expect, it } from 'vitest'
import { parseNote } from '../../src/domain/parseNote'
import { counter } from '../helpers/ids'
import { reps, seconds } from '../helpers/workouts'

const firstItem = (lines: string) => parseNote(`אימון\n${lines}`, counter()).sections[0].items[0]

const exerciseOf = (line: string) => {
  const [exercise] = firstItem(line).exercises

  return { name: exercise.name, target: exercise.target }
}

describe('clock time in a pasted note', () => {
  it('reads minutes and seconds as a time', () => {
    expect(exerciseOf('פלאנק 1:30')).toEqual({ name: 'פלאנק', target: seconds(90) })
    expect(exerciseOf('פלאנק 1:30 דקות')).toEqual({ name: 'פלאנק', target: seconds(90) })
  })

  it('reads a decimal number of minutes, to the second', () => {
    expect(exerciseOf('פלאנק 1.5 דקות')).toEqual({ name: 'פלאנק', target: seconds(90) })
    expect(exerciseOf('ריצה 0.5 דקה')).toEqual({ name: 'ריצה', target: seconds(30) })
  })
})

describe('sets times an amount in a pasted note', () => {
  const setsAndExercise = (line: string) => ({ sets: firstItem(line).sets, ...exerciseOf(line) })

  it('reads the sets before the x as the exercise own set count', () => {
    const threeByTwelve = { sets: 3, name: 'סקוואט', target: reps(12) }

    expect(setsAndExercise('סקוואט 3x12')).toEqual(threeByTwelve)
    expect(setsAndExercise('סקוואט 3 x 12')).toEqual(threeByTwelve)
    expect(setsAndExercise('סקוואט 3X12')).toEqual(threeByTwelve)
    expect(setsAndExercise('סקוואט 3×12')).toEqual(threeByTwelve)
    expect(setsAndExercise('סקוואט 3*12')).toEqual(threeByTwelve)
    expect(setsAndExercise('פלאנק 3x30 שניות')).toEqual({ sets: 3, name: 'פלאנק', target: seconds(30) })
  })

  it('keeps no own count when it matches the section', () => {
    expect(firstItem('עיקרי 3 סטים:\nסקוואט 3x12').sets).toBeNull()
    expect(firstItem('עיקרי 3 סטים:\nסקוואט 4x12').sets).toBe(4)
  })

  it('keeps the count between 1 and 10', () => {
    expect(firstItem('סקוואט 20x5').sets).toBe(10)
    expect(firstItem('עיקרי 3 סטים:\nסקוואט 0x5').sets).toBe(1)
  })

  it('gives a pair the larger count of its two exercises', () => {
    expect(firstItem('משיכה לפנים 3x12 -> הכנסת סנטר 4x10').sets).toBe(4)
    expect(firstItem('משיכה לפנים 12 -> הכנסת סנטר 4x10').sets).toBe(4)
  })

  it('counts the section sets for the exercise of a pair that states none', () => {
    expect(firstItem('עיקרי 3 סטים:\nמשיכה לפנים 12 -> הכנסת סנטר 2x10').sets).toBeNull()
  })
})

describe('an unclear amount in a pasted note', () => {
  const unclearSquat = { name: 'סקוואט', target: reps(0) }

  it('marks a range with no amount and keeps the name without it', () => {
    expect(exerciseOf('סקוואט 8-10')).toEqual(unclearSquat)
    expect(exerciseOf('סקוואט 8–10')).toEqual(unclearSquat)
    expect(exerciseOf('סקוואט 8—10')).toEqual(unclearSquat)
    expect(exerciseOf('סקוואט 8 עד 10')).toEqual(unclearSquat)
  })

  it('marks seconds over 59 in a clock time', () => {
    expect(exerciseOf('פלאנק 1:75')).toEqual({ name: 'פלאנק', target: reps(0) })
    expect(exerciseOf('פלאנק 1:75 שניות')).toEqual({ name: 'פלאנק', target: seconds(0) })
  })

  it('marks two numbers with no amount and keeps the name without them', () => {
    expect(exerciseOf('סקוואט 12 40')).toEqual(unclearSquat)
  })

  it('keeps a marked line with a time unit as a time', () => {
    const unclearPlank = { name: 'פלאנק', target: seconds(0) }

    expect(exerciseOf('פלאנק 30-45 שניות')).toEqual(unclearPlank)
    expect(exerciseOf('פלאנק 1,5 דקות')).toEqual(unclearPlank)
  })

  it('marks a decimal that is not minutes', () => {
    expect(exerciseOf('ריצה 2.5')).toEqual({ name: 'ריצה', target: reps(0) })
    expect(exerciseOf('פלאנק 2.5 שניות')).toEqual({ name: 'פלאנק', target: seconds(0) })
  })

  it('keeps the sets of a marked line written as sets times a range', () => {
    expect({ sets: firstItem('סקוואט 3x8-10').sets, ...exerciseOf('סקוואט 3x8-10') }).toEqual({ sets: 3, ...unclearSquat })
  })

  it('drops a number cut short from the name of a line with no amount', () => {
    expect(exerciseOf('סקוואט 8-')).toEqual(unclearSquat)
  })

  it('keeps an x or a dash that is part of the name', () => {
    expect(exerciseOf('Box jump 12')).toEqual({ name: 'Box jump', target: reps(12) })
    expect(exerciseOf('פול-אפ 8')).toEqual({ name: 'פול-אפ', target: reps(8) })
  })

  it('keeps a digit joined to the name', () => {
    expect(exerciseOf('T3 12')).toEqual({ name: 'T3', target: reps(12) })
  })

  it('still reads a first line with a time as an exercise', () => {
    const result = parseNote('פלאנק 1:30\nסקוואט 15', counter())

    expect(result.name).toBe('אימון חדש')
    expect(result.sections[0].items[0].exercises[0].target).toEqual(seconds(90))
  })
})
