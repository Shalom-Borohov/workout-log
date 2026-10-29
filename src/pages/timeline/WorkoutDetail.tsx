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
import { formatDay, formatSummary } from '../../domain/format'
import { summarize } from '../../domain/timeline'
import type { Workout } from '../../domain/types'
import { useConfirmDelete } from '../../hooks/useConfirmDelete'
import { TIMELINE_PATH, workoutPath } from '../../navigation/paths'
import { SummaryEditor } from './SummaryEditor'
import { WorkoutSections } from './WorkoutSections'
import './timeline.css'

function overview(workout: Workout): string {
  const { minutes, doneSets } = summarize(workout)

  return `${formatDay(workout.startedAt)} · ${formatSummary(minutes, doneSets)}`
}

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
          <IonTitle>{workout?.routineName}</IonTitle>
          <IonButtons slot="end">
            <IonButton routerLink={workoutPath(TIMELINE_PATH, id)}>{COMMON_COPY.edit}</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {workout && (
          <>
            <IonHeader collapse="condense">
              <IonToolbar>
                <IonTitle size="large">{workout.routineName}</IonTitle>
              </IonToolbar>
            </IonHeader>
            <p className="workout-overview">{overview(workout)}</p>
            <SummaryEditor workout={workout} />
            <WorkoutSections sections={workout.sections} />
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
