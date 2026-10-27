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
import { useFinishedWorkouts } from '../../data/hooks'
import { formatDay, formatSets } from '../../domain/format'
import { exerciseHistory, recordSessionId, weightTrend } from '../../domain/progress'
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
            <IonBackButton text="חזרה" defaultHref="/tabs/exercises" />
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
        {trend.length >= 2 && <WeightChart points={trend} />}
        {sessions.length > 0 && (
          <IonList inset>
            {sessions.map((s) => (
              <IonItem key={s.workoutId}>
                <IonLabel className="ion-text-wrap">
                  <h2>{formatDay(s.startedAt)}</h2>
                  <p>{formatSets(s.sets, s.target)}</p>
                </IonLabel>
                {s.workoutId === record && (
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
