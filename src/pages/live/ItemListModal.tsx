import { IonButton, IonButtons, IonContent, IonHeader, IonModal, IonTitle, IonToolbar } from '@ionic/react'
import { useState } from 'react'
import { HALF_SHEET } from '../../components/sheet'
import { COMMON_COPY } from '../../copy/common'
import type { PreviousSessionLookup } from '../../domain/progress'
import type { RoutineExercise, Workout } from '../../domain/types'
import { canRemoveItem, moveItem } from '../../domain/workoutStructure'
import { ExercisePicker } from '../../components/itemEditor/ExercisePicker'
import { ItemEditModal } from '../../components/itemEditor/ItemEditModal'
import { OverviewSection } from './OverviewSection'
import { RoutineActions } from './RoutineActions'
import { useOverviewEditor, type WorkoutEdit } from './useOverviewEditor'

interface ItemListModalProps {
  isOpen: boolean
  workout: Workout
  current: number
  previous: PreviousSessionLookup | undefined
  onSelect: (index: number) => void
  onEdit: WorkoutEdit
  onClose: () => void
}

export function ItemListModal({ isOpen, workout, current, previous, onSelect, onEdit, onClose }: ItemListModalProps) {
  const [editing, setEditing] = useState(false)
  const [addingTo, setAddingTo] = useState<number | null>(null)
  const editor = useOverviewEditor(workout, previous, onEdit)
  const canDelete = canRemoveItem(workout)

  const offsets = workout.sections.map((_, sectionIndex) =>
    workout.sections.slice(0, sectionIndex).reduce((count, section) => count + section.items.length, 0),
  )

  function dismiss() {
    setEditing(false)
    onClose()
  }

  function pick(exercise?: RoutineExercise) {
    if (addingTo !== null) {
      editor.add(addingTo, exercise)
    }
    setAddingTo(null)
  }

  return (
    <IonModal isOpen={isOpen} onDidDismiss={dismiss} {...HALF_SHEET}>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton strong={editing} onClick={() => setEditing(!editing)}>
              {editing ? COMMON_COPY.done : COMMON_COPY.edit}
            </IonButton>
          </IonButtons>
          <IonTitle>{COMMON_COPY.exercises}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}>{COMMON_COPY.close}</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {workout.sections.map((section, sectionIndex) => (
          <OverviewSection
            key={sectionIndex}
            section={section}
            offset={offsets[sectionIndex]}
            current={current}
            editing={editing}
            canDelete={canDelete}
            onSelect={onSelect}
            onEditItem={editor.open}
            onDeleteItem={editor.remove}
            onReorder={(from, to) => onEdit((current) => moveItem(current, sectionIndex, from, to))}
            onAdd={() => setAddingTo(sectionIndex)}
          />
        ))}
        {editing && <RoutineActions workout={workout} />}
      </IonContent>
      <ExercisePicker
        isOpen={addingTo !== null}
        onPick={pick}
        onClose={() => setAddingTo(null)}
      />
      <ItemEditModal
        editing={editor.editing}
        showStartWeight={false}
        onChange={editor.change}
        onDelete={editor.remove}
        onClose={editor.close}
      />
    </IonModal>
  )
}
