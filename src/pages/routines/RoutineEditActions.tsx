import { IonItem, IonLabel, IonList, useIonRouter } from '@ionic/react'
import { COMMON_COPY } from '../../copy/common'
import { ROUTINES_COPY } from './copy'
import { deleteRoutine, updateRoutine } from '../../data/repo'
import type { Routine } from '../../domain/types'
import { useConfirmDelete } from '../../hooks/useConfirmDelete'
import { useSave } from '../../hooks/useSave'
import type { RoutineHostPath } from '../../navigation/paths'
import { useDuplicateRoutine } from './useDuplicateRoutine'

export function RoutineEditActions({ routine, tab }: { routine: Routine; tab: RoutineHostPath }) {
  const router = useIonRouter()
  const confirmDelete = useConfirmDelete()
  const duplicate = useDuplicateRoutine(tab)
  const { save } = useSave()

  function toggleArchived() {
    void save(() => updateRoutine(routine.id, (current) => ({ ...current, archived: !current.archived })))
  }

  async function removeRoutine() {
    if (await save(() => deleteRoutine(routine.id))) {
      router.push(tab, 'back', 'pop')
    }
  }

  return (
    <>
      <IonList inset>
        <IonItem button detail={false} onClick={() => void duplicate(routine)}>
          <IonLabel color="primary">{ROUTINES_COPY.duplicateRoutine}</IonLabel>
        </IonItem>
        {routine.daily && (
          <IonItem button detail={false} onClick={toggleArchived}>
            <IonLabel color="primary">
              {routine.archived ? ROUTINES_COPY.unarchiveRoutine : ROUTINES_COPY.archiveRoutine}
            </IonLabel>
          </IonItem>
        )}
      </IonList>
      <IonList inset>
        <IonItem
          button
          detail={false}
          onClick={() =>
            confirmDelete({
              header: COMMON_COPY.deleteWorkoutQuestion,
              message: routine.name,
              onConfirm: () => void removeRoutine(),
            })
          }
        >
          <IonLabel color="danger">{COMMON_COPY.deleteWorkout}</IonLabel>
        </IonItem>
      </IonList>
    </>
  )
}
