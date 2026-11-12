import { IonButton, IonButtons, IonHeader, IonTitle, IonToolbar } from '@ionic/react'
import { COMMON_COPY } from '../copy/common'

interface SheetHeaderProps {
  title: string
  onCancel: () => void
  onSave: () => void
}

export function SheetHeader({ title, onCancel, onSave }: SheetHeaderProps) {
  return (
    <IonHeader>
      <IonToolbar>
        <IonButtons slot="start">
          <IonButton onClick={onCancel}>{COMMON_COPY.cancel}</IonButton>
        </IonButtons>
        <IonTitle>{title}</IonTitle>
        <IonButtons slot="end">
          <IonButton strong onClick={onSave}>
            {COMMON_COPY.save}
          </IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>
  )
}
