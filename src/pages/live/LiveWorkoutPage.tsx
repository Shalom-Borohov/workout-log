import { IonPage, useIonRouter } from '@ionic/react'
import { memo, useEffect } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { useWorkoutLookup } from '../../data/hooks'
import { type HostTabPath, ROUTINES_PATH, workoutPath } from '../../navigation/paths'
import { LiveWorkout } from './LiveWorkout'

const SessionWorkout = memo(LiveWorkout, (previous, next) => previous.initial.id === next.initial.id)

function WorkoutLoader({ id, tab }: { id: string; tab: HostTabPath }) {
  const lookup = useWorkoutLookup(id)
  const router = useIonRouter()
  const shown = useLocation().pathname === workoutPath(tab, id)
  const workout = lookup?.workout

  const leftBehind =
    tab === ROUTINES_PATH && lookup !== undefined && (workout === undefined || (workout.kind === 'routine' && workout.finishedAt !== null))

  useEffect(() => {
    if (leftBehind && shown) {
      router.push(ROUTINES_PATH, 'root', 'replace')
    }
  }, [leftBehind, shown, router])

  return !leftBehind && workout?.kind === 'routine' ? <SessionWorkout initial={workout} /> : null
}

export function LiveWorkoutPage({ tab }: { tab: HostTabPath }) {
  const { id } = useParams()

  return <IonPage>{id && <WorkoutLoader id={id} tab={tab} />}</IonPage>
}
