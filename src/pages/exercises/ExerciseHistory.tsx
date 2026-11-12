import { IonBackButton, IonButtons, IonContent, IonHeader, IonList, IonTitle, IonToolbar } from '@ionic/react'
import { COMMON_COPY } from '../../copy/common'
import { useFinishedWorkouts } from '../../data/hooks'
import { exerciseHistory, recordSessionId, weightTrend } from '../../domain/progress'
import { EXERCISES_PATH } from '../../navigation/paths'
import { BodyAreaRow } from './BodyAreaRow'
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
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton text={COMMON_COPY.back} defaultHref={EXERCISES_PATH} />
          </IonButtons>
          <IonTitle>{name}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large" className="exercise-history-title">
              <span className="exercise-history-title-text">{name}</span>
            </IonTitle>
          </IonToolbar>
        </IonHeader>
        <BodyAreaRow name={name} />
        {trend.length >= MIN_TREND_POINTS && <WeightChart points={trend} />}
        {sessions.length > 0 && (
          <IonList inset>
            {sessions.map((session) => (
              <SessionRow key={session.workoutId} session={session} isRecord={session.workoutId === record} />
            ))}
          </IonList>
        )}
      </IonContent>
    </>
  )
}
