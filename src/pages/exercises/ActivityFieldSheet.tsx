import { IonContent, IonInput, IonItem, IonList, IonModal, IonTextarea } from '@ionic/react'
import { useState } from 'react'
import { FULL_SHEET, HALF_SHEET } from '../../components/sheet'
import { SheetHeader } from '../../components/SheetHeader'

interface FormProps {
  title: string
  value: string
  multiline: boolean
  onCancel: () => void
  onSave: (value: string) => void
}

function FieldForm({ title, value, multiline, onCancel, onSave }: FormProps) {
  const [draft, setDraft] = useState(value)

  function edit(next: string | null | undefined) {
    if (typeof next === 'string') {
      setDraft(next)
    }
  }

  return (
    <>
      <SheetHeader title={title} onCancel={onCancel} onSave={() => onSave(draft)} />
      <IonContent>
        <IonList inset>
          <IonItem>
            {multiline ? (
              <IonTextarea
                aria-label={title}
                autoGrow
                rows={4}
                value={draft}
                onIonInput={(event) => edit(event.detail.value)}
              />
            ) : (
              <IonInput aria-label={title} value={draft} onIonInput={(event) => edit(event.detail.value)} />
            )}
          </IonItem>
        </IonList>
      </IonContent>
    </>
  )
}

type SheetProps = FormProps & { isOpen: boolean }

export function ActivityFieldSheet({ isOpen, ...form }: SheetProps) {
  return (
    <IonModal isOpen={isOpen} onDidDismiss={form.onCancel} {...(form.multiline ? FULL_SHEET : HALF_SHEET)}>
      <FieldForm {...form} />
    </IonModal>
  )
}
