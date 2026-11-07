import { IonPage, useIonRouter } from '@ionic/react'
import { memo, useEffect } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { useWorkoutLookup } from '../../data/hooks'
import { ROUTINES_PATH, type WorkoutHostPath, workoutPath } from '../../navigation/paths'
import { LiveWorkout } from './LiveWorkout'

const SessionWorkout = memo(LiveWorkout, (previous, next) => previous.initial.id === next.initial.id)

function WorkoutLoader({ id, tab }: { id: string; tab: WorkoutHostPath }) {
  const lookup = useWorkoutLookup(id)
  const router = useIonRouter()
  const shown = useLocation().pathname === workoutPath(tab, id)
  const workout = lookup?.workout

  const noLiveWorkout = lookup !== undefined && workout?.kind !== 'routine'
  const finishedHere = tab === ROUTINES_PATH && workout?.kind === 'routine' && workout.finishedAt !== null
  const leftBehind = noLiveWorkout || finishedHere

  useEffect(() => {
    if (leftBehind && shown) {
      router.push(tab, 'root', 'replace')
    }
  }, [leftBehind, shown, router, tab])

  return !leftBehind && workout?.kind === 'routine' ? <SessionWorkout initial={workout} tab={tab} /> : null
}

export function LiveWorkoutPage({ tab }: { tab: WorkoutHostPath }) {
  const { id } = useParams()

  return <IonPage>{id && <WorkoutLoader id={id} tab={tab} />}</IonPage>
}
