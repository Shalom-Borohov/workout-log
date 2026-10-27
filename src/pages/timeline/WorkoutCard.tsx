import { IonItem, IonLabel } from '@ionic/react'
import { ChangeBadge } from '../../components/ChangeBadge'
import { formatAmount, formatDay, formatSummary, formatWeight } from '../../domain/format'
import type { Change, WorkoutWithChanges } from '../../domain/progress'
import { summarize } from '../../domain/timeline'

function changeLabel({ name, set, target }: Change): string {
  const value = set.weight === null ? formatAmount(set.amount, target) : formatWeight(set.weight)

  return `${name} ${value}`
}

export function WorkoutCard({ workout }: { workout: WorkoutWithChanges }) {
  const { minutes, doneSets } = summarize(workout)
  const [summaryLine] = workout.summary.trim().split('\n')

  return (
    <IonItem button detail routerLink={`/tabs/timeline/${workout.id}`}>
      <IonLabel className="workout-card">
        <div className="workout-card-heading">
          <h2 className="workout-card-title">{workout.routineName}</h2>
          <span className="workout-card-date">{formatDay(workout.startedAt)}</span>
        </div>
        <p className="workout-card-meta">{formatSummary(minutes, doneSets)}</p>
        {workout.changes.length > 0 && (
          <div className="workout-card-changes">
            {workout.changes.slice(0, 3).map((change) => (
              <ChangeBadge key={change.name} kind={change.kind} label={changeLabel(change)} />
            ))}
          </div>
        )}
        {summaryLine && <p className="workout-card-summary">{summaryLine}</p>}
      </IonLabel>
    </IonItem>
  )
}
