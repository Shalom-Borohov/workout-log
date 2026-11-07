import { useIonToast } from '@ionic/react'
import { useReducer } from 'react'
import { TOAST_OPTIONS } from '../components/toast'
import { COMMON_COPY } from '../copy/common'
import { recordLastError } from '../data/lastError'

let messageShownAt = 0

export function useSave() {
  const [presentToast] = useIonToast()
  const [, redrawFieldsFromStoredProps] = useReducer((failures: number) => failures + 1, 0)

  function saveFailed() {
    redrawFieldsFromStoredProps()

    if (Date.now() - messageShownAt >= TOAST_OPTIONS.duration) {
      messageShownAt = Date.now()
      void presentToast({ message: COMMON_COPY.saveFailed, ...TOAST_OPTIONS })
    }
  }

  async function save(write: () => Promise<unknown>): Promise<boolean> {
    try {
      await write()

      return true
    } catch (error) {
      recordLastError(error)
      saveFailed()

      return false
    }
  }

  return { save, saveFailed }
}
