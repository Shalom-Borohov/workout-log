import { useIonAlert, useIonToast } from '@ionic/react'
import { TOAST_OPTIONS } from '../components/toast'
import { COMMON_COPY } from '../copy/common'
import { backUpStoredData } from './backUpStoredData'

export function useBackUp() {
  const [presentToast] = useIonToast()
  const [presentAlert] = useIonAlert()

  return async () => {
    const { failure, badRecords } = await backUpStoredData()

    if (failure) {
      void presentToast({ message: failure, ...TOAST_OPTIONS })
    }

    if (badRecords > 0) {
      void presentAlert({ message: COMMON_COPY.badRecordsInBackup(badRecords), buttons: [COMMON_COPY.ok] })
    }
  }
}
