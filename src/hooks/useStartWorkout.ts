import { useIonActionSheet, useIonRouter } from '@ionic/react'
import { activeWorkout, beginWorkout } from '../data/repo'
import type { Routine } from '../domain/types'

export function useStartWorkout() {
  const router = useIonRouter()
  const [presentSheet] = useIonActionSheet()

  return async (routine: Routine) => {
    const active = await activeWorkout()
    if (active && active.routineId !== routine.id) {
      presentSheet({
        header: 'יש אימון בתהליך',
        buttons: [
          { text: `המשך את ${active.routineName}`, handler: () => router.push(`/workout/${active.id}`) },
          { text: 'ביטול', role: 'cancel' },
        ],
      })

      return
    }
    const workout = await beginWorkout(routine)
    router.push(`/workout/${workout.id}`)
  }
}
