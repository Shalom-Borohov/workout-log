import { IonButton, IonButtons, IonContent, IonHeader, IonModal, IonTitle, IonToolbar } from '@ionic/react'
import { useState } from 'react'
import { HALF_SHEET } from '../../components/sheet'
import { COMMON_COPY } from '../../copy/common'
import type { Workout } from '../../domain/types'
import { canRemoveItem, moveItem } from '../../domain/workoutStructure'
import { OverviewSection } from './OverviewSection'
import { RoutineActions } from './RoutineActions'
import type { OverviewEditor, WorkoutEdit } from './useOverviewEditor'

export type ListMode = 'progress' | 'editing'

interface ItemListModalProps {
  mode: ListMode | null
  workout: Workout
  current: number
  editor: OverviewEditor
  onSelect: (index: number) => void
  onEdit: WorkoutEdit
  onModeChange: (mode: ListMode | null) => void
}

export function ItemListModal({ mode, workout, current, editor, onSelect, onEdit, onModeChange }: ItemListModalProps) {
  const close = () => onModeChange(null)
  const [shown, setShown] = useState<ListMode>('progress')
  const canDelete = canRemoveItem(workout)
  const editing = shown === 'editing'

  const offsets = workout.sections.map((_, sectionIndex) =>
    workout.sections.slice(0, sectionIndex).reduce((count, section) => count + section.items.length, 0),
  )

  if (mode !== null && mode !== shown) {
    setShown(mode)
  }

  return (
    <IonModal isOpen={mode !== null} onDidDismiss={close} {...HALF_SHEET}>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton strong={editing} onClick={() => onModeChange(editing ? 'progress' : 'editing')}>
              {editing ? COMMON_COPY.done : COMMON_COPY.edit}
            </IonButton>
          </IonButtons>
          <IonTitle>{COMMON_COPY.exercises}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={close}>{COMMON_COPY.close}</IonButton>
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
            onEditItem={editor.flow.open}
            onDeleteItem={editor.remove}
            onReorder={(from, to) => onEdit((current) => moveItem(current, sectionIndex, from, to))}
            onAdd={() => editor.flow.addTo(sectionIndex)}
          />
        ))}
        {editing && <RoutineActions workout={workout} onEdit={onEdit} />}
      </IonContent>
    </IonModal>
  )
}
