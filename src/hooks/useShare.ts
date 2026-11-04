import { useIonToast } from '@ionic/react'
import { isShareCancel } from '../components/shareFile'
import { errorMessage, TOAST_OPTIONS } from '../components/toast'

export function useShare() {
  const [presentToast] = useIonToast()

  return async (run: () => Promise<void>) => {
    try {
      await run()
    } catch (error) {
      if (!isShareCancel(error)) {
        void presentToast({ message: errorMessage(error), ...TOAST_OPTIONS })
      }
    }
  }
}
