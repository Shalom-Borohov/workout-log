import { describe, expect, it } from 'vitest'
import { drillsLine, isEditedLog, logLine, newDailyLog, updateDailyExercise } from '../../src/domain/daily'
import { exerciseNames, isStartable } from '../../src/domain/progress'
import { reps, routine, seconds } from '../helpers/workouts'

const drills = {
  ...routine('d1', 'חטיפי תנועה', [[{ name: 'גשר ישבן', target: reps(15) }], [{ name: 'פלאנק', target: seconds(30) }]]),
  daily: true,
}

const gym = routine('r1', 'אימון גוף מלא', [[{ name: 'סקוואט', target: reps(12) }]])

describe('newDailyLog', () => {
  it('logs the planned sets and amount of every drill', () => {
    const planned = { ...drills, sections: [{ ...drills.sections[0], items: [{ ...drills.sections[0].items[0], sets: 2 }, drills.sections[0].items[1]] }] }

    expect(newDailyLog(planned, '2026-10-25')).toEqual({
      id: 'd1|2026-10-25',
      routineId: 'd1',
      date: '2026-10-25',
      exercises: [
        { name: 'גשר ישבן', sets: 2, target: reps(15) },
        { name: 'פלאנק', sets: 3, target: seconds(30) },
      ],
    })
  })
})

describe('updateDailyExercise', () => {
  it('changes one drill and leaves the others', () => {
    const log = newDailyLog(drills, '2026-10-25')

    expect(updateDailyExercise(log, 1, { sets: 1, target: seconds(45) }).exercises).toEqual([
      { name: 'גשר ישבן', sets: 3, target: reps(15) },
      { name: 'פלאנק', sets: 1, target: seconds(45) },
    ])
    expect(log.exercises[1].sets).toBe(3)
  })
})

describe('isEditedLog', () => {
  const fresh = newDailyLog(drills, '2026-10-25')

  it('is false for a log that still holds the plan', () => {
    expect(isEditedLog(fresh, drills)).toBe(false)
  })

  it('is false for a routine with no drills', () => {
    const empty = routine('d2', 'ריק', [])

    expect(isEditedLog(newDailyLog(empty, '2026-10-25'), empty)).toBe(false)
  })

  it('is true when the sets changed', () => {
    expect(isEditedLog(updateDailyExercise(fresh, 0, { sets: 4 }), drills)).toBe(true)
  })

  it('is true when the amount changed', () => {
    expect(isEditedLog(updateDailyExercise(fresh, 1, { target: seconds(35) }), drills)).toBe(true)
  })

  it('is true when the target kind changed, even with the same amount', () => {
    expect(isEditedLog(updateDailyExercise(fresh, 0, { target: seconds(15) }), drills)).toBe(true)
  })

  it('is true when a drill has another name', () => {
    expect(isEditedLog(updateDailyExercise(fresh, 0, { name: 'דדליפט' }), drills)).toBe(true)
  })

  it('is true when the routine gained a drill after the log', () => {
    const longer = routine('d1', 'חטיפי תנועה', [
      [{ name: 'גשר ישבן', target: reps(15) }],
      [{ name: 'פלאנק', target: seconds(30) }],
      [{ name: 'פרפר', target: seconds(30) }],
    ])

    expect(isEditedLog(fresh, longer)).toBe(true)
  })

  it('is true when the routine lost a drill after the log', () => {
    const shorter = routine('d1', 'חטיפי תנועה', [[{ name: 'גשר ישבן', target: reps(15) }]])

    expect(isEditedLog(fresh, shorter)).toBe(true)
  })

  it('is true when the routine changed a target after the log', () => {
    const changed = routine('d1', 'חטיפי תנועה', [[{ name: 'גשר ישבן', target: reps(20) }], [{ name: 'פלאנק', target: seconds(30) }]])

    expect(isEditedLog(fresh, changed)).toBe(true)
  })
})

describe('drillsLine', () => {
  it('lists each drill with its target', () => {
    expect(drillsLine(drills)).toBe('גשר ישבן 15 · פלאנק 30 שנ׳')
  })
})

describe('logLine', () => {
  it('lists each drill done with its sets and amount', () => {
    expect(logLine([{ name: 'גשר ישבן', sets: 4, target: reps(15) }, { name: 'פלאנק', sets: 2, target: seconds(90) }])).toBe(
      'גשר ישבן 4 × 15 · פלאנק 2 × 90 שנ׳',
    )
  })
})

describe('daily routines elsewhere', () => {
  it('cannot be started, unlike a routine with exercises', () => {
    expect(isStartable(gym)).toBe(true)
    expect(isStartable(drills)).toBe(false)
    expect(isStartable(routine('r2', 'ריק', []))).toBe(false)
  })

  it('leave their exercises out of the exercise list', () => {
    expect(exerciseNames([gym, drills], [])).toEqual(['סקוואט'])
  })
})
