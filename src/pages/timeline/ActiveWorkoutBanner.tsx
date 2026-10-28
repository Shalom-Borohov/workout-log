import { IonButton, IonIcon } from '@ionic/react'
import { chevronForward } from 'ionicons/icons'
import { ElapsedClock } from '../../components/ElapsedClock'
import { TIMELINE_COPY } from './copy'
import type { Workout } from '../../domain/types'
import { workoutPath } from '../../navigation/paths'

export function ActiveWorkoutBanner({ workout }: { workout: Workout }) {
  return (
    <IonButton
      expand="block"
      color="primary"
      className="start-workout active-workout"
      routerLink={workoutPath(workout.id)}
    >
      <span className="active-workout-text">
        <strong>{TIMELINE_COPY.activeWorkout}</strong>
        <span className="active-workout-routine">{workout.routineName}</span>
      </span>
      <ElapsedClock startedAt={workout.startedAt} className="active-workout-clock" />
      <IonIcon slot="end" icon={chevronForward} flipRtl aria-hidden="true" />
    </IonButton>
  )
}
