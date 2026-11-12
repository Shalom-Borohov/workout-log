import { IonItem, IonLabel } from '@ionic/react'
import { ChangeBadge } from '../../components/ChangeBadge'
import { recordName } from '../../domain/activities'
import { LIST_SEPARATOR } from '../../domain/format'
import { changeTally, type WorkoutWithChanges } from '../../domain/progress'
import { summaryLine } from '../../domain/timeline'
import { TIMELINE_PATH, workoutDetailPath } from '../../navigation/paths'
import { DateColumn } from './DateColumn'

export function WorkoutCard({ workout }: { workout: WorkoutWithChanges }) {
  const tally = changeTally(workout.changes)

  return (
    <IonItem button detail={false} className="workout-card-item" routerLink={workoutDetailPath(TIMELINE_PATH, workout.id)}>
      <DateColumn record={workout} />
      <IonLabel className="workout-card">
        <h2 className="workout-card-title">{recordName(workout)}</h2>
        <p className="workout-card-meta">
          <span className="workout-card-stats">{summaryLine(workout)}</span>
          {tally.length > 0 && LIST_SEPARATOR}
          {tally.map(({ kind, count }) => (
            <ChangeBadge key={kind} kind={kind} label={String(count)} />
          ))}
        </p>
      </IonLabel>
    </IonItem>
  )
}
