import { IonItem } from '@ionic/react'
import { FORMAT_COPY } from '../../copy/format'
import type { ActivitySession } from '../../domain/activities'
import { formatDay, formatTime } from '../../domain/format'

export function ActivitySessionRow({ session }: { session: ActivitySession }) {
  return (
    <IonItem className="session-row">
      <div className="session-body session-top">
        <div className="session-text">
          <h2 className="session-day">{formatDay(session.startedAt)}</h2>
          <p className="session-sets">{formatTime(session.startedAt)}</p>
        </div>
        <div className="session-best">
          <span className="session-best-value">{session.minutes}</span>
          <span className="session-best-unit">{FORMAT_COPY.minutesUnit}</span>
        </div>
      </div>
    </IonItem>
  )
}
