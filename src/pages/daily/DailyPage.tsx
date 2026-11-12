import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonRouter,
} from '@ionic/react'
import { add } from 'ionicons/icons'
import { COMMON_COPY } from '../../copy/common'
import { useDailyLogs, useFinishedRecords, useRoutines } from '../../data/hooks'
import { addDailyRoutine } from '../../data/repo'
import { newRoutine } from '../../domain/routineEdit'
import { MINUTE_MS } from '../../domain/time'
import { useNow } from '../../hooks/useNow'
import { useSave } from '../../hooks/useSave'
import { DAILY_PATH, routinePath } from '../../navigation/paths'
import { DAILY_COPY } from './copy'
import { DailyBody } from './DailyBody'
import { RoutineTiles } from './RoutineTiles'
import './daily.css'

export function DailyPage() {
  const routines = useRoutines()
  const logs = useDailyLogs()
  const records = useFinishedRecords()
  const router = useIonRouter()
  const now = useNow(MINUTE_MS)
  const { save } = useSave()

  async function addDaily() {
    const id = crypto.randomUUID()

    if (await save(() => addDailyRoutine(newRoutine(id, crypto.randomUUID(), Date.now())))) {
      router.push(routinePath(DAILY_PATH, id))
    }
  }

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonTitle>{COMMON_COPY.daily}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => void addDaily()} aria-label={DAILY_COPY.addDaily}>
              <IonIcon slot="icon-only" icon={add} aria-hidden="true" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">{COMMON_COPY.daily}</IonTitle>
          </IonToolbar>
        </IonHeader>
        {routines && logs && records && <DailyBody routines={routines} logs={logs} records={records} now={now} />}
      </IonContent>
      {routines && logs && <RoutineTiles routines={routines} logs={logs} now={now} />}
    </IonPage>
  )
}
