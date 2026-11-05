import { useItemEditorFlow } from '../../components/itemEditor/useItemEditorFlow'
import { useConfirmDelete } from '../../hooks/useConfirmDelete'
import { LIVE_COPY } from './copy'
import { NO_HISTORY, type PreviousExerciseLookup } from '../../domain/progress'
import type { Change } from '../../domain/routineEdit'
import type { RoutineItem, Workout } from '../../domain/types'
import { hasTickedSet } from '../../domain/workoutEdits'
import {
  addItem,
  asRoutineItem,
  canRemoveItem,
  editItem,
  insertItemAfter,
  locateItem,
  removeItem,
} from '../../domain/workoutStructure'

export type WorkoutEdit = (edit: (current: Workout) => Workout) => void

export function useOverviewEditor(workout: Workout, previous: PreviousExerciseLookup | undefined, onEdit: WorkoutEdit) {
  const confirmDelete = useConfirmDelete()
  const previousExercises = previous ?? NO_HISTORY

  const flow = useItemEditorFlow<number>((target, item) =>
    onEdit((current) =>
      'section' in target
        ? addItem(current, target.section, item, previousExercises)
        : insertItemAfter(current, target.after, item, previousExercises),
    ),
  )

  const located = flow.editingId === null ? undefined : locateItem(workout, flow.editingId)

  const editing = located && {
    item: asRoutineItem(located.item, located.sectionSets),
    sectionSets: located.sectionSets,
  }

  function change(id: string, edit: Change<RoutineItem>) {
    onEdit((current) => editItem(current, id, edit, previousExercises))
  }

  function removeNow(id: string) {
    flow.close()
    onEdit((current) => {
      const target = locateItem(current, id)

      return target ? removeItem(current, target.ref) : current
    })
  }

  function remove(id: string) {
    const target = locateItem(workout, id)

    if (!target || !canRemoveItem(workout) || !hasTickedSet(target.item)) {
      removeNow(id)

      return
    }
    confirmDelete({
      header: LIVE_COPY.removeExerciseQuestion,
      message: LIVE_COPY.removeExerciseMessage,
      onConfirm: () => removeNow(id),
    })
  }

  return { flow, editing, change, remove }
}

export type OverviewEditor = ReturnType<typeof useOverviewEditor>
