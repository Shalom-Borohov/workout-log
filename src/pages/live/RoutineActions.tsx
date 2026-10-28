import { IonItem, IonLabel, IonList, useIonAlert, useIonToast } from '@ionic/react'
import { TOAST_OPTIONS } from '../../components/toast'
import { COMMON_COPY } from '../../copy/common'
import { LIVE_COPY } from './copy'
import { useRoutine } from '../../data/hooks'
import { saveRoutine, updateRoutine } from '../../data/repo'
import { copyName, duplicateRoutine } from '../../domain/routineEdit'
import { routineFromWorkout } from '../../domain/routineFromWorkout'
import type { Workout } from '../../domain/types'

const newId = () => crypto.randomUUID()

export function RoutineActions({ workout }: { workout: Workout }) {
  const routine = useRoutine(workout.routineId)
  const [presentAlert] = useIonAlert()
  const [presentToast] = useIonToast()

  const toast = (message: string) => presentToast({ message, ...TOAST_OPTIONS })

  async function update() {
    await updateRoutine(workout.routineId, (current) => routineFromWorkout(workout, current, newId, Date.now()))
    void toast(LIVE_COPY.routineUpdated)
  }

  async function saveAsNew(name: string) {
    const now = Date.now()
    const copy = duplicateRoutine(routineFromWorkout(workout, routine, newId, now), newId, now)

    await saveRoutine({ ...copy, name })
    void toast(LIVE_COPY.savedNewRoutine)
  }

  function askName() {
    void presentAlert({
      header: COMMON_COPY.saveAsNewRoutine,
      inputs: [
        { name: 'name', value: copyName(workout.routineName), attributes: { 'aria-label': COMMON_COPY.routineName } },
      ],
      buttons: [
        { text: COMMON_COPY.cancel, role: 'cancel' },
        {
          text: COMMON_COPY.save,
          handler: (values: Record<string, string>) => {
            const name = values.name.trim()

            if (name === '') {
              return false
            }
            void saveAsNew(name)
          },
        },
      ],
    })
  }

  return (
    <IonList inset>
      {routine && (
        <IonItem button detail={false} onClick={() => void update()}>
          <IonLabel color="primary">{LIVE_COPY.updateRoutine(workout.routineName)}</IonLabel>
        </IonItem>
      )}
      <IonItem button detail={false} onClick={askName}>
        <IonLabel color="primary">{COMMON_COPY.saveAsNewRoutine}</IonLabel>
      </IonItem>
    </IonList>
  )
}
