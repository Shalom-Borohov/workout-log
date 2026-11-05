import { type ActionSheetButton, useIonActionSheet } from '@ionic/react'
import { COMMON_COPY } from '../../copy/common'
import { ITEM_EDITOR_COPY } from '../../components/itemEditor/copy'
import { LIVE_COPY } from './copy'
import type { WorkoutItem } from '../../domain/types'
import { itemTitle } from '../../domain/workoutEdits'
import type { SetSelection } from './useSetSelection'

interface ItemMenu {
  item: WorkoutItem
  selection: SetSelection
  onAddAfter: () => void
  onSummary: () => void
  onEditWorkout: () => void
}

function setButtons(item: WorkoutItem, selection: SetSelection): ActionSheetButton[] {
  if (selection.current === undefined) {
    return []
  }
  const { exercise, set } = selection.current
  const workoutExercise = item.exercises[exercise]

  const setName =
    item.exercises.length > 1 ? LIVE_COPY.pairSet(set + 1, workoutExercise.name) : LIVE_COPY.setNumber(set + 1)

  const duplicate = { text: LIVE_COPY.duplicateSetNamed(setName), handler: () => selection.duplicate(exercise, set) }

  const remove = {
    text: LIVE_COPY.removeSetNamed(setName),
    role: 'destructive',
    handler: () => selection.remove(exercise, set),
  }

  return workoutExercise.sets.length > 1 ? [duplicate, remove] : [duplicate]
}

export function useItemMenu({ item, selection, onAddAfter, onSummary, onEditWorkout }: ItemMenu) {
  const [present] = useIonActionSheet()

  return () =>
    present({
      header: itemTitle(item),
      buttons: [
        { text: ITEM_EDITOR_COPY.addExerciseAfter, handler: onAddAfter },
        ...setButtons(item, selection),
        { text: LIVE_COPY.addToSummary, handler: onSummary },
        { text: LIVE_COPY.editTheWorkout, handler: onEditWorkout },
        { text: COMMON_COPY.cancel, role: 'cancel' },
      ],
    })
}
