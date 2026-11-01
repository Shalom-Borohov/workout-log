import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
  useIonRouter,
} from '@ionic/react'
import { COMMON_COPY } from '../../copy/common'
import { TIMELINE_COPY } from './copy'
import { useWorkout } from '../../data/hooks'
import { deleteWorkout } from '../../data/repo'
import { recordName, sectionsOf } from '../../domain/activities'
import { formatDay } from '../../domain/format'
import { summaryLine } from '../../domain/timeline'
import type { WorkoutRecord } from '../../domain/types'
import { useConfirmDelete } from '../../hooks/useConfirmDelete'
import { TIMELINE_PATH, workoutPath } from '../../navigation/paths'
import { ActivityEditButton } from './ActivityEditButton'
import { SummaryEditor } from './SummaryEditor'
import { WorkoutSections } from './WorkoutSections'
import './timeline.css'

const overview = (workout: WorkoutRecord) => `${formatDay(workout.startedAt)} · ${summaryLine(workout)}`

export function WorkoutDetail({ id }: { id: string }) {
  const workout = useWorkout(id)
  const router = useIonRouter()
  const confirmDelete = useConfirmDelete()

  async function remove() {
    await deleteWorkout(id)
    if (router.canGoBack()) {
      router.goBack()
    } else {
      router.push(TIMELINE_PATH, 'back', 'replace')
    }
  }

  function confirmRemove() {
    confirmDelete({
      header: COMMON_COPY.deleteWorkoutQuestion,
      message: TIMELINE_COPY.irreversibleAction,
      onConfirm: () => void remove(),
    })
  }

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton text={COMMON_COPY.back} defaultHref={TIMELINE_PATH} />
          </IonButtons>
          <IonTitle>{workout && recordName(workout)}</IonTitle>
          <IonButtons slot="end">
            {workout &&
              (workout.kind === 'activity' ? (
                <ActivityEditButton activity={workout} />
              ) : (
                <IonButton routerLink={workoutPath(TIMELINE_PATH, id)}>{COMMON_COPY.edit}</IonButton>
              ))}
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {workout && (
          <>
            <IonHeader collapse="condense">
              <IonToolbar>
                <IonTitle size="large">{recordName(workout)}</IonTitle>
              </IonToolbar>
            </IonHeader>
            <p className="workout-overview">{overview(workout)}</p>
            <SummaryEditor workout={workout} />
            <WorkoutSections sections={sectionsOf(workout)} />
            <IonList inset className="workout-delete">
              <IonItem button detail={false} onClick={confirmRemove}>
                <IonLabel color="danger" className="ion-text-center">
                  {COMMON_COPY.deleteWorkout}
                </IonLabel>
              </IonItem>
            </IonList>
          </>
        )}
      </IonContent>
    </>
  )
}
