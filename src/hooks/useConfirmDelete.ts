import { useIonAlert } from '@ionic/react'
import { COMMON_COPY } from '../copy/common'

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
        { text: COMMON_COPY.cancel, role: 'cancel', handler: onCancel },
        { text: COMMON_COPY.delete, role: 'destructive', handler: onConfirm },
      ],
    })
}
