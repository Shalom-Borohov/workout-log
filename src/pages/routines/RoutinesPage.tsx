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
import { COMMON_COPY } from '../../copy/common'
import { ROUTINES_COPY } from './copy'
import { useRoutines } from '../../data/hooks'
import { saveRoutine } from '../../data/repo'
import { newRoutine } from '../../domain/routineEdit'
import { IMPORT_PATH, routinePath, SETTINGS_PATH } from '../../navigation/paths'
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
    router.push(routinePath(id))
  }

  const openImport = () => router.push(IMPORT_PATH)

  function openAddMenu() {
    presentActionSheet({
      header: COMMON_COPY.newRoutine,
      buttons: [
        { text: COMMON_COPY.pasteNote, handler: openImport },
        { text: COMMON_COPY.emptyRoutine, handler: () => void createEmpty() },
        { text: COMMON_COPY.cancel, role: 'cancel' },
      ],
    })
  }

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonTitle>{COMMON_COPY.routines}</IonTitle>
          <IonButtons slot="end">
            <IonButton routerLink={SETTINGS_PATH} aria-label={COMMON_COPY.settings}>
              <IonIcon slot="icon-only" icon={settingsOutline} />
            </IonButton>
            <IonButton onClick={openAddMenu} aria-label={ROUTINES_COPY.addRoutine}>
              <IonIcon slot="icon-only" icon={add} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">{COMMON_COPY.routines}</IonTitle>
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
