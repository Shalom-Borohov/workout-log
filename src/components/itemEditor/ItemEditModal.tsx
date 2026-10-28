import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonTitle,
  IonToggle,
  IonToolbar,
} from '@ionic/react'
import { COMMON_COPY } from '../../copy/common'
import { ITEM_EDITOR_COPY } from './copy'
import type { RoutineExercise, RoutineItem } from '../../domain/types'
import { ExerciseFields } from './ExerciseFields'
import {
  type Change,
  type ItemInSection,
  itemSets,
  MAX_SETS,
  MIN_SETS,
  setPair,
  withSets,
} from '../../domain/routineEdit'
import { Stepper } from '../Stepper'

const FULL_SHEET = { initialBreakpoint: 1, breakpoints: [0, 1] }

interface Props {
  editing: ItemInSection | undefined
  showStartWeight?: boolean
  onChange: (id: string, change: Change<RoutineItem>) => void
  onDelete: (id: string) => void
  onClose: () => void
}

type FormProps = Omit<Props, 'editing' | 'onClose'> & ItemInSection & { showStartWeight: boolean }

function ItemForm({ item, sectionSets, showStartWeight, onChange, onDelete }: FormProps) {
  function changeExercise(index: number, change: Change<RoutineExercise>) {
    onChange(item.id, (current) => ({
      ...current,
      exercises: current.exercises.map((exercise, exerciseIndex) =>
        exerciseIndex === index ? change(exercise) : exercise,
      ),
    }))
  }

  return (
    <>
      {item.exercises.map((exercise, index) => (
        <ExerciseFields
          key={index}
          exercise={exercise}
          showStartWeight={showStartWeight}
          onChange={(change) => changeExercise(index, change)}
        />
      ))}
      <IonList inset>
        <IonItem>
          <IonLabel>{COMMON_COPY.sets}</IonLabel>
          <Stepper
            value={itemSets(item, sectionSets)}
            min={MIN_SETS}
            max={MAX_SETS}
            decreaseLabel={COMMON_COPY.removeSet}
            increaseLabel={COMMON_COPY.addSet}
            onChange={(sets) => onChange(item.id, (current) => withSets(current, sets, sectionSets))}
          />
        </IonItem>
        <IonItem>
          <IonToggle
            checked={item.exercises.length > 1}
            onIonChange={(event) => onChange(item.id, (current) => setPair(current, event.detail.checked))}
          >
            {ITEM_EDITOR_COPY.pair}
          </IonToggle>
        </IonItem>
      </IonList>
      <IonList inset>
        <IonItem button detail={false} onClick={() => onDelete(item.id)}>
          <IonLabel color="danger">{ITEM_EDITOR_COPY.deleteExercise}</IonLabel>
        </IonItem>
      </IonList>
    </>
  )
}

export function ItemEditModal({ editing, showStartWeight = true, onChange, onDelete, onClose }: Props) {
  return (
    <IonModal isOpen={editing !== undefined} onDidDismiss={onClose} {...FULL_SHEET}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{ITEM_EDITOR_COPY.editExercise}</IonTitle>
          <IonButtons slot="end">
            <IonButton strong onClick={onClose}>
              {COMMON_COPY.close}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {editing && (
          <ItemForm {...editing} showStartWeight={showStartWeight} onChange={onChange} onDelete={onDelete} />
        )}
      </IonContent>
    </IonModal>
  )
}
