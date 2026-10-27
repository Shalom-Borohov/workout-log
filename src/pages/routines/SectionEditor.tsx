import {
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonReorder,
  IonReorderGroup,
  type ReorderEndCustomEvent,
} from '@ionic/react'
import { addCircle } from 'ionicons/icons'
import type { RoutineSection } from '../../domain/types'
import { type Change, MAX_SETS, MIN_SETS, moveItem } from '../../domain/routineEdit'
import { ItemLabel } from './ItemLabel'
import { Stepper } from './Stepper'

interface Props {
  section: RoutineSection
  onChange: (change: Change<RoutineSection>) => void
  onEditItem: (id: string) => void
  onAddItem: () => void
  onDelete: () => void
}

export function SectionEditor({ section, onChange, onEditItem, onAddItem, onDelete }: Props) {
  function reorder(event: ReorderEndCustomEvent) {
    const { from, to } = event.detail

    event.detail.complete()
    onChange((s) => ({ ...s, items: moveItem(s.items, from, to) }))
  }

  function rename(name: string) {
    onChange((s) => ({ ...s, name }))
  }

  function setSets(sets: number) {
    onChange((s) => ({ ...s, sets }))
  }

  return (
    <section>
      <IonListHeader className="section-header">
        <IonInput
          aria-label="שם החלק"
          placeholder="שם החלק"
          className="section-name"
          value={section.name}
          onIonChange={(e) => typeof e.detail.value === 'string' && rename(e.detail.value)}
        />
      </IonListHeader>
      <IonList inset className="section-group">
        <IonItem>
          <IonLabel>סטים</IonLabel>
          <Stepper
            value={section.sets}
            min={MIN_SETS}
            max={MAX_SETS}
            decreaseLabel="הורדת סט"
            increaseLabel="הוספת סט"
            onChange={setSets}
          />
        </IonItem>
        <IonReorderGroup disabled={false} onIonReorderEnd={reorder}>
          {section.items.map((item) => (
            <IonItem key={item.id} button detail={false} onClick={() => onEditItem(item.id)}>
              <ItemLabel item={item} />
              <IonReorder slot="end" />
            </IonItem>
          ))}
        </IonReorderGroup>
        <IonItem button detail={false} onClick={onAddItem}>
          <IonIcon slot="start" color="primary" icon={addCircle} />
          <IonLabel color="primary">הוספת תרגיל</IonLabel>
        </IonItem>
      </IonList>
      <IonList inset>
        <IonItem button detail={false} onClick={onDelete}>
          <IonLabel color="danger">מחיקת החלק</IonLabel>
        </IonItem>
      </IonList>
    </section>
  )
}
