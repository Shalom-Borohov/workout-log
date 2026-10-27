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
import { downloadOutline, shareOutline } from 'ionicons/icons'
import { type ChangeEvent, useRef } from 'react'
import { type Backup, exportBackup, restoreBackup } from '../../data/backup'
import { isShareCancel, readBackup, shareBackup } from './backupFile'
import './routines.css'

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : 'הפעולה נכשלה')

export function SettingsPage() {
  const fileInput = useRef<HTMLInputElement>(null)
  const [presentAlert] = useIonAlert()
  const [presentToast] = useIonToast()

  const toast = (message: string) => presentToast({ message, duration: 2500, position: 'top' })

  async function exportData() {
    try {
      await shareBackup(await exportBackup(Date.now()))
    } catch (error) {
      if (!isShareCancel(error)) {
        void toast(errorMessage(error))
      }
    }
  }

  async function restore(backup: Backup) {
    try {
      await restoreBackup(backup)
      void toast('הגיבוי שוחזר')
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
        header: 'ייבוא גיבוי',
        message: 'הייבוא יחליף את כל הנתונים',
        buttons: [
          { text: 'ביטול', role: 'cancel' },
          { text: 'ייבוא', role: 'destructive', handler: () => void restore(backup) },
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
            <IonBackButton defaultHref="/tabs/routines" text="חזרה" />
          </IonButtons>
          <IonTitle>הגדרות</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonListHeader>
          <IonLabel>גיבוי</IonLabel>
        </IonListHeader>
        <IonList inset>
          <IonItem button detail={false} onClick={exportData}>
            <IonIcon slot="start" color="primary" icon={shareOutline} />
            <IonLabel>ייצוא גיבוי</IonLabel>
          </IonItem>
          <IonItem button detail={false} onClick={() => fileInput.current?.click()}>
            <IonIcon slot="start" color="primary" icon={downloadOutline} />
            <IonLabel>ייבוא גיבוי</IonLabel>
          </IonItem>
        </IonList>
        <IonNote className="list-footer">
          הנתונים נשמרים רק במכשיר הזה. הייצוא יוצר קובץ עם כל האימונים וההיסטוריה, שאפשר לשמור בקבצים ולשחזר ממנו
          בייבוא.
        </IonNote>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          hidden
          aria-label="קובץ גיבוי"
          onChange={importFile}
        />
      </IonContent>
    </IonPage>
  )
}
