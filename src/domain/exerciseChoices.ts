import { chronological, completedSets, exercisesOf, LOCALE } from './progress'
import { DEFAULT_EXERCISE_NAME, routineExercise } from './routineEdit'
import type { Routine, RoutineExercise, Workout } from './types'

export interface ExerciseChoice {
  exercise: RoutineExercise
  lastDone: number | null
}

type ExerciseTemplate = Pick<RoutineExercise, 'name' | 'target' | 'tip'>

function lastDoneByName(latestFirst: Workout[]): Map<string, number> {
  const lastDone = new Map<string, number>()

  for (const workout of latestFirst) {
    for (const exercise of exercisesOf(workout)) {
      if (!lastDone.has(exercise.name) && completedSets(exercise).length > 0) {
        lastDone.set(exercise.name, workout.startedAt)
      }
    }
  }

  return lastDone
}

function templatesByName(templates: ExerciseTemplate[]): Map<string, ExerciseTemplate> {
  const byName = new Map<string, ExerciseTemplate>()

  for (const template of templates) {
    if (!byName.has(template.name) && template.name !== DEFAULT_EXERCISE_NAME) {
      byName.set(template.name, template)
    }
  }

  return byName
}

function choiceOf({ name, target, tip }: ExerciseTemplate, lastDone: number | null): ExerciseChoice {
  return { exercise: { ...routineExercise(name, target), tip }, lastDone }
}

export function exerciseChoices(routines: Routine[], finishedWorkouts: Workout[]): ExerciseChoice[] {
  const latestFirst = chronological(finishedWorkouts, Infinity).reverse()
  const lastDone = lastDoneByName(latestFirst)
  const routinesLatestFirst = [...routines].sort((first, second) => second.updatedAt - first.updatedAt)
  const templates = templatesByName([...latestFirst.flatMap(exercisesOf), ...routinesLatestFirst.flatMap(exercisesOf)])

  const done = [...lastDone]
    .sort(([, first], [, second]) => second - first)
    .flatMap(([name, date]) => {
      const template = templates.get(name)

      return template ? [choiceOf(template, date)] : []
    })

  const notDone = [...templates.values()]
    .filter((template) => !lastDone.has(template.name))
    .sort((first, second) => first.name.localeCompare(second.name, LOCALE))
    .map((template) => choiceOf(template, null))

  return [...done, ...notDone]
}
