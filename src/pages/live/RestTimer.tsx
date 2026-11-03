import { IonButton, IonIcon, IonToolbar } from '@ionic/react'
import { add, remove, timerOutline, volumeHighOutline, volumeMuteOutline } from 'ionicons/icons'
import { formatClock } from '../../domain/format'
import { MIN_REST_SECONDS } from '../../domain/rest'
import { SECOND_MS } from '../../domain/time'
import { useNow } from '../../hooks/useNow'
import { LIVE_COPY } from './copy'
import type { Rest } from './useRestTimer'
import './controls.css'

export function RestButton({ rest, onToggle }: { rest: Rest; onToggle: () => void }) {
  return (
    <IonButton
      className={rest.ended ? 'rest-button rest-ended' : 'rest-button'}
      aria-label={rest.ended ? LIVE_COPY.restOver : LIVE_COPY.rest}
      onClick={onToggle}
    >
      <IonIcon slot="icon-only" icon={timerOutline} />
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
  const now = useNow(SECOND_MS)
  const secondsLeft = Math.ceil(Math.max(rest.endsAt - now, 0) / SECOND_MS)

  return (
    <IonToolbar className="rest-row">
      <div className="rest-controls">
        <button
          type="button"
          className="stepper-button"
          aria-label={LIVE_COPY.restSound}
          aria-pressed={sound}
          onClick={onToggleSound}
        >
          <IonIcon icon={sound ? volumeHighOutline : volumeMuteOutline} />
        </button>
        <div className="stepper rest-stepper">
          <button
            type="button"
            className="stepper-button"
            aria-label={LIVE_COPY.decrease(LIVE_COPY.rest)}
            disabled={seconds <= MIN_REST_SECONDS}
            onClick={() => onAdjust(-1)}
          >
            <IonIcon icon={remove} />
          </button>
          <span role="timer" className="rest-left">
            {formatClock(secondsLeft * SECOND_MS)}
          </span>
          <button
            type="button"
            className="stepper-button"
            aria-label={LIVE_COPY.increase(LIVE_COPY.rest)}
            onClick={() => onAdjust(1)}
          >
            <IonIcon icon={add} />
          </button>
        </div>
      </div>
    </IonToolbar>
  )
}
