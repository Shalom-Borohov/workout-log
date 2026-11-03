import { recordName, sectionsOf } from './activities'
import { exerciseResult, formatDay, formatSet, LIST_SEPARATOR } from './format'
import { minutesAndLocation } from './timeline'
import type { SetLog, Target, WorkoutExercise, WorkoutRecord, WorkoutSection } from './types'

const setList = (sets: SetLog[], target: Target) => sets.map((set) => formatSet(set, target)).join(', ')

const exerciseLine = (exercise: WorkoutExercise) => `${exercise.name}: ${exerciseResult(exercise, setList)}`

function sectionLines(section: WorkoutSection): string[] {
  return [section.name, ...section.items.flatMap((item) => item.exercises.map(exerciseLine))]
}

const fullDate = (timestamp: number) => `${formatDay(timestamp)}.${new Date(timestamp).getFullYear()}`

function workoutText(record: WorkoutRecord): string {
  const heading = [recordName(record), fullDate(record.startedAt), minutesAndLocation(record)].join(LIST_SEPARATOR)
  const summary = record.summary.trim()

  return [heading, ...sectionsOf(record).flatMap(sectionLines), ...(summary ? [summary] : [])].join('\n')
}

export function historyText(workouts: WorkoutRecord[]): string {
  return workouts.map(workoutText).join('\n\n')
}
