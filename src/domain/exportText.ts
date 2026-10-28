import { FORMAT_COPY } from '../copy/format'
import { exerciseResult, formatDay, formatSet } from './format'
import { summarize } from './timeline'
import type { SetLog, Target, Workout, WorkoutExercise, WorkoutSection } from './types'

const setList = (sets: SetLog[], target: Target) => sets.map((set) => formatSet(set, target)).join(', ')

const exerciseLine = (exercise: WorkoutExercise) => `${exercise.name}: ${exerciseResult(exercise, setList)}`

function sectionLines(section: WorkoutSection): string[] {
  return [section.name, ...section.items.flatMap((item) => item.exercises.map(exerciseLine))]
}

const fullDate = (timestamp: number) => `${formatDay(timestamp)}.${new Date(timestamp).getFullYear()}`

function workoutText(workout: Workout): string {
  const heading = `${workout.routineName} · ${fullDate(workout.startedAt)} · ${FORMAT_COPY.minutes(summarize(workout).minutes)}`
  const summary = workout.summary.trim()

  return [heading, ...workout.sections.flatMap(sectionLines), ...(summary ? [summary] : [])].join('\n')
}

export function historyText(workouts: Workout[]): string {
  return workouts.map(workoutText).join('\n\n')
}
