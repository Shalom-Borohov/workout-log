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
import { useMemo } from 'react'
import { COMMON_COPY } from '../../copy/common'
import { TIMELINE_COPY } from './copy'
import { useFinishedRecords, useWorkout } from '../../data/hooks'
import { deleteWorkout } from '../../data/repo'
import { recordName, sectionsOf } from '../../domain/activities'
import { formatDay } from '../../domain/format'
import { changesOf } from '../../domain/progress'
import { summaryLine } from '../../domain/timeline'
import type { WorkoutRecord } from '../../domain/types'
import { useConfirmDelete } from '../../hooks/useConfirmDelete'
import { useSave } from '../../hooks/useSave'
import { type DetailHostPath, workoutPath } from '../../navigation/paths'
import { ActivityEditButton } from './ActivityEditButton'
import { SummaryEditor } from './SummaryEditor'
import { WorkoutSections } from './WorkoutSections'
import './workoutDetail.css'

const overview = (workout: WorkoutRecord) => `${formatDay(workout.startedAt)} · ${summaryLine(workout)}`

export function WorkoutDetail({ id, tab }: { id: string; tab: DetailHostPath }) {
  const workout = useWorkout(id)
  const records = useFinishedRecords()
  const changes = useMemo(() => (records ? changesOf(records, id) : []), [records, id])
  const router = useIonRouter()
  const confirmDelete = useConfirmDelete()
  const { save } = useSave()

  async function remove() {
    if (!(await save(() => deleteWorkout(id)))) {
      return
    }

    if (router.canGoBack()) {
      router.goBack()
    } else {
      router.push(tab, 'back', 'replace')
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
            <IonBackButton text={COMMON_COPY.back} defaultHref={tab} />
          </IonButtons>
          <IonTitle>{workout && recordName(workout)}</IonTitle>
          <IonButtons slot="end">
            {workout &&
              (workout.kind === 'activity' ? (
                <ActivityEditButton activity={workout} />
              ) : (
                <IonButton routerLink={workoutPath(tab, id)}>{COMMON_COPY.edit}</IonButton>
              ))}
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {workout && (
          <>
            <IonHeader collapse="condense">
              <IonToolbar>
                <IonTitle size="large">
                  {recordName(workout)}
                </IonTitle>
              </IonToolbar>
            </IonHeader>
            <p className="workout-overview">{overview(workout)}</p>
            <SummaryEditor workout={workout} />
            <WorkoutSections sections={sectionsOf(workout)} changes={changes} />
            <IonList inset className="workout-delete">
              <IonItem button detail={false} onClick={confirmRemove}>
                <IonLabel color="danger">{COMMON_COPY.deleteWorkout}</IonLabel>
              </IonItem>
            </IonList>
          </>
        )}
      </IonContent>
    </>
  )
}
