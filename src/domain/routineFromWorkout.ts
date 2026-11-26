import { exercisesOf, targetAmount } from './progress'
import { createRoutine, newItem, withSets } from './routineEdit'
import type { Routine, RoutineExercise, RoutineSection, Workout, WorkoutExercise, WorkoutSection } from './types'
import { commonSets, setCount } from './workoutStructure'

function startingWeight(base: Routine | undefined, name: string): number | null {
  const match = base && exercisesOf(base).find((exercise) => exercise.name === name)

  return match ? match.weight : null
}

function sameSectionsInOrder(sections: WorkoutSection[], baseSections: RoutineSection[]): (RoutineSection | undefined)[] {
  let next = 0

  return sections.map((section) => {
    const found = baseSections.findIndex((candidate, index) => index >= next && candidate.name === section.name)
    if (found === -1) {
      return undefined
    }
    next = found + 1

    return baseSections[found]
  })
}

export function routineFromWorkout(
  workout: Workout,
  base: Routine | undefined,
  ids: () => string,
  now: number,
): Routine {
  const toExercise = ({ name, target, tip }: WorkoutExercise): RoutineExercise => ({
    name,
    target,
    weight: startingWeight(base, name),
    tip,
  })

  const baseSections = sameSectionsInOrder(workout.sections, base ? base.sections : [])

  const sections = workout.sections.map((section, sectionIndex): RoutineSection => {
    const baseSection = baseSections[sectionIndex]
    const sets = commonSets(section, baseSection?.sets)

    return {
      id: baseSection?.id ?? ids(),
      name: section.name,
      sets,
      items: section.items.map((item) => withSets(newItem(item.id, item.exercises.map(toExercise)), setCount(item), sets)),
    }
  })

  return base
    ? { ...base, updatedAt: now, sections }
    : createRoutine(ids(), workout.routineName, sections, now)
}

type PlanSource = { name: string; items: { exercises: Pick<RoutineExercise, 'name' | 'target' | 'tip'>[] }[] }[]

function plan(sections: PlanSource): string {
  return JSON.stringify(
    sections.map((section) => [
      section.name,
      section.items.map((item) =>
        item.exercises.map(({ name, target, tip }) => [name, target.kind, targetAmount(target), tip]),
      ),
    ]),
  )
}

export function matchesRoutine(workout: Workout, routine: Routine): boolean {
  return plan(workout.sections) === plan(routine.sections)
}
