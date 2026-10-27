import { IonItem, IonLabel, IonList, IonListHeader, IonNote } from '@ionic/react'
import type { RoutineSection } from '../../domain/types'
import { ItemLabel } from './ItemLabel'

export function NotePreview({ sections }: { sections: RoutineSection[] }) {
  return sections.map((section) => (
    <section key={section.id}>
      <IonListHeader>
        <IonLabel>{section.name}</IonLabel>
      </IonListHeader>
      <IonList inset>
        <IonItem>
          <IonLabel>סטים</IonLabel>
          <IonNote slot="end" className="preview-sets">
            {section.sets}
          </IonNote>
        </IonItem>
        {section.items.map((item) => (
          <IonItem key={item.id}>
            <ItemLabel item={item} />
          </IonItem>
        ))}
      </IonList>
    </section>
  ))
}
