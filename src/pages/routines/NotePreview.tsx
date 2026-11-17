import { IonItem, IonLabel, IonList, IonListHeader } from '@ionic/react'
import type { RoutineSection } from '../../domain/types'
import { ItemLabel } from './ItemLabel'

export function NotePreview({ sections }: { sections: RoutineSection[] }) {
  return sections.map((section) => (
    <section key={section.id}>
      <IonListHeader>
        <IonLabel>{section.name}</IonLabel>
      </IonListHeader>
      <IonList inset>
        {section.items.map((item) => (
          <IonItem key={item.id}>
            <ItemLabel item={item} sectionSets={section.sets} />
          </IonItem>
        ))}
      </IonList>
    </section>
  ))
}
