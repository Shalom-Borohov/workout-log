import { describe, expect, it } from 'vitest'
import { NO_HISTORY, startWorkout } from '../../src/domain/progress'
import { matchesRoutine, routineFromWorkout } from '../../src/domain/routineFromWorkout'
import type { Workout } from '../../src/domain/types'
import { replaceInWorkout } from '../../src/domain/workoutReplace'
import { removeItem } from '../../src/domain/workoutStructure'
import { counter } from '../helpers/ids'
import { oct, reps, routine, routineExercise } from '../helpers/workouts'

const benchDay = routine('r1', 'חזה', [[{ name: 'לחיצת חזה', target: reps(10) }], [{ name: 'סקוואט', target: reps(8) }]], 4)

const incline = routineExercise({ name: 'לחיצה בשיפוע', target: reps(10) })

function benchTwiceTicked(): Workout {
  const started = startWorkout(benchDay, [], oct(26), () => 'w1')
  const [bench, squat] = started.sections[0].items

  const ticked = {
    ...bench,
    exercises: [{ ...bench.exercises[0], sets: bench.exercises[0].sets.map((set, index) => ({ ...set, done: index < 2 })) }],
  }

  return { ...started, sections: [{ ...started.sections[0], items: [ticked, squat] }] }
}

const replaced = () => replaceInWorkout(benchTwiceTicked(), 'r1-i0', 0, incline, NO_HISTORY, 'leftover')

const routineItems = (workout: Workout) =>
  routineFromWorkout(workout, benchDay, counter(), 900).sections[0].items.map((item) => [
    item.id,
    item.exercises.map((routineExercise) => routineExercise.name),
    item.sets,
  ])

describe('saving a workout back to its routine after a replace', () => {
  it('writes the new exercise in the old one’s place with the old count, and leaves the ticked part out', () => {
    expect(routineItems(replaced())).toEqual([
      ['r1-i0', ['לחיצה בשיפוע'], null],
      ['r1-i1', ['סקוואט'], null],
    ])
  })

  it('writes the ticked part when the new exercise was deleted afterwards', () => {
    const withoutIncline = removeItem(replaced(), { section: 0, item: 1 })

    expect(routineItems(withoutIncline)).toEqual([
      ['leftover', ['לחיצת חזה'], 2],
      ['r1-i1', ['סקוואט'], null],
    ])
  })

  it('compares with the routine without the ticked part', () => {
    const inclineDay = routine('r1', 'חזה', [[{ name: 'לחיצה בשיפוע', target: reps(10) }], [{ name: 'סקוואט', target: reps(8) }]], 4)

    expect(matchesRoutine(replaced(), inclineDay)).toBe(true)
  })
})
