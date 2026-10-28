import { IonLabel, IonList, IonListHeader } from '@ionic/react'
import { formatWeekSummary } from '../../domain/format'
import type { WorkoutWithChanges } from '../../domain/progress'
import { summarize } from '../../domain/timeline'
import { WorkoutCard } from './WorkoutCard'

export function WeekSection({ title, workouts }: { title: string; workouts: WorkoutWithChanges[] }) {
  const doneSets = workouts.reduce((sum, workout) => sum + summarize(workout).doneSets, 0)

  return (
    <section>
      <IonListHeader>
        <IonLabel className="week-header">
          <span className="week-title">{title}</span>
          <span>{formatWeekSummary(workouts.length, doneSets)}</span>
        </IonLabel>
      </IonListHeader>
      <IonList inset>
        {workouts.map((workout) => (
          <WorkoutCard key={workout.id} workout={workout} />
        ))}
      </IonList>
    </section>
  )
}
