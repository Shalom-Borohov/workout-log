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
  useIonActionSheet,
} from '@ionic/react'
import { add } from 'ionicons/icons'
import { useMemo, useState } from 'react'
import { EmptyState } from '../../components/EmptyState'
import { SettingsButton } from '../../components/SettingsButton'
import { COMMON_COPY } from '../../copy/common'
import { TIMELINE_COPY } from './copy'
import { useActiveWorkout, useFinishedRecords } from '../../data/hooks'
import { useNow } from '../../hooks/useNow'
import { withChanges } from '../../domain/progress'
import { MINUTE_MS } from '../../domain/time'
import { groupByWeek } from '../../domain/timeline'
import { TIMELINE_PATH } from '../../navigation/paths'
import { ActiveWorkoutBanner } from './ActiveWorkoutBanner'
import { ActivityModal } from './ActivityModal'
import { BackupReminder } from './BackupReminder'
import { PastWorkoutModal } from './PastWorkoutModal'
import { StartWorkoutButton } from './StartWorkoutButton'
import { WeekSection } from './WeekSection'
import './timeline.css'

export function TimelinePage() {
  const workouts = useFinishedRecords()
  const active = useActiveWorkout()
  const now = useNow(MINUTE_MS)
  const changes = useMemo(() => (workouts ? withChanges(workouts) : []), [workouts])
  const groups = useMemo(() => groupByWeek(changes, now), [changes, now])
  const [adding, setAdding] = useState<'past' | 'activity' | null>(null)
  const [presentSheet] = useIonActionSheet()

  function chooseAddition() {
    presentSheet({
      buttons: [
        { text: TIMELINE_COPY.pastWorkout, handler: () => setAdding('past') },
        { text: TIMELINE_COPY.otherActivity, handler: () => setAdding('activity') },
        { text: COMMON_COPY.cancel, role: 'cancel' },
      ],
    })
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{COMMON_COPY.timeline}</IonTitle>
          <IonButtons slot="end">
            <SettingsButton tab={TIMELINE_PATH} />
            <IonButton aria-label={TIMELINE_COPY.add} onClick={chooseAddition}>
              <IonIcon slot="icon-only" icon={add} aria-hidden="true" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <PastWorkoutModal isOpen={adding === 'past'} onClose={() => setAdding(null)} />
      <ActivityModal isOpen={adding === 'activity'} activity={null} onClose={() => setAdding(null)} />
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">{COMMON_COPY.timeline}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <BackupReminder records={workouts?.length} now={now} />
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
