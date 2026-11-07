import { useIonToast } from '@ionic/react'
import { shareFailure } from '../components/shareFile'
import { TOAST_OPTIONS } from '../components/toast'

export function useShare() {
  const [presentToast] = useIonToast()

  return async (run: () => Promise<void>) => {
    try {
      await run()
    } catch (error) {
      const message = shareFailure(error)

      if (message) {
        void presentToast({ message, ...TOAST_OPTIONS })
      }
    }
  }
}
