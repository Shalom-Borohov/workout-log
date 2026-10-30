import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonNote,
  IonSearchbar,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import { addCircle } from 'ionicons/icons'
import { useMemo } from 'react'
import { COMMON_COPY } from '../../copy/common'
import { useFinishedWorkouts, useRoutines } from '../../data/hooks'
import { exerciseChoices } from '../../domain/exerciseChoices'
import { shortDate } from '../../domain/format'
import { HOUR_MS } from '../../domain/time'
import type { RoutineExercise } from '../../domain/types'
import { useNow } from '../../hooks/useNow'
import { useSearch } from '../../hooks/useSearch'
import { FULL_SHEET } from '../sheet'
import { ITEM_EDITOR_COPY } from './copy'

interface Props {
  isOpen: boolean
  onPick: (exercise?: RoutineExercise) => void
  onClose: () => void
}

interface ChoiceRowsProps {
  matches: (name: string) => boolean
  onPick: (exercise: RoutineExercise) => void
}

function ChoiceRows({ matches, onPick }: ChoiceRowsProps) {
  const routines = useRoutines()
  const finishedWorkouts = useFinishedWorkouts()
  const now = useNow(HOUR_MS)

  const choices = useMemo(
    () => (routines && finishedWorkouts ? exerciseChoices(routines, finishedWorkouts) : []),
    [routines, finishedWorkouts],
  )

  return choices
    .filter(({ exercise }) => matches(exercise.name))
    .map(({ exercise, lastDone }) => (
      <IonItem key={exercise.name} button detail={false} onClick={() => onPick(exercise)}>
        <IonLabel>{exercise.name}</IonLabel>
        {lastDone !== null && <IonNote slot="end">{shortDate(lastDone, now)}</IonNote>}
      </IonItem>
    ))
}

export function ExercisePicker({ isOpen, onPick, onClose }: Props) {
  const search = useSearch()

  function dismiss() {
    search.clear()
    onClose()
  }

  return (
    <IonModal isOpen={isOpen} onDidDismiss={dismiss} {...FULL_SHEET}>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={onClose}>{COMMON_COPY.cancel}</IonButton>
          </IonButtons>
          <IonTitle>{COMMON_COPY.addExercise}</IonTitle>
        </IonToolbar>
        <IonToolbar>
          <IonSearchbar
            placeholder={COMMON_COPY.search}
            value={search.query}
            onIonInput={(event) => search.onInput(event.detail)}
          />
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList inset>
          <IonItem button detail={false} onClick={() => onPick()}>
            <IonIcon slot="start" color="primary" icon={addCircle} />
            <IonLabel color="primary">{ITEM_EDITOR_COPY.newExercise}</IonLabel>
          </IonItem>
          <ChoiceRows matches={search.matches} onPick={onPick} />
        </IonList>
      </IonContent>
    </IonModal>
  )
}
