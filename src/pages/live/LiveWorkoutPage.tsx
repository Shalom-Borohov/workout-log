import { IonPage } from '@ionic/react'
import { memo } from 'react'
import { useParams } from 'react-router-dom'
import { useWorkout } from '../../data/hooks'
import { LiveWorkout } from './LiveWorkout'

const SessionWorkout = memo(LiveWorkout, (prev, next) => prev.initial.id === next.initial.id)

function WorkoutLoader({ id }: { id: string }) {
  const workout = useWorkout(id)

  return workout ? <SessionWorkout initial={workout} /> : null
}

export function LiveWorkoutPage() {
  const { id } = useParams()

  return <IonPage>{id && <WorkoutLoader id={id} />}</IonPage>
}
