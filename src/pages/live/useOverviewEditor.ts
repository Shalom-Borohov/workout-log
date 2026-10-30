import { useState } from 'react'
import { type PreviousLookup, type PreviousSessionLookup, setsOf } from '../../domain/progress'
import { type Change, newItem } from '../../domain/routineEdit'
import type { RoutineExercise, RoutineItem, Workout } from '../../domain/types'
import { addItem, asRoutineItem, editItem, locateItem, removeItem } from '../../domain/workoutStructure'

export type WorkoutEdit = (edit: (current: Workout) => Workout) => void

export function useOverviewEditor(workout: Workout, previous: PreviousSessionLookup | undefined, onEdit: WorkoutEdit) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const located = editingId === null ? undefined : locateItem(workout, editingId)

  const editing = located && {
    item: asRoutineItem(located.item, located.sectionSets),
    sectionSets: located.sectionSets,
  }

  const previousSets: PreviousLookup = previous ? setsOf(previous) : () => null

  function add(sectionIndex: number, exercise?: RoutineExercise) {
    const id = crypto.randomUUID()
    const item = exercise ? newItem(id, [exercise]) : newItem(id)

    onEdit((current) => addItem(current, sectionIndex, item, previousSets))

    if (!exercise) {
      setEditingId(id)
    }
  }

  function change(id: string, edit: Change<RoutineItem>) {
    onEdit((current) => editItem(current, id, edit, previousSets))
  }

  function remove(id: string) {
    setEditingId(null)
    onEdit((current) => {
      const target = locateItem(current, id)

      return target ? removeItem(current, target.ref) : current
    })
  }

  return { editing, add, change, remove, open: setEditingId, close: () => setEditingId(null) }
}
