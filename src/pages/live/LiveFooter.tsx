import { IonButton, IonButtons, IonFooter, IonIcon, IonToolbar } from '@ionic/react'
import { listOutline } from 'ionicons/icons'
import { type ReactNode, useRef } from 'react'
import { LIVE_COPY } from './copy'
import type { WorkoutItem } from '../../domain/types'
import { itemTitle } from '../../domain/workoutEdits'
import { useSwipeUp } from './useSwipe'
import './footer.css'

function NextPeek({ next, onNext }: { next: WorkoutItem; onNext: () => void }) {
  const title = itemTitle(next)

  return (
    <button type="button" className="plain-button live-peek" aria-label={LIVE_COPY.nextExercise(title)} onClick={onNext}>
      <span className="live-peek-label">{LIVE_COPY.next}</span>
      <span className="live-peek-title">{title}</span>
    </button>
  )
}

interface LiveFooterProps {
  index: number
  total: number
  next: WorkoutItem | null
  onMove: (index: number) => void
  onList: () => void
  children: ReactNode
}

export function LiveFooter({ index, total, next, onMove, onList, children }: LiveFooterProps) {
  const footer = useRef<HTMLIonFooterElement>(null)

  useSwipeUp(footer, onList)

  return (
    <IonFooter ref={footer} className="live-footer">
      {children}
      {next !== null && <NextPeek next={next} onNext={() => onMove(index + 1)} />}
      <IonToolbar>
        <IonButtons slot="start" className="visually-hidden-focusable">
          <IonButton disabled={index === 0} onClick={() => onMove(index - 1)}>
            {LIVE_COPY.previous}
          </IonButton>
        </IonButtons>
        <div className="live-footer-center">
          <IonButton fill="clear" aria-label={LIVE_COPY.allExercises} onClick={onList}>
            <IonIcon slot="icon-only" icon={listOutline} aria-hidden="true" />
          </IonButton>
        </div>
        <IonButtons slot="end" className="visually-hidden-focusable">
          <IonButton disabled={index === total - 1} onClick={() => onMove(index + 1)}>
            {LIVE_COPY.next}
          </IonButton>
        </IonButtons>
      </IonToolbar>
    </IonFooter>
  )
}
