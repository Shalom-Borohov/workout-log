import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonNote,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonAlert,
  useIonToast,
} from '@ionic/react'
import { documentTextOutline, downloadOutline, shareOutline } from 'ionicons/icons'
import { type ChangeEvent, useRef, useState } from 'react'
import { CHANGELOG } from '../../appUpdate/changelog'
import { WhatsNewSheet } from '../../appUpdate/WhatsNewSheet'
import { errorMessage, TOAST_OPTIONS } from '../../components/toast'
import { COMMON_COPY } from '../../copy/common'
import { SETTINGS_COPY } from './copy'
import { type Backup, restoreBackup } from '../../data/backup'
import { formatDateTime } from '../../domain/format'
import { newestFirst } from '../../domain/releases'
import { useBackUp } from '../../hooks/useBackUp'
import { useShare } from '../../hooks/useShare'
import type { HostTabPath } from '../../navigation/paths'
import { readBackup } from './backupFile'
import { BackgroundSettings } from './BackgroundSettings'
import { BackupFooter } from './BackupFooter'
import { FeedbackSettings } from './FeedbackSettings'
import { shareHistory } from './historyFile'

const ALL_RELEASES = newestFirst(CHANGELOG)

export function SettingsPage({ tab }: { tab: HostTabPath }) {
  const fileInput = useRef<HTMLInputElement>(null)
  const [showingChangelog, setShowingChangelog] = useState(false)
  const [presentAlert] = useIonAlert()
  const [presentToast] = useIonToast()
  const backUp = useBackUp()
  const share = useShare()

  const toast = (message: string) => presentToast({ message, ...TOAST_OPTIONS })

  async function restore(backup: Backup) {
    try {
      await restoreBackup(backup)
      void toast(SETTINGS_COPY.backupRestored)
    } catch (error) {
      void toast(errorMessage(error))
    }
  }

  async function importFile(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget
    const file = input.files?.[0]

    input.value = ''

    if (!file) {
      return
    }

    try {
      const backup = await readBackup(file)

      presentAlert({
        header: SETTINGS_COPY.importBackup,
        message: SETTINGS_COPY.importReplacesAllData,
        buttons: [
          { text: COMMON_COPY.cancel, role: 'cancel' },
          { text: SETTINGS_COPY.import, role: 'destructive', handler: () => void restore(backup) },
        ],
      })
    } catch (error) {
      void toast(errorMessage(error))
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={tab} text={COMMON_COPY.back} />
          </IonButtons>
          <IonTitle>{COMMON_COPY.settings}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonListHeader>
          <IonLabel>{COMMON_COPY.backup}</IonLabel>
        </IonListHeader>
        <IonList inset>
          <IonItem button detail={false} onClick={() => void backUp()}>
            <IonIcon slot="start" color="primary" icon={shareOutline} />
            <IonLabel>{COMMON_COPY.exportBackup}</IonLabel>
          </IonItem>
          <IonItem button detail={false} onClick={() => fileInput.current?.click()}>
            <IonIcon slot="start" color="primary" icon={downloadOutline} />
            <IonLabel>{SETTINGS_COPY.importBackup}</IonLabel>
          </IonItem>
        </IonList>
        <BackupFooter />
        <FeedbackSettings />
        <IonListHeader>
          <IonLabel>{SETTINGS_COPY.history}</IonLabel>
        </IonListHeader>
        <IonList inset>
          <IonItem button detail={false} onClick={() => void share(() => shareHistory(Date.now()))}>
            <IonIcon slot="start" color="primary" icon={documentTextOutline} />
            <IonLabel>{SETTINGS_COPY.exportHistory}</IonLabel>
          </IonItem>
        </IonList>
        <IonNote className="list-footer">{SETTINGS_COPY.historyFooter}</IonNote>
        <BackgroundSettings onError={(error) => void toast(errorMessage(error))} />
        <IonList inset>
          <IonItem button onClick={() => setShowingChangelog(true)}>
            <IonLabel>{SETTINGS_COPY.version(__APP_VERSION__, formatDateTime(Date.parse(__BUILD_TIME__)))}</IonLabel>
          </IonItem>
        </IonList>
        <WhatsNewSheet isOpen={showingChangelog} releases={ALL_RELEASES} onClose={() => setShowingChangelog(false)} />
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          hidden
          aria-label={SETTINGS_COPY.backupFile}
          onChange={importFile}
        />
      </IonContent>
    </IonPage>
  )
}
