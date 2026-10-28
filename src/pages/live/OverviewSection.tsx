import {
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonNote,
  IonReorderGroup,
  type ReorderEndCustomEvent,
} from '@ionic/react'
import { addCircle, checkmarkCircle } from 'ionicons/icons'
import { COMMON_COPY } from '../../copy/common'
import { LIVE_COPY } from './copy'
import type { WorkoutSection } from '../../domain/types'
import { isDone, isSkipped, itemTitle } from '../../domain/workoutEdits'
import { OverviewEditRow } from './OverviewEditRow'

interface Props {
  section: WorkoutSection
  offset: number
  current: number
  editing: boolean
  canDelete: boolean
  onSelect: (index: number) => void
  onEditItem: (id: string) => void
  onDeleteItem: (id: string) => void
  onReorder: (from: number, to: number) => void
  onAdd: () => void
}

function EditableItems({ section, canDelete, onEditItem, onDeleteItem, onReorder, onAdd }: Props) {
  function reorder(event: ReorderEndCustomEvent) {
    const { from, to } = event.detail

    event.detail.complete()
    onReorder(from, to)
  }

  return (
    <>
      <IonReorderGroup disabled={false} onIonReorderEnd={reorder}>
        {section.items.map((item) => (
          <OverviewEditRow
            key={item.id}
            item={item}
            canDelete={canDelete}
            onEdit={() => onEditItem(item.id)}
            onDelete={() => onDeleteItem(item.id)}
          />
        ))}
      </IonReorderGroup>
      <IonItem button detail={false} onClick={onAdd}>
        <IonIcon slot="start" color="primary" icon={addCircle} />
        <IonLabel color="primary">{COMMON_COPY.addExercise}</IonLabel>
      </IonItem>
    </>
  )
}

function ProgressItems({ section, offset, current, onSelect }: Props) {
  return section.items.map((item, itemIndex) => {
    const index = offset + itemIndex

    return (
      <IonItem
        key={item.id}
        button
        detail={false}
        className={index === current ? 'list-current' : undefined}
        onClick={() => onSelect(index)}
      >
        <IonLabel>{itemTitle(item)}</IonLabel>
        {isDone(item) && <IonIcon slot="end" color="success" icon={checkmarkCircle} aria-label={LIVE_COPY.completed} />}
        {isSkipped(item) && <IonNote slot="end">{COMMON_COPY.skipped}</IonNote>}
      </IonItem>
    )
  })
}

export function OverviewSection(props: Props) {
  return (
    <>
      <IonListHeader>
        <IonLabel>{props.section.name}</IonLabel>
      </IonListHeader>
      <IonList inset>{props.editing ? <EditableItems {...props} /> : <ProgressItems {...props} />}</IonList>
    </>
  )
}
