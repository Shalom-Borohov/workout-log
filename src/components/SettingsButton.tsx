import { IonButton, IonIcon } from '@ionic/react'
import { settingsOutline } from 'ionicons/icons'
import { COMMON_COPY } from '../copy/common'
import { settingsPath, type HostTabPath } from '../navigation/paths'

export function SettingsButton({ tab }: { tab: HostTabPath }) {
  return (
    <IonButton routerLink={settingsPath(tab)} aria-label={COMMON_COPY.settings}>
      <IonIcon slot="icon-only" icon={settingsOutline} />
    </IonButton>
  )
}
