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
import { deleteRoutine } from '../../data/repo'
import { countLabel } from '../../domain/format'
import { exercisesOf, hasExercises } from '../../domain/progress'
import type { Routine } from '../../domain/types'
import { useConfirmDelete } from '../../hooks/useConfirmDelete'
import { useStartWorkout } from '../../hooks/useStartWorkout'

function counts(routine: Routine): string {
  return [
    countLabel(exercisesOf(routine).length, 'תרגיל אחד', 'תרגילים'),
    countLabel(routine.sections.length, 'חלק אחד', 'חלקים'),
  ].join(' · ')
}

export function RoutineRow({ routine }: { routine: Routine }) {
  const router = useIonRouter()
  const confirmDelete = useConfirmDelete()
  const startWorkout = useStartWorkout()
  const sliding = useRef<HTMLIonItemSlidingElement>(null)

  function start(event: MouseEvent) {
    event.stopPropagation()
    void startWorkout(routine)
  }

  function remove() {
    confirmDelete({
      header: 'למחוק את האימון?',
      message: routine.name,
      onConfirm: () => void deleteRoutine(routine.id),
      onCancel: () => void sliding.current?.close(),
    })
  }

  return (
    <IonItemSliding ref={sliding}>
      <IonItem button detail onClick={() => router.push(`/tabs/routines/${routine.id}`)}>
        <IonLabel>
          <h2>{routine.name}</h2>
          <p>{counts(routine)}</p>
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
          התחל
        </IonButton>
      </IonItem>
      <IonItemOptions side="end">
        <IonItemOption color="danger" expandable onClick={remove}>
          מחיקה
        </IonItemOption>
      </IonItemOptions>
    </IonItemSliding>
  )
}
