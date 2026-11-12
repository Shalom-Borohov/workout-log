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
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import { chevronForward } from 'ionicons/icons'
import { useState } from 'react'
import { BodyAreaIcon } from '../../components/bodyArea/BodyAreaIcon'
import { BodyAreaPicker } from '../../components/bodyArea/BodyAreaPicker'
import { HALF_SHEET } from '../../components/sheet'
import { BODY_AREA_COPY } from '../../copy/bodyAreas'
import { COMMON_COPY } from '../../copy/common'
import { setExerciseArea } from '../../data/exerciseAreas'
import { useExerciseAreas } from '../../data/hooks'
import { areaOf, type BodyArea } from '../../domain/bodyAreas'
import { useSave } from '../../hooks/useSave'

export function BodyAreaRow({ name }: { name: string }) {
  const areas = useExerciseAreas()
  const [isOpen, setIsOpen] = useState(false)
  const { save } = useSave()

  if (!areas) {
    return null
  }

  const area = areaOf(areas, name)

  function pick(picked: BodyArea | null) {
    void save(() => setExerciseArea(name, picked))
    setIsOpen(false)
  }

  return (
    <>
      <IonItem button detail={false} lines="none" className="field-row" onClick={() => setIsOpen(true)}>
        <IonLabel className="visually-hidden">{BODY_AREA_COPY.label}</IonLabel>
        <span className="field-row-value">
          <BodyAreaIcon area={area} />
          {BODY_AREA_COPY.name(area)}
          <IonIcon icon={chevronForward} flipRtl aria-hidden="true" />
        </span>
      </IonItem>
      <IonModal isOpen={isOpen} onDidDismiss={() => setIsOpen(false)} {...HALF_SHEET}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>{BODY_AREA_COPY.label}</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setIsOpen(false)}>{COMMON_COPY.close}</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonList inset>
            <IonItem>
              <BodyAreaPicker value={area} onChange={pick} />
            </IonItem>
          </IonList>
        </IonContent>
      </IonModal>
    </>
  )
}
