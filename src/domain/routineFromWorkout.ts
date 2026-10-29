import { exercisesOf } from './progress'
import { createRoutine, newItem, withSets } from './routineEdit'
import type { Routine, RoutineExercise, RoutineSection, Workout, WorkoutExercise } from './types'
import { commonSets, setCount } from './workoutStructure'

function startingWeight(base: Routine | undefined, name: string): number | null {
  const match = base && exercisesOf(base).find((exercise) => exercise.name === name)

  return match ? match.weight : null
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

  const sections = workout.sections.map((section, sectionIndex): RoutineSection => {
    const sets = commonSets(section)

    return {
      id: base && sectionIndex < base.sections.length ? base.sections[sectionIndex].id : ids(),
      name: section.name,
      sets,
      items: section.items.map((item) => withSets(newItem(item.id, item.exercises.map(toExercise)), setCount(item), sets)),
    }
  })

  return base
    ? { id: base.id, name: base.name, createdAt: base.createdAt, updatedAt: now, sections }
    : createRoutine(ids(), workout.routineName, sections, now)
}
