import { IonItem } from '@ionic/react'
import { Fragment } from 'react'
import { ChangeBadge } from '../../components/ChangeBadge'
import { formatDay, formatSet, LIST_SEPARATOR } from '../../domain/format'
import { bestSet, type ExerciseSession } from '../../domain/progress'
import { bestNumeral } from './bestNumeral'

interface Props {
  session: ExerciseSession
  isRecord: boolean
  barFraction?: number
}

const percent = (fraction: number) => `${fraction * 100}%`

export function SessionRow({ session, isRecord, barFraction }: Props) {
  const best = bestSet(session.sets)
  const numeral = best && bestNumeral(best, session.target)

  return (
    <IonItem lines="none" className={isRecord ? 'session-row session-record' : 'session-row'}>
      <div className="session-body">
        <div className="session-top">
          <div className="session-text">
            <h2 className="session-day">{formatDay(session.startedAt)}</h2>
            <p className="session-sets">
              {session.sets.map((set, index) => (
                <Fragment key={index}>
                  {index > 0 && <span className="visually-hidden">{LIST_SEPARATOR}</span>}
                  <span>{formatSet(set, session.target)}</span>
                </Fragment>
              ))}
            </p>
          </div>
          {numeral && (
            <div className="session-best">
              {isRecord && <ChangeBadge kind="record" />}
              <span className="session-best-value">{numeral.value}</span>
              <span className="session-best-unit">{numeral.unit}</span>
            </div>
          )}
        </div>
        {barFraction !== undefined && (
          <div className="session-track" aria-hidden="true">
            <div className="session-bar" style={{ width: percent(barFraction) }} />
          </div>
        )}
      </div>
    </IonItem>
  )
}
