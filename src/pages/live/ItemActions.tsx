import { IonButton, IonIcon } from '@ionic/react'
import { createOutline } from 'ionicons/icons'
import { COMMON_COPY } from '../../copy/common'
import { LIVE_COPY } from './copy'
import type { WorkoutItem } from '../../domain/types'
import { isSkipped } from '../../domain/workoutEdits'
import { notedExercises } from './notes'
import './actions.css'

interface ItemActionsProps {
  item: WorkoutItem
  onToggleSkip: () => void
  onAddSet: () => void
  onNote: () => void
}

export function ItemActions({ item, onToggleSkip, onAddSet, onNote }: ItemActionsProps) {
  return (
    <div className="item-actions">
      <IonButton fill="clear" onClick={onToggleSkip}>
        {isSkipped(item) ? LIVE_COPY.unskip : LIVE_COPY.skip}
      </IonButton>
      <IonButton fill="clear" onClick={onAddSet}>
        {COMMON_COPY.addSet}
      </IonButton>
      {notedExercises(item).length === 0 && (
        <IonButton fill="clear" onClick={onNote}>
          <IonIcon slot="start" icon={createOutline} aria-hidden="true" />
          <span className="item-note">{LIVE_COPY.addNote}</span>
        </IonButton>
      )}
    </div>
  )
}
