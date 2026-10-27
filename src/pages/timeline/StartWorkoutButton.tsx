import { IonButton, IonIcon, useIonActionSheet, useIonRouter } from '@ionic/react'
import { play } from 'ionicons/icons'
import { useRoutines } from '../../data/hooks'
import { hasExercises } from '../../domain/progress'
import { useStartWorkout } from '../../hooks/useStartWorkout'

export function StartWorkoutButton() {
  const routines = useRoutines()
  const router = useIonRouter()
  const [presentSheet] = useIonActionSheet()
  const start = useStartWorkout()

  if (!routines) {
    return null
  }
  const startable = routines.filter(hasExercises)

  function handleClick() {
    if (startable.length === 0) {
      router.push('/tabs/routines/import')

      return
    }
    if (startable.length === 1) {
      void start(startable[0])

      return
    }
    presentSheet({
      header: 'באיזה אימון?',
      buttons: [
        ...startable.map((r) => ({ text: r.name, handler: () => void start(r) })),
        { text: 'ביטול', role: 'cancel' },
      ],
    })
  }

  return (
    <IonButton expand="block" className="start-workout" onClick={handleClick}>
      <IonIcon slot="start" icon={play} aria-hidden="true" />
      התחל אימון
    </IonButton>
  )
}
