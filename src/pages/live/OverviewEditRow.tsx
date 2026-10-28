import {
  IonButton,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonReorder,
} from '@ionic/react'
import { removeCircle } from 'ionicons/icons'
import { useRef } from 'react'
import { COMMON_COPY } from '../../copy/common'
import { LIVE_COPY } from './copy'
import type { WorkoutItem } from '../../domain/types'
import { itemTitle } from '../../domain/workoutEdits'

interface Props {
  item: WorkoutItem
  canDelete: boolean
  onEdit: () => void
  onDelete: () => void
}

export function OverviewEditRow({ item, canDelete, onEdit, onDelete }: Props) {
  const sliding = useRef<HTMLIonItemSlidingElement>(null)
  const title = itemTitle(item)

  return (
    <IonItemSliding ref={sliding} disabled={!canDelete}>
      <IonItem button detail={false} onClick={onEdit}>
        {canDelete && (
          <IonButton
            slot="start"
            fill="clear"
            aria-label={LIVE_COPY.revealDelete(title)}
            onClick={(event) => {
              event.stopPropagation()
              void sliding.current?.open('end')
            }}
          >
            <IonIcon slot="icon-only" color="danger" icon={removeCircle} />
          </IonButton>
        )}
        <IonLabel>{title}</IonLabel>
        <IonReorder slot="end" />
      </IonItem>
      <IonItemOptions side="end">
        <IonItemOption color="danger" aria-label={LIVE_COPY.deleteItem(title)} onClick={onDelete}>
          {COMMON_COPY.delete}
        </IonItemOption>
      </IonItemOptions>
    </IonItemSliding>
  )
}
