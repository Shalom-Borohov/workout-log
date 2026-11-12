import { IonList } from '@ionic/react'
import { useMemo, useState } from 'react'
import { EmptyState } from '../../components/EmptyState'
import { isRoutineWorkout, latestActivities } from '../../domain/activities'
import { areaKey, groupByArea, type BodyArea } from '../../domain/bodyAreas'
import { exerciseNames, latestSessions } from '../../domain/progress'
import type { Routine, WorkoutRecord } from '../../domain/types'
import { ActivityList } from './ActivityList'
import { AreaTiles } from './AreaTiles'
import { EXERCISES_COPY } from './copy'
import { ExerciseRow } from './ExerciseRow'
import { SearchResults } from './SearchResults'
import { ACTIVITIES_TILE, type TileKey } from './tileKeys'

interface Props {
  records: WorkoutRecord[]
  routines: Routine[]
  areas: ReadonlyMap<string, BodyArea>
  query: string
  matches: (name: string) => boolean
}

export function ExerciseBrowser({ records, routines, areas, query, matches }: Props) {
  const [chosen, setChosen] = useState<TileKey>()
  const workouts = useMemo(() => records.filter(isRoutineWorkout), [records])
  const latest = useMemo(() => latestSessions(workouts), [workouts])
  const activities = useMemo(() => latestActivities(records), [records])
  const allNames = useMemo(() => exerciseNames(routines, workouts), [routines, workouts])
  const groups = useMemo(() => groupByArea(allNames, areas), [allNames, areas])

  const keys: TileKey[] = [
    ...groups.map((group) => areaKey(group.area)),
    ...(activities.length > 0 ? [ACTIVITIES_TILE] : []),
  ]

  const selected = chosen && keys.includes(chosen) ? chosen : keys.at(0)
  const trimmed = query.trim()

  if (keys.length === 0) {
    return <EmptyState title={EXERCISES_COPY.emptyTitle} body={EXERCISES_COPY.emptyBody} />
  }

  if (trimmed === '') {
    return (
      <>
        <AreaTiles groups={groups} activityCount={activities.length} selected={selected} onSelect={setChosen} />
        {selected === ACTIVITIES_TILE ? (
          <ActivityList entries={activities} withIcons={false} />
        ) : (
          <IonList inset>
            {groups
              .find((group) => areaKey(group.area) === selected)
              ?.names.map((name) => <ExerciseRow key={name} name={name} last={latest.get(name)} />)}
          </IonList>
        )}
      </>
    )
  }

  const names = allNames.filter(matches)
  const found = activities.filter((entry) => matches(entry.name))

  if (names.length === 0 && found.length === 0) {
    return <EmptyState title={EXERCISES_COPY.noResultsTitle(trimmed)} body={EXERCISES_COPY.noResultsBody} />
  }

  return <SearchResults groups={groupByArea(names, areas)} latest={latest} activities={found} />
}
