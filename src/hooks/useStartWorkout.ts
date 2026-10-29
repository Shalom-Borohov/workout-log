import { useIonActionSheet, useIonRouter } from '@ionic/react'
import { APP_COPY } from '../copy/app'
import { COMMON_COPY } from '../copy/common'
import { activeWorkout, beginWorkout } from '../data/repo'
import type { Routine } from '../domain/types'
import { type HostTabPath, workoutPath } from '../navigation/paths'

export function useStartWorkout(tab: HostTabPath) {
  const router = useIonRouter()
  const [presentSheet] = useIonActionSheet()

  return async (routine: Routine) => {
    const active = await activeWorkout()
    if (active && active.routineId !== routine.id) {
      presentSheet({
        header: APP_COPY.workoutInProgress,
        buttons: [
          { text: APP_COPY.resumeWorkout(active.routineName), handler: () => router.push(workoutPath(tab, active.id)) },
          { text: COMMON_COPY.cancel, role: 'cancel' },
        ],
      })

      return
    }
    const workout = await beginWorkout(routine)
    router.push(workoutPath(tab, workout.id))
  }
}
