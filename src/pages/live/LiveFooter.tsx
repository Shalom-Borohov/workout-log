import { IonButton, IonButtons, IonFooter, IonIcon, IonToolbar } from '@ionic/react'
import { chevronBack, chevronForward, listOutline } from 'ionicons/icons'

interface LiveFooterProps {
  index: number
  total: number
  onMove: (index: number) => void
  onList: () => void
}

export function LiveFooter({ index, total, onMove, onList }: LiveFooterProps) {
  return (
    <IonFooter>
      <IonToolbar>
        <IonButtons slot="start">
          <IonButton disabled={index === 0} onClick={() => onMove(index - 1)}>
            <IonIcon slot="start" icon={chevronBack} flipRtl />
            הקודם
          </IonButton>
        </IonButtons>
        <div className="live-footer-center">
          <IonButton fill="clear" aria-label="כל התרגילים" onClick={onList}>
            <IonIcon slot="icon-only" icon={listOutline} />
          </IonButton>
        </div>
        <IonButtons slot="end">
          <IonButton disabled={index === total - 1} onClick={() => onMove(index + 1)}>
            הבא
            <IonIcon slot="end" icon={chevronForward} flipRtl />
          </IonButton>
        </IonButtons>
      </IonToolbar>
    </IonFooter>
  )
}
