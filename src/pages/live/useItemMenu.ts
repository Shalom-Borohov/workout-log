import { useIonActionSheet } from '@ionic/react'
import { COMMON_COPY } from '../../copy/common'
import { LIVE_COPY } from './copy'
import type { WorkoutItem } from '../../domain/types'
import { itemTitle } from '../../domain/workoutEdits'

export function useItemMenu(item: WorkoutItem, onSummary: () => void) {
  const [present] = useIonActionSheet()

  return () =>
    present({
      header: itemTitle(item),
      buttons: [
        { text: LIVE_COPY.addToSummary, handler: onSummary },
        { text: COMMON_COPY.cancel, role: 'cancel' },
      ],
    })
}
