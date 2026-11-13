import { IonList } from '@ionic/react'
import { useFinishedWorkouts } from '../../data/hooks'
import { exerciseHistory, recordSessionId } from '../../domain/progress'
import { sessionBarFractions } from '../../domain/sessionBars'
import { BodyAreaRow } from './BodyAreaRow'
import { HistoryLayout } from './HistoryLayout'
import { SessionRow } from './SessionRow'
import './exerciseHistory.css'

export function ExerciseHistory({ name }: { name: string }) {
  const workouts = useFinishedWorkouts()
  const sessions = workouts ? exerciseHistory(workouts, name) : []
  const record = recordSessionId(sessions)
  const bars = sessionBarFractions(sessions)

  return (
    <HistoryLayout name={name}>
      <BodyAreaRow name={name} />
      {sessions.length > 0 && (
        <IonList className="list-plates">
          {sessions.map((session) => (
            <SessionRow
              key={session.workoutId}
              session={session}
              isRecord={session.workoutId === record}
              barFraction={bars.get(session.workoutId)}
            />
          ))}
        </IonList>
      )}
    </HistoryLayout>
  )
}
