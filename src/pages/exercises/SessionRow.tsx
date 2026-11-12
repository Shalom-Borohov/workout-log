import { IonItem, IonLabel } from '@ionic/react'
import { ChangeBadge } from '../../components/ChangeBadge'
import { formatDay, formatSets } from '../../domain/format'
import { bestSet, type ExerciseSession } from '../../domain/progress'
import { bestNumeral } from './bestNumeral'

export function SessionRow({ session, isRecord }: { session: ExerciseSession; isRecord: boolean }) {
  const best = bestSet(session.sets)
  const numeral = best && bestNumeral(best, session.target)

  return (
    <IonItem lines="none" className="session-row">
      <IonLabel className="ion-text-wrap">
        <h2>{formatDay(session.startedAt)}</h2>
        <p>{formatSets(session.sets, session.target)}</p>
      </IonLabel>
      {numeral && (
        <div slot="end" className={isRecord ? 'session-best session-best-record' : 'session-best'}>
          <span className="session-best-value">{numeral.value}</span>
          <span className="session-best-unit">{numeral.unit}</span>
          {isRecord && <ChangeBadge kind="record" />}
        </div>
      )}
    </IonItem>
  )
}
