import { useIonAlert, useIonToast } from '@ionic/react'
import { backUpStoredData } from '../components/backupFile'
import { TOAST_OPTIONS } from '../components/toast'
import { COMMON_COPY } from '../copy/common'
import { useSave } from './useSave'

export function useBackUp() {
  const [presentToast] = useIonToast()
  const [presentAlert] = useIonAlert()
  const { saveFailed } = useSave()

  return async () => {
    const { failure, dateNotSaved, badRecords } = await backUpStoredData()

    if (failure) {
      void presentToast({ message: failure, ...TOAST_OPTIONS })
    }

    if (dateNotSaved) {
      saveFailed()
    }

    if (badRecords > 0) {
      void presentAlert({ message: COMMON_COPY.badRecordsInBackup(badRecords), buttons: [COMMON_COPY.ok] })
    }
  }
}
