import { IonItem, IonLabel } from '@ionic/react'
import { FORMAT_COPY } from '../../copy/format'
import type { ActivitySession } from '../../domain/activities'
import { formatDay, formatTime } from '../../domain/format'

export function ActivitySessionRow({ session }: { session: ActivitySession }) {
  return (
    <IonItem className="session-row">
      <IonLabel className="ion-text-wrap">
        <h2>{formatDay(session.startedAt)}</h2>
        <p>{formatTime(session.startedAt)}</p>
      </IonLabel>
      <div slot="end" className="session-best">
        <span className="session-best-value">{session.minutes}</span>
        <span className="session-best-unit">{FORMAT_COPY.minutesUnit}</span>
      </div>
    </IonItem>
  )
}
