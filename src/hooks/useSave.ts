import { useIonToast } from '@ionic/react'
import { useRef } from 'react'
import { TOAST_OPTIONS } from '../components/toast'
import { COMMON_COPY } from '../copy/common'

export function useSave() {
  const [presentToast] = useIonToast()
  const messageShownAt = useRef(Number.NEGATIVE_INFINITY)

  function saveFailed() {
    if (Date.now() - messageShownAt.current >= TOAST_OPTIONS.duration) {
      messageShownAt.current = Date.now()
      void presentToast({ message: COMMON_COPY.saveFailed, ...TOAST_OPTIONS })
    }
  }

  async function save(write: () => Promise<unknown>): Promise<boolean> {
    try {
      await write()

      return true
    } catch {
      saveFailed()

      return false
    }
  }

  return { save, saveFailed }
}
