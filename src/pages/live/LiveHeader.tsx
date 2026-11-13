import { IonButton, IonButtons, IonHeader, IonIcon, IonNote, IonTitle, IonToolbar } from '@ionic/react'
import { ellipsisHorizontal } from 'ionicons/icons'
import { ElapsedClock } from '../../components/ElapsedClock'
import { COMMON_COPY } from '../../copy/common'
import { LIVE_COPY } from './copy'
import { RestButton, RestRow } from './RestTimer'
import { useRestPeek } from './useRestPeek'
import type { RestTimer } from './useRestTimer'

interface LiveHeaderProps {
  title: string
  startedAt: number | null
  restTimer: RestTimer
  onMenu: () => void
  onFinish: () => void
}

export function LiveHeader({ title, startedAt, restTimer, onMenu, onFinish }: LiveHeaderProps) {
  const peek = useRestPeek()
  const { rest } = restTimer

  return (
    <IonHeader className="live-header">
      <IonToolbar>
        <IonButtons slot="start">
          <IonButton aria-label={LIVE_COPY.exerciseActions} onClick={onMenu}>
            <IonIcon slot="icon-only" icon={ellipsisHorizontal} aria-hidden="true" />
          </IonButton>
          {rest && <RestButton rest={rest} onToggle={peek.toggle} />}
        </IonButtons>
        <IonTitle>
          <div className="live-title">{title}</div>
          {startedAt !== null && (
            <IonNote className="live-clock">
              <ElapsedClock startedAt={startedAt} />
            </IonNote>
          )}
        </IonTitle>
        <IonButtons slot="end">
          <IonButton strong onClick={onFinish}>
            {COMMON_COPY.done}
          </IonButton>
        </IonButtons>
      </IonToolbar>
      {rest && peek.peeking && (
        <RestRow
          rest={rest}
          seconds={restTimer.seconds}
          sound={restTimer.sound}
          onAdjust={(direction) => {
            restTimer.adjust(direction)
            peek.keep()
          }}
          onToggleSound={() => {
            restTimer.toggleSound()
            peek.keep()
          }}
        />
      )}
    </IonHeader>
  )
}
