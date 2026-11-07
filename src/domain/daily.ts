import { formatAmount, LIST_SEPARATOR } from './format'
import { exercisesOf, targetAmount } from './progress'
import { itemSets } from './routineEdit'
import type { DailyExercise, DailyLog, Routine } from './types'

export const dailyLogId = (routineId: string, date: string) => `${routineId}|${date}`

export function plannedExercises(routine: Routine): DailyExercise[] {
  return routine.sections.flatMap((section) =>
    section.items.flatMap((item) =>
      item.exercises.map((exercise) => ({ name: exercise.name, sets: itemSets(item, section.sets), target: exercise.target })),
    ),
  )
}

export function findDailyLog(logs: DailyLog[], routineId: string, date: string): DailyLog | undefined {
  return logs.find((log) => log.id === dailyLogId(routineId, date))
}

export function newDailyLog(routine: Routine, date: string): DailyLog {
  return { id: dailyLogId(routine.id, date), routineId: routine.id, date, exercises: plannedExercises(routine) }
}

function isSameDrill(first: DailyExercise, second: DailyExercise): boolean {
  return (
    first.name === second.name &&
    first.sets === second.sets &&
    first.target.kind === second.target.kind &&
    targetAmount(first.target) === targetAmount(second.target)
  )
}

export function isEditedLog(log: DailyLog, routine: Routine): boolean {
  const planned = plannedExercises(routine)

  return log.exercises.length !== planned.length || log.exercises.some((exercise, index) => !isSameDrill(exercise, planned[index]))
}

export function updateDailyExercise(log: DailyLog, index: number, change: Partial<DailyExercise>): DailyLog {
  return {
    ...log,
    exercises: log.exercises.map((exercise, current) => (current === index ? { ...exercise, ...change } : exercise)),
  }
}

export function drillsLine(routine: Routine): string {
  return exercisesOf(routine)
    .map((exercise) => `${exercise.name} ${formatAmount(targetAmount(exercise.target), exercise.target)}`)
    .join(LIST_SEPARATOR)
}

export function logLine(exercises: DailyExercise[]): string {
  return exercises
    .map(({ name, sets, target }) => `${name} ${sets} × ${formatAmount(targetAmount(target), target)}`)
    .join(LIST_SEPARATOR)
}
