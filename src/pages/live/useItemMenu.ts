import { useIonActionSheet } from '@ionic/react'
import { COMMON_COPY } from '../../copy/common'
import { LIVE_COPY } from './copy'
import type { WorkoutItem } from '../../domain/types'
import { isSkipped, itemTitle } from '../../domain/workoutEdits'

interface ItemMenuActions {
  onToggleSkip: () => void
  onAddSet: () => void
  onRemoveSet: () => void
  onNote: () => void
  onSummary: () => void
}

export function useItemMenu(item: WorkoutItem, { onToggleSkip, onAddSet, onRemoveSet, onNote, onSummary }: ItemMenuActions) {
  const [present] = useIonActionSheet()

  return () =>
    present({
      header: itemTitle(item),
      buttons: [
        { text: isSkipped(item) ? LIVE_COPY.unskip : LIVE_COPY.skipExercise, handler: onToggleSkip },
        { text: COMMON_COPY.addSet, handler: onAddSet },
        { text: COMMON_COPY.nextTimeNote, handler: onNote },
        { text: LIVE_COPY.addToSummary, handler: onSummary },
        {
          text: COMMON_COPY.removeSet,
          role: 'destructive',
          disabled: item.exercises.every((exercise) => exercise.sets.length <= 1),
          handler: onRemoveSet,
        },
        { text: COMMON_COPY.cancel, role: 'cancel' },
      ],
    })
}
