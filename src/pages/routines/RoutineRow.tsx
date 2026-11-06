import {
  IonButton,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  useIonRouter,
} from '@ionic/react'
import { play } from 'ionicons/icons'
import type { MouseEvent } from 'react'
import { useRef } from 'react'
import { COMMON_COPY } from '../../copy/common'
import { ROUTINES_COPY } from './copy'
import { deleteRoutine } from '../../data/repo'
import { countLabel, LIST_SEPARATOR, shortDate } from '../../domain/format'
import { exercisesOf, hasExercises } from '../../domain/progress'
import type { Routine } from '../../domain/types'
import { useConfirmDelete } from '../../hooks/useConfirmDelete'
import { useSave } from '../../hooks/useSave'
import { useStartWorkout } from '../../hooks/useStartWorkout'
import { ROUTINES_PATH, routinePath } from '../../navigation/paths'
import { useDuplicateRoutine } from './useDuplicateRoutine'

function counts(routine: Routine, now: number): string {
  return [
    countLabel(exercisesOf(routine).length, ROUTINES_COPY.oneExercise, COMMON_COPY.exercises),
    countLabel(routine.sections.length, ROUTINES_COPY.oneSection, ROUTINES_COPY.sections),
    ROUTINES_COPY.created(shortDate(routine.createdAt, now)),
  ].join(LIST_SEPARATOR)
}

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
    <IonItemSliding ref={sliding}>
      <IonItem button detail onClick={() => router.push(routinePath(ROUTINES_PATH, routine.id))}>
        <IonLabel>
          <h2>{routine.name}</h2>
          <p>{counts(routine, now)}</p>
        </IonLabel>
        <IonButton
          slot="end"
          size="small"
          shape="round"
          className="start-button"
          disabled={!hasExercises(routine)}
          onClick={start}
        >
          <IonIcon slot="start" icon={play} />
          {ROUTINES_COPY.start}
        </IonButton>
      </IonItem>
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
