import { IonButton, IonButtons, IonFooter, IonIcon, IonToolbar } from '@ionic/react'
import { arrowForward, listOutline } from 'ionicons/icons'
import { type ReactNode, useRef } from 'react'
import { LIVE_COPY } from './copy'
import type { WorkoutItem } from '../../domain/types'
import { itemTitle } from '../../domain/workoutEdits'
import { useSwipeUp } from './useSwipe'
import './footer.css'

function NextPlate({ next, onNext }: { next: WorkoutItem; onNext: () => void }) {
  const title = itemTitle(next)

  return (
    <button type="button" className="plain-button plate-strong live-next" aria-label={LIVE_COPY.nextExercise(title)} onClick={onNext}>
      <span className="live-next-label">{LIVE_COPY.nextLabel}</span>
      <span className="live-next-title">{title}</span>
      <IonIcon className="live-next-arrow reading-direction" icon={arrowForward} aria-hidden="true" />
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
      <IonToolbar>
        <IonButtons slot="start" className="visually-hidden-focusable">
          <IonButton disabled={index === 0} onClick={() => onMove(index - 1)}>
            {LIVE_COPY.previous}
          </IonButton>
        </IonButtons>
        <div className="live-footer-row">
          {next !== null && <NextPlate next={next} onNext={() => onMove(index + 1)} />}
          <button type="button" className="plain-button plate live-list" aria-label={LIVE_COPY.allExercises} onClick={onList}>
            <IonIcon icon={listOutline} aria-hidden="true" />
            <span>{LIVE_COPY.allExercises}</span>
          </button>
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
