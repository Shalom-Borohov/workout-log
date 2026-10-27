import { useIonActionSheet } from '@ionic/react'
import type { WorkoutItem } from '../../domain/types'
import { isSkipped, itemTitle } from '../../domain/workoutEdits'

interface ItemMenuActions {
  onToggleSkip: () => void
  onAddSet: () => void
  onRemoveSet: () => void
}

export function useItemMenu(item: WorkoutItem, { onToggleSkip, onAddSet, onRemoveSet }: ItemMenuActions) {
  const [present] = useIonActionSheet()

  return () =>
    present({
      header: itemTitle(item),
      buttons: [
        { text: isSkipped(item) ? 'בטל דילוג' : 'דלג על התרגיל', handler: onToggleSkip },
        { text: 'הוסף סט', handler: onAddSet },
        {
          text: 'הסר סט',
          role: 'destructive',
          disabled: item.exercises.every((e) => e.sets.length <= 1),
          handler: onRemoveSet,
        },
        { text: 'ביטול', role: 'cancel' },
      ],
    })
}
