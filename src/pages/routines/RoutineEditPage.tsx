import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonRouter,
} from '@ionic/react'
import { addCircle } from 'ionicons/icons'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { COMMON_COPY } from '../../copy/common'
import { ROUTINES_COPY } from './copy'
import { useRoutine } from '../../data/hooks'
import { deleteRoutine, updateRoutine } from '../../data/repo'
import {
  type Change,
  findItem,
  newItem,
  newSection,
  removeItem,
  removeSection,
  updateItem,
  updateSection,
} from '../../domain/routineEdit'
import type { Routine, RoutineExercise } from '../../domain/types'
import { useConfirmDelete } from '../../hooks/useConfirmDelete'
import { ROUTINES_PATH } from '../../navigation/paths'
import { ExercisePicker } from '../../components/itemEditor/ExercisePicker'
import { ItemEditModal } from '../../components/itemEditor/ItemEditModal'
import { SectionEditor } from './SectionEditor'
import './routines.css'

function RoutineEditor({ routine }: { routine: Routine }) {
  const router = useIonRouter()
  const confirmDelete = useConfirmDelete()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [addingTo, setAddingTo] = useState<string | null>(null)
  const editing = editingId === null ? undefined : findItem(routine, editingId)

  const edit = (change: Change<Routine>) => void updateRoutine(routine.id, change)

  function pick(exercise?: RoutineExercise) {
    const id = crypto.randomUUID()
    const item = exercise ? newItem(id, [exercise]) : newItem(id)

    if (addingTo !== null) {
      edit((current) => updateSection(current, addingTo, (section) => ({ ...section, items: [...section.items, item] })))

      if (!exercise) {
        setEditingId(id)
      }
    }
    setAddingTo(null)
  }

  function addSection() {
    const section = newSection(crypto.randomUUID(), ROUTINES_COPY.newSection)

    edit((current) => ({ ...current, sections: [...current.sections, section] }))
  }

  async function removeRoutine() {
    await deleteRoutine(routine.id)
    router.push(ROUTINES_PATH, 'back', 'pop')
  }

  function rename(name: string) {
    edit((current) => ({ ...current, name }))
  }

  function removeEditing(id: string) {
    setEditingId(null)
    edit((current) => removeItem(current, id))
  }

  return (
    <>
      <IonList inset>
        <IonItem>
          <IonInput
            label={COMMON_COPY.routineName}
            labelPlacement="stacked"
            placeholder={COMMON_COPY.routineName}
            value={routine.name}
            onIonChange={(event) => typeof event.detail.value === 'string' && rename(event.detail.value)}
          />
        </IonItem>
      </IonList>
      {routine.sections.map((section) => (
        <SectionEditor
          key={section.id}
          section={section}
          onChange={(change) => edit((current) => updateSection(current, section.id, change))}
          onEditItem={setEditingId}
          onAddItem={() => setAddingTo(section.id)}
          onDelete={() =>
            confirmDelete({
              header: ROUTINES_COPY.deleteSectionQuestion,
              message: section.name,
              onConfirm: () => edit((current) => removeSection(current, section.id)),
            })
          }
        />
      ))}
      <IonList inset>
        <IonItem button detail={false} onClick={addSection}>
          <IonIcon slot="start" color="primary" icon={addCircle} />
          <IonLabel color="primary">{ROUTINES_COPY.addSection}</IonLabel>
        </IonItem>
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
      <ItemEditModal
        editing={editing}
        onChange={(id, change) => edit((current) => updateItem(current, id, change))}
        onDelete={removeEditing}
        onClose={() => setEditingId(null)}
      />
      <ExercisePicker
        isOpen={addingTo !== null}
        onPick={pick}
        onClose={() => setAddingTo(null)}
      />
    </>
  )
}

function RoutineEditView({ id }: { id: string }) {
  const routine = useRoutine(id)

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={ROUTINES_PATH} text={COMMON_COPY.back} />
          </IonButtons>
          <IonTitle>{routine ? routine.name : ROUTINES_COPY.editRoutine}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>{routine && <RoutineEditor routine={routine} />}</IonContent>
    </>
  )
}

export function RoutineEditPage() {
  const { id } = useParams()

  return <IonPage>{id && <RoutineEditView id={id} />}</IonPage>
}
