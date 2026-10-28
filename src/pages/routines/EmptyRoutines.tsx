import { IonIcon, IonItem, IonLabel, IonList } from '@ionic/react'
import { clipboardOutline, createOutline } from 'ionicons/icons'
import { EmptyState } from '../../components/EmptyState'
import { COMMON_COPY } from '../../copy/common'
import { ROUTINES_COPY } from './copy'

interface Props {
  onPaste: () => void
  onEmpty: () => void
}

export function EmptyRoutines({ onPaste, onEmpty }: Props) {
  return (
    <>
      <EmptyState title={ROUTINES_COPY.noRoutinesYet} body={ROUTINES_COPY.noRoutinesBody} />
      <IonList inset>
        <IonItem button detail onClick={onPaste}>
          <IonIcon slot="start" color="primary" className="option-icon" icon={clipboardOutline} />
          <IonLabel>
            <h2>{COMMON_COPY.pasteNote}</h2>
            <p>{ROUTINES_COPY.pasteNoteHint}</p>
          </IonLabel>
        </IonItem>
        <IonItem button detail onClick={onEmpty}>
          <IonIcon slot="start" color="primary" className="option-icon" icon={createOutline} />
          <IonLabel>
            <h2>{COMMON_COPY.emptyRoutine}</h2>
            <p>{ROUTINES_COPY.emptyRoutineHint}</p>
          </IonLabel>
        </IonItem>
      </IonList>
    </>
  )
}
