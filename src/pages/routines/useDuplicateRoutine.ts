import { useIonRouter } from '@ionic/react'
import { addDailyRoutine, saveRoutine } from '../../data/repo'
import { duplicateRoutine } from '../../domain/routineEdit'
import type { Routine } from '../../domain/types'
import { useSave } from '../../hooks/useSave'
import { type RoutineHostPath, routinePath } from '../../navigation/paths'

export function useDuplicateRoutine(tab: RoutineHostPath) {
  const router = useIonRouter()
  const { save } = useSave()

  return async (routine: Routine) => {
    const copy = duplicateRoutine(routine, () => crypto.randomUUID(), Date.now())

    if (await save(() => (copy.daily ? addDailyRoutine({ ...copy, color: null }) : saveRoutine(copy)))) {
      router.push(routinePath(tab, copy.id))
    }
  }
}
