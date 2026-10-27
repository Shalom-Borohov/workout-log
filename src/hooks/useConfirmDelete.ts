import { useIonAlert } from '@ionic/react'

interface ConfirmDelete {
  header: string
  message: string
  onConfirm: () => void
  onCancel?: () => void
}

export function useConfirmDelete() {
  const [presentAlert] = useIonAlert()

  return ({ header, message, onConfirm, onCancel }: ConfirmDelete) =>
    void presentAlert({
      header,
      message,
      buttons: [
        { text: 'ביטול', role: 'cancel', handler: onCancel },
        { text: 'מחיקה', role: 'destructive', handler: onConfirm },
      ],
    })
}
