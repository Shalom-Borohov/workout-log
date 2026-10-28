import {
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import { add } from 'ionicons/icons'
import { useMemo, useState } from 'react'
import { EmptyState } from '../../components/EmptyState'
import { COMMON_COPY } from '../../copy/common'
import { TIMELINE_COPY } from './copy'
import { useActiveWorkout, useFinishedWorkouts } from '../../data/hooks'
import { useNow } from '../../hooks/useNow'
import { withChanges } from '../../domain/progress'
import { MINUTE_MS } from '../../domain/time'
import { groupByWeek } from '../../domain/timeline'
import { ActiveWorkoutBanner } from './ActiveWorkoutBanner'
import { PastWorkoutModal } from './PastWorkoutModal'
import { StartWorkoutButton } from './StartWorkoutButton'
import { WeekSection } from './WeekSection'
import './timeline.css'

export function TimelinePage() {
  const workouts = useFinishedWorkouts()
  const active = useActiveWorkout()
  const now = useNow(MINUTE_MS)
  const changes = useMemo(() => (workouts ? withChanges(workouts) : []), [workouts])
  const groups = useMemo(() => groupByWeek(changes, now), [changes, now])
  const [addingPast, setAddingPast] = useState(false)

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{COMMON_COPY.timeline}</IonTitle>
          <IonButtons slot="end">
            <IonButton aria-label={TIMELINE_COPY.addPastWorkout} onClick={() => setAddingPast(true)}>
              <IonIcon slot="icon-only" icon={add} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <PastWorkoutModal isOpen={addingPast} onClose={() => setAddingPast(false)} />
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">{COMMON_COPY.timeline}</IonTitle>
          </IonToolbar>
        </IonHeader>
        {workouts?.length === 0 && <EmptyState title={TIMELINE_COPY.emptyTitle} body={TIMELINE_COPY.emptyBody} />}
        {groups.map((group) => (
          <WeekSection key={group.title} title={group.title} workouts={group.workouts} />
        ))}
      </IonContent>
      <IonFooter translucent className="timeline-footer">
        <IonToolbar>
          {active === null && <StartWorkoutButton />}
          {active && <ActiveWorkoutBanner workout={active} />}
        </IonToolbar>
      </IonFooter>
    </IonPage>
  )
}
