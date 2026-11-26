import { describe, expect, it } from 'vitest'
import { parseNote } from '../../src/domain/parseNote'
import { counter } from '../helpers/ids'
import { reps, seconds } from '../helpers/workouts'

const firstItem = (lines: string) => parseNote(`אימון\n${lines}`, counter()).sections[0].items[0]

const exerciseOf = (line: string) => {
  const [exercise] = firstItem(line).exercises

  return { name: exercise.name, target: exercise.target }
}

describe('minutes and seconds in words in a pasted note', () => {
  it('adds minutes and seconds written one after the other', () => {
    expect(exerciseOf('פלאנק 2 דקות 30 שניות')).toEqual({ name: 'פלאנק', target: seconds(150) })
    expect(exerciseOf("פלאנק 2 דק' 30 שנ'")).toEqual({ name: 'פלאנק', target: seconds(150) })
  })

  it('reads the seconds joined with ו', () => {
    expect(exerciseOf('פלאנק 1 דקה ו30 שניות')).toEqual({ name: 'פלאנק', target: seconds(90) })
    expect(exerciseOf('פלאנק 1 דקה ו-30 שניות')).toEqual({ name: 'פלאנק', target: seconds(90) })
    expect(exerciseOf('פלאנק 1 דקה ו 30 שניות')).toEqual({ name: 'פלאנק', target: seconds(90) })
  })

  it('reads a number with no unit after the minutes as seconds', () => {
    expect(exerciseOf('פלאנק 2 דקות 30')).toEqual({ name: 'פלאנק', target: seconds(150) })
    expect(exerciseOf('פלאנק 1 דקה ו30')).toEqual({ name: 'פלאנק', target: seconds(90) })
  })

  it('marks seconds over 59', () => {
    expect(exerciseOf('פלאנק 1 דקה 75 שניות')).toEqual({ name: 'פלאנק', target: seconds(0) })
  })
})

describe('time units as the iPhone types them', () => {
  it('reads an abbreviation with a curly apostrophe or none', () => {
    expect(exerciseOf('מדרגות 15 דק’')).toEqual({ name: 'מדרגות', target: seconds(900) })
    expect(exerciseOf('מתיחה 30 שנ’')).toEqual({ name: 'מתיחה', target: seconds(30) })
    expect(exerciseOf('מדרגות 15 דק')).toEqual({ name: 'מדרגות', target: seconds(900) })
    expect(exerciseOf('מתיחה 30 שנ')).toEqual({ name: 'מתיחה', target: seconds(30) })
  })

  it('reads שניה with one yod', () => {
    expect(exerciseOf('פלאנק 30 שניה')).toEqual({ name: 'פלאנק', target: seconds(30) })
  })
})

describe('reps written as a word in a pasted note', () => {
  it('reads חזרות and חזרה as reps', () => {
    expect(exerciseOf('סקוואט 12 חזרות')).toEqual({ name: 'סקוואט', target: reps(12) })
    expect(exerciseOf('קפיצה 1 חזרה')).toEqual({ name: 'קפיצה', target: reps(1) })
  })

  it('marks a range of reps', () => {
    expect(exerciseOf('סקוואט 8-10 חזרות')).toEqual({ name: 'סקוואט', target: reps(0) })
  })

  it('reads a first line with reps as an exercise', () => {
    expect(parseNote('סקוואט 12 חזרות\nחתירה 8', counter()).name).toBe('אימון חדש')
  })
})

describe('a mark between the name and the amount in a pasted note', () => {
  const squatTwelve = { name: 'סקוואט', target: reps(12) }

  it('reads the amount after a dash, colon, times sign or tilde', () => {
    expect(exerciseOf('סקוואט - 12')).toEqual(squatTwelve)
    expect(exerciseOf('סקוואט – 12')).toEqual(squatTwelve)
    expect(exerciseOf('סקוואט: 12')).toEqual(squatTwelve)
    expect(exerciseOf('סקוואט ×12')).toEqual(squatTwelve)
    expect(exerciseOf('סקוואט *12')).toEqual(squatTwelve)
    expect(exerciseOf('סקוואט ~10')).toEqual({ name: 'סקוואט', target: reps(10) })
  })

  it('reads an x after a space as a mark, and keeps one inside a word', () => {
    expect(exerciseOf('Box jump x12')).toEqual({ name: 'Box jump', target: reps(12) })
    expect(exerciseOf('Max 12')).toEqual({ name: 'Max', target: reps(12) })
  })

  it('still reads sets times reps after a mark', () => {
    expect({ sets: firstItem('סקוואט: 3x12').sets, ...exerciseOf('סקוואט: 3x12') }).toEqual({ sets: 3, ...squatTwelve })
  })

  it('still marks a range and drops the mark from the name', () => {
    expect(exerciseOf('סקוואט 8 - 10')).toEqual({ name: 'סקוואט', target: reps(0) })
    expect(exerciseOf('סקוואט: 8-10')).toEqual({ name: 'סקוואט', target: reps(0) })
  })

  it('marks a range joined to the mark', () => {
    expect(exerciseOf('סקוואט ~8-10')).toEqual({ name: 'סקוואט', target: reps(0) })
    expect(exerciseOf('סקוואט x8-10')).toEqual({ name: 'סקוואט', target: reps(0) })
    expect(exerciseOf('סקוואט:8-10')).toEqual({ name: 'סקוואט', target: reps(0) })
    expect({ sets: firstItem('סקוואט: 3x8-10').sets, ...exerciseOf('סקוואט: 3x8-10') }).toEqual({ sets: 3, name: 'סקוואט', target: reps(0) })
  })

  it('keeps a dash and digit joined to the name', () => {
    expect(exerciseOf('T-3 12')).toEqual({ name: 'T-3', target: reps(12) })
  })
})

