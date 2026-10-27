import { IonButton, IonIcon } from '@ionic/react'
import { chevronForward } from 'ionicons/icons'
import { ElapsedClock } from '../../components/ElapsedClock'
import type { Workout } from '../../domain/types'

export function ActiveWorkoutBanner({ workout }: { workout: Workout }) {
  return (
    <IonButton expand="block" className="start-workout active-workout" routerLink={`/workout/${workout.id}`}>
      <span className="active-workout-text">
        <strong>אימון בתהליך</strong>
        <span className="active-workout-routine">{workout.routineName}</span>
      </span>
      <ElapsedClock startedAt={workout.startedAt} className="active-workout-clock" />
      <IonIcon slot="end" icon={chevronForward} flipRtl aria-hidden="true" />
    </IonButton>
  )
}
