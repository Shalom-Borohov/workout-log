import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react'
import { useMemo } from 'react'
import { EmptyState } from '../../components/EmptyState'
import { useActiveWorkout, useFinishedWorkouts } from '../../data/hooks'
import { useNow } from '../../hooks/useNow'
import { withChanges } from '../../domain/progress'
import { groupByWeek } from '../../domain/timeline'
import { ActiveWorkoutBanner } from './ActiveWorkoutBanner'
import { StartWorkoutButton } from './StartWorkoutButton'
import { WeekSection } from './WeekSection'
import './timeline.css'

export function TimelinePage() {
  const workouts = useFinishedWorkouts()
  const active = useActiveWorkout()
  const now = useNow(60_000)
  const changes = useMemo(() => (workouts ? withChanges(workouts) : []), [workouts])
  const groups = useMemo(() => groupByWeek(changes, now), [changes, now])

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>ציר זמן</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">ציר זמן</IonTitle>
          </IonToolbar>
        </IonHeader>
        {active === null && <StartWorkoutButton />}
        {active && <ActiveWorkoutBanner workout={active} />}
        {workouts?.length === 0 && (
          <EmptyState
            title="עוד אין אימונים"
            body="לוחצים על „התחל אימון” למעלה. כל אימון שמסיימים יופיע כאן, עם השיפורים והשיאים."
          />
        )}
        {groups.map((group) => (
          <WeekSection key={group.title} title={group.title} workouts={group.workouts} />
        ))}
      </IonContent>
    </IonPage>
  )
}
