import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonList,
  IonModal,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
  useIonRouter,
} from '@ionic/react'
import { useState } from 'react'
import { COMMON_COPY } from '../../copy/common'
import { TIMELINE_COPY } from './copy'
import { useRoutines } from '../../data/hooks'
import { addPastWorkout } from '../../data/repo'
import { pastTimeProblems } from '../../domain/pastTime'
import { hasExercises } from '../../domain/progress'
import { MINUTE_MS } from '../../domain/time'
import { useNow } from '../../hooks/useNow'
import { TIMELINE_PATH, workoutPath } from '../../navigation/paths'
import { PastTimeItems, PastTimeNotes } from './PastTimeFields'
import { defaultPastTime, readPastTime } from './pastTimeForm'

function PastWorkoutForm({ onClose }: { onClose: () => void }) {
  const routines = useRoutines()
  const router = useIonRouter()
  const now = useNow(MINUTE_MS)
  const [routineId, setRoutineId] = useState<string | null>(null)
  const [pastTime, setPastTime] = useState(() => defaultPastTime(now))

  const startable = routines ? routines.filter(hasExercises) : []
  const routine = startable.find((candidate) => candidate.id === routineId) ?? startable.at(0)
  const { startedAt, minutes } = readPastTime(pastTime)
  const problems = pastTimeProblems(startedAt, minutes, now)
  const valid = routine !== undefined && problems.valid

  async function save() {
    if (!routine) {
      return
    }
    const workout = await addPastWorkout(routine, startedAt, minutes * MINUTE_MS)

    onClose()
    router.push(workoutPath(TIMELINE_PATH, workout.id))
  }

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={onClose}>{COMMON_COPY.cancel}</IonButton>
          </IonButtons>
          <IonTitle>{TIMELINE_COPY.pastWorkout}</IonTitle>
          <IonButtons slot="end">
            <IonButton strong disabled={!valid} onClick={() => void save()}>
              {COMMON_COPY.save}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent color="light">
        <IonList inset>
          <IonItem>
            <IonSelect
              label={TIMELINE_COPY.routine}
              value={routine?.id}
              interface="action-sheet"
              cancelText={COMMON_COPY.cancel}
              onIonChange={(event) => typeof event.detail.value === 'string' && setRoutineId(event.detail.value)}
            >
              {startable.map((option) => (
                <IonSelectOption key={option.id} value={option.id}>
                  {option.name}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
          <PastTimeItems value={pastTime} now={now} onChange={setPastTime} />
        </IonList>
        <PastTimeNotes problems={problems} />
      </IonContent>
    </>
  )
}

export function PastWorkoutModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <PastWorkoutForm onClose={onClose} />
    </IonModal>
  )
}
