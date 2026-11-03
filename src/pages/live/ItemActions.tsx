import { IonButton, IonIcon } from '@ionic/react'
import { addOutline, arrowRedoOutline } from 'ionicons/icons'
import { COMMON_COPY } from '../../copy/common'
import { LIVE_COPY } from './copy'
import type { WorkoutItem } from '../../domain/types'
import { isSkipped } from '../../domain/workoutEdits'
import './controls.css'

interface ItemActionsProps {
  item: WorkoutItem
  onToggleSkip: () => void
  onAddSet: () => void
}

export function ItemActions({ item, onToggleSkip, onAddSet }: ItemActionsProps) {
  return (
    <div className="item-actions">
      <IonButton fill="clear" size="small" onClick={onToggleSkip}>
        <IonIcon slot="start" icon={arrowRedoOutline} flipRtl />
        {isSkipped(item) ? LIVE_COPY.unskip : LIVE_COPY.skip}
      </IonButton>
      <IonButton fill="clear" size="small" onClick={onAddSet}>
        <IonIcon slot="start" icon={addOutline} />
        {COMMON_COPY.addSet}
      </IonButton>
    </div>
  )
}
