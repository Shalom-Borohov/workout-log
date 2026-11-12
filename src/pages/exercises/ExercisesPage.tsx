import { IonContent, IonHeader, IonList, IonPage, IonSearchbar, IonTitle, IonToolbar } from '@ionic/react'
import { useMemo, useState } from 'react'
import { EmptyState } from '../../components/EmptyState'
import { COMMON_COPY } from '../../copy/common'
import { EXERCISES_COPY } from './copy'
import { useExerciseAreas, useFinishedWorkouts, useRoutines } from '../../data/hooks'
import { areaKey, groupByArea } from '../../domain/bodyAreas'
import { exerciseNames, latestSessions } from '../../domain/progress'
import { useSearch } from '../../hooks/useSearch'
import { AreaTiles } from './AreaTiles'
import { ExerciseRow } from './ExerciseRow'
import { SearchResults } from './SearchResults'
import './exerciseList.css'

export function ExercisesPage() {
  const routines = useRoutines()
  const workouts = useFinishedWorkouts()
  const areas = useExerciseAreas()
  const search = useSearch()
  const [chosenArea, setChosenArea] = useState<string>()
  const allNames = useMemo(() => (routines && workouts ? exerciseNames(routines, workouts) : []), [routines, workouts])
  const latest = useMemo(() => workouts && latestSessions(workouts), [workouts])
  const groups = useMemo(() => (areas ? groupByArea(allNames, areas) : []), [allNames, areas])
  const selected = groups.find((group) => areaKey(group.area) === chosenArea) ?? groups.at(0)
  const isSearching = search.query.trim() !== ''
  const names = allNames.filter(search.matches)

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{COMMON_COPY.exercises}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">{COMMON_COPY.exercises}</IonTitle>
          </IonToolbar>
          <IonToolbar>
            <IonSearchbar
              placeholder={COMMON_COPY.search}
              value={search.query}
              onIonInput={(event) => search.onInput(event.detail)}
            />
          </IonToolbar>
        </IonHeader>
        {latest && selected && !isSearching && (
          <>
            <AreaTiles groups={groups} selected={selected} onSelect={(group) => setChosenArea(areaKey(group.area))} />
            <IonList inset>
              {selected.names.map((name) => (
                <ExerciseRow key={name} name={name} last={latest.get(name)} />
              ))}
            </IonList>
          </>
        )}
        {latest && areas && isSearching && <SearchResults groups={groupByArea(names, areas)} latest={latest} />}
        {routines && latest && allNames.length === 0 && (
          <EmptyState title={EXERCISES_COPY.emptyTitle} body={EXERCISES_COPY.emptyBody} />
        )}
        {allNames.length > 0 && names.length === 0 && (
          <EmptyState title={EXERCISES_COPY.noResultsTitle(search.query.trim())} body={EXERCISES_COPY.noResultsBody} />
        )}
      </IonContent>
    </IonPage>
  )
}
