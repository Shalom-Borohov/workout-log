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
import { HALF_SHEET } from '../../components/sheet'
import { COMMON_COPY } from '../../copy/common'
import { LIVE_COPY } from './copy'
import { useConfirmDelete } from '../../hooks/useConfirmDelete'

export type SheetMode = 'finish' | 'summary'

type FinishFormProps = {
  mode: SheetMode
  initialSummary: string
  onCancel: () => void
  onSave: (summary: string) => void
  onDelete: () => void
}

function DeleteRow({ onDelete }: { onDelete: () => void }) {
  const confirmDelete = useConfirmDelete()

  return (
    <IonList inset>
      <IonItem
        button
        detail={false}
        onClick={() =>
          confirmDelete({
            header: COMMON_COPY.deleteWorkoutQuestion,
            message: LIVE_COPY.deleteWorkoutMessage,
            onConfirm: onDelete,
          })
        }
      >
        <span className="finish-delete">{COMMON_COPY.deleteWorkout}</span>
      </IonItem>
    </IonList>
  )
}

function FinishForm({ mode, initialSummary, onCancel, onSave, onDelete }: FinishFormProps) {
  const [summary, setSummary] = useState(initialSummary)

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={onCancel}>{COMMON_COPY.cancel}</IonButton>
          </IonButtons>
          <IonTitle>{mode === 'finish' ? COMMON_COPY.workoutSummary : COMMON_COPY.summary}</IonTitle>
          <IonButtons slot="end">
            <IonButton strong onClick={() => onSave(summary.trim())}>
              {COMMON_COPY.save}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList inset>
          <IonItem>
            <IonTextarea
              aria-label={COMMON_COPY.workoutSummary}
              placeholder={LIVE_COPY.summaryPlaceholder}
              autoGrow
              rows={3}
              value={summary}
              onIonInput={(event) => typeof event.detail.value === 'string' && setSummary(event.detail.value)}
            />
          </IonItem>
        </IonList>
        {mode === 'finish' && <DeleteRow onDelete={onDelete} />}
      </IonContent>
    </>
  )
}

type FinishSheetProps = Omit<FinishFormProps, 'mode'> & { mode: SheetMode | null }

export function FinishSheet({ mode, ...form }: FinishSheetProps) {
  const [shown, setShown] = useState<SheetMode>('finish')

  if (mode !== null && mode !== shown) {
    setShown(mode)
  }

  return (
    <IonModal isOpen={mode !== null} onDidDismiss={form.onCancel} {...HALF_SHEET}>
      <FinishForm mode={shown} {...form} />
    </IonModal>
  )
}
