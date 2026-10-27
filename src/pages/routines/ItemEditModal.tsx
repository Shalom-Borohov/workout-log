import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonTitle,
  IonToggle,
  IonToolbar,
} from '@ionic/react'
import type { RoutineExercise, RoutineItem } from '../../domain/types'
import { ExerciseFields } from './ExerciseFields'
import { type Change, setPair } from '../../domain/routineEdit'

interface Props {
  item: RoutineItem | undefined
  onChange: (id: string, change: Change<RoutineItem>) => void
  onDelete: (id: string) => void
  onClose: () => void
}

function ItemForm({ item, onChange, onDelete }: Omit<Props, 'item' | 'onClose'> & { item: RoutineItem }) {
  function changeExercise(index: number, change: Change<RoutineExercise>) {
    onChange(item.id, (it) => ({ ...it, exercises: it.exercises.map((e, i) => (i === index ? change(e) : e)) }))
  }

  return (
    <>
      {item.exercises.map((exercise, i) => (
        <ExerciseFields key={i} exercise={exercise} onChange={(change) => changeExercise(i, change)} />
      ))}
      <IonList inset>
        <IonItem>
          <IonToggle
            checked={item.exercises.length > 1}
            onIonChange={(e) => onChange(item.id, (it) => setPair(it, e.detail.checked))}
          >
            זוג
          </IonToggle>
        </IonItem>
      </IonList>
      <IonList inset>
        <IonItem button detail={false} onClick={() => onDelete(item.id)}>
          <IonLabel color="danger">מחיקת התרגיל</IonLabel>
        </IonItem>
      </IonList>
    </>
  )
}

export function ItemEditModal({ item, onChange, onDelete, onClose }: Props) {
  return (
    <IonModal isOpen={item !== undefined} onDidDismiss={onClose} initialBreakpoint={1} breakpoints={[0, 1]}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>עריכת תרגיל</IonTitle>
          <IonButtons slot="end">
            <IonButton strong onClick={onClose}>
              סגירה
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>{item && <ItemForm item={item} onChange={onChange} onDelete={onDelete} />}</IonContent>
    </IonModal>
  )
}
