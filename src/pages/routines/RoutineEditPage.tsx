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
import { useRoutine } from '../../data/hooks'
import { deleteRoutine, updateRoutine } from '../../data/repo'
import {
  type Change,
  findItem,
  newExercise,
  newSection,
  removeItem,
  removeSection,
  updateItem,
  updateSection,
} from '../../domain/routineEdit'
import type { Routine } from '../../domain/types'
import { useConfirmDelete } from '../../hooks/useConfirmDelete'
import { ItemEditModal } from './ItemEditModal'
import { SectionEditor } from './SectionEditor'
import './routines.css'

function RoutineEditor({ routine }: { routine: Routine }) {
  const router = useIonRouter()
  const confirmDelete = useConfirmDelete()
  const [editingId, setEditingId] = useState<string | null>(null)
  const editing = editingId === null ? undefined : findItem(routine, editingId)

  const edit = (change: Change<Routine>) => void updateRoutine(routine.id, change)

  function addItem(sectionId: string) {
    const id = crypto.randomUUID()

    edit((r) => updateSection(r, sectionId, (s) => ({ ...s, items: [...s.items, { id, exercises: [newExercise()] }] })))
    setEditingId(id)
  }

  function addSection() {
    const section = newSection(crypto.randomUUID(), 'חלק חדש')

    edit((r) => ({ ...r, sections: [...r.sections, section] }))
  }

  async function removeRoutine() {
    await deleteRoutine(routine.id)
    router.push('/tabs/routines', 'back', 'pop')
  }

  function rename(name: string) {
    edit((r) => ({ ...r, name }))
  }

  function removeEditing(id: string) {
    setEditingId(null)
    edit((r) => removeItem(r, id))
  }

  return (
    <>
      <IonList inset>
        <IonItem>
          <IonInput
            label="שם האימון"
            labelPlacement="stacked"
            placeholder="שם האימון"
            value={routine.name}
            onIonChange={(e) => typeof e.detail.value === 'string' && rename(e.detail.value)}
          />
        </IonItem>
      </IonList>
      {routine.sections.map((section) => (
        <SectionEditor
          key={section.id}
          section={section}
          onChange={(change) => edit((r) => updateSection(r, section.id, change))}
          onEditItem={setEditingId}
          onAddItem={() => addItem(section.id)}
          onDelete={() =>
            confirmDelete({
              header: 'למחוק את החלק?',
              message: section.name,
              onConfirm: () => edit((r) => removeSection(r, section.id)),
            })
          }
        />
      ))}
      <IonList inset>
        <IonItem button detail={false} onClick={addSection}>
          <IonIcon slot="start" color="primary" icon={addCircle} />
          <IonLabel color="primary">הוספת חלק</IonLabel>
        </IonItem>
      </IonList>
      <IonList inset>
        <IonItem
          button
          detail={false}
          onClick={() =>
            confirmDelete({ header: 'למחוק את האימון?', message: routine.name, onConfirm: () => void removeRoutine() })
          }
        >
          <IonLabel color="danger">מחיקת האימון</IonLabel>
        </IonItem>
      </IonList>
      <ItemEditModal
        item={editing}
        onChange={(id, change) => edit((r) => updateItem(r, id, change))}
        onDelete={removeEditing}
        onClose={() => setEditingId(null)}
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
            <IonBackButton defaultHref="/tabs/routines" text="חזרה" />
          </IonButtons>
          <IonTitle>{routine ? routine.name : 'עריכת אימון'}</IonTitle>
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
