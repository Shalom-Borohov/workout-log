import { IonItem, IonLabel, IonNote } from '@ionic/react'
import { formatDay, formatSets } from '../../domain/format'
import { bestSet, type ExerciseSession } from '../../domain/progress'

export function ExerciseRow({ name, last }: { name: string; last?: ExerciseSession }) {
  const best = last && bestSet(last.sets)

  return (
    <IonItem button detail routerLink={`/tabs/exercises/${encodeURIComponent(name)}`}>
      <IonLabel className="ion-text-wrap">
        <h2>{name}</h2>
        {last && <p>{formatDay(last.startedAt)}</p>}
      </IonLabel>
      {last && best && (
        <IonNote slot="end" className="exercise-best">
          {formatSets([best], last.target)}
        </IonNote>
      )}
    </IonItem>
  )
}
