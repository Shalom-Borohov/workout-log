import {
  IonContent,
  IonHeader,
  IonLabel,
  IonList,
  IonListHeader,
  IonPage,
  IonSearchbar,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import { useMemo } from 'react'
import { EmptyState } from '../../components/EmptyState'
import { BODY_AREA_COPY } from '../../copy/bodyAreas'
import { COMMON_COPY } from '../../copy/common'
import { EXERCISES_COPY } from './copy'
import { useExerciseAreas, useFinishedWorkouts, useRoutines } from '../../data/hooks'
import { areaKey, groupByArea } from '../../domain/bodyAreas'
import { exerciseNames, latestSessions } from '../../domain/progress'
import { useSearch } from '../../hooks/useSearch'
import { ExerciseRow } from './ExerciseRow'
import './exercises.css'

export function ExercisesPage() {
  const routines = useRoutines()
  const workouts = useFinishedWorkouts()
  const search = useSearch()
  const allNames = useMemo(() => (routines && workouts ? exerciseNames(routines, workouts) : []), [routines, workouts])
  const latest = useMemo(() => workouts && latestSessions(workouts), [workouts])
  const areas = useExerciseAreas()
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
        {latest &&
          areas &&
          groupByArea(names, areas).map((group) => (
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
          ))}
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
