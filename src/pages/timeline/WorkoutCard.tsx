import { IonItem, IonLabel } from '@ionic/react'
import { ChangeBadge } from '../../components/ChangeBadge'
import { recordName } from '../../domain/activities'
import { changeTally, type WorkoutWithChanges } from '../../domain/progress'
import { summaryLine } from '../../domain/timeline'
import { TIMELINE_PATH, workoutDetailPath } from '../../navigation/paths'
import { DayMark } from './DayMark'

export function WorkoutCard({ workout }: { workout: WorkoutWithChanges }) {
  const tally = changeTally(workout.changes)

  return (
    <IonItem button detail={false} className="workout-card-item" routerLink={workoutDetailPath(TIMELINE_PATH, workout.id)}>
      <IonLabel className="workout-card">
        <div className="workout-card-heading">
          <DayMark record={workout} />
          <h2 className="workout-card-title">{recordName(workout)}</h2>
        </div>
        <p className="workout-card-meta">{summaryLine(workout)}</p>
      </IonLabel>
      {tally.length > 0 && (
        <div slot="end" className="workout-card-changes">
          {tally.map(({ kind, count }) => (
            <ChangeBadge key={kind} kind={kind} label={String(count)} />
          ))}
        </div>
      )}
    </IonItem>
  )
}
