import { IonItem, IonLabel, IonNote } from '@ionic/react'
import { BodyAreaIcon } from '../../components/bodyArea/BodyAreaIcon'
import type { BodyArea } from '../../domain/bodyAreas'
import { formatDay, formatSets } from '../../domain/format'
import { bestSet, type ExerciseSession } from '../../domain/progress'
import { exerciseHistoryPath } from '../../navigation/paths'

interface Props {
  name: string
  area?: BodyArea | null
  last?: ExerciseSession
}

export function ExerciseRow({ name, area, last }: Props) {
  const best = last && bestSet(last.sets)

  return (
    <IonItem button detail={false} className="exercise-row" routerLink={exerciseHistoryPath(name)}>
      {area !== undefined && <BodyAreaIcon slot="start" area={area} />}
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
