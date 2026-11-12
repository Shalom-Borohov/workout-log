import {
  IonButton,
  IonIcon,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  useIonRouter,
} from '@ionic/react'
import { play } from 'ionicons/icons'
import type { MouseEvent } from 'react'
import { useRef } from 'react'
import { ButtonRow } from '../../components/ButtonRow'
import { COMMON_COPY } from '../../copy/common'
import { ROUTINES_COPY } from './copy'
import { deleteRoutine } from '../../data/repo'
import { shortDate } from '../../domain/format'
import { hasExercises } from '../../domain/progress'
import type { Routine } from '../../domain/types'
import { useConfirmDelete } from '../../hooks/useConfirmDelete'
import { useSave } from '../../hooks/useSave'
import { useStartWorkout } from '../../hooks/useStartWorkout'
import { ROUTINES_PATH, routinePath } from '../../navigation/paths'
import { RoutinePartsLine } from './RoutinePartsLine'
import { useDuplicateRoutine } from './useDuplicateRoutine'

export function RoutineRow({ routine, now }: { routine: Routine; now: number }) {
  const router = useIonRouter()
  const confirmDelete = useConfirmDelete()
  const startWorkout = useStartWorkout(ROUTINES_PATH)
  const duplicateRoutine = useDuplicateRoutine(ROUTINES_PATH)
  const sliding = useRef<HTMLIonItemSlidingElement>(null)
  const { save } = useSave()

  function start(event: MouseEvent) {
    event.stopPropagation()
    void startWorkout(routine)
  }

  function remove() {
    confirmDelete({
      header: COMMON_COPY.deleteWorkoutQuestion,
      message: routine.name,
      onConfirm: () => void save(() => deleteRoutine(routine.id)),
      onCancel: () => void sliding.current?.close(),
    })
  }

  function duplicate() {
    void sliding.current?.close()
    void duplicateRoutine(routine)
  }

  return (
    <IonItemSliding ref={sliding} className="routine-row">
      <ButtonRow
        label={routine.name}
        onClick={() => router.push(routinePath(ROUTINES_PATH, routine.id))}
        controls={
          <IonButton
            slot="end"
            shape="round"
            className="start-button"
            aria-label={ROUTINES_COPY.start}
            disabled={!hasExercises(routine)}
            onClick={start}
          >
            <IonIcon slot="icon-only" icon={play} aria-hidden="true" />
          </IonButton>
        }
      >
        <IonLabel className="ion-text-wrap">
          <h2 className="routine-name">{routine.name}</h2>
          <RoutinePartsLine routine={routine} />
          <p className="routine-created">{ROUTINES_COPY.created(shortDate(routine.createdAt, now))}</p>
        </IonLabel>
      </ButtonRow>
      <IonItemOptions side="end">
        <IonItemOption color="medium" onClick={duplicate}>
          {ROUTINES_COPY.duplicate}
        </IonItemOption>
        <IonItemOption color="danger" expandable onClick={remove}>
          {COMMON_COPY.delete}
        </IonItemOption>
      </IonItemOptions>
    </IonItemSliding>
  )
}
