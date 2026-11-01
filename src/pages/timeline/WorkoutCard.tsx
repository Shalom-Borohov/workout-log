import { IonItem, IonLabel } from '@ionic/react'
import { ChangeBadge } from '../../components/ChangeBadge'
import { recordName } from '../../domain/activities'
import { formatAmount, formatDay, formatWeight } from '../../domain/format'
import type { Change, WorkoutWithChanges } from '../../domain/progress'
import { summaryLine } from '../../domain/timeline'
import { workoutDetailPath } from '../../navigation/paths'

const MAX_CARD_CHANGES = 3

function changeLabel({ name, set, target }: Change): string {
  const value = set.weight === null ? formatAmount(set.amount, target) : formatWeight(set.weight)

  return `${name} ${value}`
}

export function WorkoutCard({ workout }: { workout: WorkoutWithChanges }) {
  const [firstSummaryLine] = workout.summary.trim().split('\n')

  return (
    <IonItem button detail routerLink={workoutDetailPath(workout.id)}>
      <IonLabel className="workout-card">
        <div className="workout-card-heading">
          <h2 className="workout-card-title">{recordName(workout)}</h2>
          <span className="workout-card-date">{formatDay(workout.startedAt)}</span>
        </div>
        <p className="workout-card-meta">{summaryLine(workout)}</p>
        {workout.changes.length > 0 && (
          <div className="workout-card-changes">
            {workout.changes.slice(0, MAX_CARD_CHANGES).map((change) => (
              <ChangeBadge key={change.name} kind={change.kind} label={changeLabel(change)} />
            ))}
          </div>
        )}
        {firstSummaryLine && <p className="workout-card-summary">{firstSummaryLine}</p>}
      </IonLabel>
    </IonItem>
  )
}
