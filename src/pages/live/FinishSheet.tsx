import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonList,
  IonModal,
  IonTextarea,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import { useState } from 'react'
import { useConfirmDelete } from '../../hooks/useConfirmDelete'

interface FinishFormProps {
  initialSummary: string
  onCancel: () => void
  onSave: (summary: string) => void
  onDelete: () => void
}

function FinishForm({ initialSummary, onCancel, onSave, onDelete }: FinishFormProps) {
  const [summary, setSummary] = useState(initialSummary)
  const confirmDelete = useConfirmDelete()

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={onCancel}>ביטול</IonButton>
          </IonButtons>
          <IonTitle>סיכום האימון</IonTitle>
          <IonButtons slot="end">
            <IonButton strong onClick={() => onSave(summary.trim())}>
              שמירה
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList inset>
          <IonItem>
            <IonTextarea
              aria-label="סיכום האימון"
              placeholder="איך היה האימון?"
              autoGrow
              rows={3}
              value={summary}
              onIonInput={(e) => typeof e.detail.value === 'string' && setSummary(e.detail.value)}
            />
          </IonItem>
        </IonList>
        <IonList inset>
          <IonItem
            button
            detail={false}
            onClick={() =>
              confirmDelete({ header: 'למחוק את האימון?', message: 'האימון וכל הסטים שלו יימחקו.', onConfirm: onDelete })
            }
          >
            <span className="finish-delete">מחיקת האימון</span>
          </IonItem>
        </IonList>
      </IonContent>
    </>
  )
}

interface FinishSheetProps extends FinishFormProps {
  isOpen: boolean
}

export function FinishSheet({ isOpen, ...form }: FinishSheetProps) {
  return (
    <IonModal isOpen={isOpen} onDidDismiss={form.onCancel} initialBreakpoint={0.6} breakpoints={[0, 0.6, 1]}>
      <FinishForm {...form} />
    </IonModal>
  )
}