describe('sets in an exercise line of a pasted note', () => {
  const setsAndExercise = (line: string) => ({ sets: firstItem(line).sets, ...exerciseOf(line) })
  const fourByTwelve = { sets: 4, name: 'סקוואט', target: reps(12) }

  it('reads N סטים before the amount as the exercise own count', () => {
    expect(setsAndExercise('סקוואט 4 סטים 12')).toEqual(fourByTwelve)
    expect(setsAndExercise('סקוואט 4 סטים x 12')).toEqual(fourByTwelve)
    expect(setsAndExercise('ריצה 2 סטים 20 דקות')).toEqual({ sets: 2, name: 'ריצה', target: seconds(1200) })
    expect(setsAndExercise('עיקרי 3 סטים:\nריצה 1 סט 20 דקות')).toEqual({ sets: 1, name: 'ריצה', target: seconds(1200) })
  })

  it('reads N סטים after the amount', () => {
    expect(setsAndExercise('סקוואט 12, 4 סטים')).toEqual(fourByTwelve)
    expect(setsAndExercise('סקוואט 12 חזרות 4 סטים')).toEqual(fourByTwelve)
    expect(setsAndExercise('סקוואט 12 x 4 סטים')).toEqual(fourByTwelve)
    expect(setsAndExercise('סקוואט 12×4 סטים')).toEqual(fourByTwelve)
  })

  it('reads a first line with sets as an exercise', () => {
    expect(parseNote('סקוואט 3 סטים\nחתירה 8', counter()).name).toBe('אימון חדש')
  })

  it('marks the amount when only the sets are given', () => {
    expect(setsAndExercise('סקוואט 3 סטים')).toEqual({ sets: 3, name: 'סקוואט', target: reps(0) })
  })

  it('keeps the sets of a marked line', () => {
    expect(setsAndExercise('סקוואט 4 סטים 8-10')).toEqual({ sets: 4, name: 'סקוואט', target: reps(0) })
  })

  it('keeps no own count when it matches the section', () => {
    expect(firstItem('עיקרי 3 סטים:\nסקוואט 3 סטים 12').sets).toBeNull()
  })
})

describe('a weight in a pasted note', () => {
  const weighted = (line: string) => {
    const [exercise] = firstItem(line).exercises

    return { name: exercise.name, target: exercise.target, weight: exercise.weight }
  }

  const squatTwelveAtForty = { name: 'סקוואט', target: reps(12), weight: 40 }

  it('reads a weight with its unit as the starting weight', () => {
    expect(weighted('סקוואט 12 40 ק״ג')).toEqual(squatTwelveAtForty)
    expect(weighted('סקוואט 12 40 ק"ג')).toEqual(squatTwelveAtForty)
    expect(weighted('סקוואט 12 40 ק”ג')).toEqual(squatTwelveAtForty)
    expect(weighted('סקוואט 12 40 קג')).toEqual(squatTwelveAtForty)
    expect(weighted('סקוואט 12 40 קילו')).toEqual(squatTwelveAtForty)
    expect(weighted('סקוואט 12 40kg')).toEqual(squatTwelveAtForty)
    expect(weighted('לחיצת כתפיים 10 2.5 ק״ג')).toEqual({ name: 'לחיצת כתפיים', target: reps(10), weight: 2.5 })
  })

  it('reads the weight before or after the sets', () => {
    expect({ sets: firstItem('סקוואט 12 40 ק״ג 4 סטים').sets, ...weighted('סקוואט 12 40 ק״ג 4 סטים') }).toEqual({
      sets: 4,
      ...squatTwelveAtForty,
    })

    expect(weighted('סקוואט 3x12 40 ק״ג')).toEqual(squatTwelveAtForty)
  })

  it('reads a weight before the amount', () => {
    expect(weighted('סקוואט 40 ק״ג 12')).toEqual(squatTwelveAtForty)
  })

  it('drops the weight of a timed line without reading it', () => {
    expect(weighted('פלאנק 30 שניות 10 ק״ג')).toEqual({ name: 'פלאנק', target: seconds(30), weight: null })
  })

  it('drops a comma decimal weight without reading it', () => {
    expect(weighted('לחיצת כתפיים 10 2,5 ק״ג')).toEqual({ name: 'לחיצת כתפיים', target: reps(10), weight: null })
  })

  it('keeps the last of two weights', () => {
    expect(weighted('סקוואט 12 40 ק״ג 50 ק״ג').weight).toBe(50)
  })

  it('caps the weight at 500', () => {
    expect(weighted('דדליפט 5 900 ק״ג').weight).toBe(500)
  })

  it('marks the amount of a line with only a weight', () => {
    expect(weighted('סקוואט 40 ק״ג')).toEqual({ name: 'סקוואט', target: reps(0), weight: 40 })
  })

  it('drops a weight that is not one number from the name without reading it', () => {
    expect(weighted('סקוואט 12 40-50 ק״ג')).toEqual({ name: 'סקוואט', target: reps(12), weight: null })
  })

  it('still marks two numbers with no unit', () => {
    expect(weighted('סקוואט 12 40')).toEqual({ name: 'סקוואט', target: reps(0), weight: null })
  })

  it('reads a first line with a weight as an exercise', () => {
    expect(parseNote('סקוואט 12 40 ק״ג\nחתירה 8', counter()).name).toBe('אימון חדש')
    expect(parseNote('סקוואט 40-50 ק״ג\nחתירה 8', counter()).name).toBe('אימון חדש')
  })

  it('reads the weight of each exercise of a pair', () => {
    const weights = firstItem('משיכה לפנים 12 20 ק״ג -> הכנסת סנטר 10').exercises.map((exercise) => exercise.weight)

    expect(weights).toEqual([20, null])
  })
})
