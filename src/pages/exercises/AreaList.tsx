import { IonList } from '@ionic/react'
import { BODY_AREA_COPY } from '../../copy/bodyAreas'
import { COMMON_COPY } from '../../copy/common'
import type { LatestActivity } from '../../domain/activities'
import { areaKey, type AreaGroup } from '../../domain/bodyAreas'
import { countLabel } from '../../domain/format'
import type { ExerciseSession } from '../../domain/progress'
import { ActivityList } from './ActivityList'
import { EXERCISES_COPY } from './copy'
import { ExerciseRow } from './ExerciseRow'
import { ACTIVITIES_TILE, type TileKey } from './tileKeys'

interface Props {
  selected: TileKey
  groups: AreaGroup[]
  latest: ReadonlyMap<string, ExerciseSession>
  activities: LatestActivity[]
}

function AreaHeading({ title, count }: { title: string; count: string }) {
  return (
    <div className="area-list-heading">
      <h2>{title}</h2>
      <span>{count}</span>
    </div>
  )
}

export function AreaList({ selected, groups, latest, activities }: Props) {
  if (selected === ACTIVITIES_TILE) {
    return (
      <section className="area-list">
        <AreaHeading
          title={EXERCISES_COPY.activities}
          count={countLabel(activities.length, EXERCISES_COPY.oneActivity, EXERCISES_COPY.activities)}
        />
        <ActivityList entries={activities} withIcons={false} />
      </section>
    )
  }

  const group = groups.find((candidate) => areaKey(candidate.area) === selected)

  if (!group) {
    return null
  }

  return (
    <section className="area-list">
      <AreaHeading
        title={BODY_AREA_COPY.name(group.area)}
        count={countLabel(group.names.length, EXERCISES_COPY.oneExercise, COMMON_COPY.exercises)}
      />
      <IonList inset>
        {group.names.map((name) => (
          <ExerciseRow key={name} name={name} last={latest.get(name)} />
        ))}
      </IonList>
    </section>
  )
}
