import { IonIcon, IonItem, IonLabel, IonList } from '@ionic/react'
import { createOutline } from 'ionicons/icons'
import { LIVE_COPY } from './copy'
import type { WorkoutItem } from '../../domain/types'

export function ExerciseNotes({ item, onNote }: { item: WorkoutItem; onNote: () => void }) {
  const pair = item.exercises.length > 1
  const noted = item.exercises.filter((exercise) => exercise.note !== '')

  return (
    <IonList inset>
      {noted.length === 0 ? (
        <IonItem button detail onClick={onNote}>
          <IonIcon slot="start" color="primary" icon={createOutline} aria-hidden="true" />
          <IonLabel className="item-note" color="primary">
            {LIVE_COPY.addNote}
          </IonLabel>
        </IonItem>
      ) : (
        noted.map((exercise) => (
          <IonItem key={exercise.name} button detail onClick={onNote}>
            <IonIcon slot="start" color="medium" icon={createOutline} aria-hidden="true" />
            <IonLabel className="item-note ion-text-wrap">{pair ? `${exercise.name}: ${exercise.note}` : exercise.note}</IonLabel>
          </IonItem>
        ))
      )}
    </IonList>
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
