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
import { type ChangeEvent, useRef } from 'react'
import { TOAST_OPTIONS } from '../../components/toast'
import { COMMON_COPY } from '../../copy/common'
import { SETTINGS_COPY } from './copy'
import { type Backup, exportBackup, restoreBackup } from '../../data/backup'
import { formatDateTime } from '../../domain/format'
import { ROUTINES_PATH } from '../../navigation/paths'
import { isShareCancel, readBackup, shareBackup } from './backupFile'
import { BackgroundSettings } from './BackgroundSettings'
import { FeedbackSettings } from './FeedbackSettings'
import { shareHistory } from './historyFile'

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : SETTINGS_COPY.actionFailed)

export function SettingsPage() {
  const fileInput = useRef<HTMLInputElement>(null)
  const [presentAlert] = useIonAlert()
  const [presentToast] = useIonToast()

  const toast = (message: string) => presentToast({ message, ...TOAST_OPTIONS })

  async function share(run: () => Promise<void>) {
    try {
      await run()
    } catch (error) {
      if (!isShareCancel(error)) {
        void toast(errorMessage(error))
      }
    }
  }

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
            <IonBackButton defaultHref={ROUTINES_PATH} text={COMMON_COPY.back} />
          </IonButtons>
          <IonTitle>{COMMON_COPY.settings}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonListHeader>
          <IonLabel>{SETTINGS_COPY.backup}</IonLabel>
        </IonListHeader>
        <IonList inset>
          <IonItem
            button
            detail={false}
            onClick={() => void share(async () => shareBackup(await exportBackup(Date.now())))}
          >
            <IonIcon slot="start" color="primary" icon={shareOutline} />
            <IonLabel>{SETTINGS_COPY.exportBackup}</IonLabel>
          </IonItem>
          <IonItem button detail={false} onClick={() => fileInput.current?.click()}>
            <IonIcon slot="start" color="primary" icon={downloadOutline} />
            <IonLabel>{SETTINGS_COPY.importBackup}</IonLabel>
          </IonItem>
        </IonList>
        <IonNote className="list-footer">{SETTINGS_COPY.backupFooter}</IonNote>
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
        <FeedbackSettings />
        <IonNote className="list-footer">{SETTINGS_COPY.version(formatDateTime(Date.parse(__BUILD_TIME__)))}</IonNote>
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
