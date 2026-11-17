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
import { addCircle, checkmark } from 'ionicons/icons'
import { useMemo, useRef } from 'react'
import { COMMON_COPY } from '../../copy/common'
import { useExerciseAreas, useFinishedWorkouts, useRoutines } from '../../data/hooks'
import { areaOf } from '../../domain/bodyAreas'
import { exerciseChoices } from '../../domain/exerciseChoices'
import { shortDate } from '../../domain/format'
import { HOUR_MS } from '../../domain/time'
import type { RoutineExercise } from '../../domain/types'
import { useNow } from '../../hooks/useNow'
import { useSearch } from '../../hooks/useSearch'
import { BodyAreaIcon } from '../bodyArea/BodyAreaIcon'
import { FULL_SHEET } from '../sheet'
import { ITEM_EDITOR_COPY } from './copy'
import type { PickerMode } from './useItemEditorFlow'
import { useTickedExercises } from './useTickedExercises'

interface Props {
  isOpen: boolean
  mode: PickerMode
  onAdd: (exercises: RoutineExercise[]) => void
  onCreate: (ticked: RoutineExercise[], name: string) => void
  onReplace: (exercise: RoutineExercise) => void
  onClose: () => void
}

interface ChoiceRowsProps {
  matches: (name: string) => boolean
  isTicked: (name: string) => boolean
  onTap: (exercise: RoutineExercise) => void
}

const neverTicked = () => false

function ChoiceRows({ matches, isTicked, onTap }: ChoiceRowsProps) {
  const routines = useRoutines()
  const finishedWorkouts = useFinishedWorkouts()
  const areas = useExerciseAreas()
  const now = useNow(HOUR_MS)

  const choices = useMemo(
    () => (routines && finishedWorkouts ? exerciseChoices(routines, finishedWorkouts) : []),
    [routines, finishedWorkouts],
  )

  return choices
    .filter(({ exercise }) => matches(exercise.name))
    .map(({ exercise, lastDone }) => {
      const ticked = isTicked(exercise.name)

      return (
        <IonItem key={exercise.name} button detail={false} onClick={() => onTap(exercise)}>
          {areas && <BodyAreaIcon slot="start" area={areaOf(areas, exercise.name)} />}
          <IonLabel>
            {exercise.name}
            {ticked && <span className="visually-hidden"> {ITEM_EDITOR_COPY.ticked}</span>}
          </IonLabel>
          {lastDone !== null && <IonNote slot="end">{shortDate(lastDone, now)}</IonNote>}
          {ticked && <IonIcon slot="end" color="primary" icon={checkmark} aria-hidden="true" />}
        </IonItem>
      )
    })
}

export function ExercisePicker({ isOpen, mode, onAdd, onCreate, onReplace, onClose }: Props) {
  const modal = useRef<HTMLIonModalElement>(null)
  const search = useSearch()
  const ticks = useTickedExercises()
  const typedName = search.query.trim()
  const adding = mode === 'add'
  const tickedCount = ticks.ticked.length

  function dismissed() {
    search.clear()
    ticks.clear()
    onClose()
  }

  return (
    <IonModal ref={modal} isOpen={isOpen} onDidDismiss={dismissed} {...FULL_SHEET}>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={() => void modal.current?.dismiss()}>{COMMON_COPY.cancel}</IonButton>
          </IonButtons>
          <IonTitle>{adding ? COMMON_COPY.addExercise : ITEM_EDITOR_COPY.replaceExercise}</IonTitle>
          {adding && (
            <IonButtons slot="end">
              <IonButton strong disabled={tickedCount === 0} onClick={() => onAdd(ticks.ticked)}>
                {tickedCount > 0 ? ITEM_EDITOR_COPY.addCount(tickedCount) : COMMON_COPY.add}
              </IonButton>
            </IonButtons>
          )}
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
          {adding && (
            <IonItem button detail={false} onClick={() => onCreate(ticks.ticked, typedName)}>
              <IonIcon slot="start" color="primary" icon={addCircle} aria-hidden="true" />
              <IonLabel color="primary">
                {typedName ? ITEM_EDITOR_COPY.newExerciseNamed(typedName) : ITEM_EDITOR_COPY.newExercise}
              </IonLabel>
            </IonItem>
          )}
          <ChoiceRows
            matches={search.matches}
            isTicked={adding ? ticks.isTicked : neverTicked}
            onTap={adding ? ticks.toggle : onReplace}
          />
        </IonList>
      </IonContent>
    </IonModal>
  )
}
