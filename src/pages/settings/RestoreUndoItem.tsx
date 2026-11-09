import { IonIcon, IonItem, IonLabel, useIonToast } from '@ionic/react'
import { arrowRedoOutline, arrowUndoOutline } from 'ionicons/icons'
import { useRef } from 'react'
import { TOAST_OPTIONS } from '../../components/toast'
import { useRestoreUndo } from '../../data/hooks'
import { swapRestore } from '../../data/restore'
import { dayMonth } from '../../domain/format'
import { MINUTE_MS } from '../../domain/time'
import { useNow } from '../../hooks/useNow'
import { useSave } from '../../hooks/useSave'
import { SETTINGS_COPY } from './copy'

export function RestoreUndoItem() {
  const undo = useRestoreUndo(useNow(MINUTE_MS))
  const [presentToast, dismissToast] = useIonToast()
  const { save } = useSave()
  const swapping = useRef(false)

  if (!undo) {
    return null
  }

  const { undone, until } = undo

  async function swap() {
    if (swapping.current) {
      return
    }

    swapping.current = true
    const swapped = await save(() => swapRestore())
    swapping.current = false

    if (swapped) {
      await dismissToast()
      void presentToast({ message: undone ? SETTINGS_COPY.restoreRedone : SETTINGS_COPY.restoreUndone, ...TOAST_OPTIONS })
    }
  }

  return (
    <IonItem button detail={false} onClick={() => void swap()}>
      <IonIcon slot="start" color="primary" icon={undone ? arrowRedoOutline : arrowUndoOutline} flipRtl aria-hidden="true" />
      <IonLabel>
        {undone ? SETTINGS_COPY.redoRestore : SETTINGS_COPY.undoRestore}
        <p>{SETTINGS_COPY.undoUntil(dayMonth(until))}</p>
      </IonLabel>
    </IonItem>
  )
}
