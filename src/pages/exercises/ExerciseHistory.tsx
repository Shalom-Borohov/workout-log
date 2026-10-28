import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import { ChangeBadge } from '../../components/ChangeBadge'
import { COMMON_COPY } from '../../copy/common'
import { useFinishedWorkouts } from '../../data/hooks'
import { formatDay, formatSets } from '../../domain/format'
import { exerciseHistory, recordSessionId, weightTrend } from '../../domain/progress'
import { EXERCISES_PATH } from '../../navigation/paths'
import { MIN_TREND_POINTS } from './trendGeometry'
import { WeightChart } from './WeightChart'
import './exercises.css'

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
            <IonTitle size="large">{name}</IonTitle>
          </IonToolbar>
        </IonHeader>
        {trend.length >= MIN_TREND_POINTS && <WeightChart points={trend} />}
        {sessions.length > 0 && (
          <IonList inset>
            {sessions.map((session) => (
              <IonItem key={session.workoutId}>
                <IonLabel className="ion-text-wrap">
                  <h2>{formatDay(session.startedAt)}</h2>
                  <p>{formatSets(session.sets, session.target)}</p>
                </IonLabel>
                {session.workoutId === record && (
                  <span slot="end">
                    <ChangeBadge kind="record" />
                  </span>
                )}
              </IonItem>
            ))}
          </IonList>
        )}
      </IonContent>
    </>
  )
}
