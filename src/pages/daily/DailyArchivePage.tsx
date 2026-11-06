import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonRouter,
  useIonViewWillEnter,
} from '@ionic/react'
import { COMMON_COPY } from '../../copy/common'
import { useRoutines } from '../../data/hooks'
import { updateRoutine } from '../../data/repo'
import { drillsLine } from '../../domain/daily'
import { useSave } from '../../hooks/useSave'
import { DAILY_PATH, routinePath } from '../../navigation/paths'
import { DAILY_COPY } from './copy'
import { DrillName } from './DrillName'
import './daily.css'

export function DailyArchivePage() {
  const archived = useRoutines()?.filter((routine) => routine.daily && routine.archived)
  const router = useIonRouter()
  const { save } = useSave()

  useIonViewWillEnter(() => {
    if (archived?.length === 0) {
      router.push(DAILY_PATH, 'back', 'pop')
    }
  }, [archived?.length])

  async function restore(id: string, last: boolean) {
    const restored = await save(() => updateRoutine(id, (current) => ({ ...current, archived: false })))

    if (restored && last) {
      router.push(DAILY_PATH, 'back', 'pop')
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={DAILY_PATH} text={COMMON_COPY.back} />
          </IonButtons>
          <IonTitle>{DAILY_COPY.archived}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {archived && archived.length > 0 && (
          <IonList inset>
            {archived.map((routine) => {
              const onRestore = () => void restore(routine.id, archived.length === 1)

              return (
                <IonItemSliding key={routine.id}>
                  <IonItem button detail routerLink={routinePath(DAILY_PATH, routine.id)}>
                    <IonLabel>
                      <DrillName routine={routine} />
                      <p>{drillsLine(routine)}</p>
                    </IonLabel>
                  </IonItem>
                  <IonItemOptions side="end" onIonSwipe={onRestore}>
                    <IonItemOption color="medium" expandable onClick={onRestore}>
                      {DAILY_COPY.restore}
                    </IonItemOption>
                  </IonItemOptions>
                </IonItemSliding>
              )
            })}
          </IonList>
        )}
      </IonContent>
    </IonPage>
  )
}
