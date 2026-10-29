import { IonButton, IonIcon, useIonActionSheet, useIonRouter } from '@ionic/react'
import { play } from 'ionicons/icons'
import { COMMON_COPY } from '../../copy/common'
import { TIMELINE_COPY } from './copy'
import { useRoutines } from '../../data/hooks'
import { hasExercises } from '../../domain/progress'
import { useStartWorkout } from '../../hooks/useStartWorkout'
import { IMPORT_PATH, TIMELINE_PATH } from '../../navigation/paths'

export function StartWorkoutButton() {
  const routines = useRoutines()
  const router = useIonRouter()
  const [presentSheet] = useIonActionSheet()
  const start = useStartWorkout(TIMELINE_PATH)

  if (!routines) {
    return null
  }
  const startable = routines.filter(hasExercises)

  function handleClick() {
    if (startable.length === 0) {
      router.push(IMPORT_PATH)

      return
    }
    if (startable.length === 1) {
      void start(startable[0])

      return
    }
    presentSheet({
      header: TIMELINE_COPY.whichRoutineQuestion,
      buttons: [
        ...startable.map((routine) => ({ text: routine.name, handler: () => void start(routine) })),
        { text: COMMON_COPY.cancel, role: 'cancel' },
      ],
    })
  }

  return (
    <IonButton expand="block" color="primary" className="start-workout" onClick={handleClick}>
      <IonIcon slot="start" icon={play} aria-hidden="true" />
      {TIMELINE_COPY.startWorkout}
    </IonButton>
  )
}
