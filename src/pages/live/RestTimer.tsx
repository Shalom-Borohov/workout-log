import { IonButton, IonIcon, IonToolbar } from '@ionic/react'
import { add, remove, timerOutline, volumeHighOutline, volumeMuteOutline } from 'ionicons/icons'
import { MIN_REST_SECONDS } from '../../domain/rest'
import { LIVE_COPY } from './copy'
import type { Rest } from '../../rest/restClock'
import { useRestClock } from './useRestClock'
import './chrome.css'

export function RestButton({ rest, onToggle }: { rest: Rest; onToggle: () => void }) {
  return (
    <IonButton
      className={rest.ended ? 'rest-button rest-ended' : 'rest-button'}
      aria-label={rest.ended ? LIVE_COPY.restOver : LIVE_COPY.rest}
      onClick={onToggle}
    >
      <IonIcon slot="icon-only" icon={timerOutline} aria-hidden="true" />
    </IonButton>
  )
}

interface RestRowProps {
  rest: Rest
  seconds: number
  sound: boolean
  onAdjust: (direction: 1 | -1) => void
  onToggleSound: () => void
}

export function RestRow({ rest, seconds, sound, onAdjust, onToggleSound }: RestRowProps) {
  const restClock = useRestClock(rest)

  return (
    <IonToolbar className="rest-row">
      <div className="rest-controls plate">
        <button
          type="button"
          className="step-button"
          aria-label={LIVE_COPY.restSound}
          aria-pressed={sound}
          onClick={onToggleSound}
        >
          <IonIcon icon={sound ? volumeHighOutline : volumeMuteOutline} aria-hidden="true" />
        </button>
        <div className="rest-stepper">
          <button
            type="button"
            className="step-button"
            aria-label={LIVE_COPY.decrease(LIVE_COPY.rest)}
            disabled={seconds <= MIN_REST_SECONDS}
            onClick={() => onAdjust(-1)}
          >
            <IonIcon icon={remove} aria-hidden="true" />
          </button>
          <span role="timer" className="rest-left">
            {restClock}
          </span>
          <button
            type="button"
            className="step-button"
            aria-label={LIVE_COPY.increase(LIVE_COPY.rest)}
            onClick={() => onAdjust(1)}
          >
            <IonIcon icon={add} aria-hidden="true" />
          </button>
        </div>
      </div>
    </IonToolbar>
  )
}
