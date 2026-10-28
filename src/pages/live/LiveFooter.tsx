import { IonButton, IonButtons, IonFooter, IonIcon, IonToolbar } from '@ionic/react'
import { chevronBack, chevronForward, listOutline } from 'ionicons/icons'
import { useRef } from 'react'
import { LIVE_COPY } from './copy'
import { useSwipeUp } from './useSwipe'

interface LiveFooterProps {
  index: number
  total: number
  onMove: (index: number) => void
  onList: () => void
}

export function LiveFooter({ index, total, onMove, onList }: LiveFooterProps) {
  const footer = useRef<HTMLIonFooterElement>(null)

  useSwipeUp(footer, onList)

  return (
    <IonFooter ref={footer}>
      <IonToolbar>
        <IonButtons slot="start">
          <IonButton disabled={index === 0} onClick={() => onMove(index - 1)}>
            <IonIcon slot="start" icon={chevronBack} flipRtl />
            {LIVE_COPY.previous}
          </IonButton>
        </IonButtons>
        <div className="live-footer-center">
          <IonButton fill="clear" aria-label={LIVE_COPY.allExercises} onClick={onList}>
            <IonIcon slot="icon-only" icon={listOutline} />
          </IonButton>
        </div>
        <IonButtons slot="end">
          <IonButton disabled={index === total - 1} onClick={() => onMove(index + 1)}>
            {LIVE_COPY.next}
            <IonIcon slot="end" icon={chevronForward} flipRtl />
          </IonButton>
        </IonButtons>
      </IonToolbar>
    </IonFooter>
  )
}
