import { IonPage } from '@ionic/react'
import { useParams } from 'react-router-dom'
import { ExerciseHistory } from './ExerciseHistory'

export function ExerciseHistoryPage() {
  const { name } = useParams()

  return <IonPage>{name && <ExerciseHistory name={decodeURIComponent(name)} />}</IonPage>
}
