import { IonContent, IonHeader, IonPage, IonSearchbar, IonTitle, IonToolbar } from '@ionic/react'
import { COMMON_COPY } from '../../copy/common'
import { useExerciseAreas, useFinishedRecords, useRoutines } from '../../data/hooks'
import { useSearch } from '../../hooks/useSearch'
import { ExerciseBrowser } from './ExerciseBrowser'
import './exerciseList.css'

export function ExercisesPage() {
  const records = useFinishedRecords()
  const routines = useRoutines()
  const areas = useExerciseAreas()
  const search = useSearch()

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
        {records && routines && areas && (
          <ExerciseBrowser records={records} routines={routines} areas={areas} query={search.query} matches={search.matches} />
        )}
      </IonContent>
    </IonPage>
  )
}
