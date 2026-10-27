import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonActionSheet,
  useIonRouter,
} from '@ionic/react'
import { add, settingsOutline } from 'ionicons/icons'
import { useRoutines } from '../../data/hooks'
import { saveRoutine } from '../../data/repo'
import { newRoutine } from '../../domain/routineEdit'
import { EmptyRoutines } from './EmptyRoutines'
import { RoutineRow } from './RoutineRow'
import './routines.css'

export function RoutinesPage() {
  const routines = useRoutines()
  const router = useIonRouter()
  const [presentActionSheet] = useIonActionSheet()

  async function createEmpty() {
    const id = crypto.randomUUID()

    await saveRoutine(newRoutine(id, crypto.randomUUID(), Date.now()))
    router.push(`/tabs/routines/${id}`)
  }

  const openImport = () => router.push('/tabs/routines/import')

  function openAddMenu() {
    presentActionSheet({
      header: 'אימון חדש',
      buttons: [
        { text: 'הדבקת פתק', handler: openImport },
        { text: 'אימון ריק', handler: () => void createEmpty() },
        { text: 'ביטול', role: 'cancel' },
      ],
    })
  }

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonTitle>אימונים</IonTitle>
          <IonButtons slot="end">
            <IonButton routerLink="/tabs/routines/settings" aria-label="הגדרות">
              <IonIcon slot="icon-only" icon={settingsOutline} />
            </IonButton>
            <IonButton onClick={openAddMenu} aria-label="הוספת אימון">
              <IonIcon slot="icon-only" icon={add} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">אימונים</IonTitle>
          </IonToolbar>
        </IonHeader>
        {routines?.length === 0 && <EmptyRoutines onPaste={openImport} onEmpty={() => void createEmpty()} />}
        {routines !== undefined && routines.length > 0 && (
          <IonList inset>
            {routines.map((routine) => (
              <RoutineRow key={routine.id} routine={routine} />
            ))}
          </IonList>
        )}
      </IonContent>
    </IonPage>
  )
}
