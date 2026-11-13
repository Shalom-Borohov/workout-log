import { IonIcon, IonItem, IonLabel, IonList } from '@ionic/react'
import { createOutline } from 'ionicons/icons'
import type { WorkoutItem } from '../../domain/types'
import { notedExercises } from './notes'

export function ExerciseNotes({ item, onNote }: { item: WorkoutItem; onNote: () => void }) {
  const pair = item.exercises.length > 1
  const noted = notedExercises(item)

  return (
    noted.length > 0 && (
      <IonList className="list-plates item-notes">
        {noted.map((exercise) => (
          <IonItem key={exercise.name} button detail onClick={onNote}>
            <IonIcon slot="start" icon={createOutline} aria-hidden="true" />
            <IonLabel className="item-note ion-text-wrap">{pair ? `${exercise.name}: ${exercise.note}` : exercise.note}</IonLabel>
          </IonItem>
        ))}
      </IonList>
    )
  )
}

export function Tips({ item }: { item: WorkoutItem }) {
  const pair = item.exercises.length > 1

  return item.exercises.map(
    (exercise, exerciseIndex) =>
      exercise.tip !== '' && (
        <p key={exerciseIndex} className="item-tip">
          {pair ? `${exercise.name}: ${exercise.tip}` : exercise.tip}
        </p>
      ),
  )
}
