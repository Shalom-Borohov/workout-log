import { IonButton, IonIcon, IonLabel } from '@ionic/react'
import { close } from 'ionicons/icons'
import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { APP_UPDATE_COPY } from './copy'
import { checkForUpdates } from './updateChecks'
import './appUpdate.css'

export function UpdateBar({ inWorkout }: { inWorkout: boolean }) {
  const [dismissed, setDismissed] = useState(false)

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      if (registration) {
        checkForUpdates(swUrl, registration, document)
      }
    },
  })

  useEffect(() => {
    function offerAgain() {
      if (document.visibilityState === 'visible') {
        setDismissed(false)
      }
    }

    document.addEventListener('visibilitychange', offerAgain)

    return () => document.removeEventListener('visibilitychange', offerAgain)
  }, [])

  if (!needRefresh || dismissed || inWorkout) {
    return null
  }

  return (
    <div slot="bottom" className="update-bar">
      <IonButton fill="clear" color="medium" aria-label={APP_UPDATE_COPY.dismissUpdate} onClick={() => setDismissed(true)}>
        <IonIcon slot="icon-only" icon={close} />
      </IonButton>
      <IonLabel>{APP_UPDATE_COPY.newVersionReady}</IonLabel>
      <IonButton fill="solid" size="small" shape="round" onClick={() => void updateServiceWorker()}>
        {APP_UPDATE_COPY.update}
      </IonButton>
    </div>
  )
}
