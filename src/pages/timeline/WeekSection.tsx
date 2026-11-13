import { IonList } from '@ionic/react'
import { memo, useId } from 'react'
import { formatWeekSummary } from '../../domain/format'
import type { WorkoutWithChanges } from '../../domain/progress'
import { summarize, weekDays } from '../../domain/timeline'
import { DayStrip } from './DayStrip'
import { WorkoutCard } from './WorkoutCard'

interface Props {
  title: string
  start: number
  workouts: WorkoutWithChanges[]
  today: number
}

export const WeekSection = memo(function WeekSection({ title, start, workouts, today }: Props) {
  const titleId = useId()
  const doneSets = workouts.reduce((sum, workout) => sum + summarize(workout).doneSets, 0)

  return (
    <section className="week">
      <div className="week-header">
        <h2 id={titleId} className="week-title">
          {title}
        </h2>
        <p className="week-summary">{formatWeekSummary(workouts.length, doneSets)}</p>
      </div>
      <DayStrip days={weekDays(start, workouts, today)} labelledBy={titleId} />
      <IonList className="list-plates week-records">
        {workouts.map((workout) => (
          <WorkoutCard key={workout.id} workout={workout} />
        ))}
      </IonList>
    </section>
  )
})
