import { useIonRouter } from '@ionic/react'
import { addDailyRoutine, saveRoutine } from '../../data/repo'
import { duplicateRoutine } from '../../domain/routineEdit'
import type { Routine } from '../../domain/types'
import { type RoutineHostPath, routinePath } from '../../navigation/paths'

export function useDuplicateRoutine(tab: RoutineHostPath) {
  const router = useIonRouter()

  return async (routine: Routine) => {
    const copy = duplicateRoutine(routine, () => crypto.randomUUID(), Date.now())

    await (copy.daily ? addDailyRoutine({ ...copy, color: null }) : saveRoutine(copy))
    router.push(routinePath(tab, copy.id))
  }
}
