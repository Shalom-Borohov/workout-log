import {
  IonContent,
  IonHeader,
  IonList,
  IonPage,
  IonSearchbar,
  IonTitle,
  IonToolbar,
  type SearchbarInputEventDetail,
} from '@ionic/react'
import { useMemo, useState } from 'react'
import { EmptyState } from '../../components/EmptyState'
import { useFinishedWorkouts, useRoutines } from '../../data/hooks'
import { exerciseNames, latestSessions } from '../../domain/progress'
import { ExerciseRow } from './ExerciseRow'
import './exercises.css'

export function ExercisesPage() {
  const routines = useRoutines()
  const workouts = useFinishedWorkouts()
  const [query, setQuery] = useState('')
  const needle = query.trim().toLowerCase()
  const allNames = useMemo(() => (routines && workouts ? exerciseNames(routines, workouts) : []), [routines, workouts])
  const latest = useMemo(() => workouts && latestSessions(workouts), [workouts])
  const names = allNames.filter((n) => n.toLowerCase().includes(needle))

  function handleInput({ value }: SearchbarInputEventDetail) {
    if (typeof value === 'string') {
      setQuery(value)
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>תרגילים</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">תרגילים</IonTitle>
          </IonToolbar>
          <IonToolbar>
            <IonSearchbar placeholder="חיפוש" value={query} onIonInput={(e) => handleInput(e.detail)} />
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
          <EmptyState
            title="עוד אין תרגילים"
            body="תרגילים יופיעו כאן אחרי שתוסיפו אימון בלשונית אימונים או תסיימו אימון."
          />
        )}
        {allNames.length > 0 && names.length === 0 && (
          <EmptyState title={`אין תוצאות עבור ״${query.trim()}״`} body="בדקו את האיות או נסו חיפוש אחר." />
        )}
      </IonContent>
    </IonPage>
  )
}
