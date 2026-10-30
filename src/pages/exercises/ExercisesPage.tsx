import {
  IonContent,
  IonHeader,
  IonList,
  IonPage,
  IonSearchbar,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import { useMemo } from 'react'
import { EmptyState } from '../../components/EmptyState'
import { COMMON_COPY } from '../../copy/common'
import { EXERCISES_COPY } from './copy'
import { useFinishedWorkouts, useRoutines } from '../../data/hooks'
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
        {latest && names.length > 0 && (
          <IonList inset>
            {names.map((name) => (
              <ExerciseRow key={name} name={name} last={latest.get(name)} />
            ))}
          </IonList>
        )}
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
