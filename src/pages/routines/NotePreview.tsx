import { IonItem, IonLabel, IonList, IonListHeader, IonNote } from '@ionic/react'
import { COMMON_COPY } from '../../copy/common'
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
          <IonLabel>{COMMON_COPY.sets}</IonLabel>
          <IonNote slot="end" className="preview-sets">
            {section.sets}
          </IonNote>
        </IonItem>
        {section.items.map((item) => (
          <IonItem key={item.id}>
            <ItemLabel item={item} sectionSets={section.sets} />
          </IonItem>
        ))}
      </IonList>
    </section>
  ))
}
