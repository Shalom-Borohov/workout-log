import {
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonReorderGroup,
  type ReorderEndCustomEvent,
} from '@ionic/react'
import { addCircle } from 'ionicons/icons'
import { COMMON_COPY } from '../../copy/common'
import { ROUTINES_COPY } from './copy'
import type { RoutineSection } from '../../domain/types'
import { type Change, moveItem } from '../../domain/routineEdit'
import { itemTitle } from '../../domain/workoutEdits'
import { ItemLabel } from './ItemLabel'
import { EditableItemRow } from '../../components/itemEditor/EditableItemRow'

interface Props {
  section: RoutineSection
  onChange: (change: Change<RoutineSection>) => void
  onEditItem: (id: string) => void
  onDeleteItem: (id: string) => void
  onAddItem: () => void
  onDelete: () => void
}

export function SectionEditor({ section, onChange, onEditItem, onDeleteItem, onAddItem, onDelete }: Props) {
  function reorder(event: ReorderEndCustomEvent) {
    const { from, to } = event.detail

    event.detail.complete()
    onChange((current) => ({ ...current, items: moveItem(current.items, from, to) }))
  }

  function rename(name: string) {
    onChange((current) => ({ ...current, name }))
  }

  return (
    <section>
      <IonListHeader className="section-header">
        <IonInput
          aria-label={ROUTINES_COPY.sectionName}
          placeholder={ROUTINES_COPY.sectionName}
          className="section-name"
          value={section.name}
          onIonChange={(event) => typeof event.detail.value === 'string' && rename(event.detail.value)}
        />
      </IonListHeader>
      <IonList inset className="section-group">
        <IonReorderGroup disabled={false} onIonReorderEnd={reorder}>
          {section.items.map((item) => (
            <EditableItemRow
              key={item.id}
              title={itemTitle(item)}
              canDelete
              onEdit={() => onEditItem(item.id)}
              onDelete={() => onDeleteItem(item.id)}
            >
              <ItemLabel item={item} sectionSets={section.sets} />
            </EditableItemRow>
          ))}
        </IonReorderGroup>
        <IonItem button detail={false} onClick={onAddItem}>
          <IonIcon slot="start" color="primary" icon={addCircle} aria-hidden="true" />
          <IonLabel color="primary">{COMMON_COPY.addExercise}</IonLabel>
        </IonItem>
      </IonList>
      <IonList inset>
        <IonItem button detail={false} onClick={onDelete}>
          <IonLabel color="danger">{COMMON_COPY.deleteSection}</IonLabel>
        </IonItem>
      </IonList>
    </section>
  )
}
