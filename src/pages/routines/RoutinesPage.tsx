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
import { add } from 'ionicons/icons'
import { SettingsButton } from '../../components/SettingsButton'
import { COMMON_COPY } from '../../copy/common'
import { ROUTINES_COPY } from './copy'
import { useRoutines } from '../../data/hooks'
import { saveRoutine } from '../../data/repo'
import { newRoutine } from '../../domain/routineEdit'
import { HOUR_MS } from '../../domain/time'
import { useNow } from '../../hooks/useNow'
import { useSave } from '../../hooks/useSave'
import { IMPORT_PATH, ROUTINES_PATH, routinePath } from '../../navigation/paths'
import { EmptyRoutines } from './EmptyRoutines'
import { RoutineRow } from './RoutineRow'
import './routineList.css'

export function RoutinesPage() {
  const routines = useRoutines()?.filter((routine) => !routine.daily)
  const now = useNow(HOUR_MS)
  const router = useIonRouter()
  const [presentActionSheet] = useIonActionSheet()
  const { save } = useSave()

  async function createEmpty() {
    const id = crypto.randomUUID()

    if (await save(() => saveRoutine(newRoutine(id, crypto.randomUUID(), Date.now())))) {
      router.push(routinePath(ROUTINES_PATH, id))
    }
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
            <SettingsButton tab={ROUTINES_PATH} />
            <IonButton onClick={openAddMenu} aria-label={ROUTINES_COPY.addRoutine}>
              <IonIcon slot="icon-only" icon={add} aria-hidden="true" />
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
          <IonList className="list-plain routine-list">
            {routines.map((routine) => (
              <RoutineRow key={routine.id} routine={routine} now={now} />
            ))}
          </IonList>
        )}
      </IonContent>
    </IonPage>
  )
}
