import { IonLabel, IonList, IonListHeader } from '@ionic/react'
import { BODY_AREA_COPY } from '../../copy/bodyAreas'
import { areaKey, type AreaGroup } from '../../domain/bodyAreas'
import type { ExerciseSession } from '../../domain/progress'
import { ExerciseRow } from './ExerciseRow'

interface Props {
  groups: AreaGroup[]
  latest: ReadonlyMap<string, ExerciseSession>
}

export function SearchResults({ groups, latest }: Props) {
  return groups.map((group) => (
    <section key={areaKey(group.area)}>
      <IonListHeader>
        <IonLabel>{BODY_AREA_COPY.name(group.area)}</IonLabel>
      </IonListHeader>
      <IonList inset>
        {group.names.map((name) => (
          <ExerciseRow key={name} name={name} area={group.area} last={latest.get(name)} />
        ))}
      </IonList>
    </section>
  ))
}
