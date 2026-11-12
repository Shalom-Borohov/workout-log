import { IonList } from '@ionic/react'
import { useFinishedWorkouts } from '../../data/hooks'
import { exerciseHistory, recordSessionId, weightTrend } from '../../domain/progress'
import { BodyAreaRow } from './BodyAreaRow'
import { HistoryLayout } from './HistoryLayout'
import { SessionRow } from './SessionRow'
import { MIN_TREND_POINTS } from './trendGeometry'
import { WeightChart } from './WeightChart'
import './exerciseHistory.css'

export function ExerciseHistory({ name }: { name: string }) {
  const workouts = useFinishedWorkouts()
  const sessions = workouts ? exerciseHistory(workouts, name) : []
  const record = recordSessionId(sessions)
  const trend = weightTrend(sessions)

  return (
    <HistoryLayout name={name}>
      <BodyAreaRow name={name} />
      {trend.length >= MIN_TREND_POINTS && <WeightChart points={trend} />}
      {sessions.length > 0 && (
        <IonList inset>
          {sessions.map((session) => (
            <SessionRow key={session.workoutId} session={session} isRecord={session.workoutId === record} />
          ))}
        </IonList>
      )}
    </HistoryLayout>
  )
}
