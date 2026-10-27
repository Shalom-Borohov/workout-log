import { IonPage } from '@ionic/react'
import { useParams } from 'react-router-dom'
import { WorkoutDetail } from './WorkoutDetail'

export function WorkoutDetailPage() {
  const { id } = useParams()

  return <IonPage>{id && <WorkoutDetail id={id} />}</IonPage>
}
