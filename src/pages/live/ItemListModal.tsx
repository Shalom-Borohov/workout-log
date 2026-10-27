import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonModal,
  IonNote,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import { checkmarkCircle } from 'ionicons/icons'
import { Fragment } from 'react'
import type { Workout } from '../../domain/types'
import { isDone, isSkipped, itemTitle } from '../../domain/workoutEdits'

interface ItemListModalProps {
  isOpen: boolean
  workout: Workout
  current: number
  onSelect: (index: number) => void
  onClose: () => void
}

export function ItemListModal({ isOpen, workout, current, onSelect, onClose }: ItemListModalProps) {
  const offsets = workout.sections.map((_, si) =>
    workout.sections.slice(0, si).reduce((count, s) => count + s.items.length, 0),
  )

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} initialBreakpoint={0.6} breakpoints={[0, 0.6, 1]}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>תרגילים</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}>סגירה</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {workout.sections.map((section, si) => (
          <Fragment key={si}>
            <IonListHeader>
              <IonLabel>{section.name}</IonLabel>
            </IonListHeader>
            <IonList inset>
              {section.items.map((item, ii) => {
                const index = offsets[si] + ii

                return (
                  <IonItem
                    key={item.id}
                    button
                    detail={false}
                    className={index === current ? 'list-current' : undefined}
                    onClick={() => onSelect(index)}
                  >
                    <IonLabel>{itemTitle(item)}</IonLabel>
                    {isDone(item) && <IonIcon slot="end" color="success" icon={checkmarkCircle} aria-label="הושלם" />}
                    {isSkipped(item) && <IonNote slot="end">דילגת</IonNote>}
                  </IonItem>
                )
              })}
            </IonList>
          </Fragment>
        ))}
      </IonContent>
    </IonModal>
  )
}
