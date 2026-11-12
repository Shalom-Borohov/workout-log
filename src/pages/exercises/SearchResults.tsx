import { IonLabel, IonList, IonListHeader } from '@ionic/react'
import type { ReactNode } from 'react'
import { BODY_AREA_COPY } from '../../copy/bodyAreas'
import type { LatestActivity } from '../../domain/activities'
import { areaKey, type AreaGroup } from '../../domain/bodyAreas'
import type { ExerciseSession } from '../../domain/progress'
import { ActivityList } from './ActivityList'
import { EXERCISES_COPY } from './copy'
import { ExerciseRow } from './ExerciseRow'

function SearchGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <IonListHeader>
        <IonLabel>{title}</IonLabel>
      </IonListHeader>
      {children}
    </section>
  )
}

interface Props {
  groups: AreaGroup[]
  latest: ReadonlyMap<string, ExerciseSession>
  activities: LatestActivity[]
}

export function SearchResults({ groups, latest, activities }: Props) {
  return (
    <>
      {groups.map((group) => (
        <SearchGroup key={areaKey(group.area)} title={BODY_AREA_COPY.name(group.area)}>
          <IonList inset>
            {group.names.map((name) => (
              <ExerciseRow key={name} name={name} area={group.area} last={latest.get(name)} />
            ))}
          </IonList>
        </SearchGroup>
      ))}
      {activities.length > 0 && (
        <SearchGroup title={EXERCISES_COPY.activities}>
          <ActivityList entries={activities} withIcons />
        </SearchGroup>
      )}
    </>
  )
}
