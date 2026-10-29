import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonList,
  IonModal,
  IonNote,
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
import { isoDate, pad } from '../../domain/format'
import { MAX_SECONDS } from '../../domain/limits'
import { hasExercises } from '../../domain/progress'
import { HOUR_MS, MINUTE_MS, SECONDS_PER_MINUTE } from '../../domain/time'
import { useNow } from '../../hooks/useNow'
import { TIMELINE_PATH, workoutPath } from '../../navigation/paths'

const DEFAULT_DURATION_MINUTES = 60

const MAX_DURATION_MINUTES = MAX_SECONDS / SECONDS_PER_MINUTE

const timeValue = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`

function PastWorkoutForm({ onClose }: { onClose: () => void }) {
  const routines = useRoutines()
  const router = useIonRouter()
  const now = useNow(MINUTE_MS)
  const [defaultStart] = useState(() => new Date(now - HOUR_MS))
  const [routineId, setRoutineId] = useState<string | null>(null)
  const [date, setDate] = useState(() => isoDate(defaultStart.getTime()))
  const [time, setTime] = useState(() => timeValue(defaultStart))
  const [duration, setDuration] = useState(String(DEFAULT_DURATION_MINUTES))

  const startable = routines ? routines.filter(hasExercises) : []
  const routine = startable.find((candidate) => candidate.id === routineId) ?? startable.at(0)
  const startedAt = new Date(`${date}T${time}`).getTime()
  const minutes = Number(duration)
  const inFuture = startedAt >= now
  const tooLong = minutes > MAX_DURATION_MINUTES
  const endsAfterNow = !inFuture && startedAt + minutes * MINUTE_MS > now

  const valid =
    routine !== undefined &&
    Number.isFinite(startedAt) &&
    Number.isInteger(minutes) &&
    minutes > 0 &&
    !inFuture &&
    !tooLong &&
    !endsAfterNow

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
          <IonItem>
            <IonInput
              label={TIMELINE_COPY.date}
              type="date"
              max={isoDate(now)}
              value={date}
              onIonInput={(event) => typeof event.detail.value === 'string' && setDate(event.detail.value)}
            />
          </IonItem>
          <IonItem>
            <IonInput
              label={TIMELINE_COPY.startTime}
              type="time"
              value={time}
              onIonInput={(event) => typeof event.detail.value === 'string' && setTime(event.detail.value)}
            />
          </IonItem>
          <IonItem>
            <IonInput
              label={TIMELINE_COPY.durationMinutes}
              type="number"
              inputmode="numeric"
              min={1}
              max={MAX_DURATION_MINUTES}
              value={duration}
              onIonInput={(event) => typeof event.detail.value === 'string' && setDuration(event.detail.value)}
            />
          </IonItem>
        </IonList>
        {inFuture && (
          <IonNote color="danger" className="list-footer">
            {TIMELINE_COPY.startTimeMustBePast}
          </IonNote>
        )}
        {endsAfterNow && (
          <IonNote color="danger" className="list-footer">
            {TIMELINE_COPY.mustEndByNow}
          </IonNote>
        )}
        {tooLong && (
          <IonNote color="danger" className="list-footer">
            {TIMELINE_COPY.maxDuration(MAX_DURATION_MINUTES)}
          </IonNote>
        )}
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
